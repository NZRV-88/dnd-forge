import React, { useState, useEffect } from "react";
import { useFrameColor } from "@/contexts/FrameColorContext";
import { Weapons } from "@/data/items/weapons";
import { getClassByKey } from "@/data/classes";
import { Cantrips } from "@/data/spells/cantrips";
import { Gears, Ammunitions } from "@/data/items/gear";
import { Armors } from "@/data/items/armors";
import { Tools } from "@/data/items/tools";
import { EQUIPMENT_PACKS } from "@/data/items/equipment-packs";

type Props = {
  attacks: { name: string; bonus: number; damage: string }[];
  equipped?: {
    weaponSlot1?: { name: string; type: string; slots: number; versatileMode?: boolean }[];
    weaponSlot2?: { name: string; type: string; slots: number; versatileMode?: boolean }[];
    activeWeaponSlot?: number;
    armor?: { name: string; type: string };
    shield1?: { name: string; type: string };
    shield2?: { name: string; type: string };
    capacityItem?: { name: string; capacity: number };
  };
  stats?: Record<string, number>;
  proficiencyBonus?: number;
  classKey?: string;
  level?: number;
  onRoll?: (desc: string, ability: string, bonus: number, type: string, damageString?: string, attackRoll?: number) => void;
  onSwitchWeaponSlot?: (slot: number) => void;
  onUpdateEquipped?: (newEquipped: any) => void;
  characterData?: any;
};

type TabType = "actions" | "spells" | "inventory" | "features";
type ActionType = "attack" | "action" | "bonus" | "reaction";

export default function Attacks({ attacks, equipped, stats, proficiencyBonus, classKey, level, onRoll, onSwitchWeaponSlot, onUpdateEquipped, characterData }: Props) {
  const { frameColor } = useFrameColor();
  const [criticalHits, setCriticalHits] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<TabType>("actions");
  const [activeActionType, setActiveActionType] = useState<ActionType>("attack");
  
  // Состояние для экипировки (локальное, не синхронизируется с equipped)
  const [localEquipped, setLocalEquipped] = useState<{
    armor: string | null;
    mainSet: Array<{name: string, slots: number, isVersatile?: boolean, versatileMode?: boolean}>;
    additionalSet: Array<{name: string, slots: number, isVersatile?: boolean, versatileMode?: boolean}>;
  }>({
    armor: null,
    mainSet: [],
    additionalSet: []
  });

  // Инициализация и синхронизация локального состояния на основе equipped
  useEffect(() => {
    if (equipped) {
      // Оружие из слота 1 идет в основной набор
      const mainWeapons = equipped.weaponSlot1?.map(w => ({
        name: w.name,
        slots: w.slots,
        isVersatile: (w as any).isVersatile || false,
        versatileMode: (w as any).versatileMode || false
      })) || [];
      
      // Оружие из слота 2 идет в дополнительный набор
      const additionalWeapons = equipped.weaponSlot2?.map(w => ({
        name: w.name,
        slots: w.slots,
        isVersatile: (w as any).isVersatile || false,
        versatileMode: (w as any).versatileMode || false
      })) || [];
      
      // Щиты из слота 1 идет в основной набор
      const mainShields = equipped.shield1 ? [{
        name: equipped.shield1.name,
        slots: (equipped.shield1 as any).slots || 1,
        isVersatile: (equipped.shield1 as any).isVersatile || false,
        versatileMode: (equipped.shield1 as any).versatileMode || false
      }] : [];
      
      // Щиты из слота 2 идет в дополнительный набор
      const additionalShields = equipped.shield2 ? [{
        name: equipped.shield2.name,
        slots: (equipped.shield2 as any).slots || 1,
        isVersatile: (equipped.shield2 as any).isVersatile || false,
        versatileMode: (equipped.shield2 as any).versatileMode || false
      }] : [];
      
      setLocalEquipped({
        armor: equipped.armor?.name || null,
        mainSet: [...mainWeapons, ...mainShields],
        additionalSet: [...additionalWeapons, ...additionalShields]
      });
    }
  }, [equipped]);

  // Получаем все оружие с информацией о слоте
  const getAllWeapons = () => {
    if (!equipped) return [];
    
    const activeSlot = equipped.activeWeaponSlot || 1;
    const allWeapons = [];
    
    // Добавляем оружие из первого слота
    if (equipped.weaponSlot1 && equipped.weaponSlot1.length > 0) {
      equipped.weaponSlot1.forEach(weapon => {
        allWeapons.push({ ...weapon, slot: 1, isActive: activeSlot === 1 });
      });
    }
    
    // Добавляем оружие из второго слота
    if (equipped.weaponSlot2 && equipped.weaponSlot2.length > 0) {
      equipped.weaponSlot2.forEach(weapon => {
        allWeapons.push({ ...weapon, slot: 2, isActive: activeSlot === 2 });
      });
    }
    
    return allWeapons;
  };

  // Получаем бонус к атаке для оружия
  const getAttackBonus = (weapon: any) => {
    if (!stats || !proficiencyBonus) return 0;
    
    // Находим данные об оружии по имени
    const weaponData = Weapons.find(w => w.name === weapon.name);
    const weaponType = weaponData?.type || 'melee';
    
    // Для оружия ближнего боя используем силу, для дальнего - ловкость
    const abilityModifier = weaponType === 'ranged' ? 
      Math.floor((stats.dex - 10) / 2) : 
      Math.floor((stats.str - 10) / 2);
    
    return abilityModifier + proficiencyBonus;
  };

  // Получаем урон для оружия
  const getDamage = (weapon: any) => {
    if (!stats) return "1d4";
    
    // Находим данные об оружии по имени
    const weaponData = Weapons.find(w => w.name === weapon.name);
    const baseDamage = weaponData?.damage || "1d4";
    const weaponType = weaponData?.type || 'melee';
    
    const abilityModifier = weaponType === 'ranged' ? 
      Math.floor((stats.dex - 10) / 2) : 
      Math.floor((stats.str - 10) / 2);
    
    const modifierStr = abilityModifier >= 0 ? `+${abilityModifier}` : abilityModifier.toString();
    
    // Проверяем, есть ли критическое попадание для этого оружия
    const weaponKey = `${weapon.name}-${weapon.slot}`;
    const isCritical = criticalHits[weaponKey];
    
    if (isCritical) {
      // Удваиваем количество кубиков для критического урона
      const doubledDamage = baseDamage.replace(/(\d+)d(\d+)/, (match, num, size) => {
        return `${parseInt(num) * 2}d${size}`;
      });
      return `${doubledDamage}${modifierStr}`;
    }
    
    return `${baseDamage}${modifierStr}`;
  };

  const allWeapons = getAllWeapons();

  // Функция для обработки атаки с проверкой критического попадания
  const handleAttack = (weapon: any, ability: string, bonus: number, isSpell: boolean = false) => {
    // Бросаем d20 для атаки
    const attackRoll = Math.floor(Math.random() * 20) + 1;
    const isCritical = attackRoll === 20;
    
    // Обновляем состояние критических попаданий
    if (isCritical) {
      const key = isSpell ? `spell-${weapon}` : `${weapon.name}-${weapon.slot}`;
      setCriticalHits(prev => ({ ...prev, [key]: true }));
    }
    
    // Вызываем оригинальную функцию onRoll с результатом броска
    if (onRoll) {
      // Передаем результат броска через параметры
      onRoll(isSpell ? weapon : weapon.name, ability, bonus, "Атака", undefined, attackRoll);
    }
  };

  // Функция для обработки урона с сбросом критического попадания
  const handleDamage = (weapon: any, ability: string, modifier: number, damage: string, isSpell: boolean = false) => {
    const key = isSpell ? `spell-${weapon}` : `${weapon.name}-${weapon.slot}`;
    const isCritical = criticalHits[key];
    
    // Сбрасываем критическое попадание при клике на урон
    if (isCritical) {
      setCriticalHits(prev => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    }
    
    // Вызываем оригинальную функцию onRoll
    onRoll?.(isSpell ? weapon : weapon.name, ability, modifier, "Урон", damage);
  };

  // Функция для получения русского названия заклинания
  const getSpellName = (spellKey: string) => {
    const spell = Cantrips.find(s => s.key === spellKey);
    return spell?.name || spellKey;
  };

  // Функция для получения иконки типа урона
  const getDamageIcon = (damageType?: string) => {
    switch (damageType) {
      case "Огонь":
        return "🔥";
      case "Лед":
        return "❄️";
      case "Молния":
        return "⚡";
      case "Кислота":
        return "🧪";
      case "Яд":
        return "☠️";
      case "Некротический":
        return "💀";
      case "Излучение":
        return "☀️";
      case "Психический":
        return "🧠";
      case "Силовой":
        return "💫";
      case "Гром":
        return "💥";
      case "Духовный":
        return "✨";
      default:
        return "🔮";
    }
  };

  // Функция для получения цвета типа урона
  const getDamageColor = (damageType?: string) => {
    switch (damageType) {
      case "Огонь":
        return { border: "#EF4444", bg: "#EF444420", text: "#FCA5A5" }; // Красный
      case "Лед":
        return { border: "#3B82F6", bg: "#3B82F620", text: "#93C5FD" }; // Синий
      case "Молния":
        return { border: "#60A5FA", bg: "#60A5FA20", text: "#93C5FD" }; // Голубой
      case "Кислота":
        return { border: "#10B981", bg: "#10B98120", text: "#6EE7B7" }; // Зеленый
      case "Яд":
        return { border: "#8B5CF6", bg: "#8B5CF620", text: "#C4B5FD" }; // Фиолетовый
      case "Некротический":
        return { border: "#6B7280", bg: "#6B728020", text: "#D1D5DB" }; // Серый
      case "Излучение":
        return { border: "#F97316", bg: "#F9731620", text: "#FDBA74" }; // Оранжевый
      case "Психический":
        return { border: "#EC4899", bg: "#EC489920", text: "#F9A8D4" }; // Розовый
      case "Силовой":
        return { border: "#C0C0C0", bg: "#C0C0C020", text: "#E5E7EB" }; // Серебряный
      case "Гром":
        return { border: "#F59E0B", bg: "#F59E0B20", text: "#FCD34D" }; // Желтый
      case "Духовный":
        return { border: "#F59E0B", bg: "#F59E0B20", text: "#FCD34D" }; // Золотой
      default:
        return { border: "#A855F7", bg: "#A855F720", text: "#C4B5FD" }; // Фиолетовый по умолчанию
    }
  };

  // Функция для получения данных заклинания
  const getSpellData = (spellKey: string) => {
    return Cantrips.find(s => s.key === spellKey);
  };

  // Получаем количество атак за действие (зависит от уровня и класса)
  const getAttacksPerAction = () => {
    // Базовая атака: 1
    let attacks = 1;
    
    // Добавляем дополнительные атаки из особенностей класса
    if (classKey && level) {
      const classInfo = getClassByKey(classKey);
      if (classInfo?.features) {
        // Проходим по всем уровням от 1 до текущего уровня
        for (let lvl = 1; lvl <= level; lvl++) {
          const features = classInfo.features[lvl];
          if (features) {
            features.forEach(feature => {
              if (feature.extraAttack) {
                attacks += feature.extraAttack;
              }
            });
          }
        }
      }
    }
    
    return attacks;
  };

  // Функция для получения веса предмета
  const getItemWeight = (itemName: string) => {
    const cleanName = itemName.replace(/^\d+x\s+/, '');
    
    // Ищем в разных массивах
    let item = Gears.find(g => g.name === cleanName);
    if (item) {
      return typeof item.weight === 'number' ? item.weight : 0;
    }
    
    item = Ammunitions.find(a => a.name === cleanName);
    if (item) {
      return typeof item.weight === 'number' ? item.weight : 0;
    }
    
    const weapon = Weapons.find(w => w.name === cleanName);
    if (weapon) {
      return typeof weapon.weight === 'number' ? weapon.weight : 0;
    }
    
    const armor = Armors.find(a => a.name === cleanName);
    if (armor) {
      return typeof armor.weight === 'number' ? armor.weight : 0;
    }
    
    const pack = EQUIPMENT_PACKS.find(p => p.name === cleanName);
    if (pack) {
      return typeof pack.weight === 'number' ? pack.weight : 0;
    }
    
    const tool = Tools.find(t => t.name === cleanName);
    if (tool) {
      return typeof tool.weight === 'number' ? tool.weight : 0;
    }
    
    return 0;
  };

  // Функция для получения стоимости предмета
  const getItemCost = (itemName: string) => {
    const cleanName = itemName.replace(/^\d+x\s+/, '');
    
    // Ищем в разных массивах
    let item = Gears.find(g => g.name === cleanName);
    if (item) {
      return item.cost || 'Неизвестно';
    }
    
    item = Ammunitions.find(a => a.name === cleanName);
    if (item) {
      return item.cost || 'Неизвестно';
    }
    
    const weapon = Weapons.find(w => w.name === cleanName);
    if (weapon) {
      return weapon.cost || 'Неизвестно';
    }
    
    const armor = Armors.find(a => a.name === cleanName);
    if (armor) {
      return armor.cost || 'Неизвестно';
    }
    
    const pack = EQUIPMENT_PACKS.find(p => p.name === cleanName);
    if (pack) {
      return pack.cost || 'Неизвестно';
    }
    
    const tool = Tools.find(t => t.name === cleanName);
    if (tool) {
      return tool.cost || 'Неизвестно';
    }
    
    return 'Неизвестно';
  };

  // Функция для получения количества предмета
  const getItemQuantity = (itemName: string) => {
    const match = itemName.match(/^(\d+)x\s+(.+)$/);
    if (match) {
      return parseInt(match[1]);
    }
    return 1;
  };

  // Функция для определения типа предмета
  const getItemType = (itemName: string) => {
    const cleanName = itemName.replace(/^\d+x\s+/, '');
    
    // Проверяем оружие
    const weapon = Weapons.find(w => w.name === cleanName);
    if (weapon) return 'weapon';
    
    // Проверяем доспехи и щиты
    const armor = Armors.find(a => a.name === cleanName);
    if (armor) {
      if (armor.category === 'shield') {
        return 'shield';
      }
      return 'armor';
    }
    
    return 'other';
  };

  // Функция для проверки, является ли оружие универсальным
  const isVersatileWeapon = (itemName: string) => {
    const cleanName = itemName.replace(/^\d+x\s+/, '');
    const weapon = Weapons.find(w => w.name === cleanName);
    return weapon?.properties?.includes('versatile') || false;
  };

  // Функция для проверки, экипирован ли предмет
  const isItemEquipped = (itemName: string) => {
    const cleanName = itemName.replace(/^\d+x\s+/, '');
    const itemType = getItemType(itemName);
    
    switch (itemType) {
      case 'armor':
        return localEquipped.armor === cleanName;
      case 'weapon':
      case 'shield':
        return localEquipped.mainSet.some(item => item.name === cleanName) || 
               localEquipped.additionalSet.some(item => item.name === cleanName);
      default:
        return false;
    }
  };

  // Функция для проверки, можно ли экипировать предмет
  const canEquipItem = (itemName: string) => {
    const cleanName = itemName.replace(/^\d+x\s+/, '');
    const itemType = getItemType(itemName);
    
    if (itemType === 'other') return false;
    
    // Проверяем ограничения
    if (itemType === 'armor' && localEquipped.armor) return false;
    if (itemType === 'shield' && (localEquipped.mainSet.some(item => item.name === cleanName) || localEquipped.additionalSet.some(item => item.name === cleanName))) return false;
    
    if (itemType === 'weapon' || itemType === 'shield') {
      const requiredSlots = getItemSlots(itemName);
      const mainUsedSlots = getUsedSlots(localEquipped.mainSet);
      const additionalUsedSlots = getUsedSlots(localEquipped.additionalSet);
      
      // Проверяем, есть ли место хотя бы в одном наборе
      return (mainUsedSlots + requiredSlots <= 2) || (additionalUsedSlots + requiredSlots <= 2);
    }
    
    return true;
  };

  // Функция для переключения универсального режима оружия
  const toggleVersatileMode = (itemName: string) => {
    const cleanName = itemName.replace(/^\d+x\s+/, '');
    
    setLocalEquipped(prev => {
      // Ищем оружие в обоих наборах
      const mainItem = prev.mainSet.find(item => item.name === cleanName);
      const additionalItem = prev.additionalSet.find(item => item.name === cleanName);
      const item = mainItem || additionalItem;
      
      if (!item || !item.isVersatile) {
        return prev;
      }
      
      const newVersatileMode = !item.versatileMode;
      const newSlots = newVersatileMode ? 2 : 1;
      const updatedItem = { ...item, versatileMode: newVersatileMode, slots: newSlots };
      
      // Проверяем, помещается ли оружие в текущий набор
      const currentSet = mainItem ? prev.mainSet : prev.additionalSet;
      const otherSet = mainItem ? prev.additionalSet : prev.mainSet;
      
      const currentUsedSlots = getUsedSlots(currentSet) - item.slots + newSlots;
      const otherUsedSlots = getUsedSlots(otherSet);
      
      if (currentUsedSlots <= 2) {
        // Помещается в текущий набор
        if (mainItem) {
          return {
            ...prev,
            mainSet: prev.mainSet.map(i => i.name === cleanName ? updatedItem : i)
          };
        } else {
          return {
            ...prev,
            additionalSet: prev.additionalSet.map(i => i.name === cleanName ? updatedItem : i)
          };
        }
      } else if (otherUsedSlots + newSlots <= 2) {
        // Помещается в другой набор
        if (mainItem) {
          return {
            ...prev,
            mainSet: prev.mainSet.filter(i => i.name !== cleanName),
            additionalSet: [...prev.additionalSet, updatedItem]
          };
        } else {
          return {
            ...prev,
            additionalSet: prev.additionalSet.filter(i => i.name !== cleanName),
            mainSet: [...prev.mainSet, updatedItem]
          };
        }
      } else {
        // Не помещается ни в один набор, заменяем текущий
        if (mainItem) {
          return {
            ...prev,
            mainSet: [updatedItem]
          };
        } else {
          return {
            ...prev,
            additionalSet: [updatedItem]
          };
        }
      }
    });
  };

  // Функция для переключения экипировки предмета
  const toggleItemEquipped = (itemName: string) => {
    const cleanName = itemName.replace(/^\d+x\s+/, '');
    const itemType = getItemType(itemName);
    
    setLocalEquipped(prev => {
      switch (itemType) {
        case 'armor':
          return {
            ...prev,
            armor: prev.armor === cleanName ? null : cleanName
          };
          
        case 'weapon':
        case 'shield':
          // Если предмет уже экипирован, снимаем его
          const mainItem = prev.mainSet.find(item => item.name === cleanName);
          const additionalItem = prev.additionalSet.find(item => item.name === cleanName);
          
          if (mainItem) {
            return {
              ...prev,
              mainSet: prev.mainSet.filter(item => item.name !== cleanName)
            };
          }
          if (additionalItem) {
            return {
              ...prev,
              additionalSet: prev.additionalSet.filter(item => item.name !== cleanName)
            };
          }
          
          // Если не экипирован, добавляем в подходящий набор
          const isVersatile = isVersatileWeapon(itemName);
          const requiredSlots = getItemSlots(itemName, false); // По умолчанию одноручный режим
          const mainUsedSlots = getUsedSlots(prev.mainSet);
          const additionalUsedSlots = getUsedSlots(prev.additionalSet);
          
          const newItem = {
            name: cleanName,
            slots: requiredSlots,
            isVersatile,
            versatileMode: false
          };
          
          // Сначала пытаемся добавить в основной набор
          if (mainUsedSlots + requiredSlots <= 2) {
            return {
              ...prev,
              mainSet: [...prev.mainSet, newItem]
            };
          }
          // Если не помещается в основной, добавляем в дополнительный
          else if (additionalUsedSlots + requiredSlots <= 2) {
            return {
              ...prev,
              additionalSet: [...prev.additionalSet, newItem]
            };
          }
          // Если не помещается ни в один, заменяем основной набор
          else {
            return {
              ...prev,
              mainSet: [newItem]
            };
          }
          
        default:
          return prev;
      }
    });
  };

  // Функция для подсчета слотов, занятых предметом
  const getItemSlots = (itemName: string, versatileMode?: boolean) => {
    const cleanName = itemName.replace(/^\d+x\s+/, '');
    const itemType = getItemType(itemName);
    
    if (itemType === 'weapon') {
      const weapon = Weapons.find(w => w.name === cleanName);
      if (weapon?.properties?.includes('two-handed')) {
        return 2;
      }
      if (weapon?.properties?.includes('versatile') && versatileMode) {
        return 2;
      }
      return 1;
    }
    
    if (itemType === 'shield') {
      return 1;
    }
    
    return 0;
  };

  // Функция для подсчета занятых слотов в наборе
  const getUsedSlots = (set: Array<{name: string, slots: number, isVersatile?: boolean, versatileMode?: boolean}>) => {
    return set.reduce((total, item) => total + item.slots, 0);
  };

  // Функция для подсчета свободных слотов в наборе
  const getFreeSlots = (set: Array<{name: string, slots: number, isVersatile?: boolean, versatileMode?: boolean}>) => {
    const used = getUsedSlots(set);
    return Math.max(0, 2 - used); // Максимум 2 слота на набор
  };

  // Функция для подсчета занятых слотов в наборе
  const getUsedSlotsCount = (set: Array<{name: string, slots: number, isVersatile?: boolean, versatileMode?: boolean}>) => {
    return getUsedSlots(set);
  };

  // Подсчет общего веса инвентаря
  const calculateTotalWeight = () => {
    if (!characterData?.equipment) {
      console.log('No equipment data found');
      return 0;
    }
    
    let totalWeight = 0;
    characterData.equipment.forEach((item: string) => {
      const weight = getItemWeight(item);
      console.log(`Item: ${item}, Weight: ${weight}`);
      totalWeight += weight;
    });
    console.log(`Total weight: ${totalWeight}`);
    return totalWeight;
  };

  // Расчет максимального переносимого веса
  const calculateMaxCarryWeight = () => {
    const strength = stats?.str || 10;
    const baseCapacity = strength * 15; // Базовая формула D&D 5e
    
    // Добавляем capacity от надетых предметов
    const equippedCapacity = equipped?.capacityItem?.capacity || 0;
    
    return baseCapacity + equippedCapacity;
  };

  // Проверка перегрузки
  const isOverloaded = (currentWeight: number) => {
    const maxWeight = calculateMaxCarryWeight();
    return currentWeight > maxWeight;
  };

  // Получение валюты
  const getCurrency = () => {
    console.log('Currency data:', characterData?.currency);
    if (!characterData?.currency) return null;
    
    const { platinum, gold, electrum, silver, copper } = characterData.currency;
    const totalValue = platinum * 1000 + gold * 100 + electrum * 50 + silver * 10 + copper;
    
    console.log('Currency values:', { platinum, gold, electrum, silver, copper, totalValue });
    
    if (totalValue === 0) return null;
    
    const parts = [];
    if (platinum > 0) parts.push(`${platinum} ПП`);
    if (gold > 0) parts.push(`${gold} ЗМ`);
    if (electrum > 0) parts.push(`${electrum} ЭМ`);
    if (silver > 0) parts.push(`${silver} СМ`);
    if (copper > 0) parts.push(`${copper} ММ`);
    
    const result = parts.join(', ');
    console.log('Currency result:', result);
    return result;
  };

  const tabs = [
    { key: "actions" as TabType, label: "ДЕЙСТВИЯ" },
    { key: "spells" as TabType, label: "ЗАКЛИНАНИЯ" },
    { key: "inventory" as TabType, label: "ИНВЕНТАРЬ" },
    { key: "features" as TabType, label: "ОСОБЕННОСТИ" }
  ];

  const actionTypes = [
    { key: "attack" as ActionType, label: "АТАКА" },
    { key: "action" as ActionType, label: "ДЕЙСТВИЕ" },
    { key: "bonus" as ActionType, label: "БОНУСНОЕ ДЕЙСТВИЕ" },
    { key: "reaction" as ActionType, label: "РЕАКЦИЯ" }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "actions":
        return (
          <div>
            {/* Подменю типов действий */}
            <div 
              className="flex gap-1 mb-2"
            >
              {actionTypes.map((actionType) => {
                const isActive = activeActionType === actionType.key;
                const frameColorHex = frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54';
                
                return (
                  <button
                    key={actionType.key}
                    onClick={() => setActiveActionType(actionType.key)}
                    className="px-2 py-1 text-xs font-semibold uppercase transition-all duration-200 relative rounded"
                    style={{
                      color: isActive ? '#FFFFFF' : '#6B7280',
                      backgroundColor: isActive ? frameColorHex : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = `${frameColorHex}20`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {actionType.label}
                  </button>
                );
              })}
            </div>
            
            {/* Заголовок с информацией о количестве атак */}
            {activeActionType === "attack" && (
              <div className="mt-5">
                <div 
                  className="text-xs font-semibold uppercase mb-4 flex items-center justify-between pb-2"
                  style={{
                    borderBottom: `1px solid ${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}60`
                  }}
                >
                  <div className="flex items-center">
                    <span style={{ color: frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54' }}>
                      ДЕЙСТВИЯ
                    </span>
                    <span className="text-gray-400 ml-2">• Атак за действие: {getAttacksPerAction()}</span>
                    <span className="text-gray-400 ml-2">• АКТИВНЫЙ НАБОР:</span>
                    
                    {/* Кнопки переключения слотов */}
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => onSwitchWeaponSlot?.(1)}
                        className={`px-3 py-1 text-sm font-semibold rounded transition-all duration-200 w-[25px] h-[25px] flex items-center justify-center ${
                          (equipped?.activeWeaponSlot || 1) === 1 
                            ? 'text-white' 
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                        style={{
                          backgroundColor: (equipped?.activeWeaponSlot || 1) === 1 
                            ? (frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54')
                            : 'transparent',
                          border: `1px solid ${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}40`
                        }}
                      >
                        I
                      </button>
                      <button
                        onClick={() => onSwitchWeaponSlot?.(2)}
                        className={`px-3 py-1 text-sm font-semibold rounded transition-all duration-200 w-[25px] h-[25px] flex items-center justify-center ${
                          (equipped?.activeWeaponSlot || 1) === 2 
                            ? 'text-white' 
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                        style={{
                          backgroundColor: (equipped?.activeWeaponSlot || 1) === 2 
                            ? (frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54')
                            : 'transparent',
                          border: `1px solid ${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}40`
                        }}
                      >
                        II
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Контент в зависимости от выбранного типа действия */}
            <div className="space-y-2 text-sm">
              {activeActionType === "attack" && (
                <div>
                  {/* Заголовки таблицы */}
                  <div className="grid gap-2 text-sm font-semibold uppercase text-gray-400 mb-2 pb-1 items-center" 
                       style={{ 
                         gridTemplateColumns: '2fr 1fr 1fr 1fr',
                         borderBottom: `1px solid ${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}20` 
                       }}>
                    <div className="flex items-center justify-start">АТАКА</div>
                    <div className="flex items-center justify-center">ДАЛЬНОСТЬ</div>
                    <div className="flex items-center justify-center">ПОПАДАНИЕ</div>
                    <div className="flex items-center justify-center">УРОН</div>
                  </div>
                  
                  {/* Строки с оружием и заклинаниями */}
                  {(() => {
                    const allActions = [];
                    
                    // Добавляем оружие
                    allWeapons.forEach((weapon, i) => {
                      allActions.push({ type: 'weapon', data: weapon, index: i });
                    });
                    
                    // Добавляем заклинания
                    if (characterData?.spells?.length > 0) {
                      characterData.spells.forEach((spell: string, i: number) => {
                        allActions.push({ type: 'spell', data: spell, index: i });
                      });
                    }
                    
                    if (allActions.length === 0) {
                      return (
                        <div className="text-center text-gray-500 text-sm py-4">
                          Нет доступных действий
                        </div>
                      );
                    }
                    
                    return allActions.map((action, i) => {
                      if (action.type === 'weapon') {
                        const weapon = action.data;
                        const attackBonus = getAttackBonus(weapon);
                        const damage = getDamage(weapon);
                        const weaponData = Weapons.find(w => w.name === weapon.name);
                        const range = weaponData?.range || (weaponData?.type === 'melee' ? '5 фт.' : '-');
                        
                        return (
                          <div key={`weapon-${action.index}`}>
                            <div className={`grid gap-2 text-sm py-1 items-center ${!weapon.isActive ? 'opacity-60' : ''}`}
                                 style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
                              <div className="text-gray-200 truncate flex items-center justify-start">
                                <span className="text-sm text-gray-500 mr-1 w-3 inline-block text-center">{weapon.slot === 1 ? 'I' : 'II'}</span>
                                {weapon.name}
                              </div>
                              <div className="text-gray-300 flex items-center justify-center">{range}</div>
                              <div 
                                className="text-gray-300 font-semibold border-2 w-[70px] rounded-md px-2 py-1 cursor-pointer transition-all duration-200 flex items-center justify-center mx-auto"
                                style={{
                                  borderColor: `${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}40`,
                                  backgroundColor: 'transparent'
                                }}
                                onClick={() => handleAttack(weapon, weaponData?.type === 'ranged' ? 'dex' : 'str', attackBonus)}
                                onMouseEnter={(e) => {
                                  const lightColor = criticalHits[`${weapon.name}-${weapon.slot}`] 
                                    ? '#F59E0B' 
                                    : frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54';
                                  e.currentTarget.style.backgroundColor = `${lightColor}20`;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = criticalHits[`${weapon.name}-${weapon.slot}`] 
                                    ? '#F59E0B20' 
                                    : 'transparent';
                                }}
                              >
                                {attackBonus > 0 ? `+${attackBonus}` : attackBonus === 0 ? '0' : attackBonus}
                              </div>
                              <div className="relative flex items-center justify-center mx-auto">
                                {/* Молния слева от рамки (абсолютное позиционирование) */}
                                {criticalHits[`${weapon.name}-${weapon.slot}`] && (
                                  <span className="absolute -left-6 text-yellow-400 text-lg animate-pulse z-10">
                                    ⚡
                                  </span>
                                )}
                                
                                {/* Рамка с уроном */}
                                <div 
                                  className={`border-2 w-[70px] rounded-md px-1 py-1 cursor-pointer transition-all duration-200 flex items-center justify-center ${
                                    criticalHits[`${weapon.name}-${weapon.slot}`] 
                                      ? 'text-yellow-300 font-bold animate-pulse' 
                                      : 'text-gray-300'
                                  }`}
                                  style={{
                                    borderColor: criticalHits[`${weapon.name}-${weapon.slot}`] 
                                      ? '#F59E0B' 
                                      : `${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}40`,
                                    backgroundColor: criticalHits[`${weapon.name}-${weapon.slot}`] 
                                      ? '#F59E0B20' 
                                      : 'transparent'
                                  }}
                                  onClick={() => {
                                    const weaponData = Weapons.find(w => w.name === weapon.name);
                                    const weaponType = weaponData?.type || 'melee';
                                    const abilityModifier = weaponType === 'ranged' ? 
                                      Math.floor(((stats?.dex || 10) - 10) / 2) : 
                                      Math.floor(((stats?.str || 10) - 10) / 2);
                                    handleDamage(weapon, weaponType === 'ranged' ? 'dex' : 'str', abilityModifier, damage);
                                  }}
                                  onMouseEnter={(e) => {
                                    const lightColor = criticalHits[`${weapon.name}-${weapon.slot}`] 
                                      ? '#F59E0B' 
                                      : frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54';
                                    e.currentTarget.style.backgroundColor = `${lightColor}20`;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = criticalHits[`${weapon.name}-${weapon.slot}`] 
                                      ? '#F59E0B20' 
                                      : 'transparent';
                                  }}
                                >
                                  {damage}
                                </div>
                              </div>
                            </div>
                            
                            {/* Пунктирная линия между строками (кроме последней) */}
                            {i < allActions.length - 1 && (
                              <div 
                                className="my-1 h-px"
                                style={{
                                  borderTop: `1px dotted ${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}40`
                                }}
                              />
                            )}
                          </div>
                        );
                      } else if (action.type === 'spell') {
                        const spellKey = action.data;
                        const spellName = getSpellName(spellKey);
                        const spellData = getSpellData(spellKey);
                        // Для заклинаний используем харизму (паладин)
                        const spellAbility = 'cha';
                        const spellModifier = Math.floor(((stats?.[spellAbility] || 10) - 10) / 2);
                        const spellAttackBonus = spellModifier + (proficiencyBonus || 0);
                        
                        // Получаем дальность из данных заклинания
                        let spellRange = spellData?.range || "60 фт.";
                        
                        // Преобразуем в строку, если это число
                        if (typeof spellRange === 'number') {
                          spellRange = spellRange.toString();
                        }
                        
                        // Если дальность не содержит единицы измерения, добавляем "фт."
                        if (spellRange && typeof spellRange === 'string' && !spellRange.includes('фт') && !spellRange.includes('м') && !spellRange.includes('км') && !spellRange.includes('на себя') && !spellRange.toLowerCase().includes('касание')) {
                          spellRange = `${spellRange} фт.`;
                        }
                        
                        // Получаем урон из данных заклинания (без модификатора характеристики)
                        const spellDamage = spellData?.damage?.dice || "1d10";
                        
                        return (
                          <div key={`spell-${action.index}`}>
                            <div className="grid gap-2 text-sm py-1 items-center"
                                 style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
                              <div className="text-gray-200 truncate flex items-center justify-start">
                                <span className="text-sm text-gray-500 mr-1 w-3 inline-block text-center">★</span>
                                {spellName}
                              </div>
                              <div className="text-gray-300 flex items-center justify-center">{spellRange}</div>
                              <div 
                                className="text-gray-300 font-semibold border-2 w-[70px] rounded-md px-2 py-1 cursor-pointer transition-all duration-200 flex items-center justify-center mx-auto"
                                style={{
                                  borderColor: `${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}40`,
                                  backgroundColor: 'transparent'
                                }}
                                onClick={() => handleAttack(spellName, spellAbility, spellAttackBonus, true)}
                                onMouseEnter={(e) => {
                                  const lightColor = criticalHits[`spell-${spellName}`] 
                                    ? '#F59E0B' 
                                    : frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54';
                                  e.currentTarget.style.backgroundColor = `${lightColor}20`;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = criticalHits[`spell-${spellName}`] 
                                    ? '#F59E0B20' 
                                    : 'transparent';
                                }}
                              >
                                {spellAttackBonus > 0 ? `+${spellAttackBonus}` : spellAttackBonus === 0 ? '0' : spellAttackBonus}
                              </div>
                              <div className="relative flex items-center justify-center mx-auto">
                                {/* Иконка типа урона слева от рамки для заклинаний */}
                                {criticalHits[`spell-${spellName}`] && (
                                  <span 
                                    className="absolute -left-6 text-lg animate-pulse z-10"
                                    style={{ 
                                      color: getDamageColor(spellData?.damage?.type).text,
                                      filter: spellData?.damage?.type === "Молния" ? "hue-rotate(200deg) saturate(1.5)" : 
                                             spellData?.damage?.type === "Силовой" ? "hue-rotate(0deg) saturate(0.3) brightness(1.2)" :
                                             spellData?.damage?.type === "Духовный" ? "hue-rotate(45deg) saturate(1.2) brightness(1.1)" : "none"
                                    }}
                                  >
                                    {getDamageIcon(spellData?.damage?.type)}
                                  </span>
                                )}
                                
                                {/* Рамка с уроном заклинания */}
                                <div 
                                  className={`border-2 w-[70px] rounded-md px-1 py-1 cursor-pointer transition-all duration-200 flex items-center justify-center ${
                                    criticalHits[`spell-${spellName}`] 
                                      ? 'font-bold animate-pulse' 
                                      : 'text-gray-300'
                                  }`}
                                  style={{
                                    borderColor: criticalHits[`spell-${spellName}`] 
                                      ? getDamageColor(spellData?.damage?.type).border
                                      : `${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}40`,
                                    backgroundColor: criticalHits[`spell-${spellName}`] 
                                      ? getDamageColor(spellData?.damage?.type).bg
                                      : 'transparent',
                                    color: criticalHits[`spell-${spellName}`] 
                                      ? getDamageColor(spellData?.damage?.type).text
                                      : '#D1D5DB'
                                  }}
                                  onClick={() => {
                                    const criticalDamage = criticalHits[`spell-${spellName}`] ? 
                                      spellDamage.replace(/(\d+)d(\d+)/, (match, num, size) => `${parseInt(num) * 2}d${size}`) : 
                                      spellDamage;
                                    handleDamage(spellName, spellAbility, 0, criticalDamage, true);
                                  }}
                                  onMouseEnter={(e) => {
                                    const lightColor = criticalHits[`spell-${spellName}`] 
                                      ? getDamageColor(spellData?.damage?.type).border
                                      : frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54';
                                    e.currentTarget.style.backgroundColor = `${lightColor}20`;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = criticalHits[`spell-${spellName}`] 
                                      ? getDamageColor(spellData?.damage?.type).bg
                                      : 'transparent';
                                  }}
                                >
                                  {criticalHits[`spell-${spellName}`] ? 
                                    spellDamage.replace(/(\d+)d(\d+)/, (match, num, size) => `${parseInt(num) * 2}d${size}`) : 
                                    spellDamage
                                  }
                                </div>
                              </div>
                            </div>
                            
                            {/* Пунктирная линия между строками (кроме последней) */}
                            {i < allActions.length - 1 && (
                              <div 
                                className="my-1 h-px"
                                style={{
                                  borderTop: `1px dotted ${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}40`
                                }}
                              />
                            )}
                          </div>
                        );
                      }
                      return null;
                    });
                  })()}
                </div>
              )}
                
                {/* Таблица бонусных действий */}
                <div className="mt-6">
                  {/* Заголовок для бонусных действий */}
                  <div 
                    className="text-xs font-semibold uppercase mb-2 flex items-center mt-6 pb-2"
                    style={{
                      borderBottom: `1px solid ${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}60`
                    }}
                  >
                    <span style={{ color: frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54' }}>
                      БОНУСНЫЕ ДЕЙСТВИЯ
                    </span>
                  </div>
                  
                  {/* Заголовки таблицы */}
                  <div className="grid gap-2 text-sm font-semibold uppercase text-gray-400 mb-2 pb-1 items-center mt-4" 
                       style={{ 
                         gridTemplateColumns: '2fr 1fr 1fr 1fr',
                         borderBottom: `1px solid ${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}20` 
                       }}>
                    <div className="flex items-center justify-start">АТАКА</div>
                    <div className="flex items-center justify-center">ДАЛЬНОСТЬ</div>
                    <div className="flex items-center justify-center">ПОПАДАНИЕ</div>
                    <div className="flex items-center justify-center">УРОН</div>
                  </div>
                  
                  {/* Строки с бонусными действиями */}
                  {(() => {
                    const bonusActions = [];
                    
                    // Добавляем заклинания, которые являются бонусными действиями
                    if (characterData?.spells?.length > 0) {
                      characterData.spells.forEach((spell: string, i: number) => {
                        const spellData = getSpellData(spell);
                        // Проверяем, является ли заклинание бонусным действием
                        if (spellData?.castingTime === "бонусное действие" || 
                            spellData?.castingTime === "Бонусное действие" ||
                            spellData?.castingTime === "1 бонусное действие") {
                          bonusActions.push({ type: 'spell', data: spell, index: i });
                        }
                      });
                    }
                    
                    if (bonusActions.length === 0) {
                      return (
                        <div className="text-center text-gray-500 text-sm py-4">
                          Нет доступных бонусных действий
                        </div>
                      );
                    }
                    
                    return bonusActions.map((action, i) => {
                      if (action.type === 'spell') {
                        const spellKey = action.data;
                        const spellName = getSpellName(spellKey);
                        const spellData = getSpellData(spellKey);
                        const spellAbility = 'cha';
                        const spellModifier = Math.floor(((stats?.[spellAbility] || 10) - 10) / 2);
                        const spellAttackBonus = spellModifier + (proficiencyBonus || 0);
                        
                        // Получаем дальность из данных заклинания
                        let spellRange = spellData?.range || "60 фт.";
                        
                        // Преобразуем в строку, если это число
                        if (typeof spellRange === 'number') {
                          spellRange = spellRange.toString();
                        }
                        
                        // Если дальность не содержит единицы измерения, добавляем "фт."
                        if (spellRange && typeof spellRange === 'string' && !spellRange.includes('фт') && !spellRange.includes('м') && !spellRange.includes('км') && !spellRange.includes('на себя') && !spellRange.toLowerCase().includes('касание')) {
                          spellRange = `${spellRange} фт.`;
                        }
                        
                        // Получаем урон из данных заклинания (без модификатора характеристики)
                        const spellDamage = spellData?.damage?.dice || "1d10";
                        
                        return (
                          <div key={`bonus-spell-${action.index}`}>
                            <div className="grid gap-2 text-sm py-1 items-center"
                                 style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
                              <div className="text-gray-200 truncate flex items-center justify-start">
                                <span className="text-sm text-gray-500 mr-1 w-3 inline-block text-center">★</span>
                                {spellName}
                              </div>
                              <div className="text-gray-300 flex items-center justify-center">{spellRange}</div>
                              <div 
                                className="text-gray-300 font-semibold border-2 w-[70px] rounded-md px-2 py-1 cursor-pointer transition-all duration-200 flex items-center justify-center mx-auto"
                                style={{
                                  borderColor: `${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}40`,
                                  backgroundColor: 'transparent'
                                }}
                                onClick={() => handleAttack(spellName, spellAbility, spellAttackBonus, true)}
                                onMouseEnter={(e) => {
                                  const lightColor = criticalHits[`spell-${spellName}`] 
                                    ? '#F59E0B' 
                                    : frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54';
                                  e.currentTarget.style.backgroundColor = `${lightColor}20`;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = criticalHits[`spell-${spellName}`] 
                                    ? '#F59E0B20' 
                                    : 'transparent';
                                }}
                              >
                                {spellAttackBonus > 0 ? `+${spellAttackBonus}` : spellAttackBonus === 0 ? '0' : spellAttackBonus}
                              </div>
                              <div className="relative flex items-center justify-center mx-auto">
                                {/* Иконка типа урона слева от рамки для заклинаний */}
                                {criticalHits[`spell-${spellName}`] && (
                                  <span 
                                    className="absolute -left-6 text-lg animate-pulse z-10"
                                    style={{ 
                                      color: getDamageColor(spellData?.damage?.type).text,
                                      filter: spellData?.damage?.type === "Молния" ? "hue-rotate(200deg) saturate(1.5)" : 
                                             spellData?.damage?.type === "Силовой" ? "hue-rotate(0deg) saturate(0.3) brightness(1.2)" :
                                             spellData?.damage?.type === "Духовный" ? "hue-rotate(45deg) saturate(1.2) brightness(1.1)" : "none"
                                    }}
                                  >
                                    {getDamageIcon(spellData?.damage?.type)}
                                  </span>
                                )}
                                
                                {/* Рамка с уроном заклинания */}
                                <div 
                                  className={`border-2 w-[70px] rounded-md px-1 py-1 cursor-pointer transition-all duration-200 flex items-center justify-center ${
                                    criticalHits[`spell-${spellName}`] 
                                      ? 'font-bold animate-pulse' 
                                      : 'text-gray-300'
                                  }`}
                                  style={{
                                    borderColor: criticalHits[`spell-${spellName}`] 
                                      ? getDamageColor(spellData?.damage?.type).border
                                      : `${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}40`,
                                    backgroundColor: criticalHits[`spell-${spellName}`] 
                                      ? getDamageColor(spellData?.damage?.type).bg
                                      : 'transparent',
                                    color: criticalHits[`spell-${spellName}`] 
                                      ? getDamageColor(spellData?.damage?.type).text
                                      : '#D1D5DB'
                                  }}
                                  onClick={() => {
                                    const criticalDamage = criticalHits[`spell-${spellName}`] ? 
                                      spellDamage.replace(/(\d+)d(\d+)/, (match, num, size) => `${parseInt(num) * 2}d${size}`) : 
                                      spellDamage;
                                    handleDamage(spellName, spellAbility, 0, criticalDamage, true);
                                  }}
                                  onMouseEnter={(e) => {
                                    const lightColor = criticalHits[`spell-${spellName}`] 
                                      ? getDamageColor(spellData?.damage?.type).border
                                      : frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54';
                                    e.currentTarget.style.backgroundColor = `${lightColor}20`;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = criticalHits[`spell-${spellName}`] 
                                      ? getDamageColor(spellData?.damage?.type).bg
                                      : 'transparent';
                                  }}
                                >
                                  {criticalHits[`spell-${spellName}`] ? 
                                    spellDamage.replace(/(\d+)d(\d+)/, (match, num, size) => `${parseInt(num) * 2}d${size}`) : 
                                    spellDamage
                                  }
                                </div>
                              </div>
                            </div>
                            
                            {/* Пунктирная линия между строками (кроме последней) */}
                            {i < bonusActions.length - 1 && (
                              <div 
                                className="my-1 h-px"
                                style={{
                                  borderTop: `1px dotted ${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}40`
                                }}
                              />
                            )}
                          </div>
                        );
                      }
                      return null;
                    });
                  })()}
                </div>              
              {activeActionType === "action" && (
                <div className="text-center text-gray-500 text-sm py-4">
                  Действия будут здесь
                </div>
              )}
              
              {activeActionType === "bonus" && (
                <div className="text-center text-gray-500 text-sm py-4">
                  Бонусные действия теперь отображаются в разделе "АТАКА"
                </div>
              )}
              
              {activeActionType === "reaction" && (
                <div className="text-center text-gray-500 text-sm py-4">
                  Реакции будут здесь
                </div>
              )}
            </div>
          </div>
        );
      case "spells":
        return (
          <div>
            {/* Заговоры (всегда доступны) */}
            <div className="mb-4">
              <div 
                className="text-xs font-semibold uppercase mb-2 text-gray-400"
                style={{
                  borderBottom: `1px solid ${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}20`
                }}
              >
                ЗАГОВОРЫ (0 уровень)
              </div>
              <div className="text-sm text-gray-300 space-y-1">
                {characterData?.spells?.length > 0 ? (
                  characterData.spells.map((spell: string, index: number) => (
                    <div 
                      key={index} 
                      className="py-2 px-3 hover:bg-gray-700 rounded cursor-pointer transition-colors duration-200 border border-transparent hover:border-gray-600"
                      onClick={() => {
                        const spellModifier = Math.floor(((stats?.cha || 10) - 10) / 2);
                        const spellAttackBonus = spellModifier + (proficiencyBonus || 0);
                        handleAttack(spell, 'cha', spellAttackBonus, true);
                      }}
                    >
                      <div className="font-medium text-gray-200">{spell}</div>
                      <div className="text-xs text-gray-400">Заговор • Действие</div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-center py-4">
                    Нет заговоров
                  </div>
                )}
              </div>
            </div>
            
            {/* Подготовленные заклинания */}
            <div>
              <div 
                className="text-xs font-semibold uppercase mb-2 text-gray-400"
                style={{
                  borderBottom: `1px solid ${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}20`
                }}
              >
                ПОДГОТОВЛЕННЫЕ ЗАКЛИНАНИЯ
              </div>
              <div className="text-sm text-gray-300">
                <div className="text-gray-500 text-center py-4">
                  Система подготовки заклинаний будет добавлена позже
                </div>
              </div>
            </div>
          </div>
        );
      case "inventory":
        const currentWeight = calculateTotalWeight();
        const maxWeight = calculateMaxCarryWeight();
        const currency = getCurrency();
        
        // Получаем надетое снаряжение из локального состояния
        const getEquippedItems = () => {
          const equippedItems = [];
          
          // Доспехи
          if (localEquipped.armor) {
            equippedItems.push({
              name: localEquipped.armor,
              type: 'armor',
              set: 'armor',
              weight: getItemWeight(localEquipped.armor),
              cost: getItemCost(localEquipped.armor),
              quantity: getItemQuantity(localEquipped.armor),
              equipped: true,
              slots: 1,
              isVersatile: false,
              versatileMode: false
            });
          }
          
          // Основной набор
          localEquipped.mainSet.forEach(item => {
            const itemType = getItemType(item.name);
            equippedItems.push({
              name: item.name,
              type: itemType,
              set: 'main',
              weight: getItemWeight(item.name),
              cost: getItemCost(item.name),
              quantity: getItemQuantity(item.name),
              equipped: true,
              slots: item.slots,
              isVersatile: item.isVersatile,
              versatileMode: item.versatileMode
            });
          });
          
          // Дополнительный набор
          localEquipped.additionalSet.forEach(item => {
            const itemType = getItemType(item.name);
            equippedItems.push({
              name: item.name,
              type: itemType,
              set: 'additional',
              weight: getItemWeight(item.name),
              cost: getItemCost(item.name),
              quantity: getItemQuantity(item.name),
              equipped: true,
              slots: item.slots,
              isVersatile: item.isVersatile,
              versatileMode: item.versatileMode
            });
          });
          
          return equippedItems;
        };
        
        // Получаем предметы из рюкзака (все остальные предметы)
        const getBackpackItems = () => {
          if (!characterData?.equipment) return [];
          
          // Получаем все экипированные предметы
          const allEquippedItems = [
            ...(localEquipped.armor ? [localEquipped.armor] : []),
            ...localEquipped.mainSet.map(item => item.name),
            ...localEquipped.additionalSet.map(item => item.name)
          ];
          
          return characterData.equipment
            .filter((item: string) => {
              const cleanName = item.replace(/^\d+x\s+/, '');
              return !allEquippedItems.includes(cleanName);
            })
            .map((item: string) => ({
              name: item,
              type: getItemType(item),
              weight: getItemWeight(item),
              cost: getItemCost(item),
              quantity: getItemQuantity(item),
              equipped: false
            }));
        };
        
        const equippedItems = getEquippedItems();
        const backpackItems = getBackpackItems();
        
        // Функция для сохранения изменений в драфт
        const saveEquipmentChanges = () => {
          if (!equipped) return;
          
          // Конвертируем локальное состояние обратно в формат equipped
          const mainWeapons = localEquipped.mainSet
            .filter(item => getItemType(item.name) === 'weapon')
            .map(item => ({
              name: item.name,
              type: 'weapon' as const,
              slots: item.slots,
              isVersatile: item.isVersatile,
              versatileMode: item.versatileMode
            }));
          
          const additionalWeapons = localEquipped.additionalSet
            .filter(item => getItemType(item.name) === 'weapon')
            .map(item => ({
              name: item.name,
              type: 'weapon' as const,
              slots: item.slots,
              isVersatile: item.isVersatile,
              versatileMode: item.versatileMode
            }));
          
          const mainShields = localEquipped.mainSet
            .filter(item => getItemType(item.name) === 'shield')
            .map(item => ({
              name: item.name,
              type: 'shield' as const,
              slots: item.slots,
              isVersatile: item.isVersatile,
              versatileMode: item.versatileMode
            }));
          
          const additionalShields = localEquipped.additionalSet
            .filter(item => getItemType(item.name) === 'shield')
            .map(item => ({
              name: item.name,
              type: 'shield' as const,
              slots: item.slots,
              isVersatile: item.isVersatile,
              versatileMode: item.versatileMode
            }));
          
          // Обновляем equipped
          const updatedEquipped = {
            ...equipped,
            weaponSlot1: mainWeapons,
            weaponSlot2: additionalWeapons,
            shield1: mainShields[0] || null,
            shield2: additionalShields[0] || null,
            armor: localEquipped.armor ? {
              name: localEquipped.armor,
              type: 'armor' as const,
              slots: 1,
              isVersatile: false,
              versatileMode: false
            } : null
          };
          
          // Вызываем функцию обновления equipped из родительского компонента
          if (onUpdateEquipped) {
            onUpdateEquipped(updatedEquipped);
          }
        };
        
        return (
          <div>
            {/* Заголовок с весом и валютой */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm font-semibold text-gray-300">
                ПЕРЕНОСИМЫЙ ВЕС: 
                <span className={`ml-2 ${isOverloaded(currentWeight) ? 'text-red-400' : 'text-gray-200'}`}>
                  {currentWeight}/{maxWeight}
                </span>
              </div>
              <div className="flex items-center gap-4">
                {currency && (
                  <div className="text-sm font-semibold text-yellow-400">
                    {currency}
                  </div>
                )}
                <button
                  className="px-3 py-1 text-xs font-semibold rounded border"
                  style={{
                    borderColor: frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54',
                    backgroundColor: frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54',
                    color: '#000'
                  }}
                  onClick={saveEquipmentChanges}
                >
                  СОХРАНИТЬ
                </button>
              </div>
            </div>
            
            {/* Скроллируемый блок инвентаря */}
            <div className="overflow-y-auto space-y-6">
              {/* Блок ЭКИПИРОВКА */}
              <div>
                <div className="text-sm font-semibold text-gray-300 mb-2">ЭКИПИРОВКА</div>
                
                {/* Заголовки таблицы */}
                <div className="grid gap-2 text-sm font-semibold uppercase text-gray-400 mb-2 pb-1 items-center" 
                     style={{ 
                       gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr',
                       borderBottom: `1px solid ${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}20` 
                     }}>
                  <div className="text-center">✓</div>
                  <div className="flex items-center justify-start">НАЗВАНИЕ</div>
                  <div className="text-center">ВЕС</div>
                  <div className="text-center">КЛВ</div>
                  <div className="text-center">ЦЕНА</div>
                </div>
                
                {/* Строки таблицы */}
                <div className="space-y-1">
                  {/* Доспехи (только доспехи, не щиты) */}
                  <div className="text-xs text-gray-400 mt-2 mb-1 font-semibold uppercase flex items-center gap-2">
                    ДОСПЕХ
                    <div className="flex gap-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: localEquipped.armor
                            ? (frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54')
                            : '#4B5563'
                        }}
                      />
                    </div>
                  </div>
                  {equippedItems.filter(item => item.set === 'armor' && item.type === 'armor').length > 0 ? (
                    equippedItems.filter(item => item.set === 'armor' && item.type === 'armor').map((item, index) => (
                      <div key={`armor-${index}`}>
                        <div className="grid gap-2 text-sm py-1 items-center"
                             style={{ gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr' }}>
                          <div className="flex justify-center items-center">
                            <div 
                              className="w-4 h-4 rounded-none border-2 cursor-pointer hover:opacity-80"
                              style={{
                                borderColor: frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54',
                                backgroundColor: item.equipped ? (frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54') : '#171717'
                              }}
                              onClick={() => toggleItemEquipped(item.name)}
                            />
                          </div>
                          <div className="text-gray-200 truncate">{item.name}</div>
                          <div className="text-gray-400 text-center">{item.weight} фнт.</div>
                          <div className="text-gray-400 text-center">{item.quantity}</div>
                          <div className="text-gray-400 text-center">{item.cost}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 text-sm py-2">
                      Нет надетого доспеха
                    </div>
                  )}
                  
                  {/* Основной набор (I) */}
                  <div className="text-xs text-gray-400 mt-2 mb-1 font-semibold uppercase flex items-center gap-2">
                    ОСНОВНОЙ НАБОР
                        <div className="flex gap-1">
                          {Array.from({ length: 2 }, (_, i) => (
                            <div
                              key={i}
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: i < getUsedSlotsCount(localEquipped.mainSet)
                                  ? (frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54')
                                  : '#4B5563'
                              }}
                            />
                          ))}
                        </div>
                  </div>
                  {equippedItems.filter(item => item.set === 'main').length > 0 ? (
                    equippedItems.filter(item => item.set === 'main').map((item, index) => (
                      <div key={`main-${index}`}>
                        <div className="grid gap-2 text-sm py-1 items-center"
                             style={{ gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr' }}>
                          <div className="flex justify-center items-center">
                            <div 
                              className="w-4 h-4 rounded-none border-2 cursor-pointer hover:opacity-80"
                              style={{
                                borderColor: frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54',
                                backgroundColor: item.equipped ? (frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54') : '#171717'
                              }}
                              onClick={() => toggleItemEquipped(item.name)}
                            />
                          </div>
                          <div className="text-gray-200 truncate flex items-center gap-2">
                            {item.name}
                            {item.isVersatile && (
                              <button
                                className="text-xs px-2 py-1 rounded border"
                                style={{
                                  borderColor: frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54',
                                  backgroundColor: item.versatileMode ? (frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54') : 'transparent',
                                  color: item.versatileMode ? '#000' : (frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54')
                                }}
                                onClick={() => toggleVersatileMode(item.name)}
                                title={item.versatileMode ? 'Двуручный режим (2 слота)' : 'Одноручный режим (1 слот)'}
                              >
                                {item.versatileMode ? '2H' : '1H'}
                              </button>
                            )}
                          </div>
                          <div className="text-gray-400 text-center">{item.weight} фнт.</div>
                          <div className="text-gray-400 text-center">{item.quantity}</div>
                          <div className="text-gray-400 text-center">{item.cost}</div>
                        </div>
                        {index < equippedItems.filter(item => item.set === 'main').length - 1 && (
                          <div 
                            className="my-1 h-px"
                            style={{
                              borderTop: `1px dotted ${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}40`
                            }}
                          />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 text-sm py-2">
                      Основной набор пуст
                    </div>
                  )}
                  
                  {/* Дополнительный набор (II) */}
                  <div className="text-xs text-gray-400 mt-2 mb-1 font-semibold uppercase flex items-center gap-2">
                    ДОПОЛНИТЕЛЬНЫЙ НАБОР
                        <div className="flex gap-1">
                          {Array.from({ length: 2 }, (_, i) => (
                            <div
                              key={i}
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: i < getUsedSlotsCount(localEquipped.additionalSet)
                                  ? (frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54')
                                  : '#4B5563'
                              }}
                            />
                          ))}
                        </div>
                  </div>
                  {equippedItems.filter(item => item.set === 'additional').length > 0 ? (
                    equippedItems.filter(item => item.set === 'additional').map((item, index) => (
                      <div key={`additional-${index}`}>
                        <div className="grid gap-2 text-sm py-1 items-center"
                             style={{ gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr' }}>
                          <div className="flex justify-center items-center">
                            <div 
                              className="w-4 h-4 rounded-none border-2 cursor-pointer hover:opacity-80"
                              style={{
                                borderColor: frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54',
                                backgroundColor: item.equipped ? (frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54') : '#171717'
                              }}
                              onClick={() => toggleItemEquipped(item.name)}
                            />
                          </div>
                          <div className="text-gray-200 truncate flex items-center gap-2">
                            {item.name}
                            {item.isVersatile && (
                              <button
                                className="text-xs px-2 py-1 rounded border"
                                style={{
                                  borderColor: frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54',
                                  backgroundColor: item.versatileMode ? (frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54') : 'transparent',
                                  color: item.versatileMode ? '#000' : (frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54')
                                }}
                                onClick={() => toggleVersatileMode(item.name)}
                                title={item.versatileMode ? 'Двуручный режим (2 слота)' : 'Одноручный режим (1 слот)'}
                              >
                                {item.versatileMode ? '2H' : '1H'}
                              </button>
                            )}
                          </div>
                          <div className="text-gray-400 text-center">{item.weight} фнт.</div>
                          <div className="text-gray-400 text-center">{item.quantity}</div>
                          <div className="text-gray-400 text-center">{item.cost}</div>
                        </div>
                        {index < equippedItems.filter(item => item.set === 'additional').length - 1 && (
                          <div 
                            className="my-1 h-px"
                            style={{
                              borderTop: `1px dotted ${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}40`
                            }}
                          />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 text-sm py-2">
                      Дополнительный набор пуст
                    </div>
                  )}
                  
                  {/* Отладочная информация */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="text-xs text-gray-600 mt-2 p-2 bg-gray-800 rounded">
                      Debug: equippedItems.length = {equippedItems.length}<br/>
                      Armor: {equippedItems.filter(item => item.set === 'armor').length}<br/>
                      Main: {equippedItems.filter(item => item.set === 'main').length}<br/>
                      Additional: {equippedItems.filter(item => item.set === 'additional').length}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Таблица РЮКЗАК */}
              <div>
                <div className="text-sm font-semibold text-gray-300 mb-2">РЮКЗАК</div>
                
                {/* Заголовки таблицы */}
                <div className="grid gap-2 text-sm font-semibold uppercase text-gray-400 mb-2 pb-1 items-center" 
                     style={{ 
                       gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr',
                       borderBottom: `1px solid ${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}20` 
                     }}>
                  <div className="text-center">✓</div>
                  <div className="flex items-center justify-start">НАЗВАНИЕ</div>
                  <div className="text-center">ВЕС</div>
                  <div className="text-center">КЛВ</div>
                  <div className="text-center">ЦЕНА</div>
                </div>
                
                {/* Строки таблицы */}
                <div className="space-y-1">
                  {backpackItems.length > 0 ? (
                    backpackItems.map((item, index) => (
                      <div key={index}>
                        <div className="grid gap-2 text-sm py-1 items-center"
                             style={{ gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr' }}>
                          <div className="flex justify-center items-center">
                            {(item.type === 'weapon' || item.type === 'armor' || item.type === 'shield') ? (
                              <div 
                                className={`w-4 h-4 rounded-none border-2 ${
                                  canEquipItem(item.name) 
                                    ? 'cursor-pointer hover:opacity-80' 
                                    : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{
                                  borderColor: frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54',
                                  backgroundColor: item.equipped ? (frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54') : '#171717'
                                }}
                                onClick={() => canEquipItem(item.name) && toggleItemEquipped(item.name)}
                                title={!canEquipItem(item.name) ? 'Недостаточно слотов для экипировки' : undefined}
                              />
                            ) : (
                              <div className="w-4 h-4" />
                            )}
                          </div>
                          <div className="text-gray-200 truncate">
                            {item.equipped && (item.type === 'weapon' || item.type === 'shield') ? (
                              <span className="text-gray-400 text-xs mr-1">[{item.slot}]</span>
                            ) : null}
                            {item.name}
                          </div>
                          <div className="text-gray-400 text-center">{item.weight} фнт.</div>
                          <div className="text-gray-400 text-center">{item.quantity}</div>
                          <div className="text-gray-400 text-center">{item.cost}</div>
                        </div>
                        {index < backpackItems.length - 1 && (
                          <div 
                            className="my-1 h-px"
                            style={{
                              borderTop: `1px dotted ${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}40`
                            }}
                          />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 text-sm py-4">
                      Рюкзак пуст
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case "features":
        return (
          <div className="text-center text-gray-500 text-sm py-4">
            Особенности будут здесь
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="relative text-gray-300 w-[561px] h-[669px] flex-shrink-0"
      style={{
        backgroundImage: "url('/frames/actionFrame.svg')",
        backgroundSize: "100% auto",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center top",
      }}
    >
      {/* Контент внутри рамки */}
      <div className="relative z-10 px-4 pt-6 pb-4 h-full flex flex-col">
        {/* Вкладки в левом верхнем углу */}
        <div className="flex gap-0 mb-4 flex-shrink-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const frameColorHex = frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54';
            
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-2 text-xs font-semibold uppercase transition-all duration-200 relative`}
                style={{
                  color: isActive ? frameColorHex : '#9CA3AF',
                  borderBottom: isActive ? `2px solid ${frameColorHex}` : 'none'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        
        {/* Контент вкладки с скроллом */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}