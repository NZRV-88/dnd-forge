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
        case "ability":
            return (draft.chosen.abilities?.[source]?.filter(a => a).length || 0) >= count;
        case "skill":
            return (draft.chosen.skills?.[source]?.filter(s => s).length || 0) >= count;
        case "tool":
            return (draft.chosen.tools?.[source]?.filter(t => t).length || 0) >= count;
        case "tool-proficiency":
            return (draft.chosen.toolProficiencies?.[source]?.filter(t => t).length || 0) >= count;
        case "language":
            return (draft.chosen.languages?.[source]?.filter(l => l).length || 0) >= count;
        case "spell":
            return (draft.chosen.spells?.[source]?.filter(s => s).length || 0) >= count;
        case "feat":
            return (draft.chosen.feats?.filter(f => f.startsWith(`${source}-`)).length || 0) >= count;
        case "feature":
            return (draft.chosen.features?.[source]?.length || 0) >= count;
        case "fighting-style":
            return (draft.chosen.fightingStyle?.[source]?.length || 0) >= count;
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
                                if (!isChoiceComplete(choice, source, draft)) {
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
        
        // Проверяем выборы в чертах расы
        if (raceInfo?.traits) {
            raceInfo.traits.forEach((trait, traitIdx) => {
                if (trait.choices) {
                    const source = `race-${draft.basics.race}-trait-${traitIdx}`;
                    for (const choice of trait.choices) {
                        if (!isChoiceComplete(choice, source, draft)) {
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
                        const source = `race-${draft.basics.race}-subrace-${subrace.key}-trait-${traitIdx}`;
                        for (const choice of trait.choices) {
                            if (!isChoiceComplete(choice, source, draft)) {
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
                if (!isChoiceComplete(choice, source, draft)) {
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
                                    if (!isChoiceComplete(choice, source, draft)) {
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
                    const source = `background-${draft.basics.background}-feature-${i}`;
                    for (const choice of feature.choices) {
                        if (!isChoiceComplete(choice, source, draft)) {
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

