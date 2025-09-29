import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCharacter } from "@/store/character";
import { getAllCharacterData } from "@/utils/getAllCharacterData";
import { Abilities, ABILITIES } from "@/data/abilities";
import StepArrows from "@/components/ui/StepArrows";
import ExitButton from "@/components/ui/ExitButton";
import CharacterHeader from "@/components/ui/CharacterHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";


const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];
const POINT_BUY_LIMIT = 27;


export type RollResult = {
    dice: number[];
    total?: number;
    assigned?: string;
};

function rollStat(): RollResult {
    const dice = Array.from({ length: 4 }, () => 1 + Math.floor(Math.random() * 6));
    const sorted = [...dice].sort((a, b) => b - a);
    const total = sorted[0] + sorted[1] + sorted[2];
    return { dice, total };
}

function pointBuyCost(score: number) {
    if (score <= 13) return score - 8;
    if (score === 14) return 7;
    if (score === 15) return 9;
    return 0;
}

export default function AbilitiesPick() {
    const { id } = useParams<{ id: string }>();
    const nav = useNavigate();
    const { draft, setDraft } = useCharacter();
    const draftRolls = draft.rolls || [];
    const setDraftRolls = (newRolls: RollResult[]) => {
        setDraft(d => ({ ...d, rolls: newRolls }));
    };

    const stats = draft.stats;
    const mode = draft.abilitiesMode;
    const setMode = (newMode: "array" | "roll" | "point-buy") => {
        setDraft(d => {
            let newStats: Abilities;

            if (newMode === "point-buy") {
                // Для point-buy все характеристики начинаются с 8
                newStats = Object.keys(d.stats).reduce((acc, key) => {
                    acc[key as keyof Abilities] = 8;
                    return acc;
                }, {} as Abilities);
            } else {
                // Для остальных режимов — пустые
                newStats = Object.keys(d.stats).reduce((acc, key) => {
                    acc[key as keyof Abilities] = undefined as any;
                    return acc;
                }, {} as Abilities);
            }

            return {
                ...d,
                abilitiesMode: newMode,
                stats: newStats,
                rolls: d.rolls, // броски сохраняем
            };
        });
    };
    const rolls: RollResult[] = draft.rolls?.length
        ? draft.rolls
        : Array.from({ length: 6 }, () => ({ dice: [], total: undefined, assigned: undefined } as RollResult));

    const setRolls = (
        newRolls: RollResult[] | ((prev: RollResult[]) => RollResult[])
    ) => {
        if (typeof newRolls === "function") {
            setDraft((d) => {
                const base = d.rolls?.length
                    ? d.rolls
                    : Array.from({ length: 6 }, () => ({ dice: [] }));
                const computed = newRolls(base);
                return { ...d, rolls: computed };
            });
        } else {
            setDraft((d) => ({ ...d, rolls: newRolls }));
        }
    };

    const { abilityBonuses } = getAllCharacterData(draft);

    const setStat = (ability: keyof Abilities, value: number | undefined) => {
        setDraft((d) => ({
            ...d,
            stats: { ...d.stats, [ability]: value },
        }));
    };

    // === Point Buy ===
    const totalCost = ABILITIES.reduce((sum, { key }) => {
        const val = stats[key] ?? 8;
        return sum + pointBuyCost(val);
    }, 0);
    const remaining = POINT_BUY_LIMIT - totalCost;

    const handlePointBuyChange = (key: keyof Abilities, value: number) => {
        if (value < 8 || value > 15) return;
        const newCost = totalCost - pointBuyCost(stats[key] ?? 8) + pointBuyCost(value);
        if (newCost <= POINT_BUY_LIMIT) {
            setStat(key, value);
        }
    };

    // === Array mode ===
    const usedValues = Object.values(stats).filter(
        (v): v is number => v !== undefined
    );
    const freeValues = (current?: number) =>
        STANDARD_ARRAY.filter((v) => !usedValues.includes(v) || v === current);

    // === Roll mode ===
    const rollStatAt = (index: number) => {
        setRolls((prev) => {
            const next = [...prev];
            next[index] = rollStat();
            return next;
        });
    };
    const resetRolls = () =>
        setRolls(Array.from({ length: 6 }, () => ({ dice: [], total: undefined, assigned: undefined } as RollResult)));

    const assignRoll = (index: number, ability: string) => {
        setRolls((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], assigned: ability || undefined };
            return next;
        });
    };

    const applyRolls = () => {
        setDraft((d) => {
            const newStats: Abilities = { ...d.stats }; // гарантируем полный объект
            rolls.forEach((roll) => {
                if (roll.assigned && roll.total) {
                    newStats[roll.assigned as keyof Abilities] = roll.total;
                }
            });
            return { ...d, stats: newStats };
        });
    };
    const anyRolled = rolls.some(r => r.total !== undefined);
    const anyAssigned = rolls.some(r => r.assigned);

    const allAssigned = ABILITIES.every((a) => stats[a.key] !== undefined);

    const handleNext = () => {
        if (!allAssigned) return;
        nav(`/create/${id}/equipment`);
    };

    return (
        <div className="container mx-auto py-10">
            <div className="mx-auto max-w-5xl relative">
                <StepArrows back={`/create/${id}/race`} next={`/create/${id}/equipment`} />
                <ExitButton />

                {/* Шапка с именем и аватаркой */}
                <CharacterHeader />
                {/*<div className="max-w-4xl mx-auto px-4 space-y-6">*/}
                <div className="mb-6 flex items-baseline justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold"> Распределение характеристик</h1>
                    </div>
                </div>
                {/* Заголовок */}


                {/* Режимы */}
                <div className="flex gap-2">
                    <Button
                        variant={mode === "array" ? "default" : "outline"}
                        onClick={() => setMode("array")}
                    >
                        Стандартный набор
                    </Button>
                    <Button
                        variant={mode === "roll" ? "default" : "outline"}
                        onClick={() => setMode("roll")}
                    >
                        Бросок кубиков
                    </Button>
                    <Button
                        variant={mode === "point-buy" ? "default" : "outline"}
                        onClick={() => setMode("point-buy")}
                    >
                        Point Buy
                    </Button>
                </div>

                {/* Характеристики */}
                <div className="grid grid-cols-6 gap-2 mt-3">
                    {ABILITIES.map(({ key, label, keyRu, icon: Icon }) => {
                        const selected = stats[key] ?? null;
                        const total = (stats[key] ?? 0) + (abilityBonuses[key] ?? 0);

                        return (
                            <div key={key} className="flex flex-col items-center">
                                <Card className="shadow-sm w-full">
                                    <CardHeader className="flex flex-row items-center justify-center pb-1 gap-1">
                                        <Icon className="w-4 h-4 text-stone-500 shrink-0" /> {label}
                                    </CardHeader>
                                    <CardContent className="flex justify-center">
                                        {mode === "array" && (
                                            <select
                                                className="w-full border p-1 text-sm"
                                                value={selected ?? ""}
                                                onChange={(e) =>
                                                    setStat(
                                                        key,
                                                        e.target.value ? Number(e.target.value) : undefined
                                                    )
                                                }
                                            >
                                                <option value="">—</option>
                                                {freeValues(selected).map((val) => (
                                                    <option key={val} value={val}>
                                                        {val}
                                                    </option>
                                                ))}
                                            </select>
                                        )}

                                        {mode === "roll" && (
                                            <CardContent className="flex justify-center text-sm p-[1px]">
                                                <input
                                                    type="number"
                                                    max={18}
                                                    className="w-16 text-center border"
                                                    value={selected ?? ""}
                                                    onChange={(e) => {
                                                        const val = e.target.value ? Number(e.target.value) : undefined;
                                                        setStat(key, val);
                                                    }}
                                                />
                                            </CardContent>
                                        )}

                                        {mode === "point-buy" && (
                                            <input
                                                type="number"
                                                min={8}
                                                max={15}
                                                className="border p-[1px] text-sm"
                                                value={selected ?? 8}
                                                onChange={(e) =>
                                                    handlePointBuyChange(
                                                        key,
                                                        Number(e.target.value) || 8
                                                    )
                                                }
                                            />
                                        )}
                                    </CardContent>
                                </Card>
                                <p className="text-xs text-stone-600 mt-1">
                                    ИТОГ: <span className="font-semibold">{total}</span>
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Point Buy очки */}
                {mode === "point-buy" && (
                    <div className="flex flex-col items-center mt-6">
                        <p className="text-base font-medium text-stone-700">
                            ОЧКОВ ОСТАЛОСЬ:
                        </p>
                        <span
                            className={`text-2xl font-bold ${remaining < 0 ? "text-red-600" : "text-stone-800"
                                }`}
                        >
                            {remaining} / {POINT_BUY_LIMIT}
                        </span>
                    </div>
                )}

                {/* Roll mode */}
                {mode === "roll" && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-6 gap-4">
                            {rolls.map((roll, idx) => (
                                <div key={idx} className="p-3 rounded-md flex flex-col items-center justify-end gap-2 h-[130px]">


                                    {/* Итог (фиксированное место) */}
                                    <div className="font-bold text-lg">
                                        {roll.total ?? "--"}
                                    </div>
                                    {/* Кубики (появляются только после броска) */}
                                    <div className="flex flex-wrap justify-center gap-[3px]">
                                        {roll.total &&
                                            roll.dice.map((d, i) => {
                                                const min = Math.min(...roll.dice);
                                                const dropped =
                                                    d === min && roll.dice.indexOf(d) === i;
                                                return (
                                                    <span
                                                        key={i}
                                                        className={`w-6 h-6 flex justify-center rounded border text-sm
              ${dropped
                                                                ? "bg-stone-200 text-stone-500"
                                                                : "bg-blue-100 text-blue-800"
                                                            }`}
                                                    >
                                                        {d}
                                                    </span>
                                                );
                                            })}
                                    </div>

                                    {/* Управление */}
                                    {!roll.total ? (
                                        <Button
                                            size="sm"
                                            onClick={() => rollStatAt(idx)}
                                            className="w-full uppercase"
                                        >
                                            БРОСИТЬ
                                        </Button>
                                    ) : (
                                        <select
                                            className="w-full rounded-md border p-1 text-sm"
                                            value={roll.assigned ?? ""}
                                            onChange={(e) => assignRoll(idx, e.target.value)}
                                        >
                                            <option value="">—</option>
                                            {ABILITIES.filter(
                                                (a) => !rolls.some(r => r.assigned === a.key) || roll.assigned === a.key
                                            ).map((a) => (
                                                <option key={a.key} value={a.key}>
                                                    {a.label}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button
                                variant="default"
                                size="xs"
                                onClick={applyRolls}
                                disabled={!anyAssigned}
                                className={`uppercase text-[10px] ${!anyAssigned
                                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                    : "bg-green-700/80 text-white hover:bg-green-700"
                                    }`}
                            >
                                ПРИМЕНИТЬ
                            </Button>

                            <Button
                                size="xs"
                                onClick={resetRolls}
                                disabled={!anyRolled}
                                className={`uppercase text-[10px] ${!anyRolled
                                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                    : "bg-red-500/80 text-white hover:bg-red-700"
                                    }`}
                            >
                                СБРОСИТЬ
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}