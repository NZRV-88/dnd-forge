import { useState, useEffect, useCallback, useRef, useImperativeHandle, forwardRef } from "react";
import { useCharacter } from "@/store/character";
import { useNavigate } from "react-router-dom";
import AvatarManager from "./AvatarManager";
import NameGenerator from "./NameGenerator";
import { SimpleTooltip } from "@/components/ui/SimpleTooltip";
import { AlertCircle } from "lucide-react";
import { checkCharacterCompleteness } from "@/utils/checkCharacterCompleteness";

interface CharacterHeaderProps {
    onForceSave?: () => void;
}

export interface CharacterHeaderRef {
    forceSave: () => void;
    getCurrentData: () => { name: string; avatar: string | null };
}

const CharacterHeader = forwardRef<CharacterHeaderRef, CharacterHeaderProps>(({ onForceSave }, ref) => {
    const { draft, setDraft, saveToSupabase } = useCharacter();
    const navigate = useNavigate();
    const [isAvatarManagerOpen, setIsAvatarManagerOpen] = useState(false);
    const [localName, setLocalName] = useState(draft?.basics?.name || "");
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Проверяем завершенность выборов на каждой странице
    const incompletePages = checkCharacterCompleteness(draft);

    // Синхронизируем локальное имя с draft только при первой загрузке
    useEffect(() => {
        if (draft?.basics?.name && !localName) {
            setLocalName(draft.basics.name);
        }
    }, [draft?.basics?.name, localName]);

    // Debounced функция для сохранения
    const debouncedSave = useCallback(() => {
        // Очищаем предыдущий timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        
        // Устанавливаем новый timeout
        saveTimeoutRef.current = setTimeout(() => {
            // Сохраняем в БД только если есть ID (персонаж уже создан)
            if (draft.id) {
                saveToSupabase().catch(console.error);
            }
            // Если нет ID, данные сохранятся в localStorage автоматически через useEffect
            saveTimeoutRef.current = null;
        }, 500);
    }, [draft.id, saveToSupabase]);

    // Очищаем timeout при размонтировании компонента
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement> | string) => {
        const newName = typeof e === 'string' ? e : e.target.value;
        setLocalName(newName);
        
        // Обновляем в store
        setDraft(d => {
            return {
                ...d,
                basics: {
                    ...d.basics,
                    name: newName,
                },
            };
        });

        // Debounced сохранение в БД
        debouncedSave();
    };

    // Функция для принудительного сохранения
    const forceSave = useCallback(() => {
        // Очищаем debounced timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = null;
        }
        
        // Сохраняем в БД только если есть ID (персонаж уже создан)
        if (draft.id) {
            saveToSupabase().catch(console.error);
        }
        
        // Вызываем внешний callback если есть
        onForceSave?.();
    }, [draft.id, saveToSupabase, onForceSave, localName]);

    const handleAvatarSelect = (avatarUrl: string | null) => {
        setDraft(d => ({
            ...d,
            avatar: avatarUrl,
        }));

        // Принудительно сохраняем аватар сразу
        forceSave();
    };

    const handleAvatarClick = () => {
        setIsAvatarManagerOpen(true);
    };

    // Экспортируем методы через ref
    useImperativeHandle(ref, () => ({
        forceSave,
        getCurrentData: () => {
            return {
                name: localName,
                avatar: draft?.avatar || null
            };
        }
    }), [forceSave, localName, draft?.avatar]);

    return (
        <>
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20 mb-6 relative">
                <div className="container mx-auto py-4">
                    <div className="flex items-center gap-4">
                        {/* Портрет */}
                        <div 
                            className="flex-shrink-0 cursor-pointer group"
                            onClick={handleAvatarClick}
                        >
                            {draft?.avatar ? (
                                <img
                                    src={draft.avatar}
                                    alt="Портрет персонажа"
                                    className="w-24 h-24 rounded-lg object-cover border-2 border-primary/30 group-hover:border-primary/60 transition-colors"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-lg bg-muted border-2 border-dashed border-muted-foreground flex items-center justify-center group-hover:border-primary/60 transition-colors">
                                    <span className="text-muted-foreground text-xs">Портрет</span>
                                </div>
                            )}
                        </div>

                        {/* Поле имени */}
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                                Имя персонажа
                            </label>
                            <input
                                type="text"
                                value={localName}
                                onChange={handleNameChange}
                                placeholder="Введите имя персонажа"
                                spellCheck={false}
                                className="w-full text-2xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/50 focus:ring-0 mb-2"
                            />
                            <NameGenerator 
                                onNameGenerated={handleNameChange}
                                className=""
                            />
                        </div>
                    </div>
                </div>
                
                {/* Индикатор незавершенных выборов в нижнем правом углу шапки */}
                {incompletePages.length > 0 && (
                    <div className="absolute bottom-4 right-4 z-10">
                        <SimpleTooltip content={`Незавершенные выборы: ${incompletePages.map(p => p.label).join(', ')}`}>
                            <div className="relative cursor-pointer">
                                <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <div className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">
                                    {incompletePages.length}
                                </div>
                            </div>
                        </SimpleTooltip>
                    </div>
                )}
            </div>

            {/* Модальное окно управления портретами */}
            <AvatarManager
                isOpen={isAvatarManagerOpen}
                onClose={() => setIsAvatarManagerOpen(false)}
                currentAvatar={draft?.avatar}
                onAvatarSelect={handleAvatarSelect}
            />
        </>
    );
});

CharacterHeader.displayName = 'CharacterHeader';

export default CharacterHeader;
