import { Abilities } from "@/data/abilities";
import { getBackgroundByKey } from "@/data/backgrounds";
import { Proficiency, applyProficiencies } from "@/data/proficiencies";

export type FixedBackgroundData = {
    proficiencies: {
        skills: string[];
        tools: string[];
        languages: string[];
        weapons: string[];
        armors: string[];
        savingThrows: string[];
    };
    abilityBonuses: Partial<Record<keyof Abilities, number>>;
    features: any[];
};

export function getFixedBackgroundData(backgroundKey?: string): FixedBackgroundData {
    const base: FixedBackgroundData = {
        proficiencies: {
            skills: [],
            tools: [],
            languages: [],
            weapons: [],
            armors: [],
            savingThrows: [],
        },
        abilityBonuses: {},
        features: [],
    };

    if (!backgroundKey) return base;

    const background = getBackgroundByKey(backgroundKey);
    if (!background) return base;

    // ✅ применяем владения через универсальный хелпер
    if (background.proficiencies) {
        applyProficiencies(background.proficiencies as Proficiency[], base.proficiencies, {
            setSkills: skills => (base.proficiencies.skills = skills),
            setTools: tools => (base.proficiencies.tools = tools),
            setWeapons: weapons => (base.proficiencies.weapons = weapons),
            setArmors: armors => (base.proficiencies.armors = armors),
            setSavingThrows: savingThrows => (base.proficiencies.savingThrows = savingThrows),
        });
    }

    // языки (если они отдельным полем, а не Proficiency[])
    if (background.languages) {
        base.proficiencies.languages.push(...background.languages);
    }
    
    // особенности предыстории
    if (background.feature) {
        base.features.push(...background.feature);
    }

    return base;
}
