import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCharacter } from "@/store/character";
import { Button } from "@/components/ui/button";
import { X } from "@/components/refs/icons";
import ExitButton from "@/components/ui/ExitButton";
import StepArrows from "@/components/ui/StepArrows";

export default function Start() {
    const nav = useNavigate();
    const { basics, setName, setHpMode, save } = useCharacter();
    const [name, setLocalName] = useState(basics.name || "");
    const [hpMode, setLocalHpMode] = useState<"fixed" | "roll">(
        basics.hpMode || "fixed"
    );

    const handleNext = () => {
        setName(name);
        setHpMode(hpMode);
        nav("/create/class");
    };

    const exitToCharacters = () => {
        // сохраняем только если имя уже есть (т.е. персонаж создаётся)
        if (basics.name || name.trim()) {
            setName(name);
            setHpMode(hpMode);
            save();
        }
        nav("/characters");
    };

    return (
        <div className="container mx-auto py-10">
            <div className="mx-auto max-w-5xl relative">
                <StepArrows next="/create/class" />
                {/* крестик в правом верхнем углу */}
                <ExitButton />

                <h1 className="text-2xl font-bold mb-6 text-center">
                    Создание персонажа
                </h1>
                <div className="mb-6">
                    <label className="block mb-2 font-medium">Имя персонажа</label>
                    <input
                        className="w-full rounded-md border bg-background px-3 py-2 outline-none focus:border-primary"
                        value={name}
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
                                checked={hpMode === "fixed"}
                                onChange={() => setLocalHpMode("fixed")}
                            />
                            Фиксированный (усреднённый)
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                checked={hpMode === "roll"}
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
