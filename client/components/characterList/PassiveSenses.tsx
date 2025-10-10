import React, { useState, useEffect } from "react";
import DynamicFrame from "@/components/ui/DynamicFrame";
import { Settings, X } from "lucide-react";
import { getVisionData, type VisionData } from "@/utils/getVisionData";
import { CharacterDraft } from "@/store/character";

type Props = {
    stats: Record<string, number> | undefined;
    draft?: CharacterDraft;
};

const mod = (v: number) => Math.floor((v - 10) / 2);

type VisionType = "Ночное зрение" | "Слепое зрение" | "Чувство вибраций" | "Истинное зрение";

interface Vision {
    name: VisionType;
    distance: number;
    source: string;
}

const tooltips: Record<string, string> = {
    Восприятие: "Используется для замечания скрытых объектов и угроз.",
    Проницательность: "Определяет способность понимать мотивы и эмоции других.",
    Расследование: "Помогает находить скрытые улики и детали.",
    "Ночное зрение": "Позволяет видеть в темноте на ограничённое расстояние.",
    "Слепое зрение": "Позволяет ощущать окружающий мир без использования зрения.",
    "Чувство вибраций": "Позволяет ощущать перемещения через вибрации земли или воздуха.",
    "Истинное зрение": "Позволяет видеть истинный облик существ и предметов.",
};

export default function PassiveSenses({ stats, draft }: Props) {
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

    // Получаем данные о зрении из draft
    const raceVisionData = draft ? getVisionData(draft) : {
        "Ночное зрение": { distance: 0, source: "" },
        "Слепое зрение": { distance: 0, source: "" },
        "Чувство вибраций": { distance: 0, source: "" },
        "Истинное зрение": { distance: 0, source: "" },
    };

    const [visions, setVisions] = useState<Record<VisionType, Vision>>({
        "Ночное зрение": {
            name: "Ночное зрение",
            distance: raceVisionData["Ночное зрение"].distance,
            source: raceVisionData["Ночное зрение"].source,
        },
        "Слепое зрение": {
            name: "Слепое зрение",
            distance: raceVisionData["Слепое зрение"].distance,
            source: raceVisionData["Слепое зрение"].source,
        },
        "Чувство вибраций": {
            name: "Чувство вибраций",
            distance: raceVisionData["Чувство вибраций"].distance,
            source: raceVisionData["Чувство вибраций"].source,
        },
        "Истинное зрение": {
            name: "Истинное зрение",
            distance: raceVisionData["Истинное зрение"].distance,
            source: raceVisionData["Истинное зрение"].source,
        },
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

    // Обновляем данные о зрении при изменении draft
    useEffect(() => {
        if (draft) {
            const newVisionData = getVisionData(draft);
            setVisions(prevVisions => {
                const updatedVisions = { ...prevVisions };
                Object.keys(newVisionData).forEach(visionType => {
                    const visionKey = visionType as VisionType;
                    const newData = newVisionData[visionKey as keyof VisionData];
                    // Обновляем только если данные из расы лучше (больше расстояние)
                    if (newData.distance > updatedVisions[visionKey].distance) {
                        updatedVisions[visionKey] = {
                            name: visionKey,
                            distance: newData.distance,
                            source: newData.source,
                        };
                    }
                });
                return updatedVisions;
            });
        }
    }, [draft]);

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
        <DynamicFrame
            frameType="st"
            size="custom"
            className="relative p-4 text-gray-300 w-[300px] h-[216px]"
        >
            {/* Фон под рамкой */}
            <div 
                className="absolute inset-[2px] -z-50 opacity-50"
                style={{
                    backgroundImage: `url('/frames/STFrameBg.svg')`,
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            />
            
            <div className="relative z-10 space-y-2 h-[160px] overflow-visible">
                {/* Чувства */}
                <div className="relative w-full h-[35px] flex items-center px-2">
                    <DynamicFrame
                        frameType="senses"
                        size="custom"
                        className="w-full h-full pointer-events-none"
                        style={{ width: "100%", height: "35px" }}
                    />
                    <span className="absolute left-3 top-0 h-full flex items-center justify-center font-bold text-sm z-10 w-8">{perception}</span>
                    <span className="absolute left-16 top-1/2 transform -translate-y-1/2 uppercase text-xs font-semibold z-10">ВОСПРИЯТИЕ</span>
                </div>

                <div className="relative w-full h-[35px] flex items-center px-2">
                    <DynamicFrame
                        frameType="senses"
                        size="custom"
                        className="w-full h-full pointer-events-none"
                        style={{ width: "100%", height: "35px" }}
                    />
                    <span className="absolute left-3 top-0 h-full flex items-center justify-center font-bold text-sm z-10 w-8">{insight}</span>
                    <span className="absolute left-16 top-1/2 transform -translate-y-1/2 uppercase text-xs font-semibold z-10">ПРОНИЦАТЕЛЬНОСТЬ</span>
                </div>

                <div className="relative w-full h-[35px] flex items-center px-2">
                    <DynamicFrame
                        frameType="senses"
                        size="custom"
                        className="w-full h-full pointer-events-none"
                        style={{ width: "100%", height: "35px" }}
                    />
                    <span className="absolute left-3 top-0 h-full flex items-center justify-center font-bold text-sm z-10 w-8">{investigation}</span>
                    <span className="absolute left-16 top-1/2 transform -translate-y-1/2 uppercase text-xs font-semibold z-10">РАССЛЕДОВАНИЕ</span>
                </div>

                {/* Зрения по центру */}
                <div className="max-h-[80px] overflow-y-auto">
                    {Object.values(visions)
                        .filter((v) => v.distance > 0)
                        .map((v) => (
                            <div key={v.name} className="text-center text-xs font-medium mt-1">
                                {v.name}: {v.distance} фт.
                            </div>
                        ))}
                </div>

            </div>

            {/* Заголовок + шестерёнка - позиционирован относительно основного блока */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-2 text-gray-400 uppercase text-sm font-semibold z-10">
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
                                        spellCheck={false}
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
                                        spellCheck={false}
                                        className="flex-1 bg-neutral-800 border border-neutral-600 rounded px-2"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </DynamicFrame>
    );
}
