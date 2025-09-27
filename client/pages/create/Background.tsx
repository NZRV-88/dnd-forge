import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCharacter } from "@/store/character";
import StepArrows from "@/components/ui/StepArrows";
import { useParams } from "react-router-dom";
import * as Icons from "@/components/refs/icons";
import { getProficiencyName } from "@/data/proficiencies";
import { ABILITIES } from "@/data/abilities"; 

import { 
  BACKGROUND_CATALOG, 
  BACKGROUND_LABELS, 
  getBackgroundByKey 
} from "@/data/backgrounds";
import type { BackgroundInfo } from "@/data/backgrounds/types";
import ExitButton from "@/components/ui/ExitButton";
export default function BackgroundPick() {
    const { id } = useParams<{ id: string }>();
    const nav = useNavigate();
    const { draft, setBackground } = useCharacter();

    const [abilityPicks, setAbilityPicks] = useState<(string | "")[]>([]);
    const background = getBackgroundByKey(draft.basics.background);

    // Сортируем предыстории по алфавиту
    const sortedBackgrounds = [...BACKGROUND_CATALOG].sort((a, b) =>
        a.name.localeCompare(b.name, "ru"),
    );

    function onPickBackground(key: string) {
        setBackground(key);
        //setAbilityPicks([]); // сброс бонусов при смене
    }

    //function saveBackgroundChoices() {
    //    if (!background?.abilityBonuses) return;

    //    const bonus: Record<string, number> = {};
    //    abilityPicks.forEach((ability) => {
    //        if (ability) {
    //            bonus[ability] = (bonus[ability] || 0) + 1;
    //        }
    //    });

    //    // сохраняем бонусы характеристик прямо в basics
    //    setBackground(draft.basics.background);
    //}

    const allAbilitiesPicked = background?.abilityBonuses
        ? abilityPicks.filter((pick) => pick !== "").length ===
        background.abilityBonuses.count
        : true;

    return (
        <div className="container mx-auto py-10">
            <div className="mx-auto max-w-5xl relative">
                <StepArrows back={`/create/${id}/class`} next={`/create/${id}/race`} />
                <ExitButton />

                <div className="mb-6 flex items-baseline justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Выбор предыстории</h1>
                        <p className="text-sm text-muted-foreground">
                            Текущий выбор:{" "}
                            {draft.basics.background
                                ? BACKGROUND_LABELS[draft.basics.background] ||
                                draft.basics.background
                                : "не выбрана"}
                        </p>
                    </div>
                </div>

                {/* Карточки предысторий */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {sortedBackgrounds.map((bg) => {
                        const isSelected = draft.basics.background === bg.key;
                        return (
                            <button
                                key={bg.key}
                                onClick={() => onPickBackground(bg.key)}
                                className={`relative text-left rounded-lg border p-3 flex flex-col justify-between transition hover:shadow-md ${isSelected
                                        ? "border-2 border-primary shadow-lg bg-gradient-to-b from-primary/5 to-transparent"
                                        : ""
                                    }`}
                            >
                                {isSelected && (
                                    <div className="absolute right-2 top-2 text-primary">
                                        <Icons.Crown className="w-5 h-5" />
                                    </div>
                                )}
                                <h3 className="font-medium">{bg.name}</h3>
                                <p className="mt-2 text-sm text-muted-foreground">{bg.desc}</p>
                            </button>
                        );
                    })}
                </div>

                {/* Подробная инфа */}
                {background && (
                    <div className="mt-6 rounded-xl border bg-card p-6">
                        <h2 className="text-xl font-semibold mb-2">{background.name}</h2>
                        <p className="mb-3 text-sm text-muted-foreground">
                            {background.longDesc || background.desc}
                        </p>

                        {/* Владения навыками */}
                        {background.proficiencies?.some((p) => p.type === "skill") && (
                            <div className="mb-4">
                                <div className="text-sm font-medium">Владение навыками</div>
                                <ul className="mt-2 list-disc pl-5 text-sm">
                                    {background.proficiencies
                                        .filter((p) => p.type === "skill")
                                        .map((p) => (
                                            <li key={p.key}>
                                                {getProficiencyName(p)}
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        )}
                        {/* Инструменты */}
                        {background.proficiencies?.some((p) => p.type === "tool") && (
                            <div className="mb-4">
                                <div className="text-sm font-medium">Владение инструментами</div>
                                <ul className="mt-2 list-disc pl-5 text-sm">
                                    {background.proficiencies
                                        .filter((p) => p.type === "tool")
                                        .map((p) => (
                                            <li key={p.key}>
                                                {getProficiencyName(p)}
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        )}

                        {/* Языки */}
                        {background.languages?.length > 0 && (
                            <div className="mb-4">
                                <div className="text-sm font-medium">Языки</div>
                                <ul className="mt-2 list-disc pl-5 text-sm">
                                    {background.languages.map((lang) => (
                                        <li key={lang}>{lang}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Особенность */}
                        <div className="mb-4">
                            <div className="text-sm font-medium">
                                Особенность: {background.feature.name}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {background.feature.desc}
                            </p>
                        </div>

                        {/* Снаряжение */}
                        <div className="mb-4">
                            <div className="text-sm font-medium">Снаряжение</div>
                            <ul className="mt-2 list-disc pl-5 text-sm">
                                {background.equipment.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Бонусы характеристик */}
                        {background.abilityBonuses && (
                            <div className="mb-4 p-4 bg-secondary/20 rounded-lg">
                                <div className="text-sm font-medium">Бонусы характеристик</div>
                                <p className="text-xs text-muted-foreground mb-3">
                                    Выберите {background.abilityBonuses.count} характеристики для
                                    увеличения на {background.abilityBonuses.amount}
                                </p>

                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    {Array.from({ length: background.abilityBonuses.count }).map(
                                        (_, i) => (
                                            <select
                                                key={i}
                                                className="rounded-md border bg-background px-2 py-1"
                                                value={abilityPicks[i] || ""}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setAbilityPicks((prev) => {
                                                        const newPicks = [...prev];
                                                        newPicks[i] = value;
                                                        return newPicks;
                                                    });
                                                }}
                                            >
                                                <option value="">— Выберите —</option>
                                                {ABILITIES.map((a) => (
                                                    <option key={a.key} value={a.key}>
                                                        {a.label}
                                                    </option>
                                                ))}
                                            </select>
                                        ),
                                    )}
                                </div>

                                {/*<Button*/}
                                {/*    onClick={saveBackgroundChoices}*/}
                                {/*    disabled={!allAbilitiesPicked}*/}
                                {/*    size="sm"*/}
                                {/*>*/}
                                {/*    Сохранить выбор*/}
                                {/*</Button>*/}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}