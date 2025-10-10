import { getAllCharacterData } from "./getAllCharacterData";

/**
 * Единая функция для расчета максимальных хитов персонажа
 * Учитывает все бонусы от расы, подрасы и других источников
 */
export function calculateMaxHP(
    draft: any,
    classKey?: string,
    level?: number,
    hpMode?: "fixed" | "roll",
    hpRolls?: number[]
): number {
    if (!draft || !draft.basics) return 0;
    
    const basics = draft.basics;
    const actualClassKey = classKey || basics.class;
    const actualLevel = level || basics.level || 1;
    const actualHpMode = hpMode || basics.hpMode || "fixed";
    const actualHpRolls = hpRolls || draft.hpRolls || [];
    
    // Получаем данные персонажа для hpPerLevel и финальных характеристик
    // Добавляем проверки для случаев, когда структура данных отличается
    let characterData;
    try {
        characterData = getAllCharacterData(draft);
    } catch (error) {
        console.warn('Error getting character data, using fallback calculation:', error);
        // Fallback calculation без бонусов от расы
        return calculateMaxHPFallback(actualClassKey, actualLevel, actualHpMode, actualHpRolls, draft.stats?.con || 10);
    }
    
    // Получаем информацию о классе
    const hitDieMap: Record<string, number> = {
        barbarian: 12,
        bard: 8,
        fighter: 10,
        wizard: 6,
        druid: 8,
        cleric: 8,
        warlock: 8,
        monk: 8,
        paladin: 10,
        rogue: 8,
        ranger: 10,
        sorcerer: 6,
    };
    
    const hitDie = hitDieMap[actualClassKey] || 8;
    
    // Используем финальное значение Телосложения с учетом бонусов от расы
    const baseConScore = Number(draft.stats?.con) || 10;
    const conBonus = characterData.abilityBonuses?.con || 0;
    const conScore = baseConScore + conBonus;
    const conMod = Math.floor((conScore - 10) / 2);
    
    // 1-й уровень: максимум кости хитов + модификатор Телосложения
    let hp = hitDie + conMod;
    
    // 2+ уровни: добавляем хиты за каждый уровень
    if (actualLevel > 1) {
        if (actualHpMode === "fixed") {
            const averageHitDie = Math.ceil(hitDie / 2) + 1;
            hp += (actualLevel - 1) * (averageHitDie + conMod);
        } else {
            for (let lvl = 2; lvl <= actualLevel; lvl++) {
                const idx = lvl - 2;
                const dieValue = actualHpRolls[idx] && actualHpRolls[idx]! > 0 ? actualHpRolls[idx]! : 1;
                hp += dieValue + conMod;
            }
        }
    }
    
    // Добавляем бонус хитов за уровень от расы/подрасы
    if (characterData.hpPerLevel) {
        hp += characterData.hpPerLevel * actualLevel;
    }
    
    return Math.max(0, hp);
}

/**
 * Fallback функция для расчета HP без бонусов от расы
 */
function calculateMaxHPFallback(
    classKey: string,
    level: number,
    hpMode: "fixed" | "roll",
    hpRolls: number[],
    conScore: number
): number {
    const hitDieMap: Record<string, number> = {
        barbarian: 12,
        bard: 8,
        fighter: 10,
        wizard: 6,
        druid: 8,
        cleric: 8,
        warlock: 8,
        monk: 8,
        paladin: 10,
        rogue: 8,
        ranger: 10,
        sorcerer: 6,
    };
    
    const hitDie = hitDieMap[classKey] || 8;
    const conMod = Math.floor((conScore - 10) / 2);
    
    // 1-й уровень: максимум кости хитов + модификатор Телосложения
    let hp = hitDie + conMod;
    
    // 2+ уровни: добавляем хиты за каждый уровень
    if (level > 1) {
        if (hpMode === "fixed") {
            const averageHitDie = Math.ceil(hitDie / 2) + 1;
            hp += (level - 1) * (averageHitDie + conMod);
        } else {
            for (let lvl = 2; lvl <= level; lvl++) {
                const idx = lvl - 2;
                const dieValue = hpRolls[idx] && hpRolls[idx]! > 0 ? hpRolls[idx]! : 1;
                hp += dieValue + conMod;
            }
        }
    }
    
    return Math.max(0, hp);
}
