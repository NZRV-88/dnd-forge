import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useCharacter } from "@/store/character";
import { RACE_CATALOG, RACE_LABELS, getRaceByKey } from "@/data/races";
import { Spells } from "@/data/spells";
import type { RaceInfo, SubraceInfo } from "@/data/races/types";
import { ABILITIES } from "@/components/refs/abilities";
import ExitButton from "@/components/ui/ExitButton";
import StepArrows from "@/components/ui/StepArrows";
import {
    Sword,
    Heart,
    Brain,
    Book,
    Eye,
    Star,
    Crown,
    Flame,
    Snowflake,
    Zap,
    Skull,
    FlaskConical,
    Footprints,
    Ruler,
    Hourglass,
    Languages,
    X,
    Shield,
    Clock
} from "lucide-react";
function getDamageIcon(damageType: string) {
    switch (damageType) {
        case "Огонь":
            return Flame;
        case "Холод":
            return Snowflake;
        case "Молния":
            return Zap;
        case "Яд":
            return Skull;
        case "Кислота":
            return FlaskConical;
        default:
            return Flame;
    }
}

interface RaceProps {
    r: RaceInfo;
}

// утилита: объединяем бонусы
function getEffectiveBonuses(r: RaceInfo, sub?: SubraceInfo) {
    return { ...r.abilityBonuses, ...sub?.abilityBonuses };
}

// утилита: считаем итоговую скорость
function getEffectiveSpeed(r: RaceInfo, sub?: SubraceInfo) {
    return sub?.speed ?? r.speed;
}

// утилита: объединяем черты
function getEffectiveTraits(r: RaceInfo, sub?: SubraceInfo) {
    return [...r.traits, ...(sub?.traits ?? [])];
}

/**
 * Возвращает список записей заклинаний/наборах с флагом available (доступно по уровню персонажа)
 * Каждый элемент sp — объект вида { type, level, spells, desc, ... }
 */
function getAvailableSpells(spells, charLevel: number) {
    return spells.map((sp) => ({
        ...sp,
        available: !sp.level || (typeof charLevel === "number" && sp.level <= charLevel),
    }));
}

// Расширенный SpellMeta (параметры — без описания)
function SpellMeta({ spell }: { spell: any }) {
    if (!spell) return null;

    const damageText = (() => {
        if (!spell.damage) return null;
        if (typeof spell.damage === "string") return spell.damage;
        if (typeof spell.damage === "object") {
            const parts: string[] = [];
            if (spell.damage.amount) parts.push(String(spell.damage.amount));
            if (spell.damage.dice) parts.push(String(spell.damage.dice));
            if (spell.damage.type) parts.push(String(spell.damage.type));
            return parts.join(" ");
        }
        return String(spell.damage);
    })();

    const componentsText = (() => {
        if (!spell.components) return null;
        if (Array.isArray(spell.components)) return spell.components.join(", ");
        if (typeof spell.components === "object")
            return Object.entries(spell.components)
                .map(([k, v]) => `${k}:${v}`)
                .join(", ");
        return String(spell.components);
    })();

    return (
        <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3 text-sm">
                {spell.school && (
                    <div className="flex items-center gap-2 rounded border p-2">
                        <Book className="h-4 w-4 text-muted-foreground" />
                        <span><span className="font-medium">Школа:</span> {spell.school}</span>
                    </div>
                )}
                {spell.castingTime && (
                    <div className="flex items-center gap-2 rounded border p-2">
                        <Hourglass className="h-4 w-4 text-muted-foreground" />
                        <span><span className="font-medium">Время:</span> {spell.castingTime}</span>
                    </div>
                )}
                {spell.duration && (
                    <div className="flex items-center gap-2 rounded border p-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span><span className="font-medium">Длительность:</span> {spell.duration}</span>
                    </div>
                )}
                {spell.range && (
                    <div className="flex items-center gap-2 rounded border p-2">
                        <Ruler className="h-4 w-4 text-muted-foreground" />
                        <span><span className="font-medium">Дальность:</span> {spell.range}</span>
                    </div>
                )}
                {spell.area && (
                    <div className="flex items-center gap-2 rounded border p-2">
                        <Footprints className="h-4 w-4 text-muted-foreground" />
                        <span><span className="font-medium">Область:</span> {spell.area}</span>
                    </div>
                )}
                {componentsText && (
                    <div className="flex items-center gap-2 rounded border p-2">
                        <FlaskConical className="h-4 w-4 text-muted-foreground" />
                        <span><span className="font-medium">Компоненты:</span> {componentsText}</span>
                    </div>
                )}
                {spell.save && (
                    <div className="flex items-center gap-2 rounded border p-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span><span className="font-medium">Спасбросок:</span> {spell.save}</span>
                    </div>
                )}
                {damageText && (
                    <div className="flex items-center gap-2 rounded border p-2">
                        {(() => {
                            const Icon = getDamageIcon(spell.damage?.type || spell.damage);
                            return <Icon className="h-4 w-4 text-muted-foreground" />;
                        })()}
                        <span><span className="font-medium">Урон:</span> {damageText}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Race() {
    const nav = useNavigate();
    const { basics, setRace, setSubrace, save, spells, setSpells } = useCharacter();
    const [selected, setSelected] = useState<string | null>(null);
    const sel = selected || basics.race;
    const r = getRaceByKey(sel) || null;
    const [subrace, setSubraceState] = useState<string | null>(basics.subrace || null);
    const [selectedSubraceKey, setSelectedSubraceKey] = useState<string | null>(null);

    const selectedSubrace = r.subraces?.find(
        (s) => s.name === subrace
    );

    const speed = getEffectiveSpeed(r, selectedSubrace);
    const bonuses = getEffectiveBonuses(r, selectedSubrace);
    const traits = getEffectiveTraits(r, selectedSubrace);

    function pickRace(key: string) {
        const race = getRaceByKey(key);
        if (race) {
            setRace(key, undefined, race.abilityBonuses);
        }
        setSelected(key);
        setSubraceState(null);
    }

    function handleSubraceSelect(subraceKey: string) {
        if (!r) return;
        const selectedSubrace = r.subraces?.find((s) => s.name === subraceKey);
        if (selectedSubrace) {
            setSubrace(subraceKey, selectedSubrace.abilityBonuses);
            setSubraceState(subraceKey);
            return;
        }
        const selectedAncestry = r.ancestries?.find((a) => a.name === subraceKey);
        if (selectedAncestry) {
            setSubrace(subraceKey, undefined);
            setSubraceState(subraceKey);
            return;
        }
    }

    function saveRaceChoices() {
        nav("/create/abilities");
    }

    function goBack() {
        nav("/create/background");
    }

    function exitToCharacters() {
        if (basics.name) {
            save();
        }
        nav("/characters");
    }

    function getLanguages(race: RaceInfo) {
        const langs = [
            ...(race.languages ?? []),
            ...(race.proficiencies?.languages ?? []),
        ];
        return Array.from(new Set(langs));
    }

    return (
        <div className="container mx-auto py-10">
            <div className="mx-auto max-w-5xl relative">
                <StepArrows back="/create/background" next="/create/abilities" />   
                {/* крестик в правом верхнем углу */}
                <ExitButton />

                <div className="mb-6 flex items-baseline justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Выбор расы</h1>
                        <p className="text-sm text-muted-foreground">
                            Текущий выбор: {basics.race ? RACE_LABELS[basics.race] || basics.race : "не выбрана"}
                            {basics.subrace ? ` • ${basics.subrace}` : ""}
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[...RACE_CATALOG]
                        .sort((a, b) =>
                            String(RACE_LABELS[a.key] || a.key).localeCompare(
                                String(RACE_LABELS[b.key] || b.key)
                            )
                        )
                        .map((race) => {
                            const isSelected = basics.race === race.key;
                            return (
                                <button
                                    key={race.key}
                                    onClick={() => pickRace(race.key)}
                                    className={`text-left rounded-xl border bg-card transition hover:shadow-md hover:scale-[1.01] ${isSelected
                                        ? "border-2 border-primary shadow-lg scale-[1.02] bg-gradient-to-b from-primary/5 to-transparent"
                                        : ""
                                        }`}
                                >
                                    <div className="flex items-center">
                                        {race.avatar && (
                                            <img
                                                src={race.avatar}
                                                alt={RACE_LABELS[race.key] || race.key}
                                                className="ml-2 h-24 w-24 object-cover rounded-md flex-shrink-0"
                                            />
                                        )}

                                        <div className="flex-1 pl-3 pr-2 py-4">
                                            <div className="flex items-center justify-between">
                                                <h3
                                                    className={`font-medium tracking-wide ${isSelected ? "text-primary font-bold" : ""
                                                        }`}
                                                >
                                                    {RACE_LABELS[race.key] || race.key}
                                                </h3>
                                                {isSelected && <Crown className="h-4 w-4 text-primary flex-shrink-0" />}
                                            </div>
                                            <p className="mt-1 text-sm text-muted-foreground">{race.desc}</p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                </div>

                {r && (
                    <Card className="mt-6 overflow-hidden border bg-card shadow-md">
                        <CardHeader className="border-b pb-3">
                            <CardTitle className="text-xl font-bold tracking-wide">{RACE_LABELS[r.key] || r.key}</CardTitle>
                            <p className="mt-1 text-sm text-muted-foreground italic leading-relaxed">{r.longDesc || r.desc}</p>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            {/* Информация */}
                            <div>
                                <h3 className="text-base font-bold uppercase tracking-wider text-foreground mb-3 border-l-2 border-primary pl-2">Информация</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex items-center gap-2 rounded border p-2">
                                        <Footprints className="h-4 w-4 text-muted-foreground" />
                                        <span><span className="font-medium">Скорость:</span> {getEffectiveSpeed(r, selectedSubrace)} фт.</span>
                                    </div>
                                    <div className="flex items-center gap-2 rounded border p-2">
                                        <Ruler className="h-4 w-4 text-muted-foreground" />
                                        <span><span className="font-medium">Размер:</span> {r.size}</span>
                                    </div>
                                    <div className="flex items-center gap-2 rounded border p-2">
                                        <Hourglass className="h-4 w-4 text-muted-foreground" />
                                        <span><span className="font-medium">Возраст:</span> {r.age}</span>
                                    </div>
                                    <div className="flex items-center gap-2 rounded border p-2">
                                        <Languages className="h-4 w-4 text-muted-foreground" />
                                        <span><span className="font-medium">Языки:</span> {getLanguages(r).join(", ")}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Черты */}
                            {r.traits.length > 0 && (
                                <div>
                                    <h3 className="text-base font-bold uppercase tracking-wider text-foreground mb-3 border-l-2 border-primary pl-2">Черты</h3>
                                    <ul className="space-y-2">
                                        {r.traits.map((trait, index) => (
                                            <li key={index} className="rounded border p-2 text-sm leading-snug bg-muted/20">
                                                <span className="font-medium">{trait.name}</span>
                                                <p className="text-muted-foreground text-xs mt-1">{trait.desc}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Бонусы характеристик */}
                            <div>
                                <h3 className="text-base font-bold uppercase tracking-wider text-foreground mb-3 border-l-2 border-primary pl-2">Бонусы характеристик</h3>
                                <div className="flex flex-wrap gap-2 text-sm">
                                    {Object.entries(r.abilityBonuses).map(([ability, bonus]) => {
                                        const abilityData = ABILITIES.find((a) => a.key === ability);
                                        const Icon = abilityData?.icon;
                                        return (
                                            <div key={ability} className="flex items-center gap-1 rounded-full border px-3 py-1">
                                                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                                                <span className="font-medium">+{bonus} {abilityData?.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Расовые заклинания */}
                            {r.spells && r.spells.length > 0 && (
                                <div>
                                    <h3 className="text-base font-bold uppercase tracking-wider text-foreground mb-3 border-l-2 border-primary pl-2">Расовые заклинания</h3>
                                    <div className="space-y-2 text-sm">
                                        {getAvailableSpells(r.spells, basics.level).map((rs, idx) => {
                                            if (rs.type === "innate") {
                                                return rs.spells?.map((key) => {
                                                    const spell = Spells.find((s) => s.key === key);
                                                    return (
                                                        <div key={key} className="relative rounded border p-2 bg-muted/20 mb-2">
                                                            {/* бейдж — верхний правый угол */}
                                                            {!rs.available && (
                                                                <span className="absolute right-3 top-3 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                                                                    с {rs.level} уровня
                                                                </span>
                                                            )}

                                                            <div className="flex items-center justify-between">
                                                                <span className="font-medium">{spell?.name || key}</span>
                                                            </div>

                                                            {spell?.desc && (
                                                                <p className="text-xs text-muted-foreground mt-2">{spell.desc}</p>
                                                            )}

                                                            <div className="mt-2">
                                                                <SpellMeta spell={spell} />
                                                            </div>

                                                            {rs.desc && (
                                                                <p className="text-xs text-muted-foreground mt-2 italic">{rs.desc}</p>
                                                            )}
                                                        </div>
                                                    );
                                                });
                                            }
                                            if (rs.type === "choice") {
                                                const available = Spells.filter((s) => s.level === 0);
                                                const chosenKey = spells.find((s) =>
                                                    available.some((spell) => spell.key === s)
                                                );
                                                const chosen = chosenKey
                                                    ? available.find((s) => s.key === chosenKey)
                                                    : null;

                                                return (
                                                    <div key={idx} className="space-y-2">
                                                        <p className="text-xs text-muted-foreground">{rs.desc}</p>
                                                        <select
                                                            className="w-full rounded border p-2 text-sm"
                                                            value={chosenKey || ""}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                const others = spells.filter((s) => !available.some((spell) => spell.key === s));
                                                                if (!value) {
                                                                    setSpells(others);
                                                                } else {
                                                                    setSpells([...others, value]);
                                                                }
                                                            }}
                                                        >
                                                            <option value="">Выберите заговор</option>
                                                            {available.map((spell) => (
                                                                <option key={spell.key} value={spell.key}>
                                                                    {spell.name}
                                                                </option>
                                                            ))}
                                                        </select>

                                                        {chosen && (
                                                            <div className="rounded border p-2 bg-muted/10">
                                                                <SpellMeta spell={chosen} />
                                                                <p className="text-xs text-muted-foreground mt-2">{chosen.desc}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Подрасы */}
                            {r.subraces && r.subraces.length > 0 && (
                                <div>
                                    <h3 className="text-base font-bold uppercase tracking-wider text-foreground mb-3 border-l-2 border-primary pl-2">Подрасы</h3>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {[...r.subraces]
                                            .sort((a, b) => String(a.name).localeCompare(String(b.name)))
                                            .map((subraceInfo) => {
                                                const isSubraceSelected = subrace === subraceInfo.name;
                                                return (
                                                    <button
                                                        key={subraceInfo.key}
                                                        onClick={() => handleSubraceSelect(subraceInfo.name)}
                                                        className={`text-left rounded-lg border p-3 flex flex-col justify-between transition hover:shadow-md hover:scale-[1.01] ${isSubraceSelected ? "border-2 border-primary shadow-lg scale-[1.02] bg-gradient-to-b from-primary/5 to-transparent" : ""}`}
                                                    >
                                                        <div>
                                                            <div className={`font-medium tracking-wide ${isSubraceSelected ? "text-primary font-bold" : ""}`}>{subraceInfo.name || subraceInfo.key}</div>
                                                            <p className="mt-1 text-xs text-muted-foreground leading-snug">{subraceInfo.desc}</p>
                                                        </div>
                                                        {subraceInfo.abilityBonuses && (
                                                            <div className="mt-3 flex flex-wrap gap-1">
                                                                {Object.entries(subraceInfo.abilityBonuses).map(([ability, bonus]) => {
                                                                    const abilityData = ABILITIES.find((a) => a.key === ability);
                                                                    const Icon = abilityData?.icon;
                                                                    return (
                                                                        <div
                                                                            key={ability}
                                                                            className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs bg-muted/20"
                                                                        >
                                                                            {Icon && <Icon className="h-3 w-3 text-muted-foreground" />}
                                                                            <span className="font-medium">+{bonus} {abilityData?.label}</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}

                            {/* Черты подрасы */}
                            {subrace && r.subraces?.some((s) => s.name === subrace) && (
                                <div>
                                    <h3 className="text-base font-bold uppercase tracking-wider text-foreground mb-3 border-l-2 border-primary pl-2">Черты подрасы</h3>
                                    <div className="space-y-2 text-sm">
                                        {r.subraces.find((s) => s.name === subrace)?.traits?.map((trait, index) => (
                                            <div key={index} className="rounded border p-2 bg-muted/20">
                                                <span className="font-medium">{trait.name}</span>
                                                <p className="text-xs text-muted-foreground mt-1">{trait.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Заклинания подрасы */}
                            {subrace && r.subraces?.find((s) => s.name === subrace)?.spells && (
                                <div>
                                    <h3 className="text-base font-bold uppercase tracking-wider text-foreground mb-3 border-l-2 border-primary pl-2">Заклинания подрасы</h3>
                                    <div className="space-y-2 text-sm">
                                        {getAvailableSpells(r.subraces.find((s) => s.name === subrace)!.spells!, basics.level).map((rs, idx) => {
                                            if (rs.type === "innate") {
                                                return rs.spells?.map((key) => {
                                                    const spell = Spells.find((s) => s.key === key);
                                                    return (
                                                        <div key={key} className="relative rounded border p-2 bg-muted/20">
                                                            {/* бейдж — верхний правый угол */}
                                                            {!rs.available && (
                                                                <span className="absolute right-3 top-3 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                                                                    с {rs.level} уровня
                                                                </span>
                                                            )}

                                                            <div className="flex items-center justify-between">
                                                                <span className="font-medium">{spell?.name || key}</span>
                                                            </div>

                                                            {spell?.desc && (
                                                                <p className="text-xs text-muted-foreground mt-2">{spell.desc}</p>
                                                            )}

                                                            <div className="mt-2">
                                                                <SpellMeta spell={spell} />
                                                            </div>

                                                            {rs.desc && (
                                                                <p className="text-xs text-muted-foreground mt-2 italic">{rs.desc}</p>
                                                            )}
                                                        </div>
                                                    );
                                                });
                                            }
                                            if (rs.type === "choice") {
                                                const available = Spells.filter((s) => s.level === 0);
                                                const chosenKey = spells.find((s) =>
                                                    available.some((spell) => spell.key === s)
                                                );
                                                const chosen = chosenKey
                                                    ? available.find((s) => s.key === chosenKey)
                                                    : null;

                                                return (
                                                    <div key={idx} className="space-y-2">
                                                        <p className="text-xs text-muted-foreground">{rs.desc}</p>
                                                        <select
                                                            className="w-full rounded border p-2 text-sm"
                                                            value={chosenKey || ""}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                const others = spells.filter((s) => !available.some((spell) => spell.key === s));
                                                                if (!value) {
                                                                    setSpells(others);
                                                                } else {
                                                                    setSpells([...others, value]);
                                                                }
                                                            }}
                                                        >
                                                            <option value="">Выберите заговор</option>
                                                            {available.map((spell) => (
                                                                <option key={spell.key} value={spell.key}>
                                                                    {spell.name}
                                                                </option>
                                                            ))}
                                                        </select>

                                                        {chosen && (
                                                            <div className="rounded border p-2 bg-muted/10">
                                                                <SpellMeta spell={chosen} />
                                                                <p className="text-xs text-muted-foreground mt-2">{chosen.desc}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Драконье наследие */}
                            {r.ancestries && r.ancestries.length > 0 && (
                                <div>
                                    <h3 className="text-base font-bold uppercase tracking-wider text-foreground mb-3 border-l-2 border-primary pl-2">Драконье наследие</h3>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {[...r.ancestries]
                                            .sort((a, b) => String(a.name).localeCompare(String(b.name)))
                                            .map((ancestry) => {
                                                const isAncestrySelected = subrace === ancestry.name;
                                                return (
                                                    <button
                                                        key={ancestry.name}
                                                        onClick={() => handleSubraceSelect(ancestry.name)}
                                                        className={`text-left rounded-lg border p-3 transition hover:shadow-md hover:scale-[1.01] ${isAncestrySelected ? "border-2 border-primary shadow-lg scale-[1.02] bg-gradient-to-b from-primary/5 to-transparent" : ""}`}
                                                    >
                                                        <div className={`font-medium tracking-wide ${isAncestrySelected ? "text-primary font-bold" : ""}`}>
                                                            {ancestry.name}
                                                        </div>
                                                        <p className="mt-1 text-xs text-muted-foreground leading-snug">{ancestry.description}</p>
                                                    </button>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
