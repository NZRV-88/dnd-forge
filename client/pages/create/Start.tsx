import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import { useCharacter } from "@/store/character";
import StepArrows from "@/components/ui/StepArrows";
import ExitButton from "@/components/ui/ExitButton";
import CharacterHeader from "@/components/ui/CharacterHeader";

export default function Start() {
    const { id } = useParams<{ id: string }>();
    const nav = useNavigate();

    const {
        draft,
        setDraft,
        loadFromSupabase,
        resetCharacter,
        isLoading,
    } = useCharacter();
    const [localHpMode, setLocalHpMode] = useState<"fixed" | "roll">(draft.basics.hpMode || "fixed");

    // если id есть в url — грузим персонажа
    useEffect(() => {
        if (id) {
            // режим редактирования
            loadFromSupabase(id);
        } else {
            // режим создания
            resetCharacter();
        }
    }, [id, loadFromSupabase, resetCharacter]);

    // синхронизируем локальные поля, если basics обновились (например, после загрузки из базы)
    useEffect(() => {
        setLocalHpMode(draft.basics.hpMode || "fixed");
    }, [draft.basics.hpMode]);

    const handleNext = () => {
        setDraft(d => ({
            ...d,
            basics: {
                ...d.basics,
                hpMode: localHpMode,
            },
        }));

        if (id) {
            nav(`/create/${id}/class`);
        } else {
            nav(`/create/${newId}/class`);
        }
    };

    const handleExit = () => {
        setDraft(d => ({
            ...d,
            basics: {
                ...d.basics,
                hpMode: localHpMode,
            },
        }));
        nav("/characters");
    };
    const newId = uuidv4();

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
                <CharacterHeader />

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
