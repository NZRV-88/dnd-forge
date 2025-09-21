import { DraconicAncestry } from "./traits/DraconicAncestry";
// types.ts — описания типов для рас и подрас

export type RacialSpell = {
    type: "innate" | "choice";  // innate = фиксированные, choice = выбор
    level: number;              // уровень персонажа, с которого доступно заклинание
    count?: number;             // сколько выбрать (только для choice)
    spells?: string[];          // список ключей заклинаний (для innate)
    desc?: string;              // пояснение
};

// === Владения, которые даёт раса/подраса ===
export type Proficiencies = {
    armors?: string[];                // Владение бронёй (например: ["Лёгкая броня", "Средняя броня"])
    weapons?: string[];              // Владение оружием (например: ["Длинный меч", "Короткий лук"])
    tools?: string[];                // Владение инструментами (например: ["Воровские инструменты"])
    skills?: string[];               // Владение навыками (например: ["Восприятие", "Атлетика"])
    savingThrows?: string[];         // Владение спасбросками (например: ["con", "dex"])
    languages?: string[];            // Дополнительные языки (например: ["Эльфийский"])
    vision?: VisionProficiency[];    // Владение зрением (например: ["Ночное зрение"])
};

// === Расовая способность / черта ===
export type RacialTrait = {
    key?: string;            // Уникальный ключ черты (опционально, для ссылок)
    name: string;            // Короткое имя черты (отображаемое)
    nameEn?: string;          // Короткое имя черты на английском 
    desc: string;            // Подробное описание эффекта/правила
    source?: string;         // Источник/примечание (например: "PHB", "подраса")
};

// === Подраса ===
export type SubraceInfo = {
    key: string;                             // Уникальный ключ подрасы (например: "high-elf")
    name?: string;                           // Отображаемое название подрасы (опционально)
    nameEn?: string;                          // Отображаемое название подрасы на английском
    desc: string;                            // Короткое описание подрасы
    abilityBonuses?: Record<string, number>; // Бонусы к характеристикам (например: { int: 1 })
    traits?: RacialTrait[];                  // Черты, присущие подрасе
    proficiencies?: Proficiencies;           // Владения, предоставляемые подрасой (дополнительно к расе)
    spells?: RacialSpell[];                  // Заклинания от подрасы
    speed?: number;                          // Изменение базовой скорости (например: 35)
};

// === Основная информация о расе ===
export type RaceInfo = {
    key: string;                             // Уникальный ключ расы (например: "elf")
    name: string;                            // Отображаемое название расы
    nameEn?: string;                          // Отображаемое название расы на английском
    desc: string;                            // Короткое описание расы
    longDesc?: string;                       // Развёрнутое описание (опционально)
    speed: number;                           // Базовая скорость в футах (например: 30)
    size?: "Маленький" | "Средний" | "Большой"; // Размер расы
    age?: string;                            // Описание возраста/долголетия
    alignment?: string;                      // Описание склонностей по мировоззрению
    languages?: string[];                    // Базовые языки расы (например: ["Общий", "Эльфийский"])
    abilityBonuses?: Record<string, number>; // Бонусы к характеристикам (например: { dex: 2 })
    traits?: RacialTrait[];                  // Общие расовые черты/умения
    proficiencies?: Proficiencies;           // Владения, предоставляемые расой
    subraces?: SubraceInfo[];                // Список подрас (если есть)
    spells?: RacialSpell[];                  // Заклинания от расы
    ancestries?: DraconicAncestry[];         // Драконье наследие (список вариантов)
    avatar?: string;                          // Путь до аватарки
};

// === Зрение ===
export interface VisionProficiency {
    type: "Ночное зрение" | "Слепое зрение" | "Чувство вибраций" | "Истинное зрение";
    distance: number;
    source: string;
}
