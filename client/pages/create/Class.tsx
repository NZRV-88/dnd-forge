import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCharacter } from "@/store/character";
import { CLASS_CATALOG, CLASS_LABELS } from "@/data/classes";
import type { ClassInfo } from "@/data/classes/types";
import ExitButton from "@/components/ui/ExitButton";
import StepArrows from "@/components/ui/StepArrows";
import * as Icons from "@/components/refs/icons";
import { Slider } from "@/components/ui/slider";
import FeatureBlock from "@/components/ui/FeatureBlock";

const ALL_CLASSES = [
    "fighter",
    "rogue",
    "wizard",
    "cleric",
    "ranger",
    "bard",
    "barbarian",
    "monk",
    "paladin",
    "warlock",
    "sorcerer",
    "druid",
];

function calcMaxHP(
    info: ClassInfo | undefined,
    level: number,
    conMod: number,
    hpMode: "fixed" | "roll",
) {
    if (!info || level < 1) return 0;
    const die = info.hitDice;
    let hp = die + conMod;
    if (hpMode === "fixed") {
        hp += (level - 1) * (Math.floor(die / 2) + 1 + conMod);
    } else {
        hp += (level - 1) * (1 + conMod);
    }
    return hp;
}

export default function ClassPick() {
    const { id } = useParams<{ id: string }>();
    const nav = useNavigate();
    const { draft, setBasics, setSubclass, setLevel } = useCharacter();

    const info = useMemo(
        () => CLASS_CATALOG.find((c) => c.key === draft.basics.class),
        [draft.basics.class],
    );
    const conScore = Number(draft.stats?.con) || 10;
    const conMod = Math.floor((conScore - 10) / 2);

    const hitDie = info?.hitDice ?? 8;
    const maxHP =
        hitDie +
        conMod +
        (draft.basics.level - 1) *
        (draft.basics.hpMode === "fixed"
            ? Math.floor(hitDie / 2) + 1 + conMod
            : 1 + conMod);
    const feats = useMemo(() => {
        if (!info) return [];

        const classFeats: { name: string; desc: string; choices?: any[]; featureLevel: number }[] = [];

        // Фичи класса
        Object.entries(info.features).forEach(([lvl, featsArr]) => {
            featsArr.forEach(f => classFeats.push({ ...f, featureLevel: Number(lvl) }));
        });

        // Фичи подклассов, если выбрана
        const subclass = info.subclasses.find(sc => sc.key === draft.basics.subclass);
        if (subclass) {
            Object.entries(subclass.features || {}).forEach(([lvl, featsArr]) => {
                featsArr.forEach(f => classFeats.push({ ...f, featureLevel: Number(lvl) }));
            });
        }

        // Можно отсортировать по уровню
        classFeats.sort((a, b) => a.featureLevel - b.featureLevel);

        return classFeats;
    }, [info, draft.basics.subclass]);


    return (
        <div className="container mx-auto py-10">
            <div className="mx-auto max-w-5xl relative overflow-visible">
                <StepArrows
                    back={`/create/${id}`}
                    next={`/create/${id}/background`}
                />
                <div className="mb-6 relative">
                    <div>
                        <h1 className="text-2xl font-semibold">Выбор класса</h1>
                        <p className="text-sm text-muted-foreground">
                            Текущий выбор: {CLASS_LABELS[draft.basics.class] || draft.basics.class}
                        </p>
                    </div>
                    <ExitButton />
                </div>

                {/* Class grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {ALL_CLASSES.map((k) => {
                        const c = CLASS_CATALOG.find((x) => x.key === k)!;
                        const isSelected = draft.basics.class === k;
                       
                        return (
                            <button
                                key={k}
                                onClick={() => setBasics({ class: k })}
                                className={`text-left rounded-xl border bg-card transition hover:shadow-md hover:scale-[1.01] ${isSelected
                                        ? "border-2 border-primary shadow-lg scale-[1.02] bg-gradient-to-b from-primary/5 to-transparent"
                                        : ""
                                    }`}
                            >
                                <div className="flex items-center">
                                    <img
                                        src={`/assets/class-avatars/${c.key}.png`}
                                        alt={CLASS_LABELS[c.key] || c.key}
                                        className="ml-2 h-20 w-20 object-cover rounded-md flex-shrink-0 border"
                                        onError={(e) => {
                                            e.currentTarget.src = "/assets/class-avatars/default.png";
                                        }}
                                    />
                                    <div className="flex-1 pl-3 pr-2 py-4">
                                        <div className="flex items-center justify-between">
                                            <h3
                                                className={`font-medium tracking-wide ${isSelected ? "text-primary font-bold" : ""
                                                    }`}
                                            >
                                                {CLASS_LABELS[c.key] || c.key}
                                            </h3>
                                            {isSelected && (
                                                <div className="absolute right-2 top-2 text-primary">
                                                    <Icons.Crown className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {c.desc}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Информация о выбранном классе */}
                {info && (
                    <Card className="mt-6 overflow-hidden border bg-card shadow-md">
                        <CardHeader className="border-b pb-3">
                            <CardTitle className="text-xl font-bold tracking-wide">
                                {CLASS_LABELS[info.key] || info.key}
                            </CardTitle>
                            {info.longDesc ? (
                                <p className="mt-1 text-sm text-muted-foreground italic leading-relaxed whitespace-pre-line">
                                    {info.longDesc}
                                </p>
                            ) : (
                                <p className="mt-1 text-sm text-muted-foreground italic leading-relaxed">
                                    {info.desc}
                                </p>
                            )}
                        </CardHeader>

                        <CardContent className="space-y-6 pt-6">
                            {/* Уровень */}          
                            <div >
                                <h3 className="text-lg font-semibold mb-3 pl-3 flex items-center border-l-2 border-primary gap-2">
                                    УРОВЕНЬ ПЕРСОНАЖА:
                                    <span className="text-xl font-bold">{draft.basics.level}</span>
                                    <div className="flex flex-col ml-2">
                                        <button
                                            onClick={() => setLevel(Math.min(20, draft.basics.level + 1))}
                                            className="p-1 hover:text-primary"
                                        >
                                            <Icons.ChevronUp />
                                        </button>
                                        <button
                                            onClick={() => setLevel(Math.max(1, draft.basics.level - 1))}
                                            className="p-1 hover:text-primary"
                                        >
                                            <Icons.ChevronDown />
                                        </button>
                                    </div>
                                </h3>
                            </div>
                            {/* Основная инфа */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2 rounded border p-2">
                                    <Icons.Heart className="w-5 h-5 text-red-500" />
                                    <span className="font-medium">
                                        Хиты:{" "}
                                        <span className="text-primary">
                                           {maxHP}
                                        </span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 rounded border p-2">
                                    <span className="font-medium">Кость хитов:</span> {draft.basics.level}d{info.hitDice}
                                </div>
                                <div className="flex items-center gap-2 rounded border p-2">
                                    <span className="font-medium">Основные характеристики:</span>{" "}
                                    {info.mainStats?.join(", ") || "—"}
                                </div>
                            </div>

                            <h3 className="text-base font-bold uppercase tracking-wider text-foreground mb-3 border-l-2 border-primary pl-2">
                                Особенности
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                {feats.map((f, idx) => (
                                    <FeatureBlock
                                        key={idx}
                                        name={f.name}
                                        desc={f.desc}
                                        featureLevel={f.featureLevel}
                                        source="class"
                                        idx={idx}
                                        choices={f.choices}
                                    />
                                ))}
                            </div>

                            {/* Подклассы */}
                            {/*{info.subclasses && info.subclasses.length > 0 && (*/}
                            {/*    <div>*/}
                            {/*        <h3 className="text-base font-bold uppercase tracking-wider text-foreground mb-3 border-l-2 border-primary pl-2">*/}
                            {/*            Подклассы*/}
                            {/*        </h3>*/}
                            {/*        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">*/}
                            {/*            {info.subclasses.map((sc) => {*/}
                            {/*                const isSelected = draft.basics.subclass === sc.key;*/}
                            {/*                return (*/}
                            {/*                    <button*/}
                            {/*                        key={sc.key}*/}
                            {/*                        onClick={() => setSubclass(sc.key)}*/}
                            {/*                        className={`text-left rounded-lg border p-3 transition hover:shadow-md hover:scale-[1.01] ${isSelected*/}
                            {/*                                ? "border-2 border-primary shadow-lg scale-[1.02] bg-gradient-to-b from-primary/5 to-transparent"*/}
                            {/*                                : ""*/}
                            {/*                            }`}*/}
                            {/*                    >*/}
                            {/*                        <div*/}
                            {/*                            className={`font-medium tracking-wide ${isSelected ? "text-primary font-bold" : ""*/}
                            {/*                                }`}*/}
                            {/*                        >*/}
                            {/*                            {sc.key}*/}
                            {/*                        </div>*/}
                            {/*                        <p className="mt-1 text-xs text-muted-foreground leading-snug">*/}
                            {/*                            {sc.desc}*/}
                            {/*                        </p>*/}
                            {/*                    </button>*/}
                            {/*                );*/}
                            {/*            })}*/}
                            {/*        </div>*/}
                            {/*    </div>*/}
                            {/*)}*/}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

function LevelSelector({ level, setLevel }: { level: number; setLevel: (lvl: number) => void }) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setLevel(Math.max(1, level - 1))}
                    className="px-2 py-1 border rounded hover:bg-muted"
                >
                    –
                </button>
                <span className="w-10 text-center font-semibold">{level}</span>
                <button
                    onClick={() => setLevel(Math.min(20, level + 1))}
                    className="px-2 py-1 border rounded hover:bg-muted"
                >
                    +
                </button>
            </div>

            <Slider
                value={[level]}
                min={1}
                max={20}
                step={1}
                onValueChange={([val]) => setLevel(val)}
            />
            <p className="text-sm text-muted-foreground">Уровень персонажа: {level}</p>
        </div>
    );
}