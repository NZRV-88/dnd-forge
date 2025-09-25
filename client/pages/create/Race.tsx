import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Abilities, useCharacter } from "@/store/character";
import { RACE_CATALOG, getRaceByKey } from "@/data/races";
import { Spells } from "@/data/spells";
import { SKILLS } from "@/data/skills";
import { Feats } from "@/data/feats";
import type { RaceInfo, SubraceInfo } from "@/data/races/types";
import { getAllAbilityBonuses, getSubraceAbilityBonuses, getRaceAbilityBonuses, getEffectiveSpeed } from "@/data/races/types";
import { LANGUAGES, getLanguageName } from "@/data/languages/languages";
import { Tools } from "@/data/items/tools";
import { ABILITIES } from "@/components/refs/abilities";
import ExitButton from "@/components/ui/ExitButton";
import StepArrows from "@/components/ui/StepArrows";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SpellMeta from "@/components/ui/SpellMeta";
import * as Icons from "@/components/refs/icons";
import { getDamageIcon } from "@/components/refs/icons";
import { useParams } from "react-router-dom";

interface RaceProps {
    r: RaceInfo;
}

// утилита: объединяем бонусы
/** Собирает бонусы только из подрасы (из поля abilityBonuses и из всех traits[].abilityBonuses) */
/**
 * Собирает и агрегирует бонусы по характеристикам из traits подрасы.
 * Возвращает объект вида { str: 2, int: 1 }.
 */
export function getSubraceBonuses(sub?: SubraceInfo): Record<string, number> {
    if (!sub) return {};

    const bonuses: Record<string, number> = {};

    const traits = sub.traits ?? [];
    for (const trait of traits) {
        if (!trait) continue;
        const ab = trait.abilityBonuses;
        if (!ab || typeof ab !== "object") continue;

        for (const [key, value] of Object.entries(ab)) {
            const num = typeof value === "number" ? value : Number(value);
            if (Number.isNaN(num)) continue;
            bonuses[key] = (bonuses[key] ?? 0) + num;
        }
    }

    return bonuses;
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

function hasAbilityBonuses(r: RaceInfo): boolean {
    if (r.abilityBonuses && Object.keys(r.abilityBonuses).length > 0) {
        return true;
    }

    if (r.traits?.some(t => t.abilityBonuses && Object.keys(t.abilityBonuses).length > 0)) {
        return true;
    }

    if (r.traits?.some(t => t.choices?.some(c => c.type === "ability"))) {
        return true;
    }

    return false;
}

export default function Race() {
    const { id } = useParams<{ id: string }>();
    const nav = useNavigate();
    const {
        basics,
        setRace, setSubrace, save,
        spells, setSpells,
        setSkills, skills,
        feats, setFeats, setFeatAbilityChoice, clearFeatAbilityChoices, featAbilityChoice,
        tools, setTools,
        setRaceAbilityChoice, clearRaceAbilityChoices, removeRaceAbilityChoice, raceAbilityChoice
    } = useCharacter();
    const [selected, setSelected] = useState<string>(
        basics.race || RACE_CATALOG[0].key
    );
    const sel = selected;
    const r = getRaceByKey(sel)!;
    const [subrace, setSubraceState] = useState<string | null>(basics.subrace || null);
    const [selectedSubraceKey, setSelectedSubraceKey] = useState<string | null>(null);

    const selectedSubrace = r.subraces?.find(
        (s) => s.name === subrace
    );

    const speed = getEffectiveSpeed(r, selectedSubrace);
    const bonuses = getAllAbilityBonuses(r, selectedSubrace);
    const traits = getEffectiveTraits(r, selectedSubrace);

    function pickRace(key: string) {
        if (key !== basics.race) {
            setRace(key, undefined, getRaceByKey(key)?.abilityBonuses);
            setFeats([]); // сбрасываем только при смене расы!
            clearFeatAbilityChoices();
            clearRaceAbilityChoices();
        }
        setSelected(key);
        setSubraceState(null);
        setSpells([]);
        setLanguages([]);
        setSkills([]);
        setTools([]);

    }

    function handleSubraceSelect(subraceKey: string) {
        if (!r) return;

        // сброс при смене подрасы
        setSpells([]);
        setLanguages([]);
        setSkills([]);

        const selectedSubrace = r.subraces?.find((s) => s.name === subraceKey);
        if (selectedSubrace) {
            const bonuses = getSubraceAbilityBonuses(selectedSubrace);

            setSubrace(subraceKey, bonuses);
            setSubraceState(subraceKey);

            // обрабатываем черты подрасы
            selectedSubrace.traits?.forEach((trait) => {
                if (trait.tools) {
                    setTools([...new Set([...tools, ...trait.tools])]);
                }
                if (r.languages) {
                    setLanguages([...new Set([...languages, ...r.languages])]);
                }
                if (trait.spells) {
                    trait.spells.forEach((sp) => {
                        if (sp.type === "innate" && sp.spells) {
                            setSpells([...new Set([...spells, ...sp.spells])]);
                        }
                    });
                }
                if (trait.skills) {
                    setSkills([...new Set([...skills, ...trait.skills])]);
                }
            });

            return;
        }

        const selectedAncestry = r.ancestries?.find((a) => a.name === subraceKey);
        if (selectedAncestry) {
            setSubrace(subraceKey, undefined);
            setSubraceState(subraceKey);
            return;
        }
    }
    const shapeIcon = (shape?: string) =>
        shape === "Конус" ? <Icons.Wind className="w-4 h-4" /> : <Icons.ArrowRight className="w-4 h-4" />;

    const getDamageForLevel = (damageByLevel: Record<number, string> | undefined, level = 1) => {
        if (!damageByLevel) return "";
        const keys = Object.keys(damageByLevel).map(Number).sort((a, b) => a - b);
        for (let i = keys.length - 1; i >= 0; i--) {
            if (level >= keys[i]) return damageByLevel[keys[i]];
        }
        return damageByLevel[keys[0]] ?? "";
    };

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
        ];
        return Array.from(new Set(langs));
    }

    const { languages, setLanguages } = useCharacter();
    const knownLangs = [...getLanguages(r), ...languages];

    const raceInfo = RACE_CATALOG.find(
        (c) => c.key.toLowerCase() === basics.race.toLowerCase()
    );


    return (
        <div className="container mx-auto py-10">
            <div className="mx-auto max-w-5xl relative">
                <StepArrows back={`/create/${id}/background`} next={`/create/${id}/abilities`} />
                {/* крестик в правом верхнем углу */}
                <ExitButton />

                <div className="mb-6 flex items-baseline justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Выбор расы</h1>
                        <p className="text-sm text-muted-foreground">
                            Текущий выбор: {basics.race ? [basics.race] || basics.race : "не выбрана"}
                            {basics.subrace ? ` • ${basics.subrace}` : ""}
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[...RACE_CATALOG]
                        .sort((a, b) =>
                            String(raceInfo[a.name] || a.key).localeCompare(
                                String(raceInfo[b.name] || b.key)
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
                                                alt={raceInfo[race.name] || race.key}
                                                className="ml-2 h-24 w-24 object-cover rounded-md flex-shrink-0"
                                            />
                                        )}

                                        <div className="flex-1 pl-3 pr-2 py-4">
                                            <div className="flex items-center justify-between">
                                                <h3
                                                    className={`font-medium tracking-wide ${isSelected ? "text-primary font-bold" : ""
                                                        }`}
                                                >
                                                    {raceInfo[race.name] || race.key}
                                                </h3>
                                                {/* 👑 Корона */}
                                                {isSelected && (
                                                    <div className="absolute right-2 top-2 text-primary">
                                                        <Icons.Crown className="w-5 h-5" />
                                                    </div>
                                                )}
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
                            <CardTitle className="text-xl font-bold tracking-wide">{raceInfo[r.name] || r.key}</CardTitle>

                            {r.longDesc ? (
                                <div className="mt-1 text-sm text-muted-foreground italic leading-relaxed [&>p]:mb-4">
                                    <ReactMarkdown>{r.longDesc}</ReactMarkdown>
                                </div>
                            ) : (
                                <p className="mt-1 text-sm text-muted-foreground italic leading-relaxed">
                                    {r.desc}
                                </p>
                            )}

                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            {/* Информация */}
                            <div>
                                <h3 className="text-base font-bold uppercase tracking-wider text-foreground mb-3 border-l-2 border-primary pl-2">Информация</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex items-center gap-2 rounded border p-2">
                                        <Icons.Footprints className="h-4 w-4 text-muted-foreground" />
                                        <span><span className="font-medium">Скорость:</span> {getEffectiveSpeed(r, selectedSubrace)} фт.</span>
                                    </div>
                                    <div className="flex items-center gap-2 rounded border p-2">
                                        <Icons.Ruler className="h-4 w-4 text-muted-foreground" />
                                        <span><span className="font-medium">Размер:</span> {r.size}</span>
                                    </div>
                                    <div className="flex items-center gap-2 rounded border p-2">
                                        <Icons.Hourglass className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        <span><span className="font-medium">Возраст:</span> {r.age}</span>
                                    </div>
                                    <div className="flex items-center gap-2 rounded border p-2">
                                        <Icons.Languages className="h-4 w-4 text-muted-foreground" />
                                        <span><span className="font-medium">Языки:</span>  {knownLangs.map((key) => getLanguageName(key)).join(", ")} </span>
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
                                                <div className="text-xs text-muted-foreground mt-1 [&>p]:mb-4">
                                                    <ReactMarkdown>{trait.desc}</ReactMarkdown></div>
                                                {/* --- ВЫБОРЫ --- */}
                                                {trait.choices?.map((choice, ci) => (

                                                    <div key={ci} className="mt-2">
                                                        {choice.type === "language" && (
                                                            // ВЫБОР ЯЗЫКА
                                                            <div className="mt-2 space-y-2">
                                                                {Array.from({ length: choice.count ?? 1 }).map((_, i) => (
                                                                    <select
                                                                        key={i}
                                                                        className="w-full rounded border p-2 text-sm"
                                                                        value={languages[i] ?? ""}
                                                                        onChange={(e) => {
                                                                            const updated = [...languages];
                                                                            updated[i] = e.target.value;
                                                                            // фильтруем пустые значения
                                                                            setLanguages(updated.filter(Boolean));
                                                                        }}
                                                                    >
                                                                        <option value="">Выберите язык</option>
                                                                        {LANGUAGES.filter(
                                                                            (lang) =>
                                                                                !getLanguages(r).includes(lang.key) || languages[i] === lang.key
                                                                        ).map((lang) => (
                                                                            <option key={lang.key} value={lang.key}>
                                                                                {lang.name}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {choice.type === "tool" && (
                                                            <select className="w-full rounded border p-2 text-sm"
                                                                value={tools[0] ?? ""}
                                                                onChange={(e) => setTools([e.target.value])}
                                                            >
                                                                <option value="">Выберите инструмент</option>
                                                                {(choice.options ?? Tools.map(t => t.key)).map(key => {
                                                                    const tool = Tools.find(t => t.key === key)!;
                                                                    return <option key={tool.key} value={tool.key}>{tool.name}</option>;
                                                                })}
                                                            </select>
                                                        )}

                                                        {choice.type === "skill" &&
                                                            // ВЫБОР НАВЫКА
                                                            Array.from({ length: choice.count ?? 1 }).map((_, idx) => (
                                                                <select
                                                                    key={idx}
                                                                    className="w-full rounded border p-2 text-sm mt-2"
                                                                    value={skills[idx] ?? ""}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value;
                                                                        if (val) {
                                                                            const updated = [...skills];
                                                                            updated[idx] = val;
                                                                            setSkills(updated);
                                                                        }
                                                                    }}
                                                                >
                                                                    <option value="">Выберите навык</option>
                                                                    {SKILLS.filter(
                                                                        (s) => !skills.includes(s.key) || s.key === skills[idx]
                                                                    ).map((skill) => (
                                                                        <option key={skill.key} value={skill.key}>
                                                                            {skill.name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            ))}
                                                        {choice.type === "ability" &&
                                                            Array.from({ length: choice.count ?? 1 }).map((_, idx) => {
                                                                const choiceKey = `race:${r.key}:${ci}:${idx}`;

                                                                // уже занятые характеристики (чтобы не выбрать одинаковые)
                                                                const taken = Object.entries(raceAbilityChoice || {})
                                                                    .filter(([key]) => key !== choiceKey)
                                                                    .map(([_, val]) => val);

                                                                return (
                                                                    <select
                                                                        key={choiceKey}
                                                                        className="w-full rounded border p-2 text-sm"
                                                                        value={raceAbilityChoice?.[choiceKey] ?? ""}
                                                                        onChange={(e) => {
                                                                            const value = e.target.value;
                                                                            if (!value) {
                                                                                // если вернули на "Выберите характеристику" → удаляем конкретный выбор
                                                                                removeRaceAbilityChoice(choiceKey);
                                                                            } else {
                                                                                // иначе сохраняем выбранное значение
                                                                                setRaceAbilityChoice(choiceKey, value as keyof Abilities);
                                                                            }
                                                                        }}
                                                                    >
                                                                        <option value="">Выберите характеристику</option>
                                                                        {ABILITIES.filter((ability) => !taken.includes(ability.key)).map(
                                                                            (ability) => (
                                                                                <option key={ability.key} value={ability.key}>
                                                                                    {ability.label}
                                                                                </option>
                                                                            )
                                                                        )}
                                                                    </select>
                                                                );
                                                            })}
                                                        {/* ЧЕРТЫ (Feats) */}
                                                        {choice.type === "feat" && (
                                                            <div className="space-y-2">
                                                                <select
                                                                    className="w-full rounded border p-2 text-sm"
                                                                    value={feats[0] ?? ""}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value;
                                                                        if (val) {
                                                                            setFeats([val]);
                                                                        } else {
                                                                            setFeats([]);
                                                                        }
                                                                    }}
                                                                >
                                                                    <option value="">Выберите черту</option>
                                                                    {Feats.map((feat) => (
                                                                        <option key={feat.key} value={feat.key}>
                                                                            {feat.name}
                                                                        </option>
                                                                    ))}
                                                                </select>

                                                                {/* описание выбранной черты */}
                                                                {feats[0] && (
                                                                    <div className="mt-2 space-y-2">
                                                                        <div className="rounded border p-2 bg-muted/10 text-xs text-muted-foreground leading-snug">
                                                                            {Feats.find((f) => f.key === feats[0])?.desc}
                                                                        </div>

                                                                        {/* если feat имеет выбор характеристик */}
                                                                        {Feats.find((f) => f.key === feats[0])?.effect?.some(e => e.abilityChoice) && (
                                                                            <select
                                                                                className="w-full rounded border p-2 text-sm"
                                                                                value={featAbilityChoice?.[feats[0]] ?? ""}   // 🔹 подставляем текущее сохранённое значение
                                                                                onChange={(e) => {
                                                                                    const ability = e.target.value as keyof Abilities;
                                                                                    if (ability) {
                                                                                        setFeatAbilityChoice(feats[0], ability);
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <option value="">Выберите характеристику</option>
                                                                                {Feats.find((f) => f.key === feats[0])?.effect?.flatMap(e => e.abilityChoice ?? []).map((opt) => (
                                                                                    <option key={opt} value={opt}>
                                                                                        {opt === "str" ? "Сила" :
                                                                                            opt === "dex" ? "Ловкость" :
                                                                                                opt === "con" ? "Телосложение" :
                                                                                                    opt === "int" ? "Интеллект" :
                                                                                                        opt === "wis" ? "Мудрость" :
                                                                                                            opt === "cha" ? "Харизма" : opt}
                                                                                    </option>
                                                                                ))}
                                                                            </select>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                    </div>
                                                ))}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Бонусы характеристик */}
                            {Object.keys(getRaceAbilityBonuses(r)).length > 0 && (
                                <div>
                                    <h3 className="text-base font-bold uppercase tracking-wider text-foreground mb-3 border-l-2 border-primary pl-2">
                                        Бонусы характеристик
                                    </h3>
                                    <div className="flex flex-wrap gap-2 text-sm">
                                        {Object.entries(getRaceAbilityBonuses(r)).map(([ability, bonus]) => {
                                            const abilityData = ABILITIES.find((a) => a.key === ability);
                                            const Icon = abilityData?.icon;
                                            return (
                                                <div
                                                    key={ability}
                                                    className="flex items-center gap-1 rounded-full border px-3 py-1"
                                                >
                                                    {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                                                    <span className="font-medium">
                                                        +{bonus} {abilityData?.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

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
                                                            {rs.desc && (
                                                                <div className="prose prose-sm max-w-none text-xs text-muted-foreground mt-2 italic">
                                                                    <ReactMarkdown
                                                                        remarkPlugins={[remarkGfm]}
                                                                        components={{
                                                                            ul: ({ node, ...props }) => (
                                                                                <ul style={{ listStyleType: "disc", paddingLeft: "1.25rem" }} {...props} />
                                                                            ),
                                                                            ol: ({ node, ...props }) => (
                                                                                <ol style={{ listStyleType: "decimal", paddingLeft: "1.25rem" }} {...props} />
                                                                            ),
                                                                        }}
                                                                    >
                                                                        {rs.desc.replace(/\\n/g, '\n')}
                                                                    </ReactMarkdown>
                                                                </div>
                                                            )}
                                                            {/* бейдж — верхний правый угол */}
                                                            {!rs.available && (
                                                                <span className="absolute right-3 top-3 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                                                                    с {rs.level} уровня
                                                                </span>
                                                            )}
                                                            <div className="mt-2">
                                                                <SpellMeta spell={spell} />
                                                            </div>
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
                                                        {/* 👑 Корона */}
                                                        {isSubraceSelected && (
                                                            <div className="absolute right-2 top-2 text-primary">
                                                                <Icons.Crown className="w-5 h-5" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className={`font-medium tracking-wide ${isSubraceSelected ? "text-primary font-bold" : ""}`}>{subraceInfo.name || subraceInfo.key}</div>
                                                            <p className="mt-1 text-xs text-muted-foreground leading-snug">{subraceInfo.desc}</p>
                                                        </div>
                                                        {Object.keys(getAllAbilityBonuses(r, subraceInfo)).length > 0 && (
                                                            <div className="mt-3 flex flex-wrap gap-1">
                                                                {Object.entries(getSubraceAbilityBonuses(subraceInfo)).map(([ability, bonus]) => {
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
                                    <h3 className="text-base font-bold uppercase tracking-wider text-foreground mb-3 border-l-2 border-primary pl-2">
                                        Черты подрасы
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {r.subraces.find((s) => s.name === subrace)?.traits?.map((trait, index) => (
                                            <div key={index} className="relative flex flex-col rounded border p-2 bg-muted/20">
                                                <span className="font-medium">{trait.name}</span>
                                                <div className="text-xs text-muted-foreground mt-1 [&>p]:mb-4">
                                                    <ReactMarkdown>{trait.desc}</ReactMarkdown>
                                                </div>
                                                {/*<p className="text-xs text-muted-foreground mt-1">{trait.desc}</p>*/}

                                                {/* --- ВЫБОРЫ --- */}
                                                {trait.choices?.map((choice, ci) => (
                                                    <div key={ci} className="mt-auto">
                                                        {choice.type === "language" && (
                                                            <select
                                                                className="w-full rounded border p-2 text-sm"
                                                                value={languages[0] ?? ""} // показываем текущий выбор (если есть)
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    if (val) {
                                                                        // заменяем массив только одним языком
                                                                        setLanguages([val]);
                                                                    } else {
                                                                        // если выбрано пусто — очищаем
                                                                        setLanguages([]);
                                                                    }
                                                                }}
                                                            >
                                                                <option value="">Выберите язык</option>
                                                                {LANGUAGES
                                                                    .filter((lang) => !getLanguages(r).includes(lang.key))
                                                                    .map((lang) => (
                                                                        <option key={lang.key} value={lang.key}>
                                                                            {lang.name}
                                                                        </option>
                                                                    ))}
                                                            </select>
                                                        )}

                                                        {choice.type === "tool" && (
                                                            <select className="w-full rounded border p-2 text-sm"
                                                                value={tools[0] ?? ""}
                                                                onChange={(e) => setTools([e.target.value])}
                                                            >
                                                                <option value="">Выберите инструмент</option>
                                                                {(choice.options ?? Tools.map(t => t.key)).map(key => {
                                                                    const tool = Tools.find(t => t.key === key)!;
                                                                    return <option key={tool.key} value={tool.key}>{tool.name}</option>;
                                                                })}
                                                            </select>
                                                        )}

                                                        {choice.type === "skill" && (
                                                            <select className="w-full rounded border p-2 text-sm">
                                                                <option value="">Выберите навык</option>
                                                                {SKILLS.map((skill) => (
                                                                    <option key={skill.key} value={skill.key}>{skill.name}</option>
                                                                ))}
                                                            </select>
                                                        )}
                                                    </div>
                                                ))}

                                                {/* --- ЗАКЛИНАНИЯ ЧЕРТЫ --- */}
                                                {trait.spells && trait.spells.length > 0 && (
                                                    <div className="space-y-2 mt-2">
                                                        {getAvailableSpells(trait.spells, basics.level).map((rs, idx) => {
                                                            if (rs.type === "innate") {
                                                                return rs.spells?.map((key) => {
                                                                    const spell = Spells.find((s) => s.key === key);
                                                                    return (
                                                                        <div key={key} className="rounded border p-2 bg-muted/20">
                                                                            <span className="font-medium">{spell?.name || key}</span>
                                                                            {spell?.desc && (
                                                                                <p className="text-xs text-muted-foreground mt-2">{spell.desc}</p>
                                                                            )}
                                                                            <div className="mt-2"><SpellMeta spell={spell} /></div>
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
                                                                            <option value="">Выберите заклинание</option>
                                                                            {available.map((spell) => (
                                                                                <option key={spell.key} value={spell.key}>
                                                                                    {spell.name}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                );
                                                            }

                                                            return null;
                                                        })}
                                                    </div>
                                                )}
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
                                                            {rs.desc && (
                                                                <p className="text-xs text-muted-foreground mt-2 italic">{rs.desc}</p>
                                                            )}
                                                            {/* бейдж — верхний правый угол */}
                                                            {!rs.available && (
                                                                <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-amber-900/20 bg-gradient-to-b from-amber-50 via-stone-100 to-amber-100 px-2.5 py-0.5 text-[10px] font-medium text-stone-700 shadow-sm">
                                                                    <Icons.ChevronUp className="h-3 w-3 text-stone-600" />
                                                                    <span>Доступно с {rs.level} уровня</span>
                                                                </span>
                                                            )}


                                                            <div className="mt-2">
                                                                <SpellMeta spell={spell} />
                                                            </div>


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

                            {/* Выбранные заклинания */}
                            {spells.length > 0 && (
                                <div>
                                    <h3 className="text-base font-bold uppercase tracking-wider text-foreground mb-3 border-l-2 border-primary pl-2">
                                        Выбранные заклинания
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        {spells.map((key) => {
                                            const spell = Spells.find((s) => s.key === key);
                                            if (!spell) return null;
                                            return (
                                                <div key={spell.key} className="mt-2">
                                                    <SpellMeta spell={spell} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}


                            {/* Драконье наследие */}
                            {r.ancestries && r.ancestries.length > 0 && (
                                <div>
                                    <h3 className="text-base font-bold uppercase tracking-wider text-foreground mb-3 border-l-2 border-primary pl-2">
                                        Драконье наследие
                                    </h3>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {r.ancestries
                                            .sort((a, b) => String(a.name).localeCompare(String(b.name)))
                                            .map((ancestry) => {
                                                const isSelected = subrace === ancestry.name;
                                                const DamageIcon = ancestry.breathWeapon ? getDamageIcon(ancestry.breathWeapon.damageType) : null;
                                                const damageText = getDamageForLevel(ancestry.breathWeapon?.damageByLevel, basics.level || 1);

                                                return (
                                                    <button
                                                        key={ancestry.name}
                                                        onClick={() => handleSubraceSelect(ancestry.name)}
                                                        aria-pressed={isSelected}
                                                        className={`text-left rounded-lg border p-3 flex flex-col justify-between transition hover:shadow-md hover:scale-[1.01] ${isSelected ? "border-2 border-primary shadow-lg scale-[1.02] bg-gradient-to-b from-primary/5 to-transparent" : ""}`}

                                                    >
                                                        {/* 👑 Корона */}
                                                        {isSelected && (
                                                            <div className="absolute right-2 top-2 text-primary">
                                                                <Icons.Crown className="w-5 h-5" />
                                                            </div>
                                                        )}

                                                        {/* Заголовок с иконкой */}
                                                        <div className="flex items-center gap-2 mb-1">
                                                            {DamageIcon && <DamageIcon className="w-5 h-5 text-primary" />}
                                                            <span className={`font-medium tracking-wide ${isSelected ? "text-primary font-bold" : "text-foreground"}`}>
                                                                {ancestry.name}
                                                            </span>
                                                        </div>

                                                        {/* Краткое описание */}
                                                        <p className="text-xs text-muted-foreground mb-2">{ancestry.description}</p>

                                                        {ancestry.breathWeapon && (
                                                            <div className="flex flex-wrap gap-1 text-[11px] text-muted-foreground">
                                                                {/* Тип урона */}
                                                                <span className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs bg-muted/20">
                                                                    Тип урона: {ancestry.breathWeapon.damageType}
                                                                </span>

                                                                {/* Форма дыхания */}
                                                                <span className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs bg-muted/20">
                                                                    {shapeIcon(ancestry.breathWeapon.breath.shape)}
                                                                    {ancestry.breathWeapon.breath.shape} {ancestry.breathWeapon.breath.size}
                                                                </span>

                                                                {/* Сейв */}
                                                                <span className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs bg-muted/20">
                                                                    Спасбросок: {ancestry.breathWeapon.breath.save}
                                                                </span>
                                                            </div>
                                                        )}
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
