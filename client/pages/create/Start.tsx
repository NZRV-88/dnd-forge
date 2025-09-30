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
        createNewCharacter,
        saveToSupabase,
        resetCharacter,
        isLoading,
    } = useCharacter();
    const [localHpMode, setLocalHpMode] = useState<"fixed" | "roll">(draft.basics.hpMode || "fixed");

    // если id есть в url — грузим персонажа только если он не загружен
    useEffect(() => {
        if (id) {
            // режим редактирования - загружаем только если ID не совпадает с текущим
            if (draft.id !== id) {
                loadFromSupabase(id);
            }
        } else {
            // режим создания - сбрасываем только если есть данные от предыдущего персонажа
            if (draft.id) {
                resetCharacter();
            }
        }
    }, [id, draft.id, loadFromSupabase, resetCharacter]);

    // синхронизируем локальные поля, если basics обновились (например, после загрузки из базы)
    useEffect(() => {
        setLocalHpMode(draft.basics.hpMode || "fixed");
    }, [draft.basics.hpMode]);

    const handleNext = async () => {
        // Принудительно сохраняем все изменения перед переходом
        if (characterHeaderRef.current) {
            characterHeaderRef.current.forceSave();
        }

        setDraft(d => ({
            ...d,
            basics: {
                ...d.basics,
                hpMode: localHpMode,
            },
        }));

        if (id) {
            // Режим редактирования - просто переходим
            nav(`/create/${id}/class`);
        } else {
            // Режим создания - создаем персонажа в БД и переходим
            const newId = uuidv4();
            await createNewCharacter(newId);
            nav(`/create/${newId}/class`);
        }
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
