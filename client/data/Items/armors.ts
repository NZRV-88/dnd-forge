// client/data/items/armors.ts

export type ArmorCategory = "light" | "medium" | "heavy" | "shield";

export interface Armor {
    key: string;              // уникальный ключ (slug)
    name: string;             // отображаемое название
    category: ArmorCategory;  // категория
    cost: string;             // стоимость (напр. "10 gp")
    baseAC: number;           // базовый класс брони
    maxDexBonus?: number;     // максимум бонуса ЛОВК, если ограничен
    disadvantageStealth?: boolean; // есть ли помеха к Скрытности
    weight: number;           // вес в фунтах
    properties?: string[];    // доп. свойства (если есть)
}

/* --------------------------
   Лёгкие доспехи
   -------------------------- */
export const Armors: Armor[] = [
    {
        key: "padded",
        name: "Стёганый",
        category: "light",
        cost: "5 gp",
        baseAC: 11,
        maxDexBonus: Infinity,
        disadvantageStealth: true,
        weight: 8,
    },
    {
        key: "leather",
        name: "Кожаный",
        category: "light",
        cost: "10 gp",
        baseAC: 11,
        maxDexBonus: Infinity,
        disadvantageStealth: false,
        weight: 10,
    },
    {
        key: "studded-leather",
        name: "Проклёпанный кожаный",
        category: "light",
        cost: "45 gp",
        baseAC: 12,
        maxDexBonus: Infinity,
        disadvantageStealth: false,
        weight: 13,
    },

    /* --------------------------
       Средние доспехи
       -------------------------- */
    {
        key: "hide",
        name: "Шкурный",
        category: "medium",
        cost: "10 gp",
        baseAC: 12,
        maxDexBonus: 2,
        disadvantageStealth: false,
        weight: 12,
    },
    {
        key: "chain-shirt",
        name: "Кольчужная рубаха",
        category: "medium",
        cost: "50 gp",
        baseAC: 13,
        maxDexBonus: 2,
        disadvantageStealth: false,
        weight: 20,
    },
    {
        key: "scale-mail",
        name: "Чешуйчатый",
        category: "medium",
        cost: "50 gp",
        baseAC: 14,
        maxDexBonus: 2,
        disadvantageStealth: true,
        weight: 45,
    },
    {
        key: "breastplate",
        name: "Кираса",
        category: "medium",
        cost: "400 gp",
        baseAC: 14,
        maxDexBonus: 2,
        disadvantageStealth: false,
        weight: 20,
    },
    {
        key: "half-plate",
        name: "Полулаты",
        category: "medium",
        cost: "750 gp",
        baseAC: 15,
        maxDexBonus: 2,
        disadvantageStealth: true,
        weight: 40,
    },

    /* --------------------------
       Тяжёлые доспехи
       -------------------------- */
    {
        key: "ring-mail",
        name: "Кольчужная броня",
        category: "heavy",
        cost: "30 gp",
        baseAC: 14,
        maxDexBonus: 0,
        disadvantageStealth: true,
        weight: 40,
    },
    {
        key: "chain-mail",
        name: "Кольчуга",
        category: "heavy",
        cost: "75 gp",
        baseAC: 16,
        maxDexBonus: 0,
        disadvantageStealth: true,
        weight: 55,
        properties: ["Требует СИЛ 13"],
    },
    {
        key: "splint",
        name: "Пластинчатый (сплинт)",
        category: "heavy",
        cost: "200 gp",
        baseAC: 17,
        maxDexBonus: 0,
        disadvantageStealth: true,
        weight: 60,
        properties: ["Требует СИЛ 15"],
    },
    {
        key: "plate",
        name: "Латы",
        category: "heavy",
        cost: "1500 gp",
        baseAC: 18,
        maxDexBonus: 0,
        disadvantageStealth: true,
        weight: 65,
        properties: ["Требует СИЛ 15"],
    },

    /* --------------------------
       Щиты
       -------------------------- */
    {
        key: "shield",
        name: "Щит",
        category: "shield",
        cost: "10 gp",
        baseAC: 2, // добавляется к AC
        weight: 6,
        disadvantageStealth: false,
    },
];

/* Вспомогательный поиск */
export function getArmorByKey(key: string): Armor | undefined {
    return Armors.find((a) => a.key === key);
}

export function getArmorKeysByCategory(category: ArmorCategory): string[] {
    return Armors.filter((a) => a.category === category).map((a) => a.key);
}

export function getArmorName(key: string, lang: "ru" | "en" = "ru"): string {
    const armor = getArmorByKey(key);
    if (!armor) return key;
    return lang === "en" ? key : armor.name;
}
