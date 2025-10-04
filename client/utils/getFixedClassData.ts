import { getClassByKey } from "@/data/classes";
import { applyProficiencies, Proficiency } from "@/data/proficiencies";
import { Abilities } from "@/data/abilities";

export type FixedClassData = {
    proficiencies: {
        skills: string[];
        tools: string[];
        weapons: string[];
        armors: string[];
        savingThrows: string[];
    };
    abilityBonuses: Partial<Record<keyof Abilities, number>>;
};

export function getFixedClassData(classKey?: string): FixedClassData {
    const base: FixedClassData = {
        proficiencies: { skills: [], tools: [], weapons: [], armors: [], savingThrows: [] },
        abilityBonuses: {},
    };

    if (!classKey) return base;
    const cls = getClassByKey(classKey);
    if (!cls?.proficiencies) return base;

    // Обрабатываем владения, сохраняя категории как есть
    const current = { skills: [], tools: [], weapons: [], armors: [], savingThrows: [] as string[] };
    
    cls.proficiencies.forEach((prof: Proficiency) => {
        switch (prof.type) {
            case "skill":
                if (prof.key) current.skills.push(prof.key);
                break;
            case "tool":
            case "tool-proficiency":
                if (prof.key) {
                    current.tools.push(prof.key);
                } else if (prof.category) {
                    // Сохраняем категорию как есть, не разворачиваем
                    current.tools.push(prof.category);
                }
                break;
            case "weapon":
                if (prof.key) {
                    current.weapons.push(prof.key);
                } else if (prof.category) {
                    // Сохраняем категорию как есть, не разворачиваем
                    current.weapons.push(prof.category);
                }
                break;
            case "armor":
                if (prof.key) {
                    current.armors.push(prof.key);
                } else if (prof.category) {
                    // Сохраняем категорию как есть, не разворачиваем
                    current.armors.push(prof.category);
                }
                break;
            case "savingThrow":
                if (prof.key) current.savingThrows.push(prof.key);
                break;
        }
    });

    base.proficiencies = current;
    return base;
}
