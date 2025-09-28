import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ChoiceRenderer from "@/components/ui/ChoiceRenderer";
import { ChevronDown, ChevronUp } from "lucide-react"; // или свои иконки
import { useCharacter } from "@/store/character";
export interface FeatureBlockProps {
    name: string;
    desc: string;
    featureLevel: number; // уровень, на котором появилась фича
    source: "class" | "subclass" | "race" | "subrace";
    idx: number;
    choices?: any[];
    textMaxHeight?: number; // высота для текста до "Показать больше"
}

export default function FeatureBlock({
    name,
    desc,
    featureLevel,
    source,
    idx,
    choices,
    textMaxHeight = 80,
}: FeatureBlockProps) {
    const { draft } = useCharacter();
    const [expanded, setExpanded] = useState(false);
    const [textExpanded, setTextExpanded] = useState(false);
    const [needsToggle, setNeedsToggle] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    // Проверяем, превышает ли текст maxHeight
    useEffect(() => {
        if (contentRef.current) {
            setNeedsToggle(contentRef.current.scrollHeight > textMaxHeight);
        }
    }, [desc, textMaxHeight]);
    if (draft.basics.level < featureLevel) return null;

    // Проверяем, есть ли незавершённые выборы
    const sourcesToCheck = source === "class" ? ["class", "subclass"] : [source];
    const hasUnfinishedChoice = choices?.some((choice) => {
        return sourcesToCheck.some((src) => {
            if (choice.type === "subclass") {
                return !draft.basics.subclass;
            }
            const sourceArray =
                draft.chosen[
                choice.type === "spell"
                    ? "spells"
                    : choice.type === "ability"
                        ? "abilities"
                        : choice.type === "tool"
                            ? "tools"
                            : choice.type === "language"
                                ? "languages"
                                : choice.type === "feat"
                                    ? "feats"
                                    : ""
                ]?.[src] || [];

            for (let i = 0; i < (choice.count || 1); i++) {
                if (!sourceArray[i]) return true;
            }
            return false;
        });
    }) ?? false;

    // Считаем количество сделанных выборов для блока
    let choiceCountDisplay = "";
    if (choices && choices.length > 0) {
        const counts = choices.map(choice => {
            if (choice.type === "subclass") {
                // если это подкласс
                return draft.basics.subclass ? 1 : 0;
            }
            const sourceArray = draft.chosen[choice.type + 's']?.[source] || [];
            return Math.min(sourceArray.length, choice.count ?? 1);
        });

        const total = choices.reduce((sum, c) => sum + (c.count ?? 1), 0);
        const selected = counts.reduce((sum, c) => sum + c, 0);
        choiceCountDisplay = `${selected}/${total}`;
    }


    return (
        <div className={`relative border rounded overflow-hidden
                        ${hasUnfinishedChoice ? "border-blue-400" : "border-stone-200"}`}>
            {/* Восклицательный знак для незавершённых выборов */}
            {hasUnfinishedChoice && (
                <div className="absolute -top-2 -left-2 z-20">
                    <div className="bg-blue-400 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs shadow-md">
                        
                    </div>
                </div>
            )}
            {/* Шапка блока — всегда одинаковая */}
            <div
                className={`
          flex justify-between items-center p-2 cursor-pointer transition-colors duration-200
          ${expanded ? "bg-primary/10 border-b border-primary" : "bg-muted/20 hover:bg-primary/5"}
        `}
                onClick={() => setExpanded(!expanded)}
            >
                {/* Название и уровень фичи */}
                <div className="flex flex-col">
                    <span className="font-medium">{name}</span>
                    <span className="text-xs text-muted-foreground mt-1">
                        {featureLevel} уровень
                        {choiceCountDisplay && ` • Выбор: ${choiceCountDisplay}`}
                    </span>
                </div>

                {/* Стрелка по центру блока шапки */}
                <div className="flex items-center justify-center">
                    {expanded ? (
                        <ChevronUp className="w-6 h-6 text-primary" />
                    ) : (
                        <ChevronDown className="w-6 h-6 text-primary" />
                    )}
                </div>
            </div>



            {/* Содержимое блока — раскрытие только для описания и choices */}
            {expanded && (
                <div className="p-2 text-xs text-muted-foreground [&>p]:mb-4 whitespace-pre-line">
                    <div
                        ref={contentRef}
                        style={{
                            maxHeight: textExpanded ? "none" : `${textMaxHeight}px`,
                            overflow: "hidden",
                        }}
                    >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {desc.replace(/\\n/g, "\n")}
                        </ReactMarkdown>
                    </div>

                    {/* Кнопка "Показать больше/Свернуть" для длинного текста */}
                    {needsToggle && (
                        <button
                            className="text-primary text-xs mt-1 underline"
                            onClick={(e) => {
                                e.stopPropagation(); // чтобы клик по кнопке не закрывал весь блок
                                setTextExpanded(!textExpanded);
                            }}
                        >
                            {textExpanded ? "Свернуть" : "Показать больше"}
                        </button>
                    )}

                    {/* Choices */}
                    {choices && choices.length > 0 && (
                        <div className="mt-2">
                            {choices.map((choice, ci) => (
                                <ChoiceRenderer
                                    key={`${source}-feature-${featureLevel}-${idx}-${ci}`}
                                    ci={ci}
                                    source={source}
                                    choices={[choice]}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
