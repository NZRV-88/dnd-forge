"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabaseClient";
import { Abilities, ABILITIES } from "@/data/abilities";
import { getAllCharacterData } from "@/utils/getAllCharacterData";
import type { RollResult } from "@/pages/create/Abilities"; 

/* ------------------------------------------------------
   Типы
------------------------------------------------------ */

export type HpMode = "fixed" | "roll";

export type AsiSelection = {
    mode: "asi" | "feat";
    s1?: keyof Abilities;
    s2?: keyof Abilities;
    feat?: string;
};

export type Basics = {
    name: string;
    race: string;
    subrace?: string;
    class: string;
    subclass: string;
    level: number;
    hpMode: HpMode;
    hpCurrent?: number;
    background: string;
    //backgroundBonuses?: Partial<Record<keyof Abilities, number>>;
    //backgroundSkills?: string[];
    //raceBonuses?: Partial<Record<keyof Abilities, number>>;
    alignment: string;
};

// Основной драфт персонажа
export type CharacterDraft = {
    id: string;
    basics: Basics;
    stats: Abilities;
    asi: Record<number, AsiSelection>;

    // Все выборы игрока (из рас, классов, фитов, подрас и т.п.)
    chosen: {
        abilities: Record<string, (keyof Abilities)[]>; // источник -> выбранные характеристики
        skills: Record<string, string[]>;               // источник -> выбранные навыки
        tools: Record<string, string[]>;
        languages: Record<string, string[]>;
        feats: string[];                                // выбранные фиты (ключи)
        spells: Record<string, string[]>;
    };
    abilitiesMode?: "array" | "roll" | "point-buy";
    rolls?: RollResult[];
};

// Тип контекста (API для использования в приложении)
export type CharacterContextType = {
    draft: CharacterDraft;
    // Обновление драфта
    setDraft: React.Dispatch<React.SetStateAction<CharacterDraft>>;

    // Финальные агрегированные данные (из getAllCharacterData)
    skills: string[];
    tools: string[];
    languages: string[];
    spells: string[];
    feats: string[];
    weapons: string[];
    armors: string[];
    savingThrows: string[];
    abilityBonuses: Partial<Record<keyof Abilities, number>>;
    speed?: number;
    initiativeBonus?: number;
    abilitiesMode?: string[];

    // Сеттеры для выбранных опций
    setChosenAbilities: (source: string, abilities: (keyof Abilities)[]) => void;
    removeChosenAbility: (source: string, abilities: (keyof Abilities)) => void;
    setChosenSkills: (source: string, skills: string[]) => void;
    removeChosenSkill: (source: string, skill: string) => void;

    setChosenTools: (source: string, tools: string[]) => void;
    removeChosenTool: (source: string, tool: string) => void;

    setChosenLanguages: (source: string, langs: string[]) => void;
    removeChosenLanguage: (source: string, lang: string) => void;

    setChosenSpells: (source: string, spells: string[]) => void;
    removeChosenSpell: (source: string, spell: string) => void;

    setChosenFeats: (featKey: string[]) => void;
    removeChosenFeat: (featKey: string) => void;

    // Сохранение/загрузка
    saveToSupabase: () => Promise<void>;
    loadFromSupabase: (id: string) => Promise<void>;

    // Прочее
    resetCharacter: () => void;
    setBasics: (updates: Partial<CharacterDraft["basics"]>) => void;
    setLevel: (level: number) => void;
    setSubclass: (subclass: string) => void;
    setBackground: (background: string | null) => void;
    setAbilitiesMode: (mode: "array" | "roll" | "point-buy") => void;
};

/* ------------------------------------------------------
   Значения по умолчанию
------------------------------------------------------ */
function useCharacterId() {
    // Пробуем взять ID персонажа из URL (если есть)
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

const urlId = useCharacterId();
const id = urlId || uuidv4();
const STORAGE_KEY = `character:${id}`;

// abilities подтягиваются из общего списка
const defaultStats: Abilities = ABILITIES.reduce(
    (acc, a) => ({ ...acc, [a.key]: 8 }),
    {}
) as Abilities;

const makeDefaultDraft = (): CharacterDraft => ({
    id,
    basics: {
        name: "",
        race: "",
        subrace: "",
        class: "",
        subclass: "",
        background: "",
        alignment: "",
        level: 1,
        hpMode: "fixed",
        hpCurrent: 0,
    },
    stats: defaultStats,
    asi: {},
    chosen: {
        abilities: {},
        skills: {},
        tools: {},
        languages: {},
        feats: [],
        spells: {},
    },
    abilitiesMode: "array",
    rolls: [],
});

/* ------------------------------------------------------
   Контекст
------------------------------------------------------ */

export const CharacterContext = createContext<CharacterContextType | undefined>(
    undefined
);

/* ------------------------------------------------------
   Провайдер
------------------------------------------------------ */


export function CharacterProvider({ children }: { children: React.ReactNode }) {
    const [draft, setDraft] = useState<CharacterDraft>(makeDefaultDraft());

    /* -----------------------------
       Автосохранение в localStorage
    ----------------------------- */
    useEffect(() => {
        const raw = localStorage.getItem("characterDraft");
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                setDraft({ ...makeDefaultDraft(), ...parsed });
            } catch (e) {
                console.warn("Ошибка загрузки драфта из localStorage", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("characterDraft", JSON.stringify(draft));
    }, [draft]);

    const resetCharacter = () => {
        setDraft(makeDefaultDraft());
        try {
            localStorage.removeItem("characterDraft");
        } catch {
            // noop
        }
    };

    const setBasics = (updates: Partial<CharacterDraft["basics"]>) =>
        setDraft(d => ({ ...d, basics: { ...d.basics, ...updates } }));

    const setLevel = (level: number) =>
        setBasics({ level });

    const setSubclass = (subclass: string) =>
        setBasics({ subclass });

    const setBackground = (background: string | null) => {
        setDraft((d) => ({
            ...d,
            basics: {
                ...d.basics,
                background,
            },
        }));
    };

    /* -----------------------------
       Сеттеры для chosen.*
    ----------------------------- */

    const setChosenAbilities = (source: string, abilities: (keyof Abilities)[]) =>
        setDraft(d => ({
            ...d,
            chosen: { ...d.chosen, abilities: { ...d.chosen.abilities, [source]: abilities } },
        }));


    const removeChosenAbility = (source: string, ability: (keyof Abilities)) =>
        setDraft(d => ({
            ...d,
            chosen: {
                ...d.chosen,
                abilities: {
                    ...d.chosen.abilities,
                    [source]: (d.chosen.abilities[source] || []).filter(s => s !== ability),
                },
            },
        }));

    const setChosenSkills = (source: string, skills: string[]) =>
        setDraft(d => ({
            ...d,
            chosen: { ...d.chosen, skills: { ...d.chosen.skills, [source]: skills } },
        }));

    const removeChosenSkill = (source: string, skill: string) =>
        setDraft(d => ({
            ...d,
            chosen: {
                ...d.chosen,
                skills: {
                    ...d.chosen.skills,
                    [source]: (d.chosen.skills[source] || []).filter(s => s !== skill),
                },
            },
        }));

    const setChosenTools = (source: string, tools: string[]) =>
        setDraft(d => ({
            ...d,
            chosen: { ...d.chosen, tools: { ...d.chosen.tools, [source]: tools } },
        }));

    const removeChosenTool = (source: string, tool: string) =>
        setDraft(d => ({
            ...d,
            chosen: {
                ...d.chosen,
                tools: {
                    ...d.chosen.tools,
                    [source]: (d.chosen.tools[source] || []).filter(t => t !== tool),
                },
            },
        }));

    const setChosenLanguages = (source: string, langs: string[]) =>
        setDraft(d => ({
            ...d,
            chosen: { ...d.chosen, languages: { ...d.chosen.languages, [source]: langs } },
        }));

    const removeChosenLanguage = (source: string, lang: string) =>
        setDraft(d => ({
            ...d,
            chosen: {
                ...d.chosen,
                languages: {
                    ...d.chosen.languages,
                    [source]: (d.chosen.languages[source] || []).filter(l => l !== lang),
                },
            },
        }));

    const setChosenSpells = (source: string, spells: string[]) =>
        setDraft(d => ({
            ...d,
            chosen: { ...d.chosen, spells: { ...d.chosen.spells, [source]: spells } },
        }));

    const removeChosenSpell = (source: string, spell: string) =>
        setDraft(d => ({
            ...d,
            chosen: {
                ...d.chosen,
                spells: {
                    ...d.chosen.spells,
                    [source]: (d.chosen.spells[source] || []).filter(s => s !== spell),
                },
            },
        }));

    const setChosenFeats = (feats: string[]) =>
        setDraft(d => ({
            ...d,
            chosen: {
                ...d.chosen,
                feats,
            },
        }));

    const removeChosenFeat = (featKey: string) =>
        setDraft(d => ({
            ...d,
            chosen: { ...d.chosen, feats: d.chosen.feats.filter(f => f !== featKey) },
        }));

    const setAbilitiesMode = (newMode: "array" | "roll" | "point-buy") => {
        setDraft((d) => ({ ...d, abilitiesMode: newMode }));
    };

    /* -----------------------------
       Вычисляемые данные
       (пока просто выбранные; позже
       можно добавить fixed из race/class)
    ----------------------------- */

    const aggregated = useMemo(() => getAllCharacterData(draft), [draft]);

    /* -----------------------------
       Работа с Supabase
    ----------------------------- */

    const saveToSupabase = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        console.log("Сохраняем в Supabase draft:", draft);
        const { error } = await supabase.from("characters").upsert({
            id: draft.id,
            user_id: user.id,
            data: draft,
            updated_at: new Date(),
        });

        if (error) console.error("Ошибка сохранения в Supabase:", error);
    };

    const loadFromSupabase = async (id: string) => {
        const { data, error } = await supabase
            .from("characters")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            console.error("Ошибка загрузки из Supabase:", error);
            return;
        }

        if (data) {
            // достаём draft из JSON-поля data
            const savedDraft = data.data;

            // мержим с дефолтами, чтобы не поломались старые персонажи
            setDraft({
                ...makeDefaultDraft(),
                ...savedDraft,
                basics: { ...makeDefaultDraft().basics, ...savedDraft.basics },
                chosen: { ...makeDefaultDraft().chosen, ...savedDraft.chosen },
            });
        }
    };

    /* -----------------------------
       Контекст
    ----------------------------- */

    const api: CharacterContextType = {
        draft,
        setDraft,
        ...aggregated,

        setChosenAbilities,
        removeChosenAbility,
        setChosenSkills,
        removeChosenSkill,
        setChosenTools,
        removeChosenTool,
        setChosenLanguages,
        removeChosenLanguage,
        setChosenSpells,
        removeChosenSpell,
        setChosenFeats,
        removeChosenFeat,

        saveToSupabase,
        loadFromSupabase,

        resetCharacter,
        setBasics,
        setLevel,
        setSubclass,
        setBackground,

        setAbilitiesMode,
    };

    return (
        <CharacterContext.Provider value={api}>
            {children}
        </CharacterContext.Provider>
    );
}

/* ------------------------------------------------------
   Хук для удобного доступа
------------------------------------------------------ */

export const useCharacter = () => {
    const ctx = useContext(CharacterContext);
    if (!ctx) throw new Error("useCharacter must be used within CharacterProvider");
    return ctx;
};


