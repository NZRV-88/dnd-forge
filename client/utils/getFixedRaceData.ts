import { Abilities } from "@/data/abilities";
import { getRaceAndSubrace } from "@/data/races";
import type { RaceInfo, SubraceInfo } from "@/data/races/types";

export type FixedRaceData = {
    proficiencies: {
        skills: string[];
        tools: string[];
        weapons: string[];
        armors: string[];
        savingThrows: string[];
    };
    languages: string[];
    spells: string[];
    abilityBonuses: Partial<Record<keyof Abilities, number>>;
    speed?: number;
    hpPerLevel?: number; // Бонус хитов за уровень от расы/подрасы
};

/**
 * Хелпер: добавляет бонусы и владения от трейтов (как у расы, так и у подрасы)
 */
function applyTraits(
    traits: SubraceInfo["traits"] | RaceInfo["traits"] | undefined,
    base: FixedRaceData
) {
    if (!traits) return;

    traits.forEach(t => {
        if (t.abilityBonuses) {
            for (const [k, v] of Object.entries(t.abilityBonuses)) {
                base.abilityBonuses[k as keyof Abilities] =
                    (base.abilityBonuses[k as keyof Abilities] || 0) + v;
            }
        }
        if (t.spells) {
            t.spells.forEach(sp => {
                if (sp.type === "innate" && sp.spells) {
                    base.spells.push(...sp.spells);
                }
            });
        }
        if (t.proficiencies) {
            t.proficiencies.forEach(p => {
                switch (p.type) {
                    case "skill": base.proficiencies.skills.push(p.key); break;
                    case "tool": base.proficiencies.tools.push(p.key); break;
                    case "weapon": base.proficiencies.weapons.push(p.key); break;
                    case "armor": base.proficiencies.armors.push(p.key); break;
                    case "savingThrow": base.proficiencies.savingThrows.push(p.key ?? ""); break;
                }
            });
        }
        if (t.speed) base.speed = t.speed;
        if (t.hpPerLevel) {
            base.hpPerLevel = (base.hpPerLevel || 0) + t.hpPerLevel;
            console.log('🔍 getFixedRaceData: Found hpPerLevel trait:', {
                traitName: t.name,
                hpPerLevel: t.hpPerLevel,
                totalHpPerLevel: base.hpPerLevel
            });
        }
    });
}

/**
 * Собирает фиксированные бонусы и владения от выбранной расы и подрасы.
 */
export function getFixedRaceData(raceKey?: string, subraceKey?: string): FixedRaceData {
    const base: FixedRaceData = {
        proficiencies: {
            skills: [],
            tools: [],
            weapons: [],
            armors: [],
            savingThrows: [],
        },
        languages: [],
        spells: [],
        abilityBonuses: {},
        speed: 30,
        hpPerLevel: 0,
    };

    if (!raceKey) return base;

    const { race, subrace } = getRaceAndSubrace(raceKey, subraceKey);
    if (!race) return base;

    // === Бонусы от расы ===
    if (race.languages) base.languages.push(...race.languages);
    if (race.spells) {
        race.spells.forEach(sp => {
            if (sp.type === "innate" && sp.spells) {
                base.spells.push(...sp.spells);
            }
        });
    }
    if (race.abilityBonuses) {
        for (const [k, v] of Object.entries(race.abilityBonuses)) {
            base.abilityBonuses[k as keyof Abilities] =
                (base.abilityBonuses[k as keyof Abilities] || 0) + v;
        }
    }
    applyTraits(race.traits, base);

    // === Бонусы от подрасы ===
    if (subrace) {
        if (subrace.spells) {
            subrace.spells.forEach(sp => {
                if (sp.type === "innate" && sp.spells) {
                    base.spells.push(...sp.spells);
                }
            });
        }
        applyTraits(subrace.traits, base);
    }

    console.log('🔍 getFixedRaceData final result:', {
        raceKey,
        subraceKey,
        hpPerLevel: base.hpPerLevel,
        abilityBonuses: base.abilityBonuses
    });

    return base;
}
