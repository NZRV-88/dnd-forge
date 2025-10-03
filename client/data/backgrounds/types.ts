import type { Proficiency } from "@/data/proficiencies";
import type { SOURCES } from "@/data/sources";
import type { ChoiceOption } from "@/data/shared/choices";
import type { Weapon } from "@/data/items/weapons";
import type { Armor } from "@/data/items/armors";
import type { Gear } from "@/data/items/gear";
import type { Tool } from "@/data/items/tools";
import type { EquipmentPack } from "@/data/items/equipment-packs";

export type SourceKey = keyof typeof SOURCES;

// Типы для экипировки предыстории
export type BackgroundEquipmentItem = 
    | {
        type: "weapon" | "armor" | "gear" | "ammunition" | "tool" | "equipment-pack";
        key: string;
        quantity?: number;
    }
    | {
        choices: ChoiceOption[];
        quantity?: number;
    };

export type BackgroundEquipmentOption = {
    name: string;
    items: BackgroundEquipmentItem[];
    description?: string;
};

// Типы для выбора между комплектами экипировки
export type BackgroundEquipmentChoice = {
    name: string;
    items: BackgroundEquipmentItem[];
    gold?: number; // Дополнительное золото к комплекту
};

export type BackgroundEquipmentChoices = {
    name: string;
    description?: string;
    choices: BackgroundEquipmentChoice[];
};

export type BackgroundFeature = {
    key: string;
    name: string;
    desc?: string;
    feat?: string;
    choices?: ChoiceOption[];
};

export interface BackgroundInfo {
    key: string;
    source: SourceKey;
    name: string;
    nameEn: string;
    desc: string;
    longDesc?: string;
    proficiencies?: Proficiency[];   // Владение (например: [{ type: "skill", name: "Атлетика" }])
    languages?: string[];
    equipment?: BackgroundEquipmentOption[];   // Стартовая экипировка предыстории (фиксированная)
    equipmentChoices?: BackgroundEquipmentChoices[]; // Выборы между комплектами экипировки
    feature: BackgroundFeature[];
    choices?: ChoiceOption[];
    suggestedCharacteristics?: {
        personalityTraits: string[];
        ideals: string[];
        bonds: string[];
        flaws: string[];
    };
}