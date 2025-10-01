import type { Proficiency } from "@/data/proficiencies";
import type { ChoiceOption } from "@/data/shared/choices";
import type { SOURCES } from "@/data/sources";
import type { Weapon } from "@/data/items/weapons";
import type { Armor } from "@/data/items/armors";
import type { Gear } from "@/data/items/gear";
import type { EquipmentPack } from "@/data/items/equipment-packs";

export type SourceKey = keyof typeof SOURCES;

// Типы для экипировки класса
export type EquipmentItem = {
    type: "weapon" | "armor" | "gear" | "equipment-pack";
    key: string;
    quantity?: number;
};

export type EquipmentOption = {
    name: string;
    items: EquipmentItem[];
    description?: string;
};

// Типы для выбора между комплектами экипировки
export type EquipmentChoice = {
    name: string;
    items: EquipmentItem[];
    gold?: number; // Дополнительное золото к комплекту
};

export type EquipmentChoices = {
    name: string;
    description?: string;
    choices: EquipmentChoice[];
};
export type Feature = {
    name: string;
    desc: string;
    choices?: ChoiceOption[];
    spells?: string[];              // Заклинания от класса
    preparedSpells?: ClassSpell[];   
    bonus?: Bonus[]; 
    source?: string
};
export type Bonus = {
    key: string;
    value: string;
}


export type SubclassInfo = {
    key: string;
    source: SourceKey; 
    isLegacy?: boolean;
    name?: string,
    nameEn?: string,
    desc: string;
    features?: Record<number, Feature[]>;          
};

export interface ClassInfo {
    bg?: string; // ссылка на фон карточки класса
    key: string; // ключ класса на английском
    source: SourceKey;           // Источник (например: "PHB", "XGE")
    isLegacy?: boolean;
    name: string;                // название класса на русском
    nameEn?: string;             // название класса на английском
    desc: string;                // короткое описание класса
    longDesc?: string;           // расширенное описание
    hitDice: number;             // кость хитов
    mainStats: string[];         // основные характеристики класса
    proficiencies?: Proficiency[];   // Владение (например: [{ type: "skill", name: "Атлетика" }])
    choices?: ChoiceOption[];        // Если необходимо добавить выбор владением
    subclasses: SubclassInfo[]; // доступные подклассы
    features: Record<number, Feature[]>;
    spellcasting?: SpellcastingInfo;
    equipment?: EquipmentOption[];   // Стартовая экипировка класса (фиксированная)
    equipmentChoices?: EquipmentChoices[]; // Выборы между комплектами экипировки
}

export interface SpellcastingInfo {
    ability: "int" | "wis" | "cha"; // основная характеристика
    progression: Record<number, SpellcastingLevel>; // данные по уровням
}

export interface SpellcastingLevel {
    slots: number[];  // массив по уровням заклинаний [1,2,3,...]
    prepared?: string; // формула для подготовленных (например "paladinLevel + CHA")
    known?: number;    // если у класса фиксированное число известных
}

export type ClassSpell = {
    level: number;              // уровень персонажа, с которого доступно заклинание
    spells?: string[];          // список ключей заклинаний (для innate)
    desc?: string;              // пояснение
};