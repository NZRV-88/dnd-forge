"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabaseClient";
import { Abilities, ABILITIES } from "@/data/abilities";
import { getAllCharacterData } from "@/utils/getAllCharacterData";
import { getFixedBackgroundData } from "@/utils/getFixedBackgroundData";
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
    equipment?: string[];
    gold?: number;
    isStartEquipmentAdded?: boolean;
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
    avatar?: string | null;

    // Все выборы игрока (из рас, классов, фитов, подрас и т.п.)
    chosen: {
        abilities: Record<string, (keyof Abilities)[]>; // источник -> выбранные характеристики
        skills: Record<string, string[]>;               // источник -> выбранные навыки
        tools: Record<string, string[]>;
        toolProficiencies: Record<string, string[]>;    // источник -> выбранные владения инструментами
        languages: Record<string, string[]>;
        feats: string[];                                // выбранные фиты (ключи)
        spells: Record<string, string[]>;
        features: Record<string, string[]>;
        fightingStyle?: Record<string, string[]>;
    };
    abilitiesMode?: "array" | "roll" | "point-buy";
    rolls?: RollResult[];
    // Броски кости хитов за уровни, начиная со 2-го уровня: hpRolls[0] -> уровень 2
    hpRolls?: number[];
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
    setChosenToolProficiencies: (source: string, toolProficiencies: string[]) => void;
    removeChosenToolProficiency: (source: string, toolProficiency: string) => void;

    setChosenLanguages: (source: string, langs: string[]) => void;
    removeChosenLanguage: (source: string, lang: string) => void;

    setChosenSpells: (source: string, spells: string[]) => void;
    removeChosenSpell: (source: string, spell: string) => void;

    setChosenFeats: (featKey: string[]) => void;
    removeChosenFeat: (featKey: string) => void;

    setChosenFeatures: (source: string, features: string[]) => void;
    removeChosenFeature: (source: string, feature: string) => void;

    setChosenFightingStyle: (source: string, styleKey: string[]) => void;

    // Сохранение/загрузка
    saveToSupabase: () => Promise<void>;
    loadFromSupabase: (id: string) => Promise<void>;
    createNewCharacter: (id: string) => Promise<void>;
    initNewCharacter: () => void;
    isLoading: boolean;

    // Прочее
    resetCharacter: () => void;
    setBasics: (updates: Partial<CharacterDraft["basics"]>) => void;
    setLevel: (level: number) => void;
    setSubclass: (subclass: string) => void;
    setBackground: (background: string | null) => void;
    setAbilitiesMode: (mode: "array" | "roll" | "point-buy") => void;
    // Работа с бросками кости хитов
    setHpRollAtLevel: (level: number, value: number | null) => void; // level >= 2
    resetHpRolls: () => void;
    
    // Очистка выборов класса
    clearClassChoices: () => void;
};

/* ------------------------------------------------------
   Значения по умолчанию
------------------------------------------------------ */

// abilities подтягиваются из общего списка
const defaultStats: Abilities = ABILITIES.reduce(
    (acc, a) => ({ ...acc, [a.key]: 8 }),
    {}
) as Abilities;

const makeDefaultDraft = (id?: string): CharacterDraft => ({
    id: id || uuidv4(),
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
        equipment: [],
        gold: 0,
        isStartEquipmentAdded: false,
    },
    stats: defaultStats,
    asi: {},
    chosen: {
        abilities: {},
        skills: {},
        tools: {},
        toolProficiencies: {},
        languages: {},
        feats: [],
        spells: {},
        features: {},
        fightingStyle: {},
    },
    abilitiesMode: "array",
    rolls: [],
    hpRolls: [],
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
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);

    // Инициализация провайдера
    useEffect(() => {
        setIsLoading(false);
        setIsInitialized(true);
    }, []);

    // Функция миграции старых ключей в новые
    const migrateOldKeys = useCallback((chosen: any) => {
        const migrated = { ...chosen };
        
        // Мигрируем ключи для всех типов выборов
        ['abilities', 'skills', 'tools', 'languages', 'spells', 'features', 'fightingStyle'].forEach(type => {
            if (migrated[type]) {
                const newTypeData: any = {};
                
                Object.entries(migrated[type]).forEach(([key, value]) => {
                    // Если ключ в старом формате (без уровня), добавляем 'base'
                    if (key.match(/^(race|subrace|class|subclass)-\d+$/)) {
                        const newKey = key.replace(/(race|subrace|class|subclass)-(\d+)$/, '$1-base-$2');
                        newTypeData[newKey] = value;
                    } else if (key.match(/^(race|subrace|class|subclass)-\d+-\d+-[a-z0-9]+-[a-z0-9]+$/)) {
                        // Если ключ в новом формате, но без уровня в начале, добавляем 'base'
                        const newKey = key.replace(/^(race|subrace|class|subclass)-(\d+)-(\d+)-([a-z0-9]+)-([a-z0-9]+)$/, '$1-base-$2-$3-$4-$5');
                        newTypeData[newKey] = value;
                    } else {
                        // Оставляем ключ как есть, если он уже в правильном формате
                        newTypeData[key] = value;
                    }
                });
                
                migrated[type] = newTypeData;
            }
        });
        
        return migrated;
    }, []);

    /* -----------------------------
       Автосохранение в localStorage
    ----------------------------- */
    useEffect(() => {
        const raw = localStorage.getItem("characterDraft");
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                // Временно отключаем миграцию
                setDraft({ 
                    ...makeDefaultDraft(), 
                    ...parsed,
                    chosen: { ...makeDefaultDraft().chosen, ...parsed.chosen }
                });
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
        setIsLoading(false);
        try {
            localStorage.removeItem("characterDraft");
        } catch {
            // noop
        }
    };

    const initNewCharacter = () => {
        const newDraft = makeDefaultDraft();
        setDraft(newDraft);
        setIsLoading(false);
        // Не удаляем localStorage, чтобы сохранить данные пользователя
    };

    const setBasics = (updates: Partial<CharacterDraft["basics"]>) =>
        setDraft(d => ({ ...d, basics: { ...d.basics, ...updates } }));

    const setLevel = (level: number) =>
        setBasics({ level });

    const setSubclass = (subclass: string) =>
        setBasics({ subclass });

    const setBackground = (background: string | null) => {
        setDraft((d) => {
            // Получаем навыки новой предыстории
            const newBackgroundSkills: string[] = [];
            if (background) {
                const bgData = getFixedBackgroundData(background);
                newBackgroundSkills.push(...bgData.proficiencies.skills);
            }

            // Очищаем конфликтующие навыки из chosen.skills
            const newChosenSkills = { ...d.chosen.skills };
            for (const [source, skills] of Object.entries(newChosenSkills)) {
                // Фильтруем навыки, удаляя те, что конфликтуют с предыстор ией
                const filtered = skills.map(skill => 
                    newBackgroundSkills.includes(skill) ? "" : skill
                );
                newChosenSkills[source] = filtered;
            }

            return {
                ...d,
                basics: {
                    ...d.basics,
                    background,
                },
                chosen: {
                    ...d.chosen,
                    skills: newChosenSkills,
                },
            };
        });
    };

    // ---- HP Rolls helpers ----
    const setHpRollAtLevel = (level: number, value: number | null) => {
        if (level < 2) return;
        setDraft((d) => {
            const next = [...(d.hpRolls || [])];
            const idx = level - 2;
            while (next.length <= idx) next.push(0);
            next[idx] = value === null ? 0 : value;
            return { ...d, hpRolls: next };
        });
        
        // Автоматически сохраняем в БД при изменении бросков
        if (draft.id) {
            saveToSupabase().catch(console.error);
        }
    };

    const resetHpRolls = () => {
        setDraft((d) => ({ ...d, hpRolls: [] }));
        
        // Автоматически сохраняем в БД при сбросе бросков
        if (draft.id) {
            saveToSupabase().catch(console.error);
        }
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

    const setChosenToolProficiencies = (source: string, toolProficiencies: string[]) =>
        setDraft(d => ({
            ...d,
            chosen: { ...d.chosen, toolProficiencies: { ...d.chosen.toolProficiencies, [source]: toolProficiencies } },
        }));

    const removeChosenToolProficiency = (source: string, toolProficiency: string) =>
        setDraft(d => ({
            ...d,
            chosen: {
                ...d.chosen,
                toolProficiencies: {
                    ...d.chosen.toolProficiencies,
                    [source]: (d.chosen.toolProficiencies[source] || []).filter(t => t !== toolProficiency),
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

    const setChosenFeatures = (source: string, features: string[]) =>
        setDraft(d => ({
            ...d,
            chosen: { ...d.chosen, features: { ...d.chosen.features, [source]: features } },
        }));

    const removeChosenFeature = (source: string, feature: string) =>
        setDraft(d => ({
            ...d,
            chosen: {
                ...d.chosen,
                features: {
                    ...d.chosen.features,
                    [source]: (d.chosen.features[source] || []).filter(f => f !== feature),
                },
            },
        }));

    const setChosenFightingStyle = (source: string, styleKey: string[]) =>
        setDraft(d => ({
            ...d,
            chosen: {
                ...d.chosen,
                fightingStyle: { ...d.chosen.fightingStyle, [source]: styleKey }
            }
        }));

    const clearClassChoices = () => {
        setDraft(d => {
            const newChosen = { ...d.chosen };
            const newAsi = { ...d.asi };
            
            // Очищаем все выборы, связанные с классом и подклассом
            // Ключи имеют формат: {class}-{level}-{featureIndex}- или class-{class}-{level}-{featureIndex}-
            const currentClass = d.basics.class;
            const currentSubclass = d.basics.subclass;
            
            Object.keys(newChosen.abilities).forEach(key => {
                if (key.startsWith(`${currentClass}-`) || key.startsWith(`${currentSubclass}-`) || 
                    key.startsWith('class-') || key.startsWith('subclass-')) {
                    delete newChosen.abilities[key];
                }
            });
            Object.keys(newChosen.skills).forEach(key => {
                if (key.startsWith(`${currentClass}-`) || key.startsWith(`${currentSubclass}-`) || 
                    key.startsWith('class-') || key.startsWith('subclass-')) {
                    delete newChosen.skills[key];
                }
            });
            Object.keys(newChosen.tools).forEach(key => {
                if (key.startsWith(`${currentClass}-`) || key.startsWith(`${currentSubclass}-`) || 
                    key.startsWith('class-') || key.startsWith('subclass-')) {
                    delete newChosen.tools[key];
                }
            });
            Object.keys(newChosen.toolProficiencies).forEach(key => {
                if (key.startsWith(`${currentClass}-`) || key.startsWith(`${currentSubclass}-`) || 
                    key.startsWith('class-') || key.startsWith('subclass-')) {
                    delete newChosen.toolProficiencies[key];
                }
            });
            Object.keys(newChosen.languages).forEach(key => {
                if (key.startsWith(`${currentClass}-`) || key.startsWith(`${currentSubclass}-`) || 
                    key.startsWith('class-') || key.startsWith('subclass-')) {
                    delete newChosen.languages[key];
                }
            });
            Object.keys(newChosen.spells).forEach(key => {
                if (key.startsWith(`${currentClass}-`) || key.startsWith(`${currentSubclass}-`) || 
                    key.startsWith('class-') || key.startsWith('subclass-')) {
                    delete newChosen.spells[key];
                }
            });
            Object.keys(newChosen.features).forEach(key => {
                if (key.startsWith(`${currentClass}-`) || key.startsWith(`${currentSubclass}-`) || 
                    key.startsWith('class-') || key.startsWith('subclass-')) {
                    delete newChosen.features[key];
                }
            });
            if (newChosen.fightingStyle) {
                Object.keys(newChosen.fightingStyle).forEach(key => {
                    if (key.startsWith(`${currentClass}-`) || key.startsWith(`${currentSubclass}-`) || 
                        key.startsWith('class-') || key.startsWith('subclass-')) {
                        delete newChosen.fightingStyle![key];
                    }
                });
            }
            
            // Очищаем фиты, связанные с классом
            // Фиты могут иметь формат: class-{class}-{level}-{featureIndex}:{featKey} или {class}-{level}-{featureIndex}:{featKey}
            const originalFeats = [...newChosen.feats];
            newChosen.feats = newChosen.feats.filter(f => {
                const sourceKey = f.split(':')[0];
                const shouldKeep = !sourceKey.startsWith('class-') && 
                                  !sourceKey.startsWith('subclass-') && 
                                  !sourceKey.startsWith(`${currentClass}-`) && 
                                  !sourceKey.startsWith(`${currentSubclass}-`);
                if (!shouldKeep) {
                }
                return shouldKeep;
            });
            
            // Очищаем ASI (Ability Score Improvements), связанные с классом
            Object.keys(newAsi).forEach(level => {
                const levelNum = parseInt(level);
                if (levelNum > 1) { // Оставляем только 1-й уровень
                    delete newAsi[levelNum];
                }
            });
            
            const newDraft = {
                ...d,
                basics: {
                    ...d.basics,
                    class: '',
                    subclass: '',
                    level: 1, // Сбрасываем уровень на 1
                },
                asi: newAsi,
                chosen: newChosen,
                hpRolls: [],
            };
            
            // Сохраняем изменения в базу данных
            if (newDraft.id) {
                saveToSupabase().catch(console.error);
            }
            
            console.log("Очищенные выборы:", newChosen);
            console.log("Очищенный ASI:", newAsi);
            
            return newDraft;
        });
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
        const { error } = await supabase.from("characters").upsert({
            id: draft.id,
            user_id: user.id,
            data: draft,
            updated_at: new Date(),
        });

        if (error) {
            // Ошибка сохранения в Supabase
        }
    };

    const createNewCharacter = async (id: string) => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                // Пользователь не авторизован
                return;
            }

            // Создаем новый draft с переданным ID, сохраняя текущие данные
            const newDraft = {
                ...draft, // Сохраняем текущие данные пользователя
                id: id,
            };

            // Сохраняем в БД
            const { error } = await supabase.from("characters").insert({
                id: id,
                user_id: user.id,
                data: newDraft,
                created_at: new Date(),
                updated_at: new Date(),
            });

            if (error) {
                // Ошибка создания персонажа в Supabase
                return;
            }

            // Устанавливаем новый draft в состояние
            setDraft(newDraft);
        } finally {
            setIsLoading(false);
        }
    };

    const loadFromSupabase = async (id: string) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from("characters")
                .select("*")
                .eq("id", id)
                .single();

            if (error) {
                // Ошибка загрузки из Supabase
                return;
            }

            if (data) {
                // достаём draft из JSON-поля data
                const savedDraft = data.data;

                // Миграция старых ключей в новые
                const migratedChosen = migrateOldKeys(savedDraft.chosen || {});

                // мержим с дефолтами, чтобы не поломались старые персонажи
                setDraft({
                    ...makeDefaultDraft(),
                    ...savedDraft,
                    basics: { ...makeDefaultDraft().basics, ...savedDraft.basics },
                    chosen: { ...makeDefaultDraft().chosen, ...migratedChosen },
                });
            }
        } finally {
            setIsLoading(false);
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
        setChosenToolProficiencies,
        removeChosenToolProficiency,
        setChosenLanguages,
        removeChosenLanguage,
        setChosenSpells,
        removeChosenSpell,
        setChosenFeats,
        removeChosenFeat,

        saveToSupabase,
        loadFromSupabase,
        createNewCharacter,
        initNewCharacter,
        isLoading,

        resetCharacter,
        setBasics,
        setLevel,
        setSubclass,
        setBackground,

        setAbilitiesMode,
        setChosenFeatures,
        removeChosenFeature, 
        setChosenFightingStyle,
        setHpRollAtLevel,
        resetHpRolls,
        clearClassChoices,
    };

    if (!isInitialized) {
        return <div className="p-4">Загрузка...</div>;
    }

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
    if (!ctx) {
        console.error("useCharacter must be used within CharacterProvider. Context value:", ctx);
        throw new Error("useCharacter must be used within CharacterProvider");
    }
    return ctx;
};


