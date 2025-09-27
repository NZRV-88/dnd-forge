import { Sword, Star, Heart, Book, Eye, Brain } from "@/components/refs/icons";

export type Abilities = {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
};

// массив с характеристиками и иконками
export const ABILITIES = [
    { key: "str", keyRu: "СИЛ", label: "Сила", labelEn: "Strength", icon: Sword },
    { key: "dex", keyRu: "ЛОВ", label: "Ловкость", labelEn: "Dexterity", icon: Star },
    { key: "con", keyRu: "ТЕЛ", label: "Телосложение", labelEn: "Constitution", icon: Heart },
    { key: "int", keyRu: "ИНТ", label: "Интеллект", labelEn: "Intelligence", icon: Book },
    { key: "wis", keyRu: "МДР", label: "Мудрость", labelEn: "Wisdom", icon: Eye },
    { key: "cha", keyRu: "ХАР", label: "Харизма", labelEn: "Charisma", icon: Brain },
] as const;