import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import { useCharacter } from "@/store/character";
import StepArrows from "@/components/ui/StepArrows";
import ExitButton from "@/components/ui/ExitButton";

export default function Start() {
    const { id } = useParams<{ id: string }>();
    const nav = useNavigate();

    const {
        draft,
        setDraft,
        loadFromSupabase,
        resetCharacter,
    } = useCharacter();
    const name = draft?.basics?.name ?? "";
    const [localName, setLocalName] = useState(draft?.basics?.name ?? "");
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
    }, [id]);

    // синхронизируем локальные поля, если basics обновились (например, после загрузки из базы)
    useEffect(() => {
        setLocalName(draft.basics.name || "");
        setLocalHpMode(draft.basics.hpMode || "fixed");
    }, [draft.basics.name, draft.basics.hpMode]);

    const handleNext = () => {
        setDraft(d => ({
            ...d,
            basics: {
                ...d.basics,
                name: localName,
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
        if (localName.trim()) {
            setDraft(d => ({
                ...d,
                basics: {
                    ...d.basics,
                    name: localName,
                    hpMode: localHpMode,
                },
            }));
        }
        nav("/characters");
    };
    const newId = uuidv4();

    return (
        <div className="container mx-auto py-10">
            <div className="mx-auto max-w-5xl relative">
                <StepArrows
                    onNext={handleNext}
                />
                <ExitButton onClick={handleExit} />

                <h1 className="text-2xl font-bold mb-6 text-center">Создание персонажа</h1>

                <div className="mb-6">
                    <label className="block mb-2 font-medium">Имя персонажа</label>
                    <input
                        className="w-full rounded-md border bg-background px-3 py-2 outline-none focus:border-primary"
                        value={localName}
                        onChange={(e) => setLocalName(e.target.value)}
                        placeholder="Введите имя"
                    />
                </div>

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
