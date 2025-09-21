import React, { useState, useEffect } from "react";
import STFrame from "@src/assets/frames/ProficiencyFrame.svg?react";
import { Settings, X } from "lucide-react";

type ProficienciesData = {
    armor: string[];
    weapons: string[];
    tools: string[];
    languages: string[];
};

export default function Proficiencies() {
    const [proficiencies, setProficiencies] = useState<ProficienciesData>({
        armor: [],
        weapons: [],
        tools: [],
        languages: [],
    });

    const [isOpen, setIsOpen] = useState(false);

    // Загружаем из localStorage
    useEffect(() => {
        const saved = localStorage.getItem("proficiencies");
        if (saved) setProficiencies(JSON.parse(saved));
    }, []);

    // Сохраняем изменения
    useEffect(() => {
        localStorage.setItem("proficiencies", JSON.stringify(proficiencies));
    }, [proficiencies]);

    const renderBlock = (title: string, items: string[]) => {
        if (!items || items.length === 0) return null;
        return (
            <div className="flex justify-between text-sm">
                <span className="text-gray-300 font-semibold">{title}</span>
                <span className="text-gray-200">{items.join(", ")}</span>
            </div>
        );
    };

    return (
        <div className="relative p-4 text-gray-300 w-[300px]">
            <STFrame className="absolute inset-0 w-full h-full pointer-events-none" />

            <div className="relative z-10 space-y-2">
                {renderBlock("Броня", proficiencies.armor)}
                {renderBlock("Оружие", proficiencies.weapons)}
                {renderBlock("Инструменты", proficiencies.tools)}
                {renderBlock("Языки", proficiencies.languages)}
            </div>

            {/* Заголовок + шестерёнка */}
            <div className="flex items-center justify-center gap-2 text-gray-400 uppercase text-sm font-semibold mt-4">
                ВЛАДЕНИЯ
                <button
                    onClick={() => setIsOpen(true)}
                    className="hover:text-yellow-400 focus:outline-none"
                >
                    <Settings size={18} />
                </button>
            </div>

            {/* Модалка */}
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div className="relative w-[520px] p-6 bg-neutral-900 border-2 border-[#B59E54] rounded-lg shadow-lg text-gray-200">
                        {/* Заголовок */}
                        <div className="flex justify-between items-center border-b border-neutral-700 pb-2 mb-4">
                            <h2 className="text-lg font-semibold text-white uppercase">ВЛАДЕНИЯ</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="hover:text-[#B59E54] transition"
                                title="Закрыть"
                            >
                                <X size={26} strokeWidth={3} />
                            </button>
                        </div>

                        {/* Редактирование */}
                        {(["armor", "weapons", "tools", "languages"] as const).map((key) => (
                            <div key={key} className="mb-4">
                                <label className="block text-sm font-semibold text-gray-300 mb-1">
                                    {key === "armor"
                                        ? "Броня"
                                        : key === "weapons"
                                            ? "Оружие"
                                            : key === "tools"
                                                ? "Инструменты"
                                                : "Языки"}
                                </label>
                                <textarea
                                    value={proficiencies[key].join(", ")}
                                    onChange={(e) =>
                                        setProficiencies({
                                            ...proficiencies,
                                            [key]: e.target.value
                                                .split(",")
                                                .map((s) => s.trim())
                                                .filter(Boolean),
                                        })
                                    }
                                    className="w-full bg-neutral-800 border border-neutral-600 rounded px-2 py-1 text-sm"
                                    rows={2}
                                    placeholder="Введите значения через запятую"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
