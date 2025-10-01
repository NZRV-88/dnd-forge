// client/data/items/armors.ts

export type ArmorCategory = "light" | "medium" | "heavy" | "shield";

export interface Armor {
    key: string;              // уникальный ключ (slug)
    source: string;           // источник (напр. "PH24")
    name: string;             // отображаемое название
    nameEn?: string;           // отображаемое название на английском
    category: ArmorCategory;  // категория
    cost: string;             // стоимость (напр. "10 gp")
    baseAC: number;           // базовый класс брони
    maxDexBonus?: number;     // максимум бонуса ЛОВК, если ограничен
    disadvantageStealth?: boolean; // есть ли помеха к Скрытности
    weight: number;           // вес в фунтах
    properties?: string[];    // доп. свойства (если есть)
    requirements?: ArmorRequirements; // требования для ношения доспеха
}

export interface ArmorRequirements {
    strength?: number;        // минимальная Сила
    speedPenalty?: number;    // описание штрафа к скорости при недостаточной Силе
    description?: string;     // дополнительное описание требований
}

/* --------------------------
   Лёгкие доспехи
   -------------------------- */
export const Armors: Armor[] = [
    {
        key: "padded-armor",
        source: "PH24",
        name: "Стёганый доспех",
        nameEn: "Padded Armor",
        category: "light",
        cost: "5 gp",
        baseAC: 11,
        maxDexBonus: Infinity,
        disadvantageStealth: true,
        weight: 8,
    },
    {
        key: "leather-armor",
        source: "PH24",
        name: "Кожаный доспех",
        nameEn: "Leather Armor",
        category: "light",
        cost: "10 gp",
        baseAC: 11,
        maxDexBonus: Infinity,
        disadvantageStealth: false,
        weight: 10,
    },
    {
        key: "studded-leather-armor",
        source: "PH24",
        name: "Проклёпанный кожаный доспех",
        nameEn: "Studded Leather Armor",
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
        key: "hide-armor",
        source: "PH24",
        name: "Шкурный доспех",
        nameEn: "Hide Armor",
        category: "medium",
        cost: "10 gp",
        baseAC: 12,
        maxDexBonus: 2,
        disadvantageStealth: false,
        weight: 12,
    },
    {
        key: "chain-shirt",
        source: "PH24",
        name: "Кольчужная рубаха",
        nameEn: "Chain Shirt",
        category: "medium",
        cost: "50 gp",
        baseAC: 13,
        maxDexBonus: 2,
        disadvantageStealth: false,
        weight: 20,
    },
    {
        key: "scale-mail",
        source: "PH24",
        name: "Чешуйчатый доспех",
        nameEn: "Scale Mail",
        category: "medium",
        cost: "50 gp",
        baseAC: 14,
        maxDexBonus: 2,
        disadvantageStealth: true,
        weight: 45,
    },
    {
        key: "breastplate",
        source: "PH24",
        name: "Кираса",
        nameEn: "Breastplate",
        category: "medium",
        cost: "400 gp",
        baseAC: 14,
        maxDexBonus: 2,
        disadvantageStealth: false,
        weight: 20,
    },
    {
        key: "half-plate-armor",
        source: "PH24",
        name: "Полулаты",
        nameEn: "Half-Plate Armor",
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
        source: "PH24",
        name: "Колечный доспех",
        nameEn: "Ring Mail",
        category: "heavy",
        cost: "30 GP",
        baseAC: 14,
        maxDexBonus: 0,
        disadvantageStealth: true,
        weight: 40,
    },
    {
        key: "chain-mail",
        source: "PH24",
        nameEn: "Chain Mail",
        name: "Кольчуга",
        category: "heavy",
        cost: "75 gp",
        baseAC: 16,
        maxDexBonus: 0,
        disadvantageStealth: true,
        weight: 55,
        requirements: {
            strength: 13,
            speedPenalty: 10
        },
    },
    {
        key: "splint-armor",
        source: "PH24",
        nameEn: "Splint Armor",
        name: "Пластинчатый доспех",
        category: "heavy",
        cost: "200 gp",
        baseAC: 17,
        maxDexBonus: 0,
        disadvantageStealth: true,
        weight: 60,
        requirements: {
            strength: 15,
            speedPenalty: 10
        },
    },
    {
        key: "plate-armor",
        source: "PH24",
        nameEn: "Plate Armor",
        name: "Латный доспех",
        category: "heavy",
        cost: "1500 gp",
        baseAC: 18,
        maxDexBonus: 0,
        disadvantageStealth: true,
        weight: 65,
        requirements: {
            strength: 15,
            speedPenalty: 10
        },
    },

    /* --------------------------
       Щиты
       -------------------------- */
    {
        key: "shield",
        source: "PH24",
        nameEn: "Shield",
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
