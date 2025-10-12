import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useCharacter } from "@/store/character";
import { Abilities as AbilityType, ABILITIES as AbilityList } from "@/data/abilities";
import { RACE_CATALOG, getRaceByKey } from "@/data/races";
import { Spells } from "@/data/spells";
import { SKILLS } from "@/data/skills";
import { Feats } from "@/data/feats";
import type { RaceInfo, SubraceInfo } from "@/data/races/types";
import { getAllAbilityBonuses, getSubraceAbilityBonuses, getRaceAbilityBonuses, getEffectiveSpeed } from "@/data/races/types";
import RaceRemoveModal from "@/components/ui/RaceRemoveModal";
import { LANGUAGES, getLanguageName } from "@/data/languages/languages";
import { Tools } from "@/data/items/tools";
import { ABILITIES } from "@/data/abilities";
import ExitButton from "@/components/ui/ExitButton";
import CharacterHeader from "@/components/ui/CharacterHeader";
import StepArrows from "@/components/ui/StepArrows";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SpellMeta from "@/components/ui/SpellMeta";
import * as Icons from "@/components/refs/icons";
import { getDamageIcon } from "@/components/refs/icons";
import { useParams } from "react-router-dom";
import ChoiceRenderer from "@/components/ui/ChoiceRenderer";
import FeatureBlock from "@/components/ui/FeatureBlock";
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
        draft, setDraft, spells, skills, feats, tools,
        setBasics, setChosenSkills, setChosenTools, setChosenLanguages, setChosenSpells, setChosenFeats, setChosenAbilities, isLoading
    } = useCharacter();
    
    // Показываем загрузку если контекст еще не готов
    if (isLoading) {
        return <div className="p-4">Загрузка...</div>;
    }
    const [selected, setSelected] = useState<string>(
        draft.basics.race || RACE_CATALOG[0].key
    );
    const sel = selected;
    const r = getRaceByKey(sel);
    const [subrace, setSubraceState] = useState<string | null>(draft.basics.subrace || null);
    const [selectedSubraceKey, setSelectedSubraceKey] = useState<string | null>(null);
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

    // Если раса не выбрана, показываем только выбор расы
    if (!r) {
        return (
            <div className="container mx-auto py-10">
                <div className="mx-auto max-w-5xl relative">
                    <StepArrows back={`/create/${id}/background`} next={`/create/${id}/abilities`} />
                    <ExitButton />
                    
                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold">Выбор расы</h1>
                        <p className="text-sm text-muted-foreground">
                            Выберите расу для вашего персонажа
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {[...RACE_CATALOG]
                            .sort((a, b) => String(a.name).localeCompare(String(b.name)))
                            .map((race) => (
                                <button
                                    key={race.key}
                                    onClick={() => pickRace(race.key)}
                                    className="text-left rounded-xl border bg-card transition hover:shadow-md hover:scale-[1.01] relative min-h-[100px]"
                                >
                                    <div className="p-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                <span className="text-sm font-bold text-primary">
                                                    {race.name.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="font-medium tracking-wide">{race.name}</div>
                                            </div>
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">{race.desc}</p>
                                    </div>
                                </button>
                            ))}
                    </div>
                </div>
            </div>
        );
    }

    const selectedSubrace = r.subraces?.find(
        (s) => s.key === subrace
    );

    const speed = getEffectiveSpeed(r, selectedSubrace);
    const bonuses = getAllAbilityBonuses(r, selectedSubrace);
    const traits = getEffectiveTraits(r, selectedSubrace);

    useEffect(() => {
        if (draft.basics.race && draft.basics.race !== selected) {
            setSelected(draft.basics.race);
        }
    }, [draft.basics.race]);
    function pickRace(key: string) {
        if (key !== draft.basics.race) {
            setBasics({ race: key, subrace: undefined });

            // сбрасываем локальное состояние подрасы
            setSubraceState(undefined);

            // очищаем выборы для расы (все источники, начинающиеся с "race-")
            const allAbilitiesKeys = Object.keys(draft.chosen.abilities || {});
            const allSkillsKeys = Object.keys(draft.chosen.skills || {});
            const allToolsKeys = Object.keys(draft.chosen.tools || {});
            const allLanguagesKeys = Object.keys(draft.chosen.languages || {});
            const allSpellsKeys = Object.keys(draft.chosen.spells || {});
            
            const raceSources = [...allAbilitiesKeys, ...allSkillsKeys, ...allToolsKeys, ...allLanguagesKeys, ...allSpellsKeys]
                .filter(s => s.startsWith("race-"));
            const subraceSources = [...allAbilitiesKeys, ...allSkillsKeys, ...allToolsKeys, ...allLanguagesKeys, ...allSpellsKeys]
                .filter(s => s.startsWith("subrace-"));
            const ancestrySources = [...allAbilitiesKeys, ...allSkillsKeys, ...allToolsKeys, ...allLanguagesKeys, ...allSpellsKeys]
                .filter(s => s.startsWith("ancestry-"));
            
            // Очищаем все источники расы
            raceSources.forEach(source => {
                setChosenAbilities?.(source, []);
                setChosenSkills?.(source, []);
                setChosenTools?.(source, []);
                setChosenLanguages?.(source, []);
                setChosenSpells?.(source, []);
            });
            
            // Очищаем все источники подрасы
            subraceSources.forEach(source => {
                setChosenAbilities?.(source, []);
                setChosenSkills?.(source, []);
                setChosenTools?.(source, []);
                setChosenLanguages?.(source, []);
                setChosenSpells?.(source, []);
            });
            
            // Очищаем все источники наследия
            ancestrySources.forEach(source => {
                setChosenAbilities?.(source, []);
                setChosenSkills?.(source, []);
                setChosenTools?.(source, []);
                setChosenLanguages?.(source, []);
                setChosenSpells?.(source, []);
            });
            
            // Очищаем таланты расы, подрасы и наследия
            const allRaceFeats = (draft.chosen.feats || []).filter(feat => 
                feat.startsWith("race-") || feat.startsWith("subrace-") || feat.startsWith("ancestry-")
            );
            if (allRaceFeats.length > 0) {
                const remainingFeats = (draft.chosen.feats || []).filter(feat => 
                    !feat.startsWith("race-") && !feat.startsWith("subrace-") && !feat.startsWith("ancestry-")
                );
                setChosenFeats?.(remainingFeats);
            }

            Object.keys(draft.chosen.abilities).forEach((key) => {
                if (key.startsWith("feat:")) setChosenAbilities(key, []);
            });
            Object.keys(draft.chosen.skills).forEach((key) => {
                if (key.startsWith("feat:")) setChosenSkills(key, []);
            });
            Object.keys(draft.chosen.tools).forEach((key) => {
                if (key.startsWith("feat:")) setChosenTools(key, []);
            });
            Object.keys(draft.chosen.languages).forEach((key) => {
                if (key.startsWith("feat:")) setChosenLanguages(key, []);
            });
            Object.keys(draft.chosen.spells).forEach((key) => {
                if (key.startsWith("feat:")) setChosenSpells(key, []);
            });
        }
        setSelected(key);
    }

    const handleRemoveRace = () => {
        setIsRemoveModalOpen(true);
    };

    const confirmRemoveRace = () => {
        setBasics({ race: undefined, subrace: undefined });
        setSubraceState(undefined);
        setSelectedSubraceKey(null);
        setIsRemoveModalOpen(false);
    };

    const cancelRemoveRace = () => {
        setIsRemoveModalOpen(false);
    };

    function pickSubrace(subraceKey: string) {
        if (!r) return;

        // локальный UI-стейт (чтобы карточка подсветилась и т.п.)
        setSubraceState(subraceKey);

        // сохраняем только ключ подрасы в basics — все фиксированные эффекты берем
        // напрямую из r / r.subraces при рендере
        setBasics({ subrace: subraceKey });

        // --- очищаем выборные опции, связанные с подрасой/расой ---
        // используем optional chaining, чтобы не ломать, если какого-то сеттера нет
        // предполагаем, что у тебя есть "chosen"-сеттеры вида setChosenSkills(source, arr)
        setChosenSkills?.("subrace", []);
        setChosenTools?.("subrace", []);
        setChosenLanguages?.("subrace", []);
        setChosenSpells?.("subrace", []);

        // при смене подрасы логично тоже сбросить общерасовые выборы (если они существуют)

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

    //function exitToCharacters() {
    //    if (basics.name) {
    //        save();
    //    }
    //    nav("/characters");
    //}

    const raceInfo = draft.basics.race ? RACE_CATALOG.find(
        (c) => c.key.toLowerCase() === draft.basics.race?.toLowerCase()
    ) : null;

    const subraceObj = r.subraces?.find((s) => s.name === subrace);

    const subraceLangs =
        subraceObj?.traits
            ?.flatMap((t) =>
                t.choices
                    ?.filter((c) => c.type === "language")
                    .flatMap((c) => c.options || [])
            )
            .filter((lang): lang is string => !!lang && lang.trim() !== "") // фильтруем пустые
        || [];

    const knownLangs = [
        ...(r.languages || []),
        ...subraceLangs,
        ...(draft.chosen.languages?.race || []),
        ...(draft.chosen.languages?.subrace || []),
    ].filter((v, i, arr) => !!v && arr.indexOf(v) === i);


    return (
        <div className="container mx-auto py-10">
            <div className="mx-auto max-w-5xl relative">
                <StepArrows back={`/create/${id}/background`} next={`/create/${id}/abilities`} />
                {/* крестик в правом верхнем углу */}
                <ExitButton />

                {/* Шапка с именем и аватаркой */}
                <CharacterHeader />

                {/* Заголовок - показываем только до выбора расы */}
                {!draft.basics.race && (
                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold">Выбор расы</h1>
                        <p className="text-sm text-muted-foreground">
                            Выберите расу для вашего персонажа
                        </p>
                    </div>
                )}

                {/* Заголовок после выбора расы */}
                {draft.basics.race && (
                    <div className="mb-6">
                        <h1 className="text-base font-bold uppercase tracking-wider text-foreground mb-3 border-l-2 border-primary pl-2">
                            ВЫБОР РАСЫ
                        </h1>
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[...RACE_CATALOG]
                        .sort((a, b) =>
                            String(a.name || a.key).localeCompare(
                                String(b.name || b.key)
                            )
                        )
                        .map((race) => {
                            const isSelected = draft.basics.race === race.key;
                            
                            // Если раса выбрана, показываем только её
                            if (draft.basics.race && !isSelected) return null;
                            
                            return (
                                <button
                                    key={race.key}
                                    onClick={() => pickRace(race.key)}
                                    disabled={isSelected}
                                    className={`text-left rounded-xl border bg-card transition hover:shadow-md hover:scale-[1.01] relative min-h-[100px] ${isSelected
                                        ? "border-2 border-primary shadow-lg scale-[1.02] bg-gradient-to-b from-primary/5 to-transparent"
                                        : ""
                                        }`}
                                >
                                    <div className="flex items-center">
                                        {race.avatar && (
                                            <img
                                                src={race.avatar}
                                                alt={race.name || race.key}
                                                className="ml-2 h-24 w-24 object-cover rounded-md flex-shrink-0"
                                            />
                                        )}

                                        <div className="flex-1 pl-3 pr-2 py-4">
                                            <div className="flex items-center justify-between">
                                                <h3
                                                    className={`font-medium tracking-wide ${isSelected ? "text-primary font-bold" : ""
                                                        }`}
                                                >
                                                    {race.name || race.key}
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
                                    
                                    {/* Красный крестик для удаления */}
                                    {isSelected && (
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                handleRemoveRace();
                                            }}
                                            onMouseDown={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                            }}
                                            className="absolute right-2 bottom-2 p-1 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors cursor-pointer"
                                            title="Убрать расу"
                                        >
                                            <Icons.X className="w-4 h-4" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                </div>

                {/* Информация о выбранной расе */}
                {r && draft.basics.race && (
                    <Card className="mt-6 overflow-hidden border bg-card shadow-md">
                        <CardHeader className="border-b pb-3">
                            <CardTitle className="text-xl font-bold tracking-wide">{r.name || r.key}</CardTitle>

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
                                        <span><span className="font-medium">Языки: </span>
                                            {knownLangs.map((key) => getLanguageName(key)).join(", ")}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Черты (используем FeatureBlock как для классов) */}
                            {r.traits.length > 0 && (
                                <div>
                                    <h3 className="text-base font-bold uppercase tracking-wider text-foreground mb-3 border-l-2 border-primary pl-2">
                                        Черты
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        {r.traits?.map((trait, ti) => (
                                            <FeatureBlock
                                                key={`race-trait-${ti}`}
                                                name={trait.name}
                                                desc={trait.desc}
                                                source={`race-${draft.basics.race}-trait`}
                                                idx={ti}
                                                choices={trait.choices}
                                                textMaxHeight={100}
                                            />
                                        ))}
                                    </div>
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
                                        {getAvailableSpells(r.spells, draft.basics.level).map((rs, idx) => {
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

                                                                // оставшиеся выбранные, не относящиеся к этому available-набору


                                                                // выбрали — others + новый
                                                                setChosenSpells("race", [value]);

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
                                                const isSubraceSelected = subrace === subraceInfo.key;
                                                return (
                                                    <button
                                                        key={subraceInfo.key}
                                                        onClick={() => pickSubrace(subraceInfo.key)}
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
                            {subrace && r.subraces?.some((s) => s.key === subrace) && (
                                <div>
                                    <h3 className="text-base font-bold uppercase tracking-wider text-foreground mb-3 border-l-2 border-primary pl-2">
                                        Черты подрасы
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        {r.subraces.find((s) => s.key === subrace)?.traits?.map((trait, ti) => (
                                            <FeatureBlock
                                                key={`subrace-trait-${ti}`}
                                                name={trait.name}
                                                desc={trait.desc}

                                                source={`subrace-${subrace}-trait`}
                                                idx={ti}
                                                choices={trait.choices}
                                                textMaxHeight={100}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Заклинания подрасы */}
                            {subrace && r.subraces?.find((s) => s.key === subrace)?.spells && (
                                <div>
                                    <h3 className="text-base font-bold uppercase tracking-wider text-foreground mb-3 border-l-2 border-primary pl-2">Заклинания подрасы</h3>
                                    <div className="space-y-2 text-sm">
                                        {getAvailableSpells(r.subraces.find((s) => s.key === subrace)!.spells!, draft.basics.level).map((rs, idx) => {
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
                                                                <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs bg-muted/20">
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

                                                                // оставшиеся выбранные, не относящиеся к этому available-набору


                                                                // выбрали — others + новый
                                                                setChosenSpells("race", [value]);

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
                            {(draft.chosen.spells["race"]?.length || 0) + (draft.chosen.spells["subrace"]?.length || 0) > 0 && (
                                <div>
                                    <h3 className="text-base font-bold uppercase tracking-wider text-foreground mb-3 border-l-2 border-primary pl-2">
                                        Выбранные заклинания
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        {[...(draft.chosen.spells["race"] || []), ...(draft.chosen.spells["subrace"] || [])].map((key) => {
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
                                                const isSelected = subrace === ancestry.key;
                                                const DamageIcon = ancestry.breathWeapon ? getDamageIcon(ancestry.breathWeapon.damageType) : null;
                                                const damageText = getDamageForLevel(ancestry.breathWeapon?.damageByLevel, draft.basics.level || 1);

                                                return (
                                                    <button
                                                        key={ancestry.name}
                                                        onClick={() => pickSubrace(ancestry.key)}
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

            {/* Модальное окно удаления расы */}
            <RaceRemoveModal
                raceInfo={r}
                isOpen={isRemoveModalOpen}
                onClose={cancelRemoveRace}
                onConfirm={confirmRemoveRace}
            />
        </div>
    );
}
