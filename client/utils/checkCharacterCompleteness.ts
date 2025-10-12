import { CharacterDraft } from "@/store/character";
import { getClassByKey } from "@/data/classes";
import { getRaceByKey } from "@/data/races";
import { getBackgroundByKey } from "@/data/backgrounds";
import { ALL_FEATS } from "@/data/feats/feats";
import type { ChoiceOption } from "@/data/shared/choices";
import { getAllCharacterData } from "@/utils/getAllCharacterData";

export interface IncompleteChoice {
    page: string;
    label: string;
    path: string;
}

/**
 * Рассчитывает максимальное количество подготовленных заклинаний для класса
 */
function getMaxPreparedSpells(draft: CharacterDraft, classInfo: any): number {
    if (!classInfo?.spellcasting) return 0;
    
    // Получаем формулу из данных класса
    const levelSlots = classInfo.spellcasting.progression[draft.basics.level as keyof typeof classInfo.spellcasting.progression];
    const formula = levelSlots?.prepared || classInfo.spellcasting.preparedFormula || "Math.max(1, level + chaMod)";
    
    // Получаем финальные характеристики
    const characterData = getAllCharacterData(draft);
    
    // Получаем модификатор основной характеристики
    const abilityKey = classInfo.spellcasting.ability;
    const baseAbilityScore = Number(draft.stats?.[abilityKey]) || 10;
    const abilityBonus = characterData.abilityBonuses?.[abilityKey] || 0;
    const finalAbilityScore = baseAbilityScore + abilityBonus;
    const abilityMod = Math.floor((finalAbilityScore - 10) / 2);
    
    // Выполняем формулу
    try {
        const processedFormula = formula
            .replace(/level/g, draft.basics.level.toString())
            .replace(/chaMod/g, abilityMod.toString());
        
        // eslint-disable-next-line no-eval
        return Math.max(0, Math.floor(eval(processedFormula)));
    } catch (error) {
        console.error('Ошибка в формуле подготовленных заклинаний:', error);
        return 1; // Fallback значение
    }
}

/**
 * Проверяет, завершен ли выбор
 */
function isChoiceComplete(choice: ChoiceOption, source: string, draft: CharacterDraft): boolean {
    const count = choice.count ?? 1;
    
    switch (choice.type) {
        case "ability": {
            const abilities = draft.chosen.abilities?.[source]?.filter(a => a) || [];
            const result = abilities.length >= count;
            return result;
        }
        case "skill": {
            const skills = draft.chosen.skills?.[source]?.filter(s => s) || [];
            const result = skills.length >= count;
            return result;
        }
        case "tool":
            return (draft.chosen.tools?.[source]?.filter(t => t).length || 0) >= count;
        case "tool-proficiency": {
            const toolProficiencies = draft.chosen.toolProficiencies?.[source]?.filter(t => t) || [];
            const result = toolProficiencies.length >= count;
            return result;
        }
        case "language":
            return (draft.chosen.languages?.[source]?.filter(l => l).length || 0) >= count;
        case "spell":
            // Для заклинаний нужно проверить и cantrips, и spells в зависимости от уровня
            const spellLevel = (choice as any).spellLevel ?? 0;
            const isCantrip = spellLevel === 0;
            
            if (isCantrip) {
                return (draft.chosen.cantrips?.[source]?.filter(s => s).length || 0) >= count;
            } else {
                return (draft.chosen.spells?.[source]?.filter(s => s).length || 0) >= count;
            }
        case "feat": {
            const selectedFeats = draft.chosen.feats?.filter(f => f.startsWith(`${source}-`)) || [];
            const result = selectedFeats.length >= count;
            return result;
        }
        case "feature":
            return (draft.chosen.features?.[source]?.length || 0) >= count;
        case "fighting-style":
            return (draft.chosen.fightingStyle?.[source]?.length || 0) >= count;
        case "weapon-mastery": {
            const weaponMasteryArray = draft.chosen.weaponMastery?.[source] || [];
            const weaponMastery = weaponMasteryArray.filter(w => w).length;
            const result = weaponMastery >= count;
            return result;
        }
        case "subclass":
            return !!draft.basics.subclass;
        default:
            return true;
    }
}

/**
 * Проверяет завершенность всех выборов персонажа
 */
export function checkCharacterCompleteness(draft: CharacterDraft): IncompleteChoice[] {
    const incomplete: IncompleteChoice[] = [];

    // Проверяем класс
    if (!draft.basics.class) {
        incomplete.push({ 
            page: 'class', 
            label: 'Класс не выбран', 
            path: `/create/${draft.id}/class` 
        });
    } else {
        const classInfo = getClassByKey(draft.basics.class);
        if (classInfo?.features) {
            // Проверяем выборы в особенностях класса по уровням
            Object.entries(classInfo.features).forEach(([level, features]) => {
                const levelNum = Number(level);
                if (levelNum <= draft.basics.level) {
                    features.forEach((feature, featureIdx) => {
                        if (feature.choices) {
                            const source = `${draft.basics.class}-${level}-${featureIdx}-`;
                            for (const choice of feature.choices) {
                                const isComplete = isChoiceComplete(choice, source, draft);
                                if (!isComplete) {
                                    incomplete.push({ 
                                        page: 'class', 
                                        label: `Класс: не завершены выборы в "${feature.name}"`, 
                                        path: `/create/${draft.id}/class` 
                                    });
                                    return; // Выходим из цикла features
                                }
                            }
                        }
                    });
                }
            });
        }
        
        // Проверяем подготовленные заклинания для заклинателей
        if (classInfo?.spellcasting) {
            const maxPreparedSpells = getMaxPreparedSpells(draft, classInfo);
            const preparedSpells = draft.chosen.spells?.[draft.basics.class] || [];
            const currentPreparedCount = preparedSpells.length;
            
            if (maxPreparedSpells > 0 && currentPreparedCount < maxPreparedSpells) {
                incomplete.push({ 
                    page: 'class', 
                    label: `Заклинания: подготовлено ${currentPreparedCount}/${maxPreparedSpells} заклинаний`, 
                    path: `/create/${draft.id}/class` 
                });
            }
        }
        
        // Проверяем выборы в подклассе, если он выбран
        if (draft.basics.subclass && classInfo?.subclasses) {
            const subclass = classInfo.subclasses.find(sc => sc.key === draft.basics.subclass);
            if (subclass?.features) {
                Object.entries(subclass.features).forEach(([level, features]) => {
                    const levelNum = Number(level);
                    if (levelNum <= draft.basics.level) {
                        features.forEach((feature, featureIdx) => {
                        if (feature.choices) {
                            const source = `${draft.basics.class}-subclass-${subclass.key}-${level}-${featureIdx}-`;
                            for (const choice of feature.choices) {
                                if (!isChoiceComplete(choice, source, draft)) {
                                        incomplete.push({ 
                                            page: 'class', 
                                            label: `Подкласс: не завершены выборы в "${feature.name}"`, 
                                            path: `/create/${draft.id}/class` 
                                        });
                                        return;
                                    }
                                }
                            }
                        });
                    }
                });
            }
        }
    }

    // Проверяем расу
    if (!draft.basics.race) {
        incomplete.push({ 
            page: 'race', 
            label: 'Раса не выбрана', 
            path: `/create/${draft.id}/race` 
        });
            } else {
                const raceInfo = getRaceByKey(draft.basics.race);
                
                // Проверяем, выбрано ли наследие для Драконорожденного
                if (raceInfo?.ancestries && raceInfo.ancestries.length > 0 && !draft.basics.subrace) {
                    incomplete.push({ 
                        page: 'race', 
                        label: 'Наследие дракона не выбрано', 
                        path: `/create/${draft.id}/race` 
                    });
                    return incomplete; // Выходим рано, так как без наследия нельзя продолжить
                }
                
                // Проверяем выборы в чертах расы
        if (raceInfo?.traits) {
            raceInfo.traits.forEach((trait, traitIdx) => {
                if (trait.choices) {
                    const baseSource = `race-${draft.basics.race}-trait-${traitIdx}`;
                    // Ищем все возможные источники для этой черты (с учетом суффиксов)
                    const possibleSources = [
                        ...Object.keys(draft.chosen.abilities || {}),
                        ...Object.keys(draft.chosen.skills || {}),
                        ...Object.keys(draft.chosen.languages || {}),
                        ...Object.keys(draft.chosen.tools || {}),
                        ...Object.keys(draft.chosen.spells || {}),
                        ...Object.keys(draft.chosen.cantrips || {}),
                        // Для талантов ищем в массиве feats, а не в объекте
                        ...(draft.chosen.feats || []).map(feat => feat.split(':')[0]).filter(key => key.startsWith(baseSource))
                    ].filter(key => key.startsWith(baseSource));
                    
                        for (const choice of trait.choices) {
                            // Проверяем все возможные источники
                            let isComplete = false;
                            let actualSource = baseSource;
                            
                            for (const source of possibleSources) {
                                const result = isChoiceComplete(choice, source, draft);
                                if (result) {
                                    isComplete = true;
                                    actualSource = source;
                                    break;
                                }
                            }
                        
                        if (!isComplete) {
                            incomplete.push({ 
                                page: 'race', 
                                label: `Раса: не завершены выборы в "${trait.name}"`, 
                                path: `/create/${draft.id}/race` 
                            });
                            return; // Выходим из цикла traits
                        }
                    }
                }
            });
        }
        
        // Проверяем выборы в подрасе, если она выбрана
        if (draft.basics.subrace && raceInfo?.subraces) {
            const subrace = raceInfo.subraces.find(sr => sr.key === draft.basics.subrace);
            if (subrace?.traits) {
                subrace.traits.forEach((trait, traitIdx) => {
                    if (trait.choices) {
                        const baseSource = `subrace-${draft.basics.subrace}-trait-${traitIdx}`;
                        // Ищем все возможные источники для этой черты подрасы (с учетом суффиксов)
                        const possibleSources = [
                            ...Object.keys(draft.chosen.abilities || {}),
                            ...Object.keys(draft.chosen.skills || {}),
                            ...Object.keys(draft.chosen.languages || {}),
                            ...Object.keys(draft.chosen.spells || {}),
                            ...Object.keys(draft.chosen.cantrips || {}),
                            // Для талантов ищем в массиве feats, а не в объекте
                            ...(draft.chosen.feats || []).map(feat => feat.split(':')[0]).filter(key => key.startsWith(baseSource))
                        ].filter(key => key.startsWith(baseSource));
                        
                        for (const choice of trait.choices) {
                            // Проверяем все возможные источники
                            let isComplete = false;
                            let actualSource = baseSource;
                            
                            for (const source of possibleSources) {
                                const result = isChoiceComplete(choice, source, draft);
                                if (result) {
                                    isComplete = true;
                                    actualSource = source;
                                    break;
                                }
                            }
                            
                            if (!isComplete) {
                                incomplete.push({ 
                                    page: 'race', 
                                    label: `Подраса: не завершены выборы в "${trait.name}"`, 
                                    path: `/create/${draft.id}/race` 
                                });
                                return;
                            }
                        }
                    }
                });
            }
        }
        
        // Проверяем выборы в наследии, если оно выбрано (для Драконорожденного)
        if (draft.basics.subrace && raceInfo?.ancestries) {
            const ancestry = raceInfo.ancestries.find(anc => anc.key === draft.basics.subrace);
            if (ancestry) {
                // DraconicAncestry не имеет traits, поэтому пропускаем проверку choices
                // Наследие дракона не требует дополнительных выборов
            }
        }
    }

    // Проверяем предысторию
    if (!draft.basics.background) {
        incomplete.push({ 
            page: 'background', 
            label: 'Предыстория не выбрана', 
            path: `/create/${draft.id}/background` 
        });
    } else {
        const bgInfo = getBackgroundByKey(draft.basics.background);
        
        // Проверяем choices предыстории
        if (bgInfo?.choices) {
            const source = `background-${draft.basics.background}-traits`;
            for (const choice of bgInfo.choices) {
                const isComplete = isChoiceComplete(choice, source, draft);
                if (!isComplete) {
                    incomplete.push({ 
                        page: 'background', 
                        label: 'Предыстория: не завершены выборы', 
                        path: `/create/${draft.id}/background` 
                    });
                    break;
                }
            }
        }
        
        // Проверяем features предыстории
        if (bgInfo?.feature) {
            const features = Array.isArray(bgInfo.feature) ? bgInfo.feature : [bgInfo.feature];
            for (let i = 0; i < features.length; i++) {
                const feature = features[i];
                
                // Если это feat, проверяем его выборы
                if (feature.feat) {
                    const featInfo = ALL_FEATS.find(f => f.key === feature.feat);
                    if (featInfo?.effect) {
                        for (const eff of featInfo.effect) {
                            if (eff.choices) {
                                const source = `background-${draft.basics.background}-feat-${feature.feat}`;
                                for (const choice of eff.choices) {
                                    const isComplete = isChoiceComplete(choice, source, draft);
                                    if (!isComplete) {
                                        incomplete.push({ 
                                            page: 'background', 
                                            label: `Предыстория: не завершены выборы в "${feature.name}"`, 
                                            path: `/create/${draft.id}/background` 
                                        });
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
                
                // Обычная особенность с choices
                if (feature.choices) {
                    const baseSource = `background-${draft.basics.background}-feature-${i}`;
                    // Ищем все возможные источники для этой feature (с учетом суффиксов)
                    const possibleSources = [
                        ...Object.keys(draft.chosen.abilities || {}),
                        ...Object.keys(draft.chosen.skills || {}),
                        ...Object.keys(draft.chosen.languages || {}),
                        ...Object.keys(draft.chosen.tools || {}),
                        ...Object.keys(draft.chosen.spells || {}),
                        ...Object.keys(draft.chosen.cantrips || {}),
                        ...Object.keys(draft.chosen.toolProficiencies || {}),
                        ...Object.keys(draft.chosen.fightingStyle || {}),
                        ...Object.keys(draft.chosen.weaponMastery || {}),
                        ...Object.keys(draft.chosen.features || {}),
                        // Для талантов ищем в массиве feats, а не в объекте
                        ...(draft.chosen.feats || []).map(feat => feat.split(':')[0]).filter(key => key.startsWith(baseSource))
                    ].filter(key => key.startsWith(baseSource));
                    
                    for (const choice of feature.choices) {
                        // Проверяем все возможные источники
                        let isComplete = false;
                        let actualSource = baseSource;
                        
                        for (const source of possibleSources) {
                            const result = isChoiceComplete(choice, source, draft);
                            if (result) {
                                isComplete = true;
                                actualSource = source;
                                break;
                            }
                        }
                        
                        if (!isComplete) {
                            incomplete.push({ 
                                page: 'background', 
                                label: `Предыстория: не завершены выборы в "${feature.name}"`, 
                                path: `/create/${draft.id}/background` 
                            });
                            break;
                        }
                    }
                }
            }
        }
    }

    // Проверяем способности
    if (!draft.stats || Object.values(draft.stats).some(v => v < 8)) {
        incomplete.push({ 
            page: 'abilities', 
            label: 'Характеристики не распределены', 
            path: `/create/${draft.id}/abilities` 
        });
    }

    return incomplete;
}