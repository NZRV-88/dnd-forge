import { CharacterDraft } from "@/store/character";
import { getFixedRaceData } from "@/utils/getFixedRaceData";
import { getFixedClassData } from "@/utils/getFixedClassData";
import { getFixedBackgroundData } from "@/utils/getFixedBackgroundData";
import { getBackgroundByKey } from "@/data/backgrounds";
import { getClassByKey } from "@/data/classes";
import { getFeatByKey } from "@/data/feats";
import { Abilities } from "@/data/abilities";
import { ABILITIES } from "@/data/abilities";
import { SKILLS } from "@/data/skills";
import { Tools } from "@/data/items/tools"; // поправь путь
import { Weapons } from "@/data/items/weapons";
import { Armors } from "@/data/items/armors";
import { getEffectiveSpeed } from "@/data/races/types";
import { getRaceByKey, getSubraceByKey } from "@/data/races/index";
import { applyProficiencies, Proficiency } from "@/data/proficiencies";

/**
 * Собирает итоговые данные персонажа из draft:
 * фиксированные + выбранные игроком.
 */
export function getAllCharacterData(draft: CharacterDraft) {
    const skills = new Set<string>();
    const tools = new Set<string>();
    const toolProficiencies = new Set<string>();
    const languages = new Set<string>();
    const spells = new Set<string>();
    const feats = new Set<string>();
    const weapons = new Set<string>();
    const armors = new Set<string>();
    const savingThrows = new Set<string>();
    const abilityBonuses: Partial<Record<keyof Abilities, number>> = {};
    // Динамические максимумы характеристик (по умолчанию 20)
    const abilityMax: Partial<Record<keyof Abilities, number>> = {};
    let speed: number | undefined;
    let initiativeBonus: number | undefined;

    // Отслеживание источников владений
    const proficiencySources: {
        skills: Record<string, string>;
        tools: Record<string, string>;
        weapons: Record<string, string>;
        armors: Record<string, string>;
        languages: Record<string, string>;
    } = {
        skills: {},
        tools: {},
        weapons: {},
        armors: {},
        languages: {}
    };

    /* -----------------------------
       Race / Subrace
    ----------------------------- */
    const raceFixed = getFixedRaceData(draft.basics.race, draft.basics.subrace);
    const raceName = getRaceByKey(draft.basics.race)?.name || "Раса";
    const subraceName = draft.basics.subrace ? getSubraceByKey(draft.basics.subrace)?.name : null;
    const raceSource = subraceName ? `${raceName} (${subraceName})` : raceName;
    
    raceFixed.proficiencies.skills.forEach(s => {
        skills.add(s);
        proficiencySources.skills[s] = raceSource;
    });
    raceFixed.proficiencies.tools.forEach(t => {
        tools.add(t);
        proficiencySources.tools[t] = raceSource;
    });
    raceFixed.languages.forEach(l => {
        languages.add(l);
        proficiencySources.languages[l] = raceSource;
    });
    raceFixed.spells.forEach(sp => spells.add(sp));
    speed = raceFixed.speed;
    for (const [k, v] of Object.entries(raceFixed.abilityBonuses)) {
        abilityBonuses[k as keyof Abilities] =
            (abilityBonuses[k as keyof Abilities] || 0) + v;
    }

    /* -----------------------------
       Class
    ----------------------------- */
    const classFixed = getFixedClassData(draft.basics.class);
    const className = getClassByKey(draft.basics.class)?.name || "Класс";
    
    classFixed.proficiencies.skills.forEach(s => {
        skills.add(s);
        proficiencySources.skills[s] = className;
    });
    classFixed.proficiencies.tools.forEach(t => {
        tools.add(t);
        proficiencySources.tools[t] = className;
    });
    classFixed.proficiencies.weapons.forEach(w => {
        weapons.add(w);
        proficiencySources.weapons[w] = className;
    });
    classFixed.proficiencies.armors.forEach(a => {
        armors.add(a);
        proficiencySources.armors[a] = className;
    });
    classFixed.proficiencies.savingThrows.forEach(s => savingThrows.add(s));

    /* -----------------------------
       Feats (fixed)
    ----------------------------- */
    for (const featKey of draft.chosen.feats) {
        feats.add(featKey);
        const feat = getFeatByKey(featKey);
        if (!feat) continue;
        const featName = feat.name;

        if (feat.effect) {
            for (const bonus of feat.effect) {
                // Бонусы к характеристикам
                if (bonus.abilities) {
                    for (const [k, v] of Object.entries(bonus.abilities)) {
                        abilityBonuses[k as keyof Abilities] =
                            (abilityBonuses[k as keyof Abilities] || 0) + v;
                    }
                }

                // Изменение максимума характеристик
                if ((bonus as any).abilityMax) {
                    for (const [k, v] of Object.entries((bonus as any).abilityMax as Record<string, number>)) {
                        const key = k as keyof Abilities;
                        abilityMax[key] = Math.max(abilityMax[key] ?? 20, v);
                    }
                }
                if ((bonus as any).abilityMaxIncrease) {
                    for (const [k, v] of Object.entries((bonus as any).abilityMaxIncrease as Record<string, number>)) {
                        const key = k as keyof Abilities;
                        abilityMax[key] = (abilityMax[key] ?? 20) + v;
                    }
                }

                if (bonus.initiative) {
                    initiativeBonus = (initiativeBonus ?? 0) + bonus.initiative;
                }

                // Владения через applyProficiencies (сохраняем категории как есть)
                if (bonus.proficiencies) {
                    const profs: Proficiency[] = bonus.proficiencies
                        .map(mapKeyToProficiency)
                        .filter((p): p is Proficiency => p !== null);

                    profs.forEach((prof: Proficiency) => {
                        switch (prof.type) {
                            case "skill":
                                if (prof.key) {
                                    skills.add(prof.key);
                                    proficiencySources.skills[prof.key] = featName;
                                }
                                break;
                            case "tool":
                            case "tool-proficiency":
                                if (prof.key) {
                                    tools.add(prof.key);
                                    proficiencySources.tools[prof.key] = featName;
                                } else if (prof.category) {
                                    // Сохраняем категорию как есть, не разворачиваем
                                    tools.add(prof.category);
                                    proficiencySources.tools[prof.category] = featName;
                                }
                                break;
                            case "weapon":
                                if (prof.key) {
                                    weapons.add(prof.key);
                                    proficiencySources.weapons[prof.key] = featName;
                                } else if (prof.category) {
                                    // Сохраняем категорию как есть, не разворачиваем
                                    weapons.add(prof.category);
                                    proficiencySources.weapons[prof.category] = featName;
                                }
                                break;
                            case "armor":
                                if (prof.key) {
                                    armors.add(prof.key);
                                    proficiencySources.armors[prof.key] = featName;
                                } else if (prof.category) {
                                    // Сохраняем категорию как есть, не разворачиваем
                                    armors.add(prof.category);
                                    proficiencySources.armors[prof.category] = featName;
                                }
                                break;
                            case "savingThrow":
                                if (prof.key) savingThrows.add(prof.key);
                                break;
                        }
                    });
                }
                // Навыки (feat может просто дать владение напрямую)
                if (bonus.skills) {
                    bonus.skills.forEach(s => skills.add(s));
                }

                // Бонусы скорости, инициативы и прочее можешь тоже здесь учитывать при расширении
            }
        }
    }

    /* -----------------------------
       Subclass (подкласс)
    ----------------------------- */
    if (draft.basics.subclass) {
        const classInfo = getClassByKey(draft.basics.class);
        if (classInfo?.subclasses) {
            const subclass = classInfo.subclasses.find(sc => sc.key === draft.basics.subclass);
            if (subclass) {
                const subclassName = subclass.name || `${classInfo.name} (${subclass.key})`;
                
                // Обрабатываем владения из подкласса
                if (subclass.features) {
                    Object.entries(subclass.features).forEach(([level, features]) => {
                        features.forEach((feature, featureIdx) => {
                            if (feature.proficiencies) {
                                feature.proficiencies.forEach((prof: Proficiency) => {
                                    switch (prof.type) {
                                        case "skill":
                                            if (prof.key) {
                                                skills.add(prof.key);
                                                proficiencySources.skills[prof.key] = subclassName;
                                            }
                                            break;
                                        case "tool":
                                        case "tool-proficiency":
                                            if (prof.key) {
                                                tools.add(prof.key);
                                                proficiencySources.tools[prof.key] = subclassName;
                                            } else if (prof.category) {
                                                tools.add(prof.category);
                                                proficiencySources.tools[prof.category] = subclassName;
                                            }
                                            break;
                                        case "weapon":
                                            if (prof.key) {
                                                weapons.add(prof.key);
                                                proficiencySources.weapons[prof.key] = subclassName;
                                            } else if (prof.category) {
                                                weapons.add(prof.category);
                                                proficiencySources.weapons[prof.category] = subclassName;
                                            }
                                            break;
                                        case "armor":
                                            if (prof.key) {
                                                armors.add(prof.key);
                                                proficiencySources.armors[prof.key] = subclassName;
                                            } else if (prof.category) {
                                                armors.add(prof.category);
                                                proficiencySources.armors[prof.category] = subclassName;
                                            }
                                            break;
                                        case "language":
                                            if (prof.key) {
                                                languages.add(prof.key);
                                                proficiencySources.languages[prof.key] = subclassName;
                                            }
                                            break;
                                    }
                                });
                            }
                        });
                    });
                }
            }
        }
    }

    /* -----------------------------
       Chosen (игрок)
    ----------------------------- */
    // Обрабатываем выбранные навыки с учетом источника
    Object.entries(draft.chosen.skills).forEach(([source, skillList]) => {
        skillList.forEach(s => {
            skills.add(s);
            // Для навыков из расы учитываем подрасу
            if (source === "race" || source.startsWith("subrace")) {
                const raceName = getRaceByKey(draft.basics.race)?.name || "Раса";
                const subraceName = draft.basics.subrace ? getSubraceByKey(draft.basics.subrace)?.name : null;
                proficiencySources.skills[s] = subraceName ? `${raceName} (${subraceName})` : raceName;
            } else if (source.startsWith("background")) {
                // Все источники, начинающиеся с "background" - это предыстория
                const background = getBackgroundByKey(draft.basics.background);
                const backgroundName = background?.name || "Предыстория";
                proficiencySources.skills[s] = backgroundName;
            } else {
                proficiencySources.skills[s] = source === "class" ? "Класс" : 
                                            source === "subclass" ? "Подкласс" : 
                                            source === "background" ? "Предыстория" : "Игрок";
            }
        });
    });
    
    // Обрабатываем выбранные инструменты с учетом источника
    Object.entries(draft.chosen.tools).forEach(([source, toolList]) => {
        toolList.forEach(t => {
            tools.add(t);
            // Для инструментов из расы учитываем подрасу
            if (source === "race") {
                const raceName = getRaceByKey(draft.basics.race)?.name || "Раса";
                const subraceName = draft.basics.subrace ? getSubraceByKey(draft.basics.subrace)?.name : null;
                proficiencySources.tools[t] = subraceName ? `${raceName} (${subraceName})` : raceName;
            } else if (source.startsWith("background")) {
                // Все источники, начинающиеся с "background" - это предыстория
                const background = getBackgroundByKey(draft.basics.background);
                const backgroundName = background?.name || "Предыстория";
                proficiencySources.tools[t] = backgroundName;
            } else {
                proficiencySources.tools[t] = source === "class" ? "Класс" : 
                                            source === "subclass" ? "Подкласс" : 
                                            source === "background" ? "Предыстория" : "Игрок";
            }
        });
    });
    
    Object.entries(draft.chosen.toolProficiencies).forEach(([source, toolList]) => {
        toolList.forEach(tp => {
            toolProficiencies.add(tp);
            // Для инструментов из расы учитываем подрасу
            if (source === "race") {
                const raceName = getRaceByKey(draft.basics.race)?.name || "Раса";
                const subraceName = draft.basics.subrace ? getSubraceByKey(draft.basics.subrace)?.name : null;
                proficiencySources.tools[tp] = subraceName ? `${raceName} (${subraceName})` : raceName;
            } else if (source.startsWith("background")) {
                // Все источники, начинающиеся с "background" - это предыстория
                const background = getBackgroundByKey(draft.basics.background);
                const backgroundName = background?.name || "Предыстория";
                proficiencySources.tools[tp] = backgroundName;
            } else {
                proficiencySources.tools[tp] = source === "class" ? "Класс" : 
                                            source === "subclass" ? "Подкласс" : 
                                            source === "background" ? "Предыстория" : "Игрок";
            }
        });
    });
    
    // Обрабатываем выбранные языки с учетом источника
    Object.entries(draft.chosen.languages).forEach(([source, langList]) => {
        langList.forEach(l => {
            languages.add(l);
            // Для языков из расы учитываем подрасу
            if (source === "race" || source.startsWith("subrace")) {
                const raceName = getRaceByKey(draft.basics.race)?.name || "Раса";
                const subraceName = draft.basics.subrace ? getSubraceByKey(draft.basics.subrace)?.name : null;
                proficiencySources.languages[l] = subraceName ? `${raceName} (${subraceName})` : raceName;
            } else if (source.startsWith("background")) {
                // Все источники, начинающиеся с "background" - это предыстория
                const background = getBackgroundByKey(draft.basics.background);
                const backgroundName = background?.name || "Предыстория";
                proficiencySources.languages[l] = backgroundName;
            } else {
                proficiencySources.languages[l] = source === "class" ? "Класс" : 
                                                source === "subclass" ? "Подкласс" : 
                                                source === "background" ? "Предыстория" : "Игрок";
            }
        });
    });
    Object.values(draft.chosen.spells).flat().forEach(sp => spells.add(sp));
    draft.chosen.feats.forEach(f => feats.add(f));

    for (const arr of Object.values(draft.chosen.abilities)) {
        for (const ab of arr) {
            abilityBonuses[ab] = (abilityBonuses[ab] || 0) + 1;
        }
    }

    /* -----------------------------
       Background bonuses
    ----------------------------- */
    const backgroundFixed = getFixedBackgroundData(draft.basics.background);
    const backgroundName = backgroundFixed.name || "Предыстория";
    
    // Обрабатываем владения из предыстории
    if (backgroundFixed.proficiencies) {
        backgroundFixed.proficiencies.skills?.forEach(s => {
            skills.add(s);
            proficiencySources.skills[s] = backgroundName;
        });
        backgroundFixed.proficiencies.tools?.forEach(t => {
            tools.add(t);
            proficiencySources.tools[t] = backgroundName;
        });
        backgroundFixed.proficiencies.languages?.forEach(l => {
            languages.add(l);
            proficiencySources.languages[l] = backgroundName;
        });
    }
    
    for (const [k, v] of Object.entries(backgroundFixed.abilityBonuses)) {
        abilityBonuses[k as keyof Abilities] = (abilityBonuses[k as keyof Abilities] || 0) + v;
    }

    /* -----------------------------
       ASI
    ----------------------------- */
    for (const entry of Object.values(draft.asi)) {
        if (entry.mode === "asi") {
            if (entry.s1) abilityBonuses[entry.s1] = (abilityBonuses[entry.s1] || 0) + 1;
            if (entry.s2) abilityBonuses[entry.s2] = (abilityBonuses[entry.s2] || 0) + 1;
        }
    }

    
    return {
        skills: Array.from(skills),
        tools: Array.from(tools),
        toolProficiencies: Array.from(toolProficiencies),
        languages: Array.from(languages),
        spells: Array.from(spells),
        feats: Array.from(feats),
        weapons: Array.from(weapons),
        armors: Array.from(armors),
        savingThrows: Array.from(savingThrows),
        abilityBonuses,
        abilityMax,
        speed,
        initiativeBonus,
        proficiencySources,
        equipment: draft.basics?.equipment || [],
        currency: draft.basics?.currency || null,
    };
}

export function mapKeyToProficiency(key: string): Proficiency | null {
    // Сначала проверяем способности (saving throw)
    const ability = ABILITIES.find(a => a.key === key);
    if (ability) return { type: "savingThrow", key: ability.key };

    // Навыки
    const skill = SKILLS.find(s => s.key === key);
    if (skill) return { type: "skill", key: skill.key };

    // Инструменты
    const tool = Tools.find(t => t.key === key);
    if (tool) return { type: "tool", key: tool.key };

    // Оружие
    const weapon = Weapons.find(w => w.key === key);
    if (weapon) return { type: "weapon", key: weapon.key };

    // Броня
    const armor = Armors.find(a => a.key === key);
    if (armor) return { type: "armor", key: armor.key };

    // Категории оружия
    if (key === "simple" || key === "martial") {
        return { type: "weapon", category: key };
    }

    // Категории брони
    if (["light", "medium", "heavy", "shield"].includes(key)) {
        return { type: "armor", category: key as "light" | "medium" | "heavy" | "shield" };
    }

    console.warn("[mapKeyToProficiency] неизвестный ключ:", key);
    return null;
}
