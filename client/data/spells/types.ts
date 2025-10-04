import type { SOURCES } from "@/data/sources";
export type SourceKey = keyof typeof SOURCES;

export interface Damage {
    dice: string;
    type: string;
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

export interface Spell {
    key: string;
    source: SourceKey;
    name: string;
    nameEn?: string;
    level: number;         // 0 = заговор, 1+ = заклинание
    school: string;
    desc: string;
    isCombat: boolean;
    isRitual?: boolean;
    castingTime: string;
    range: number;
    components: string[];  // В, С, М
    duration: string;
    area?: string;
    damage?: Damage;
    save?: string;
    scaling?: Scaling;
    tags?: string[];
    classes?: string[];
    subclasses?: string[];
    isLegacy?: boolean;

}
