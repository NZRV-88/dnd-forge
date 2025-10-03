import * as EQUIPMENT from "@/data/items";
import type { Item } from "@/data/items/";

export type ToolCategory = "artisan" | "musical" | "gaming" | "kit";
export interface Tool {
    key: string;
    name: string;
    nameEn: string;
    desc: string;

    cost: string;
    weight?: number;
    type: string;
    ability: string;
    utilize: string;
    craft?: string[];
    category: string;
}

export const TOOL_CATEGORY_LABELS: Record<string, string> = {
    artisan: "Ремесленный инструмент",
    gaming: "Игральный набор",
    musical: "Музыкальный инструмент",
    other: "Прочее",
};

export const Tools: Tool[] = [
    // Обычные инструменты
    {
        key: "thieve",
        name: "Воровские инструменты",
        nameEn: "Thieves' Tools",
        desc: "Этот изящный набор отмычек, щупов и зеркал на длинной ручке является продолжением рук вора. С их помощью тихая дверь становится входом в сокровищницу, а хитрый замок — всего лишь забавной головоломкой.",
        cost: "25 gp",
        weight: 1,
        type: "Tool",
        ability: "dex",
        utilize: "Взломайте замок (15 СЛ) или обезвредьте ловушку (15 СЛ)",
        category: "kit"
    },
    {
        key: "navigator",
        name: "Набор навигатора",
        nameEn: "Navigator's Tools",
        desc: "Этот набор инструментов, состоящий из компаса, лопаты, длинной веревки и подзорной трубы, позволяет вам ориентироваться на суше и воде.",
        category: "kit",
        cost: "25 gp",
        weight: 2,
        type: "Tool",
        ability: "wis",
        utilize: "Проложите курс (10 СЛ) или определите местоположение по звёздам (15 СЛ)",
    },

    // Музыкальные инструменты
    {
        key: "flute",
        name: "Флейта",
        nameEn: "Flute",
        desc: "Её серебристый голос способен передать шепот листвы и печаль далёких звёзд. Мелодия флейты - это нить, что связывает мир грёз с явью. Она говорит с сердцем напрямую, минуя слова.",
        cost: "2 gp",
        weight: 1,
        type: "Tool",
        ability: "cha",
        utilize: "Сыграйте известную мелодию (10 СЛ) или импровизируйте (15 СЛ)",
        category: "musical"
    },
    {
        key: "drum",
        name: "Барабан",
        nameEn: "Drum",
        desc: "Его ритм - это боевое сердце отряда, пульс земли под ногами и призыв к движению. Он рождает не мелодию, а энергию, что заставляет кровь кипеть. В его гуле слышны топот марша и громовая поступь судьбы.",
        cost: "6 gp",
        weight: 3,
        type: "Tool",
        ability: "cha",
        utilize: "Сыграйте известную мелодию (10 СЛ) или импровизируйте (15 СЛ)",
        category: "musical"
    },
    {
        key: "lute",
        name: "Лютня",
        nameEn: "Lute",
        desc: "Её струны хранят память о всех повестях, спетых у костра, и о любви, прошедшей сквозь годы. Это инструмент сказителей и скитальцев, чьи песни могут растрогать короля и простолюдина. Её музыка - это уютный огонь в ночи и дорога, зовущая вдаль.",
        cost: "35 gp",
        weight: 2,
        type: "Tool",
        ability: "cha",
        utilize: "Сыграйте известную мелодию (10 СЛ) или импровизируйте (15 СЛ)",
        category: "musical"
    },
    {
        key: "violin",
        name: "Скрипка",
        nameEn: "Violin",
        desc: "Её звук - это голос души, способный передать всю боль и всю радость мира. Она плачет и смеётся на одном дыхании, касаясь самых сокровенных струн в сердце. Её мелодия - это история, рассказанная без единого слова.",
        cost: "30 gp",
        weight: 1,
        type: "Tool",
        ability: "cha",
        utilize: "Сыграйте известную мелодию (10 СЛ) или импровизируйте (15 СЛ)",
        category: "musical"
    },
    {
        key: "harp",
        name: "Арфа",
        nameEn: "Harp",
        desc: "Её переливы подобны каплям дождя, падающим в хрустальное озеро, или звёздам, рассыпающимся по ночному небу. Этот инструмент говорит на языке богов и вечных истин, очищая душу каждого слушателя. Его музыка - это чистая магия, воплощённая в струнах и пальцах музыканта.",
        cost: "25 gp",
        weight: 6,
        type: "Tool",
        ability: "cha",
        utilize: "Сыграйте известную мелодию (10 СЛ) или импровизируйте (15 СЛ)",
        category: "musical"
    },
    {
        key: "horn",
        name: "Рог",
        nameEn: "Horn",
        desc: "Его голос рождается в глубине лесов и эхом разносится по горным склонам, неся вести через любые преграды. Он не играет — он провозглашает, зовёт к бою или предупреждает об опасности. Его звук - это призыв, который нельзя проигнорировать, ведь в нём слышится само дыхание истории.",
        cost: "3 gp",
        weight: 2,
        type: "Tool",
        ability: "cha",
        utilize: "Сыграйте известную мелодию (10 СЛ) или импровизируйте (15 СЛ)",
        category: "musical"
    },

    //// Ремесленные инструменты
    //{ key: "alchemist", name: "Инструменты алхимика", nameEn: "Alchemist's Supplies", category: "artisan" },
    //{ key: "potter", name: "Набор гончара", nameEn: "Potter's Tools", category: "artisan" },
    {
        key: "herbalism",
        name: "Набор травника",
        nameEn: "Herbalism Kit",
        desc: `Ваши руки знают тайный язык растений и их целебные свойства. Этот набор — ваша лаборатория, позволяющая создавать лечебные отвары и противоядия даже в глухой чаще, используя лишь то, что предлагает лес.\n\nПерсонаж, владеющий набором для травничества, может создать зелье исцеления. Для этого нужно использовать этот набор и 25 ЗМ сырья в течение 1 дня (8 часов работы).`,
        cost: "5 gp",
        weight: 3,
        type: "Tool",
        ability: "int",
        utilize: "Определите растение (СЛ 10)",
        craft: ["antitoxin", "candle", "healers-kit"],
        category: "artisan"
    },
    {
        key: "calligrapher",
        name: "Набор каллиграфа",
        nameEn: "Calligrapher's Supplies",
        desc: "Ваше перо танцует по пергаменту, превращая чернила в изящные буквы и сложные узоры. Вы владеете искусством, где каждый штрих может скрепить договор, подделать документ или сохранить историю для потомков.",
        cost: "10 gp",
        weight: 5,
        type: "Tool",
        ability: "dex",
        utilize: "Пишите текст с впечатлающим росчерком, который защитит его от подделки (СЛ 15)",
        craft: ["ink"],
        category: "artisan"
    },
    {
        key: "mason",
        name: "Инструменты каменщика",
        nameEn: "Mason's Tools",
        desc: "Если вы владеете каким-либо инструментом, добавляйте свой бонус мастерства к любой проверке способностей, в которой используется этот инструмент. Если вы владеете навыком, который используется в этой проверке, у вас также есть преимущество в этой проверке.",
        cost: "10 gp",
        weight: 8,
        type: "Tool",
        ability: "str",
        utilize: "Высеките символ или отверстие в камне (СЛ 10)",
        craft: ["block-and-tile"],
        category: "artisan"
    },
    {
        key: "cartographer", 
        name: "Инструменты картографа",
        nameEn: "Cartographer's Tools", 
        desc: "В этом кожаном тубусе хранятся белые листы пергамента, заостренные угли и набор точных измерительных инструментов. С их помощью можно запечатлеть очертания береговой линии, изгибы подземных тоннелей или маршрут через незнакомые земли. Каждая линия, нанесенная рукой мастера, способна превратить неизвестность в понятный и надежный путь.",
        cost: "15 gp",
        weight: 6,
        type: "Tool",
        ability: "wis",
        utilize: "Нарисуйте карту небольшой области (СЛ 15)",
        craft: ["map"],
        category: "artisan"
    },
    { 
        key: "leatherworker", 
        name: "Набор кожевника", 
        nameEn: "Leatherworker's Tools", 
        desc: "В этом практичном комплекте собраны все инструменты для работы с кожей: от острых скребков до прочных нитей. С его помощью можно превратить сырую шкуру в эластичную кожу, а затем сшить прочную упряжь, удобную обувь или тиснёный пояс. Каждый предмет в умелых руках становится частью долговечной вещи, способной пережить любые дорожные тяготы.",
        cost: "5 gp",
        weight: 5,
        type: "Tool",
        ability: "dex",
        utilize: "Добавьте рисунок на кожаное изделие (СЛ 10)",
        craft: ["sling", "whip", "hide-armor", "leather-armor", "studded-leather-armor", "backpack", "crossbow-bolt-case", "map-or-scroll-case", "parchment", "pouch", "quiver", "waterskin"],
        category: "artisan" 
    },
    {
        key: "smith",
        name: "Инструменты кузнеца",
        nameEn: "Smith's Tools",
        desc: "Если вы владеете каким-либо инструментом, добавляйте свой бонус мастерства к любой проверке способностей, в которой используется этот инструмент. Если вы владеете навыком, который используется в этой проверке, у вас также есть преимущество в этой проверке.",
        cost: "20 gp",
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
        cost: "20 gp",
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
        cost: "8 gp",
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
        cost: "5 gp",
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
        cost: "10 gp",
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
        cost: "10 gp",
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
        cost: "5 gp",
        type: "Gaming Set",
        ability: "cha",
        utilize: "Обмануть противника с помощью блефа (СЛ 10)",
        craft: [],
        category: "gaming"
    },
    {
        key: "three-dragon-ante",
        name: "Ставка трёх драконов",
        nameEn: "Three-Dragon Ante Set",
        desc: "Если вы владеете каким-либо инструментом, добавляйте свой бонус мастерства к любой проверке способностей, в которой используется этот инструмент. Если вы владеете навыком, который используется в этой проверке, у вас также есть преимущество в этой проверке.",
        cost: "1 gp",
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
    if (!tool) {
        console.log(`getToolName: Инструмент с ключом "${key}" не найден`);
        return key;
    }
    console.log(`getToolName: Найден инструмент "${key}" -> "${tool.name}" (ru) / "${tool.nameEn}" (en)`);
    return lang === "en" ? tool.nameEn : tool.name;
}
