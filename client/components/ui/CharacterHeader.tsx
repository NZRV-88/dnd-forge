import { useState, useEffect, useCallback, useRef, useImperativeHandle, forwardRef } from "react";
import { useCharacter } from "@/store/character";
import AvatarManager from "./AvatarManager";
import NameGenerator from "./NameGenerator";

interface CharacterHeaderProps {
    onForceSave?: () => void;
}

export interface CharacterHeaderRef {
    forceSave: () => void;
}

const CharacterHeader = forwardRef<CharacterHeaderRef, CharacterHeaderProps>(({ onForceSave }, ref) => {
    const { draft, setDraft, saveToSupabase } = useCharacter();
    const [isAvatarManagerOpen, setIsAvatarManagerOpen] = useState(false);
    const [localName, setLocalName] = useState(draft?.basics?.name || "");
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Синхронизируем локальное имя с draft только при первой загрузке
    useEffect(() => {
        if (draft?.basics?.name && !localName) {
            setLocalName(draft.basics.name);
        }
    }, [draft?.basics?.name, localName]);

    // Debounced функция для сохранения
    const debouncedSave = useCallback(() => {
        if (draft.id) {
            // Очищаем предыдущий timeout
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            
            // Устанавливаем новый timeout
            saveTimeoutRef.current = setTimeout(() => {
                saveToSupabase().catch(console.error);
                saveTimeoutRef.current = null;
            }, 500);
        }
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
        setDraft(d => ({
            ...d,
            basics: {
                ...d.basics,
                name: newName,
            },
        }));

        // Debounced сохранение в БД
        debouncedSave();
    };

    // Функция для принудительного сохранения
    const forceSave = useCallback(() => {
        if (draft.id) {
            // Очищаем debounced timeout
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
                saveTimeoutRef.current = null;
            }
            // Сохраняем немедленно
            saveToSupabase().catch(console.error);
        }
        // Вызываем внешний callback если есть
        onForceSave?.();
    }, [draft.id, saveToSupabase, onForceSave]);

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

    // Экспортируем forceSave через ref
    useImperativeHandle(ref, () => ({
        forceSave
    }), [forceSave]);

    return (
        <>
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20 mb-6">
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
                            <label className="block text-sm font-medium text-muted-foreground mb-1">
                                Имя персонажа
                            </label>
                            <input
                                type="text"
                                value={localName}
                                onChange={handleNameChange}
                                placeholder="Введите имя персонажа"
                                spellCheck={false}
                                className="w-full text-2xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/50 focus:ring-0"
                            />
                            <NameGenerator 
                                onNameGenerated={handleNameChange}
                                className="mt-2"
                            />
                        </div>
                    </div>
                </div>
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
