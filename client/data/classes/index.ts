export { Fighter } from "./Fighter";
export { Rogue } from "./Rogue";
export { Wizard } from "./Wizard";
export { Cleric } from "./Cleric";
export { Ranger } from "./Ranger";
export { Bard } from "./Bard";
export { Barbarian } from "./Barbarian";
export { Monk } from "./Monk";
export { Paladin } from "./Paladin/Paladin";
export { Warlock } from "./Warlock";
export { Sorcerer } from "./Sorcerer";
export { Druid } from "./Druid";

import type { ClassInfo } from "./types";
import { Fighter } from "./Fighter";
import { Rogue } from "./Rogue";
import { Wizard } from "./Wizard";
import { Cleric } from "./Cleric";
import { Ranger } from "./Ranger";
import { Bard } from "./Bard";
import { Barbarian } from "./Barbarian";
import { Monk } from "./Monk";
import { Paladin } from "./Paladin/Paladin";
import { Warlock } from "./Warlock";
import { Sorcerer } from "./Sorcerer";
import { Druid } from "./Druid";

export const CLASS_CATALOG: ClassInfo[] = [
  Fighter,
  Rogue,
  Wizard,
  Cleric,
  Ranger,
  Bard,
  Barbarian,
  Monk,
  Paladin,
  Warlock,
  Sorcerer,
  Druid,
];

// Вспомогательная функция для получения русских названий рас
export const CLASS_LABELS: Record<string, string> = {
  fighter: "Воин",
  rogue: "Плут",
  wizard: "Волшебник",
  cleric: "Жрец",
  ranger: "Следопыт",
  bard: "Бард",
  barbarian: "Варвар",
  monk: "Монах",
  paladin: "Паладин",
  warlock: "Колдун",
  sorcerer: "Чародей",
  druid: "Друид",
};

export function getClassByKey(key: string): ClassInfo | undefined {
    return CLASS_CATALOG.find((a) => a.key === key);
}