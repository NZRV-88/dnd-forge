// client/data/items/weapons.ts
// Справочник оружия (simple и martial) — данные основаны на 5e SRD / Open5e

export type WeaponCategory = "simple" | "martial";
export type WeaponType = "melee" | "ranged";
export type DamageType = "bludgeoning" | "slashing" | "piercing";
export type WeaponMastery = "sap" | "slow" | "topple" | "vex" | "nick" | "graze" | "cleave" | "push"; // дописать описания

// Фиксированные свойства оружия
export type WeaponProperty = 
    | "loading"      // Перезарядка
    | "ammunition"   // Боеприпасы
    | "two-handed"   // Двуручное
    | "heavy"        // Тяжелое
    | "reach"        // Досягаемость
    | "versatile"    // Универсальное
    | "thrown"       // Метательное
    | "finesse"      // Фехтовальное
    | "light";       // Лёгкое

export interface Weapon {
    key: string;                // уникальный ключ (slug)
    source: string;           // источник (напр. "PH24")
    name: string;               // отображаемое название
    nameEn?: string;           // отображаемое название на английском
    category: WeaponCategory;   // simple / martial
    type: WeaponType;           // melee / ranged
    mastery?: WeaponMastery;    // если оружие связано с мастерством владения оружием
    cost: string;               // стоимость (строкой, напр. "1 sp", "25 gp")
    damage: string;             // урон (напр. "1d6", "2d6")
    damageType: DamageType;     // тип урона
    weight: number;             // вес в фунтах
    properties: WeaponProperty[]; // свойства оружия
    range?: string;             // дальность (напр. "20/60"), если применимо
}


// Мастерство: Ослабляющее (sap). Если вы попадаете по существу этим оружием, оно будет совершать с Помехой следующий бросок атаки до начала вашего следующего хода.
// Мастерство: Замедляющее (slow). Если вы попадаете по существу этим оружием и наносите урон, можете уменьшить его Скорость на 10 футов до начала вашего следующего хода. Если по существу попадают из оружия с таким свойством несколько раз, снижение Скорости от этого свойства не превышает 10 футов.
// Мастерство: Быстрое (nick). Когда вы совершаете дополнительную атаку от свойства Лёгкое, можете совершить её не Бонусным действием, а частью действия Атака. Вы можете совершить эту дополнительную атаку только один раз за ход.
// Мастерство: Отвлекающее (vex). Если вы попадаете по существу этим оружием и наносите урон, вы будете совершать с Преимуществом следующий бросок атаки по этому существу до конца вашего следующего хода.
// Мастерство: Прорубающее (cleave). Когда вы попадаете по существу броском рукопашной атаки с этим оружием, можете совершить бросок рукопашной атаки с этим оружием по второму существу в пределах 5 футов от первого и в пределах вашей досягаемости. При попадании второе существо получает урон от оружия, но не добавляйте к этому урону модификатор используемой характеристики, если этот модификатор не отрицательный. Вы можете совершить эту дополнительную атаку только один раз за ход.
// Мастерство: Секущее (graze). Если вы не попадаете по существу броском атаки с этим оружием, можете нанести этому существу урон, равный модификатору использованной для броска атаки характеристики. Этот урон того же типа, что и наносимый оружием, и этот урон может быть увеличен только с ростом модификатора характеристики.
// Мастерство: Отталкивающее (push). Когда вы попадаете по существу этим оружием, можете оттолкнуть его от себя на расстояние до 10 футов, если оно Большого размера или меньше.
// Мастерство: Опрокидывающее (topple). Если вы попадаете по существу этим оружием, можете заставить его совершить спасбросок Телосложения (Сл 8 + ваши Бонус владения и модификатор характеристики, используемой для броска атаки). При провале существо получает состояние Опрокинутый.

/* --------------------------
   Простые (Simple) оружия
   -------------------------- */
export const Weapons: Weapon[] = [
    // --- Simple melee ---
    {
        key: "club",
        source: "PH24",
        name: "Дубинка",
        nameEn: "Club",
        category: "simple",
        type: "melee",
        cost: "1 sp",
        damage: "1d4",
        damageType: "bludgeoning",
        weight: 2,
        mastery: "slow",
        properties: ["light"],
    },
    {
        key: "dagger",
        source: "PH24",
        nameEn: "Dagger",
        name: "Кинжал",
        category: "simple",
        type: "melee",
        cost: "2 gp",
        damage: "1d4",
        damageType: "piercing",
        weight: 1,
        mastery: "nick",
        properties: ["finesse", "light", "thrown"],
        range: "20/60",
    },
    {
        key: "greatclub",
        source: "PH24",
        name: "Палица",
        nameEn: "Greatclub",
        category: "simple",
        type: "melee",
        cost: "2 sp",
        damage: "1d8",
        damageType: "bludgeoning",
        weight: 10,
        mastery: "push",
        properties: ["two-handed"],
    },
    {
        key: "handaxe",
        source: "PH24",
        name: "Ручной топор",
        nameEn: "Handaxe",
        category: "simple",
        type: "melee",
        cost: "5 gp",
        damage: "1d6",
        damageType: "slashing",
        weight: 2,
        mastery: "vex",
        properties: ["light", "thrown"],
        range: "20/60",
    },
    {
        key: "javelin",
        source: "PH24",
        name: "Метательное копьё",
        nameEn: "Javelin",
        category: "simple",
        type: "melee",
        cost: "5 sp",
        damage: "1d6",
        damageType: "piercing",
        weight: 2,
        mastery: "slow",
        properties: ["thrown"],
        range: "30/120",
    },
    {
        key: "light-hammer",
        source: "PH24",
        name: "Лёгкий молот",
        nameEn: "Light Hammer",
        category: "simple",
        type: "melee",
        cost: "2 gp",
        damage: "1d4",
        damageType: "bludgeoning",
        weight: 2,
        mastery: "nick",
        properties: ["light", "thrown"],
        range: "20/60",
    },
    {
        key: "mace",
        source: "PH24",
        name: "Булава",
        nameEn: "Mace",
        category: "simple",
        type: "melee",
        cost: "5 gp",
        damage: "1d6",
        damageType: "bludgeoning",
        weight: 4,
        mastery: "sap",
        properties: [],
    },
    {
        key: "quarterstaff",
        source: "PH24",
        name: "Боевой посох",
        nameEn: "Quarterstaff",
        category: "simple",
        type: "melee",
        cost: "2 sp",
        damage: "1d6",
        damageType: "bludgeoning",
        weight: 4,
        mastery: "topple",
        properties: ["versatile"],
    },
    {
        key: "sickle",
        source: "PH24",
        name: "Серп ",
        nameEn: "Sickle",
        category: "simple",
        type: "melee",
        cost: "1 gp",
        damage: "1d4",
        damageType: "slashing",
        weight: 2,
        mastery: "nick",
        properties: ["light"],
    },
    {
        key: "spear",
        source: "PH24",
        name: "Копьё",
        nameEn: "Spear",
        category: "simple",
        type: "melee",
        cost: "1 gp",
        damage: "1d6",
        damageType: "piercing",
        weight: 3,
        mastery: "sap",
        properties: ["thrown", "versatile"],
        range: "20/60",
    },

    // --- Simple ranged ---
    {
        key: "light-crossbow",
        source: "PH24",
        nameEn: "Light Crossbow",
        name: "Лёгкий арбалет",
        category: "simple",
        type: "ranged",
        cost: "25 gp",
        damage: "1d8",
        damageType: "piercing",
        weight: 5,
        mastery: "slow",
        properties: ["ammunition", "loading", "two-handed"],
        range: "80/320",
    },
    {
        key: "dart",
        source: "PH24",
        nameEn: "Dart",
        name: "Дротик",
        category: "simple",
        type: "ranged",
        cost: "5 cp",
        damage: "1d4",
        damageType: "piercing",
        weight: 0.25,
        mastery: "vex",
        properties: ["finesse", "thrown"],
        range: "20/60",
    },
    {
        key: "shortbow",
        source: "PH24",
        nameEn: "Shortbow",
        name: "Короткий лук",
        category: "simple",
        type: "ranged",
        cost: "25 gp",
        damage: "1d6",
        damageType: "piercing",
        weight: 2,
        mastery: "vex",
        properties: ["ammunition", "two-handed"],
        range: "80/320",
    },
    {
        key: "sling",
        source: "PH24",
        nameEn: "Sling",
        name: "Праща",
        category: "simple",
        type: "ranged",
        cost: "1 sp",
        damage: "1d4",
        damageType: "bludgeoning",
        weight: 0,
        mastery: "slow",
        properties: ["ammunition"],
        range: "30/120",
    },

    /* --------------------------
       Воинские (Martial) оружия
       -------------------------- */

    // --- Martial melee ---
    {
        key: "battleaxe",
        source: "PH24",
        nameEn: "Battleaxe",
        name: "Боевой топор",
        category: "martial",
        type: "melee",
        cost: "10 gp",
        damage: "1d8",
        damageType: "slashing",
        weight: 4,
        mastery: "topple",
        properties: ["versatile"],
    },
    {
        key: "flail",
        source: "PH24",
        nameEn: "Flail",
        name: "Цепная булава",
        category: "martial",
        type: "melee",
        cost: "10 gp",
        damage: "1d8",
        damageType: "bludgeoning",
        weight: 2,
        mastery: "sap",
        properties: [],
    },
    {
        key: "glaive",
        source: "PH24",
        nameEn: "Glaive",
        name: "Глефа",
        category: "martial",
        type: "melee",
        cost: "20 gp",
        damage: "1d10",
        damageType: "slashing",
        weight: 6,
        mastery: "graze",
        properties: ["heavy", "reach", "two-handed"],
    },
    {
        key: "greataxe",
        source: "PH24",
        nameEn: "Greataxe",
        name: "Секира",
        category: "martial",
        type: "melee",
        cost: "30 gp",
        damage: "1d12",
        damageType: "slashing",
        weight: 7,
        mastery: "cleave",
        properties: ["heavy", "two-handed"],
    },
    {
        key: "greatsword",
        source: "PH24",
        nameEn: "Greatsword",
        name: "Двуручный меч",
        category: "martial",
        type: "melee",
        cost: "50 gp",
        damage: "2d6",
        damageType: "slashing",
        weight: 6,
        mastery: "graze",
        properties: ["heavy", "two-handed"],
    },
    {
        key: "halberd",
        source: "PH24",
        nameEn: "Halberd",
        name: "Алебарда",
        category: "martial",
        type: "melee",
        cost: "20 gp",
        damage: "1d10",
        damageType: "slashing",
        weight: 6,
        mastery: "cleave",
        properties: ["heavy", "reach", "two-handed"],
    },
    {
        key: "lance",
        source: "PH24",
        nameEn: "Lance",
        name: "Кавалерийское копьё",
        category: "martial",
        type: "melee",
        cost: "10 gp",
        damage: "1d12",
        damageType: "piercing",
        weight: 6,
        mastery: "topple",
        properties: ["reach", "two-handed", "heavy"],
    },
    {
        key: "longsword",
        source: "PH24",
        nameEn: "Longsword",
        name: "Длинный меч",
        category: "martial",
        type: "melee",
        cost: "15 gp",
        damage: "1d8",
        damageType: "slashing",
        weight: 3,
        mastery: "sap",
        properties: ["versatile"],
    },
    {
        key: "maul",
        source: "PH24",
        nameEn: "Maul",
        name: "Молот",
        category: "martial",
        type: "melee",
        cost: "10 gp",
        damage: "2d6",
        damageType: "bludgeoning",
        weight: 10,
        mastery: "topple",
        properties: ["heavy", "two-handed"],
    },
    {
        key: "morningstar",
        source: "PH24",
        nameEn: "Morningstar",
        name: "Моргенштерн ",
        category: "martial",
        type: "melee",
        cost: "15 gp",
        damage: "1d8",
        damageType: "piercing",
        weight: 4,
        mastery: "sap",
        properties: [],
    },
    {
        key: "pike",
        source: "PH24",
        nameEn: "Pike",
        name: "Пика",
        category: "martial",
        type: "melee",
        cost: "5 gp",
        damage: "1d10",
        damageType: "piercing",
        weight: 18,
        mastery: "push",
        properties: ["heavy", "reach", "two-handed"],
    },
    {
        key: "rapier",
        source: "PH24",
        nameEn: "Rapier",
        name: "Рапира",
        category: "martial",
        type: "melee",
        cost: "25 gp",
        damage: "1d8",
        damageType: "piercing",
        weight: 2,
        mastery: "vex",
        properties: ["finesse"],
    },
    {
        key: "scimitar",
        source: "PH24",
        nameEn: "Scimitar",
        name: "Скимитар",
        category: "martial",
        type: "melee",
        cost: "25 gp",
        damage: "1d6",
        damageType: "slashing",
        weight: 3,
        mastery: "nick",
        properties: ["finesse", "light"],
    },
    {
        key: "shortsword",
        source: "PH24",
        nameEn: "Shortsword",
        name: "Короткий меч",
        category: "martial",
        type: "melee",
        cost: "10 gp",
        damage: "1d6",
        damageType: "piercing",
        weight: 2,
        mastery: "vex",
        properties: ["finesse", "light"],
    },
    {
        key: "trident",
        name: "Трезубец",
        source: "PH24",
        nameEn: "Trident",
        category: "martial",
        type: "melee",
        cost: "5 gp",
        damage: "1d6",
        damageType: "piercing",
        weight: 4,
        mastery: "topple",
        properties: ["thrown", "versatile"],
        range: "20/60",
    },
    {
        key: "war-pick",
        source: "PH24",
        nameEn: "War Pick",
        name: "Клевец",
        category: "martial",
        type: "melee",
        cost: "5 gp",
        damage: "1d8",
        damageType: "piercing",
        weight: 2,
        mastery: "sap",
        properties: ["versatile"],
    },
    {
        key: "warhammer",
        source: "PH24",
        nameEn: "Warhammer",
        name: "Боевой молот",
        category: "martial",
        type: "melee",
        cost: "15 gp",
        damage: "1d8",
        damageType: "bludgeoning",
        weight: 2,
        mastery: "push",
        properties: ["versatile"],
    },
    {
        key: "whip",
        source: "PH24",
        nameEn: "Whip",
        name: "Кнут",
        category: "martial",
        type: "melee",
        cost: "2 gp",
        damage: "1d4",
        damageType: "slashing",
        weight: 3,
        mastery: "slow",
        properties: ["finesse", "reach"],
    },

    // --- Martial ranged ---
    {
        key: "blowgun",
        source: "PH24",
        nameEn: "Blowgun",
        name: "Духовая трубка",
        category: "martial",
        type: "ranged",
        cost: "10 gp",
        damage: "1",
        damageType: "piercing",
        weight: 1,
        mastery: "vex",
        properties: ["ammunition", "loading"],
        range: "25/100",
    },
    {
        key: "hand-crossbow",
        source: "PH24",
        nameEn: "Hand Crossbow",
        name: "Одноручный арбалет",
        category: "martial",
        type: "ranged",
        cost: "75 gp",
        damage: "1d6",
        damageType: "piercing",
        weight: 3,
        mastery: "vex",
        properties: ["ammunition", "light", "loading"],
        range: "30/120",
    },
    {
        key: "heavy-crossbow",
        source: "PH24",
        nameEn: "Heavy Crossbow",
        name: "Тяжёлый арбалет",
        category: "martial",
        type: "ranged",
        cost: "50 gp",
        damage: "1d10",
        damageType: "piercing",
        weight: 18,
        mastery: "push",
        properties: ["ammunition", "heavy", "loading", "two-handed"],
        range: "100/400",
    },
    {
        key: "longbow",
        source: "PH24",
        nameEn: "Longbow",
        name: "Длинный лук",
        category: "martial",
        type: "ranged",
        cost: "50 gp",
        damage: "1d8",
        damageType: "piercing",
        weight: 2,
        mastery: "slow",
        properties: ["ammunition", "heavy", "two-handed"],
        range: "150/600",
    },
    {
        key: "musket",
        source: "PH24",
        nameEn: "Musket",
        name: "Мушкет",
        category: "martial",
        type: "ranged",
        cost: "500 gp",
        damage: "1d12",
        damageType: "piercing",
        weight: 10,
        mastery: "slow",
        properties: ["ammunition", "loading", "two-handed"],
        range: "40/120",
    },
    {
        key: "pistol",
        source: "PH24",
        nameEn: "Pistol",
        name: "Пистоль ",
        category: "martial",
        type: "ranged",
        cost: "250 gp",
        damage: "1d10",
        damageType: "piercing",
        weight: 10,
        mastery: "vex",
        properties: ["ammunition", "loading"],
        range: "30/90",
    },
];

/* Вспомогательный поиск */

export function getWeaponKeysByCategory(category: WeaponCategory): string[] {
    return Weapons.filter((a) => a.category === category).map((a) => a.key);
}
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

export function getWeaponName(key: string, lang: "ru" | "en" = "ru"): string {
    const weapon = getWeaponByKey(key);
    if (!weapon) return key;
    return lang === "en" ? key : weapon.name;
}