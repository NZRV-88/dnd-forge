import { Spell } from "./types";

export const Cantrips: Spell[] = [
    {
        key: "acid-splash",
        name: "Брызги кислоты",
        level: 0,
        school: "Вызов",
        desc: "Вы бросаете пузырёк кислоты. Одно или два существа должны пройти спасбросок Ловкости, иначе получат урон кислотой.",
        isCombat: true,
        castingTime: "1 действие",
        range: "18 м",
        components: ["В", "С"],
        duration: "мгновенно",
        area: "одно или два существа в пределах 1,5 м друг от друга",
        damage: { dice: "1d6", type: "Кислота" },
        save: "Ловкость",
        scaling: {
            type: "cantrip",
            progression: { dice: "1d6", levels: [5, 11, 17] }
        },
        tags: ["урон", "кислота", "дальний бой"]
    },
    {
        key: "dancing-lights",
        name: "Танцующие огоньки",
        level: 0,
        school: "Созидание",
        desc: "Создаёте до четырёх светящихся огоньков, которые парят в воздухе, освещая пространство.",
        isCombat: false,
        castingTime: "1 действие",
        range: "36 м",
        components: ["В", "С", "М"],
        duration: "Концентрация, до 1 мин.",
        area: "до 4 источников света в пределах 6 м друг от друга",
        tags: ["свет", "утилита", "иллюзия"]
    },
    {
        key: "friends",
        name: "Друзья",
        level: 0,
        school: "Очарование",
        desc: "На одно существо действует преимущество на проверки Харизмы против него.",
        isCombat: false,
        castingTime: "1 действие",
        range: "на себя",
        components: ["В", "С", "М"],
        duration: "Концентрация, до 1 мин.",
        area: "одно существо",
        tags: ["социальное", "очарование"]
    },
    {
        key: "fire-bolt",
        name: "Огненный снаряд",
        level: 0,
        school: "Вызов",
        desc: "Вы запускаете огненный сгусток. Попадание наносит урон огнём и поджигает воспламеняемые предметы.",
        isCombat: true,
        castingTime: "1 действие",
        range: "36 м",
        components: ["В", "С"],
        duration: "мгновенно",
        area: "одно существо или объект",
        damage: { dice: "1d10", type: "Огонь" },
        scaling: {
            type: "cantrip",
            progression: { dice: "1d10", levels: [5, 11, 17] }
        },
        tags: ["урон", "огонь", "дальний бой"]
    },
    {
        key: "light",
        name: "Свет",
        level: 0,
        school: "Созидание",
        desc: "Вы заставляете объект излучать яркий свет в течение 1 часа.",
        isCombat: false,
        castingTime: "1 действие",
        range: "касание",
        components: ["В", "С", "М"],
        duration: "1 час",
        area: "объект до 3 м",
        tags: ["свет", "утилита"]
    },
    {
        key: "mage-hand",
        name: "Рука мага",
        level: 0,
        school: "Вызов",
        desc: "Создаёте спектральную руку, которая может взаимодействовать с предметами на расстоянии.",
        isCombat: false,
        castingTime: "1 действие",
        range: "9 м",
        components: ["В", "С"],
        duration: "1 минута",
        area: "одна спектральная рука",
        tags: ["утилита", "манипуляция"]
    },
    {
        key: "minor-illusion",
        name: "Малая иллюзия",
        level: 0,
        school: "Иллюзия",
        desc: "Создаёте звук или изображение предмета, чтобы обмануть чувства.",
        isCombat: false,
        castingTime: "1 действие",
        range: "9 м",
        components: ["С", "М"],
        duration: "1 минута",
        area: "звук или изображение в кубе 1,5 м",
        tags: ["иллюзия", "контроль"]
    },
    {
        key: "prestidigitation",
        name: "Фокусы",
        level: 0,
        school: "Вызов",
        desc: "Мелкие магические трюки: зажечь свечу, создать запах, оставить отметку и другое.",
        isCombat: false,
        castingTime: "1 действие",
        range: "3 м",
        components: ["В", "С"],
        duration: "до 1 часа",
        tags: ["утилита", "трик"]
    },
    {
        key: "ray-of-frost",
        name: "Луч холода",
        level: 0,
        school: "Вызов",
        desc: "Выстрел холодным лучом, который наносит урон и замедляет цель.",
        isCombat: true,
        castingTime: "1 действие",
        range: "18 м",
        components: ["В", "С"],
        duration: "мгновенно",
        area: "одно существо",
        damage: { dice: "1d8", type: "Холод" },
        scaling: {
            type: "cantrip",
            progression: { dice: "1d8", levels: [5, 11, 17] }
        },
        tags: ["урон", "холод", "замедление"]
    },
    {
        key: "shocking-grasp",
        name: "Электрическое касание",
        level: 0,
        school: "Вызов",
        desc: "Вы ударяете врага электричеством при касании, цель теряет реакцию.",
        isCombat: true,
        castingTime: "1 действие",
        range: "касание",
        components: ["В", "С"],
        duration: "мгновенно",
        area: "одно существо",
        damage: { dice: "1d8", type: "Молния" },
        scaling: {
            type: "cantrip",
            progression: { dice: "1d8", levels: [5, 11, 17] }
        },
        tags: ["урон", "электричество", "ближний бой"]
    },
    {
        key: "true-strike",
        name: "Истинное провидение",
        level: 0,
        school: "Прорицание",
        desc: "Вы указываете пальцем на цель, и на следующий ход получаете преимущество на первую атаку по ней.",
        isCombat: true,
        castingTime: "1 действие",
        range: "9 м",
        components: ["В", "С"],
        duration: "Концентрация, до 1 хода",
        area: "одно существо",
        tags: ["боевое", "атака", "поддержка"]
    }
];
