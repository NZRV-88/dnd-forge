/**
 * ChoiceRenderer - Универсальный компонент для отображения различных типов выборов в D&D
 * 
 * Поддерживает следующие типы выборов:
 * - subclass: выбор подкласса для класса
 * - ability: выбор характеристик (сила, ловкость и т.д.)
 * - skill: выбор навыков
 * - tool: выбор инструментов
 * - language: выбор языков
 * - spell: выбор заклинаний
 * - feat: выбор талантов (фитов)
 * - feature: выбор особенностей с вложенными подвыборами
 * - fighting-style: выбор боевых стилей
 */

import React from "react";
import type { ChoiceOption } from "@/data/shared/choices";
import { useCharacter } from "@/store/character";

// Импорты данных
import { Abilities, ABILITIES } from "@/data/abilities";
import { Spells } from "@/data/spells";
import type { Spell } from "@/data/spells/types";
import { LANGUAGES } from "@/data/languages/languages";
import { ALL_FEATS } from "@/data/feats/feats";
import { Tools, TOOL_CATEGORY_LABELS, getToolKeysByCategory, getToolByKey } from "@/data/items/tools";
import { getWeaponsWithMastery } from "@/data/items/weapons";
import { getWeaponMasteryByKey } from "@/data/items/weapon-mastery";
import { CLASS_CATALOG } from "@/data/classes/";
import { FEATURES } from "@/data/classes/features/features";
import { FIGHTING_STYLES } from "@/data/classes/features/fightingStyles";
import { SKILLS, SKILL_LABELS } from "@/data/skills"; 
import { getAllCharacterData } from "@/utils/getAllCharacterData";
import { getFixedRaceData } from "@/utils/getFixedRaceData";
import { getFixedClassData } from "@/utils/getFixedClassData";
import { getFixedBackgroundData } from "@/utils/getFixedBackgroundData";
import { getRaceByKey } from "@/data/races";
import { getClassByKey } from "@/data/classes";
import { getBackgroundByKey } from "@/data/backgrounds";
import * as Icons from "@/components/refs/icons";
import SpellMeta from "@/components/ui/SpellMeta";

// ============================================================================
// ТИПЫ
// ============================================================================

interface ChoiceRendererProps {
    /** Источник выбора (race, subrace, class, subclass, background, feature-*, feat-*) */
    source: string;
    /** Массив опций для выбора */
    choices: ChoiceOption[];
    /** Индекс выбора (для уникальных ключей) */
    ci: number;
    /** Режим предпросмотра (без интерактивности) */
    isPreview?: boolean;
}

// ============================================================================
// ОСНОВНОЙ КОМПОНЕНТ
// ============================================================================

export default function ChoiceRenderer({ source, choices, isPreview = false }: ChoiceRendererProps) {
    // Получаем все необходимые функции и данные из контекста персонажа
    const {
        // Функции для работы с характеристиками
        setChosenAbilities,
        removeChosenAbility,
        
        // Функции для работы с навыками
        setChosenSkills,
        removeChosenSkill,
        
        // Функции для работы с инструментами
        setChosenTools,
        removeChosenTool,
        setChosenToolProficiencies,
        removeChosenToolProficiency,
        
        // Функции для работы с языками
        setChosenLanguages,
        removeChosenLanguage,
        
        // Функции для работы с заклинаниями
        setChosenSpells,
        removeChosenSpell,
        
        // Функции для работы с оружейным мастерством
        setChosenWeaponMastery,
        removeChosenWeaponMastery,
        
        // Функции для работы с талантами
        setChosenFeats,
        removeChosenFeat,
        
        // Функции для работы с особенностями
        setChosenFeatures,
        setChosenFightingStyle,
        
        // Функции для работы с подклассами
        setSubclass,
        
        // Данные персонажа
        draft,
    } = useCharacter();

    // Кешируем данные о фиксированных владениях (вычисляем один раз)
    const fixedData = React.useMemo(() => {
        const bg = draft.basics.background ? getFixedBackgroundData(draft.basics.background) : null;
        const race = draft.basics.race ? getFixedRaceData(draft.basics.race, draft.basics.subrace) : null;
        const cls = draft.basics.class ? getFixedClassData(draft.basics.class) : null;

        return {
            background: {
                skills: bg?.proficiencies.skills || [],
                name: draft.basics.background ? getBackgroundByKey(draft.basics.background)?.name : null,
            },
            race: {
                skills: race?.proficiencies.skills || [],
                name: draft.basics.race ? getRaceByKey(draft.basics.race)?.name : null,
            },
            class: {
                skills: cls?.proficiencies.skills || [],
                name: draft.basics.class ? getClassByKey(draft.basics.class)?.name : null,
            },
        };
    }, [draft.basics.background, draft.basics.race, draft.basics.subrace, draft.basics.class]);

    // Функция для определения источника навыка
    const getSkillSource = (skillKey: string): string | null => {
        // Проверяем предысторию (приоритет)
        if (fixedData.background.skills.includes(skillKey)) {
            return fixedData.background.name || "Предыстория";
        }

        // Проверяем расу
        if (fixedData.race.skills.includes(skillKey)) {
            return fixedData.race.name || "Раса";
        }

        // Проверяем класс (фиксированные)
        if (fixedData.class.skills.includes(skillKey)) {
            return fixedData.class.name || "Класс";
        }

        // Проверяем chosen навыки (из фитов, других выборов и т.д.)
        for (const [src, skills] of Object.entries(draft.chosen.skills)) {
            if (skills.includes(skillKey)) {
                // Пытаемся определить читаемое название источника
                
                // Черта skilled
                if (src.includes('feat-skilled')) {
                    return "Черта: Одарённый";
                }
                
                // Выборы предыстории
                if (src.includes('background-')) {
                    return fixedData.background.name || "Предыстория";
                }
                
                // Выборы расы
                if (src.includes('race-') || src.includes('subrace-')) {
                    return fixedData.race.name || "Раса";
                }
                
                // Выборы класса (например, fighter-1-0-, paladin-1-0-)
                // Извлекаем название класса из source
                const classMatch = src.match(/^([a-z-]+)-\d+-\d+-?/);
                if (classMatch) {
                    const classKey = classMatch[1];
                    const classInfo = getClassByKey(classKey);
                    if (classInfo) {
                        return classInfo.name;
                    }
                }
                
                // Общий случай - если source содержит название класса
                if (draft.basics.class && src.includes(draft.basics.class)) {
                    return fixedData.class.name || "Класс";
                }
                
                // Общий случай
                return "Другой источник";
            }
        }

        return null;
    };

    // ============================================================================
    // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    // ============================================================================

    /**
     * Генерирует стили для селекта в зависимости от состояния
     * @param hasValue - есть ли выбранное значение
     * @param isUnfinished - незавершен ли выбор
     */
    const getSelectStyles = (hasValue: boolean, isUnfinished: boolean = false) => {
        if (isPreview) {
            // В режиме предпросмотра убираем рамку и интерактивность
            return "w-full text-xs text-muted-foreground";
        }
        
        const baseStyles = "w-full rounded-lg p-3 text-sm font-medium transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:outline-none mt-2 shadow-inner";
        
        if (isUnfinished) {
            return `${baseStyles} border-2 border-blue-400 bg-blue-50/30 text-blue-800 hover:border-blue-500 focus:border-blue-500`;
        }
        
        if (hasValue) {
            // Для выбранных значений используем стандартные стили
            return `${baseStyles} border-2 border-stone-300 bg-white hover:border-primary/50 focus:border-primary`;
        }
        
        // Пустой селект - голубая рамка с внутренней тенью
        return `${baseStyles} border-2 border-blue-300 bg-stone-50 text-stone-600 hover:border-blue-400 focus:border-blue-400`;
    };

    /**
     * Очищает все вложенные выборы для фита
     * @param featKey - ключ фита
     */
    const cleanupFeatChoices = (featKey: string) => {
        const cleanupPrefix = `feat:${featKey}`;
        
        // Очищаем все связанные выборы
        Object.keys(draft.chosen.abilities).forEach((key) => {
            if (key.startsWith(cleanupPrefix)) setChosenAbilities(key, []);
        });
        Object.keys(draft.chosen.skills).forEach((key) => {
            if (key.startsWith(cleanupPrefix)) setChosenSkills(key, []);
        });
        Object.keys(draft.chosen.tools).forEach((key) => {
            if (key.startsWith(cleanupPrefix)) setChosenTools(key, []);
        });
        Object.keys(draft.chosen.toolProficiencies).forEach((key) => {
            if (key.startsWith(cleanupPrefix)) setChosenToolProficiencies(key, []);
        });
        Object.keys(draft.chosen.languages).forEach((key) => {
            if (key.startsWith(cleanupPrefix)) setChosenLanguages(key, []);
        });
        Object.keys(draft.chosen.spells).forEach((key) => {
            if (key.startsWith(cleanupPrefix)) setChosenSpells(key, []);
        });
        Object.keys(draft.chosen.weaponMastery || {}).forEach((key) => {
            if (key.startsWith(cleanupPrefix)) setChosenWeaponMastery(key, []);
        });
    };

    /**
     * Очищает все вложенные выборы для особенности
     * @param featureKey - ключ особенности
     */
    const cleanupFeatureChoices = (featureKey: string) => {
        const cleanupPrefix = `feature-${featureKey}`;
        
        // Очищаем все связанные выборы
        Object.keys(draft.chosen.abilities).forEach((key) => {
            if (key.startsWith(cleanupPrefix)) setChosenAbilities(key, []);
        });
        Object.keys(draft.chosen.skills).forEach((key) => {
            if (key.startsWith(cleanupPrefix)) setChosenSkills(key, []);
        });
        Object.keys(draft.chosen.tools).forEach((key) => {
            if (key.startsWith(cleanupPrefix)) setChosenTools(key, []);
        });
        Object.keys(draft.chosen.toolProficiencies).forEach((key) => {
            if (key.startsWith(cleanupPrefix)) setChosenToolProficiencies(key, []);
        });
        Object.keys(draft.chosen.languages).forEach((key) => {
            if (key.startsWith(cleanupPrefix)) setChosenLanguages(key, []);
        });
        Object.keys(draft.chosen.spells).forEach((key) => {
            if (key.startsWith(cleanupPrefix)) setChosenSpells(key, []);
        });
        Object.keys(draft.chosen.weaponMastery || {}).forEach((key) => {
            if (key.startsWith(cleanupPrefix)) setChosenWeaponMastery(key, []);
        });
        Object.keys(draft.chosen.features).forEach((key) => {
            if (key.startsWith(cleanupPrefix)) setChosenFeatures(key, []);
        });
        Object.keys(draft.chosen.fightingStyle || {}).forEach((key) => {
            if (key.startsWith(cleanupPrefix)) setChosenFightingStyle(key, []);
        });
    };

    // ============================================================================
    // РЕНДЕР ТИПОВ ВЫБОРОВ
    // ============================================================================

    return (
        <div className="space-y-4">
            {choices.map((choice, ci) => {
                switch (choice.type) {
                    // ========================================================================
                    // ВЫБОР ПОДКЛАССА
                    // ========================================================================
                    case "subclass": {
                        const currentClass = draft.basics.class;
                        const availableSubclasses = currentClass
                            ? (CLASS_CATALOG.find(c => c.key === currentClass)?.subclasses || [])
                            : [];
                        const selectedSubclass = draft.basics.subclass || "";

                        return (
                            <select
                                key={`${source}:subclass:${ci}`}
                                className={getSelectStyles(!!selectedSubclass)}
                                value={selectedSubclass}
                                onChange={(e) => setSubclass(e.target.value)}
                            >
                                <option value="">— Выберите подкласс —</option>
                                {availableSubclasses.map(sc => (
                                    <option key={sc.key} value={sc.key}>
                                        {sc.name || sc.key}
                                    </option>
                                ))}
                            </select>
                        );
                    }

                    // ========================================================================
                    // ВЫБОР ХАРАКТЕРИСТИК
                    // ========================================================================
                    case "ability": {
                        // Если это flexible режим (например, +2/+1 или +1/+1/+1)
                        if (choice.abilityMode === "flexible") {
                            console.log('ChoiceRenderer: ability flexible mode:', {
                                source,
                                choice,
                                currentAbilities: draft.chosen.abilities?.[source] || []
                            });
                            const sourceArray = draft.chosen.abilities?.[source] || [];
                            const maxSame = choice.maxSameChoice ?? 1; // по умолчанию каждая способность только 1 раз
                            
                            // Считаем, сколько раз выбрана каждая способность (кроме текущего селекта)
                            const getCounts = (excludeIdx: number) => {
                                const counts: Record<string, number> = {};
                                sourceArray.forEach((ab, i) => {
                                    if (ab && i !== excludeIdx) counts[ab] = (counts[ab] || 0) + 1;
                                });
                                return counts;
                            };
                            
                            // Считаем итоговые бонусы для отображения
                            const finalCounts: Record<string, number> = {};
                            sourceArray.forEach(ab => {
                                if (ab) finalCounts[ab] = (finalCounts[ab] || 0) + 1;
                            });
                            
                            // Определяем доступные опции для каждого селекта
                            return Array.from({ length: choice.count ?? 1 }).map((_, idx) => {
                                const choiceKey = `${source}:ability:${ci}:${idx}`;
                                const selected = sourceArray[idx] ?? "";
                                const counts = getCounts(idx);
                                
                                // Фильтруем опции: можно выбрать способность максимум maxSame раз
                                const availableOptions = (choice.options || ABILITIES.map(a => a.key)).filter(opt => {
                                    if (opt === selected) return true; // текущий выбор всегда доступен
                                    return (counts[opt] || 0) < maxSame; // можно выбрать, если выбрана меньше maxSame раз
                                });

                                return (
                                    <div key={choiceKey} className="space-y-2">
                                        <select
                                            className={getSelectStyles(!!selected)}
                                            value={selected}
                                            onChange={(e) => {
                                                const value = e.target.value as keyof Abilities;
                                                
                                                // Создаем массив фиксированной длины для сохранения позиций
                                                const updated = Array.from({ length: choice.count ?? 1 }, (_, i) => 
                                                    i === idx ? value : (sourceArray[i] || "")
                                                ) as (keyof Abilities)[];
                                                
                                                // Защита от дублирования: очищаем пустые значения
                                                const cleanedUpdated = updated.filter(val => val !== "");
                                                
                                                console.log('ChoiceRenderer: setChosenAbilities called:', {
                                                    source,
                                                    updated,
                                                    cleanedUpdated,
                                                    choice,
                                                    currentSourceArray: sourceArray,
                                                    allChosenAbilities: draft.chosen.abilities
                                                });
                                                setChosenAbilities(source, cleanedUpdated);
                                            }}
                                        >
                                            <option value="">— Выберите характеристику —</option>
                                            {availableOptions.map((opt) => (
                                                <option key={opt} value={opt}>
                                                    {ABILITIES.find(a => a.key === opt)?.label || opt}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                );
                            });
                        }
                        
                        // Обычный режим - можно выбирать любые характеристики
                        return Array.from({ length: choice.count ?? 1 }).map((_, idx) => {
                            const choiceKey = `${source}:ability:${ci}:${idx}`;
                            const sourceArray = draft.chosen.abilities?.[source] || [];
                            const selected = sourceArray[idx] ?? "";
                            
                            console.log('ChoiceRenderer: ability initialization:', {
                                source,
                                sourceArray,
                                selected,
                                idx,
                                allChosenAbilities: draft.chosen.abilities,
                                isSelectedEmpty: selected === "",
                                isSourceArrayEmpty: sourceArray.length === 0
                            });
                            
                            // Защита от сброса: если данные есть в драфте, но селект пустой
                            if (sourceArray.length > 0 && selected === "") {
                                console.warn('ChoiceRenderer: Potential select reset detected!', {
                                    source,
                                    sourceArray,
                                    selected,
                                    idx
                                });
                            }

                            return (
                                <select
                                    key={choiceKey}
                                    className={getSelectStyles(!!selected)}
                                    value={selected}
                                    onChange={(e) => {
                                        const value = e.target.value as keyof Abilities;
                                        
                                        // Создаем массив фиксированной длины для сохранения позиций
                                        const updated = Array.from({ length: choice.count ?? 1 }, (_, i) => 
                                            i === idx ? value : (sourceArray[i] || "")
                                        ) as (keyof Abilities)[];
                                        
                                        console.log('ChoiceRenderer: setChosenAbilities called (non-flexible):', {
                                            source,
                                            updated,
                                            choice
                                        });
                                        setChosenAbilities(source, updated);
                                    }}
                                >
                                    <option value="">— Выберите характеристику —</option>
                                    {(choice.options || ABILITIES.map(a => a.key)).map((opt) => (
                                        <option key={opt} value={opt}>
                                            {ABILITIES.find(a => a.key === opt)?.label || opt}
                                        </option>
                                    ))}
                                </select>
                            );
                        });
                    }

                    // ========================================================================
                    // ВЫБОР ЗАКЛИНАНИЙ
                    // ========================================================================
                    case "spell": {
                        return Array.from({ length: choice.count ?? 1 }).map((_, idx) => {
                            const choiceKey = `${source}:spell:${ci}:${idx}`;
                            
                            // Фильтруем доступные заклинания
                            let available: Spell[] = Spells;
                            
                            if ((choice as any).spellClass !== undefined) {
                                const spellClasses = Array.isArray((choice as any).spellClass) 
                                    ? (choice as any).spellClass 
                                    : [(choice as any).spellClass];
                                available = available.filter(s => 
                                    s.classes && spellClasses.some((cls: string) => s.classes?.includes(cls))
                                );
                            }
                            
                            if ((choice as any).spellLevel !== undefined) {
                                available = available.filter(s => s.level === (choice as any).spellLevel);
                            }
                            
                            if (choice.options) {
                                available = available.filter(s => choice.options?.includes(s.key));
                            }

                            // Получаем текущий выбор - фиксируем позицию в массиве
                            const sourceArray = draft.chosen.spells?.[source] || [];
                            const selected = sourceArray[idx] ?? "";

                            // Исключаем уже выбранные в других слотах
                            const takenExceptCurrent = sourceArray.filter((_, i) => i !== idx);
                            const options = [...available]
                                .sort((a, b) => a.name.localeCompare(b.name, "ru", { sensitivity: "base" }))
                                .filter(s => !takenExceptCurrent.includes(s.key) || s.key === selected);

                            // Находим выбранное заклинание для карточки
                            const selectedSpell = selected ? available.find(s => s.key === selected) : null;

                            return (
                                <div key={choiceKey} className="space-y-2">
                                    <select
                                        className={getSelectStyles(!!selected)}
                                        value={selected}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            
                                            // Создаем массив фиксированной длины для сохранения позиций
                                            const updated = Array.from({ length: choice.count ?? 1 }, (_, i) => 
                                                i === idx ? value : (sourceArray[i] || "")
                                            );

                                            setChosenSpells(source, updated);
                                        }}
                                    >
                                        <option value="">— Выберите заклинание —</option>
                                        {options.map((spell) => (
                                            <option key={spell.key} value={spell.key}>
                                                {spell.name}
                                            </option>
                                        ))}
                                    </select>

                                    {/* Карточка выбранного заклинания */}
                                    {selectedSpell && (
                                        <div className="rounded border p-2 bg-muted/10">
                                            <SpellMeta spell={selectedSpell} />
                                        </div>
                                    )}
                                </div>
                            );
                        });
                    }

                    // ========================================================================
                    // ВЫБОР ОРУЖЕЙНОГО МАСТЕРСТВА
                    // ========================================================================
                    case "weapon-mastery": {
                        return Array.from({ length: choice.count ?? 1 }).map((_, idx) => {
                            const choiceKey = `${source}:weapon-mastery:${ci}:${idx}`;
                            const sourceArray = draft.chosen.weaponMastery?.[source] || [];
                            const selected = sourceArray[idx] ?? "";
                            const takenExceptCurrent = sourceArray.filter((_, i) => i !== idx);

                        console.log('ChoiceRenderer: weapon-mastery case:', {
                            source,
                            sourceArray,
                            selected,
                            idx,
                            allChosenWeaponMastery: draft.chosen.weaponMastery,
                            isSelectedEmpty: selected === "",
                            isSourceArrayEmpty: sourceArray.length === 0
                        });
                        
                        // Защита от сброса: если данные есть в драфте, но селект пустой
                        if (sourceArray.length > 0 && selected === "") {
                            console.warn('ChoiceRenderer: Potential weapon-mastery select reset detected!', {
                                source,
                                sourceArray,
                                selected,
                                idx
                            });
                        }

                            // Получаем список оружия с мастерством
                            const weaponsWithMastery = getWeaponsWithMastery();
                            const availableWeapons = weaponsWithMastery.filter(weapon => 
                                !takenExceptCurrent.includes(weapon.key)
                            );

                            return (
                                <div key={choiceKey} className="space-y-2">
                                    <select
                                        className={getSelectStyles(!!selected)}
                                        value={selected}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            
                                        // Создаем массив фиксированной длины для сохранения позиций
                                        const updated = Array.from({ length: choice.count ?? 1 }, (_, i) => 
                                            i === idx ? value : (sourceArray[i] || "")
                                        );
                                        
                                        // Защита от дублирования: очищаем пустые значения
                                        const cleanedUpdated = updated.filter(val => val !== "");

                                        setChosenWeaponMastery(source, cleanedUpdated);
                                        }}
                                    >
                                        <option value="">— Выберите оружие —</option>
                                        {availableWeapons.map((weapon) => {
                                            const mastery = getWeaponMasteryByKey(weapon.mastery!);
                                            return (
                                                <option key={weapon.key} value={weapon.key}>
                                                    {weapon.name} ({mastery?.name || weapon.mastery})
                                                </option>
                                            );
                                        })}
                                    </select>

                                    {/* Карточка выбранного оружия */}
                                    {selected && (() => {
                                        const weapon = weaponsWithMastery.find(w => w.key === selected);
                                        const mastery = weapon ? getWeaponMasteryByKey(weapon.mastery!) : null;
                                        
                                        return weapon ? (
                                            <div className="rounded border p-2 bg-muted/10">
                                                <div className="text-sm text-muted-foreground mb-1">
                                                    Мастерство: {mastery?.name || weapon.mastery}
                                                </div>
                                                {mastery?.desc && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {mastery.desc}
                                                    </div>
                                                )}
                                            </div>
                                        ) : null;
                                    })()}
                                </div>
                            );
                        });
                    }

                    // ========================================================================
                    // ВЫБОР ИНСТРУМЕНТОВ
                    // ========================================================================
                    case "tool": {
                        return Array.from({ length: choice.count ?? 1 }).map((_, idx) => {
                            const choiceKey = `${source}:tool:${ci}:${idx}`;
                            const sourceArray = draft.chosen.tools?.[source] || [];
                            const selected = sourceArray[idx] ?? "";
                            const takenExceptCurrent = sourceArray.filter((_, i) => i !== idx);

                            // Определяем, является ли опция категорией или конкретным инструментом
                            const isCategory = (opt: string) => Object.keys(TOOL_CATEGORY_LABELS).includes(opt);
                            
                            // Получаем доступные инструменты
                            const getAvailableTools = () => {
                                if (!choice.options) return [];
                                
                                return choice.options.flatMap(opt => {
                                    if (isCategory(opt)) {
                                        return getToolKeysByCategory(opt as any);
                                    } else {
                                        return [opt];
                                    }
                                });
                            };

                            const availableTools = getAvailableTools();

                            return (
                                <div key={choiceKey} className="space-y-2">
                                    <select
                                        className={getSelectStyles(!!selected)}
                                        value={selected}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            
                                            // Создаем массив фиксированной длины для сохранения позиций
                                            const updated = Array.from({ length: choice.count ?? 1 }, (_, i) => 
                                                i === idx ? value : (sourceArray[i] || "")
                                            );

                                            setChosenTools(source, updated);
                                        }}
                                    >
                                        <option value="">— Выберите инструмент —</option>
                                        {availableTools
                                            ?.filter(opt => !takenExceptCurrent.includes(opt))
                                            .map((opt) => {
                                                const tool = Tools.find(t => t.key === opt);
                                                return (
                                                    <option key={opt} value={opt}>
                                                        {tool?.name || opt}
                                                    </option>
                                                );
                                            })}
                                    </select>

                                    {/* Карточка выбранного инструмента */}
                                    {selected && (() => {
                                        const tool = Tools.find(t => t.key === selected);
                                        if (!tool) return null;

                                        const categoryLabel = TOOL_CATEGORY_LABELS[tool.category] || tool.category;

                                        return (
                                            <div className="rounded-lg border border-stone-300 bg-stone-50 p-3 shadow-sm">
                                                <div className="font-medium text-stone-800">{tool.name}</div>
                                                {tool.desc && (
                                                    <p className="text-xs text-stone-600 mt-1">{tool.desc}</p>
                                                )}
                                                <div className="text-xs text-stone-500 mt-1">
                                                    Категория: {categoryLabel}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            );
                        });
                    }

                    // ========================================================================
                    // ВЫБОР ВЛАДЕНИЯ ИНСТРУМЕНТАМИ
                    // ========================================================================
                    case "tool-proficiency": {
                        return Array.from({ length: choice.count ?? 1 }).map((_, idx) => {
                            const choiceKey = `${source}:tool-proficiency:${ci}:${idx}`;
                            const sourceArray = draft.chosen.toolProficiencies?.[source] || [];
                            const selected = sourceArray[idx] ?? "";
                            const takenExceptCurrent = sourceArray.filter((_, i) => i !== idx);

                            // Если в options указана категория, получаем инструменты этой категории
                            const categoryOption = choice.options?.[0];
                            const isCategory = categoryOption && TOOL_CATEGORY_LABELS[categoryOption];
                            const availableTools = isCategory 
                                ? getToolKeysByCategory(categoryOption as any) 
                                : (choice.options || []);

                            // Получаем ВСЕ инструменты, которыми персонаж уже владеет из любых источников
                            const allData = getAllCharacterData(draft);
                            const allTakenTools = allData.toolProficiencies.filter(tool => tool && tool !== selected);
                            
                            // Также исключаем инструменты из текущего источника (кроме выбранного)
                            const takenTools = [...allTakenTools, ...takenExceptCurrent];

                            return (
                                <div key={choiceKey} className="space-y-2">
                                    <select
                                        className={getSelectStyles(!!selected)}
                                        value={selected}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            
                                            // Создаем массив фиксированной длины для сохранения позиций
                                            const updated = Array.from({ length: choice.count ?? 1 }, (_, i) => 
                                                i === idx ? value : (sourceArray[i] || "")
                                            );

                                            setChosenToolProficiencies(source, updated);
                                        }}
                                    >
                                        <option value="">
                                            {isCategory 
                                                ? `— Выберите владение: ${TOOL_CATEGORY_LABELS[categoryOption]} —`
                                                : "— Выберите владение инструментом —"
                                            }
                                        </option>
                                        {availableTools
                                            .filter(toolKey => !takenTools.includes(toolKey) || toolKey === selected)
                                            .map((toolKey) => {
                                                const tool = getToolByKey(toolKey);
                                                return (
                                                    <option key={toolKey} value={toolKey}>
                                                        {tool?.name || toolKey}
                                                    </option>
                                                );
                                            })}
                                    </select>

                                    {/* Карточка выбранного инструмента */}
                                    {selected && (() => {
                                        const tool = getToolByKey(selected);
                                        if (!tool) return null;

                                        return (
                                            <div className="rounded-lg border border-stone-300 bg-stone-50 p-3 shadow-sm">
                                                <div className="font-medium text-stone-800">{tool.name}</div>
                                                <p className="text-xs text-stone-600 mt-1">
                                                    {tool.desc}
                                                </p>
                                            </div>
                                        );
                                    })()}
                                </div>
                            );
                        });
                    }

                    // ========================================================================
                    // ВЫБОР ЯЗЫКОВ
                    // ========================================================================
                    case "language": {
                        return Array.from({ length: choice.count ?? 1 }).map((_, idx) => {
                            const sourceArray = draft.chosen.languages?.[source] || [];
                            const selected = sourceArray[idx] ?? "";

                            // Получаем все уже известные языки
                            const allData = getAllCharacterData(draft);
                            const taken = allData.languages.filter(l => l !== selected);

                            return (
                                <select
                                    key={`${source}:language:${ci}:${idx}`}
                                    className={getSelectStyles(!!selected)}
                                    value={selected}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        
                                        // Создаем массив фиксированной длины для сохранения позиций
                                        const updated = Array.from({ length: choice.count ?? 1 }, (_, i) => 
                                            i === idx ? value : (sourceArray[i] || "")
                                        );
                                        
                                        setChosenLanguages(source, updated);
                                    }}
                                >
                                    <option value="">— Выберите язык —</option>
                                    {LANGUAGES
                                        .filter(lang => !taken.includes(lang.key) || lang.key === selected)
                                        .map((lang) => (
                                            <option key={lang.key} value={lang.key}>
                                                {lang.name}
                                            </option>
                                        ))}
                                </select>
                            );
                        });
                    }

                    // ========================================================================
                    // ВЫБОР ОСОБЕННОСТЕЙ (FEATURES)
                    // ========================================================================
                    case "feature": {
                        // Фильтруем доступные особенности по options, если они указаны
                        const availableFeatures = choice.options 
                            ? FEATURES.filter(f => choice.options?.includes(f.key))
                            : FEATURES;
                        const selected = draft.chosen.features?.[source] || [];
                        const selectedFeature = selected[0] 
                            ? availableFeatures.find(f => f.key === selected[0]) 
                            : null;
                        
                        console.log('ChoiceRenderer: feature case:', {
                            source,
                            choice,
                            choiceOptions: choice.options,
                            selected,
                            selectedFeature,
                            availableFeatures: availableFeatures.length,
                            filteredFeatures: availableFeatures.map(f => f.key),
                            chosenFeatures: draft.chosen.features,
                            chosenFightingStyle: draft.chosen.fightingStyle
                        });

                        // Проверяем завершенность всех подвыборов корректно по соответствующим сторам
                        const isChoiceComplete = selectedFeature?.choices?.every((subChoice) => {
                            const subSource = `feature-${selectedFeature.key}`;
                            const cnt = subChoice.count ?? 1;
                            
                            let isComplete = false;
                            switch (subChoice.type) {
                                case "ability":
                                    isComplete = (draft.chosen.abilities?.[subSource]?.length || 0) >= cnt;
                                    break;
                                case "skill":
                                    isComplete = (draft.chosen.skills?.[subSource]?.length || 0) >= cnt;
                                    break;
                                case "tool":
                                    isComplete = (draft.chosen.tools?.[subSource]?.length || 0) >= cnt;
                                    break;
                                case "tool-proficiency":
                                    isComplete = (draft.chosen.toolProficiencies?.[subSource]?.length || 0) >= cnt;
                                    break;
                                case "language":
                                    isComplete = (draft.chosen.languages?.[subSource]?.length || 0) >= cnt;
                                    break;
                                case "spell":
                                    isComplete = (draft.chosen.spells?.[subSource]?.length || 0) >= cnt;
                                    break;
                                case "weapon-mastery":
                                    isComplete = (draft.chosen.weaponMastery?.[subSource]?.length || 0) >= cnt;
                                    break;
                                case "feature":
                                    isComplete = (draft.chosen.features?.[subSource]?.length || 0) >= cnt;
                                    break;
                                case "fighting-style":
                                    isComplete = (draft.chosen.fightingStyle?.[subSource]?.length || 0) >= cnt;
                                    break;
                                default:
                                    isComplete = true;
                            }
                            
                            console.log('ChoiceRenderer: checking subchoice completion:', {
                                subChoice,
                                subSource,
                                cnt,
                                isComplete,
                                actualLength: {
                                    abilities: draft.chosen.abilities?.[subSource]?.length || 0,
                                    skills: draft.chosen.skills?.[subSource]?.length || 0,
                                    tools: draft.chosen.tools?.[subSource]?.length || 0,
                                    toolProficiencies: draft.chosen.toolProficiencies?.[subSource]?.length || 0,
                                    languages: draft.chosen.languages?.[subSource]?.length || 0,
                                    spells: draft.chosen.spells?.[subSource]?.length || 0,
                                    weaponMastery: draft.chosen.weaponMastery?.[subSource]?.length || 0,
                                    features: draft.chosen.features?.[subSource]?.length || 0,
                                    fightingStyle: draft.chosen.fightingStyle?.[subSource]?.length || 0,
                                }
                            });
                            
                            return isComplete;
                        }) ?? true;

                        console.log('ChoiceRenderer: final feature render:', {
                            source,
                            selected: selected[0],
                            hasValue: !!selected[0],
                            isChoiceComplete,
                            isUnfinished: !isChoiceComplete,
                            finalClassName: getSelectStyles(!!selected[0], !isChoiceComplete)
                        });

                        return (
                            <div key={`${source}:feature:${ci}`} className="space-y-2">
                                <select
                                    className={getSelectStyles(!!selected[0], !isChoiceComplete)}
                                    value={selected[0] || ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        const prevFeature = selected[0];
                                        
                                        
                                        // Очищаем вложенные выборы предыдущей особенности
                                        if (prevFeature) {
                                            cleanupFeatureChoices(prevFeature);
                                        }
                                        
                                        setChosenFeatures(source, value ? [value] : []);
                                    }}
                                >
                                    <option value="">— Выберите особенность —</option>
                                    {availableFeatures.map((f) => (
                                        <option key={f.key} value={f.key}>
                                            {f.name}
                                        </option>
                                    ))}
                                </select>

                                {/* Описание выбранной особенности */}
                                {selectedFeature && (
                                    <div className="mt-2 p-2 border rounded bg-stone-50 text-xs text-stone-800">
                                        {selectedFeature.desc}
                                    </div>
                                )}

                                {/* Рекурсивный рендер подвыборов */}
                                {selectedFeature?.choices?.map((subChoice, sci) => (
                                    <ChoiceRenderer
                                        key={`${source}:feature:${ci}:sub-${sci}`}
                                        ci={sci}
                                        source={`feature-${selectedFeature.key}`}
                                        choices={[subChoice]}
                                    />
                                ))}
                            </div>
                        );
                    }

                    // ========================================================================
                    // ВЫБОР ТАЛАНТОВ (ФИТОВ)
                    // ========================================================================
                    case "feat": {
                        return Array.from({ length: choice.count ?? 1 }).map((_, idx) => {
                            const choiceKey = `${source}:feat:${ci}:${idx}`;
                            // Используем source-specific ключ для талантов вместо глобального массива
                            const sourceFeats = draft.chosen.feats || [];
                            const featKey = `${source}-${idx}`;
                            const selected = sourceFeats.find(f => f.startsWith(featKey + ':'))?.split(':')[1] || "";

                            // Фильтруем доступные фиты
                            let availableFeats = ALL_FEATS;
                            
                            // Определяем, является ли это ASI (Ability Score Improvement)
                            // ASI может быть либо с источником "asi", либо с особенностью "Увеличение характеристик"
                            const isAsi = source === "asi" || 
                                (source.startsWith('class-') && source.includes('-') && 
                                 draft.basics.class);
                            
                            // Дополнительная проверка для ASI уровней (4, 6, 8, 12, 14, 16, 19)
                            let isAsiLevel = false;
                            if (source.startsWith('class-')) {
                                const levelMatch = source.match(/^class-(\d+)-/);
                                if (levelMatch) {
                                    const level = parseInt(levelMatch[1]);
                                    isAsiLevel = [4, 6, 8, 12, 14, 16, 19].includes(level);
                                }
                            } else if (draft.basics.class && source.startsWith(draft.basics.class + '-')) {
                                // Проверяем формат class-level-index- (например, paladin-4-0-)
                                const levelMatch = source.match(new RegExp(`^${draft.basics.class}-(\\d+)-`));
                                if (levelMatch) {
                                    const level = parseInt(levelMatch[1]);
                                    isAsiLevel = [4, 6, 8, 12, 14, 16, 19].includes(level);
                                }
                            }
                            
                            const finalIsAsi = isAsi || isAsiLevel;
                            
                            console.log('🎯 ChoiceRenderer feat detection:', {
                                source,
                                featKey,
                                isAsi,
                                isAsiLevel,
                                finalIsAsi,
                                classKey: draft.basics.class,
                                allFeatsCount: ALL_FEATS.length,
                                abilityScoreImprovementExists: ALL_FEATS.find(f => f.key === 'ability-score-improvement')?.name
                            });
                            
                            // Если это не ASI, исключаем уже выбранные фиты
                            if (!finalIsAsi) {
                                // Получаем все уже выбранные фиты (кроме текущего)
                                const allSelectedFeats = draft.chosen.feats
                                    .filter(f => !f.startsWith(featKey + ':'))
                                    .map(f => f.split(':')[1])
                                    .filter(Boolean);
                                
                                // Исключаем "Увеличение характеристик" для не-ASI источников
                                availableFeats = ALL_FEATS.filter(feat => 
                                    feat.key !== "ability-score-improvement" && 
                                    !allSelectedFeats.includes(feat.key) &&
                                    !feat.isHidden // Исключаем скрытые черты
                                );
                            } else {
                                // Для ASI показываем "Увеличение характеристик" (можно переиспользовать) 
                                // и исключаем только фиты, выбранные в других ASI источниках
                                const currentClass = draft.basics.class;
                                const asiSelectedFeats = draft.chosen.feats
                                    .filter(f => {
                                        // Исключаем текущий выбор
                                        if (f.startsWith(featKey + ':')) return false;
                                        
                                        // Включаем только ASI источники (источники класса с уровнями 4,6,8,12,14,16,19)
                                        const sourceKey = f.split(':')[0];
                                        if (!sourceKey.startsWith(currentClass + '-')) return false;
                                        
                                        // Проверяем, что это ASI уровень
                                        const levelMatch = sourceKey.match(new RegExp(`${currentClass}-(\\d+)-`));
                                        if (!levelMatch) return false;
                                        
                                        const level = parseInt(levelMatch[1]);
                                        return [4, 6, 8, 12, 14, 16, 19].includes(level);
                                    })
                                    .map(f => f.split(':')[1])
                                    .filter(Boolean);
                                
                                availableFeats = ALL_FEATS.filter(feat => 
                                    (feat.key === "ability-score-improvement" || 
                                    !asiSelectedFeats.includes(feat.key)) &&
                                    !feat.isHidden // Исключаем скрытые черты
                                );
                                
                                console.log('🎯 ASI available feats:', {
                                    totalFeats: ALL_FEATS.length,
                                    availableCount: availableFeats.length,
                                    abilityScoreImprovementIncluded: availableFeats.some(f => f.key === 'ability-score-improvement'),
                                    firstFewFeats: availableFeats.slice(0, 5).map(f => f.name)
                                });
                            }

                            return (
                                <div key={choiceKey} className="space-y-2">
                                    <select
                                        className={getSelectStyles(!!selected)}
                                        value={selected}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            const prevFeat = selected;
                                            const featKey = `${source}-${idx}`;

                                            if (!value) {
                                                // Удаляем фит и очищаем связанные выборы
                                                if (prevFeat) {
                                                    const newFeats = draft.chosen.feats.filter(f => !f.startsWith(featKey + ':'));
                                                    setChosenFeats(newFeats);
                                                    cleanupFeatChoices(prevFeat);
                                                }
                                            } else {
                                                // Сохраняем новый фит с уникальным ключом
                                                const newFeats = [
                                                    ...draft.chosen.feats.filter(f => !f.startsWith(featKey + ':')),
                                                    `${featKey}:${value}`,
                                                ];
                                                console.log('ChoiceRenderer: Сохраняем талант:', {
                                                    source,
                                                    featKey,
                                                    value,
                                                    newFeats,
                                                    currentFeats: draft.chosen.feats
                                                });
                                                setChosenFeats(newFeats);

                                                // Очищаем выборы предыдущего фита
                                                if (prevFeat) {
                                                    cleanupFeatChoices(prevFeat);
                                                }
                                            }
                                        }}
                                    >
                                        <option value="">— Выберите талант —</option>
                                        {availableFeats.map((feat) => (
                                            <option key={feat.key} value={feat.key}>
                                                {feat.name}
                                            </option>
                                        ))}
                                    </select>

                                    {/* Карточка выбранного фита */}
                                    {selected && (() => {
                                        const feat = ALL_FEATS.find(f => f.key === selected);
                                        if (!feat) return null;

                                        return (
                                            <div className="rounded-xl border border-stone-800 bg-gradient-to-b from-gray-100 to-gray-100 p-4 shadow-sm relative">
                                                <div className="absolute right-3 top-3 text-stone-500">
                                                    <Icons.Award className="w-5 h-5" />
                                                </div>

                                                <h4 className="font-semibold text-stone-900 tracking-wide">
                                                    {feat.name}
                                                </h4>

                                                {feat.desc && (
                                                    <p className="text-sm text-stone-800/80 mt-2 leading-relaxed">
                                                        {feat.desc}
                                                    </p>
                                                )}

                                                {/* Эффекты фита */}
                                                {feat.effect?.map((eff, ei) => (
                                                    <div
                                                        key={ei}
                                                        className="mt-3 rounded border border-stone-200 bg-stone-50/70 p-2"
                                                    >
                                                        <div className="font-medium text-stone-900">
                                                            {eff.name}
                                                        </div>
                                                        {eff.desc && (
                                                            <p className="text-xs text-stone-800/70 mt-1">
                                                                {eff.desc}
                                                            </p>
                                                        )}

                                                        {/* Рекурсивный рендер выборов эффекта */}
                                                        {eff.choices && (
                                                            <div className="mt-2">
                                                                <ChoiceRenderer
                                                                    source={`feat:${feat.key}:effect-${ei}`}
                                                                    choices={eff.choices}
                                                                    ci={ci * 100 + ei}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })()}
                                </div>
                            );
                        });
                    }

                    // ========================================================================
                    // ВЫБОР БОЕВЫХ СТИЛЕЙ
                    // ========================================================================
                    case "fighting-style": {
                        const availableStyles = FIGHTING_STYLES;
                        const selectedStyles: string[] = draft.chosen.fightingStyle?.[source] || [];
                        const hasUnfinishedChoice = selectedStyles.length === 0;

                        return (
                            <div
                                key={`${source}:fighting-style:${ci}`}
                                className="relative space-y-2"
                            >
                                <select
                                    className={getSelectStyles(!!selectedStyles[0])}
                                    value={selectedStyles[0] || ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setChosenFightingStyle(source, value ? [value] : []);
                                    }}
                                >
                                    <option value="">— Выберите боевой стиль —</option>
                                    {availableStyles.map((fs) => (
                                        <option key={fs.key} value={fs.key}>
                                            {fs.name}
                                        </option>
                                    ))}
                                </select>

                                {/* Описание выбранного стиля */}
                                {selectedStyles.length > 0 && (
                                    <div className="mt-2 p-2 border rounded bg-stone-50 text-xs text-stone-800 space-y-1">
                                        {selectedStyles.map((key) => {
                                            const style = availableStyles.find(fs => fs.key === key);
                                            if (!style) return null;
                                            return <div key={key}>{style.desc}</div>;
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    // ========================================================================
                    // ВЫБОР НАВЫКОВ
                    // ========================================================================
                    case "skill": {
                        return Array.from({ length: choice.count ?? 1 }).map((_, idx) => {
                            const choiceKey = `${source}:skill:${ci}:${idx}`;
                            const sourceArray = draft.chosen.skills?.[source] || [];
                            const selected = sourceArray[idx] ?? "";

                            console.log('ChoiceRenderer: skill case:', {
                                source,
                                sourceArray,
                                selected,
                                idx,
                                allChosenSkills: draft.chosen.skills,
                                isSelectedEmpty: selected === "",
                                isSourceArrayEmpty: sourceArray.length === 0
                            });
                            
                            // Защита от сброса: если данные есть в драфте, но селект пустой
                            if (sourceArray.length > 0 && selected === "") {
                                console.warn('ChoiceRenderer: Potential skill select reset detected!', {
                                    source,
                                    sourceArray,
                                    selected,
                                    idx
                                });
                            }

                            // Получаем фиксированные навыки (ВСЕГДА блокируются)
                            const fixedSkills = [
                                ...fixedData.background.skills,
                                ...fixedData.race.skills,
                                ...fixedData.class.skills,
                            ];

                            // Получаем ВСЕ навыки персонажа
                            const allData = getAllCharacterData(draft);
                            
                            // Занятые навыки = фиксированные + все выбранные (кроме текущего)
                            const takenSkills = [
                                ...fixedSkills,
                                ...allData.skills.filter(s => s && s !== selected && !fixedSkills.includes(s))
                            ];

                            // Все навыки (включая недоступные)
                            const allSkills = choice.options?.length ? choice.options : SKILLS.map(s => s.key);

                            return (
                                <select
                                    key={choiceKey}
                                    className={getSelectStyles(!!selected)}
                                    value={selected}
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        // Создаем массив фиксированной длины для сохранения позиций
                                        const updated = Array.from({ length: choice.count ?? 1 }, (_, i) => 
                                            i === idx ? value : (sourceArray[i] || "")
                                        );
                                        
                                        // Защита от дублирования: очищаем пустые значения
                                        const cleanedUpdated = updated.filter(val => val !== "");

                                        setChosenSkills(source, cleanedUpdated);
                                    }}
                                >
                                    <option value="">— Выберите навык —</option>
                                    {allSkills.map((key) => {
                                        const isTaken = takenSkills.includes(key);
                                        const skillSource = isTaken ? getSkillSource(key) : null;
                                        const label = SKILL_LABELS[key] ?? key;
                                        const displayLabel = skillSource ? `${label} (${skillSource})` : label;

                                        return (
                                            <option key={key} value={key} disabled={isTaken}>
                                                {displayLabel}
                                            </option>
                                        );
                                    })}
                                </select>
                            );
                        });
                    }


                    // ========================================================================
                    // НЕИЗВЕСТНЫЙ ТИП ВЫБОРА
                    // ========================================================================
                    default:
                        return null;
                }
            })}
        </div>
    );
}