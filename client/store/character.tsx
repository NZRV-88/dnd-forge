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
    hpCurrent?: number | null;
    tempHp?: number;
    background: string;
    equipment?: string[];
    gold?: number;
    currency?: {
        platinum: number;
        gold: number;
        electrum: number;
        silver: number;
        copper: number;
    };
    isStartEquipmentAdded?: boolean;
    //backgroundBonuses?: Partial<Record<keyof Abilities, number>>;
    //backgroundSkills?: string[];
    //raceBonuses?: Partial<Record<keyof Abilities, number>>;
    alignment: string;
};

// Типы для надетого снаряжения
export type EquippedItem = {
    name: string;
    type: 'weapon' | 'armor' | 'shield' | 'capacity';
    slots: number; // количество слотов (1-2 для оружия, 1 для доспеха/щита)
    isVersatile?: boolean; // для универсального оружия
    versatileMode?: boolean; // используется ли в двуручном режиме
    capacity?: number; // дополнительная грузоподъемность для предметов с capacity
};

export type EquippedGear = {
    armor?: EquippedItem;
    shield1?: EquippedItem; // щит в наборе I
    shield2?: EquippedItem; // щит в наборе II
    weaponSlot1: EquippedItem[]; // массив оружия в слоте I
    weaponSlot2: EquippedItem[]; // массив оружия в слоте II
    activeWeaponSlot: 1 | 2; // активный слот оружия (I или II)
    capacityItem?: EquippedItem; // предмет с capacity (рюкзак и т.д.)
};

// Основной драфт персонажа
export type CharacterDraft = {
    id: string;
    basics: Basics;
    stats: Abilities;
    asi: Record<number, AsiSelection>;
    avatar?: string | null;
    equipped?: EquippedGear; // надетое снаряжение

    // Все выборы игрока (из рас, классов, фитов, подрас и т.п.)
    chosen: {
        abilities: Record<string, (keyof Abilities)[]>; // источник -> выбранные характеристики
        skills: Record<string, string[]>;               // источник -> выбранные навыки
        tools: Record<string, string[]>;
        toolProficiencies: Record<string, string[]>;    // источник -> выбранные владения инструментами
        languages: Record<string, string[]>;
        feats: string[];                                // выбранные фиты (ключи)
        spells: Record<string, string[]>;
        cantrips: Record<string, string[]>;
        spellbook: Record<string, string[]>;      // источник -> заклинания в книге заклинаний
        learnedSpells: Record<string, string[]>;        // источник -> выученные заклинания (не учитываются в лимите)
        features: Record<string, string[]>;
        fightingStyle?: Record<string, string[]>;
        weaponMastery?: Record<string, string[]>;       // источник -> выбранное оружейное мастерство
        expertise?: Record<string, string[]>;          // источник -> навыки с экспертностью
    };
    abilitiesMode?: "array" | "roll" | "point-buy";
    rolls?: RollResult[];
    // Броски кости хитов за уровни, начиная со 2-го уровня: hpRolls[0] -> уровень 2
    hpRolls?: number[];
    // Использованные слоты заклинаний по уровням: usedSpellSlots[1] = количество использованных слотов 1-го уровня
    usedSpellSlots?: Record<number, number>;
    // Возложение рук (только для Паладина)
    layOnHands?: {
        maxPoints: number;        // Максимум очков (уровень * 5)
        currentPoints: number;    // Текущие очки
        usedPoints: number;       // Потраченные очки за день
    };
    
    // Проведение божественности (только для Паладина)
    channelDivinity?: {
        maxUses: number;          // Максимум использований (2 на 3-10 уровне, 3 на 11+)
        currentUses: number;       // Текущие использования
        shortRestUses: number;    // Использования, восстановленные коротким отдыхом
    };
    
    // Сияющие удары (только для Паладина 11+ уровня)
    radiantStrikes?: boolean;     // Активны ли сияющие удары
    
    // Бонусы к классу брони
    acBonuses?: Array<{
        bonus: number;             // Значение бонуса
        source: string;            // Источник бонуса (например, "Заклинание щита")
        id: string;                // Уникальный ID для удаления
    }>;
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
    expertise: string[];  // навыки с экспертностью
    abilityBonuses: Partial<Record<keyof Abilities, number>>;
    speed?: number;
    initiativeBonus?: number;
    abilitiesMode?: string[];

    // Сеттеры для выбранных опций
    setChosenAbilities: (source: string, abilities: (keyof Abilities)[]) => void;
    removeChosenAbility: (source: string, abilities: (keyof Abilities)) => void;
    setChosenSkills: (source: string, skills: string[]) => void;
    removeChosenSkill: (source: string, skill: string) => void;

    setChosenExpertise: (source: string, skills: string[]) => void;
    removeChosenExpertise: (source: string, skill: string) => void;

    setChosenTools: (source: string, tools: string[]) => void;
    removeChosenTool: (source: string, tool: string) => void;
    setChosenToolProficiencies: (source: string, toolProficiencies: string[]) => void;
    removeChosenToolProficiency: (source: string, toolProficiency: string) => void;

    setChosenLanguages: (source: string, langs: string[]) => void;
    removeChosenLanguage: (source: string, lang: string) => void;

    setChosenSpells: (source: string, spells: string[]) => void;
    removeChosenSpell: (source: string, spell: string) => void;
    setChosenCantrips: (source: string, cantrips: string[]) => void;
    removeChosenCantrip: (source: string, cantrip: string) => void;
    
    setChosenSpellbook: (source: string, spells: string[]) => void;
    removeChosenSpellbookSpell: (source: string, spell: string) => void;
    
    setLearnedSpells: (source: string, spells: string[]) => void;
    removeLearnedSpell: (source: string, spell: string) => void;

    setChosenWeaponMastery: (source: string, weapons: string[]) => void;
    removeChosenWeaponMastery: (source: string, weapon: string) => void;

    setChosenFeats: (featKey: string[]) => void;
    removeChosenFeat: (featKey: string) => void;

    // Функции для работы с надетым снаряжением
    equipItem: (itemName: string, itemType: 'weapon' | 'armor' | 'shield', slots?: number, isVersatile?: boolean, versatileMode?: boolean) => void;
    unequipItem: (itemName: string, itemType: 'weapon' | 'armor' | 'shield') => void;
    toggleVersatileMode: (itemName: string) => void;
    setActiveWeaponSlot: (slot: 1 | 2) => void;
    
    // Функции для работы с переносимым весом
    calculateMaxCarryWeight: () => number;
    calculateCurrentSpeed: (baseSpeed: number, currentWeight: number) => number;
    isOverloaded: (currentWeight: number) => boolean;
    equipCapacityItem: (itemName: string, capacity: number) => void;
    unequipCapacityItem: () => void;

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
    
    // Работа со слотами заклинаний
    useSpellSlot: (level: number) => void;
    freeSpellSlot: (level: number) => void;
    resetSpellSlots: () => void;
    
    // Работа с Возложением рук (только для Паладина)
    initializeLayOnHands: (level: number) => void;
    useLayOnHands: (points: number) => void;
    restoreLayOnHands: () => void;
    
    // Работа с Проведением божественности (только для Паладина)
    initializeChannelDivinity: (level: number) => void;
    useChannelDivinity: () => void;
    shortRestChannelDivinity: () => void;
    longRestChannelDivinity: () => void;
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
        hpCurrent: null, // Будет установлен равным hpMax при загрузке
        tempHp: 0,
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
        cantrips: {},
        spellbook: {},
        learnedSpells: {},
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
        ['abilities', 'skills', 'tools', 'languages', 'spells', 'features', 'fightingStyle', 'weaponMastery'].forEach(type => {
            if (migrated[type]) {
                const newTypeData: any = {};
                
                Object.entries(migrated[type]).forEach(([key, value]) => {
                    // Мигрируем старые ключи рас
                    if (key.includes('halfOrc')) {
                        const newKey = key.replace('halfOrc', 'half-orc');
                        newTypeData[newKey] = value;
                    } else if (key.includes('halfElf')) {
                        const newKey = key.replace('halfElf', 'half-elf');
                        newTypeData[newKey] = value;
                    } else if (key.match(/^(race|subrace|class|subclass)-\d+$/)) {
                        // Если ключ в старом формате (без уровня), добавляем 'base'
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
    
    // Функция миграции ключей рас в basics
    const migrateRaceKeys = useCallback((basics: any) => {
        const migrated = { ...basics };
        
        // Мигрируем ключи рас
        if (migrated.race === 'halfOrc') {
            migrated.race = 'half-orc';
        } else if (migrated.race === 'halfElf') {
            migrated.race = 'half-elf';
        }
        
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

    // Мониторинг изменений всех типов выборов для отладки
    useEffect(() => {
    }, [draft.chosen.abilities, draft.chosen.skills, draft.chosen.tools, draft.chosen.languages, draft.chosen.spells, draft.chosen.features, draft.chosen.fightingStyle, draft.chosen.weaponMastery]);

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
        // Очищаем localStorage для нового персонажа
        try {
            localStorage.removeItem("characterDraft");
        } catch {
            // noop
        }
    };

    const setBasics = (updates: Partial<CharacterDraft["basics"]>) => {
        setDraft(d => {
            const newDraft = { ...d, basics: { ...d.basics, ...updates } };
            
            // Автоматически инициализируем Возложение рук для Паладина
            if (updates.class === 'paladin' && !newDraft.layOnHands) {
                newDraft.layOnHands = {
                    maxPoints: (newDraft.basics.level || 1) * 5,
                    currentPoints: (newDraft.basics.level || 1) * 5,
                    usedPoints: 0
                };
            }
            
            // Автоматически инициализируем Проведение божественности для Паладина 3+ уровня
            if (updates.class === 'paladin' && (newDraft.basics.level || 1) >= 3 && !newDraft.channelDivinity) {
                const level = newDraft.basics.level || 1;
                newDraft.channelDivinity = {
                    maxUses: level >= 11 ? 3 : 2,
                    currentUses: level >= 11 ? 3 : 2,
                    shortRestUses: 0
                };
            }
            
            // Автоматически инициализируем Сияющие удары для Паладина 11+ уровня
            if (updates.class === 'paladin' && (newDraft.basics.level || 1) >= 11 && !newDraft.radiantStrikes) {
                newDraft.radiantStrikes = true;
            }
            
            return newDraft;
        });
        
        // Автоматически сохраняем в БД при изменении basics
        if (draft.id) {
            saveToSupabase().catch(console.error);
        }
    };

    const setLevel = (level: number) => {
        setBasics({ level });
        
        // Обновляем максимум очков Возложения рук при изменении уровня
        if (draft.basics.class === 'paladin' && draft.layOnHands) {
            setDraft(d => ({
                ...d,
                layOnHands: {
                    ...d.layOnHands!,
                    maxPoints: level * 5,
                    currentPoints: Math.min(d.layOnHands!.currentPoints, level * 5)
                }
            }));
        }
        
        // Инициализируем или обновляем Проведение божественности при изменении уровня
        if (draft.basics.class === 'paladin') {
            if (level >= 3 && !draft.channelDivinity) {
                // Инициализируем Проведение божественности для паладина 3+ уровня
                setDraft(d => ({
                    ...d,
                    channelDivinity: {
                        maxUses: level >= 11 ? 3 : 2,
                        currentUses: level >= 11 ? 3 : 2,
                        shortRestUses: 0
                    }
                }));
            } else if (draft.channelDivinity) {
                // Обновляем существующее Проведение божественности
                setDraft(d => ({
                    ...d,
                    channelDivinity: {
                        ...d.channelDivinity!,
                        maxUses: level >= 11 ? 3 : 2,
                        currentUses: Math.min(d.channelDivinity!.currentUses, level >= 11 ? 3 : 2)
                    }
                }));
            }
            
            // Инициализируем Сияющие удары для паладина 11+ уровня
            if (level >= 11 && !draft.radiantStrikes) {
                setDraft(d => ({
                    ...d,
                    radiantStrikes: true
                }));
            } else if (level < 11 && draft.radiantStrikes) {
                // Убираем Сияющие удары при понижении уровня ниже 11
                setDraft(d => ({
                    ...d,
                    radiantStrikes: false
                }));
            }
        }
    };

    const setSubclass = (subclass: string) =>
        setBasics({ subclass });

    const setHpCurrent = (hpCurrent: number) =>
        setBasics({ hpCurrent });

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

            // Очищаем ВСЕ выборы предыстории при смене
            const newChosen = { ...d.chosen };
            
            // Очищаем выборы старой предыстории
            if (d.basics.background) {
                const oldBackgroundSource = `background-${d.basics.background}`;
                
                // Очищаем все типы выборов для старой предыстории
                Object.keys(newChosen.skills).forEach(key => {
                    if (key.startsWith(oldBackgroundSource)) {
                        delete newChosen.skills[key];
                    }
                });
                
                Object.keys(newChosen.tools).forEach(key => {
                    if (key.startsWith(oldBackgroundSource)) {
                        delete newChosen.tools[key];
                    }
                });
                
                Object.keys(newChosen.toolProficiencies).forEach(key => {
                    if (key.startsWith(oldBackgroundSource)) {
                        delete newChosen.toolProficiencies[key];
                    }
                });
                
                Object.keys(newChosen.languages).forEach(key => {
                    if (key.startsWith(oldBackgroundSource)) {
                        delete newChosen.languages[key];
                    }
                });
                
                Object.keys(newChosen.spells).forEach(key => {
                    if (key.startsWith(oldBackgroundSource)) {
                        delete newChosen.spells[key];
                    }
                });
                
                Object.keys(newChosen.features).forEach(key => {
                    if (key.startsWith(oldBackgroundSource)) {
                        delete newChosen.features[key];
                    }
                });
                
                // Также очищаем особенности предыстории с ключами вида background-{название}-feature-{индекс}
                Object.keys(newChosen.features).forEach(key => {
                    if (key.includes(`${oldBackgroundSource}-feature-`)) {
                        delete newChosen.features[key];
                    }
                });
                
                // Очищаем выборы характеристик для особенностей предыстории
                Object.keys(newChosen.abilities).forEach(key => {
                    if (key.includes(`${oldBackgroundSource}-feature-`)) {
                        delete newChosen.abilities[key];
                    }
                });
                
                Object.keys(newChosen.fightingStyle || {}).forEach(key => {
                    if (key.startsWith(oldBackgroundSource)) {
                        delete newChosen.fightingStyle![key];
                    }
                });
            }

            return {
                ...d,
                basics: {
                    ...d.basics,
                    background,
                },
                chosen: {
                    ...newChosen,
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

    const setChosenAbilities = (source: string, abilities: (keyof Abilities)[]) => {
        
        setDraft(d => {
            const newDraft = {
                ...d,
                chosen: { ...d.chosen, abilities: { ...d.chosen.abilities, [source]: abilities } },
            };
            
            return newDraft;
        });
    };


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

    const setChosenSkills = (source: string, skills: string[]) => {
        
        setDraft(d => {
            const newDraft = {
                ...d,
                chosen: { ...d.chosen, skills: { ...d.chosen.skills, [source]: skills } },
            };
            
            return newDraft;
        });
    };

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

    const setChosenExpertise = (source: string, skills: string[]) => {
        setDraft(d => {
            const newDraft = {
                ...d,
                chosen: { 
                    ...d.chosen, 
                    expertise: { 
                        ...d.chosen.expertise, 
                        [source]: skills 
                    } 
                },
            };
            
            return newDraft;
        });
    };

    const removeChosenExpertise = (source: string, skill: string) =>
        setDraft(d => ({
            ...d,
            chosen: {
                ...d.chosen,
                expertise: {
                    ...d.chosen.expertise,
                    [source]: (d.chosen.expertise?.[source] || []).filter(s => s !== skill),
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

    const setChosenCantrips = (source: string, cantrips: string[]) =>
        setDraft(d => ({
            ...d,
            chosen: { ...d.chosen, cantrips: { ...d.chosen.cantrips, [source]: cantrips } },
        }));

    const removeChosenCantrip = (source: string, cantrip: string) =>
        setDraft(d => ({
            ...d,
            chosen: {
                ...d.chosen,
                cantrips: {
                    ...d.chosen.cantrips,
                    [source]: (d.chosen.cantrips[source] || []).filter(s => s !== cantrip),
                },
            },
        }));

    const setChosenSpellbook = (source: string, spells: string[]) =>
        setDraft(d => ({
            ...d,
            chosen: { ...d.chosen, spellbook: { ...d.chosen.spellbook, [source]: spells } },
        }));

    const removeChosenSpellbookSpell = (source: string, spell: string) =>
        setDraft(d => ({
            ...d,
            chosen: {
                ...d.chosen,
                spellbook: {
                    ...d.chosen.spellbook,
                    [source]: (d.chosen.spellbook[source] || []).filter(s => s !== spell),
                },
            },
        }));

    const setLearnedSpells = (source: string, spells: string[]) =>
        setDraft(d => ({
            ...d,
            chosen: { ...d.chosen, learnedSpells: { ...d.chosen.learnedSpells, [source]: spells } },
        }));

    const removeLearnedSpell = (source: string, spell: string) =>
        setDraft(d => ({
            ...d,
            chosen: {
                ...d.chosen,
                learnedSpells: {
                    ...d.chosen.learnedSpells,
                    [source]: (d.chosen.learnedSpells[source] || []).filter(s => s !== spell),
                },
            },
        }));

    const setChosenWeaponMastery = (source: string, weapons: string[]) => {
        
        setDraft(d => {
            const newDraft = {
                ...d,
                chosen: { 
                    ...d.chosen, 
                    weaponMastery: { 
                        ...d.chosen.weaponMastery, 
                        [source]: weapons 
                    } 
                },
            };
            
            return newDraft;
        });
    };

    const removeChosenWeaponMastery = (source: string, weapon: string) =>
        setDraft(d => ({
            ...d,
            chosen: {
                ...d.chosen,
                weaponMastery: {
                    ...d.chosen.weaponMastery,
                    [source]: (d.chosen.weaponMastery?.[source] || []).filter(w => w !== weapon),
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

    // Функции для работы с надетым снаряжением
    const equipItem = (itemName: string, itemType: 'weapon' | 'armor' | 'shield', slots: number = 1, isVersatile: boolean = false, versatileMode: boolean = false) => {
        setDraft(d => {
            const equipped = d.equipped || { weaponSlot1: [], weaponSlot2: [], activeWeaponSlot: 1 };
            const newItem: EquippedItem = {
                name: itemName,
                type: itemType,
                slots,
                isVersatile,
                versatileMode
            };

            switch (itemType) {
                case 'armor':
                    return { ...d, equipped: { ...equipped, armor: newItem } };
                case 'shield':
                    // Щит надевается в активное снаряжение
                    const shieldCurrentSlot1 = Array.isArray(equipped.weaponSlot1) ? equipped.weaponSlot1 : [];
                    const shieldCurrentSlot2 = Array.isArray(equipped.weaponSlot2) ? equipped.weaponSlot2 : [];
                    const shieldTotalSlots1 = shieldCurrentSlot1.reduce((sum, w) => sum + w.slots, 0);
                    const shieldTotalSlots2 = shieldCurrentSlot2.reduce((sum, w) => sum + w.slots, 0);
                    
                    // Проверяем, есть ли место в активном снаряжении
                    if (equipped.activeWeaponSlot === 1) {
                        if (shieldTotalSlots1 < 2) {
                            // Есть место в снаряжении I
                            return { ...d, equipped: { ...equipped, shield1: newItem } };
                        } else if (shieldTotalSlots2 < 2) {
                            // Нет места в снаряжении I, но есть в снаряжении II
                            return { ...d, equipped: { ...equipped, shield2: newItem } };
                        } else {
                            // Нет места ни в одном снаряжении - заменяем активное
                            return { ...d, equipped: { ...equipped, shield1: newItem } };
                        }
                    } else {
                        if (shieldTotalSlots2 < 2) {
                            // Есть место в снаряжении II
                            return { ...d, equipped: { ...equipped, shield2: newItem } };
                        } else if (shieldTotalSlots1 < 2) {
                            // Нет места в снаряжении II, но есть в снаряжении I
                            return { ...d, equipped: { ...equipped, shield1: newItem } };
                        } else {
                            // Нет места ни в одном снаряжении - заменяем активное
                            return { ...d, equipped: { ...equipped, shield2: newItem } };
                        }
                    }
                case 'weapon':
                    // Логика: сначала заполняем активный слот до упора, потом другой слот
                    const currentSlot1 = Array.isArray(equipped.weaponSlot1) ? equipped.weaponSlot1 : [];
                    const currentSlot2 = Array.isArray(equipped.weaponSlot2) ? equipped.weaponSlot2 : [];
                    const totalSlots1 = currentSlot1.reduce((sum, w) => sum + w.slots, 0);
                    const totalSlots2 = currentSlot2.reduce((sum, w) => sum + w.slots, 0);
                    
                    // Щиты занимают слоты в соответствующих наборах
                    const shieldSlots1 = equipped.shield1 ? 1 : 0;
                    const shieldSlots2 = equipped.shield2 ? 1 : 0;
                    const totalUsedSlots = totalSlots1 + totalSlots2 + shieldSlots1 + shieldSlots2;
                    
                    // Проверяем, не превышаем ли общий лимит в 4 слота
                    if (totalUsedSlots + slots > 4) {
                        console.warn('Превышен общий лимит слотов для оружия (4)');
                        return d; // Не добавляем оружие, если превышен лимит
                    }
                    
                    if (equipped.activeWeaponSlot === 1) {
                        if (totalSlots1 + shieldSlots1 + slots <= 2) {
                            // Помещается в слот I (с учетом щита)
                            return { ...d, equipped: { ...equipped, weaponSlot1: [...currentSlot1, newItem] } };
                        } else if (totalSlots2 + shieldSlots2 + slots <= 2) {
                            // Не помещается в слот I, но помещается в слот II
                            return { ...d, equipped: { ...equipped, weaponSlot2: [...currentSlot2, newItem] } };
                        } else {
                            // Не помещается ни в один слот - заменяем активный слот
                            return { ...d, equipped: { ...equipped, weaponSlot1: [newItem] } };
                        }
                    } else {
                        if (totalSlots2 + shieldSlots2 + slots <= 2) {
                            // Помещается в слот II (с учетом щита)
                            return { ...d, equipped: { ...equipped, weaponSlot2: [...currentSlot2, newItem] } };
                        } else if (totalSlots1 + shieldSlots1 + slots <= 2) {
                            // Не помещается в слот II, но помещается в слот I
                            return { ...d, equipped: { ...equipped, weaponSlot1: [...currentSlot1, newItem] } };
                        } else {
                            // Не помещается ни в один слот - заменяем активный слот
                            return { ...d, equipped: { ...equipped, weaponSlot2: [newItem] } };
                        }
                    }
                default:
                    return d;
            }
        });
    };

    const unequipItem = (itemName: string, itemType: 'weapon' | 'armor' | 'shield') => {
        setDraft(d => {
            const equipped = d.equipped || { weaponSlot1: [], weaponSlot2: [], activeWeaponSlot: 1 };
            
            switch (itemType) {
                case 'armor':
                    return { ...d, equipped: { ...equipped, armor: undefined } };
                case 'shield':
                    // Удаляем щит из обоих наборов
                    return { ...d, equipped: { ...equipped, shield1: undefined, shield2: undefined } };
                case 'weapon':
                    // Удаляем оружие из соответствующего слота
                    const currentSlot1 = Array.isArray(equipped.weaponSlot1) ? equipped.weaponSlot1 : [];
                    const currentSlot2 = Array.isArray(equipped.weaponSlot2) ? equipped.weaponSlot2 : [];
                    
                    const weaponIndex1 = currentSlot1.findIndex(w => w.name === itemName);
                    const weaponIndex2 = currentSlot2.findIndex(w => w.name === itemName);
                    
                    if (weaponIndex1 !== -1) {
                        const newSlot1 = currentSlot1.filter((_, index) => index !== weaponIndex1);
                        return { ...d, equipped: { ...equipped, weaponSlot1: newSlot1 } };
                    } else if (weaponIndex2 !== -1) {
                        const newSlot2 = currentSlot2.filter((_, index) => index !== weaponIndex2);
                        return { ...d, equipped: { ...equipped, weaponSlot2: newSlot2 } };
                    }
                    return d;
                default:
                    return d;
            }
        });
    };

    const toggleVersatileMode = (itemName: string) => {
        setDraft(d => {
            const equipped = d.equipped || { weaponSlot1: [], weaponSlot2: [], activeWeaponSlot: 1 };
            
            // Ищем оружие в обоих слотах
            const currentSlot1 = Array.isArray(equipped.weaponSlot1) ? equipped.weaponSlot1 : [];
            const currentSlot2 = Array.isArray(equipped.weaponSlot2) ? equipped.weaponSlot2 : [];
            
            const weapon1 = currentSlot1.find(w => w.name === itemName);
            const weapon2 = currentSlot2.find(w => w.name === itemName);
            const weapon = weapon1 || weapon2;
            
            if (!weapon || !weapon.isVersatile) {
                return d;
            }

            const newSlots = weapon.versatileMode ? 1 : 2;
            const updatedWeapon = { ...weapon, versatileMode: !weapon.versatileMode, slots: newSlots };
            
            if (weapon1) {
                return {
                    ...d,
                    equipped: {
                        ...equipped,
                        weaponSlot1: currentSlot1.map(w => w.name === itemName ? updatedWeapon : w)
                    }
                };
            } else if (weapon2) {
                return {
                    ...d,
                    equipped: {
                        ...equipped,
                        weaponSlot2: currentSlot2.map(w => w.name === itemName ? updatedWeapon : w)
                    }
                };
            }
            
            return d;
        });
    };

    const setActiveWeaponSlot = (slot: 1 | 2) => {
        setDraft(d => {
            const equipped = d.equipped || { weaponSlot1: [], weaponSlot2: [], activeWeaponSlot: 1 };
            return {
                ...d,
                equipped: {
                    ...equipped,
                    activeWeaponSlot: slot
                }
            };
        });
    };

    // Функции для работы с переносимым весом
    const calculateMaxCarryWeight = () => {
        const strength = draft.stats?.str || 10;
        const baseCapacity = strength * 15; // Базовая формула D&D 5e
        
        // Добавляем capacity от надетых предметов
        const equippedCapacity = draft.equipped?.capacityItem?.capacity || 0;
        
        return baseCapacity + equippedCapacity;
    };

    const calculateCurrentSpeed = (baseSpeed: number, currentWeight: number) => {
        const maxWeight = calculateMaxCarryWeight();
        
        // Если вес превышает максимальный, скорость снижается до 5 футов
        if (currentWeight > maxWeight) {
            return 5;
        }
        
        return baseSpeed;
    };

    const isOverloaded = (currentWeight: number) => {
        const maxWeight = calculateMaxCarryWeight();
        return currentWeight > maxWeight;
    };

    const equipCapacityItem = (itemName: string, capacity: number) => {
        setDraft(d => {
            const equipped = d.equipped || { weaponSlot1: [], weaponSlot2: [], activeWeaponSlot: 1 };
            const newItem: EquippedItem = {
                name: itemName,
                type: 'capacity',
                slots: 1,
                capacity
            };
            
            return { ...d, equipped: { ...equipped, capacityItem: newItem } };
        });
    };

    const unequipCapacityItem = () => {
        setDraft(d => {
            const equipped = d.equipped || { weaponSlot1: [], weaponSlot2: [], activeWeaponSlot: 1 };
            return { ...d, equipped: { ...equipped, capacityItem: undefined } };
        });
    };

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

    const setChosenFightingStyle = (source: string, styleKey: string[]) => {
        setDraft(d => {
            const newFightingStyle = { ...d.chosen.fightingStyle };
            
            // Если массив пустой, удаляем ключ
            if (styleKey.length === 0) {
                delete newFightingStyle[source];
            } else {
                newFightingStyle[source] = styleKey;
            }
            
            return {
                ...d,
                chosen: {
                    ...d.chosen,
                    fightingStyle: newFightingStyle
                }
            };
        });
    };

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
            
            
            return newDraft;
        });
    };

    // Функции для работы со слотами заклинаний
    const useSpellSlot = (level: number) => {
        setDraft(d => ({
            ...d,
            usedSpellSlots: {
                ...d.usedSpellSlots,
                [level]: (d.usedSpellSlots?.[level] || 0) + 1
            }
        }));
        
        // Автоматически сохраняем в БД
        if (draft.id) {
            saveToSupabase().catch(console.error);
        }
    };

    const freeSpellSlot = (level: number) => {
        setDraft(d => ({
            ...d,
            usedSpellSlots: {
                ...d.usedSpellSlots,
                [level]: Math.max(0, (d.usedSpellSlots?.[level] || 0) - 1)
            }
        }));
        
        // Автоматически сохраняем в БД
        if (draft.id) {
            saveToSupabase().catch(console.error);
        }
    };

    const resetSpellSlots = () => {
        setDraft(d => ({
            ...d,
            usedSpellSlots: {}
        }));
        
        // Автоматически сохраняем в БД
        if (draft.id) {
            saveToSupabase().catch(console.error);
        }
    };

    // Функции для работы с Возложением рук (только для Паладина)
    const initializeLayOnHands = (level: number) => {
        setDraft(d => ({
            ...d,
            layOnHands: {
                maxPoints: level * 5,
                currentPoints: level * 5,
                usedPoints: 0
            }
        }));
        
        // Автоматически сохраняем в БД
        if (draft.id) {
            saveToSupabase().catch(console.error);
        }
    };

    const useLayOnHands = (points: number) => {
        setDraft(d => {
            if (!d.layOnHands) return d;
            
            const newCurrentPoints = Math.max(0, d.layOnHands.currentPoints - points);
            const newUsedPoints = d.layOnHands.usedPoints + points;
            
            return {
                ...d,
                layOnHands: {
                    ...d.layOnHands,
                    currentPoints: newCurrentPoints,
                    usedPoints: newUsedPoints
                }
            };
        });
        
        // Автоматически сохраняем в БД
        if (draft.id) {
            saveToSupabase().catch(console.error);
        }
    };

    const restoreLayOnHands = () => {
        setDraft(d => {
            if (!d.layOnHands) return d;
            
            return {
                ...d,
                layOnHands: {
                    ...d.layOnHands,
                    currentPoints: d.layOnHands.maxPoints,
                    usedPoints: 0
                }
            };
        });
        
        // Автоматически сохраняем в БД
        if (draft.id) {
            saveToSupabase().catch(console.error);
        }
    };

    // Функции для работы с Проведением божественности (только для Паладина)
    const initializeChannelDivinity = (level: number) => {
        setDraft(d => ({
            ...d,
            channelDivinity: {
                maxUses: level >= 11 ? 3 : 2,
                currentUses: level >= 11 ? 3 : 2,
                shortRestUses: 0
            }
        }));
        
        // Автоматически сохраняем в БД
        if (draft.id) {
            saveToSupabase().catch(console.error);
        }
    };

    const useChannelDivinity = () => {
        setDraft(d => {
            if (!d.channelDivinity || d.channelDivinity.currentUses <= 0) return d;
            
            return {
                ...d,
                channelDivinity: {
                    ...d.channelDivinity,
                    currentUses: d.channelDivinity.currentUses - 1
                }
            };
        });
        
        // Автоматически сохраняем в БД
        if (draft.id) {
            saveToSupabase().catch(console.error);
        }
    };

    const shortRestChannelDivinity = () => {
        setDraft(d => {
            if (!d.channelDivinity) return d;
            
            const newCurrentUses = Math.min(
                d.channelDivinity.maxUses,
                d.channelDivinity.currentUses + 1
            );
            
            return {
                ...d,
                channelDivinity: {
                    ...d.channelDivinity,
                    currentUses: newCurrentUses,
                    shortRestUses: d.channelDivinity.shortRestUses + 1
                }
            };
        });
        
        // Автоматически сохраняем в БД
        if (draft.id) {
            saveToSupabase().catch(console.error);
        }
    };

    const longRestChannelDivinity = () => {
        setDraft(d => {
            if (!d.channelDivinity) return d;
            
            return {
                ...d,
                channelDivinity: {
                    ...d.channelDivinity,
                    currentUses: d.channelDivinity.maxUses,
                    shortRestUses: 0
                }
            };
        });
        
        // Автоматически сохраняем в БД
        if (draft.id) {
            saveToSupabase().catch(console.error);
        }
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
        
        // Проверяем, не создается ли уже персонаж с таким ID
        if (draft.id === id) {
            return;
        }
        
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return;
            }

            // Создаем новый чистый draft с переданным ID
            const newDraft = makeDefaultDraft(id);

            // Сохраняем в БД
            const { error } = await supabase.from("characters").insert({
                id: id,
                user_id: user.id,
                data: newDraft,
                created_at: new Date(),
                updated_at: new Date(),
            });

            if (error) {
                console.error('createNewCharacter: Error saving to Supabase:', error);
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
        const startTime = performance.now();
        setIsLoading(true);
        try {
            const dbStartTime = performance.now();
            const { data, error } = await supabase
                .from("characters")
                .select("*")
                .eq("id", id)
                .single();
            const dbEndTime = performance.now();

            if (error) {
                console.error('loadFromSupabase: Error loading from Supabase:', error);
                // Ошибка загрузки из Supabase
                return;
            }

            if (data) {
                const migrationStartTime = performance.now();
                
                // достаём draft из JSON-поля data
                const savedDraft = data.data;

                // Миграция старых ключей в новые
                const migratedChosen = migrateOldKeys(savedDraft.chosen || {});
                const migratedBasics = migrateRaceKeys(savedDraft.basics || {});
                const migrationEndTime = performance.now();
                
                // Отладочная информация для weaponMastery

                const mergeStartTime = performance.now();
                // мержим с дефолтами, чтобы не поломались старые персонажи
                setDraft({
                    ...makeDefaultDraft(),
                    ...savedDraft,
                    basics: { ...makeDefaultDraft().basics, ...migratedBasics },
                    chosen: { ...makeDefaultDraft().chosen, ...migratedChosen },
                });
                const mergeEndTime = performance.now();
            }
        } finally {
            setIsLoading(false);
            const endTime = performance.now();
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
        setChosenExpertise,
        removeChosenExpertise,
        setChosenTools,
        removeChosenTool,
        setChosenToolProficiencies,
        removeChosenToolProficiency,
        setChosenLanguages,
        removeChosenLanguage,
        setChosenSpells,
        removeChosenSpell,
        setChosenCantrips,
        removeChosenCantrip,
        setChosenSpellbook,
        removeChosenSpellbookSpell,
        setLearnedSpells,
        removeLearnedSpell,
        setChosenWeaponMastery,
        removeChosenWeaponMastery,
        setChosenFeats,
        removeChosenFeat,

        equipItem,
        unequipItem,
        toggleVersatileMode,
        setActiveWeaponSlot,
        
        calculateMaxCarryWeight,
        calculateCurrentSpeed,
        isOverloaded,
        equipCapacityItem,
        unequipCapacityItem,

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
        
        useSpellSlot,
        freeSpellSlot,
        resetSpellSlots,
        
        initializeLayOnHands,
        useLayOnHands,
        restoreLayOnHands,
        
        initializeChannelDivinity,
        useChannelDivinity,
        shortRestChannelDivinity,
        longRestChannelDivinity,
    };

    // Создаем fallback API для случая, когда провайдер еще не инициализирован
    const fallbackApi: CharacterContextType = {
        draft: makeDefaultDraft(),
        setDraft: () => {},
        skills: [],
        tools: [],
        languages: [],
        spells: [],
        feats: [],
        weapons: [],
        armors: [],
        savingThrows: [],
        abilityBonuses: {},
        setChosenAbilities: () => {},
        removeChosenAbility: () => {},
        setChosenSkills: () => {},
        removeChosenSkill: () => {},
        setChosenExpertise: () => {},
        removeChosenExpertise: () => {},
        setChosenTools: () => {},
        removeChosenTool: () => {},
        setChosenToolProficiencies: () => {},
        removeChosenToolProficiency: () => {},
        setChosenLanguages: () => {},
        removeChosenLanguage: () => {},
        setChosenSpells: () => {},
        removeChosenSpell: () => {},
        setChosenCantrips: () => {},
        removeChosenCantrip: () => {},
        setChosenSpellbook: () => {},
        removeChosenSpellbookSpell: () => {},
        setLearnedSpells: () => {},
        removeLearnedSpell: () => {},
        setChosenWeaponMastery: () => {},
        removeChosenWeaponMastery: () => {},
        setChosenFeats: () => {},
        removeChosenFeat: () => {},
        equipItem: () => {},
        unequipItem: () => {},
        toggleVersatileMode: () => {},
        setActiveWeaponSlot: () => {},
        calculateMaxCarryWeight: () => 0,
        calculateCurrentSpeed: () => 0,
        equipCapacityItem: () => {},
        unequipCapacityItem: () => {},
        setBasics: () => {},
        saveToSupabase: async () => {},
        loadFromSupabase: async () => {},
        createNewCharacter: async () => {},
        resetCharacter: () => {},
        initNewCharacter: () => {},
        setLevel: () => {},
        setHpRollAtLevel: () => {},
        resetHpRolls: () => {},
        clearClassChoices: () => {},
        
        useSpellSlot: () => {},
        freeSpellSlot: () => {},
        resetSpellSlots: () => {},
        
        isOverloaded: () => false,
        setChosenFeatures: () => {},
        removeChosenFeature: () => {},
        setChosenFightingStyle: () => {},
        
        initializeLayOnHands: () => {},
        useLayOnHands: () => {},
        restoreLayOnHands: () => {},
        
        initializeChannelDivinity: () => {},
        useChannelDivinity: () => {},
        shortRestChannelDivinity: () => {},
        longRestChannelDivinity: () => {},
        
        isLoading: false,
        setSubclass: () => {},
        setBackground: () => {},
        setAbilitiesMode: () => {}
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
    if (!ctx) {
        console.error("useCharacter must be used within CharacterProvider. Context value:", ctx);
        throw new Error("useCharacter must be used within CharacterProvider");
    }
    return ctx;
};


