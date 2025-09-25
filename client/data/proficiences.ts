
import { ArmorCategory } from "@/data/items/armors";
import { WeaponCategory } from "@/data/items/weapons";

export type Proficiency =
    | { type: "armor"; category?: ArmorCategory; key?: string }
    | { type: "weapon"; category?: "simple" | "martial"; key?: string }
    | { type: "tool"; key: string }
    | { type: "skill"; key: string }
    | { type: "savingThrow"; key: keyof Abilities };