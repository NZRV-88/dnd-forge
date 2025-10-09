import { Spells } from "@/data/spells";
import { getClassByKey } from "@/data/classes";

/**
 * Получает все заклинания персонажа из различных источников
 */
export const getAllCharacterSpells = (characterData: any, draft: any): any[] => {
  const allSpells: any[] = [];
  
  if (!characterData?.chosen?.spells) return allSpells;
  
  // Получаем заклинания класса
  if (characterData.chosen.spells.class) {
    characterData.chosen.spells.class.forEach((spellKey: string) => {
      const spell = Spells.find(s => s.key === spellKey);
      if (spell) {
        allSpells.push({
          ...spell,
          source: 'class',
          isPrepared: true,
          isLearned: true
        });
      }
    });
  }
  
  // Получаем заклинания подрасы
  if (characterData.chosen.spells.subrace) {
    characterData.chosen.spells.subrace.forEach((spellKey: string) => {
      const spell = Spells.find(s => s.key === spellKey);
      if (spell) {
        allSpells.push({
          ...spell,
          source: 'subrace',
          isPrepared: true,
          isLearned: true
        });
      }
    });
  }
  
  // Получаем заклинания черт
  if (characterData.chosen.spells.features) {
    Object.keys(characterData.chosen.spells.features).forEach(featureKey => {
      characterData.chosen.spells.features[featureKey].forEach((spellKey: string) => {
        const spell = Spells.find(s => s.key === spellKey);
        if (spell) {
          allSpells.push({
            ...spell,
            source: 'feature',
            featureKey,
            isPrepared: true,
            isLearned: true
          });
        }
      });
    });
  }
  
  return allSpells;
};

/**
 * Получает доступные заклинания класса
 */
export const getAvailableSpells = (characterData: any): any[] => {
  if (!characterData?.class?.key) return [];
  
  const classData = getClassByKey(characterData.class.key);
  if (!classData?.spellList) return [];
  
  return classData.spellList.map(spellKey => {
    const spell = Spells.find(s => s.key === spellKey);
    return spell ? {
      ...spell,
      source: 'class',
      isAvailable: true
    } : null;
  }).filter(Boolean);
};

/**
 * Получает все заклинания без фильтрации по классу
 */
export const getAllSpells = (): any[] => {
  return Spells.map(spell => ({
    ...spell,
    source: 'all',
    isAvailable: true
  }));
};

/**
 * Фильтрует заклинания по поиску и уровню
 */
export const getFilteredSpells = (
  spells: any[], 
  search: string = '', 
  levelFilter: number | "all" = "all"
): any[] => {
  let filteredSpells = [...spells];
  
  // Фильтр по поиску
  if (search.trim()) {
    const searchLower = search.toLowerCase();
    filteredSpells = filteredSpells.filter(spell => 
      spell.name.toLowerCase().includes(searchLower) ||
      spell.description.toLowerCase().includes(searchLower)
    );
  }
  
  // Фильтр по уровню
  if (levelFilter !== "all") {
    filteredSpells = filteredSpells.filter(spell => spell.level === levelFilter);
  }
  
  return filteredSpells;
};

/**
 * Получает доступные уровни заклинаний
 */
export const getAvailableSpellLevels = (spells: any[]): number[] => {
  const levels = new Set<number>();
  spells.forEach(spell => {
    if (spell.level !== undefined) {
      levels.add(spell.level);
    }
  });
  return Array.from(levels).sort((a, b) => a - b);
};

/**
 * Получает уровни заклинаний персонажа
 */
export const getCharacterSpellLevels = (spells: any[]): number[] => {
  const levels = new Set<number>();
  spells.forEach(spell => {
    if (spell.level !== undefined) {
      levels.add(spell.level);
    }
  });
  return Array.from(levels).sort((a, b) => a - b);
};

/**
 * Получает слоты заклинаний для уровня
 */
export const getSpellSlotsForLevel = (spellLevel: number, characterData: any): number => {
  if (!characterData?.class?.spellcasting) return 0;
  
  const spellcasting = characterData.class.spellcasting;
  const level = characterData.level || 1;
  
  // Заговоры (0 уровень) не требуют слотов
  if (spellLevel === 0) return 0;
  
  // Получаем количество слотов для уровня заклинания
  const slotsPerLevel = spellcasting.slotsPerLevel[level - 1];
  if (!slotsPerLevel) return 0;
  
  return slotsPerLevel[spellLevel] || 0;
};

/**
 * Проверяет доступность слотов заклинаний
 */
export const hasAvailableSlots = (spellLevel: number, characterData: any): boolean => {
  // Заговоры (0 уровень) не требуют слотов
  if (spellLevel === 0) return true;
  
  const totalSlots = getSpellSlotsForLevel(spellLevel, characterData);
  const usedSlots = characterData?.spellSlots?.[spellLevel] || 0;
  
  return usedSlots < totalSlots;
};

/**
 * Получает максимальное количество подготовленных заклинаний
 */
export const getMaxPreparedSpells = (characterData: any): number => {
  if (!characterData?.class?.spellcasting) return 0;
  
  const spellcasting = characterData.class.spellcasting;
  const level = characterData.level || 1;
  
  // Для некоторых классов (например, Паладин) используется фиксированная формула
  if (spellcasting.preparedSpells) {
    return spellcasting.preparedSpells[level - 1] || 0;
  }
  
  // Для других классов используется формула: уровень + модификатор характеристики
  const abilityModifier = Math.floor((characterData.stats?.wis || 10 - 10) / 2);
  return level + abilityModifier;
};

/**
 * Получает данные заклинания по ключу
 */
export const getSpellData = (spellKey: string): any => {
  return Spells.find(s => s.key === spellKey);
};

/**
 * Получает название заклинания по ключу
 */
export const getSpellName = (spellKey: string): string => {
  const spell = getSpellData(spellKey);
  return spell?.name || spellKey;
};
