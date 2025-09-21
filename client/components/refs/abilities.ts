import { Sword, Star, Heart, Book, Eye, Brain } from "./icons";

// массив с характеристиками и иконками
export const ABILITIES = [
    { key: "str", label: "Сила", icon: Sword },
    { key: "dex", label: "Ловкость", icon: Star },
    { key: "con", label: "Телосложение", icon: Heart },
    { key: "int", label: "Интеллект", icon: Book },
    { key: "wis", label: "Мудрость", icon: Eye },
    { key: "cha", label: "Харизма", icon: Brain },
] as const;