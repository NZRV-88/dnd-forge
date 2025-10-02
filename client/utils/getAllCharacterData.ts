import { CharacterDraft } from "@/store/character";
import { getFixedRaceData } from "@/utils/getFixedRaceData";
import { getFixedClassData } from "@/utils/getFixedClassData";
import { getFixedBackgroundData } from "@/utils/getFixedBackgroundData";
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

    /* -----------------------------
       Race / Subrace
    ----------------------------- */
    const raceFixed = getFixedRaceData(draft.basics.race, draft.basics.subrace);
    raceFixed.proficiencies.skills.forEach(s => skills.add(s));
    raceFixed.proficiencies.tools.forEach(t => tools.add(t));
    raceFixed.languages.forEach(l => languages.add(l));
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
    classFixed.proficiencies.skills.forEach(s => skills.add(s));
    classFixed.proficiencies.tools.forEach(t => tools.add(t));
    classFixed.proficiencies.weapons.forEach(w => weapons.add(w));
    classFixed.proficiencies.armors.forEach(a => armors.add(a));
    classFixed.proficiencies.savingThrows.forEach(s => savingThrows.add(s));

    /* -----------------------------
       Feats (fixed)
    ----------------------------- */
    for (const featKey of draft.chosen.feats) {
        feats.add(featKey);
        const feat = getFeatByKey(featKey);
        if (!feat) continue;

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

                // Владения через applyProficiencies
                if (bonus.proficiencies) {
                    const profs: Proficiency[] = bonus.proficiencies
                        .map(mapKeyToProficiency)
                        .filter((p): p is Proficiency => p !== null);

                    const current = {
                        skills: [] as string[],
                        tools: [] as string[],
                        weapons: [] as string[],
                        armors: [] as string[],
                        savingThrows: [] as string[],
                    };
                    const setters = {
                        setSkills: (arr: string[]) => (current.skills = arr),
                        setTools: (arr: string[]) => (current.tools = arr),
                        setWeapons: (arr: string[]) => (current.weapons = arr),
                        setArmors: (arr: string[]) => (current.armors = arr),
                        setSavingThrows: (arr: string[]) => (current.savingThrows = arr),
                    };

                    applyProficiencies(profs, current, setters);

                    current.skills.forEach(s => skills.add(s));
                    current.tools.forEach(t => tools.add(t));
                    current.weapons.forEach(w => weapons.add(w));
                    current.armors.forEach(a => armors.add(a));
                    current.savingThrows.forEach(s => savingThrows.add(s));
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
       Chosen (игрок)
    ----------------------------- */
    Object.values(draft.chosen.skills).flat().forEach(s => skills.add(s));
    Object.values(draft.chosen.tools).flat().forEach(t => tools.add(t));
    Object.values(draft.chosen.toolProficiencies).flat().forEach(tp => toolProficiencies.add(tp));
    Object.values(draft.chosen.languages).flat().forEach(l => languages.add(l));
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
