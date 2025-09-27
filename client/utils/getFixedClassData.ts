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

    const current = { skills: [], tools: [], weapons: [], armors: [], savingThrows: [] as string[] };
    const setters = {
        setSkills: (arr: string[]) => (current.skills = arr),
        setTools: (arr: string[]) => (current.tools = arr),
        setWeapons: (arr: string[]) => (current.weapons = arr),
        setArmors: (arr: string[]) => (current.armors = arr),
        setSavingThrows: (arr: string[]) => (current.savingThrows = arr),
    };
    applyProficiencies(cls.proficiencies as Proficiency[], current, setters);

    base.proficiencies = current;
    return base;
}
