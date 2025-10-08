import type { SOURCES } from "@/data/sources";
export type SourceKey = keyof typeof SOURCES;
import type { DamageTypes } from "@/data/damageTypes";
import { Abilities, ABILITIES } from "@/data/abilities";

export interface Damage {
    dice: string;
    type: DamageTypes;
}

export interface CantripScaling {
    type: "cantrip";
    progression: {
        dice: string;       // базовый куб
        levels: number[];   // уровни персонажа, на которых добавляется ещё куб
    };
}

export interface SlotScaling {
    type: "slot";
    progression: {
        dice?: string;      // куб добавляется при апкасте
        bonus?: number;     // фикс. бонус (например, +1 цель)
        special?: string;   // описание особого эффекта (например, "missile", "extra-target")
    };
}

export type Scaling = CantripScaling | SlotScaling;

export type SpellComponent = "В" | "С" | "М";
export type SpellSchool = "Воплощение" | "Иллюзия" | "Некромантия" | "Ограждение"| "Очарование"| "Преобразование"| "Призыв"| "Прорицание";
export type CastingTime = "Действие" | "Бонусное действие" | "Реакция" | "Ритуал";

export interface Spell {
    key: string;                  // Ключ заклинания на английском в kebab-case
    source: SourceKey;            // Источник заклинания
    name: string;                 // Название заклинания на русском
    nameEn?: string;              // Название заклинания на английском
    level: number;                // Уровень заклинания:0 = заговор, 1+ = заклинание
    school: SpellSchool;          // Школа заклинания
    desc: string;                 // Описание заклинания
    isCombat: boolean;            // Является ли заклинание боевым
    isRitual?: boolean;           // Является ли заклинание ритуалом
    needConcentration?: boolean;  // Нужно ли концентрация для заклинания
    castingTime: CastingTime[];   // Время сотворения заклинания
    range: string;                // Дистанция заклинания
    components: SpellComponent[]; // В, С, М
    duration: string;             // Длительность заклинания
    damage?: Damage;              // Урон заклинания (например, 2d8)
    heal?: string;                // Лечение заклинания (например, 2d8)
    save?: keyof Abilities;       // Спасбросок заклинания
    scaling?: Scaling;            // Масштабирование при использовании ячейки заклинания большего уровня
    tags?: string[];              // Теги заклинания
    classes?: string[];           // Классы, которые могут использовать заклинание
    subclasses?: string[];        // Подклассы, которые могут использовать заклинание
    isLegacy?: boolean;           // Является ли заклинание legacy (всегда true для PH14)
}
