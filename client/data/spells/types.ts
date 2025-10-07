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
    key: string;
    source: SourceKey;
    name: string;
    nameEn?: string;
    level: number;         // 0 = заговор, 1+ = заклинание
    school: SpellSchool;
    desc: string;
    isCombat: boolean;
    isRitual?: boolean;
    needConcentration?: boolean;
    castingTime: CastingTime[];
    range: string;
    components: SpellComponent[];  // В, С, М
    duration: string;
    area?: string;
    damage?: Damage;
    heal?: string;
    save?: keyof Abilities;
    scaling?: Scaling;
    tags?: string[];
    classes?: string[];
    subclasses?: string[];
    isLegacy?: boolean;

}
