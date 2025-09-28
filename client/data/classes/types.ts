import type { Proficiency } from "@/data/proficiencies";
import type { ChoiceOption } from "@/data/shared/choices";
import type { SOURCES } from "@/data/sources";

export type SourceKey = keyof typeof SOURCES;
export type Feature = {
    name: string;
    desc: string;
    choices?: ChoiceOption[];
    spells?: string[];              // Заклинания от класса
    source?: string
};


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