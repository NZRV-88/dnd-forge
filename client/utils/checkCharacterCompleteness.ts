import { CharacterDraft } from "@/store/character";
import { getClassByKey } from "@/data/classes";
import { getRaceByKey } from "@/data/races";
import { getBackgroundByKey } from "@/data/backgrounds";
import { ALL_FEATS } from "@/data/feats/feats";
import type { ChoiceOption } from "@/data/shared/choices";

export interface IncompleteChoice {
    page: string;
    label: string;
    path: string;
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
            console.log('isChoiceComplete: ability:', {
                choice,
                source,
                count,
                abilities,
                result,
                allChosenAbilities: draft.chosen.abilities,
                draftId: draft.id,
                background: draft.basics.background
            });
            return result;
        }
        case "skill": {
            const skills = draft.chosen.skills?.[source]?.filter(s => s) || [];
            const result = skills.length >= count;
            console.log('isChoiceComplete: skill:', {
                choice,
                source,
                count,
                skills,
                result,
                allChosenSkills: draft.chosen.skills
            });
            return result;
        }
        case "tool":
            return (draft.chosen.tools?.[source]?.filter(t => t).length || 0) >= count;
        case "tool-proficiency": {
            const toolProficiencies = draft.chosen.toolProficiencies?.[source]?.filter(t => t) || [];
            const result = toolProficiencies.length >= count;
            console.log('isChoiceComplete: tool-proficiency:', {
                choice,
                source,
                count,
                toolProficiencies,
                result
            });
            return result;
        }
        case "language":
            return (draft.chosen.languages?.[source]?.filter(l => l).length || 0) >= count;
        case "spell":
            return (draft.chosen.spells?.[source]?.filter(s => s).length || 0) >= count;
        case "feat": {
            const selectedFeats = draft.chosen.feats?.filter(f => f.startsWith(`${source}:`)) || [];
            const result = selectedFeats.length >= count;
            console.log('=== isChoiceComplete: feat ===');
            console.log('source:', source);
            console.log('count:', count);
            console.log('searchPrefix:', `${source}:`);
            console.log('allFeats:', JSON.stringify(draft.chosen.feats || []));
            console.log('selectedFeats:', JSON.stringify(selectedFeats));
            console.log('result:', result);
            console.log('===============================');
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
            console.log('isChoiceComplete: weapon-mastery:', {
                choice,
                source,
                count,
                weaponMasteryArray,
                weaponMastery,
                result,
                allChosenWeaponMastery: draft.chosen.weaponMastery
            });
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
                            console.log('checkCharacterCompleteness: Проверяем особенность класса:', {
                                feature: feature.name,
                                featureKey: feature.key,
                                source,
                                choices: feature.choices
                            });
                            for (const choice of feature.choices) {
                                const isComplete = isChoiceComplete(choice, source, draft);
                                console.log('checkCharacterCompleteness: Результат проверки особенности:', {
                                    feature: feature.name,
                                    choice: choice.type,
                                    source,
                                    isComplete
                                });
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
            console.log('checkCharacterCompleteness: Проверяем черты расы:', {
                race: draft.basics.race,
                traits: raceInfo.traits
            });
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
                        // Для талантов ищем в массиве feats, а не в объекте
                        ...(draft.chosen.feats || []).map(feat => feat.split(':')[0]).filter(key => key.startsWith(baseSource))
                    ].filter(key => key.startsWith(baseSource));
                    
                    console.log('checkCharacterCompleteness: Проверяем черту расы:', {
                        trait,
                        traitIdx,
                        baseSource,
                        possibleSources
                    });
                    
                        for (const choice of trait.choices) {
                            console.log('checkCharacterCompleteness: Проверяем выбор черты расы:', {
                                traitName: trait.name,
                                traitIdx,
                                choice,
                                baseSource,
                                possibleSources
                            });
                            
                            // Проверяем все возможные источники
                            let isComplete = false;
                            let actualSource = baseSource;
                            
                            for (const source of possibleSources) {
                                const result = isChoiceComplete(choice, source, draft);
                                console.log('checkCharacterCompleteness: Проверка выбора черты расы:', {
                                    choice,
                                    source,
                                    result
                                });
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
                console.log('checkCharacterCompleteness: Проверяем черты подрасы:', {
                    subrace: draft.basics.subrace,
                    traits: subrace.traits
                });
                subrace.traits.forEach((trait, traitIdx) => {
                    if (trait.choices) {
                        const baseSource = `subrace-${draft.basics.subrace}-trait-${traitIdx}`;
                        // Ищем все возможные источники для этой черты подрасы (с учетом суффиксов)
                        const possibleSources = [
                            ...Object.keys(draft.chosen.abilities || {}),
                            ...Object.keys(draft.chosen.skills || {}),
                            ...Object.keys(draft.chosen.languages || {}),
                            ...Object.keys(draft.chosen.spells || {}),
                            // Для талантов ищем в массиве feats, а не в объекте
                            ...(draft.chosen.feats || []).map(feat => feat.split(':')[0]).filter(key => key.startsWith(baseSource))
                        ].filter(key => key.startsWith(baseSource));
                        
                        console.log('checkCharacterCompleteness: Проверяем черту подрасы:', {
                            trait,
                            traitIdx,
                            baseSource,
                            possibleSources
                        });
                        
                        for (const choice of trait.choices) {
                            // Проверяем все возможные источники
                            let isComplete = false;
                            let actualSource = baseSource;
                            
                            for (const source of possibleSources) {
                                const result = isChoiceComplete(choice, source, draft);
                                console.log('checkCharacterCompleteness: Проверка выбора черты подрасы:', {
                                    choice,
                                    source,
                                    result
                                });
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
            if (ancestry?.traits) {
                console.log('checkCharacterCompleteness: Проверяем черты наследия:', {
                    ancestry: draft.basics.subrace,
                    traits: ancestry.traits
                });
                ancestry.traits.forEach((trait, traitIdx) => {
                    if (trait.choices) {
                        const baseSource = `ancestry-${draft.basics.subrace}-trait-${traitIdx}`;
                        // Ищем все возможные источники для этой черты наследия (с учетом суффиксов)
                        const possibleSources = [
                            ...Object.keys(draft.chosen.abilities || {}),
                            ...Object.keys(draft.chosen.skills || {}),
                            ...Object.keys(draft.chosen.languages || {}),
                            ...Object.keys(draft.chosen.tools || {}),
                            ...Object.keys(draft.chosen.spells || {}),
                            // Для талантов ищем в массиве feats, а не в объекте
                            ...(draft.chosen.feats || []).map(feat => feat.split(':')[0]).filter(key => key.startsWith(baseSource))
                        ].filter(key => key.startsWith(baseSource));
                        
                        console.log('checkCharacterCompleteness: Проверяем черту наследия:', {
                            trait,
                            traitIdx,
                            baseSource,
                            possibleSources
                        });
                        
                        for (const choice of trait.choices) {
                            // Проверяем все возможные источники
                            let isComplete = false;
                            let actualSource = baseSource;
                            
                            for (const source of possibleSources) {
                                const result = isChoiceComplete(choice, source, draft);
                                console.log('checkCharacterCompleteness: Проверка выбора черты наследия:', {
                                    choice,
                                    source,
                                    result
                                });
                                if (result) {
                                    isComplete = true;
                                    actualSource = source;
                                    break;
                                }
                            }
                            
                            if (!isComplete) {
                                incomplete.push({ 
                                    page: 'race', 
                                    label: `Наследие: не завершены выборы в "${trait.name}"`, 
                                    path: `/create/${draft.id}/race` 
                                });
                                return;
                            }
                        }
                    }
                });
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
            console.log('checkCharacterCompleteness: Проверяем выборы предыстории:', {
                background: draft.basics.background,
                source,
                choices: bgInfo.choices,
                chosenToolProficiencies: draft.chosen.toolProficiencies
            });
            for (const choice of bgInfo.choices) {
                const isComplete = isChoiceComplete(choice, source, draft);
                console.log('checkCharacterCompleteness: Проверка выбора:', {
                    choice,
                    source,
                    isComplete
                });
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
            console.log('checkCharacterCompleteness: Проверяем features предыстории:', {
                background: draft.basics.background,
                features: features
            });
            for (let i = 0; i < features.length; i++) {
                const feature = features[i];
                console.log('checkCharacterCompleteness: Проверяем feature:', {
                    feature,
                    index: i
                });
                
                // Если это feat, проверяем его выборы
                if (feature.feat) {
                    const featInfo = ALL_FEATS.find(f => f.key === feature.feat);
                    console.log('checkCharacterCompleteness: Проверяем feat:', {
                        featKey: feature.feat,
                        featInfo
                    });
                    if (featInfo?.effect) {
                        for (const eff of featInfo.effect) {
                            if (eff.choices) {
                                const source = `background-${draft.basics.background}-feat-${feature.feat}`;
                                console.log('checkCharacterCompleteness: Проверяем выборы feat:', {
                                    source,
                                    choices: eff.choices
                                });
                                for (const choice of eff.choices) {
                                    const isComplete = isChoiceComplete(choice, source, draft);
                                    console.log('checkCharacterCompleteness: Проверка выбора feat:', {
                                        choice,
                                        source,
                                        isComplete
                                    });
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
                    const possibleSources = Object.keys(draft.chosen.abilities || {}).filter(key => 
                        key.startsWith(baseSource)
                    );
                    
                    console.log('checkCharacterCompleteness: Проверяем выборы feature:', {
                        baseSource,
                        possibleSources,
                        choices: feature.choices
                    });
                    
                    for (const choice of feature.choices) {
                        // Проверяем все возможные источники
                        let isComplete = false;
                        let actualSource = baseSource;
                        
                        for (const source of possibleSources) {
                            const result = isChoiceComplete(choice, source, draft);
                            console.log('checkCharacterCompleteness: Проверка выбора feature:', {
                                choice,
                                source,
                                result
                            });
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

