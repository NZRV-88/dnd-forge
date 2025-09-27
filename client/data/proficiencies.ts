
import { ArmorCategory, getArmorKeysByCategory, getArmorName } from "@/data/items/armors.ts";
import { WeaponCategory, getWeaponKeysByCategory, getWeaponName } from "@/data/items/weapons.ts";
import { ToolCategory, getToolKeysByCategory, getToolName } from "@/data/items/tools.ts";
import { SKILLS, getSkillName } from "@/data/skills";
import { Abilities, ABILITIES } from "@/data/abilities";

export type Proficiency =
    | { type: "armor"; category?: ArmorCategory; key?: string }
    | { type: "weapon"; category?: WeaponCategory; key?: string }
    | { type: "tool"; category?: ToolCategory; key?: string } 
    | { type: "skill"; key: string }
    | { type: "savingThrow"; key: keyof Abilities };

type StateSetters = {
    setSkills?: (skills: string[]) => void;
    setTools?: (tools: string[]) => void;
    setWeapons?: (weapons: string[]) => void;
    setArmors?: (armors: string[]) => void;
    setSavingThrows?: (saves: string[]) => void;
};

export function applyProficiencies(
    profs: Proficiency[] | undefined,
    current: {
        skills: string[];
        tools: string[];
        weapons: string[];
        armors: string[];
        savingThrows: string[];
    },
    setters: StateSetters
) {
    profs?.forEach((prof) => {
        switch (prof.type) {
            case "skill":
                if (prof.key && setters.setSkills) {
                    setters.setSkills([...new Set([...current.skills, prof.key])]);
                }
                break;
            case "tool":
                if (prof.key && setters.setTools) {
                    setters.setTools([...new Set([...current.tools, prof.key])]);
                }
                if (prof.category && setters.setTools) {
                    setters.setTools(
                        [...new Set([...current.tools, ...getToolKeysByCategory(prof.category)])
                        ]);
                }
                break;
            case "weapon":
                if (prof.key && setters.setWeapons) {
                    setters.setWeapons([...new Set([...current.weapons, prof.key])]);
                }
                if (prof.category && setters.setWeapons) {
                    setters.setWeapons([
                        ...new Set([...current.weapons, ...getWeaponKeysByCategory(prof.category)])]);
                }
                break;
            case "armor":
                if (prof.key && setters.setArmors) {
                    setters.setArmors([...new Set([...current.armors, prof.key])]);
                }
                if (prof.category && setters.setArmors) {
                    setters.setArmors([
                        ...new Set([...current.armors, ...getArmorKeysByCategory(prof.category)]),
                    ]);
                }
                break;
            case "savingThrow":
                if (prof.key && setters.setSavingThrows) {
                    setters.setSavingThrows([...new Set([...current.savingThrows, prof.key])]);
                }
                break;
        }
    });
}

export function getProficiencyName(prof: Proficiency, lang: "ru" | "en" = "ru"): string {
    switch (prof.type) {
        case "skill": {
            const skill = SKILLS.find(s => s.key === prof.key);
            if (!skill) return prof.key ?? (lang === "en" ? "Skill" : "Навык");
            return lang === "en" ? skill.nameEn : skill.name;
        }

        case "tool": {
            if (prof.key) {
                return getToolName(prof.key, lang);
            }
            if (prof.category) {
                return lang === "en" ? `Tool (${prof.category})` : `Инструменты (${prof.category})`;
            }
            return lang === "en" ? "Tool" : "Инструменты";
        }

        case "weapon": {
            if (prof.key) {
                return getWeaponName(prof.key, lang);
            }
            if (prof.category) {
                return lang === "en" ? `Weapon (${prof.category})` : `Оружие (${prof.category})`;
            }
            return lang === "en" ? "Weapon" : "Оружие";
        }

        case "armor": {
            if (prof.key) {
                return getArmorName(prof.key, lang);
            }
            if (prof.category) {
                return lang === "en" ? `Armor (${prof.category})` : `Броня (${prof.category})`;
            }
            return lang === "en" ? "Armor" : "Броня";
        }

        case "savingThrow": {
            if (!prof.key) return lang === "en" ? "Saving Throw" : "Спасбросок";

            const ability = ABILITIES.find(a => a.key === prof.key);
            if (!ability) return lang === "en" ? "Saving Throw" : "Спасбросок";

            return lang === "en"
                ? `${ability.labelEn} Saving Throw`
                : `Спасбросок: ${ability.label}`;
        }

        default:
            return lang === "en" ? "Proficiency" : "Владение";
    }
}