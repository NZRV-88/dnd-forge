import React, { useState, useEffect } from "react";
import STFrame from "@src/assets/frames/STFrame.svg?react";
import PSModeFrame from "@src/assets/frames/PSModeFrame.svg?react";
import { Settings, X } from "lucide-react";

type Props = {
    stats: Record<string, number> | undefined;
    race?: string;
};

const mod = (v: number) => Math.floor((v - 10) / 2);

type VisionType = "Ночное зрение" | "Слепое зрение" | "Чувство вибраций" | "Истинное зрение";

interface Vision {
    name: VisionType;
    distance: number;
    source: string;
}

const raceDarkvision: Record<string, number> = {
    Человек: 0,
    Эльф: 60,
    Дроу: 120,
    Дворф: 60,
    Полурослик: 0,
    Тифлинг: 60,
    Полуорк: 60,
};

const tooltips: Record<string, string> = {
    Восприятие: "Используется для замечания скрытых объектов и угроз.",
    Проницательность: "Определяет способность понимать мотивы и эмоции других.",
    Расследование: "Помогает находить скрытые улики и детали.",
    "Ночное зрение": "Позволяет видеть в темноте на ограничённое расстояние.",
    "Слепое зрение": "Позволяет ощущать окружающий мир без использования зрения.",
    "Чувство вибраций": "Позволяет ощущать перемещения через вибрации земли или воздуха.",
    "Истинное зрение": "Позволяет видеть истинный облик существ и предметов.",
};

export default function PassiveSenses({ stats, race = "Человек" }: Props) {
    const wis = stats?.wis ?? 0;
    const int = stats?.int ?? 0;

    const basePerception = 10 + mod(wis);
    const baseInsight = 10 + mod(wis);
    const baseInvestigation = 10 + mod(int);

    const [modifiers, setModifiers] = useState({
        perception: 0,
        insight: 0,
        investigation: 0,
    });
    const [sources, setSources] = useState({
        perception: "",
        insight: "",
        investigation: "",
    });

    const [visions, setVisions] = useState<Record<VisionType, Vision>>({
        "Ночное зрение": {
            name: "Ночное зрение",
            distance: raceDarkvision[race] ?? 0,
            source: race,
        },
        "Слепое зрение": { name: "Слепое зрение", distance: 0, source: "" },
        "Чувство вибраций": { name: "Чувство вибраций", distance: 0, source: "" },
        "Истинное зрение": { name: "Истинное зрение", distance: 0, source: "" },
    });

    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const savedModifiers = localStorage.getItem("passiveModifiers");
        const savedSources = localStorage.getItem("passiveSources");
        const savedVisions = localStorage.getItem("passiveVisionsFixed");
        if (savedModifiers) setModifiers(JSON.parse(savedModifiers));
        if (savedSources) setSources(JSON.parse(savedSources));
        if (savedVisions) setVisions(JSON.parse(savedVisions));
    }, []);

    useEffect(() => {
        localStorage.setItem("passiveModifiers", JSON.stringify(modifiers));
    }, [modifiers]);
    useEffect(() => {
        localStorage.setItem("passiveSources", JSON.stringify(sources));
    }, [sources]);
    useEffect(() => {
        localStorage.setItem("passiveVisionsFixed", JSON.stringify(visions));
    }, [visions]);

    const perception = basePerception + modifiers.perception;
    const insight = baseInsight + modifiers.insight;
    const investigation = baseInvestigation + modifiers.investigation;

    return (
        <div className="relative p-4 text-gray-300 w-[300px]">
            <STFrame className="absolute inset-0 w-full h-full pointer-events-none" />

            <div className="relative z-10 space-y-2">
                {/* Чувства */}
                <div className="relative w-full h-[40px] flex items-center">
                    <PSModeFrame className="absolute inset-0 w-full h-full pointer-events-none" />
                    <div className="relative w-[60px] flex items-center justify-center -ml-[7px]">
                        <span className="font-bold text-sm">{perception}</span>
                    </div>
                    <span className="uppercase text-sm font-semibold ml-3">ВОСПРИЯТИЕ</span>
                </div>

                <div className="relative w-full h-[40px] flex items-center">
                    <PSModeFrame className="absolute inset-0 w-full h-full pointer-events-none" />
                    <div className="relative w-[60px] flex items-center justify-center -ml-[7px]">
                        <span className="font-bold text-sm">{insight}</span>
                    </div>
                    <span className="uppercase text-sm font-semibold ml-3">ПРОНИЦАТЕЛЬНОСТЬ</span>
                </div>

                <div className="relative w-full h-[40px] flex items-center">
                    <PSModeFrame className="absolute inset-0 w-full h-full pointer-events-none" />
                    <div className="relative w-[60px] flex items-center justify-center -ml-[7px]">
                        <span className="font-bold text-sm">{investigation}</span>
                    </div>
                    <span className="uppercase text-sm font-semibold ml-3">РАССЛЕДОВАНИЕ</span>
                </div>

                {/* Зрения по центру */}
                {Object.values(visions)
                    .filter((v) => v.distance > 0)
                    .map((v) => (
                        <div key={v.name} className="text-center text-sm font-medium mt-2">
                            {v.name}: {v.distance} фт.
                        </div>
                    ))}
            </div>

            {/* Заголовок + шестерёнка */}
            <div className="flex items-center justify-center gap-2 text-gray-400 uppercase text-sm font-semibold mt-4">
                ЧУВСТВА
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
                            <h2 className="text-lg font-semibold text-white uppercase">ЧУВСТВА</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="hover:text-[#B59E54] transition"
                                title="Закрыть"
                            >
                                <X size={26} strokeWidth={3} />
                            </button>
                        </div>

                        {/* Чувства */}
                        <div className="space-y-3 mb-6">
                            {(["perception", "insight", "investigation"] as const).map((key) => (
                                <div key={key} className="flex items-center gap-3 text-sm font-medium">
                                    <span
                                        className="w-40 text-left text-gray-300 cursor-help"
                                        title={
                                            key === "perception"
                                                ? tooltips.Восприятие
                                                : key === "insight"
                                                    ? tooltips.Проницательность
                                                    : tooltips.Расследование
                                        }
                                    >
                                        {key === "perception"
                                            ? "Восприятие"
                                            : key === "insight"
                                                ? "Проницательность"
                                                : "Расследование"}
                                    </span>
                                    <input
                                        type="number"
                                        value={modifiers[key]}
                                        onChange={(e) =>
                                            setModifiers({
                                                ...modifiers,
                                                [key]: parseInt(e.target.value || "0"),
                                            })
                                        }
                                        className="w-20 bg-neutral-800 border border-neutral-600 rounded text-center"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Источник"
                                        value={sources[key]}
                                        onChange={(e) =>
                                            setSources({
                                                ...sources,
                                                [key]: e.target.value,
                                            })
                                        }
                                        className="flex-1 bg-neutral-800 border border-neutral-600 rounded px-2"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* ЗРЕНИЕ */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-white uppercase text-left mb-2">ЗРЕНИЕ</h3>
                            {/* Черта под зрением */}
                            <div className="border-t border-neutral-700 mt-4 pt-2" />
                            {Object.values(visions).map((v) => (
                                <div key={v.name} className="flex items-center gap-3 text-sm font-medium">
                                    <span className="w-40 text-left text-gray-300 cursor-help" title={tooltips[v.name]}>
                                        {v.name}
                                    </span>
                                    <input
                                        type="number"
                                        placeholder="фт."
                                        value={v.distance || ""}
                                        onChange={(e) =>
                                            setVisions({
                                                ...visions,
                                                [v.name]: {
                                                    ...v,
                                                    distance: parseInt(e.target.value || "0"),
                                                },
                                            })
                                        }
                                        className="w-20 bg-neutral-800 border border-neutral-600 rounded text-center"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Источник"
                                        value={v.source}
                                        onChange={(e) =>
                                            setVisions({
                                                ...visions,
                                                [v.name]: { ...v, source: e.target.value },
                                            })
                                        }
                                        className="flex-1 bg-neutral-800 border border-neutral-600 rounded px-2"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
