// Собираем всё из подпапок для удобного импорта\экспорта
export { Weapons } from "./weapons";
export { Armors } from "./armors";
export { Tools } from "./tools";
export { Gears } from "./gear";
export { EQUIPMENT_PACKS } from "./equipment-packs";
export { WEAPON_MASTERY, getWeaponMasteryByKey, getWeaponMasteryDescription } from "./weapon-mastery";

import type { Weapon } from "./weapons";
import type { Armor } from "./armors";
import type { Tool } from "./tools";
import type { Gear, Ammunition } from "./gear";
import type { EquipmentPack } from "./equipment-packs";

import { Weapons } from "./weapons";
import { Armors } from "./armors";
import { Tools } from "./tools";
import { Ammunitions, Gears } from "./gear";
import { EQUIPMENT_PACKS } from "./equipment-packs";


// общий тип
export type Item =
    | Weapon
    | Armor
    | Tool
    | Ammunition
    | Gear;

// общий каталог
export const ITEMS_CATALOG: Item[] = [
    ...Weapons.map((w): Item => ({ ...w })),
    ...Armors.map((a): Item => ({ ...a })),
    ...Tools.map((t): Item => ({ ...t })),
    ...Gears.map((g): Item => ({ ...g })),
    ...Ammunitions.map((a): Item => ({ ...a })),
];

// поиск по ключу
export function getItemByKey(key: string): Item | undefined {
    return ITEMS_CATALOG.find((item) => item.key === key);
}
