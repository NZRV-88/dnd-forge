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
import { BACKGROUND_LABELS } from "@/data/backgrounds";
import { Gears, Ammunitions } from "@/data/items/gear";
import { Weapons } from "@/data/items/weapons";
import { Armors } from "@/data/items/armors";
import { EQUIPMENT_PACKS } from "@/data/items/equipment-packs";
import { getAllCharacterData } from "@/utils/getAllCharacterData";
import { getWeaponMasteryByKey } from "@/data/items";

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
    itemName: string; 
    onRemove: () => void;
    characterData?: any;
}) => {
    const [isOpen, setIsOpen] = useStateReact(false);
    
    // Получаем полные данные персонажа для расчета модификаторов
    const characterDataFull = characterData ? getAllCharacterData(characterData) : null;
    
    // Извлекаем количество и название предмета
    const match = itemName.match(/^(\d+x\s+)?(.+)$/);
    const quantity = match?.[1]?.trim() || '';
    const name = match?.[2] || itemName;
    
    // Ищем описание предмета
    const getItemDescription = (itemName: string) => {
        // Убираем количество для поиска
        const cleanName = itemName.replace(/^\d+x\s+/, '');
        
        // Ищем в разных массивах
        let item = Gears.find(g => g.name === cleanName);
        if (item) {
            return {
                description: item.desc,
                cost: translateCurrency(item.cost),
                weight: item.weight,
                category: 'Снаряжение'
            };
        }
        
        item = Ammunitions.find(a => a.name === cleanName);
        if (item) {
            return {
                description: item.desc,
                cost: translateCurrency(item.cost),
                weight: item.weight,
                category: 'Боеприпасы'
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
                weight: weapon.weight,
                category: getWeaponCategory(weapon),
                attackType: attackType,
                attackRange: attackRange,
                properties: translateWeaponProperties(weapon.properties),
                damage: damageWithBonus,
                damageType: weapon.damageType,
                range: weapon.range,
                hasProficiency: hasProficiency,
                abilityName: abilityName,
                mastery: weapon.mastery
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
                weight: armor.weight,
                category: armorCategory,
                ac: armor.baseAC,
                maxDex: armor.maxDexBonus,
                stealth: armor.disadvantageStealth,
                armorCategory: armorCategory,
                hasProficiency: true // TODO: проверить владение доспехом персонажа
            };
        }
        
        const pack = EQUIPMENT_PACKS.find(p => p.name === cleanName);
        if (pack) {
            return {
                description: pack.description,
                cost: translateCurrency(pack.cost),
                weight: pack.weight,
                category: 'Набор снаряжения'
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
                        </div>
                        <div className="flex items-center justify-center">
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
                                /* Для других предметов показываем только вес и стоимость */
                                <>
                                    <div className="text-muted-foreground">
                                        <span className="font-medium text-foreground">Вес:</span> {itemInfo.weight} фнт.
                                    </div>
                                    <div className="text-muted-foreground">
                                        <span className="font-medium text-foreground">Стоимость:</span> {itemInfo.cost}
                                    </div>
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
    const { draft, setBasics } = useCharacter();
    const [selectedClassChoice, setSelectedClassChoice] = useState<number>(0);
    const [backgroundMode, setBackgroundMode] = useState<"equipment" | "gold">("equipment");
    const [gold, setGold] = useState(0);
    const [currency, setCurrency] = useState({
        platinum: 0,  // Платина
        gold: 0,      // Золото
        electrum: 0,  // Электрум
        silver: 0,    // Серебро
        copper: 0     // Медь
    });
    const [addedInventory, setAddedInventory] = useState<string[]>([]);
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
        if (draft.basics.gold) {
            setGold(draft.basics.gold);
        }
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

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Функция для получения веса предмета
    const getItemWeight = (itemName: string) => {
        const cleanName = itemName.replace(/^\d+x\s+/, '');
        
        // Ищем в разных массивах
        let item = Gears.find(g => g.name === cleanName);
        if (item) return item.weight;
        
        item = Ammunitions.find(a => a.name === cleanName);
        if (item) return item.weight;
        
        const weapon = Weapons.find(w => w.name === cleanName);
        if (weapon) return weapon.weight;
        
        const armor = Armors.find(a => a.name === cleanName);
        if (armor) return armor.weight;
        
        const pack = EQUIPMENT_PACKS.find(p => p.name === cleanName);
        if (pack) return pack.weight;
        
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
                    weight: weapon.weight,
                    category: getWeaponCategory(weapon),
                    attackType: attackType,
                    attackRange: attackRange,
                    properties: translateWeaponProperties(weapon.properties),
                    damage: damageWithBonus,
                    damageType: weapon.damageType,
                    range: weapon.range,
                    hasProficiency: hasProficiency,
                    abilityName: abilityName,
                    mastery: weapon.mastery
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
                    weight: armor.weight,
                    category: armorCategory,
                    ac: armor.baseAC,
                    maxDex: armor.maxDexBonus,
                    stealth: armor.disadvantageStealth,
                    armorCategory: armorCategory,
                    hasProficiency: true // TODO: проверить владение доспехом персонажа
                };
            }
        } else if (type === 'gear') {
            const gear = Gears.find(g => g.key === key);
            if (gear) {
                return {
                    description: gear.desc,
                    cost: translateCurrency(gear.cost),
                    weight: gear.weight,
                    category: 'Снаряжение'
                };
            }
        } else if (type === 'ammunition') {
            const ammo = Ammunitions.find(a => a.key === key);
            if (ammo) {
                return {
                    description: ammo.desc,
                    cost: translateCurrency(ammo.cost),
                    weight: ammo.weight,
                    category: 'Боеприпасы'
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
        if (classEquipmentChoices) {
            const selectedChoice = classEquipmentChoices.choices[selectedClassChoice];
            if (selectedChoice) {
                const newItems: string[] = [];
                selectedChoice.items.forEach(item => {
                    const itemName = getItemName(item.type, item.key);
                    
                    // Если это набор снаряжения, добавляем все предметы из набора
                    if (item.type === "equipment-pack") {
                        const pack = EQUIPMENT_PACKS.find(p => p.key === item.key);
                        if (pack) {
                            pack.items.forEach(packItem => {
                                const packItemName = getItemName("gear", packItem.key);
                                const fullName = `${packItem.quantity ? packItem.quantity + 'x ' : ''}${packItemName}`;
                                newItems.push(fullName);
                            });
                        }
                    } else {
                        // Обычный предмет
                        const fullName = `${item.quantity ? item.quantity + 'x ' : ''}${itemName}`;
                        newItems.push(fullName);
                    }
                });
                setAddedInventory(prev => [...prev, ...newItems]);
                
                 // Добавляем золото к общему золоту
                 if (selectedChoice.gold && selectedChoice.gold > 0) {
                     setCurrency(prev => ({
                         ...prev,
                         gold: prev.gold + selectedChoice.gold
                     }));
                 }
                
                 // Сохраняем в драфт и устанавливаем флаг
                 setBasics({ 
                     equipment: [...addedInventory, ...newItems], 
                     gold: gold + (selectedChoice.gold || 0),
                     currency: currency,
                     isStartEquipmentAdded: true
                 });
            }
        }
    };

    // Сохраняем выбор и переходим далее
    const handleNext = () => {
        let totalGold = gold; // Используем текущее золото
        let equipment: string[] = [...addedInventory]; // Используем добавленный инвентарь

        // Снаряжение предыстории
        if (backgroundMode === "equipment") {
            // Пока что добавляем заглушку для снаряжения предыстории
            // equipment = [...equipment, ...(BACKGROUND_EQUIPMENT[draft.basics.background] || [])];
        } else {
            totalGold += 50; // Золото за предысторию
        }

        // Сохраняем инвентарь в драфт персонажа
        setBasics({ 
            equipment, 
            gold: totalGold 
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
                                                                                    {item.quantity ? `${item.quantity}x ` : ''}{getItemName(item.type, item.key)}
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
                                        <div className="mb-3 space-y-2">
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                                                    checked={backgroundMode === "equipment"}
                                                    onChange={() => setBackgroundMode("equipment")}
                        />
                                                Снаряжение предыстории
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                                                    checked={backgroundMode === "gold"}
                                                    onChange={() => setBackgroundMode("gold")}
                        />
                                                Золотые монеты (50 ЗМ)
                    </label>
                </div>
                                        {backgroundMode === "equipment" ? (
                                            <div>
                                                <div className="text-sm text-muted-foreground">
                                                    Снаряжение предыстории будет добавлено позже
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="text-sm text-muted-foreground">
                                                    Вместо снаряжения предыстории вы получите 50 золотых монет
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Кнопка добавления стартового инвентаря */}
                                    {classEquipmentChoices && (
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
                                                Общий вес: {calculateTotalWeight()} фнт.
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
                                            {addedInventory.map((item, index) => (
                                                <EquipmentCard 
                                                    key={index} 
                                                    itemName={item} 
                                                    onRemove={() => removeFromInventory(index)}
                                                    characterData={draft}
                                                />
                                            ))}
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
                                                                                     gold: gold,
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
                                                                        /* Для других предметов показываем только вес и стоимость */
                                                                        <>
                                                                            <div className="text-muted-foreground">
                                                                                <span className="font-medium text-foreground">Вес:</span> {itemDescription.weight} фнт.
                                                                            </div>
                                                                            <div className="text-muted-foreground">
                                                                                <span className="font-medium text-foreground">Стоимость:</span> {itemDescription.cost}
                                                                            </div>
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
