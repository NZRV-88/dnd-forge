export interface SourceInfo {
    key: string;   // короткий код (используется в data)
    name: string;  // полное название книги
    short?: string; // сокращение (для UI, например PHB)
    year?: number; // год издания
    desc?: string; // краткое описание
}

export const SOURCES = {
    // Новые Core Rulebooks
    PH24: {
        key: "PH24",
        name: "Player's Handbook (2024)",
        short: "PHB",
        year: 2024,
        desc: "Новое издание Книги игрока для D&D 5e (обновлённые правила и классы).",
    },
    DM24: {
        key: "DM24",
        name: "Dungeon Master's Guide (2024)",
        short: "DMG",
        year: 2024,
        desc: "Новое руководство для мастеров, обновлённое для 5e.",
    },
    MM25: {
        key: "MM25",
        name: "Monster Manual (2025)",
        short: "MM",
        year: 2025,
        desc: "Новое издание Справочника монстров, расширенное и обновлённое.",
    },

    // Старые Core Rulebooks
    PH14: {
        key: "PH14",
        name: "Player's Handbook (2014)",
        short: "PHB (2014)",
        year: 2014,
        desc: "Оригинальное издание 5e, теперь устаревшее.",
    },
    DM14: {
        key: "DM14",
        name: "Dungeon Master's Guide (2014)",
        short: "DMG (2014)",
        year: 2014,
        desc: "Оригинальное руководство для мастеров.",
    },
    MM14: {
        key: "MM14",
        name: "Monster Manual (2014)",
        short: "MM (2014)",
        year: 2014,
        desc: "Оригинальный справочник монстров.",
    },

    // Дополнения к базовым
    SCAG: {
        key: "SCAG",
        name: "Sword Coast Adventurer’s Guide",
        short: "SCAG",
        year: 2015,
        desc: "Региональное руководство по побережью Мечей, новые архетипы и заклинания.",
    },
    VGTM: {
        key: "VGTM",
        name: "Volo’s Guide to Monsters",
        short: "VGtM",
        year: 2016,
        desc: "Расы для игроков и расширенный бестиарий.",
    },
    XGE: {
        key: "XGE",
        name: "Xanathar’s Guide to Everything",
        short: "Xanathar",
        year: 2017,
        desc: "Новые архетипы, заклинания и инструменты для DM.",
    },
    MTOF: {
        key: "MTOF",
        name: "Mordenkainen’s Tome of Foes",
        short: "MToF",
        year: 2018,
        desc: "Новые монстры и лор о планах бытия.",
    },
    GGR: {
        key: "GGR",
        name: "Guildmasters' Guide to Ravnica",
        short: "GGR",
        year: 2018,
        desc: "Руководство для мастеров гильдий Равники.",
    },
    EGW: {
        key: "EGW",
        name: "Explorer's Guide to Wildemount",
        short: "EGW",
        year: 2020,
        desc: "Руководство для исследователей Дикогорья.",
    },
    TCE: {
        key: "TCE",
        name: "Tasha’s Cauldron of Everything",
        short: "Tasha",
        year: 2020,
        desc: "Дополнение с вариантами классов, заклинаниями и магическими предметами.",
    },
    FTD: {
        key: "FTD",
        name: "Fizban’s Treasury of Dragons",
        short: "Fizban",
        year: 2021,
        desc: "Расы драконов, заклинания и лор о драконах.",
    },
    MOTM: {
        key: "MOTM",
        name: "Monsters of the Multiverse",
        short: "MotM",
        year: 2022,
        desc: "Сборник рас и монстров, обновляющий VGtM и MToF.",
    },

    // Примеры приключений (по желанию)
    COS: {
        key: "COS",
        name: "Curse of Strahd",
        short: "CoS",
        year: 2016,
        desc: "Приключение в Баровии.",
    },
    OOTA: {
        key: "OOTA",
        name: "Out of the Abyss",
        short: "OotA",
        year: 2015,
        desc: "Приключение в Подземье.",
    },
    TOA: {
        key: "TOA",
        name: "Tomb of Annihilation",
        short: "ToA",
        year: 2017,
        desc: "Приключение в Чулте.",
    },
};

export function getSourceInfo(key: string): SourceInfo | undefined {
    return SOURCES[key];
}