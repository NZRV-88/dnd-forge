export interface EquipmentPackItem {
    key: string;
    quantity: number;
}

export interface EquipmentPack {
    key: string;
    name: string;
    nameEn: string;
    cost: string;
    weight: number;
    description: string;
    items: EquipmentPackItem[];
}

export const EQUIPMENT_PACKS: EquipmentPack[] = [
    {
        key: "explorers-pack",
        name: "Набор путешественника",
        nameEn: "Explorer's Pack",
        cost: "10 GP",
        weight: 55,
        description: "Этот набор включает в себя следующие предметы:",
        items: [
            { key: "waterskin", quantity: 1 },      // Бурдюк
            { key: "rope", quantity: 1 },           // Верёвка
            { key: "oil", quantity: 2 },            // 2x фляги Масла
            { key: "rations", quantity: 10 },       // Рационы на 10 дней
            { key: "backpack", quantity: 1 },       // Рюкзак
            { key: "bedroll", quantity: 1 },        // Спальник
            { key: "tinderbox", quantity: 1 },      // Трутница
            { key: "torch", quantity: 10 }          // 10x Факел
        ]
    },
    {
        key: "entertainers-pack",
        name: "Набор артиста",
        nameEn: "Entertainer's Pack",
        cost: "40 GP",
        weight: 59,
        description: "Этот набор включает в себя следующие предметы:",
        items: [
            { key: "waterskin", quantity: 1 },      // Бурдюк
            { key: "mirror", quantity: 1 },         // Зеркало
            { key: "bell", quantity: 1 },           // Колокольчик
            { key: "costume", quantity: 3 },        // 3x Костюм
            { key: "oil", quantity: 8 },            // 8x фляги Масла
            { key: "bullseye-lantern", quantity: 1 }, // Направленный фонарь
            { key: "rations", quantity: 9 },        // Рационы на 9 дней
            { key: "backpack", quantity: 1 },       // Рюкзак
            { key: "bedroll", quantity: 1 },        // Спальник
            { key: "tinderbox", quantity: 1 }       // Трутница
        ]
    },
    {
        key: "burglars-pack",
        name: "Набор взломщика",
        nameEn: "Burglar's Pack",
        cost: "16 GP",
        weight: 42,
        description: "Этот набор включает в себя следующие предметы:",
        items: [
            { key: "waterskin", quantity: 1 },      // Бурдюк
            { key: "rope", quantity: 1 },           // Верёвка
            { key: "hooded-lantern", quantity: 1 }, // Закрытый фонарь
            { key: "bell", quantity: 1 },           // Колокольчик
            { key: "crowbar", quantity: 1 },        // Ломик
            { key: "oil", quantity: 7 },            // 7x фляги Масла
            { key: "ball-bearings", quantity: 1 },  // Металлические шарики
            { key: "rations", quantity: 5 },        // Рационы на 5 дней
            { key: "backpack", quantity: 1 },       // Рюкзак
            { key: "candle", quantity: 10 },        // 10x Свеча
            { key: "tinderbox", quantity: 1 },      // Трутница
            { key: "torch", quantity: 10 }          // 10x Факел
        ]
    },
    {
        key: "priests-pack",
        name: "Набор священника",
        nameEn: "Priest's Pack",
        cost: "33 GP",
        weight: 29,
        description: "Этот набор включает в себя следующие предметы:",
        items: [
            { key: "lamp", quantity: 1 },           // Лампа
            { key: "robe", quantity: 1 },           // Мантия
            { key: "blanket", quantity: 1 },        // Одеяло
            { key: "rations", quantity: 7 },        // Рационы на 7 дней
            { key: "backpack", quantity: 1 },       // Рюкзак
            { key: "holy-water", quantity: 1 },     // Святая вода
            { key: "tinderbox", quantity: 1 }       // Трутница
        ]
    },
    {
        key: "diplomats-pack",
        name: "Набор дипломата",
        nameEn: "Diplomat's Pack",
        cost: "39 GP",
        weight: 39,
        description: "Этот набор включает в себя следующие предметы:",
        items: [
            { key: "paper", quantity: 5 },          // 5x листы Бумаги
            { key: "perfume", quantity: 1 },        // Духи
            { key: "lamp", quantity: 1 },           // Лампа
            { key: "oil", quantity: 4 },            // 4x фляги Масла
            { key: "fine-clothes", quantity: 1 },   // Отличная одежда
            { key: "parchment", quantity: 5 },      // 5x листы Пергамента
            { key: "ink-pen", quantity: 5 },          // 5x Писчее перо
            { key: "chest", quantity: 1 },          // Сундук
            { key: "tinderbox", quantity: 1 },      // Трутница
            { key: "map-or-scroll-case", quantity: 2 }, // 2x Тубус для карт и свитков
            { key: "ink", quantity: 1 }             // Чернила
        ]
    },
    {
        key: "scholars-pack",
        name: "Набор учёного",
        nameEn: "Scholar's Pack",
        cost: "40 GP",
        weight: 22,
        description: "Этот набор включает в себя следующие предметы:",
        items: [
            { key: "book", quantity: 1 },           // Книга
            { key: "lamp", quantity: 1 },           // Лампа
            { key: "oil", quantity: 10 },           // 10x фляги Масла
            { key: "parchment", quantity: 10 },     // 10x листы Пергамента
            { key: "ink-pen", quantity: 5 },          // 5x Писчее перо
            { key: "backpack", quantity: 1 },       // Рюкзак
            { key: "tinderbox", quantity: 1 },      // Трутница
            { key: "ink", quantity: 1 }             // Чернила
        ]
    },
    {
        key: "dungeoneers-pack",
        name: "Набор исследователя подземелий",
        nameEn: "Dungeoneer's Pack",
        cost: "12 GP",
        weight: 55,
        description: "Этот набор включает в себя следующие предметы:",
        items: [
            { key: "waterskin", quantity: 1 },      // Бурдюк
            { key: "rope", quantity: 1 },           // Верёвка
            { key: "caltrops", quantity: 1 },       // Калтропы
            { key: "crowbar", quantity: 1 },        // Ломик
            { key: "oil", quantity: 2 },            // 2x фляги Масла
            { key: "rations", quantity: 10 },       // Рационы на 10 дней
            { key: "backpack", quantity: 1 },       // Рюкзак
            { key: "tinderbox", quantity: 1 },      // Трутница
            { key: "torch", quantity: 10 }          // 10x Факел
        ]
    }
];

export function getEquipmentPackByKey(key: string): EquipmentPack | undefined {
    return EQUIPMENT_PACKS.find(pack => pack.key === key);
}
