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
        .replace(/gp/g, 'ЗМ')
        .replace(/sp/g, 'СМ')
        .replace(/cp/g, 'ММ');
};

// Функция для перевода мастерства оружия на русский
const translateWeaponMastery = (mastery: string): string => {
    const translations: Record<string, string> = {
        'sap': 'Оглушение',
        'slow': 'Замедление',
        'topple': 'Опрокидывание',
        'vex': 'Раздражение',
        'nick': 'Зарубка',
        'graze': 'Задевание',
        'cleave': 'Рассечение',
        'push': 'Отталкивание'
    };
    return translations[mastery] || mastery;
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
            return {
                description: `Доспех. Класс брони: ${armor.baseAC}`,
                cost: translateCurrency(armor.cost),
                weight: armor.weight,
                category: 'Доспех',
                ac: armor.baseAC,
                maxDex: armor.maxDexBonus,
                stealth: armor.disadvantageStealth
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
        <div className="border-2 rounded-lg bg-card">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger asChild>
                    <div className={`flex justify-between items-center p-2 cursor-pointer transition-colors duration-200 ${isOpen ? "bg-primary/15 border-b border-primary/30" : "bg-muted/40 hover:bg-primary/10"}`}>
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
                        <div className="mb-2">
                            {itemInfo.description}
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
                                        <span className="font-medium text-foreground">Мастерство:</span>  {translateWeaponMastery(itemInfo.mastery)}
                                    </div>
                                </>
                            ) : (
                                /* Для других предметов показываем стандартные параметры */
                                <>
                                    <div className="text-muted-foreground">
                                        <span className="font-medium text-foreground">Категория:</span> {itemInfo.category}
                                    </div>
                                    <div className="text-muted-foreground">
                                        <span className="font-medium text-foreground">Стоимость:</span> {itemInfo.cost}
                                    </div>
                                    <div className="text-muted-foreground">
                                        <span className="font-medium text-foreground">Вес:</span> {itemInfo.weight} фнт.
                                    </div>
                                    
                                    {/* Дополнительные параметры для доспеха */}
                                    {itemInfo.ac && (
                                        <div className="text-muted-foreground">
                                            <span className="font-medium text-foreground">КБ:</span> {itemInfo.ac}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        
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

// Снаряжение по умолчанию для каждого класса (адаптировано по PHB)
const DEFAULT_EQUIPMENT: Record<string, string[]> = {
    Варвар: [
        "Большой топор или любое другое простое оружие",
        "Два ручных топора или любое другое простое оружие ближнего боя",
        "Пакет путешественника и четыре метательных копья",
    ],
    Бард: [
        "Рапира, длинный меч или любое простое оружие",
        "Дипломатический пакет, развлекательный пакет или пакет путешественника",
        "Лютня или другой музыкальный инструмент",
        "Кожаный доспех и кинжал",
    ],
    Воин: [
        "Кольчуга или кожаный доспех, длинный лук и 20 стрел",
        "Боевой топор или любое простое оружие ближнего боя",
        "Щит или любое другое простое оружие",
        "Пакет доспеха или пакет путешественника",
    ],
    Волшебник: [
        "Посох или кинжал",
        "Пакет учёного или пакет путешественника",
        "Книга заклинаний",
    ],
    Друид: [
        "Деревянный щит или любое простое оружие",
        "Серп или любое простое оружие ближнего боя",
        "Пакет учёного или пакет путешественника",
        "Кожаный доспех, дубинка и набор травника",
    ],
    Жрец: [
        "Булава или военное оружие по выбору",
        "Щит или доспех по выбору",
        "Пакет жреца или пакет путешественника",
        "Священный символ",
        "Кольчуга",
    ],
    Колдун: [
        "Лёгкий арбалет и 20 болтов или любое простое оружие",
        "Компонентная сумка или фокус для заклинаний",
        "Пакет учёного или пакет путешественника",
        "Кожаный доспех, кинжал и два простых оружия",
    ],
    Монах: [
        "Короткий меч или любое простое оружие",
        "Пакет путешественника или пакет доспеха",
        "10 дротиков",
    ],
    Паладин: [
        "Военное оружие и щит или два военных оружия",
        "Пять метательных копий или любое простое оружие ближнего боя",
        "Пакет жреца или пакет путешественника",
        "Кольчуга и священный символ",
    ],
    Плут: [
        "Рапира или короткий меч",
        "Коротк��й лук и 20 стрел или короткий меч",
        "Пакет вора, дипломатический пакет или пакет путешественника",
        "Кожаный доспех, два кинжала и набор воровских инструментов",
    ],
    Следопыт: [
        "Частичный доспех или кожаный доспех",
        "Два меча или два простых оружия ближнего боя",
        "Длинный лук и колчан с 20 стрелами",
        "Пакет путешественника или пакет доспеха",
    ],
    Чародей: [
        "Лёгкий арбалет и 20 болтов или любое простое оружие",
        "Компонентная сумка или фокус для заклинаний",
        "Пакет учёного или пакет путешественника",
        "Два кинжала",
    ],
};

const DEFAULT_GOLD: Record<string, number> = {
    Варвар: 40,
    Бард: 100,
    Воин: 100,
    Волшебник: 80,
    Друид: 20,
    Жрец: 125,
    Колдун: 100,
    Монах: 5,
    Паладин: 100,
    Плут: 160,
    Следопыт: 100,
    Чародей: 120,
};


export default function EquipmentPick() {
    const { id } = useParams<{ id: string }>(); 
    const nav = useNavigate();
    const { draft, setBasics } = useCharacter();
    const [selectedClassChoice, setSelectedClassChoice] = useState<number>(0);
    const [backgroundMode, setBackgroundMode] = useState<"equipment" | "gold">("equipment");
    const [gold, setGold] = useState(DEFAULT_GOLD[draft.basics.class] || 50);
    const [addedInventory, setAddedInventory] = useState<string[]>([]);
    const [openSections, setOpenSections] = useState({
        starting: true,
        inventory: false,
        addItems: false,
        currency: false
    });

    // Загружаем инвентарь из драфта при инициализации
    useEffect(() => {
        if (draft.basics.equipment && draft.basics.equipment.length > 0) {
            setAddedInventory(draft.basics.equipment);
        }
        if (draft.basics.gold) {
            setGold(draft.basics.gold);
        }
    }, [draft.basics.equipment, draft.basics.gold]);

    // Получаем данные класса
    const classInfo = getClassByKey(draft.basics.class);
    const classEquipmentChoices = classInfo?.equipmentChoices?.[0];

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Функция для удаления предмета из инвентаря
    const removeFromInventory = (index: number) => {
        setAddedInventory(prev => {
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
                    setGold(prev => prev + selectedChoice.gold);
                }
                
                // Сохраняем в драфт и устанавливаем флаг
                setBasics({ 
                    equipment: [...addedInventory, ...newItems], 
                    gold: gold + (selectedChoice.gold || 0),
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
                        <div className="border rounded-lg bg-card">
                            <CollapsibleTrigger asChild>
                                <div className={`flex justify-between items-center p-2 cursor-pointer transition-colors duration-200 ${openSections.starting ? "bg-primary/15 border-b border-primary/30" : "bg-muted/40 hover:bg-primary/10"}`}>
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
                        <div className="border rounded-lg bg-card">
                            <CollapsibleTrigger asChild>
                                <div className={`flex justify-between items-center p-2 cursor-pointer transition-colors duration-200 ${openSections.inventory ? "bg-primary/15 border-b border-primary/30" : "bg-muted/40 hover:bg-primary/10"}`}>
                                    <div className="flex items-center gap-2">
                                        <div className="flex flex-col">
                                            <span className="font-medium">Текущий инвентарь</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center">
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
                        <div className="border rounded-lg bg-card">
                            <CollapsibleTrigger asChild>
                                <div className={`flex justify-between items-center p-2 cursor-pointer transition-colors duration-200 ${openSections.addItems ? "bg-primary/15 border-b border-primary/30" : "bg-muted/40 hover:bg-primary/10"}`}>
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
                                    <div className="text-sm text-muted-foreground">
                                        Здесь будет интерфейс для добавления предметов в инвентарь
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </div>
                    </Collapsible>

                    {/* Валюта */}
                    <Collapsible open={openSections.currency} onOpenChange={() => toggleSection('currency')}>
                        <div className="border rounded-lg bg-card">
                            <CollapsibleTrigger asChild>
                                <div className={`flex justify-between items-center p-2 cursor-pointer transition-colors duration-200 ${openSections.currency ? "bg-primary/15 border-b border-primary/30" : "bg-muted/40 hover:bg-primary/10"}`}>
                                    <div className="flex items-center gap-2">
                                        <div className="flex flex-col">
                                            <span className="font-medium">Валюта</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center">
                                        {openSections.currency ? <ChevronUp className="w-6 h-6 text-primary" /> : <ChevronDown className="w-6 h-6 text-primary" />}
                                    </div>
                                </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="p-4">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block mb-2 font-medium">Золотые монеты (зм)</label>
                        <input
                            type="number"
                            min={0}
                            className="w-32 rounded-md border bg-background px-3 py-2 outline-none focus:border-primary"
                            value={gold}
                            onChange={(e) => setGold(Number(e.target.value))}
                        />
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Другие валюты будут добавлены позже
                                        </div>
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </div>
                    </Collapsible>
                    </div>
            </div>
        </div>
    );
}
