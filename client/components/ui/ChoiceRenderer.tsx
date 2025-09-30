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
import { Tools, TOOL_CATEGORY_LABELS } from "@/data/items/tools";
import { CLASS_CATALOG } from "@/data/classes/";
import { FEATURES } from "@/data/classes/features/features";
import { FIGHTING_STYLES } from "@/data/classes/features/fightingStyles";
import { SKILLS, SKILL_LABELS } from "@/data/skills"; 
import { getAllCharacterData } from "@/utils/getAllCharacterData";
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
        
        // Функции для работы с языками
        setChosenLanguages,
        removeChosenLanguage,
        
        // Функции для работы с заклинаниями
        setChosenSpells,
        removeChosenSpell,
        
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
        
        const baseStyles = "w-full rounded-lg border-2 p-3 text-sm font-medium shadow-sm transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-primary/20 focus:outline-none mt-2";
        
        if (isUnfinished) {
            return `${baseStyles} border-blue-400 bg-blue-50/30 text-blue-800 hover:border-blue-500 focus:border-blue-500`;
        }
        
        // Для выбранных значений используем стандартные стили
        return `${baseStyles} border-stone-300 bg-white hover:border-primary/50 focus:border-primary`;
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
        Object.keys(draft.chosen.languages).forEach((key) => {
            if (key.startsWith(cleanupPrefix)) setChosenLanguages(key, []);
        });
        Object.keys(draft.chosen.spells).forEach((key) => {
            if (key.startsWith(cleanupPrefix)) setChosenSpells(key, []);
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
        Object.keys(draft.chosen.languages).forEach((key) => {
            if (key.startsWith(cleanupPrefix)) setChosenLanguages(key, []);
        });
        Object.keys(draft.chosen.spells).forEach((key) => {
            if (key.startsWith(cleanupPrefix)) setChosenSpells(key, []);
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
                                <option value="">Выберите подкласс</option>
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
                        return Array.from({ length: choice.count ?? 1 }).map((_, idx) => {
                            const choiceKey = `${source}:ability:${ci}:${idx}`;
                            const sourceArray = draft.chosen.abilities?.[source] || [];
                            const selected = sourceArray[idx] ?? "";

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
                                        ).filter((item): item is keyof Abilities => item !== "");
                                        
                                        setChosenAbilities(source, updated);
                                    }}
                                >
                                    <option value="">Выберите характеристику</option>
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
                                available = available.filter(s => s.classes?.includes((choice as any).spellClass));
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
                                        <option value="">Выберите заклинание</option>
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
                    // ВЫБОР ИНСТРУМЕНТОВ
                    // ========================================================================
                    case "tool": {
                        return Array.from({ length: choice.count ?? 1 }).map((_, idx) => {
                            const choiceKey = `${source}:tool:${ci}:${idx}`;
                            const sourceArray = draft.chosen.tools?.[source] || [];
                            const selected = sourceArray[idx] ?? "";
                            const takenExceptCurrent = sourceArray.filter((_, i) => i !== idx);

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
                                        <option value="">Выберите инструмент</option>
                                        {choice.options
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
                                    <option value="">Выберите язык</option>
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
                        const availableFeatures = FEATURES;
                        const selected = draft.chosen.features?.[source] || [];
                        console.log(`ChoiceRenderer: Getting features for source "${source}":`, selected);
                        const selectedFeature = selected[0] 
                            ? availableFeatures.find(f => f.key === selected[0]) 
                            : null;

                        // Проверяем завершенность всех подвыборов корректно по соответствующим сторам
                        const isChoiceComplete = selectedFeature?.choices?.every((subChoice) => {
                            const subSource = `feature-${selectedFeature.key}`;
                            const cnt = subChoice.count ?? 1;
                            switch (subChoice.type) {
                                case "ability":
                                    return (draft.chosen.abilities?.[subSource]?.length || 0) >= cnt;
                                case "skill":
                                    return (draft.chosen.skills?.[subSource]?.length || 0) >= cnt;
                                case "tool":
                                    return (draft.chosen.tools?.[subSource]?.length || 0) >= cnt;
                                case "language":
                                    return (draft.chosen.languages?.[subSource]?.length || 0) >= cnt;
                                case "spell":
                                    return (draft.chosen.spells?.[subSource]?.length || 0) >= cnt;
                                case "feature":
                                    return (draft.chosen.features?.[subSource]?.length || 0) >= cnt;
                                case "fighting-style":
                                    return (draft.chosen.fightingStyle?.[subSource]?.length || 0) >= cnt;
                                default:
                                    return true;
                            }
                        }) ?? true;

                        return (
                            <div key={`${source}:feature:${ci}`} className="space-y-2">
                                <select
                                    className={getSelectStyles(!!selected[0])}
                                    value={selected[0] || ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        const prevFeature = selected[0];
                                        
                                        console.log(`ChoiceRenderer: Setting feature for source "${source}" to:`, value);
                                        
                                        // Очищаем вложенные выборы предыдущей особенности
                                        if (prevFeature) {
                                            cleanupFeatureChoices(prevFeature);
                                        }
                                        
                                        setChosenFeatures(source, value ? [value] : []);
                                    }}
                                >
                                    <option value="">Выберите особенность</option>
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
                                (source.startsWith('fighter-') && source.includes('-') && 
                                 draft.basics.class && source.startsWith(draft.basics.class + '-'));
                            
                            // Если это не ASI, исключаем уже выбранные фиты
                            if (!isAsi) {
                                // Получаем все уже выбранные фиты (кроме текущего)
                                const allSelectedFeats = draft.chosen.feats
                                    .filter(f => !f.startsWith(featKey + ':'))
                                    .map(f => f.split(':')[1])
                                    .filter(Boolean);
                                
                                // Исключаем "Увеличение характеристик" для не-ASI источников
                                availableFeats = ALL_FEATS.filter(feat => 
                                    feat.key !== "ability-score-improvement" && 
                                    !allSelectedFeats.includes(feat.key)
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
                                    feat.key === "ability-score-improvement" || 
                                    !asiSelectedFeats.includes(feat.key)
                                );
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
                                                setChosenFeats(newFeats);

                                                // Очищаем выборы предыдущего фита
                                                if (prevFeat) {
                                                    cleanupFeatChoices(prevFeat);
                                                }
                                            }
                                        }}
                                    >
                                        <option value="">Выберите талант</option>
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
                                    <option value="">Выберите боевой стиль</option>
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

                            // Чтобы не было дублей
                            const takenExceptCurrent = sourceArray.filter((_, i) => i !== idx);

                            // Список доступных навыков
                            const available = (choice.options?.length ? choice.options : SKILLS.map(s => s.key))
                                .filter((key) => !takenExceptCurrent.includes(key) || key === selected);

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
                                        ).filter((v) => v !== "");

                                        setChosenSkills(source, updated);
                                    }}
                                >
                                    <option value="">Выберите навык</option>
                                    {available.map((key) => (
                                        <option key={key} value={key}>
                                            {SKILL_LABELS[key] ?? key}
                                        </option>
                                    ))}
                                </select>
                            );
                        });
                    }


                    // ========================================================================
                    // НЕИЗВЕСТНЫЙ ТИП ВЫБОРА
                    // ========================================================================
                    default:
                        console.warn(`Unknown choice type: ${choice.type}`);
                        return null;
                }
            })}
        </div>
    );
}