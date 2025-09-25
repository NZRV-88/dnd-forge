import { DraconicAncestry } from "./Dragonborn/traits/DraconicAncestry";
import type { SOURCES } from "@/data/sources";
import type { Proficiency } from "@/data/proficiencies";
// types.ts — описания типов для рас и подрас
export type SourceKey = keyof typeof SOURCES;

export type RacialSpell = {
    type: "innate" | "choice";  // innate = фиксированные, choice = выбор
    level: number;              // уровень персонажа, с которого доступно заклинание
    count?: number;             // сколько выбрать (только для choice)
    spells?: string[];          // список ключей заклинаний (для innate)
    desc?: string;              // пояснение
};


// === Расовая способность / черта ===
export type RacialTrait = {
    key?: string;            // Уникальный ключ черты (опционально, для ссылок)
    name: string;            // Короткое имя черты (отображаемое)
    nameEn?: string;         // Короткое имя черты на английском 
    desc: string;            // Подробное описание эффекта/правила
    speed?: number;                          // Изменение базовой скорости (например: 35)
    abilityBonuses?: Record<string, number>; // Бонусы к характеристикам (например: { int: 1 })
    proficiencies?: Proficiency[];   // Владение (например: [{ type: "skill", name: "Атлетика" }])
    //armors?: string[];               // Владение бронёй (например: ["Лёгкая броня", "Средняя броня"])
    //weapons?: string[];              // Владение оружием (например: ["Длинный меч", "Короткий лук"])
    //tools?: string[];                // Владение инструментами (например: ["Воровские инструменты"])
    //skills?: string[];               // Владение навыками (например: ["Восприятие", "Атлетика"])
    //savingThrows?: string[];         // Владение спасбросками (например: ["con", "dex"])
    hpPerLevel?: number;             // Добавление 
    vision?: VisionProficiency[];    // Владение зрением (например: ["Ночное зрение"])
    choices?: ChoiceOption[];        // Если необходимо добавить выбор владением
    spells?: RacialSpell[];          // Заклинания от подрасы на выбор
};

// === Подраса ===
export type SubraceInfo = {
    key: string;                             // Уникальный ключ подрасы (например: "high-elf")
    source: SourceKey;                         // Источник подрасы (например: "PHB", "XGE")
    name?: string;                           // Отображаемое название подрасы (опционально)
    nameEn?: string;                          // Отображаемое название подрасы на английском
    desc: string;                            // Короткое описание подрасы
    isLegacy?: boolean;
    traits?: RacialTrait[];                  // Черты, присущие подрасе
    spells?: RacialSpell[];                  // Заклинания от подрасы
};

// === Основная информация о расе ===
export type RaceInfo = {
    key: string;                             // Уникальный ключ расы (например: "elf")
    source: SourceKey;                          // Источник расы (например: "PHB", "UA")
    name: string;                            // Отображаемое название расы
    nameEn?: string;                          // Отображаемое название расы на английском
    desc: string;                            // Короткое описание расы
    isLegacy?: boolean;
    longDesc?: string                        // Развёрнутое описание (опционально)
    speed: number;                           // Базовая скорость в футах (например: 30)
    size?: "Маленький" | "Средний" | "Большой"; // Размер расы
    age?: string;                            // Описание возраста/долголетия
    alignment?: string[];                      // Описание склонностей по мировоззрению
    languages?: string[];                    // Базовые языки расы (например: ["Общий", "Эльфийский"])
    abilityBonuses?: Record<string, number>; // Бонусы к характеристикам (например: { dex: 2 })
    traits?: RacialTrait[];                  // Общие расовые черты/умения
    subraces?: SubraceInfo[];                // Список подрас (если есть)
    spells?: RacialSpell[];                  // Заклинания от расы
    ancestries?: DraconicAncestry[];         // Драконье наследие (список вариантов)
    avatar?: string;                          // Путь до аватарки
    choices?: ChoiceOption[];
};

// === Зрение ===
export interface VisionProficiency {
    type: "Ночное зрение" | "Слепое зрение" | "Чувство вибраций" | "Истинное зрение";
    distance: number;
    source: string;
}

export interface ChoiceOption {
    type: "ability" | "skill" | "tool" | "language" | "feat" | "spell";
    count: number;
    value?: number; 
    options?: string[];
}

// Возвращает все бонусы характеристик расы + подрасы
export function getAllAbilityBonuses(race: RaceInfo, sub?: SubraceInfo): Record<string, number> {
    const bonuses: Record<string, number> = { ...(race.abilityBonuses || {}) };

    // бонусы от черт расы
    race.traits?.forEach(t => {
        if (t.abilityBonuses) {
            Object.entries(t.abilityBonuses).forEach(([k, v]) => {
                bonuses[k] = (bonuses[k] || 0) + v;
            });
        }
    });

    // бонусы от подрасы
    sub?.traits?.forEach(t => {
        if (t.abilityBonuses) {
            Object.entries(t.abilityBonuses).forEach(([k, v]) => {
                bonuses[k] = (bonuses[k] || 0) + v;
            });
        }
    });

    return bonuses;
}

export function getRaceAbilityBonuses(race: RaceInfo): Record<string, number> {
    const bonuses: Record<string, number> = { ...(race.abilityBonuses || {}) };

    // бонусы от черт расы
    race.traits?.forEach(t => {
        if (t.abilityBonuses) {
            Object.entries(t.abilityBonuses).forEach(([k, v]) => {
                bonuses[k] = (bonuses[k] || 0) + v;
            });
        }
    });
    return bonuses;
}


export function getSubraceAbilityBonuses(sub?: SubraceInfo): Record<string, number> {
    const bonuses: Record<string, number> = { ...({}) };

    // бонусы от подрасы
    sub?.traits?.forEach(t => {
        if (t.abilityBonuses) {
            Object.entries(t.abilityBonuses).forEach(([k, v]) => {
                bonuses[k] = (bonuses[k] || 0) + v;
            });
        }
    });

    return bonuses;
}

export function getEffectiveSpeed(race?: RaceInfo | null, sub?: SubraceInfo | null): number {
    if (!race) return 30; // безопасное значение по умолчанию

    let speed = race.speed ?? 30;

    // Проверяем черты расы
    race.traits?.forEach((t) => {
        if (t.speed) {
            speed = t.speed; // черта может переопределять базовую скорость
        }
    });

    // Проверяем черты подрасы
    sub?.traits?.forEach((t) => {
        if (t.speed) {
            speed = t.speed;
        }
    });

    return speed;
}


