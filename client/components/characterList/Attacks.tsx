import React, { useState, useEffect } from "react";
import { useFrameColor } from "@/contexts/FrameColorContext";
import DynamicFrame from "@/components/ui/DynamicFrame";
import { Weapons } from "@/data/items/weapons";
import { getClassByKey } from "@/data/classes";
import { Cantrips } from "@/data/spells/cantrips";
import { Gears, Ammunitions } from "@/data/items/gear";
import { Armors } from "@/data/items/armors";
import { Tools } from "@/data/items/tools";
import { EQUIPMENT_PACKS } from "@/data/items/equipment-packs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Settings, Coins, Plus, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
  onUpdateEquipment?: (newEquipment: any[]) => void;
  onSaveAll?: () => void;
  characterData?: any;
};

type TabType = "actions" | "spells" | "inventory" | "features";
type ActionType = "attack" | "action" | "bonus" | "reaction";

// Импортируем FRAME_COLORS из DynamicFrame
const FRAME_COLORS = {
  gold: '#B59E54',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  copper: '#B87333',
  steel: '#71797E',
  red: '#DC2626',
  blue: '#2563EB',
  green: '#16A34A',
  purple: '#9333EA',
  orange: '#EA580C',
  pink: '#EC4899',
  cyan: '#0891B2',
  lime: '#65A30D',
  indigo: '#4F46E5',
  teal: '#0D9488',
  emerald: '#059669',
  rose: '#E11D48',
  amber: '#D97706',
  violet: '#7C3AED',
  fuchsia: '#C026D3',
  sky: '#0284C7',
  stone: '#78716C',
  neutral: '#6B7280',
  zinc: '#71717A',
  slate: '#64748B',
  gray: '#6B7280',
  cool: '#6B7280',
  warm: '#78716C',
  true: '#FFFFFF',
};

// Вспомогательная функция для получения цвета рамки
const getFrameColor = (color: string) => {
  return FRAME_COLORS[color as keyof typeof FRAME_COLORS] || FRAME_COLORS.gold;
};

// Функция для генерации динамического SVG actionFrame
const getActionFrameSvg = (color: string) => {
  const hexColor = getFrameColor(color);
  
  return `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" id="Слой_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 289.93 307.31" preserveAspectRatio="none" style="enable-background:new 0 0 289.93 307.31;" xml:space="preserve">
<style type="text/css">
	.st0{clip-path:url(#SVGID_00000074437919751204614870000007753514779035950496_);fill:${hexColor};}
</style>
<g>
	<defs>
		<rect id="SVGID_1_" width="289.93" height="307.31"/>
	</defs>
	<clipPath id="SVGID_00000034811484770670226070000009542851693816943004_">
		<use xlink:href="#SVGID_1_"  style="overflow:visible;"/>
	</clipPath>
	<path style="clip-path:url(#SVGID_00000034811484770670226070000009542851693816943004_);fill:${hexColor};" d="M288.49,10.1
		c-0.45-1.41-1.05-2.74-1.81-4V6.01h-0.05c-1.25-2.06-2.97-3.58-5.17-4.56h2.75l4.28,4.47V10.1z M288.49,294.79
		c-0.36,1.83-0.96,3.56-1.81,5.22V7.31c0.2,0.31,0.37,0.64,0.51,0.98c0.58,1.36,1.03,2.75,1.35,4.19L288.49,294.79z M288.49,301.35
		l-4.28,4.47h-2.75c2.2-0.98,3.92-2.5,5.17-4.56h0.05v-0.09c0.78-1.26,1.38-2.59,1.81-4V301.35z M10.38,305.82
		c-1.32-0.32-2.53-0.87-3.63-1.66c-1.1-0.79-2.02-1.76-2.75-2.9V6.05c0.75-1.14,1.68-2.1,2.79-2.9c1.11-0.79,2.32-1.36,3.64-1.71
		H279.5c1.32,0.32,2.53,0.87,3.63,1.66c1.1,0.79,2.02,1.76,2.75,2.9v295.21c-0.75,1.14-1.68,2.1-2.79,2.9
		c-1.11,0.79-2.32,1.36-3.64,1.71H10.38z M5.68,305.82l-4.28-4.47v-4.14c0.45,1.41,1.06,2.74,1.81,4v0.09h0.05
		c1.25,2.06,2.97,3.58,5.17,4.56H5.68V305.82z M1.4,12.53c0.36-1.82,0.97-3.56,1.81-5.22V300c-0.2-0.31-0.37-0.64-0.51-0.98
		c-0.58-1.36-1.03-2.75-1.35-4.19L1.4,12.53z M1.4,5.96l4.28-4.47h2.75c-2.17,0.99-3.89,2.5-5.17,4.52H3.21V6.1
		c-0.78,1.26-1.38,2.59-1.81,4V5.96z M284.76,0H5.12L0,5.35v296.6l5.12,5.35h279.69l5.12-5.35V5.35L284.76,0z"/>
</g>
</svg>`;
};

export default function Attacks({ attacks, equipped, stats, proficiencyBonus, classKey, level, onRoll, onSwitchWeaponSlot, onUpdateEquipped, onUpdateEquipment, onSaveAll, characterData }: Props) {
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

  // Состояние для сайдбара управления инвентарем
  const [isInventorySidebarOpen, setIsInventorySidebarOpen] = useState(false);
  const [openSections, setOpenSections] = useState({
    addItems: false,
    myInventory: false
  });

  // Локальное состояние для equipment (рюкзак)
  const [localEquipment, setLocalEquipment] = useState<any[]>([]);

  // Состояние для поиска и фильтров
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState<{[key: string]: number}>({});
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());

  // Функция для переключения секций
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Функция для получения предметов из рюкзака (не надетых)
  const getBackpackItems = () => {
    if (!localEquipment || localEquipment.length === 0) return [];
    
    // Получаем все надетые предметы
    const allEquippedItems = [
      ...(localEquipped.armor ? [localEquipped.armor] : []),
      ...localEquipped.mainSet.map(item => item.name),
      ...localEquipped.additionalSet.map(item => item.name)
    ];
    
    // Фильтруем предметы, которые не надеты, и преобразуем в объекты
    const result = localEquipment
      .filter((item: any) => {
        // Если item - это объект, используем item.name
        const itemName = typeof item === 'string' ? item : (item.name || String(item));
        const cleanName = getCleanItemName(itemName);
        const isNotEquipped = !allEquippedItems.includes(cleanName);
        return isNotEquipped;
      })
      .map((item: any) => {
        const itemName = typeof item === 'string' ? item : (item.name || String(item));
        return {
          name: itemName,
          type: typeof item === 'object' && item.type ? item.type : getItemType(itemName),
          category: typeof item === 'object' && item.category ? item.category : getItemCategory(itemName),
          weight: typeof item === 'object' && typeof item.weight === 'number' ? item.weight : getItemWeight(itemName),
          cost: typeof item === 'object' && item.cost ? item.cost : getItemCost(itemName),
          quantity: typeof item === 'object' && typeof item.quantity === 'number' ? item.quantity : getItemQuantity(itemName),
          equipped: false
        };
      });
    
    return result;
  };

  // Функция для добавления предмета в рюкзак
  const handleAddItem = async (item: any) => {
    const itemKey = `${item.type}-${item.key}`;
    
    // Добавляем предмет в состояние загрузки
    setLoadingItems(prev => new Set(prev).add(itemKey));
    
    try {
      // Показываем toast с загрузкой
      const loadingToast = toast({
        title: "Добавление предмета...",
        description: `Добавляем ${item.name} в рюкзак`,
      });

      // Имитируем задержку (в реальном приложении здесь будет API вызов)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Добавляем предмет в localEquipment
      const newEquipment = [...localEquipment];
      const existingItemIndex = newEquipment.findIndex(eq => {
        const eqName = typeof eq === 'string' ? eq : (eq.name || String(eq));
        return eqName === item.name;
      });
      
      if (existingItemIndex >= 0) {
        // Если предмет уже есть, увеличиваем количество
        const existingItem = newEquipment[existingItemIndex];
        if (typeof existingItem === 'object') {
          newEquipment[existingItemIndex] = {
            ...existingItem,
            quantity: (existingItem.quantity || 1) + 1
          };
        } else {
          // Если это строка, конвертируем в объект
          const match = existingItem.match(/^(\d+)x\s+(.+)$/);
          if (match) {
            const currentQuantity = parseInt(match[1]);
            newEquipment[existingItemIndex] = {
              name: match[2],
              type: item.type,
              category: item.category,
              weight: item.weight,
              cost: item.cost,
              quantity: currentQuantity + 1
            };
          } else {
            newEquipment[existingItemIndex] = {
              name: item.name,
              type: item.type,
              category: item.category,
              weight: item.weight,
              cost: item.cost,
              quantity: 2
            };
          }
        }
      } else {
        // Если предмета нет, добавляем новый объект
        newEquipment.push({
          name: item.name,
          type: item.type,
          category: item.category,
          weight: item.weight,
          cost: item.cost,
          quantity: 1
        });
      }

      // Обновляем локальное состояние
      setLocalEquipment(newEquipment);

      // Обновляем только equipment (рюкзак), не затрагивая экипировку
      if (onUpdateEquipment) {
        onUpdateEquipment(newEquipment);
      }

      // Обновляем toast с успехом
      loadingToast.update({
        id: loadingToast.id,
        title: "Предмет добавлен!",
        description: `${item.name} успешно добавлен в рюкзак`,
      });
      
    } catch (error) {
      // Показываем toast с ошибкой
      toast({
        title: "Ошибка",
        description: "Не удалось добавить предмет в рюкзак",
        variant: "destructive",
      });
    } finally {
      // Убираем предмет из состояния загрузки
      setLoadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  // Получение всех доступных предметов
  const getAllItems = () => {
    const items: Array<{type: string, key: string, name: string, cost: string, weight: number, category: string}> = [];
    
    // Добавляем оружие
    Weapons.forEach(weapon => {
      items.push({
        type: 'weapon',
        key: weapon.key,
        name: weapon.name,
        cost: translateCurrency(weapon.cost),
        weight: weapon.weight,
        category: 'Оружие'
      });
    });
    
    // Добавляем доспехи
    Armors.forEach(armor => {
      items.push({
        type: 'armor',
        key: armor.key,
        name: armor.name,
        cost: translateCurrency(armor.cost),
        weight: armor.weight,
        category: armor.category === 'shield' ? 'Щиты' : 'Доспехи'
      });
    });
    
    // Добавляем снаряжение
    Gears.forEach(gear => {
      items.push({
        type: 'gear',
        key: gear.key,
        name: gear.name,
        cost: translateCurrency(gear.cost),
        weight: gear.weight,
        category: 'Снаряжение'
      });
    });
    
    // Добавляем боеприпасы
    Ammunitions.forEach(ammo => {
      items.push({
        type: 'ammunition',
        key: ammo.key,
        name: ammo.name,
        cost: translateCurrency(ammo.cost),
        weight: ammo.weight,
        category: 'Боеприпасы'
      });
    });
    
    // Добавляем инструменты
    Tools.forEach(tool => {
      items.push({
        type: 'tool',
        key: tool.key,
        name: tool.name,
        cost: translateCurrency(tool.cost),
        weight: tool.weight,
        category: 'Инструменты'
      });
    });
    
    // Добавляем наборы снаряжения
    EQUIPMENT_PACKS.forEach(pack => {
      items.push({
        type: 'pack',
        key: pack.key,
        name: pack.name,
        cost: translateCurrency(pack.cost),
        weight: pack.weight,
        category: 'Наборы снаряжения'
      });
    });
    
    return items;
  };

  // Получение отфильтрованных предметов
  const getFilteredItems = () => {
    const allItems = getAllItems();
    return allItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchFilter.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  };

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

  // Инициализируем localEquipment из characterData.equipment только при первой загрузке
  useEffect(() => {
    if (characterData?.equipment && localEquipment.length === 0) {
      setLocalEquipment(characterData.equipment);
    }
  }, [characterData?.equipment, localEquipment.length]);

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
    let baseDamage = weaponData?.damage || "1d4";
    const weaponType = weaponData?.type || 'melee';
    
    // Проверяем, является ли оружие универсальным и используется ли в двуручном режиме
    const isVersatile = weaponData?.properties?.includes('versatile') || false;
    const isTwoHanded = weapon.slots === 2; // Если занимает 2 слота, значит двуручный режим
    
    if (isVersatile && isTwoHanded) {
      // Увеличиваем урон на одну ступень для двуручного режима
      baseDamage = baseDamage.replace(/(\d+)d(\d+)/, (match, num, size) => {
        const diceSize = parseInt(size);
        let newSize = diceSize;
        
        // Увеличиваем размер кубика на 2 (1d4→1d6, 1d6→1d8, 1d8→1d10, 1d10→1d12)
        if (diceSize === 4) newSize = 6;
        else if (diceSize === 6) newSize = 8;
        else if (diceSize === 8) newSize = 10;
        else if (diceSize === 10) newSize = 12;
        else if (diceSize === 12) newSize = 12; // Максимум d12
        
        return `${num}d${newSize}`;
      });
    }
    
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
  const getItemWeight = (itemName: any) => {
    if (typeof itemName !== 'string') {
      return 0;
    }
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

  // Функция для перевода валютных единиц на русский
  const translateCurrency = (cost: string) => {
    if (!cost || cost === 'Неизвестно') return 'Неизвестно';
    
    return cost
      .replace(/\b(\d+)\s*sp\b/gi, '$1 СМ') // silver pieces
      .replace(/\b(\d+)\s*gp\b/gi, '$1 ЗМ') // gold pieces
      .replace(/\b(\d+)\s*pp\b/gi, '$1 ПП') // platinum pieces
      .replace(/\b(\d+)\s*ep\b/gi, '$1 ЭМ') // electrum pieces
      .replace(/\b(\d+)\s*cp\b/gi, '$1 ММ') // copper pieces
      .replace(/\b(\d+)\s*copper\b/gi, '$1 ММ')
      .replace(/\b(\d+)\s*silver\b/gi, '$1 СМ')
      .replace(/\b(\d+)\s*gold\b/gi, '$1 ЗМ')
      .replace(/\b(\d+)\s*platinum\b/gi, '$1 ПП')
      .replace(/\b(\d+)\s*electrum\b/gi, '$1 ЭМ');
  };

  // Функция для получения стоимости предмета
  const getItemCost = (itemName: any) => {
    if (typeof itemName !== 'string') {
      return 'Неизвестно';
    }
    const cleanName = itemName.replace(/^\d+x\s+/, '');
    
    // Ищем в разных массивах
    let item = Gears.find(g => g.name === cleanName);
    if (item) {
      return translateCurrency(item.cost || 'Неизвестно');
    }
    
    item = Ammunitions.find(a => a.name === cleanName);
    if (item) {
      return translateCurrency(item.cost || 'Неизвестно');
    }
    
    const weapon = Weapons.find(w => w.name === cleanName);
    if (weapon) {
      return translateCurrency(weapon.cost || 'Неизвестно');
    }
    
    const armor = Armors.find(a => a.name === cleanName);
    if (armor) {
      return translateCurrency(armor.cost || 'Неизвестно');
    }
    
    const pack = EQUIPMENT_PACKS.find(p => p.name === cleanName);
    if (pack) {
      return translateCurrency(pack.cost || 'Неизвестно');
    }
    
    const tool = Tools.find(t => t.name === cleanName);
    if (tool) {
      return translateCurrency(tool.cost || 'Неизвестно');
    }
    
    return 'Неизвестно';
  };

  // Функция для получения количества предмета
  const getItemQuantity = (itemName: any) => {
    if (typeof itemName !== 'string') {
      return 1;
    }
    const match = itemName.match(/^(\d+)x\s+(.+)$/);
    if (match) {
      return parseInt(match[1]);
    }
    return 1;
  };

  // Функция для очистки названия предмета от количества
  const getCleanItemName = (itemName: any) => {
    if (typeof itemName !== 'string') {
      return String(itemName);
    }
    return itemName.replace(/^\d+x\s+/, '');
  };

  // Функция для определения типа предмета
  const getItemType = (itemName: any) => {
    if (typeof itemName !== 'string') {
      return 'other';
    }
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

  // Функция для получения категории предмета
  const getItemCategory = (itemName: any) => {
    if (typeof itemName !== 'string') {
      return 'Неизвестно';
    }
    const cleanName = itemName.replace(/^\d+x\s+/, '');
    
    // Проверяем оружие
    const weapon = Weapons.find(w => w.name === cleanName);
    if (weapon) {
      if (weapon.type === 'melee') {
        if (weapon.properties?.includes('finesse')) return 'Фехтовальное оружие';
        if (weapon.properties?.includes('versatile')) return 'Универсальное оружие';
        if (weapon.properties?.includes('two-handed')) return 'Двуручное оружие';
        return 'Оружие ближнего боя';
      } else if (weapon.type === 'ranged') {
        if (weapon.properties?.includes('thrown')) return 'Метательное оружие';
        return 'Оружие дальнего боя';
      }
      return 'Оружие';
    }
    
    // Проверяем доспехи и щиты
    const armor = Armors.find(a => a.name === cleanName);
    if (armor) {
      if (armor.category === 'shield') return 'Щит';
      if (armor.category === 'light') return 'Легкий доспех';
      if (armor.category === 'medium') return 'Средний доспех';
      if (armor.category === 'heavy') return 'Тяжелый доспех';
      return 'Доспех';
    }
    
    // Проверяем инструменты
    const tool = Tools.find(t => t.name === cleanName);
    if (tool) return 'Инструмент';
    
    // Проверяем снаряжение
    const gear = Gears.find(g => g.name === cleanName);
    if (gear) return 'Снаряжение';
    
    // Проверяем боеприпасы
    const ammo = Ammunitions.find(a => a.name === cleanName);
    if (ammo) return 'Боеприпасы';
    
    // Проверяем наборы снаряжения
    const pack = EQUIPMENT_PACKS.find(p => p.name === cleanName);
    if (pack) return 'Набор снаряжения';
    
    return 'Прочее';
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

  // Функция для проверки, можно ли переключить универсальный режим
  const canToggleVersatileMode = (itemName: string) => {
    const cleanName = itemName.replace(/^\d+x\s+/, '');
    
    // Ищем оружие в обоих наборах
    const mainItem = localEquipped.mainSet.find(item => item.name === cleanName);
    const additionalItem = localEquipped.additionalSet.find(item => item.name === cleanName);
    const item = mainItem || additionalItem;
    
    if (!item || !item.isVersatile) {
      return false;
    }
    
    // Если переключаемся с двуручного на одноручный - всегда можно
    if (item.versatileMode) {
      return true;
    }
    
    // Если переключаемся с одноручного на двуручный - проверяем доступность слотов
    const currentSet = mainItem ? localEquipped.mainSet : localEquipped.additionalSet;
    const otherSet = mainItem ? localEquipped.additionalSet : localEquipped.mainSet;
    
    const currentUsedSlots = getUsedSlots(currentSet) - item.slots + 2; // 2 слота для двуручного режима
    const otherUsedSlots = getUsedSlots(otherSet);
    
    // Проверяем, есть ли место хотя бы в одном наборе
    return (currentUsedSlots <= 2) || (otherUsedSlots + 2 <= 2);
  };

  // Функция для переключения универсального режима оружия
  const toggleVersatileMode = (itemName: string) => {
    if (!canToggleVersatileMode(itemName)) {
      return; // Блокируем переключение, если нет места
    }
    
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
      return 0;
    }
    
    let totalWeight = 0;
    characterData.equipment.forEach((item: string) => {
      const weight = getItemWeight(item);
      totalWeight += weight;
    });
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
    if (!characterData?.currency) return null;
    
    const { platinum, gold, electrum, silver, copper } = characterData.currency;
    const totalValue = platinum * 1000 + gold * 100 + electrum * 50 + silver * 10 + copper;
    
    if (totalValue === 0) return null;
    
    const parts = [];
    if (platinum > 0) parts.push(`${platinum} ПП`);
    if (gold > 0) parts.push(`${gold} ЗМ`);
    if (electrum > 0) parts.push(`${electrum} ЭМ`);
    if (silver > 0) parts.push(`${silver} СМ`);
    if (copper > 0) parts.push(`${copper} ММ`);
    
    const result = parts.join(', ');
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
                const frameColorHex = getFrameColor(frameColor);
                
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
                    borderBottom: `1px solid ${getFrameColor(frameColor)}60`
                  }}
                >
                  <div className="flex items-center">
                    <span style={{ color: getFrameColor(frameColor) }}>
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
                            ? getFrameColor(frameColor)
                            : 'transparent',
                          border: `1px solid ${getFrameColor(frameColor)}40`
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
                            ? getFrameColor(frameColor)
                            : 'transparent',
                          border: `1px solid ${getFrameColor(frameColor)}40`
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
                         borderBottom: `1px solid ${getFrameColor(frameColor)}20` 
                       }}>
                    <div className="flex items-center justify-start">АТАКА</div>
                    <div className="flex items-center justify-center">ДАЛЬНОСТЬ</div>
                    <div className="flex items-center justify-center">ПОПАДАНИЕ</div>
                    <div className="flex items-center justify-center">УРОН</div>
          </div>
                  
                  {/* Строки с оружием и заклинаниями */}
                  {(() => {
                    const allActions = [];
                    
                    // Добавляем только активное оружие
                    allWeapons
                      .filter(weapon => weapon.isActive)
                      .forEach((weapon, i) => {
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
                                  borderColor: `${getFrameColor(frameColor)}40`,
                                  backgroundColor: 'transparent'
                                }}
                                onClick={() => handleAttack(weapon, weaponData?.type === 'ranged' ? 'dex' : 'str', attackBonus)}
                                onMouseEnter={(e) => {
                                  const lightColor = criticalHits[`${weapon.name}-${weapon.slot}`] 
                                    ? '#F59E0B' 
                                    : getFrameColor(frameColor);
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
                                      : `${getFrameColor(frameColor)}40`,
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
                                      : getFrameColor(frameColor);
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
                                  borderTop: `1px dotted ${getFrameColor(frameColor)}40`
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
                                  borderColor: `${getFrameColor(frameColor)}40`,
                                  backgroundColor: 'transparent'
                                }}
                                onClick={() => handleAttack(spellName, spellAbility, spellAttackBonus, true)}
                                onMouseEnter={(e) => {
                                  const lightColor = criticalHits[`spell-${spellName}`] 
                                    ? '#F59E0B' 
                                    : getFrameColor(frameColor);
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
                                      : `${getFrameColor(frameColor)}40`,
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
                                      : getFrameColor(frameColor);
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
                                  borderTop: `1px dotted ${getFrameColor(frameColor)}40`
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
                      borderBottom: `1px solid ${getFrameColor(frameColor)}60`
                    }}
                  >
                    <span style={{ color: getFrameColor(frameColor) }}>
                      БОНУСНЫЕ ДЕЙСТВИЯ
                    </span>
                  </div>
                  
                  {/* Заголовки таблицы */}
                  <div className="grid gap-2 text-sm font-semibold uppercase text-gray-400 mb-2 pb-1 items-center mt-4" 
                       style={{ 
                         gridTemplateColumns: '2fr 1fr 1fr 1fr',
                         borderBottom: `1px solid ${getFrameColor(frameColor)}20` 
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
                                  borderColor: `${getFrameColor(frameColor)}40`,
                                  backgroundColor: 'transparent'
                                }}
                                onClick={() => handleAttack(spellName, spellAbility, spellAttackBonus, true)}
                                onMouseEnter={(e) => {
                                  const lightColor = criticalHits[`spell-${spellName}`] 
                                    ? '#F59E0B' 
                                    : getFrameColor(frameColor);
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
                                      : `${getFrameColor(frameColor)}40`,
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
                                      : getFrameColor(frameColor);
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
                                  borderTop: `1px dotted ${getFrameColor(frameColor)}40`
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
                  borderBottom: `1px solid ${getFrameColor(frameColor)}20`
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
                  borderBottom: `1px solid ${getFrameColor(frameColor)}20`
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
            .filter((item: any) => {
              // Если item - это объект, используем item.name
              const itemName = typeof item === 'string' ? item : (item.name || String(item));
              const cleanName = getCleanItemName(itemName);
              return !allEquippedItems.includes(cleanName);
            })
            .map((item: any) => {
              const itemName = typeof item === 'string' ? item : (item.name || String(item));
              return {
                name: itemName,
                type: typeof item === 'object' && item.type ? item.type : getItemType(itemName),
                weight: typeof item === 'object' && typeof item.weight === 'number' ? item.weight : getItemWeight(itemName),
                cost: typeof item === 'object' && item.cost ? item.cost : getItemCost(itemName),
                quantity: typeof item === 'object' && typeof item.quantity === 'number' ? item.quantity : getItemQuantity(itemName),
                equipped: false
              };
            });
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
                    borderColor: getFrameColor(frameColor),
                    backgroundColor: getFrameColor(frameColor),
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
                       gridTemplateColumns: 'auto 2fr 1fr 1fr 1fr',
                       borderBottom: `1px solid ${getFrameColor(frameColor)}20` 
                     }}>
                  <div className="flex items-center justify-start">✓</div>
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
                            ? getFrameColor(frameColor)
                            : '#4B5563'
                        }}
                      />
                    </div>
                  </div>
                  {equippedItems.filter(item => item.set === 'armor' && item.type === 'armor').length > 0 ? (
                    equippedItems.filter(item => item.set === 'armor' && item.type === 'armor').map((item, index) => (
                      <div key={`armor-${index}`}>
                        <div className="grid gap-2 text-sm py-1 items-center"
                             style={{ gridTemplateColumns: 'auto 2fr 1fr 1fr 1fr' }}>
                          <div className="flex justify-start items-center">
                            <div 
                              className="w-4 h-4 rounded-none border-2 cursor-pointer hover:opacity-80 p-1"
                              style={{
                                borderColor: getFrameColor(frameColor),
                                backgroundColor: item.equipped ? getFrameColor(frameColor) : '#171717'
                              }}
                              onClick={() => toggleItemEquipped(item.name)}
                            />
                          </div>
                           <div className="text-gray-200 break-words">
                             <div>{getCleanItemName(item.name)}</div>
                             <div className="text-xs text-gray-500 mt-1">{getItemCategory(item.name)}</div>
                           </div>
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
                  
                  {/* Разделитель между доспехом и основным набором */}
                  <div 
                    className="text-xs font-semibold uppercase mb-2 text-gray-400"
                    style={{
                      borderBottom: `1px solid ${getFrameColor(frameColor)}20`
                    }}
                  />
                  
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
                                  ? getFrameColor(frameColor)
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
                             style={{ gridTemplateColumns: 'auto 2fr 1fr 1fr 1fr' }}>
                          <div className="flex justify-start items-center">
                            <div 
                              className="w-4 h-4 rounded-none border-2 cursor-pointer hover:opacity-80 p-1"
                              style={{
                                borderColor: getFrameColor(frameColor),
                                backgroundColor: item.equipped ? getFrameColor(frameColor) : '#171717'
                              }}
                              onClick={() => toggleItemEquipped(item.name)}
                            />
                          </div>
                          <div className="text-gray-200 break-words flex items-center gap-2">
                            <div className="flex-1">
                              <div>{getCleanItemName(item.name)}</div>
                              <div className="text-xs text-gray-500 mt-1">{getItemCategory(item.name)}</div>
                            </div>
                            {item.isVersatile && (
                              <div className="flex items-center gap-1">
                                <div
                                  className={`w-4 h-4 rounded-full ${canToggleVersatileMode(item.name) ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed opacity-50'}`}
                                  style={{
                                    backgroundColor: item.versatileMode ? getFrameColor(frameColor) : 'transparent',
                                    border: `2px solid ${getFrameColor(frameColor)}`
                                  }}
                                  onClick={() => canToggleVersatileMode(item.name) && toggleVersatileMode(item.name)}
                                  title={canToggleVersatileMode(item.name) 
                                    ? (item.versatileMode ? 'Двуручный режим (2 слота) - клик для переключения' : 'Одноручный режим (1 слот) - клик для переключения')
                                    : 'Недостаточно свободных слотов для переключения в двуручный режим'
                                  }
                                />
                                <span className="text-xs text-gray-400">
                                  {item.versatileMode ? '2H' : '1H'}
                                </span>
                              </div>
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
                  
                   {/* Разделитель между наборами */}
                   <div 
                     className="text-xs font-semibold uppercase mb-2 text-gray-400"
                     style={{
                       borderBottom: `1px solid ${getFrameColor(frameColor)}20`
                     }}
                   />
                  
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
                                  ? getFrameColor(frameColor)
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
                             style={{ gridTemplateColumns: 'auto 2fr 1fr 1fr 1fr' }}>
                          <div className="flex justify-start items-center">
                            <div 
                              className="w-4 h-4 rounded-none border-2 cursor-pointer hover:opacity-80 p-1"
                              style={{
                                borderColor: getFrameColor(frameColor),
                                backgroundColor: item.equipped ? getFrameColor(frameColor) : '#171717'
                              }}
                              onClick={() => toggleItemEquipped(item.name)}
                            />
                          </div>
                          <div className="text-gray-200 break-words flex items-center gap-2">
                            <div className="flex-1">
                              <div>{getCleanItemName(item.name)}</div>
                              <div className="text-xs text-gray-500 mt-1">{getItemCategory(item.name)}</div>
                            </div>
                            {item.isVersatile && (
                              <div className="flex items-center gap-1">
                                <div
                                  className={`w-4 h-4 rounded-full ${canToggleVersatileMode(item.name) ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed opacity-50'}`}
                                  style={{
                                    backgroundColor: item.versatileMode ? getFrameColor(frameColor) : 'transparent',
                                    border: `2px solid ${getFrameColor(frameColor)}`
                                  }}
                                  onClick={() => canToggleVersatileMode(item.name) && toggleVersatileMode(item.name)}
                                  title={canToggleVersatileMode(item.name) 
                                    ? (item.versatileMode ? 'Двуручный режим (2 слота) - клик для переключения' : 'Одноручный режим (1 слот) - клик для переключения')
                                    : 'Недостаточно свободных слотов для переключения в двуручный режим'
                                  }
                                />
                                <span className="text-xs text-gray-400">
                                  {item.versatileMode ? '2H' : '1H'}
                                </span>
                              </div>
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
                  
                </div>
              </div>
              
              {/* Таблица РЮКЗАК */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-semibold text-gray-300">РЮКЗАК</div>
                  <button
                    onClick={() => setIsInventorySidebarOpen(true)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                    style={{ color: getFrameColor(frameColor) }}
                  >
                    <Settings className="w-3 h-3" />
                    УПРАВЛЕНИЕ ИНВЕНТАРЁМ
                  </button>
                </div>
                
                {/* Заголовки таблицы */}
                <div className="grid gap-2 text-sm font-semibold uppercase text-gray-400 mb-2 pb-1 items-center" 
                     style={{ 
                       gridTemplateColumns: 'auto 2fr 1fr 1fr 1fr',
                       borderBottom: `1px solid ${getFrameColor(frameColor)}20` 
                     }}>
                  <div className="flex items-center justify-start">✓</div>
                  <div className="flex items-center justify-start">НАЗВАНИЕ</div>
                  <div className="text-center">ВЕС</div>
                  <div className="text-center">КЛВ</div>
                  <div className="text-center">ЦЕНА</div>
                </div>
                
                {/* Строки таблицы */}
                <div className="space-y-1">
                  {getBackpackItems().length > 0 ? (
                    getBackpackItems().map((item, index) => {
                      // item уже является объектом с нужными полями
                      const cleanName = getCleanItemName(item.name);
                      const category = item.category || getItemCategory(item.name);
                      const weight = item.weight;
                      const cost = item.cost;
                      const quantity = item.quantity;
                      const itemType = item.type;
                      
                      return (
                      <div key={index}>
                        <div className="grid gap-2 text-sm py-1 items-center"
                             style={{ gridTemplateColumns: 'auto 2fr 1fr 1fr 1fr' }}>
                          <div className="flex justify-start items-center">
                            {(itemType === 'weapon' || itemType === 'armor' || itemType === 'shield') ? (
                              <div 
                                className={`w-4 h-4 rounded-none border-2 p-1 ${
                                  canEquipItem(cleanName) 
                                    ? 'cursor-pointer hover:opacity-80' 
                                    : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{
                                  borderColor: getFrameColor(frameColor),
                                  backgroundColor: '#171717'
                                }}
                                onClick={() => canEquipItem(cleanName) && toggleItemEquipped(cleanName)}
                                title={!canEquipItem(cleanName) ? 'Недостаточно слотов для экипировки' : undefined}
                              />
                            ) : (
                              <div className="w-4 h-4" />
                            )}
                          </div>
                          <div className="text-gray-200 break-words">
                            <div>
                              {cleanName}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{category}</div>
                          </div>
                          <div className="text-gray-400 text-center">{weight} фнт.</div>
                          <div className="text-gray-400 text-center">{quantity}</div>
                          <div className="text-gray-400 text-center">{cost}</div>
                        </div>
                        {index < getBackpackItems().length - 1 && (
                          <div 
                            className="my-1 h-px"
                            style={{
                              borderTop: `1px dotted ${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}40`
                            }}
                          />
                        )}
                      </div>
                    );
                  })
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
        backgroundImage: `url('data:image/svg+xml;charset=utf-8,${encodeURIComponent(getActionFrameSvg(frameColor))}')`,
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
            const frameColorHex = getFrameColor(frameColor);
            
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
        <div className="flex-1 overflow-y-auto scrollbar-thin" style={{
          scrollbarColor: 'rgba(156, 163, 175, 0.6) #1a1a1a'
        }}>
          {renderContent()}
        </div>
      </div>

      {/* Сайдбар управления инвентарем */}
      {isInventorySidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Затемнение фона */}
          <div 
            className="flex-1 bg-black/50" 
            onClick={() => setIsInventorySidebarOpen(false)}
          />
          
                    {/* Сайдбар */}
                    <div className="w-[500px] bg-neutral-900 border-l border-gray-700 flex flex-col">
            {/* Заголовок сайдбара */}
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-200">Управление инвентарем</h2>
              <button
                onClick={() => setIsInventorySidebarOpen(false)}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* Контент сайдбара */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* ДОБАВИТЬ ПРЕДМЕТЫ */}
              <Collapsible open={openSections.addItems} onOpenChange={() => toggleSection('addItems')}>
                <div className="bg-neutral-900 shadow-inner shadow-sm">
                  <CollapsibleTrigger asChild>
                    <div 
                      className="flex justify-between items-center p-2 cursor-pointer transition-colors duration-200"
                      style={{
                        backgroundColor: '#394b59',
                        borderBottom: openSections.addItems ? `1px solid ${getFrameColor(frameColor)}30` : 'none',
                        borderLeft: !openSections.addItems ? `3px solid ${getFrameColor(frameColor)}` : 'none'
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <span className="font-medium text-white">ДОБАВИТЬ ПРЕДМЕТЫ</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center">
                        {openSections.addItems ? <ChevronUp className="w-6 h-6 text-white" /> : <ChevronDown className="w-6 h-6 text-white" />}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-4">
                      {/* Фильтры */}
                      <div className="space-y-4 mb-6">
                        {/* Поиск по названию */}
                        <div>
                          <label className="text-sm font-medium text-gray-200 mb-2 block">
                            Поиск по названию
                          </label>
                          <input
                            type="text"
                            placeholder="Введите название предмета..."
                            value={searchFilter}
                            onChange={(e) => {
                              setSearchFilter(e.target.value);
                              setItemsPerPage(10);
                            }}
                            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-neutral-800 text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            style={{ 
                              borderColor: getFrameColor(frameColor) + '40',
                              '--tw-ring-color': getFrameColor(frameColor) + '40'
                            } as any}
                          />
                        </div>
                        
                        {/* Фильтр по категории */}
                        <div>
                          <label className="text-sm font-medium text-gray-200 mb-2 block">
                            Категория
                          </label>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => setCategoryFilter('all')}
                              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                categoryFilter === 'all' 
                                  ? 'text-white' 
                                  : 'text-gray-400 hover:text-gray-200'
                              }`}
                              style={{
                                backgroundColor: categoryFilter === 'all' ? getFrameColor(frameColor) : 'transparent',
                                borderColor: getFrameColor(frameColor) + '40',
                                border: '1px solid'
                              }}
                            >
                              Все
                            </button>
                            {['Оружие', 'Доспехи', 'Щиты', 'Снаряжение', 'Боеприпасы', 'Инструменты', 'Наборы снаряжения'].map(category => (
                              <button
                                key={category}
                                onClick={() => setCategoryFilter(category)}
                                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                  categoryFilter === category 
                                    ? 'text-white' 
                                    : 'text-gray-400 hover:text-gray-200'
                                }`}
                                style={{
                                  backgroundColor: categoryFilter === category ? getFrameColor(frameColor) : 'transparent',
                                  borderColor: getFrameColor(frameColor) + '40',
                                  border: '1px solid'
                                }}
                              >
                                {category}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Список предметов */}
                      <div className="space-y-2 overflow-y-auto max-h-96">
                        {getFilteredItems().slice(0, itemsPerPage).map((item) => (
                          <div
                            key={item.key}
                            className="border-b border-gray-600 bg-neutral-900 shadow-inner shadow-sm"
                          >
                            <Collapsible>
                              <CollapsibleTrigger asChild>
                                <div className="flex justify-between items-center p-2 cursor-pointer transition-colors duration-200 bg-neutral-800 hover:bg-neutral-700 min-w-0">
                                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                                    <span className="font-medium text-gray-200 break-words">
                                      {item.name}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      {item.category}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400">
                                      {item.cost}
                                    </span>
                                    <div className="flex gap-1">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // TODO: Купить предмет
                                        }}
                                        className="p-1 text-white rounded transition-colors hover:opacity-80 relative group"
                                        style={{
                                          backgroundColor: getFrameColor(frameColor),
                                        }}
                                      >
                                        <Coins className="w-4 h-4" />
                                        {/* Красивый tooltip */}
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                                          <div className="text-white font-semibold">Купить</div>
                                          {/* Стрелочка */}
                                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                        </div>
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAddItem(item);
                                        }}
                                        disabled={loadingItems.has(`${item.type}-${item.key}`)}
                                        className="p-1 text-white rounded transition-colors hover:opacity-80 relative group disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{
                                          backgroundColor: getFrameColor(frameColor),
                                        }}
                                      >
                                        {loadingItems.has(`${item.type}-${item.key}`) ? (
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                          <Plus className="w-4 h-4" />
                                        )}
                                        {/* Красивый tooltip */}
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                                          <div className="text-white font-semibold">Добавить</div>
                                          {/* Стрелочка */}
                                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                        </div>
                                      </button>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                  </div>
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="p-2 text-xs text-gray-400">
                                  <div className="text-gray-300 mb-2">
                                    <span className="font-medium">Категория:</span> {item.category}
                                  </div>
                                  <div className="text-gray-300 mb-2">
                                    <span className="font-medium">Стоимость:</span> {item.cost}
                                  </div>
                                  <div className="text-gray-300">
                                    <span className="font-medium">Вес:</span> {item.weight} фнт.
                                  </div>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </div>
                        ))}
                        
                        {/* Кнопка "Показать еще" */}
                        {getFilteredItems().length > itemsPerPage && (
                          <button
                            onClick={() => setItemsPerPage(prev => prev + 10)}
                            className="w-full py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
                            style={{ color: getFrameColor(frameColor) }}
                          >
                            Показать еще ({getFilteredItems().length - itemsPerPage} предметов)
                          </button>
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>

              {/* МОЙ ИНВЕНТАРЬ */}
              <Collapsible open={openSections.myInventory} onOpenChange={() => toggleSection('myInventory')}>
                <div className="bg-neutral-900 shadow-inner shadow-sm">
                  <CollapsibleTrigger asChild>
                    <div 
                      className="flex justify-between items-center p-2 cursor-pointer transition-colors duration-200"
                      style={{
                        backgroundColor: '#394b59',
                        borderBottom: openSections.myInventory ? `1px solid ${getFrameColor(frameColor)}30` : 'none',
                        borderLeft: !openSections.myInventory ? `3px solid ${getFrameColor(frameColor)}` : 'none'
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <span className="font-medium text-white">МОЙ ИНВЕНТАРЬ</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center">
                        {openSections.myInventory ? <ChevronUp className="w-6 h-6 text-white" /> : <ChevronDown className="w-6 h-6 text-white" />}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="p-4">
                                {getBackpackItems().length === 0 ? (
                                  <div className="text-center text-gray-500 text-sm py-4">
                                    Рюкзак пуст
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {getBackpackItems().map((item, index) => {
                                      // item уже является объектом с нужными полями
                                      const cleanName = getCleanItemName(item.name);
                                      const category = item.category || getItemCategory(item.name);
                                      const weight = item.weight;
                                      const cost = item.cost;
                                      const quantity = item.quantity;
                                      
                                      return (
                                        <div
                                          key={`${item.name}-${index}`}
                                          className="flex justify-between items-center p-2 bg-neutral-800 rounded border-b border-gray-600"
                                        >
                                          <div className="flex flex-col gap-1 flex-1 min-w-0">
                                            <span className="font-medium text-gray-200 break-words">
                                              {cleanName}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                              {category}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-400">
                                              {cost} • {weight} фнт.
                                            </span>
                                            <span className="text-xs text-gray-300 bg-gray-700 px-2 py-1 rounded">
                                              x{quantity}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </CollapsibleContent>
                </div>
              </Collapsible>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}