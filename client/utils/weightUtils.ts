/**
 * Рассчитывает общий вес всех предметов персонажа
 */
export const calculateTotalWeight = (characterData: any): number => {
  if (!characterData?.equipment) return 0;
  
  let totalWeight = 0;
  
  characterData.equipment.forEach((item: any) => {
    const itemName = typeof item === 'string' ? item : (item.name || String(item));
    const itemWeight = typeof item === 'object' ? item.weight : 0;
    
    if (itemWeight > 0) {
      totalWeight += itemWeight;
    }
  });
  
  return totalWeight;
};

/**
 * Рассчитывает максимальный вес, который может нести персонаж
 */
export const calculateMaxCarryWeight = (characterData: any): number => {
  if (!characterData?.stats?.str) return 0;
  
  const strength = characterData.stats.str;
  
  // Базовый вес = Сила * 15 фунтов
  const baseWeight = strength * 15;
  
  // Если есть предмет увеличения грузоподъемности, удваиваем
  if (characterData?.equipped?.capacityItem) {
    return baseWeight * 2;
  }
  
  return baseWeight;
};

/**
 * Проверяет, перегружен ли персонаж
 */
export const isOverloaded = (currentWeight: number, maxWeight?: number, characterData?: any): boolean => {
  const maxCarryWeight = maxWeight || (characterData ? calculateMaxCarryWeight(characterData) : 0);
  return currentWeight > maxCarryWeight;
};
