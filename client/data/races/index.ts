// Экспорт отдельных рас
export { Human } from "./Human/Human";
export { Elf } from "./Elf/Elf";
export { Dwarf } from "./Dwarf/Dwarf";
export { Halfling } from "./Halfling/Halfling";
export { Gnome } from "./Gnome/Gnome";
export { HalfElf } from "./HalfElf/HalfElf";
export { HalfOrc } from "./HalfOrc/HalfOrc";
export { Tiefling } from "./Tiefling/Tiefling";
export { Dragonborn } from "./Dragonborn/Dragonborn";

// Импорт типов и конкретных рас
import type { RaceInfo } from "./types";
import { Human } from "./Human/Human";
import { Elf } from "./Elf/Elf";
import { Dwarf } from "./Dwarf/Dwarf";
import { Halfling } from "./Halfling/Halfling";
import { Gnome } from "./Gnome/Gnome";
import { HalfElf } from "./HalfElf/HalfElf";
import { HalfOrc } from "./HalfOrc/HalfOrc";
import { Tiefling } from "./Tiefling/Tiefling";
import { Dragonborn } from "./Dragonborn/Dragonborn";

// Каталог всех доступных рас
export const RACE_CATALOG: RaceInfo[] = [
  Human,
  Elf,
  Dwarf,
  Halfling,
  Gnome,
  HalfElf,
  HalfOrc,
  Tiefling,
  Dragonborn,
];

// Вспомогательная функция для поиска расы по ключу
export const getRaceByKey = (key: string): RaceInfo | undefined => {
  return RACE_CATALOG.find(race => race.key === key);
};

// Вспомогательная функция для получения русских названий рас
//export const RACE_LABELS: Record<string, string> = {
//  human: "Человек",
//  elf: "Эльф",
//  dwarf: "Дварф",
//  halfling: "Полурослик",
//  gnome: "Гном",
//  halfElf: "Полуэльф",
//  halfOrc: "Полуорк",
//  tiefling: "Тифлинг",
//  dragonborn: "Драконорождённый",
//};