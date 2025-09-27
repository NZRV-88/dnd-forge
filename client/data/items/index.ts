// Собираем всё из подпапок для удобного импорта\экспорта
export { Weapons } from "./weapons";
export { Armors } from "./armors";
export { Tools } from "./tools";

import type { Weapon } from "./weapons";
import type { Armor } from "./armors";
import type { Tool } from "./tools";

import { Weapons } from "./weapons";
import { Armors } from "@/data/items";
import { Tools } from "./tools";


// общий тип
export type Item =
    | Weapon
    | Armor
    | Tool;

// общий каталог
export const ITEMS_CATALOG: Item[] = [
    ...Weapons.map((w): Item => ({ ...w })),
    ...Armors.map((a): Item => ({ ...a })),
    ...Tools.map((t): Item => ({ ...t }))
];

// поиск по ключу
export function getItemByKey(key: string): Item | undefined {
    return ITEMS_CATALOG.find((item) => item.key === key);
}
