import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCharacter } from "@/store/character";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import ExitButton from "@/components/ui/ExitButton";
import StepArrows from "@/components/ui/StepArrows";
import CharacterHeader from "@/components/ui/CharacterHeader";
import { useParams } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState as useStateReact } from "react";
import { CLASS_LABELS, getClassByKey } from "@/data/classes";
import { BACKGROUND_LABELS, getBackgroundByKey } from "@/data/backgrounds";
import { Gears, Ammunitions } from "@/data/items/gear";
import { Weapons } from "@/data/items/weapons";
import { Armors } from "@/data/items/armors";
import { Tools, getToolKeysByCategory, TOOL_CATEGORY_LABELS } from "@/data/items/tools";
import { EQUIPMENT_PACKS } from "@/data/items/equipment-packs";
import { getAllCharacterData } from "@/utils/getAllCharacterData";
import { getWeaponMasteryByKey } from "@/data/items";
import EquipmentSlots from "@/components/ui/EquipmentSlots";
import ChoiceRenderer from "@/components/ui/ChoiceRenderer";

// Функция для перевода типов урона на русский
const translateDamageType = (damageType: string): string => {
    const translations: Record<string, string> = {
        'bludgeoning': 'Дробящий',
        'slashing': 'Рубящий',
        'piercing': 'Колющий',
        'fire': 'Огненный',
        'cold': 'Холодный',
        'lightning': 'Молниевый',
        'thunder': 'Звуковой',
        'acid': 'Кислотный',
        'poison': 'Ядовитый',
        'necrotic': 'Некротический',
        'radiant': 'Лучистый',
        'psychic': 'Психический',
        'force': 'Силовой'
    };
    return translations[damageType.toLowerCase()] || damageType;
};

// Функция для перевода свойств оружия на русский
const translateWeaponProperties = (properties: string[]): string[] => {
    const translations: Record<string, string> = {
        'loading': 'Перезарядка',
        'ammunition': 'Боеприпасы',
        'two-handed': 'Двуручное',
        'heavy': 'Тяжелое',
        'reach': 'Досягаемость',
        'versatile': 'Универсальное',
        'thrown': 'Метательное',
        'finesse': 'Фехтовальное',
        'light': 'Лёгкое'
    };
    return properties.map(prop => translations[prop] || prop);
};

    // Функция для перевода валюты на русский
    const translateCurrency = (cost: string): string => {
        return cost
            .replace(/gp/gi, 'ЗМ')
            .replace(/sp/gi, 'СМ')
            .replace(/cp/gi, 'ММ');
    };

    const translateAbility = (ability: string): string => {
        const translations: Record<string, string> = {
            'str': 'Сила',
            'dex': 'Ловкость',
            'con': 'Телосложение',
            'int': 'Интеллект',
            'wis': 'Мудрость',
            'cha': 'Харизма'
        };
        return translations[ability] || ability;
    };

    // Функция для конвертации стоимости в медные монеты (ММ)
    const convertToCopper = (cost: string): number => {
        const match = cost.match(/(\d+)\s*(gp|sp|cp|ЗМ|СМ|ММ)/i);
        if (!match) return 0;
        
        const amount = parseInt(match[1]);
        const currency = match[2].toLowerCase();
        
        switch (currency) {
            case 'gp':
            case 'зм':
                return amount * 100; // 1 ЗМ = 100 ММ
            case 'sp':
            case 'см':
                return amount * 10;  // 1 СМ = 10 ММ
            case 'cp':
            case 'мм':
                return amount;       // 1 ММ = 1 ММ
            default:
                return 0;
        }
    };

    // Функция для конвертации медных монет в золотые
    const convertCopperToGold = (copper: number): number => {
        return Math.floor(copper / 100);
    };

    // Функция для конвертации медных монет в серебряные
    const convertCopperToSilver = (copper: number): number => {
        return Math.floor((copper % 100) / 10);
    };

    // Функция для конвертации медных монет в медные
    const convertCopperToCopper = (copper: number): number => {
        return copper % 10;
    };



// Функции для получения русских названий предметов
const getItemName = (type: string, key: string): string => {
    switch (type) {
        case "weapon":
            const weapon = Weapons.find(w => w.key === key);
            return weapon?.name || key;
        case "armor":
            const armor = Armors.find(a => a.key === key);
            return armor?.name || key;
        case "gear":
            // Сначала ищем в обычном снаряжении
            let gear = Gears.find(g => g.key === key);
            if (gear) return gear.name;
            // Если не найдено, ищем в боеприпасах
            const ammunition = Ammunitions.find(a => a.key === key);
            return ammunition?.name || key;
        case "equipment-pack":
            const pack = EQUIPMENT_PACKS.find(p => p.key === key);
            return pack?.name || key;
        case "tool":
            // Если это категория инструментов (например, "gaming"), возвращаем название категории
            if (key === "gaming") {
                return "Игральный набор";
            }
            const tool = Tools.find(t => t.key === key);
            return tool?.name || key;
        default:
            return key;
    }
};

// Функция для расчета модификатора характеристики
const getAbilityModifier = (score: number): number => {
    return Math.floor((score - 10) / 2);
};

// Компонент карточки снаряжения
const EquipmentCard = ({ itemName, onRemove, characterData }: { 
    itemName: string | any; 
    onRemove: () => void;
    characterData?: any;
}) => {
    const [isOpen, setIsOpen] = useStateReact(false);
    const { equipItem, unequipItem, toggleVersatileMode, setActiveWeaponSlot, calculateMaxCarryWeight, equipCapacityItem, unequipCapacityItem } = useCharacter();
    
    // Получаем полные данные персонажа для расчета модификаторов
    const characterDataFull = characterData ? getAllCharacterData(characterData) : null;
    
    // Извлекаем количество и название предмета
    let quantity = '';
    let name = '';
    
    if (typeof itemName === 'object' && itemName !== null) {
        // Если itemName - это объект, используем его свойства
        quantity = itemName.quantity && itemName.quantity > 1 ? `${itemName.quantity}x ` : '';
        name = itemName.name || '';
    } else if (typeof itemName === 'string') {
        // Если itemName - это строка, обрабатываем как раньше
        const match = itemName.match(/^(\d+x\s+)?(.+)$/);
        quantity = match?.[1]?.trim() || '';
        name = match?.[2] || itemName;
    } else {
        name = String(itemName);
    }
    
    // Определяем тип предмета и его состояние
    const getItemType = (itemName: string | any): 'weapon' | 'armor' | 'shield' | 'capacity' | 'other' => {
        // Если itemName - это объект, используем его свойство type
        if (typeof itemName === 'object' && itemName !== null) {
            return itemName.type || 'other';
        }
        
        // Если itemName - это не строка, возвращаем 'other'
        if (typeof itemName !== 'string') {
            return 'other';
        }
        const cleanName = itemName.replace(/^\d+x\s+/, '');
        
        // Проверяем оружие
        const weapon = Weapons.find(w => w.name === cleanName);
        if (weapon) return 'weapon';
        
        // Проверяем доспех
        const armor = Armors.find(a => a.name === cleanName);
        if (armor) {
            if (armor.category === 'shield') return 'shield';
            return 'armor';
        }
        
        // Проверяем предметы с capacity
        const gear = Gears.find(g => g.name === cleanName);
        if (gear && gear.capacity) return 'capacity';
        
        return 'other';
    };
    
    const itemType = getItemType(name);
    const equipped = characterData?.equipped;
    
    // Проверяем, надет ли предмет
    const isEquipped = () => {
        if (!equipped || itemType === 'other') return false;
        
        let result = false;
        switch (itemType) {
            case 'armor':
                result = equipped.armor?.name === name;
                break;
            case 'shield':
                result = equipped.shield1?.name === name || equipped.shield2?.name === name;
                break;
            case 'weapon':
                const slot1 = Array.isArray(equipped.weaponSlot1) ? equipped.weaponSlot1 : [];
                const slot2 = Array.isArray(equipped.weaponSlot2) ? equipped.weaponSlot2 : [];
                result = slot1.some(w => w.name === name) || slot2.some(w => w.name === name);
                break;
            case 'capacity':
                result = equipped.capacityItem?.name === name;
                break;
            default:
                result = false;
        }
        
        // Отладочная информация
        console.log(`isEquipped for ${name} (${itemType}):`, {
            equipped: !!equipped,
            itemType,
            weaponSlot1: equipped?.weaponSlot1?.name,
            weaponSlot2: equipped?.weaponSlot2?.name,
            armor: equipped?.armor?.name,
            shield1: equipped?.shield1?.name,
            shield2: equipped?.shield2?.name,
            result
        });
        
        return result;
    };
    
    const equippedItem = () => {
        if (!equipped || itemType === 'other') return null;
        
        switch (itemType) {
            case 'armor':
                return equipped.armor;
            case 'shield':
                return equipped.shield1 || equipped.shield2 || null;
            case 'weapon':
                const slot1 = Array.isArray(equipped.weaponSlot1) ? equipped.weaponSlot1 : [];
                const slot2 = Array.isArray(equipped.weaponSlot2) ? equipped.weaponSlot2 : [];
                const weapon1 = slot1.find(w => w.name === name);
                const weapon2 = slot2.find(w => w.name === name);
                return weapon1 || weapon2 || null;
            case 'capacity':
                return equipped.capacityItem || null;
            default:
                return null;
        }
    };

    const getWeaponSlot = () => {
        if (itemType !== 'weapon' || !equipped) return null;
        
        const slot1 = Array.isArray(equipped.weaponSlot1) ? equipped.weaponSlot1 : [];
        const slot2 = Array.isArray(equipped.weaponSlot2) ? equipped.weaponSlot2 : [];
        
        if (slot1.some(w => w.name === name)) return 1;
        if (slot2.some(w => w.name === name)) return 2;
        return null;
    };

    const isActiveWeaponSlot = () => {
        if (itemType !== 'weapon' || !equipped) return false;
        const weaponSlot = getWeaponSlot();
        return weaponSlot === equipped.activeWeaponSlot;
    };

    const getShieldSlot = () => {
        if (itemType !== 'shield') return null;
        if (equipped?.shield1) return 1;
        if (equipped?.shield2) return 2;
        return null;
    };
    
    const canEquip = () => {
        if (itemType === 'other') return false;
        
        // Проверяем ограничения
        if (itemType === 'armor' && equipped?.armor) return false;
        if (itemType === 'shield' && (equipped?.shield1 || equipped?.shield2)) return false;
        if (itemType === 'capacity' && equipped?.capacityItem) return false;
        if (itemType === 'weapon') {
            const weaponSlot1 = Array.isArray(equipped?.weaponSlot1) ? equipped.weaponSlot1 : [];
            const weaponSlot2 = Array.isArray(equipped?.weaponSlot2) ? equipped.weaponSlot2 : [];
            const totalSlots1 = weaponSlot1.reduce((sum, w) => sum + w.slots, 0);
            const totalSlots2 = weaponSlot2.reduce((sum, w) => sum + w.slots, 0);
            
            // Щит занимает 1 слот из общих 4 слотов для оружия
            const shieldSlots1 = equipped?.shield1 ? 1 : 0;
            const shieldSlots2 = equipped?.shield2 ? 1 : 0;
            const shieldSlots = shieldSlots1 + shieldSlots2;
            const totalUsedSlots = totalSlots1 + totalSlots2 + shieldSlots;
            
            // Определяем количество слотов для нового оружия
            const weapon = Weapons.find(w => w.name === name);
            let requiredSlots = 1;
            if (weapon?.properties?.includes('two-handed')) {
                requiredSlots = 2;
            }
            
            // Проверяем, не превышаем ли общий лимит в 4 слота
            if (totalUsedSlots + requiredSlots > 4) {
                return false; // Превышен общий лимит слотов
            }
            
            // Проверяем, есть ли место в активном слоте
            if (equipped?.activeWeaponSlot === 1) {
                if (totalSlots1 + requiredSlots <= 2) return true; // Помещается в слот I
                if (totalSlots2 + requiredSlots <= 2) return true; // Не помещается в слот I, но помещается в слот II
                return false; // Не помещается ни в один слот
            } else {
                if (totalSlots2 + requiredSlots <= 2) return true; // Помещается в слот II
                if (totalSlots1 + requiredSlots <= 2) return true; // Не помещается в слот II, но помещается в слот I
                return false; // Не помещается ни в один слот
            }
        }
        if (itemType === 'shield') {
            // Щит можно надеть, если его еще нет и есть свободные слоты
            if (equipped?.shield1 || equipped?.shield2) return false; // Щит уже надет
            
            const weaponSlot1 = Array.isArray(equipped?.weaponSlot1) ? equipped.weaponSlot1 : [];
            const weaponSlot2 = Array.isArray(equipped?.weaponSlot2) ? equipped.weaponSlot2 : [];
            const totalSlots1 = weaponSlot1.reduce((sum, w) => sum + w.slots, 0);
            const totalSlots2 = weaponSlot2.reduce((sum, w) => sum + w.slots, 0);
            
            // Проверяем, есть ли место хотя бы в одном снаряжении
            return totalSlots1 < 2 || totalSlots2 < 2;
        }
        
        return true;
    };
    
    const handleEquipToggle = () => {
        if (itemType === 'other') return;
        
        if (isEquipped()) {
            if (itemType === 'capacity') {
                unequipCapacityItem();
            } else {
                unequipItem(name, itemType);
            }
        } else {
            if (itemType === 'capacity') {
                const gear = Gears.find(g => g.name === name);
                if (gear?.capacity) {
                    equipCapacityItem(name, gear.capacity);
                }
            } else {
                // Определяем количество слотов для оружия
                let slots = 1;
                let isVersatile = false;
                
                if (itemType === 'weapon') {
                    const weapon = Weapons.find(w => w.name === name);
                    if (weapon?.properties?.includes('versatile')) {
                        isVersatile = true;
                    }
                    if (weapon?.properties?.includes('two-handed')) {
                        slots = 2;
                    }
                }
                
                equipItem(name, itemType, slots, isVersatile, false);
            }
        }
    };
    
    const handleVersatileToggle = () => {
        const currentWeapons = equipped?.weapons || [];
        const otherWeapons = currentWeapons.filter(w => w.name !== name);
        const totalOtherWeaponSlots = otherWeapons.reduce((sum, w) => sum + w.slots, 0);
        const shieldSlots1 = equipped?.shield1 ? 1 : 0;
        const shieldSlots2 = equipped?.shield2 ? 1 : 0;
        const shieldSlots = shieldSlots1 + shieldSlots2;
        const currentVersatileMode = equippedItem()?.versatileMode || false;
        
        if (currentVersatileMode) {
            // Переключение с двуручного на одноручный режим
            toggleVersatileMode(name);
        } else {
            // Переключение с одноручного на двуручный режим
            const totalSlotsWithTwoHanded = totalOtherWeaponSlots + shieldSlots + 2;
            
            if (totalSlotsWithTwoHanded <= 4) {
                toggleVersatileMode(name);
            } else {
                console.warn('Недостаточно слотов для двуручного режима');
            }
        }
    };
    
    // Ищем описание предмета
    const getItemDescription = (itemName: string | any) => {
        // Если itemName - это объект, используем его свойство description
        if (typeof itemName === 'object' && itemName !== null) {
            return itemName.description || '';
        }
        
        // Если itemName - это не строка, возвращаем пустую строку
        if (typeof itemName !== 'string') {
            return '';
        }
        // Убираем количество для поиска
        const cleanName = itemName.replace(/^\d+x\s+/, '');
        
        // Ищем в разных массивах
        let item = Gears.find(g => g.name === cleanName);
        if (item) {
            return {
                description: item.desc,
                cost: translateCurrency(item.cost),
                weight: typeof item.weight === 'number' ? item.weight : 0,
                category: 'Снаряжение',
                hasWeight: typeof item.weight === 'number'
            };
        }
        
        item = Ammunitions.find(a => a.name === cleanName);
        if (item) {
            return {
                description: item.desc,
                cost: translateCurrency(item.cost),
                weight: typeof item.weight === 'number' ? item.weight : 0,
                category: 'Боеприпасы',
                hasWeight: typeof item.weight === 'number'
            };
        }
        
        const weapon = Weapons.find(w => w.name === cleanName);
        if (weapon) {
            const attackType = weapon.type === 'ranged' ? 'дальний' : 'ближний';
            const attackRange = weapon.range || '5 футов';
            
            // Проверяем владение оружием (пока заглушка - нужно будет интегрировать с данными персонажа)
            const hasProficiency = true; // TODO: проверить владение оружием персонажа
            
            // Рассчитываем урон с реальным модификатором
            const baseDamage = weapon.damage;
            let abilityModifier = 0;
            let abilityName = '';
            
            if (characterDataFull && characterData) {
                if (weapon.type === 'ranged') {
                    abilityModifier = getAbilityModifier(characterData.stats?.dex || 10);
                    abilityName = 'ЛОВ';
                } else {
                    abilityModifier = getAbilityModifier(characterData.stats?.str || 10);
                    abilityName = 'СИЛ';
                }
            }
            
            const damageWithBonus = characterData && characterData.stats
                ? `${baseDamage} ${abilityModifier >= 0 ? '+' : ''}${abilityModifier}`
                : `${baseDamage} + ${abilityName}`;
            
            // Определяем категорию оружия
            const getWeaponCategory = (weapon: any) => {
                if (weapon.type === 'ranged') {
                    return weapon.category === 'simple' ? 'Простое дальнобойное оружие' : 'Воинское дальнобойное оружие';
                } else {
                    return weapon.category === 'simple' ? 'Простое рукопашное оружие' : 'Воинское рукопашное оружие';
                }
            };

            return {
                description: getWeaponCategory(weapon),
                cost: translateCurrency(weapon.cost),
                weight: typeof weapon.weight === 'number' ? weapon.weight : 0,
                category: getWeaponCategory(weapon),
                attackType: attackType,
                attackRange: attackRange,
                properties: translateWeaponProperties(weapon.properties),
                damage: damageWithBonus,
                damageType: weapon.damageType,
                range: weapon.range,
                hasProficiency: hasProficiency,
                abilityName: abilityName,
                mastery: weapon.mastery,
                hasWeight: typeof weapon.weight === 'number'
            };
        }
        
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
            } else {
                armorCategory = 'Доспех';
            }

            return {
                description: armorCategory,
                cost: translateCurrency(armor.cost),
                weight: typeof armor.weight === 'number' ? armor.weight : 0,
                category: armorCategory,
                ac: armor.baseAC,
                maxDex: armor.maxDexBonus,
                stealth: armor.disadvantageStealth,
                armorCategory: armorCategory,
                hasProficiency: true, // TODO: проверить владение доспехом персонажа
                hasWeight: typeof armor.weight === 'number'
            };
        }
        
        const pack = EQUIPMENT_PACKS.find(p => p.name === cleanName);
        if (pack) {
            return {
                description: pack.description,
                cost: translateCurrency(pack.cost),
                weight: typeof pack.weight === 'number' ? pack.weight : 0,
                category: 'Набор снаряжения',
                hasWeight: typeof pack.weight === 'number'
            };
        }
        
        const tool = Tools.find(t => t.name === cleanName);
        if (tool) {
            const categoryLabel = TOOL_CATEGORY_LABELS[tool.category] || tool.category;
            return {
                description: tool.desc,
                cost: translateCurrency(tool.cost),
                weight: typeof tool.weight === 'number' ? tool.weight : 0,
                category: categoryLabel,
                utilize: tool.utilize,
                ability: tool.ability,
                hasWeight: typeof tool.weight === 'number'
            };
        }
        
        return {
            description: 'Описание не найдено',
            cost: 'Неизвестно',
            weight: 0,
            category: 'Неизвестно'
        };
    };
    
    const itemInfo = getItemDescription(name);
    
    return (
        <div className="border-2 rounded-t-lg bg-card shadow-inner shadow-sm">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger asChild>
                    <div className={`flex justify-between items-center p-2 cursor-pointer transition-colors duration-200 rounded-t-md ${isOpen ? "bg-primary/15 border-b border-primary/30" : "bg-muted/40 hover:bg-primary/10"}`}>
                        <div className="flex items-center gap-2">
                            {quantity && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium">
                                    {quantity}
                                </span>
                            )}
                            <span className="font-medium">
                                {name}
                            </span>
                            {/* Римская цифра для оружия и щита */}
                            {(itemType === 'weapon' || itemType === 'shield') && isEquipped() && (
                                <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${
                                    (itemType === 'weapon' && isActiveWeaponSlot()) || (itemType === 'shield' && getShieldSlot() === equipped?.activeWeaponSlot)
                                        ? 'bg-primary text-primary-foreground' 
                                        : 'bg-muted text-muted-foreground'
                                }`}>
                                    {itemType === 'weapon' 
                                        ? (getWeaponSlot() === 1 ? 'I' : 'II')
                                        : (getShieldSlot() === 1 ? 'I' : 'II')
                                    }
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Слоты для оружия и щита */}
                            {(itemType === 'weapon' || itemType === 'shield') && (
                                <EquipmentSlots 
                                    weaponSlot1={Array.isArray(equipped?.weaponSlot1) ? equipped.weaponSlot1 : []}
                                    weaponSlot2={Array.isArray(equipped?.weaponSlot2) ? equipped.weaponSlot2 : []}
                                    shield1={equipped?.shield1 || null}
                                    shield2={equipped?.shield2 || null}
                                    isVersatile={itemType === 'weapon' ? equippedItem()?.isVersatile : false}
                                    versatileMode={itemType === 'weapon' ? equippedItem()?.versatileMode : false}
                                    onVersatileToggle={itemType === 'weapon' ? handleVersatileToggle : undefined}
                                    activeWeaponSlot={equipped?.activeWeaponSlot || 1}
                                    onSlotClick={(slot) => setActiveWeaponSlot(slot)}
                                />
                            )}
                            
                            {/* Слот для доспеха */}
                            {itemType === 'armor' && (
                                <div className={`w-3 h-3 border border-gray-400 rounded-sm transition-colors ${
                                    equipped?.armor ? 'bg-[#cf995f] ring-1 ring-[#cf995f]/50' : 'bg-transparent'
                                }`}
                                title={equipped?.armor ? `Доспех: ${equipped.armor.name}` : 'Свободно'}
                                />
                            )}
                            
                            
                            {/* Кнопка надевания */}
                            {(itemType !== 'other' && itemType !== 'capacity') && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEquipToggle();
                                    }}
                                    disabled={!isEquipped() && !canEquip()}
                                    className={`w-16 px-1.5 py-0.5 text-[10px] rounded transition-colors shadow-inner text-center ${
                                        isEquipped() 
                                            ? 'bg-[#ffbd03] text-white hover:bg-[#d8a518]' 
                                            : canEquip() 
                                                ? 'bg-[#96bf6b] text-primary-foreground hover:bg-[#7ea55a]' 
                                                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                    }`}
                                    title={
                                        !isEquipped() && !canEquip() && itemType === 'weapon'
                                            ? 'Недостаточно слотов для двуручного оружия'
                                            : undefined
                                    }
                                >
                                    {isEquipped() ? 'СНЯТЬ' : 'НАДЕТЬ'}
                                </button>
                            )}
                            
                            {/* Кнопка для предметов с capacity */}
                            {itemType === 'capacity' && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEquipToggle();
                                    }}
                                    className={`w-16 px-1.5 py-0.5 text-[10px] rounded transition-colors shadow-inner text-center ${
                                        isEquipped() 
                                            ? 'bg-[#ffbd03] text-white hover:bg-[#d8a518]' 
                                            : 'bg-[#96bf6b] text-primary-foreground hover:bg-[#7ea55a]'
                                    }`}
                                >
                                    {isEquipped() ? 'СНЯТЬ' : 'НАДЕТЬ'}
                                </button>
                            )}
                            
                            {isOpen ? <ChevronUp className="w-6 h-6 text-primary" /> : <ChevronDown className="w-6 h-6 text-primary" />}
                        </div>
                    </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="p-2 text-xs text-muted-foreground relative">
                        {/* Категория в самом верху */}
                        <div className="text-muted-foreground mb-2">
                            <span className="font-medium text-foreground"></span> {itemInfo.category}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            {/* Для оружия показываем специальные параметры */}
                            {itemInfo.attackType ? (
                                <>
                                    <div className="text-muted-foreground">
                                        <span className="font-medium text-foreground">Владение:</span> {itemInfo.hasProficiency ? 'Да' : 'Нет'}
                                    </div>
                                    <div className="text-muted-foreground">
                                        <span className="font-medium text-foreground">Дальность:</span> {itemInfo.attackRange}
                                    </div>
                                    <div className="text-muted-foreground">
                                        <span className="font-medium text-foreground">Урон:</span> {itemInfo.damage}
                                    </div>
                                    <div className="text-muted-foreground">
                                        <span className="font-medium text-foreground">Тип урона:</span> {translateDamageType(itemInfo.damageType)}
                                    </div>
                                    <div className="text-muted-foreground">
                                        <span className="font-medium text-foreground">Вес:</span> {itemInfo.weight} фнт.
                                    </div>
                                    <div className="text-muted-foreground">
                                        <span className="font-medium text-foreground">Стоимость:</span> {itemInfo.cost}
                                    </div>
                                    {itemInfo.properties && itemInfo.properties.length > 0 && (
                                    <div className="text-muted-foreground">
                                        <span className="font-medium text-foreground">Свойства:</span> {itemInfo.properties.join(', ')}
                                    </div>
                                    )}
                                    <div className="text-muted-foreground">
                                        <span className="font-medium text-foreground">Мастерство:</span> {getWeaponMasteryByKey(itemInfo.mastery)?.name || itemInfo.mastery}
                                    </div>
                                </>
                            ) : itemInfo.armorCategory ? (
                                /* Для доспеха показываем специальные параметры */
                                <>
                                    <div className="text-muted-foreground">
                                        <span className="font-medium text-foreground">Владение:</span> {itemInfo.hasProficiency ? 'Да' : 'Нет'}
                                    </div>
                                    <div className="text-muted-foreground">
                                        <span className="font-medium text-foreground">Класс брони:</span> {itemInfo.ac}
                                    </div>
                                    <div className="text-muted-foreground">
                                        <span className="font-medium text-foreground">Вес:</span> {itemInfo.weight} фнт.
                                    </div>
                                    <div className="text-muted-foreground">
                                        <span className="font-medium text-foreground">Стоимость:</span> {itemInfo.cost}
                                    </div>
                                </>
                            ) : (
                                /* Для других предметов показываем вес и стоимость, или utilize и ability для инструментов */
                                <>
                                    {itemInfo.utilize && itemInfo.ability ? (
                                        /* Для инструментов показываем применение и характеристику */
                                        <>
                                            <div className="text-muted-foreground">
                                                <span className="font-medium text-foreground">Применение:</span> {itemInfo.utilize}
                                            </div>
                                            <div className="text-muted-foreground">
                                                <span className="font-medium text-foreground">Характеристика:</span> {translateAbility(itemInfo.ability)}
                                            </div>
                                            <div className="text-muted-foreground">
                                                <span className="font-medium text-foreground">Стоимость:</span> {itemInfo.cost}
                                            </div>
                                        </>
                                    ) : (
                                        /* Для других предметов показываем вес и стоимость */
                                        <>
                                            {itemInfo.hasWeight && (
                                                <div className="text-muted-foreground">
                                                    <span className="font-medium text-foreground">Вес:</span> {itemInfo.weight} фнт.
                                                </div>
                                            )}
                                            <div className="text-muted-foreground">
                                                <span className="font-medium text-foreground">Стоимость:</span> {itemInfo.cost}
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                        
                        {/* Описание вынесено отдельно */}
                        {!itemInfo.attackType && !itemInfo.armorCategory && (
                            <div className=" pb-2">
                                <div className="text-xs text-muted-foreground leading-relaxed mt-2">
                                    {itemInfo.description}
                                </div>
                            </div>
                        )}
                        
                        {/* Красный крестик для удаления */}
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onRemove();
                            }}
                            onMouseDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                            }}
                            className="absolute right-2 bottom-2 p-1 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors cursor-pointer"
                            title="Удалить предмет"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
};



export default function EquipmentPick() {
    const { id } = useParams<{ id: string }>(); 
    const nav = useNavigate();
    const { draft, setBasics, calculateMaxCarryWeight, isOverloaded } = useCharacter();
    const [selectedClassChoice, setSelectedClassChoice] = useState<number>(0);
    const [selectedBackgroundChoice, setSelectedBackgroundChoice] = useState<number>(0);
    const [currency, setCurrency] = useState({
        platinum: 0,  // Платина
        gold: 0,      // Золото
        electrum: 0,  // Электрум
        silver: 0,    // Серебро
        copper: 0     // Медь
    });
    const [addedInventory, setAddedInventory] = useState<(string | any)[]>([]);
    const [openSections, setOpenSections] = useState({
        starting: true,
        inventory: false,
        addItems: false,
        currency: false
    });
    
    // Состояние для фильтров и выбранных предметов
    const [searchFilter, setSearchFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [selectedItems, setSelectedItems] = useState<{[key: string]: number}>({});
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [notification, setNotification] = useState<{ message: string; type: 'buy' | 'add' | 'error' } | null>(null);

    // Загружаем инвентарь из драфта при инициализации
    useEffect(() => {
        if (draft.basics.equipment && draft.basics.equipment.length > 0) {
            setAddedInventory(draft.basics.equipment);
        }
        // gold теперь управляется через currency
        if (draft.basics.currency) {
            setCurrency(draft.basics.currency);
        }
    }, [draft.basics.equipment, draft.basics.gold, draft.basics.currency]);

    // Функция для показа уведомления
    const showNotification = (message: string, type: 'buy' | 'add' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification(null);
        }, 2000);
    };

    // Функция для расчета общего количества в ЗМ
    const calculateTotalGold = () => {
        return currency.platinum * 10 + currency.gold + currency.electrum * 0.5 + currency.silver * 0.1 + currency.copper * 0.01;
    };

    // Функция для обновления валюты в драфте
    const updateCurrencyInDraft = (newCurrency: typeof currency) => {
        setBasics({ currency: newCurrency });
    };

    // Получаем данные класса
    const classInfo = getClassByKey(draft.basics.class);
    const classEquipmentChoices = classInfo?.equipmentChoices?.[0];
    
    // Получаем данные предыстории
    const backgroundInfo = getBackgroundByKey(draft.basics.background);
    const backgroundEquipmentChoices = backgroundInfo?.equipmentChoices?.[0];
    

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Функция для получения веса предмета
    const getItemWeight = (itemName: string | any) => {
        // Если itemName - это объект, используем его свойство weight
        if (typeof itemName === 'object' && itemName !== null) {
            return itemName.weight || 0;
        }
        
        // Если itemName - это строка, обрабатываем как раньше
        if (typeof itemName !== 'string') {
            return 0;
        }
        
        const cleanName = itemName.replace(/^\d+x\s+/, '');
        
        // Ищем в разных массивах
        let item = Gears.find(g => g.name === cleanName);
        if (item) {
            // Если у предмета нет веса, возвращаем 0
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
        
        // Отладочная информация
        console.log(`Предмет не найден: "${cleanName}" (оригинал: "${itemName}")`);
        return 0;
    };

    // Подсчет общего веса инвентаря
    const calculateTotalWeight = () => {
        let totalWeight = 0;
        addedInventory.forEach(item => {
            totalWeight += getItemWeight(item);
        });
        return totalWeight;
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
                category: 'Доспехи'
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
        
        return items;
    };

    // Фильтрация предметов
    const getFilteredItems = () => {
        const allItems = getAllItems();
        return allItems.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchFilter.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    };

    // Сортировка предметов в инвентаре по категориям
    const getSortedInventory = () => {
        const sortedItems = [...addedInventory];
        
        // Отладочная информация - показываем все предметы в инвентаре
        // console.log('=== ВСЕ ПРЕДМЕТЫ В ИНВЕНТАРЕ ===');
        // console.log('addedInventory:', addedInventory);
        // console.log('sortedItems:', sortedItems);
        
        // Функция для нормализации строк (замена ё на е и приведение к нижнему регистру)
        const normalizeString = (str: string) => {
            return str.toLowerCase().replace(/ё/g, 'е');
        };
        
        // Функция для извлечения базового названия предмета (убираем количество)
        const getBaseItemName = (itemName: string | any) => {
            // Если itemName - это объект, используем его свойство name
            if (typeof itemName === 'object' && itemName !== null) {
                return itemName.name || '';
            }
            
            // Если itemName - это не строка, возвращаем пустую строку
            if (typeof itemName !== 'string') {
                return '';
            }
            // Убираем количество в разных форматах:
            // "Метательное копьё (8)" -> "Метательное копьё"
            // "8x Метательное копьё" -> "Метательное копьё"
            return itemName
                .replace(/\s*\(\d+\)\s*$/, '') // убираем (8)
                .replace(/^\d+x\s*/, '') // убираем 8x в начале
                .trim();
        };
        
        return sortedItems.sort((a, b) => {
            // Определяем тип предмета по его названию
            const getItemType = (itemName: string | any) => {
                // Если itemName - это объект, используем его свойство type
                if (typeof itemName === 'object' && itemName !== null) {
                    return itemName.type || 'other';
                }
                
                // Если itemName - это не строка, возвращаем 'other'
                if (typeof itemName !== 'string') {
                    return 'other';
                }
                // Получаем базовое название предмета (без количества)
                const baseItemName = getBaseItemName(itemName);
                const normalizedItemName = normalizeString(baseItemName);
                
                // console.log(`Обрабатываем предмет: "${itemName}" -> базовое: "${baseItemName}" -> нормализованное: "${normalizedItemName}"`);
                
                // Проверяем доспехи
                const armor = Armors.find(armor => normalizeString(armor.name) === normalizedItemName);
                if (armor) return { type: 'armor', priority: 1 };
                
                // Проверяем оружие
                const weapon = Weapons.find(weapon => normalizeString(weapon.name) === normalizedItemName);
                if (weapon) {
                    // console.log(`Найдено оружие: "${itemName}" -> "${weapon.name}"`);
                    return { type: 'weapon', priority: 2 };
                }
                
                // Проверяем щиты (щиты - это доспехи с категорией 'shield')
                const shield = Armors.find(armor => normalizeString(armor.name) === normalizedItemName && armor.category === 'shield');
                if (shield) return { type: 'shield', priority: 3 };
                
                // Проверяем инструменты
                const tool = Tools.find(tool => normalizeString(tool.name) === normalizedItemName);
                if (tool) return { type: 'tool', priority: 4 };
                
                // Проверяем снаряжение
                const gear = Gears.find(gear => normalizeString(gear.name) === normalizedItemName);
                if (gear) return { type: 'gear', priority: 5 };
                
                // Проверяем боеприпасы
                const ammo = Ammunitions.find(ammo => normalizeString(ammo.name) === normalizedItemName);
                if (ammo) return { type: 'ammunition', priority: 6 };
                
                // Отладочная информация для непонятных предметов
                // console.log(`Неопознанный предмет: "${itemName}" (нормализовано: "${normalizedItemName}")`);
                
                // Дополнительная отладка для копья
                // if (itemName.toLowerCase().includes('копь')) {
                //     console.log('=== ОТЛАДКА КОПЬЯ ===');
                //     console.log('Исходное название:', itemName);
                //     console.log('Нормализованное:', normalizedItemName);
                //     console.log('Доступные оружия с "копь":', Weapons.filter(w => w.name.toLowerCase().includes('копь')).map(w => w.name));
                //     console.log('Доступные оружия с "javelin":', Weapons.filter(w => w.nameEn?.toLowerCase().includes('javelin')).map(w => ({ name: w.name, nameEn: w.nameEn })));
                // }
                
                // Остальные предметы
                return { type: 'other', priority: 7 };
            };
            
            const typeA = getItemType(a);
            const typeB = getItemType(b);
            
            // Сначала сортируем по приоритету типа
            if (typeA.priority !== typeB.priority) {
                return typeA.priority - typeB.priority;
            }
            
            // Если тип одинаковый, сортируем по алфавиту
            const nameA = typeof a === 'string' ? a : (a.name || '');
            const nameB = typeof b === 'string' ? b : (b.name || '');
            return nameA.localeCompare(nameB);
        });
    };

    // Получение предметов для текущей страницы
    const getCurrentPageItems = () => {
        const filteredItems = getFilteredItems();
        return filteredItems.slice(0, itemsPerPage);
    };

    // Проверка, есть ли еще предметы для показа
    const hasMoreItems = () => {
        const filteredItems = getFilteredItems();
        return itemsPerPage < filteredItems.length;
    };

    // Получение описания предмета для карточек в "Добавить предметы"
    const getItemDescription = (type: string, key: string) => {
        if (type === 'weapon') {
            const weapon = Weapons.find(w => w.key === key);
            if (weapon) {
                const attackType = weapon.type === 'ranged' ? 'дальний' : 'ближний';
                const attackRange = weapon.range || '5 футов';
                const hasProficiency = true; // TODO: проверить владение оружием персонажа
                
                // Рассчитываем урон с реальным модификатором
                const baseDamage = weapon.damage;
                let abilityModifier = 0;
                let abilityName = '';
                
                if (draft.stats) {
                    if (weapon.type === 'ranged') {
                        abilityModifier = getAbilityModifier(draft.stats.dex || 10);
                        abilityName = 'ЛОВ';
        } else {
                        abilityModifier = getAbilityModifier(draft.stats.str || 10);
                        abilityName = 'СИЛ';
                    }
                }
                
                const damageWithBonus = draft.stats
                    ? `${baseDamage} ${abilityModifier >= 0 ? '+' : ''}${abilityModifier}`
                    : `${baseDamage} + ${abilityName}`;
                
                // Определяем категорию оружия
                const getWeaponCategory = (weapon: any) => {
                    if (weapon.type === 'ranged') {
                        return weapon.category === 'simple' ? 'Простое дальнобойное оружие' : 'Воинское дальнобойное оружие';
                    } else {
                        return weapon.category === 'simple' ? 'Простое рукопашное оружие' : 'Воинское рукопашное оружие';
                    }
                };

                return {
                    description: getWeaponCategory(weapon),
                    cost: translateCurrency(weapon.cost),
                    weight: typeof weapon.weight === 'number' ? weapon.weight : 0,
                    category: getWeaponCategory(weapon),
                    attackType: attackType,
                    attackRange: attackRange,
                    properties: translateWeaponProperties(weapon.properties),
                    damage: damageWithBonus,
                    damageType: weapon.damageType,
                    range: weapon.range,
                    hasProficiency: hasProficiency,
                    abilityName: abilityName,
                    mastery: weapon.mastery,
                    hasWeight: typeof weapon.weight === 'number'
                };
            }
        } else if (type === 'armor') {
            const armor = Armors.find(a => a.key === key);
            if (armor) {
                let armorCategory = '';
                if (armor.category === 'light') {
                    armorCategory = 'Лёгкий доспех';
                } else if (armor.category === 'medium') {
                    armorCategory = 'Средний доспех';
                } else if (armor.category === 'heavy') {
                    armorCategory = 'Тяжёлый доспех';
                } else if (armor.category === 'shield') {
                    armorCategory = 'Щит';
                } else {
                    armorCategory = 'Доспех';
                }

                return {
                    description: armorCategory,
                    cost: translateCurrency(armor.cost),
                    weight: typeof armor.weight === 'number' ? armor.weight : 0,
                    category: armorCategory,
                    ac: armor.baseAC,
                    maxDex: armor.maxDexBonus,
                    stealth: armor.disadvantageStealth,
                    armorCategory: armorCategory,
                    hasProficiency: true, // TODO: проверить владение доспехом персонажа
                    hasWeight: typeof armor.weight === 'number'
                };
            }
        } else if (type === 'gear') {
            const gear = Gears.find(g => g.key === key);
            if (gear) {
                return {
                    description: gear.desc,
                    cost: translateCurrency(gear.cost),
                    weight: typeof gear.weight === 'number' ? gear.weight : 0,
                    category: 'Снаряжение',
                    hasWeight: typeof gear.weight === 'number'
                };
            }
        } else if (type === 'ammunition') {
            const ammo = Ammunitions.find(a => a.key === key);
            if (ammo) {
                return {
                    description: ammo.desc,
                    cost: translateCurrency(ammo.cost),
                    weight: typeof ammo.weight === 'number' ? ammo.weight : 0,
                    category: 'Боеприпасы',
                    hasWeight: typeof ammo.weight === 'number'
                };
            }
        } else if (type === 'tool') {
            const tool = Tools.find(t => t.key === key);
            if (tool) {
                const categoryLabel = TOOL_CATEGORY_LABELS[tool.category] || tool.category;
                return {
                    description: tool.desc,
                    cost: translateCurrency(tool.cost),
                    weight: typeof tool.weight === 'number' ? tool.weight : 0,
                    category: categoryLabel,
                    utilize: tool.utilize,
                    ability: tool.ability,
                    hasWeight: typeof tool.weight === 'number'
                };
            }
        }
        
        return {
            description: 'Описание не найдено',
            cost: 'Неизвестно',
            weight: 0,
            category: 'Неизвестно'
        };
    };

    // Добавление предмета в выбранные
    const addToSelected = (itemKey: string) => {
        setSelectedItems(prev => ({
            ...prev,
            [itemKey]: (prev[itemKey] || 0) + 1
        }));
    };

    // Удаление предмета из выбранных
    const removeFromSelected = (itemKey: string) => {
        setSelectedItems(prev => {
            const newSelected = { ...prev };
            if (newSelected[itemKey] > 1) {
                newSelected[itemKey] -= 1;
            } else {
                delete newSelected[itemKey];
            }
            return newSelected;
        });
    };


    // Функция для удаления предмета из инвентаря
    const removeFromInventory = (index: number) => {
        setAddedInventory(prev => {
            const item = prev[index];
            if (!item) return prev;
            
            // Проверяем, есть ли количество в названии предмета
            const quantityMatch = item.match(/^(\d+)x\s+(.+)$/);
            
            if (quantityMatch) {
                const quantity = parseInt(quantityMatch[1]);
                const itemName = quantityMatch[2];
                
                if (quantity > 1) {
                    // Уменьшаем количество на 1
                    const newQuantity = quantity - 1;
                    const newItem = `${newQuantity}x ${itemName}`;
                    const newInventory = [...prev];
                    newInventory[index] = newItem;
                    
                    // Обновляем инвентарь в драфте
                    setBasics({ equipment: newInventory });
                    return newInventory;
                } else {
                    // Если количество 1, удаляем предмет полностью
                    const newInventory = prev.filter((_, i) => i !== index);
                    
                    // Если инвентарь пуст, сбрасываем флаг
                    if (newInventory.length === 0) {
                        setBasics({ 
                            equipment: [], 
                            isStartEquipmentAdded: false 
                        });
                    } else {
                        // Обновляем инвентарь в драфте
                        setBasics({ equipment: newInventory });
                    }
                    
                    return newInventory;
                }
            } else {
                // Если нет количества, удаляем предмет полностью
                const newInventory = prev.filter((_, i) => i !== index);
                
                // Если инвентарь пуст, сбрасываем флаг
                if (newInventory.length === 0) {
                    setBasics({ 
                        equipment: [], 
                        isStartEquipmentAdded: false 
                    });
                } else {
                    // Обновляем инвентарь в драфте
                    setBasics({ equipment: newInventory });
                }
                
                return newInventory;
            }
        });
    };

    // Функция для добавления стартового инвентаря
    const addStartingInventory = () => {
        const newItems: string[] = [];
        let totalGold = 0;
        
        // Добавляем снаряжение класса
        if (classEquipmentChoices) {
            const selectedClassChoiceData = classEquipmentChoices.choices[selectedClassChoice];
            if (selectedClassChoiceData) {
                selectedClassChoiceData.items.forEach(item => {
                    const itemName = getItemName(item.type, item.key);
                    
                    // Если это набор снаряжения, добавляем все предметы из набора
                    if (item.type === "equipment-pack") {
                        const pack = EQUIPMENT_PACKS.find(p => p.key === item.key);
                        if (pack) {
                            pack.items.forEach(packItem => {
                                const packItemName = getItemName("gear", packItem.key);
                                const fullName = `${packItem.quantity && packItem.quantity > 1 ? packItem.quantity + 'x ' : ''}${packItemName}`;
                                newItems.push(fullName);
                            });
                        }
                    } else {
                        // Обычный предмет
                        const fullName = `${item.quantity && item.quantity > 1 ? item.quantity + 'x ' : ''}${itemName}`;
                        newItems.push(fullName);
                    }
                });
                
                // Добавляем золото класса
                if (selectedClassChoiceData.gold && selectedClassChoiceData.gold > 0) {
                    totalGold += selectedClassChoiceData.gold;
                }
            }
        }
        
        // Добавляем снаряжение предыстории
        if (backgroundEquipmentChoices) {
            const selectedBackgroundChoiceData = backgroundEquipmentChoices.choices[selectedBackgroundChoice];
            if (selectedBackgroundChoiceData) {
                selectedBackgroundChoiceData.items.forEach(item => {
                    // Проверяем, является ли предмет выбором или конкретным предметом
                    if ('choices' in item) {
                        // Это предмет с выбором - обрабатываем каждый выбор
                        item.choices.forEach(choice => {
                            if (choice.type === "tool") {
                                const selectedTools = draft.chosen.tools?.["background-equipment"] || [];
                                const selectedTool = selectedTools[0] || "dice-set";
                                const itemName = getItemName("tool", selectedTool);
                                const fullName = `${item.quantity && item.quantity > 1 ? item.quantity + 'x ' : ''}${itemName}`;
                                newItems.push(fullName);
                            }
                            // Можно добавить другие типы выборов здесь
                        });
                    } else {
                        // Это конкретный предмет
                        const itemName = getItemName(item.type, item.key);
                        
                        // Если это набор снаряжения, добавляем все предметы из набора
                        if (item.type === "equipment-pack") {
                            const pack = EQUIPMENT_PACKS.find(p => p.key === item.key);
                            if (pack) {
                                pack.items.forEach(packItem => {
                                    const packItemName = getItemName("gear", packItem.key);
                                    const fullName = `${packItem.quantity && packItem.quantity > 1 ? packItem.quantity + 'x ' : ''}${packItemName}`;
                                    newItems.push(fullName);
                                });
                            }
                        } else {
                            // Обычный предмет
                            const fullName = `${item.quantity && item.quantity > 1 ? item.quantity + 'x ' : ''}${itemName}`;
                            newItems.push(fullName);
                        }
                    }
                });
                
                // Добавляем золото предыстории
                if (selectedBackgroundChoiceData.gold && selectedBackgroundChoiceData.gold > 0) {
                    totalGold += selectedBackgroundChoiceData.gold;
                }
            }
        }
        
        // Обновляем инвентарь
        setAddedInventory(prev => [...prev, ...newItems]);
        
        // Добавляем золото к общей валюте
        if (totalGold > 0) {
            const newCurrency = {
                ...currency,
                gold: currency.gold + totalGold
            };
            setCurrency(newCurrency);
            updateCurrencyInDraft(newCurrency);
        }
        
        // Сохраняем в драфт и устанавливаем флаг
        const finalCurrency = totalGold > 0 
            ? { ...currency, gold: currency.gold + totalGold }
            : currency;
        
        setBasics({ 
            equipment: [...addedInventory, ...newItems], 
            gold: currency.gold + totalGold,
            currency: finalCurrency,
            isStartEquipmentAdded: true
        });
    };

    // Сохраняем выбор и переходим далее
    const handleNext = () => {
        // Сохраняем инвентарь в драфт персонажа
        setBasics({ 
            equipment: addedInventory, 
            gold: currency.gold 
        });
        
        nav("/create/summary");
    };

    return (
        <div className="container mx-auto py-10">
            <div className="mx-auto max-w-5xl relative">
                <StepArrows back={`/create/${id}/abilities`} next={`/create/${id}/summary`} />   
                <ExitButton />

                {/* Шапка с именем и аватаркой */}
                <CharacterHeader />
                
                {/* Заголовок в едином стиле */}
                <div className="mb-6">
                    <h1 className="text-base font-bold uppercase tracking-wider text-foreground mb-3 border-l-2 border-primary pl-2">
                        ВЫБОР СНАРЯЖЕНИЯ
                </h1>
                </div>

                <div className="space-y-4">
                    {/* Стартовое снаряжение */}
                    <Collapsible open={openSections.starting} onOpenChange={() => toggleSection('starting')}>
                        <div className="border-2 rounded-t-lg bg-card shadow-inner shadow-sm">
                            <CollapsibleTrigger asChild>
                                <div className={`flex justify-between items-center rounded-t-md p-2 cursor-pointer transition-colors duration-200 ${openSections.starting ? "bg-primary/15 border-b border-primary/30" : "bg-muted/40 hover:bg-primary/10"}`}>
                                    <div className="flex items-center gap-2">
                                        <div className="flex flex-col">
                                            <span className="font-medium">Стартовое снаряжение</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center">
                                        {openSections.starting ? <ChevronUp className="w-6 h-6 text-primary" /> : <ChevronDown className="w-6 h-6 text-primary" />}
                                    </div>
                                </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="p-4 space-y-6">
                                    {/* Классовое стартовое снаряжение */}
                                    <div>
                                        <h3 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wider">
                                            {CLASS_LABELS[draft.basics.class]}: СТАРТОВОЕ СНАРЯЖЕНИЕ
                                        </h3>
                                        
                                        {classEquipmentChoices ? (
                                            <div>
                                                <div className="mb-3 text-sm text-muted-foreground">
                                                    {classEquipmentChoices.description}
                                                </div>
                                                <div className="space-y-3">
                                                    {classEquipmentChoices.choices.map((choice, index) => (
                                                        <div key={index} className="border rounded-lg p-3 bg-muted/30">
                                                            <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="radio"
                                                                    checked={selectedClassChoice === index}
                                                                    onChange={() => setSelectedClassChoice(index)}
                                                                    className="mt-1"
                                                                />
                                                                <div className="flex-1">
                                                                    <div className="font-medium text-sm mb-2">{choice.name}</div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        <div>
                                                                            {choice.items.map((item, itemIndex) => (
                                                                                <span key={itemIndex}>
                                                                                    {item.quantity && item.quantity > 1 ? `${item.quantity}x ` : ''}
                                                                                    {'choices' in item ? 
                                                                                        (item as any).choices.map((choice: any) => {
                                                                                            if (choice.type === "tool") {
                                                                                                return "Игральный набор";
                                                                                            }
                                                                                            return choice.desc || "Выбор";
                                                                                        }).join(', ') :
                                                                                        getItemName(item.type, item.key)
                                                                                    }
                                                                                    {itemIndex < choice.items.length - 1 ? ', ' : ''}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                        {choice.gold && choice.gold > 0 && (
                                                                            <div className="font-medium text-foreground mt-1">
                                                                                + {choice.gold} ЗМ
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                    </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-muted-foreground">
                                                Варианты выбора снаряжения для этого класса не определены
                                            </div>
                                        )}
                                    </div>

                                    {/* Стартовое снаряжение предыстории */}
                                    <div>
                                        <h3 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wider">
                                            {BACKGROUND_LABELS[draft.basics.background]}: СТАРТОВОЕ СНАРЯЖЕНИЕ
                                        </h3>
                                        
                                        {backgroundEquipmentChoices ? (
                                            <div>
                                                <div className="mb-3 text-sm text-muted-foreground">
                                                    {backgroundEquipmentChoices.description}
                                                </div>
                                                <div className="space-y-3">
                                                    {backgroundEquipmentChoices.choices.map((choice, index) => (
                                                        <div key={index} className="border rounded-lg p-3 bg-muted/30">
                                                            <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="radio"
                                                                    checked={selectedBackgroundChoice === index}
                                                                    onChange={() => setSelectedBackgroundChoice(index)}
                                                                    className="mt-1"
                                                                />
                                                                <div className="flex-1">
                                                                    <div className="font-medium text-sm mb-2">{choice.name}</div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        <div>
                                                                            {choice.items.map((item, itemIndex) => (
                                                                                <span key={itemIndex}>
                                                                                    {item.quantity && item.quantity > 1 ? `${item.quantity}x ` : ''}
                                                                                    {'choices' in item ? 
                                                                                        (item as any).choices.map((choice: any) => {
                                                                                            if (choice.type === "tool") {
                                                                                                return "Игральный набор";
                                                                                            }
                                                                                            return choice.desc || "Выбор";
                                                                                        }).join(', ') :
                                                                                        getItemName(item.type, item.key)
                                                                                    }
                                                                                    {itemIndex < choice.items.length - 1 ? ', ' : ''}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                        {/* Селект для предметов с выбором */}
                                                                        {choice.items.some(item => 'choices' in item) && (
                                                                            <div className="mt-2">
                                                                                <ChoiceRenderer
                                                                                    source="background-equipment"
                                                                                    choices={choice.items
                                                                                        .filter(item => 'choices' in item)
                                                                                        .flatMap(item => (item as any).choices)
                                                                                    }
                                                                                    ci={0}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                        {choice.gold && choice.gold > 0 && (
                                                                            <div className="font-medium text-foreground mt-3">
                                                                                + {choice.gold} ЗМ
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                    </label>
                </div>
                                                    ))}
                                                </div>
                    </div>
                ) : (
                                            <div>
                                                <div className="text-sm text-muted-foreground">
                                                    Варианты выбора снаряжения для этой предыстории не определены
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Кнопка добавления стартового инвентаря */}
                                    {(classEquipmentChoices || backgroundEquipmentChoices) && (
                                        <div className="mt-6 pt-4 border-t border-border">
                                            <Button
                                                onClick={addStartingInventory}
                                                disabled={draft.basics.isStartEquipmentAdded}
                                                className="w-full"
                                            >
                                                {draft.basics.isStartEquipmentAdded ? "Стартовый инвентарь добавлен" : "Добавить стартовый инвентарь"}
                                            </Button>
                                            {draft.basics.isStartEquipmentAdded && (
                                                <div className="mt-2 text-xs text-muted-foreground text-center">
                                                    Удалите предметы из инвентаря, чтобы добавить новый набор
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CollapsibleContent>
                        </div>
                    </Collapsible>

                    {/* Текущий инвентарь */}
                    <Collapsible open={openSections.inventory} onOpenChange={() => toggleSection('inventory')}>
                        <div className="border-2 rounded-t-lg bg-card shadow-inner shadow-sm">
                            <CollapsibleTrigger asChild>
                                <div className={`flex justify-between items-center rounded-t-md p-2 cursor-pointer transition-colors duration-200 ${openSections.inventory ? "bg-primary/15 border-b border-primary/30" : "bg-muted/40 hover:bg-primary/10"}`}>
                                    <div className="flex items-center gap-2">
                                        <div className="flex flex-col">
                                            <span className="font-medium">Текущий инвентарь</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {addedInventory.length > 0 && (
                                            <span className="text-xs text-muted-foreground">
                                                Общий вес: <span className={isOverloaded(calculateTotalWeight()) ? 'text-red-500 font-medium' : ''}>{calculateTotalWeight()}/{calculateMaxCarryWeight()}</span> фнт.
                                            </span>
                                        )}
                                        {openSections.inventory ? <ChevronUp className="w-6 h-6 text-primary" /> : <ChevronDown className="w-6 h-6 text-primary" />}
                                    </div>
                                </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="p-4">
                                    {addedInventory.length > 0 ? (
                                        <div className="space-y-2">
                                            {getSortedInventory().map((item, index) => {
                                                // Находим оригинальный индекс в массиве addedInventory
                                                const originalIndex = addedInventory.indexOf(item);
                                                return (
                                                    <EquipmentCard 
                                                        key={`${item}-${originalIndex}`} 
                                                        itemName={item} 
                                                        onRemove={() => removeFromInventory(originalIndex)}
                                                        characterData={draft}
                                                    />
                                                );
                                            })}
                    </div>
                ) : (
                                        <div className="text-sm text-muted-foreground">
                                            Инвентарь пуст. Добавьте стартовое снаряжение выше.
                                        </div>
                                    )}
                                </div>
                            </CollapsibleContent>
                        </div>
                    </Collapsible>

                    {/* Добавить предметы */}
                    <Collapsible open={openSections.addItems} onOpenChange={() => toggleSection('addItems')}>
                        <div className="border-2 rounded-t-lg bg-card shadow-inner shadow-sm">
                            <CollapsibleTrigger asChild>
                                <div className={`flex justify-between items-center rounded-t-md p-2 cursor-pointer transition-colors duration-200 ${openSections.addItems ? "bg-primary/15 border-b border-primary/30" : "bg-muted/40 hover:bg-primary/10"}`}>
                                    <div className="flex items-center gap-2">
                                        <div className="flex flex-col">
                                            <span className="font-medium">Добавить предметы</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center">
                                        {openSections.addItems ? <ChevronUp className="w-6 h-6 text-primary" /> : <ChevronDown className="w-6 h-6 text-primary" />}
                                    </div>
                                </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="p-4">
                                    {/* Фильтры */}
                                    <div className="space-y-4 mb-6">
                                        {/* Поиск по названию */}
                                        <div>
                                            <label className="text-sm font-medium text-foreground mb-2 block">
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
                                                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                        </div>
                                        
                                        {/* Фильтр по категории */}
                                        <div>
                                            <label className="text-sm font-medium text-foreground mb-2 block">
                                                Категория
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => {
                                                        setCategoryFilter('all');
                                                        setItemsPerPage(10);
                                                    }}
                                                    className={`px-3 py-1 rounded-md text-xs transition-colors border shadow-inner ${
                                                        categoryFilter === 'all'
                                                            ? 'bg-[#96bf6b] text-white border-[#96bf6b]'
                                                            : 'bg-transparent text-[#96bf6b] border-[#96bf6b] hover:bg-[#96bf6b] hover:text-white'
                                                    }`}
                                                >
                                                    Все
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setCategoryFilter('Оружие');
                                                        setItemsPerPage(10);
                                                    }}
                                                    className={`px-3 py-1 rounded-md text-xs transition-colors border shadow-inner ${
                                                        categoryFilter === 'Оружие'
                                                            ? 'bg-[#96bf6b] text-white border-[#96bf6b]'
                                                            : 'bg-transparent text-[#96bf6b] border-[#96bf6b] hover:bg-[#96bf6b] hover:text-white'
                                                    }`}
                                                >
                                                    Оружие
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setCategoryFilter('Доспехи');
                                                        setItemsPerPage(10);
                                                    }}
                                                    className={`px-3 py-1 rounded-md text-xs transition-colors border shadow-inner ${
                                                        categoryFilter === 'Доспехи'
                                                            ? 'bg-[#96bf6b] text-white border-[#96bf6b]'
                                                            : 'bg-transparent text-[#96bf6b] border-[#96bf6b] hover:bg-[#96bf6b] hover:text-white'
                                                    }`}
                                                >
                                                    Доспехи
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setCategoryFilter('Снаряжение');
                                                        setItemsPerPage(10);
                                                    }}
                                                    className={`px-3 py-1 rounded-md text-xs transition-colors border shadow-inner ${
                                                        categoryFilter === 'Снаряжение'
                                                            ? 'bg-[#96bf6b] text-white border-[#96bf6b]'
                                                            : 'bg-transparent text-[#96bf6b] border-[#96bf6b] hover:bg-[#96bf6b] hover:text-white'
                                                    }`}
                                                >
                                                    Снаряжение
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setCategoryFilter('Боеприпасы');
                                                        setItemsPerPage(10);
                                                    }}
                                                    className={`px-3 py-1 rounded-md text-xs transition-colors border shadow-inner ${
                                                        categoryFilter === 'Боеприпасы'
                                                            ? 'bg-[#96bf6b] text-white border-[#96bf6b]'
                                                            : 'bg-transparent text-[#96bf6b] border-[#96bf6b] hover:bg-[#96bf6b] hover:text-white'
                                                    }`}
                                                >
                                                    Боеприпасы
                                                </button>
                                            </div>
                                        </div>
                                    </div>


                                    {/* Список предметов */}
                                    <div className="space-y-2">
                                        {getCurrentPageItems().map((item) => {
                                            const quantity = selectedItems[item.key] || 0;
                                            const itemDescription = getItemDescription(item.type, item.key);
                                            
                                            return (
                                                <div
                                                    key={item.key}
                                                    className="border-2 rounded-t-lg bg-card shadow-inner shadow-sm"
                                                >
                                                    <Collapsible>
                                                        <CollapsibleTrigger asChild>
                                                            <div className="flex justify-between items-center p-2 cursor-pointer transition-colors duration-200 rounded-t-md bg-muted/40 hover:bg-primary/10">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium">
                                                                        {item.name}
                                                                    </span>
                                                                    {quantity > 0 && (
                                                                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium">
                                                                            {quantity}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const allItems = getAllItems();
                                                                            const itemData = allItems.find(i => i.key === item.key);
                                                                            if (itemData) {
                                                                                 const costInCopper = convertToCopper(itemData.cost);
                                                                                 const currentTotalGold = calculateTotalGold();
                                                                                 const currentGoldInCopper = currentTotalGold * 100; // Конвертируем ЗМ в ММ
                                                                                 
                                                                                 if (costInCopper <= currentGoldInCopper) {
                                                                                     // Добавляем предмет в инвентарь
                                                                                     setAddedInventory(prev => [...prev, itemData.name]);
                                                                                     
                                                                                     // Вычитаем стоимость из валюты
                                                                                     const newGoldInCopper = currentGoldInCopper - costInCopper;
                                                                                     const newTotalGold = newGoldInCopper / 100;
                                                                                     
                                                                                     // Распределяем по типам монет
                                                                                     const newPlatinum = Math.floor(newTotalGold / 10);
                                                                                     const remainingAfterPlatinum = newTotalGold % 10;
                                                                                     const newGold = Math.floor(remainingAfterPlatinum);
                                                                                     const remainingAfterGold = (remainingAfterPlatinum % 1) * 10;
                                                                                     const newSilver = Math.floor(remainingAfterGold);
                                                                                     const newCopper = Math.round((remainingAfterGold % 1) * 10);
                                                                                     
                                                                                     const newCurrency = {
                                                                                         platinum: newPlatinum,
                                                                                         gold: newGold,
                                                                                         electrum: 0, // Пока не используем электрум
                                                                                         silver: newSilver,
                                                                                         copper: newCopper
                                                                                     };
                                                                                     setCurrency(newCurrency);
                                                                                     
                                                                                     // Сохраняем в драфт
                                                                                     setBasics({
                                                                                         equipment: [...addedInventory, itemData.name],
                                                                                         gold: newTotalGold,
                                                                                         currency: newCurrency
                                                                                     });
                                                                                     
                                                                                     // Показываем уведомление
                                                                                     showNotification(`Предмет "${itemData.name}" успешно куплен`, 'buy');
                                                                                 } else {
                                                                                     showNotification('Недостаточно средств для покупки', 'error');
                                                                                 }
                                                                            }
                                                                        }}
                                                                        className="px-1.5 py-0.5 bg-[#96bf6b] text-primary-foreground text-[10px] rounded transition-colors shadow-inner"
                                                                    >
                                                                        КУПИТЬ
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const allItems = getAllItems();
                                                                            const itemData = allItems.find(i => i.key === item.key);
                                                                             if (itemData) {
                                                                                 // Добавляем предмет в инвентарь без трат
                                                                                 setAddedInventory(prev => [...prev, itemData.name]);
                                                                                 
                                                                                 // Сохраняем в драфт
                                                                                 setBasics({
                                                                                     equipment: [...addedInventory, itemData.name],
                                                                                     gold: currency.gold,
                                                                                     currency: currency
                                                                                 });
                                                                                 
                                                                                 // Показываем уведомление
                                                                                 showNotification(`Предмет "${itemData.name}" успешно добавлен`, 'add');
                                                                             }
                                                                        }}
                                                                        className="px-1.5 py-0.5 bg-gray-600 text-white text-[10px] rounded transition-colors shadow-inner"
                                                                    >
                                                                        ДОБАВИТЬ
                                                                    </button>
                                                                    <ChevronDown className="w-6 h-6 text-primary" />
                                                                </div>
                                                            </div>
                                                        </CollapsibleTrigger>
                                                        <CollapsibleContent>
                                                            <div className="p-2 text-xs text-muted-foreground">
                                                                {/* Категория в самом верху */}
                                                                <div className="text-muted-foreground mb-2">
                                                                    <span className="font-medium text-foreground"></span> {itemDescription.category}
                                                                </div>
                                                                
                                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                                    {/* Для оружия показываем специальные параметры */}
                                                                    {itemDescription.attackType ? (
                                                                        <>
                                                                            <div className="text-muted-foreground">
                                                                                <span className="font-medium text-foreground">Владение:</span> {itemDescription.hasProficiency ? 'Да' : 'Нет'}
                                                                            </div>
                                                                            <div className="text-muted-foreground">
                                                                                <span className="font-medium text-foreground">Дальность:</span> {itemDescription.attackRange}
                                                                            </div>
                                                                            <div className="text-muted-foreground">
                                                                                <span className="font-medium text-foreground">Урон:</span> {itemDescription.damage}
                                                                            </div>
                                                                            <div className="text-muted-foreground">
                                                                                <span className="font-medium text-foreground">Тип урона:</span> {translateDamageType(itemDescription.damageType)}
                                                                            </div>
                                                                            <div className="text-muted-foreground">
                                                                                <span className="font-medium text-foreground">Вес:</span> {itemDescription.weight} фнт.
                                                                            </div>
                                                                            <div className="text-muted-foreground">
                                                                                <span className="font-medium text-foreground">Стоимость:</span> {itemDescription.cost}
                                                                            </div>
                                                                            {itemDescription.properties && itemDescription.properties.length > 0 && (
                                                                            <div className="text-muted-foreground">
                                                                                <span className="font-medium text-foreground">Свойства:</span> {itemDescription.properties.join(', ')}
                                                                            </div>
                                                                            )}
                                                                            <div className="text-muted-foreground">
                                                                                <span className="font-medium text-foreground">Мастерство:</span> {getWeaponMasteryByKey(itemDescription.mastery)?.name || itemDescription.mastery}
                                                                            </div>
                                                                        </>
                                                                    ) : itemDescription.armorCategory ? (
                                                                        /* Для доспеха показываем специальные параметры */
                                                                        <>
                                                                            <div className="text-muted-foreground">
                                                                                <span className="font-medium text-foreground">Владение:</span> {itemDescription.hasProficiency ? 'Да' : 'Нет'}
                                                                            </div>
                                                                            <div className="text-muted-foreground">
                                                                                <span className="font-medium text-foreground">Класс брони:</span> {itemDescription.ac}
                                                                            </div>
                                                                            <div className="text-muted-foreground">
                                                                                <span className="font-medium text-foreground">Вес:</span> {itemDescription.weight} фнт.
                                                                            </div>
                                                                            <div className="text-muted-foreground">
                                                                                <span className="font-medium text-foreground">Стоимость:</span> {itemDescription.cost}
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        /* Для других предметов показываем вес и стоимость, или utilize и ability для инструментов */
                                                                        <>
                                                                            {itemDescription.utilize && itemDescription.ability ? (
                                                                                /* Для инструментов показываем применение и характеристику */
                                                                                <>
                                                                                    <div className="text-muted-foreground">
                                                                                        <span className="font-medium text-foreground">Характеристика:</span> {translateAbility(itemDescription.ability)}
                                                                                    </div>
                                                                                    <div className="text-muted-foreground">
                                                                                        <span className="font-medium text-foreground">Применение:</span> {itemDescription.utilize}
                                                                                    </div>
                                                                                    <div className="text-muted-foreground">
                                                                                        <span className="font-medium text-foreground">Стоимость:</span> {itemDescription.cost}
                                                                                    </div>
                                                                                </>
                                                                            ) : (
                                                                                /* Для других предметов показываем вес и стоимость */
                                                                                <>
                                                                                    {itemDescription.hasWeight && (
                                                                                        <div className="text-muted-foreground">
                                                                                            <span className="font-medium text-foreground">Вес:</span> {itemDescription.weight} фнт.
                                                                                        </div>
                                                                                    )}
                                                                                    <div className="text-muted-foreground">
                                                                                        <span className="font-medium text-foreground">Стоимость:</span> {itemDescription.cost}
                                                                                    </div>
                                                                                </>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                </div>
                                                                
                                                                {/* Описание вынесено отдельно */}
                                                                {!itemDescription.attackType && !itemDescription.armorCategory && (
                                                                    <div className="pb-2">
                                                                        <div className="text-xs text-muted-foreground leading-relaxed mt-2">
                                                                            {itemDescription.description}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </CollapsibleContent>
                                                    </Collapsible>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    
                                    {/* Кнопка "Показать больше" */}
                                    {hasMoreItems() && (
                                        <div className="mt-4">
                                            <button
                                                onClick={() => setItemsPerPage(prev => prev + 10)}
                                                className="w-full px-4 py-2 bg-[#96bf6b] text-white rounded-md transition-colors text-sm font-medium uppercase tracking-wide shadow-inner"
                                            >
                                                Показать больше
                                            </button>
                                        </div>
                                    )}
                                    
                                    {getFilteredItems().length === 0 && (
                                        <div className="text-center text-muted-foreground py-8">
                                            Предметы не найдены
                                        </div>
                                    )}
                                </div>
                            </CollapsibleContent>
                        </div>
                    </Collapsible>

                     {/* Валюта */}
                     <Collapsible open={openSections.currency} onOpenChange={() => toggleSection('currency')}>
                         <div className="border-2 rounded-t-lg bg-card shadow-inner shadow-sm">
                             <CollapsibleTrigger asChild>
                                 <div className={`flex justify-between items-center rounded-t-md p-2 cursor-pointer transition-colors duration-200 ${openSections.currency ? "bg-primary/15 border-b border-primary/30" : "bg-muted/40 hover:bg-primary/10"}`}>
                                     <div className="flex items-center gap-2">
                                         <div className="flex flex-col">
                                             <span className="font-medium">Валюта</span>
                                         </div>
                                     </div>
                                     <div className="flex items-center gap-2">
                                         <span className="text-xs text-muted-foreground">
                                             Всего в ЗМ: {calculateTotalGold().toFixed(2)}
                                         </span>
                                         {openSections.currency ? <ChevronUp className="w-6 h-6 text-primary" /> : <ChevronDown className="w-6 h-6 text-primary" />}
                                     </div>
                                 </div>
                             </CollapsibleTrigger>
                             <CollapsibleContent>
                                 <div className="p-4">
                                     <div className="space-y-2">
                                         {/* Платина */}
                                         <div className="border-2 rounded-t-lg bg-card shadow-inner shadow-sm">
                                             <div className="flex justify-between items-center p-2 rounded-t-md bg-muted/40">
                                                 <div className="flex items-center gap-2">
                                                     <span className="font-medium">Платина (ПМ)</span>
                                                     <span className="text-xs text-muted-foreground">= 10 ЗМ</span>
                                                 </div>
                        <input
                            type="number"
                            min={0}
                                                     className="w-16 rounded border bg-background px-1.5 py-0.5 text-xs outline-none focus:border-primary shadow-inner text-center"
                                                     value={currency.platinum}
                                                     onChange={(e) => {
                                                         const inputValue = e.target.value;
                                                         // Убираем ведущие нули и проверяем на валидность
                                                         const cleanValue = inputValue.replace(/^0+/, '') || '0';
                                                         const value = cleanValue === '' ? 0 : Number(cleanValue);
                                                         const newCurrency = { ...currency, platinum: value };
                                                         setCurrency(newCurrency);
                                                         updateCurrencyInDraft(newCurrency);
                                                     }}
                                                 />
                    </div>
                                         </div>

                                         {/* Золото */}
                                         <div className="border-2 rounded-t-lg bg-card shadow-inner shadow-sm">
                                             <div className="flex justify-between items-center p-2 rounded-t-md bg-muted/40">
                                                 <div className="flex items-center gap-2">
                                                     <span className="font-medium">Золото (ЗМ)</span>
                                                     <span className="text-xs text-muted-foreground">= 10 СМ</span>
            </div>
                                                 <input
                                                     type="number"
                                                     min={0}
                                                     className="w-16 rounded border bg-background px-1.5 py-0.5 text-xs outline-none focus:border-primary shadow-inner text-center"
                                                     value={currency.gold}
                                                     onChange={(e) => {
                                                         const inputValue = e.target.value;
                                                         // Убираем ведущие нули и проверяем на валидность
                                                         const cleanValue = inputValue.replace(/^0+/, '') || '0';
                                                         const value = cleanValue === '' ? 0 : Number(cleanValue);
                                                         const newCurrency = { ...currency, gold: value };
                                                         setCurrency(newCurrency);
                                                         updateCurrencyInDraft(newCurrency);
                                                     }}
                                                 />
                                             </div>
                                         </div>

                                         {/* Электрум */}
                                         <div className="border-2 rounded-t-lg bg-card shadow-inner shadow-sm">
                                             <div className="flex justify-between items-center p-2 rounded-t-md bg-muted/40">
                                                 <div className="flex items-center gap-2">
                                                     <span className="font-medium">Электрум (ЭМ)</span>
                                                     <span className="text-xs text-muted-foreground">= 5 СМ</span>
                                                 </div>
                                                 <input
                                                     type="number"
                                                     min={0}
                                                     className="w-16 rounded border bg-background px-1.5 py-0.5 text-xs outline-none focus:border-primary shadow-inner text-center"
                                                     value={currency.electrum}
                                                     onChange={(e) => {
                                                         const inputValue = e.target.value;
                                                         // Убираем ведущие нули и проверяем на валидность
                                                         const cleanValue = inputValue.replace(/^0+/, '') || '0';
                                                         const value = cleanValue === '' ? 0 : Number(cleanValue);
                                                         const newCurrency = { ...currency, electrum: value };
                                                         setCurrency(newCurrency);
                                                         updateCurrencyInDraft(newCurrency);
                                                     }}
                                                 />
                                             </div>
                                         </div>

                                         {/* Серебро */}
                                         <div className="border-2 rounded-t-lg bg-card shadow-inner shadow-sm">
                                             <div className="flex justify-between items-center p-2 rounded-t-md bg-muted/40">
                                                 <div className="flex items-center gap-2">
                                                     <span className="font-medium">Серебро (СМ)</span>
                                                     <span className="text-xs text-muted-foreground">= 10 ММ</span>
                                                 </div>
                                                 <input
                                                     type="number"
                                                     min={0}
                                                     className="w-16 rounded border bg-background px-1.5 py-0.5 text-xs outline-none focus:border-primary shadow-inner text-center"
                                                     value={currency.silver}
                                                     onChange={(e) => {
                                                         const inputValue = e.target.value;
                                                         // Убираем ведущие нули и проверяем на валидность
                                                         const cleanValue = inputValue.replace(/^0+/, '') || '0';
                                                         const value = cleanValue === '' ? 0 : Number(cleanValue);
                                                         const newCurrency = { ...currency, silver: value };
                                                         setCurrency(newCurrency);
                                                         updateCurrencyInDraft(newCurrency);
                                                     }}
                                                 />
                                             </div>
                                         </div>

                                         {/* Медь */}
                                         <div className="border-2 rounded-t-lg bg-card shadow-inner shadow-sm">
                                             <div className="flex justify-between items-center p-2 rounded-t-md bg-muted/40">
                                                 <div className="flex items-center gap-2">
                                                     <span className="font-medium">Медь (ММ)</span>
                                                 </div>
                                                 <input
                                                     type="number"
                                                     min={0}
                                                     className="w-16 rounded border bg-background px-1.5 py-0.5 text-xs outline-none focus:border-primary shadow-inner text-center"
                                                     value={currency.copper}
                                                     onChange={(e) => {
                                                         const inputValue = e.target.value;
                                                         // Убираем ведущие нули и проверяем на валидность
                                                         const cleanValue = inputValue.replace(/^0+/, '') || '0';
                                                         const value = cleanValue === '' ? 0 : Number(cleanValue);
                                                         const newCurrency = { ...currency, copper: value };
                                                         setCurrency(newCurrency);
                                                         updateCurrencyInDraft(newCurrency);
                                                     }}
                                                 />
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                             </CollapsibleContent>
                         </div>
                     </Collapsible>
                     </div>
                    </div>
             
             {/* Уведомление */}
             {notification && (
                 <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
                     <div className={`px-4 py-2 rounded-md text-white font-medium shadow-lg transition-all duration-300 ${
                         notification.type === 'buy' 
                             ? 'bg-[#96bf6b]' 
                             : notification.type === 'add'
                             ? 'bg-gray-600'
                             : 'bg-red-500'
                     }`}>
                         {notification.message}
            </div>
                 </div>
             )}
        </div>
    );
}
