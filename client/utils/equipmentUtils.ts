import { Weapons } from "@/data/items/weapons";
import { Armors } from "@/data/items/armors";
import { Tools } from "@/data/items/tools";
import { Gears, Ammunitions } from "@/data/items/gear";
import { EQUIPMENT_PACKS } from "@/data/items/equipment-packs";
import { getWeaponMasteryByKey } from "@/data/items/weapon-mastery";
import { getWeaponPropertyByName } from "@/data/items/weapons";
import { translateDamageType, translateWeaponType, translateWeaponProperties } from "@/utils/translationUtils";
import { getMagicItemCategory } from "@/utils/itemUtils";

/**
 * Определяет владение магическим оружием
 */
export const hasMagicWeaponMastery = (itemDetails: any, characterData: any): boolean => {
  if (itemDetails.itemType === 'weapon' && itemDetails.weaponCategory) {
    // Проверяем владение по категории оружия
    const hasCategoryMastery = characterData?.weapons?.includes(itemDetails.weaponCategory);
    
    // Проверяем владение по конкретному оружию
    const hasSpecificMastery = characterData?.weapons?.includes(itemDetails.key);
    
    return hasCategoryMastery || hasSpecificMastery;
  }
  
  return false;
};

/**
 * Получает полную информацию о предмете
 */
export const getItemDetails = (itemName: string, characterData?: any): any => {
  const cleanName = itemName.replace(/\s*x\d+$/, '');
  
  // Проверяем, является ли это магическим предметом из инвентаря
  if (characterData?.equipment) {
    const magicItem = characterData.equipment.find((item: any) => 
      typeof item === 'object' && 
      item.type === 'magic_item' && 
      item.name === cleanName
    );
    
    if (magicItem) {
      // Возвращаем данные магического предмета в формате, ожидаемом системой
      const details = {
        name: magicItem.name,
        key: magicItem.name,
        itemType: magicItem.itemType,
        category: getMagicItemCategory(magicItem),
        cost: magicItem.cost,
        weight: magicItem.weight,
        description: magicItem.description,
        rarity: magicItem.rarity,
        source: 'Homebrew',
        // Для оружия добавляем дополнительные свойства
        ...(magicItem.itemType === 'weapon' && magicItem.weapon && {
          type: translateWeaponType(magicItem.weapon.weaponType),
          range: magicItem.weapon.weaponRange || (magicItem.weapon.weaponType === 'melee' ? '5 фт' : '-'),
          damage: magicItem.weapon.damageSources?.map((source: any) => 
            `${source.diceCount}${source.diceType} ${translateDamageType(source.damageType)}`
          ).join(' + ') || '1d4',
          damageTypeTranslated: magicItem.weapon.damageSources?.map((source: any) => 
            translateDamageType(source.damageType)
          ).join(', ') || '-',
          properties: translateWeaponProperties(magicItem.weapon.weaponProperties || []),
          mastery: magicItem.weapon.weaponMastery,
          weaponKind: magicItem.weapon.weaponKind,
          weaponCategory: magicItem.weapon.weaponCategory,
          bonusAttack: magicItem.weapon.attackBonus,
          bonusDamage: magicItem.weapon.damageBonus
        })
      };
      return details;
    }
  }
  
  // Ищем в оружии
  const weapon = Weapons.find(w => w.name === cleanName);
  if (weapon) {
    // Определяем категорию оружия
    let weaponCategory = '';
    if (weapon.category === 'simple' && weapon.type === 'melee') {
      weaponCategory = 'Простое оружие ближнего боя';
    } else if (weapon.category === 'simple' && weapon.type === 'ranged') {
      weaponCategory = 'Простое дальнобойное оружие';
    } else if (weapon.category === 'martial' && weapon.type === 'melee') {
      weaponCategory = 'Воинское оружие ближнего боя';
    } else if (weapon.category === 'martial' && weapon.type === 'ranged') {
      weaponCategory = 'Воинское дальнобойное оружие';
    }

    return {
      ...weapon,
      itemType: 'weapon',
      category: weaponCategory,
      cost: weapon.cost,
      properties: translateWeaponProperties(weapon.properties),
      damageTypeTranslated: translateDamageType(weapon.damageType)
    };
  }
  
  // Ищем в доспехах
  const armor = Armors.find(a => a.name === cleanName);
  if (armor) {
    // Определяем категорию доспеха
    let armorCategory = '';
    if (armor.category === 'light') {
      armorCategory = 'Лёгкий доспех';
    } else if (armor.category === 'medium') {
      armorCategory = 'Средний доспех';
    } else if (armor.category === 'heavy') {
      armorCategory = 'Тяжёлый доспех';
    } else if (armor.category === 'shield') {
      armorCategory = 'Щит';
    }

    return {
      ...armor,
      itemType: 'armor',
      category: armorCategory,
      cost: armor.cost
    };
  }
  
  // Ищем в инструментах
  const tool = Tools.find(t => t.name === cleanName);
  if (tool) {
    return {
      ...tool,
      itemType: 'tool',
      category: 'Инструмент',
      cost: tool.cost
    };
  }
  
  // Ищем в снаряжении
  const gear = Gears.find(g => g.name === cleanName);
  if (gear) {
    return {
      ...gear,
      itemType: 'gear',
      category: 'Снаряжение',
      cost: gear.cost
    };
  }
  
  // Ищем в боеприпасах
  const ammunition = Ammunitions.find(a => a.name === cleanName);
  if (ammunition) {
    return {
      ...ammunition,
      itemType: 'ammunition',
      category: 'Боеприпасы',
      cost: ammunition.cost
    };
  }
  
  // Ищем в наборах снаряжения
  const pack = EQUIPMENT_PACKS.find(p => p.name === cleanName);
  if (pack) {
    return {
      ...pack,
      itemType: 'pack',
      category: 'Набор снаряжения',
      cost: pack.cost
    };
  }
  
  return null;
};

/**
 * Получает предметы из рюкзака (не надетых)
 */
export const getBackpackItems = (characterData: any): any[] => {
  if (!characterData?.equipment) return [];
  
  return characterData.equipment
    .filter((item: any) => {
      // Исключаем экипированные предметы
      const isEquipped = characterData.equipped?.weaponSlot1?.some((w: any) => w.name === item.name) ||
                        characterData.equipped?.weaponSlot2?.some((w: any) => w.name === item.name) ||
                        characterData.equipped?.armor?.name === item.name ||
                        characterData.equipped?.shield1?.name === item.name ||
                        characterData.equipped?.shield2?.name === item.name;
      
      return !isEquipped;
    })
    .map((item: any) => {
      const itemName = typeof item === 'string' ? item : (item.name || String(item));
      const itemType = typeof item === 'object' && item.type ? item.type : 'other';
      
      // Определяем категорию для отображения
      let displayCategory;
      if (itemType === 'magic_item') {
        displayCategory = getMagicItemCategory(item);
      } else {
        displayCategory = getItemDetails(itemName, characterData)?.category || 'Неизвестно';
      }
      
      return {
        name: itemName,
        type: itemType,
        category: displayCategory,
        weight: typeof item === 'object' ? item.weight : getItemDetails(itemName, characterData)?.weight || 0,
        cost: typeof item === 'object' ? item.cost : getItemDetails(itemName, characterData)?.cost || 'Неизвестно',
        quantity: 1,
        ...(itemType === 'magic_item' && {
          description: item.description,
          rarity: item.rarity,
          itemType: item.itemType,
          weapon: item.weapon
        })
      };
    })
    .sort((a: any, b: any) => {
      const priorityA = getItemSortPriority(a);
      const priorityB = getItemSortPriority(b);
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      return a.name.localeCompare(b.name);
    });
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
    'magic_item': 0, // Магические предметы в начале
    'other': 7
  };
  
  return priorities[itemType] || 7;
};

/**
 * Проверяет, может ли предмет быть экипирован
 */
export const canEquipItem = (itemName: string, characterData: any): boolean => {
  const itemDetails = getItemDetails(itemName, characterData);
  if (!itemDetails) return false;
  
  // Проверяем тип предмета
  if (itemDetails.itemType === 'weapon') {
    return true;
  }
  
  if (itemDetails.itemType === 'armor') {
    return true;
  }
  
  if (itemDetails.itemType === 'shield') {
    return true;
  }
  
  return false;
};

/**
 * Проверяет, является ли предмет универсальным оружием
 */
export const isVersatileWeapon = (itemName: string): boolean => {
  const itemDetails = getItemDetails(itemName);
  if (!itemDetails || itemDetails.itemType !== 'weapon') return false;
  
  return itemDetails.properties?.includes('Универсальное') || false;
};

/**
 * Проверяет, экипирован ли предмет
 */
export const isItemEquipped = (itemName: string, characterData: any): boolean => {
  if (!characterData?.equipped) return false;
  
  const equipped = characterData.equipped;
  
  // Проверяем слоты оружия
  const isInWeaponSlot1 = equipped.weaponSlot1?.some((w: any) => w.name === itemName);
  const isInWeaponSlot2 = equipped.weaponSlot2?.some((w: any) => w.name === itemName);
  
  // Проверяем доспех
  const isArmor = equipped.armor?.name === itemName;
  
  // Проверяем щиты
  const isShield1 = equipped.shield1?.name === itemName;
  const isShield2 = equipped.shield2?.name === itemName;
  
  return isInWeaponSlot1 || isInWeaponSlot2 || isArmor || isShield1 || isShield2;
};
