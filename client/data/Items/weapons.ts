// client/data/items/weapons.ts
// Справочник оружия (simple и martial) — данные основаны на 5e SRD / Open5e

export type WeaponCategory = "simple" | "martial";
export type WeaponType = "melee" | "ranged";
export type DamageType = "bludgeoning" | "slashing" | "piercing";

export interface Weapon {
    key: string;                // уникальный ключ (slug)
    name: string;               // отображаемое название
    category: WeaponCategory;   // simple / martial
    type: WeaponType;           // melee / ranged
    cost: string;               // стоимость (строкой, напр. "1 sp", "25 gp")
    damage: string;             // урон (напр. "1d6", "2d6")
    damageType: DamageType;     // тип урона
    weight: number;             // вес в фунтах
    properties: string[];       // свойства (напр. "Лёгкое", "Фехтовальное", "Метательное", ...)
    range?: string;             // дальность (напр. "20/60"), если применимо
}

/* --------------------------
   Простые (Simple) оружия
   -------------------------- */
export const Weapons: Weapon[] = [
    // --- Simple melee ---
    {
        key: "club",
        name: "Дубинка",
        category: "simple",
        type: "melee",
        cost: "1 sp",
        damage: "1d4",
        damageType: "bludgeoning",
        weight: 2,
        properties: ["Лёгкое"],
    },
    {
        key: "dagger",
        name: "Кинжал",
        category: "simple",
        type: "melee",
        cost: "2 gp",
        damage: "1d4",
        damageType: "piercing",
        weight: 1,
        properties: ["Фехтовальное", "Лёгкое", "Метательное"],
        range: "20/60",
    },
    {
        key: "greatclub",
        name: "Большая дубинка",
        category: "simple",
        type: "melee",
        cost: "2 sp",
        damage: "1d8",
        damageType: "bludgeoning",
        weight: 10,
        properties: ["Двуручное"],
    },
    {
        key: "handaxe",
        name: "Ручной топор",
        category: "simple",
        type: "melee",
        cost: "5 gp",
        damage: "1d6",
        damageType: "slashing",
        weight: 2,
        properties: ["Лёгкое", "Метательное"],
        range: "20/60",
    },
    {
        key: "javelin",
        name: "Метательное копьё (джевелин)",
        category: "simple",
        type: "melee",
        cost: "5 sp",
        damage: "1d6",
        damageType: "piercing",
        weight: 2,
        properties: ["Метательное"],
        range: "30/120",
    },
    {
        key: "light-hammer",
        name: "Лёгкий молот",
        category: "simple",
        type: "melee",
        cost: "2 gp",
        damage: "1d4",
        damageType: "bludgeoning",
        weight: 2,
        properties: ["Лёгкое", "Метательное"],
        range: "20/60",
    },
    {
        key: "mace",
        name: "Булава",
        category: "simple",
        type: "melee",
        cost: "5 gp",
        damage: "1d6",
        damageType: "bludgeoning",
        weight: 4,
        properties: [],
    },
    {
        key: "quarterstaff",
        name: "Посох",
        category: "simple",
        type: "melee",
        cost: "2 sp",
        damage: "1d6",
        damageType: "bludgeoning",
        weight: 4,
        properties: ["Универсальное (1d8)"],
    },
    {
        key: "sickle",
        name: "Коса (сикль)",
        category: "simple",
        type: "melee",
        cost: "1 gp",
        damage: "1d4",
        damageType: "slashing",
        weight: 2,
        properties: ["Лёгкое"],
    },
    {
        key: "spear",
        name: "Копьё",
        category: "simple",
        type: "melee",
        cost: "1 gp",
        damage: "1d6",
        damageType: "piercing",
        weight: 3,
        properties: ["Метательное", "Универсальное (1d8)"],
        range: "20/60",
    },

    // --- Simple ranged ---
    {
        key: "light-crossbow",
        name: "Лёгкий арбалет",
        category: "simple",
        type: "ranged",
        cost: "25 gp",
        damage: "1d8",
        damageType: "piercing",
        weight: 5,
        properties: ["Боеприпасы", "Перезарядка", "Двуручное"],
        range: "80/320",
    },
    {
        key: "dart",
        name: "Дротик",
        category: "simple",
        type: "ranged",
        cost: "5 cp",
        damage: "1d4",
        damageType: "piercing",
        weight: 0.25,
        properties: ["Фехтовальное", "Метательное"],
        range: "20/60",
    },
    {
        key: "shortbow",
        name: "Короткий лук",
        category: "simple",
        type: "ranged",
        cost: "25 gp",
        damage: "1d6",
        damageType: "piercing",
        weight: 2,
        properties: ["Боеприпасы", "Двуручное"],
        range: "80/320",
    },
    {
        key: "sling",
        name: "Праща",
        category: "simple",
        type: "ranged",
        cost: "1 sp",
        damage: "1d4",
        damageType: "bludgeoning",
        weight: 0,
        properties: ["Боеприпасы"],
        range: "30/120",
    },

    /* --------------------------
       Воинские (Martial) оружия
       -------------------------- */

    // --- Martial melee ---
    {
        key: "battleaxe",
        name: "Боевой топор",
        category: "martial",
        type: "melee",
        cost: "10 gp",
        damage: "1d8",
        damageType: "slashing",
        weight: 4,
        properties: ["Универсальное (1d10)"],
    },
    {
        key: "flail",
        name: "Цепная булава (флейл)",
        category: "martial",
        type: "melee",
        cost: "10 gp",
        damage: "1d8",
        damageType: "bludgeoning",
        weight: 2,
        properties: [],
    },
    {
        key: "glaive",
        name: "Глейв",
        category: "martial",
        type: "melee",
        cost: "20 gp",
        damage: "1d10",
        damageType: "slashing",
        weight: 6,
        properties: ["Тяжёлое", "Дальность (reach)", "Двуручное"],
    },
    {
        key: "greataxe",
        name: "Большой топор (гритэкс)",
        category: "martial",
        type: "melee",
        cost: "30 gp",
        damage: "1d12",
        damageType: "slashing",
        weight: 7,
        properties: ["Тяжёлое", "Двуручное"],
    },
    {
        key: "greatsword",
        name: "Большой меч (гритсворд)",
        category: "martial",
        type: "melee",
        cost: "50 gp",
        damage: "2d6",
        damageType: "slashing",
        weight: 6,
        properties: ["Тяжёлое", "Двуручное"],
    },
    {
        key: "halberd",
        name: "Алебарда",
        category: "martial",
        type: "melee",
        cost: "20 gp",
        damage: "1d10",
        damageType: "slashing",
        weight: 6,
        properties: ["Тяжёлое", "Дальность (reach)", "Двуручное"],
    },
    {
        key: "lance",
        name: "Копьё/ланс",
        category: "martial",
        type: "melee",
        cost: "10 gp",
        damage: "1d12",
        damageType: "piercing",
        weight: 6,
        properties: ["Дальность (reach)", "Специальное"],
    },
    {
        key: "longsword",
        name: "Длинный меч",
        category: "martial",
        type: "melee",
        cost: "15 gp",
        damage: "1d8",
        damageType: "slashing",
        weight: 3,
        properties: ["Универсальное (1d10)"],
    },
    {
        key: "maul",
        name: "Молот (двуручный)",
        category: "martial",
        type: "melee",
        cost: "10 gp",
        damage: "2d6",
        damageType: "bludgeoning",
        weight: 10,
        properties: ["Тяжёлое", "Двуручное"],
    },
    {
        key: "morningstar",
        name: "Морнингстар",
        category: "martial",
        type: "melee",
        cost: "15 gp",
        damage: "1d8",
        damageType: "piercing",
        weight: 4,
        properties: [],
    },
    {
        key: "pike",
        name: "Пика",
        category: "martial",
        type: "melee",
        cost: "5 gp",
        damage: "1d10",
        damageType: "piercing",
        weight: 18,
        properties: ["Тяжёлое", "Дальность (reach)", "Двуручное"],
    },
    {
        key: "rapier",
        name: "Рапира",
        category: "martial",
        type: "melee",
        cost: "25 gp",
        damage: "1d8",
        damageType: "piercing",
        weight: 2,
        properties: ["Фехтовальное"],
    },
    {
        key: "scimitar",
        name: "Скимитар",
        category: "martial",
        type: "melee",
        cost: "25 gp",
        damage: "1d6",
        damageType: "slashing",
        weight: 3,
        properties: ["Фехтовальное", "Лёгкое"],
    },
    {
        key: "shortsword",
        name: "Короткий меч",
        category: "martial",
        type: "melee",
        cost: "10 gp",
        damage: "1d6",
        damageType: "piercing",
        weight: 2,
        properties: ["Фехтовальное", "Лёгкое"],
    },
    {
        key: "trident",
        name: "Трезубец (трайдент)",
        category: "martial",
        type: "melee",
        cost: "5 gp",
        damage: "1d6",
        damageType: "piercing",
        weight: 4,
        properties: ["Метательное", "Универсальное (1d8)"],
        range: "20/60",
    },
    {
        key: "war-pick",
        name: "Боевой кир (вор-пик)",
        category: "martial",
        type: "melee",
        cost: "5 gp",
        damage: "1d8",
        damageType: "piercing",
        weight: 2,
        properties: [],
    },
    {
        key: "warhammer",
        name: "Боевой молот",
        category: "martial",
        type: "melee",
        cost: "15 gp",
        damage: "1d8",
        damageType: "bludgeoning",
        weight: 2,
        properties: ["Универсальное (1d10)"],
    },
    {
        key: "whip",
        name: "Кнут",
        category: "martial",
        type: "melee",
        cost: "2 gp",
        damage: "1d4",
        damageType: "slashing",
        weight: 3,
        properties: ["Фехтовальное", "Дальность (reach)"],
    },

    // --- Martial ranged ---
    {
        key: "blowgun",
        name: "Духовая трубка (blowgun)",
        category: "martial",
        type: "ranged",
        cost: "10 gp",
        damage: "1",
        damageType: "piercing",
        weight: 1,
        properties: ["Боеприпасы", "Перезарядка"],
        range: "25/100",
    },
    {
        key: "hand-crossbow",
        name: "Ручной арбалет",
        category: "martial",
        type: "ranged",
        cost: "75 gp",
        damage: "1d6",
        damageType: "piercing",
        weight: 3,
        properties: ["Боеприпасы", "Лёгкое", "Перезарядка"],
        range: "30/120",
    },
    {
        key: "crossbow-heavy",
        name: "Тяжёлый арбалет",
        category: "martial",
        type: "ranged",
        cost: "50 gp",
        damage: "1d10",
        damageType: "piercing",
        weight: 18,
        properties: ["Боеприпасы", "Тяжёлое", "Перезарядка", "Двуручное"],
        range: "100/400",
    },
    {
        key: "longbow",
        name: "Длинный лук",
        category: "martial",
        type: "ranged",
        cost: "50 gp",
        damage: "1d8",
        damageType: "piercing",
        weight: 2,
        properties: ["Боеприпасы", "Тяжёлое", "Двуручное"],
        range: "150/600",
    },
    {
        key: "net",
        name: "Сеть",
        category: "martial",
        type: "ranged",
        cost: "1 gp",
        damage: "-",
        damageType: "piercing",
        weight: 3,
        properties: ["Метательное", "Специальное"],
        range: "5/15",
    },
];

/* Вспомогательный поиск */
export function getWeaponByKey(key: string): Weapon | undefined {
    return Weapons.find((w) => w.key === key);
}

export function getWeaponCategoryRu(category: WeaponCategory): string {
    switch (category) {
        case "simple": return "Простое";
        case "martial": return "Воинское";
    }
}

export function getWeaponTypeRu(type: WeaponType): string {
    switch (type) {
        case "melee": return "Ближнее";
        case "ranged": return "Дальнобойное";
    }
}

export function getDamageTypeRu(damage: DamageType): string {
    switch (damage) {
        case "bludgeoning": return "Дробящий";
        case "slashing": return "Рубящий";
        case "piercing": return "Колющий";
    }
}