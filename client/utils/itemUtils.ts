import { Weapons } from "@/data/items/weapons";
import { Armors } from "@/data/items/armors";
import { Tools } from "@/data/items/tools";
import { Gears, Ammunitions } from "@/data/items/gear";
import { EQUIPMENT_PACKS } from "@/data/items/equipment-packs";
import { getWeaponPropertyByName } from "@/data/items/weapons";
import { translateDamageType } from "@/utils/translationUtils";

/**
 * Очищает название предмета от количества (например, "Меч x3" -> "Меч")
 */
export const getCleanItemName = (itemName: any): string => {
  if (typeof itemName !== 'string') {
    return String(itemName);
  }
  return itemName.replace(/\s*x\d+$/, '');
};

/**
 * Определяет тип предмета по его названию
 */
export const getItemType = (itemName: any): string => {
  if (typeof itemName !== 'string') {
    return 'other';
  }
  
  const cleanName = getCleanItemName(itemName);
  
  // Проверяем оружие
  if (Weapons.find(w => w.name === cleanName)) {
    return 'weapon';
  }
  
  // Проверяем доспехи
  if (Armors.find(a => a.name === cleanName)) {
    return 'armor';
  }
  
  // Проверяем инструменты
  if (Tools.find(t => t.name === cleanName)) {
    return 'tool';
  }
  
  // Проверяем снаряжение
  if (Gears.find(g => g.name === cleanName)) {
    return 'gear';
  }
  
  // Проверяем боеприпасы
  if (Ammunitions.find(a => a.name === cleanName)) {
    return 'ammunition';
  }
  
  // Проверяем наборы снаряжения
  if (EQUIPMENT_PACKS.find(p => p.name === cleanName)) {
    return 'pack';
  }
  
  return 'other';
};

/**
 * Получает категорию предмета по его названию
 */
export const getItemCategory = (itemName: any): string => {
  if (typeof itemName !== 'string') {
    return 'Неизвестно';
  }
  
  const cleanName = getCleanItemName(itemName);
  
  // Проверяем оружие
  const weapon = Weapons.find(w => w.name === cleanName);
  if (weapon) {
    if (weapon.category === 'simple' && weapon.type === 'melee') {
      return 'Простое оружие ближнего боя';
    } else if (weapon.category === 'simple' && weapon.type === 'ranged') {
      return 'Простое дальнобойное оружие';
    } else if (weapon.category === 'martial' && weapon.type === 'melee') {
      return 'Воинское оружие ближнего боя';
    } else if (weapon.category === 'martial' && weapon.type === 'ranged') {
      return 'Воинское дальнобойное оружие';
    }
  }
  
  // Проверяем доспехи
  const armor = Armors.find(a => a.name === cleanName);
  if (armor) {
    if (armor.category === 'light') {
      return 'Лёгкий доспех';
    } else if (armor.category === 'medium') {
      return 'Средний доспех';
    } else if (armor.category === 'heavy') {
      return 'Тяжёлый доспех';
    } else if (armor.category === 'shield') {
      return 'Щит';
    }
  }
  
  // Проверяем инструменты
  const tool = Tools.find(t => t.name === cleanName);
  if (tool) {
    return 'Инструмент';
  }
  
  // Проверяем снаряжение
  const gear = Gears.find(g => g.name === cleanName);
  if (gear) {
    return 'Снаряжение';
  }
  
  // Проверяем боеприпасы
  const ammunition = Ammunitions.find(a => a.name === cleanName);
  if (ammunition) {
    return 'Боеприпасы';
  }
  
  // Проверяем наборы снаряжения
  const pack = EQUIPMENT_PACKS.find(p => p.name === cleanName);
  if (pack) {
    return 'Набор снаряжения';
  }
  
  return 'Неизвестно';
};

/**
 * Получает вес предмета
 */
export const getItemWeight = (itemName: any): number => {
  // Если это объект, используем его свойство weight
  if (typeof itemName === 'object' && itemName !== null) {
    return itemName.weight || 0;
  }
  
  if (typeof itemName !== 'string') {
    return 0;
  }
  
  const cleanName = getCleanItemName(itemName);
  
  // Проверяем оружие
  const weapon = Weapons.find(w => w.name === cleanName);
  if (weapon) {
    return weapon.weight || 0;
  }
  
  // Проверяем доспехи
  const armor = Armors.find(a => a.name === cleanName);
  if (armor) {
    return armor.weight || 0;
  }
  
  // Проверяем инструменты
  const tool = Tools.find(t => t.name === cleanName);
  if (tool) {
    return tool.weight || 0;
  }
  
  // Проверяем снаряжение
  const gear = Gears.find(g => g.name === cleanName);
  if (gear) {
    return gear.weight || 0;
  }
  
  // Проверяем боеприпасы
  const ammunition = Ammunitions.find(a => a.name === cleanName);
  if (ammunition) {
    return ammunition.weight || 0;
  }
  
  // Проверяем наборы снаряжения
  const pack = EQUIPMENT_PACKS.find(p => p.name === cleanName);
  if (pack) {
    return pack.weight || 0;
  }
  
  return 0;
};

/**
 * Получает стоимость предмета
 */
export const getItemCost = (itemName: any): string => {
  if (typeof itemName === 'object' && itemName !== null) {
    return itemName.cost || 'Неизвестно';
  }
  
  if (typeof itemName !== 'string') {
    return 'Неизвестно';
  }
  
  const cleanName = getCleanItemName(itemName);
  
  // Проверяем оружие
  const weapon = Weapons.find(w => w.name === cleanName);
  if (weapon) {
    return weapon.cost || 'Неизвестно';
  }
  
  // Проверяем доспехи
  const armor = Armors.find(a => a.name === cleanName);
  if (armor) {
    return armor.cost || 'Неизвестно';
  }
  
  // Проверяем инструменты
  const tool = Tools.find(t => t.name === cleanName);
  if (tool) {
    return tool.cost || 'Неизвестно';
  }
  
  // Проверяем снаряжение
  const gear = Gears.find(g => g.name === cleanName);
  if (gear) {
    return gear.cost || 'Неизвестно';
  }
  
  // Проверяем боеприпасы
  const ammunition = Ammunitions.find(a => a.name === cleanName);
  if (ammunition) {
    return ammunition.cost || 'Неизвестно';
  }
  
  // Проверяем наборы снаряжения
  const pack = EQUIPMENT_PACKS.find(p => p.name === cleanName);
  if (pack) {
    return pack.cost || 'Неизвестно';
  }
  
  return 'Неизвестно';
};

/**
 * Получает количество предмета из названия
 */
export const getItemQuantity = (itemName: any): number => {
  if (typeof itemName !== 'string') {
    return 1;
  }
  
  const match = itemName.match(/x(\d+)$/);
  return match ? parseInt(match[1]) : 1;
};

/**
 * Получает свойство предмета (вес, стоимость, количество, тип, категория)
 */
export const getItemProperty = (item: any, property: 'weight' | 'cost' | 'quantity' | 'type' | 'category'): any => {
  const itemName = typeof item === 'string' ? item : item.name;
  
  switch (property) {
    case 'weight':
      return getItemWeight(itemName);
    case 'cost':
      return getItemCost(itemName);
    case 'quantity':
      return getItemQuantity(itemName);
    case 'type':
      return getItemType(itemName);
    case 'category':
      return getItemCategory(itemName);
    default:
      return null;
  }
};

/**
 * Получает статус предмета (экипирован, в рюкзаке, и т.д.)
 */
export const getItemStatus = (itemName: string): string => {
  // Эта функция должна быть реализована в контексте компонента,
  // так как требует доступ к состоянию персонажа
  return 'unknown';
};

/**
 * Определяет приоритет сортировки предметов
 */
export const getItemSortPriority = (item: any): number => {
  const itemType = item.type;
  
  const priorities: Record<string, number> = {
    'weapon': 1,
    'armor': 2,
    'tool': 3,
    'gear': 4,
    'ammunition': 5,
    'pack': 6,
    'other': 7
  };
  
  return priorities[itemType] || 7;
};

/**
 * Получает категорию магического предмета
 */
export const getMagicItemCategory = (item: any): string => {
  if (item.itemType === 'weapon') {
    if (item.weapon?.weaponCategory === 'simple' && item.weapon?.weaponType === 'melee') {
      return 'Простое оружие ближнего боя';
    } else if (item.weapon?.weaponCategory === 'simple' && item.weapon?.weaponType === 'ranged') {
      return 'Простое дальнобойное оружие';
    } else if (item.weapon?.weaponCategory === 'martial' && item.weapon?.weaponType === 'melee') {
      return 'Воинское оружие ближнего боя';
    } else if (item.weapon?.weaponCategory === 'martial' && item.weapon?.weaponType === 'ranged') {
      return 'Воинское дальнобойное оружие';
    }
  } else if (item.itemType === 'armor') {
    return 'Доспех';
  }
  
  return 'Магический предмет';
};

/**
 * Получает категорию экипированного предмета
 */
export const getEquippedItemCategory = (itemName: string, characterData?: any): string => {
  // Проверяем, является ли это магическим предметом из инвентаря
  if (characterData?.equipment) {
    const magicItem = characterData.equipment.find((item: any) => 
      typeof item === 'object' && 
      item.type === 'magic_item' && 
      item.name === itemName
    );
    
    if (magicItem) {
      return getMagicItemCategory(magicItem);
    }
  }
  
  // Для обычных предметов используем стандартную функцию
  return getItemCategory(itemName);
};

/**
 * Форматирует цену (показывает "--" если цена 0)
 */
export const formatCost = (cost: any): string => {
  if (cost === 0 || cost === '0' || cost === null || cost === undefined) {
    return '--';
  }
  return String(cost);
};
