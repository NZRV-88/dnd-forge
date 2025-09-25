// character.tsx
import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useDebouncedCallback } from "use-debounce"; // npm install use-debounce
import { z } from "zod"; // npm install zod

/** === Типы === */

export type HpMode = "fixed" | "roll";

export type Abilities = {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
};

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
    backgroundBonuses?: Partial<Record<keyof Abilities, number>>;
    backgroundSkills?: string[];
    raceBonuses?: Partial<Record<keyof Abilities, number>>;
    alignment: string;
};

// === Валидация данных ===
// Простая проверка структуры объекта
function isValidDraft(obj: any): obj is CharacterDraft {
    if (!obj || typeof obj !== "object") return false;

    // минимальный набор обязательных полей
    if (typeof obj.id !== "string") return false;
    if (!obj.basics || typeof obj.basics !== "object") return false;
    if (typeof obj.basics.name !== "string") return false;
    if (typeof obj.basics.race !== "string") return false;
    if (typeof obj.basics.class !== "string") return false;
    if (typeof obj.basics.background !== "string") return false;

    if (!obj.stats || typeof obj.stats !== "object") return false;
    for (const key of ["str", "dex", "con", "int", "wis", "cha"]) {
        if (typeof obj.stats[key] !== "number") return false;
    }

    // массивы должны быть массивами
    for (const arrKey of ["spells", "languages", "skills", "feats", "tools"]) {
        if (!Array.isArray(obj[arrKey])) return false;
    }

    return true;
}

export type CharacterDraft = {
    id: string;
    basics: Basics;
    stats: Abilities;
    asi: Record<number, AsiSelection>;
    spells: string[];
    languages: string[];
    skills: string[];
    feats: string[];
    tools: string[];
    speed?: number;
    initiativeBonus?: number;
    raceAbilityChoice?: Record<string, keyof Abilities>;
    featAbilityChoice?: Record<string, keyof Abilities>;
};

export type CharacterContextType = {
    id: string;
    basics: Basics;
    stats: Abilities;
    asi: Record<number, AsiSelection>;
    spells: string[];
    languages: string[];
    skills: string[];
    tools: string[];
    feats: string[];
    draft: CharacterDraft;
    featAbilityChoice?: Record<string, keyof Abilities>;
    raceAbilityChoice?: Record<string, keyof Abilities>;
    // setters
    setBasics: (patch: Partial<Basics>) => void;
    setName: (name: string) => void;
    setHpMode: (mode: HpMode) => void;
    setStat: (key: keyof Abilities, value: number) => void;
    choose: (patch: Partial<Basics>) => void;
    setLevel: (level: number) => void;
    setSubclass: (subclass: string) => void;
    setAsiMode: (level: number, mode: AsiSelection["mode"]) => void;
    setAsiStats: (level: number, s1?: keyof Abilities, s2?: keyof Abilities) => void;
    setAsiFeat: (level: number, feat?: string) => void;
    setRace: (race: string, subrace?: string, bonuses?: Partial<Record<keyof Abilities, number>>) => void;
    setSubrace: (subrace: string, bonuses?: Partial<Record<keyof Abilities, number>>) => void;
    clearRaceBonuses: () => void;
    setBackgroundBonuses: (bonuses: Partial<Record<keyof Abilities, number>>) => void;
    setBackgroundSkills: (skills: string[]) => void;
    addSpell: (key: string) => void;
    removeSpell: (key: string) => void;
    setSpells: (keys: string[]) => void;
    addLanguage: (key: string) => void;
    removeLanguage: (key: string) => void;
    setLanguages: (keys: string[]) => void;
    addSkill: (key: string) => void;
    removeSkill: (key: string) => void;
    setSkills: (keys: string[]) => void;
    addTool: (key: string) => void;
    removeTool: (key: string) => void;
    setTools: (keys: string[]) => void;
    addFeat: (key: string) => void;
    removeFeat: (key: string) => void;
    setFeats: (keys: string[]) => void;
    setFeatAbilityChoice: (featKey: string, ability: keyof Abilities) => void;
    clearFeatAbilityChoices: () => void;
    setRaceAbilityChoice: (choiceKey: string, ability: keyof Abilities) => void;
    removeRaceAbilityChoice: (choiceKey: string) => void;
    clearRaceAbilityChoices: () => void;
    resetCharacter: () => void;
    save: () => void;
    saveToSupabase: () => Promise<void>;
    loadFromSupabase: (id: string) => Promise<boolean>;
    totalAbilityBonuses: Partial<Record<keyof Abilities, number>>;
};

const CharacterContext = createContext<CharacterContextType | null>(null);

export function CharacterProvider({ children }: { children: React.ReactNode }) {
    const urlId = useCharacterId();
    const id = urlId || uuidv4();
    const STORAGE_KEY = `character:${id}`;

    const defaultDraft: CharacterDraft = {
        id,
        basics: {
            name: "",
            race: "gnome",
            class: "fighter",
            background: "entertainer",
            backgroundBonuses: {},
            backgroundSkills: [],
            raceBonuses: {},
            alignment: "chaotic-good",
            level: 1,
            subclass: "",
            hpMode: "fixed",
            hpCurrent: 0,
        },
        stats: {
            str: 15,
            dex: 14,
            con: 12,
            int: 12,
            wis: 10,
            cha: 8,
        },
        speed: 30,
        asi: {},
        spells: [],
        languages: [],
        skills: [],
        feats: [],
        tools: [],
        raceAbilityChoice: {},
        featAbilityChoice: {},
    };

    const [draft, setDraft] = useState<CharacterDraft>(defaultDraft);

    useEffect(() => {
        if (typeof window === "undefined") return; // защита от SSR

        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (!raw) return;

            const parsed = JSON.parse(raw);

            if (isValidDraft(parsed)) {
                // если всё ок — мёрджим с дефолтным, чтобы были все ключи
                setDraft({ ...defaultDraft, ...parsed });
            } else {
                console.warn("Невалидные данные в localStorage → сброс на defaultDraft");
            }
        } catch (e) {
            console.error("Ошибка при чтении localStorage:", e);
        }
    }, [STORAGE_KEY]);

    function cleanupOldCharacters(currentId: string) {
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith("character:") && key !== `character:${currentId}`) {
                    localStorage.removeItem(key);
                }
            }
        } catch (e) {
            console.error("Ошибка очистки localStorage:", e);
        }
    }

    const saveToLocalStorage = useDebouncedCallback((draft: CharacterDraft) => {
        try {
            const json = JSON.stringify(draft);

            if (json.length > 200_000) { // ограничение размера
                console.warn("Слишком большой объект для localStorage, пропуск сохранения");
                return;
            }

            localStorage.setItem(STORAGE_KEY, json);
        } catch (e) {
            console.error("Ошибка сохранения в localStorage:", e);
        }
    }, 500); // задержка 500 мс

    // авто-сохранение в localStorage
    useEffect(() => {
        if (typeof window === "undefined") return;
        cleanupOldCharacters(draft.id);
        saveToLocalStorage(draft);
    }, [draft, STORAGE_KEY, saveToLocalStorage]);

    // при заходе на страницу с id подгружаем из Supabase
    useEffect(() => {
        if (urlId) {
            loadFromSupabase(urlId);
        }
    }, [urlId]);

    /* ------------ setters ------------ */
    const setBasics = (patch: Partial<Basics>) =>
        setDraft((d) => ({ ...d, basics: { ...d.basics, ...patch } }));
    const setName = (name: string) => setBasics({ name });
    const setHpMode = (mode: HpMode) => setBasics({ hpMode: mode });
    const setStat = (key: keyof Abilities, value: number) =>
        setDraft((d) => ({ ...d, stats: { ...d.stats, [key]: value } }));
    const choose = (patch: Partial<Basics>) => setBasics(patch);
    const setLevel = (level: number) => setBasics({ level });
    const setSubclass = (subclass: string) => setBasics({ subclass });

    // ASI
    const setAsiMode = (level: number, mode: AsiSelection["mode"]) =>
        setDraft((d) => {
            const prev = d.asi || {};
            const prevLevel = prev[level] || {};
            return { ...d, asi: { ...prev, [level]: { ...prevLevel, mode } } };
        });
    const setAsiStats = (level: number, s1?: keyof Abilities, s2?: keyof Abilities) =>
        setDraft((d) => {
            const prev = d.asi || {};
            const prevLevel = prev[level] || { mode: "asi" };
            return { ...d, asi: { ...prev, [level]: { ...prevLevel, mode: "asi", s1, s2 } } };
        });
    const setAsiFeat = (level: number, feat?: string) =>
        setDraft((d) => {
            const prev = d.asi || {};
            const prevLevel = prev[level] || { mode: "feat" };
            return { ...d, asi: { ...prev, [level]: { ...prevLevel, mode: "feat", feat } } };
        });

    // Race / subrace
    const setRace = (race: string, subrace?: string, bonuses?: Partial<Record<keyof Abilities, number>>) =>
        setDraft((d) => ({ ...d, basics: { ...d.basics, race, subrace, raceBonuses: bonuses || {} } }));
    const setSubrace = (subrace: string, bonuses?: Partial<Record<keyof Abilities, number>>) =>
        setDraft((d) => ({ ...d, basics: { ...d.basics, subrace, raceBonuses: bonuses ? { ...(d.basics.raceBonuses || {}), ...bonuses } : d.basics.raceBonuses } }));
    const clearRaceBonuses = () => setDraft((d) => ({ ...d, basics: { ...d.basics, raceBonuses: {} } }));

    const setBackgroundBonuses = (bonuses: Partial<Record<keyof Abilities, number>>) =>
        setDraft((d) => ({ ...d, basics: { ...d.basics, backgroundBonuses: { ...(d.basics.backgroundBonuses || {}), ...bonuses } } }));
    const setBackgroundSkills = (skills: string[]) =>
        setDraft((d) => ({ ...d, basics: { ...d.basics, backgroundSkills: skills } }));

    // Spells / languages / skills / tools
    const addSpell = (key: string) =>
        setDraft((d) => ({ ...d, spells: d.spells.includes(key) ? d.spells : [...d.spells, key] }));
    const removeSpell = (key: string) =>
        setDraft((d) => ({ ...d, spells: d.spells.filter((s) => s !== key) }));
    const setSpells = (keys: string[]) => setDraft((d) => ({ ...d, spells: [...keys] }));

    const addLanguage = (key: string) =>
        setDraft((d) => ({ ...d, languages: d.languages.includes(key) ? d.languages : [...d.languages, key] }));
    const removeLanguage = (key: string) =>
        setDraft((d) => ({ ...d, languages: d.languages.filter((l) => l !== key) }));
    const setLanguages = (keys: string[]) => setDraft((d) => ({ ...d, languages: [...keys] }));

    const addSkill = (key: string) =>
        setDraft((d) => ({ ...d, skills: d.skills.includes(key) ? d.skills : [...d.skills, key] }));
    const removeSkill = (key: string) =>
        setDraft((d) => ({ ...d, skills: d.skills.filter((s) => s !== key) }));
    const setSkills = (keys: string[]) => setDraft((d) => ({ ...d, skills: [...keys] }));

    const addTool = (key: string) =>
        setDraft((d) => ({ ...d, tools: d.tools.includes(key) ? d.tools : [...d.tools, key] }));
    const removeTool = (key: string) =>
        setDraft((d) => ({ ...d, tools: d.tools.filter((t) => t !== key) }));
    const setTools = (keys: string[]) => setDraft((d) => ({ ...d, tools: [...keys] }));

    const addFeat = (key: string) =>
        setDraft((d) => ({ ...d, feats: d.feats.includes(key) ? d.feats : [...d.feats, key] }));
    const removeFeat = (key: string) =>
        setDraft((d) => ({ ...d, feats: d.feats.filter((f) => f !== key) }));
    const setFeats = (keys: string[]) => setDraft((d) => ({ ...d, feats: [...keys] }));

    const setFeatAbilityChoice = (featKey: string, ability: keyof Abilities) =>
        setDraft((d) => ({ ...d, featAbilityChoice: { ...(d.featAbilityChoice || {}), [featKey]: ability } }));
    const clearFeatAbilityChoices = () => setDraft((d) => ({ ...d, featAbilityChoice: {} }));

    const setRaceAbilityChoice = (choiceKey: string, ability: keyof Abilities) =>
        setDraft((d) => ({ ...d, raceAbilityChoice: { ...(d.raceAbilityChoice || {}), [choiceKey]: ability } }));
    const removeRaceAbilityChoice = (choiceKey: string) =>
        setDraft((d) => {
            const updated = { ...(d.raceAbilityChoice || {}) };
            delete updated[choiceKey];
            return { ...d, raceAbilityChoice: updated };
        });
    const clearRaceAbilityChoices = () => setDraft((d) => ({ ...d, raceAbilityChoice: {} }));

    /* ------------ Supabase ------------ */
    const loadFromSupabase = async (id: string) => {
        const { data, error } = await supabase
            .from("characters")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            console.error("Ошибка загрузки из Supabase:", error);
            return false;
        }

        if (data?.data) {
            setDraft(data.data as CharacterDraft);
        }
        return true;
    };

    const saveToSupabase = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from("characters").upsert({
            id: draft.id,
            user_id: user.id,
            data: draft,
            updated_at: new Date(),
        });

        if (error) console.error("Ошибка сохранения в Supabase:", error);
    };

    const resetCharacter = () => {
        setDraft({ ...defaultDraft, id });
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch { }
    };

    const save = () => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
        } catch (e) {
            console.error("save error", e);
        }
    };

    /* ------------ агрегат бонусов ------------ */
    const totalAbilityBonuses = useMemo(() => {
        const out: Partial<Record<keyof Abilities, number>> = {};
        const raceBon = draft.basics?.raceBonuses || {};
        for (const [k, v] of Object.entries(raceBon)) {
            out[k as keyof Abilities] = (out[k as keyof Abilities] || 0) + (Number(v) || 0);
        }
        const bgBon = draft.basics?.backgroundBonuses || {};
        for (const [k, v] of Object.entries(bgBon)) {
            out[k as keyof Abilities] = (out[k as keyof Abilities] || 0) + (Number(v) || 0);
        }
        for (const ability of Object.values(draft.raceAbilityChoice || {})) {
            out[ability] = (out[ability] || 0) + 1;
        }
        for (const ability of Object.values(draft.featAbilityChoice || {})) {
            out[ability] = (out[ability] || 0) + 1;
        }
        for (const entry of Object.values(draft.asi || {})) {
            if (entry.mode === "asi") {
                if (entry.s1) out[entry.s1] = (out[entry.s1] || 0) + 1;
                if (entry.s2) out[entry.s2] = (out[entry.s2] || 0) + 1;
            }
        }
        return out;
    }, [draft]);

    const api: CharacterContextType = useMemo(
        () => ({
            id,
            basics: draft.basics,
            stats: draft.stats,
            asi: draft.asi,
            spells: draft.spells,
            languages: draft.languages,
            skills: draft.skills,
            tools: draft.tools,
            feats: draft.feats,
            draft,
            featAbilityChoice: draft.featAbilityChoice,
            raceAbilityChoice: draft.raceAbilityChoice,
            setBasics,
            setName,
            setHpMode,
            setStat,
            choose,
            setLevel,
            setSubclass,
            setAsiMode,
            setAsiStats,
            setAsiFeat,
            setRace,
            setSubrace,
            clearRaceBonuses,
            setBackgroundBonuses,
            setBackgroundSkills,
            addSpell,
            removeSpell,
            setSpells,
            addLanguage,
            removeLanguage,
            setLanguages,
            addSkill,
            removeSkill,
            setSkills,
            addTool,
            removeTool,
            setTools,
            addFeat,
            removeFeat,
            setFeats,
            setFeatAbilityChoice,
            clearFeatAbilityChoices,
            setRaceAbilityChoice,
            removeRaceAbilityChoice,
            clearRaceAbilityChoices,
            resetCharacter,
            save,
            saveToSupabase,
            loadFromSupabase,
            totalAbilityBonuses,
        }),
        [draft, totalAbilityBonuses]
    );

    return (
        <CharacterContext.Provider value={api}>{children}</CharacterContext.Provider>
    );
}

export function useCharacter(): CharacterContextType {
    const ctx = useContext(CharacterContext);
    if (!ctx) throw new Error("useCharacter must be used within a CharacterProvider");
    return ctx;
}

export function useCharacterId(): string | undefined {
    const { id } = useParams<{ id: string }>();
    return id;
}

export async function saveCharacterToSupabase(character: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Не авторизован");

    const { data, error } = await supabase
        .from("characters")
        .upsert({
            id: character.id,
            user_id: user.id,
            data: character,
            updated_at: new Date(),
        })
        .select()
        .maybeSingle();


    if (error) throw error;
    return data;
}

export function hasSpellcasting(character: CharacterDraft): boolean {
    return character.spells.length > 0;
}
