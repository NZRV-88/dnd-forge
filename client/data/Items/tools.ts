import * as EQUIPMENT from "@/data/items";
import type { Item } from "@/data/items/";

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
    group: string;
}

export const Tools: Tool[] = [
    // Обычные инструменты
    //{ key: "thieves-tools", name: "Воровские инструменты", nameEn: "Thieves' Tools", group: "common" },
    //{ key: "navigator", name: "Набор навигатора", nameEn: "Navigator's Tools", group: "common" },

    //// Музыкальные инструменты
    //{ key: "flute", name: "Флейта", nameEn: "Flute", group: "musical" },
    //{ key: "drum", name: "Барабан", nameEn: "Drum", group: "musical" },
    //{ key: "lute", name: "Лютня", nameEn: "Lute", group: "musical" },

    //// Ремесленные инструменты
    //{ key: "alchemist", name: "Инструменты алхимика", nameEn: "Alchemist's Supplies", group: "artisan" },
    //{ key: "potter", name: "Набор гончара", nameEn: "Potter's Tools", group: "artisan" },
    //{ key: "calligrapher", name: "Набор каллиграфа", nameEn: "Calligrapher's Supplies", group: "artisan" },
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
        group: "artisan"
    },
    //{ key: "cartographer", name: "Набор картографа", nameEn: "Cartographer's Tools", group: "artisan" },
    //{ key: "leatherworker", name: "Набор кожевника", nameEn: "Leatherworker's Tools", group: "artisan" },
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
        group: "artisan"
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
        group: "artisan"
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
        group: "artisan",
    },
    //{ key: "cook", name: "Набор повара", nameEn: "Cook's Utensils", group: "artisan" },
    //{ key: "woodcarver", name: "Набор деревообработчика", nameEn: "Woodcarver's Tools", group: "artisan" },
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
        group: "artisan",
    },
    //{ key: ",", name: "Набор ремонтника", nameEn: ",'s Tools", group: "artisan" },
    //{ key: ",", name: "Набор сапожника", nameEn: ",'s Tools", group: "artisan" },
    //{ key: "glassblower", name: "Набор стеклодува", nameEn: "Glassblower's Tools", group: "artisan" },
    //{ key: "weaver", name: "Набор ткача", nameEn: "Weaver's Tools", group: "artisan" },
    //{ key: "painter", name: "Набор художника", nameEn: "Painter's Supplies", group: "artisan" },
    //{ key: "jeweler", name: "Набор ювелира", nameEn: "Jeweler's Tools", group: "artisan" },

    
    



    
    

    
    
];
