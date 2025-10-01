import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import { useCharacter } from "@/store/character";
import StepArrows from "@/components/ui/StepArrows";
import ExitButton from "@/components/ui/ExitButton";
import CharacterHeader, { CharacterHeaderRef } from "@/components/ui/CharacterHeader";

export default function Start() {
    const { id } = useParams<{ id: string }>();
    const nav = useNavigate();
    const characterHeaderRef = useRef<CharacterHeaderRef>(null);

    const {
        draft,
        setDraft,
        loadFromSupabase,
        saveToSupabase,
        resetCharacter,
        initNewCharacter,
        isLoading,
    } = useCharacter();
    const [localHpMode, setLocalHpMode] = useState<"fixed" | "roll">(draft.basics.hpMode || "fixed");

    // Загружаем персонажа при редактировании
    useEffect(() => {
        console.log('Start: useEffect triggered, id:', id, 'draft.id:', draft.id);
        if (id && draft.id !== id) {
            console.log('Start: Loading character from Supabase, id:', id);
            loadFromSupabase(id);
        }
    }, [id, draft.id, loadFromSupabase]);

    // синхронизируем локальные поля, если basics обновились (например, после загрузки из базы)
    useEffect(() => {
        setLocalHpMode(draft.basics.hpMode || "fixed");
    }, [draft.basics.hpMode]);

    const handleNext = async () => {
        console.log('Start: handleNext called, current draft.basics.name:', draft.basics.name);
        
        // Принудительно сохраняем все изменения перед переходом
        if (characterHeaderRef.current) {
            characterHeaderRef.current.forceSave();
        }

        // Получаем актуальные данные из CharacterHeader
        const currentData = characterHeaderRef.current?.getCurrentData();
        console.log('Start: currentData from CharacterHeader:', currentData);
        
        // Принудительно обновляем draft с актуальными данными
        setDraft(d => {
            console.log('Start: setDraft called, current draft.basics.name:', d.basics.name, 'new name:', currentData?.name);
            return {
                ...d,
                basics: {
                    ...d.basics,
                    name: currentData?.name || d.basics.name,
                    hpMode: localHpMode,
                },
                avatar: currentData?.avatar || d.avatar,
            };
        });

        // Ждем обновления draft перед созданием персонажа
        await new Promise(resolve => setTimeout(resolve, 100));

        // Просто переходим к следующему шагу
        console.log('Start: Navigating to class page');
        nav(`/create/${id}/class`);
    };

    const handleExit = async () => {
        setDraft(d => ({
            ...d,
            basics: {
                ...d.basics,
                hpMode: localHpMode,
            },
        }));

        // Принудительно сохраняем все изменения перед выходом
        if (characterHeaderRef.current) {
            characterHeaderRef.current.forceSave();
        }

        // Сохраняем изменения в БД перед выходом
        if (draft.id) {
            try {
                await saveToSupabase();
            } catch (error) {
                console.error("Ошибка сохранения при выходе:", error);
            }
        }

        nav("/characters");
    };

    // Показываем загрузку, если данные загружаются
    if (isLoading) {
        return (
            <div className="container mx-auto py-10">
                <div className="mx-auto max-w-5xl relative">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Загрузка персонажа...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <div className="mx-auto max-w-5xl relative">
                <StepArrows
                    onNext={handleNext}
                />
                <ExitButton onClick={handleExit} />

                {/* Шапка с именем и аватаркой */}
                <CharacterHeader ref={characterHeaderRef} />

                <h1 className="text-2xl font-bold mb-6 text-center">Создание персонажа</h1>

                <div className="mb-6">
                    <label className="block mb-2 font-medium">Рост хит-поинтов</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                checked={localHpMode === "fixed"}
                                onChange={() => setLocalHpMode("fixed")}
                            />
                            Фиксированный (усреднённый)
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                checked={localHpMode === "roll"}
                                onChange={() => setLocalHpMode("roll")}
                            />
                            Бросок кубика
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
