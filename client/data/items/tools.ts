import * as EQUIPMENT from "@/data/items";
import type { Item } from "@/data/items/";

export type ToolCategory = "artisan" | "musical" | "gaming" | "kit";
export interface Tool {
    key: string;
    name: string;
    nameEn: string;
    desc: string;

    cost: number;
    weight: number;
    type: string;
    ability: string;
    utilize: string;
    craft: string[];
    category: string;
}

export const TOOL_CATEGORY_LABELS: Record<string, string> = {
    artisan: "Ремесленные инструменты",
    gaming: "Игральные наборы",
    musical: "Музыкальные инструменты",
    other: "Прочие",
};

export const Tools: Tool[] = [
    // Обычные инструменты
    //{ key: "thieves-tools", name: "Воровские инструменты", nameEn: "Thieves' Tools", category: "kit" },
    //{ key: "navigator", name: "Набор навигатора", nameEn: "Navigator's Tools", category: "kit" },

    //// Музыкальные инструменты
    //{ key: "flute", name: "Флейта", nameEn: "Flute", category: "musical" },
    //{ key: "drum", name: "Барабан", nameEn: "Drum", category: "musical" },
    //{ key: "lute", name: "Лютня", nameEn: "Lute", category: "musical" },

    //// Ремесленные инструменты
    //{ key: "alchemist", name: "Инструменты алхимика", nameEn: "Alchemist's Supplies", category: "artisan" },
    //{ key: "potter", name: "Набор гончара", nameEn: "Potter's Tools", category: "artisan" },
    //{ key: "calligrapher", name: "Набор каллиграфа", nameEn: "Calligrapher's Supplies", category: "artisan" },
    {
        key: "mason",
        name: "Инструменты каменщика",
        nameEn: "Mason's Tools",
        desc: "Если вы владеете каким-либо инструментом, добавляйте свой бонус мастерства к любой проверке способностей, в которой используется этот инструмент. Если вы владеете навыком, который используется в этой проверке, у вас также есть преимущество в этой проверке.",
        cost: 1000,
        weight: 8,
        type: "Tool",
        ability: "str",
        utilize: "Высеките символ или отверстие в камне (СЛ 10)",
        craft: ["block-and-tile"],
        category: "artisan"
    },
    //{ key: "cartographer", name: "Набор картографа", nameEn: "Cartographer's Tools", category: "artisan" },
    //{ key: "leatherworker", name: "Набор кожевника", nameEn: "Leatherworker's Tools", category: "artisan" },
    {
        key: "smith",
        name: "Инструменты кузнеца",
        nameEn: "Smith's Tools",
        desc: "Если вы владеете каким-либо инструментом, добавляйте свой бонус мастерства к любой проверке способностей, в которой используется этот инструмент. Если вы владеете навыком, который используется в этой проверке, у вас также есть преимущество в этой проверке.",
        cost: 2000,
        weight: 8,
        type: "Tool",
        ability: "str",
        utilize: "Поддеть и открыть дверь или контейнер (СЛ 20)",
        craft: ["club", "greatclub", "quarterstaff", "barrel", "chest", "ladder", "pole", "portable-ram", "torch"], // исправить! сделать реализацию исключений.
        category: "artisan"
    },
    {
        key: "brewer",
        name: "Набор пивовара",
        nameEn: "Brewer's Supplies",
        desc: "Если вы владеете каким-либо инструментом, добавляйте свой бонус мастерства к любой проверке способностей, в которой используется этот инструмент. Если вы владеете навыком, который используется в этой проверке, у вас также есть преимущество в этой проверке.",
        cost: 2000,
        weight: 9,
        type: "Tool",
        ability: "int",
        utilize: "Обнаружение отравленного напитка (СЛ 15) или идентификация алкоголя (СЛ 10)",
        craft: ["antitoxin"], 
        category: "artisan"
    },
    {
        key: "carpenter",
        name: "Инструменты плотника",
        nameEn: "Carpenter's Tools",
        desc: "Если вы владеете каким-либо инструментом, добавляйте свой бонус мастерства к любой проверке способностей, в которой используется этот инструмент. Если вы владеете навыком, который используется в этой проверке, у вас также есть преимущество в этой проверке.",
        cost: 800,
        weight: 6,
        type: "Tool",
        ability: "str",
        utilize: "Запечатать или вскрыть дверь или контейнер (СЛ 20)",
        craft: ["club", "greatclub", "quarterstaff", "barrel", "chest", "ladder", "pole", "portable-ram", "torch"],
        category: "artisan",
    },
    //{ key: "cook", name: "Набор повара", nameEn: "Cook's Utensils", category: "artisan" },
    //{ key: "woodcarver", name: "Набор деревообработчика", nameEn: "Woodcarver's Tools", category: "artisan" },
    {
        key: "tinker",
        name: "Инструменты жестянщика",
        nameEn: "Tinker's Tools",
        desc: "Если вы владеете каким-либо инструментом, добавляйте свой бонус мастерства к любой проверке способностей, в которой используется этот инструмент. Если вы владеете навыком, который используется в этой проверке, у вас также есть преимущество в этой проверке.",
        cost: 5000,
        weight: 10,
        type: "Tool",
        ability: "dex",
        utilize: "Соберите крошечный предмет из подручных материалов, который развалится через 1 минуту (СЛ 20)",
        craft: ["musket", "pistol", "bell", "bullseye-lantern", "flask", "hooded-lantern", "hunting-trap", "lock", "manacles", "mirror", "shovel", "signal-whistle", "tinderbox"],
        category: "artisan",
    },
    //{ key: ",", name: "Набор ремонтника", nameEn: ",'s Tools", category: "artisan" },
    //{ key: ",", name: "Набор сапожника", nameEn: ",'s Tools", category: "artisan" },
    //{ key: "glassblower", name: "Набор стеклодува", nameEn: "Glassblower's Tools", category: "artisan" },
    //{ key: "weaver", name: "Набор ткача", nameEn: "Weaver's Tools", category: "artisan" },
    //{ key: "painter", name: "Набор художника", nameEn: "Painter's Supplies", category: "artisan" },
    //{ key: "jeweler", name: "Набор ювелира", nameEn: "Jeweler's Tools", category: "artisan" },

    // Игровые наборы
    {
        key: "dice",
        name: "Игральные кости",
        nameEn: "Dice Set",
        desc: "Если вы владеете каким-либо инструментом, добавляйте свой бонус мастерства к любой проверке способностей, в которой используется этот инструмент. Если вы владеете навыком, который используется в этой проверке, у вас также есть преимущество в этой проверке.",
        cost: 10,
        weight: 0,
        type: "Gaming Set",
        ability: "wis",
        utilize: "Распознать жульничество в игре (СЛ 10)",
        craft: [],
        category: "gaming"
    },
    {
        key: "dragonchess",
        name: "Драконьи шахматы",
        nameEn: "Dragonchess Set",
        desc: "Если вы владеете каким-либо инструментом, добавляйте свой бонус мастерства к любой проверке способностей, в которой используется этот инструмент. Если вы владеете навыком, который используется в этой проверке, у вас также есть преимущество в этой проверке.",
        cost: 100,
        weight: 0.5,
        type: "Gaming Set",
        ability: "int",
        utilize: "Предсказать следующий ход противника (СЛ 15)",
        craft: [],
        category: "gaming"
    },
    {
        key: "playing-cards",
        name: "Игральные карты",
        nameEn: "Playing Card Set",
        desc: "Если вы владеете каким-либо инструментом, добавляйте свой бонус мастерства к любой проверке способностей, в которой используется этот инструмент. Если вы владеете навыком, который используется в этой проверке, у вас также есть преимущество в этой проверке.",
        cost: 50,
        weight: 0,
        type: "Gaming Set",
        ability: "cha",
        utilize: "Обмануть противника с помощью блефа (СЛ 10)",
        craft: [],
        category: "gaming"
    },
    {
        key: "three-dragon-ante",
        name: "Три драконьих анте",
        nameEn: "Three-Dragon Ante Set",
        desc: "Если вы владеете каким-либо инструментом, добавляйте свой бонус мастерства к любой проверке способностей, в которой используется этот инструмент. Если вы владеете навыком, который используется в этой проверке, у вас также есть преимущество в этой проверке.",
        cost: 100,
        weight: 0,
        type: "Gaming Set",
        ability: "cha",
        utilize: "Обмануть противника с помощью блефа (СЛ 15)",
        craft: [],
        category: "gaming"
    },
];

export function getToolKeysByCategory(category: ToolCategory): string[] {
    return Tools.filter((a) => a.category === category).map((a) => a.key);
}

export function getToolByKey(key: string): Tool | undefined {
    return Tools.find((t) => t.key === key);
}

export function getToolName(key: string, lang: "ru" | "en" = "ru"): string {
    const tool = getToolByKey(key);
    if (!tool) return key;
    return lang === "en" ? tool.nameEn : tool.name;
}
