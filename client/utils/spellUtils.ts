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

/**
 * Рассчитывает урон заговора в зависимости от уровня персонажа
 */
export const getCantripDamage = (spell: any, characterLevel: number): string => {
  if (!spell?.damage || !spell?.scaling || spell.scaling.type !== 'cantrip') {
    return spell?.damage?.dice || '';
  }

  const baseDice = spell.damage.dice;
  const scaling = spell.scaling;
  const levels = scaling.progression.levels;
  
  // Определяем количество дополнительных костей на основе уровня персонажа
  let additionalDice = 0;
  for (const level of levels) {
    if (characterLevel >= level) {
      additionalDice++;
    }
  }
  
  // Парсим базовую кость (например, "1d8" -> { count: 1, sides: 8 })
  const baseMatch = baseDice.match(/(\d+)d(\d+)/);
  if (!baseMatch) return baseDice;
  
  const baseCount = parseInt(baseMatch[1]);
  const diceSides = baseMatch[2];
  
  // Рассчитываем общее количество костей
  const totalCount = baseCount + additionalDice;
  
  return `${totalCount}d${diceSides}`;
};

/**
 * Получает отображаемый урон заклинания с учетом масштабирования
 */
export const getSpellDisplayDamage = (spell: any, characterLevel: number): string => {
  if (!spell?.damage) return '';
  
  // Для заговоров используем специальную функцию масштабирования
  if (spell.level === 0 && spell.scaling?.type === 'cantrip') {
    return getCantripDamage(spell, characterLevel);
  }
  
  // Для обычных заклинаний возвращаем базовый урон
  return spell.damage.dice;
};

/**
 * Получает информацию о масштабировании заговора для отображения
 */
export const getCantripScalingInfo = (spell: any): string => {
  if (!spell?.damage || !spell?.scaling || spell.scaling.type !== 'cantrip') {
    return '';
  }

  const baseDice = spell.damage.dice;
  const scaling = spell.scaling;
  const levels = scaling.progression.levels;
  
  // Парсим базовую кость
  const baseMatch = baseDice.match(/(\d+)d(\d+)/);
  if (!baseMatch) return '';
  
  const baseCount = parseInt(baseMatch[1]);
  const diceSides = baseMatch[2];
  
  // Создаем строку с информацией о масштабировании
  const scalingInfo = [];
  
  // Базовый урон (1-4 уровень)
  scalingInfo.push(`1-4: ${baseCount}d${diceSides}`);
  
  // Урон на каждом уровне усиления
  levels.forEach((level, index) => {
    const diceCount = baseCount + index + 1;
    const nextLevel = index < levels.length - 1 ? levels[index + 1] - 1 : 20;
    scalingInfo.push(`${level}-${nextLevel}: ${diceCount}d${diceSides}`);
  });
  
  return scalingInfo.join(', ');
};