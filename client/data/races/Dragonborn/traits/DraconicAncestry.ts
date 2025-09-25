// === DraconicAncestry.ts — справочник наследий драконорожденных ===

export type DamageType = "Кислота" | "Холод" | "Огонь" | "Молния" | "Яд";

export type BreathShape = {
    shape: "Конус" | "Линия";
    size: string; // пример: "15 фт.", "5×30 фт." и т.д.
    save: "Ловкость" | "Телосложение";
};

export interface BreathWeapon {
    damageType: DamageType; // Тип урона
    breath: BreathShape; // Форма дыхания
    damageByLevel: Record<number, string>; // Урон по уровням
    recharge: string; // Правило восстановления
    description: string; // Короткое атмосферное/техническое описание дыхания
}

export interface DraconicAncestry {
    key: string; // уникальный ключ
    name: string; // отображаемое имя
    description: string; // атмосферное описание (лор)
    breathWeapon: BreathWeapon; // технические данные по дыханию + описание
}

// === Общий шаблон урона дыхания ===
const commonDamageByLevel: Record<number, string> = {
    1: "2к6",
    6: "3к6",
    11: "4к6",
    16: "5к6",
};

export const DraconicAncestries: DraconicAncestry[] = [
    {
        key: "black_dragon",
        name: "Черный дракон",
        description:
            "Затхлые болота и трясины — вот истинное царство черных драконов. Эти хищники наслаждаются разрушением и жестокостью; их присутствие отравляет землю вокруг.",
        breathWeapon: {
            damageType: "Кислота",
            breath: { shape: "Линия", size: "5×30 фт.", save: "Ловкость" },
            damageByLevel: commonDamageByLevel,
            recharge: "Перезаряжается после короткого или долгого отдыха",
            description: "Ваше дыхание изрыгает кислоту тонкой линией.",
        },
    },
    {
        key: "blue_dragon",
        name: "Синий дракон",
        description:
            "Грозовое дитя пустынь — синие драконы носят в себе ярость бурь. Их острый ум и молниеносные атаки делают их опасными противниками.",
        breathWeapon: {
            damageType: "Молния",
            breath: { shape: "Линия", size: "5×30 фт.", save: "Ловкость" },
            damageByLevel: commonDamageByLevel,
            recharge: "Перезаряжается после короткого или долгого отдыха",
            description: "Ваше дыхание высвобождает молнию в виде линии.",
        },
    },
    {
        key: "brass_dragon",
        name: "Латунный дракон",
        description:
            "Латунные драконы — разговорчивые и любопытные странники пустынь. Они предпочитают беседы, но в бою их дыхание может быть обжигающим или усыпляющим.",
        breathWeapon: {
            damageType: "Огонь",
            breath: { shape: "Линия", size: "5×30 фт.", save: "Ловкость" },
            damageByLevel: commonDamageByLevel,
            recharge: "Перезаряжается после короткого или долгого отдыха",
            description: "Ваше дыхание изрыгает пламя в виде линии.",
        },
    },
    {
        key: "bronze_dragon",
        name: "Бронзовый дракон",
        description:
            "Стражи побережий и шумных гаваней, бронзовые драконы славятся храбростью и воинским духом. Их дыхание нередко проявляет молниеносную ярость.",
        breathWeapon: {
            damageType: "Молния",
            breath: { shape: "Линия", size: "5×30 фт.", save: "Ловкость" },
            damageByLevel: commonDamageByLevel,
            recharge: "Перезаряжается после короткого или долгого отдыха",
            description: "Ваше дыхание испускает молнию в виде линии.",
        },
    },
    {
        key: "copper_dragon",
        name: "Медный дракон",
        description:
            "Озорные и находчивые, медные драконы любят шутки и хитрости. В сражении их дыхание часто принимает форму коррозионной струи.",
        breathWeapon: {
            damageType: "Кислота",
            breath: { shape: "Линия", size: "5×30 фт.", save: "Ловкость" },
            damageByLevel: commonDamageByLevel,
            recharge: "Перезаряжается после короткого или долгого отдыха",
            description: "Ваше дыхание изрыгает кислоту тонкой линией.",
        },
    },
    {
        key: "gold_dragon",
        name: "Золотой дракон",
        description:
            "Величественные хранители справедливости, золотые драконы — благородны и могущественны. Их дыхание может быть как пламенем, так и обволакивающим усыпляющим туманом.",
        breathWeapon: {
            damageType: "Огонь",
            breath: { shape: "Конус", size: "15 фт.", save: "Ловкость" },
            damageByLevel: commonDamageByLevel,
            recharge: "Перезаряжается после короткого или долгого отдыха",
            description: "Ваше дыхание испускает пламя конусом.",
        },
    },
    {
        key: "green_dragon",
        name: "Зеленый дракон",
        description:
            "Коварные и хитрые, зеленые драконы воплощают злобу дремучих лесов. Они наслаждаются манипуляциями и охотой на жертву.",
        breathWeapon: {
            damageType: "Яд",
            breath: { shape: "Конус", size: "15 фт.", save: "Телосложение" },
            damageByLevel: commonDamageByLevel,
            recharge: "Перезаряжается после короткого или долгого отдыха",
            description: "Ваше дыхание выпускает облако ядовитого газа конусом.",
        },
    },
    {
        key: "red_dragon",
        name: "Красный дракон",
        description:
            "Олицетворение ярости вулканов, красные драконы — свирепы и горды. Их пламя опаляет всё на своём пути.",
        breathWeapon: {
            damageType: "Огонь",
            breath: { shape: "Конус", size: "15 фт.", save: "Ловкость" },
            damageByLevel: commonDamageByLevel,
            recharge: "Перезаряжается после короткого или долгого отдыха",
            description: "Ваше дыхание испускает пламя конусом.",
        },
    },
    {
        key: "silver_dragon",
        name: "Серебряный дракон",
        description:
            "Благородные стражи небес и союзники смертных. Серебряные драконы несут в себе тихую мощь — лед и стальную волю.",
        breathWeapon: {
            damageType: "Холод",
            breath: { shape: "Конус", size: "15 фт.", save: "Телосложение" },
            damageByLevel: commonDamageByLevel,
            recharge: "Перезаряжается после короткого или долгого отдыха",
            description: "Ваше дыхание выпускает ледяное облако конусом.",
        },
    },
    {
        key: "white_dragon",
        name: "Белый дракон",
        description:
            "Белые драконы — дети вечной зимы. Холод и свирепость делают их смертоносными охотниками северных пустошей.",
        breathWeapon: {
            damageType: "Холод",
            breath: { shape: "Конус", size: "15 фт.", save: "Телосложение" },
            damageByLevel: commonDamageByLevel,
            recharge: "Перезаряжается после короткого или долгого отдыха",
            description: "Ваше дыхание изрыгает морозный воздух конусом.",
        },
    },
];
