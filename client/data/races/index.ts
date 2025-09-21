// Экспорт отдельных рас
export { Human } from "./Human";
export { Elf } from "./Elf/Elf";
export { Dwarf } from "./Dwarf";
export { Halfling } from "./Halfling";
export { Gnome } from "./Gnome";
export { HalfElf } from "./HalfElf";
export { HalfOrc } from "./HalfOrc";
export { Tiefling } from "./Tiefling";
export { Dragonborn } from "./Dragonborn";

// Импорт типов и конкретных рас
import type { RaceInfo } from "./types";
import { Human } from "./Human";
import { Elf } from "./Elf/Elf";
import { Dwarf } from "./Dwarf";
import { Halfling } from "./Halfling";
import { Gnome } from "./Gnome";
import { HalfElf } from "./HalfElf";
import { HalfOrc } from "./HalfOrc";
import { Tiefling } from "./Tiefling";
import { Dragonborn } from "./Dragonborn";

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
export const RACE_LABELS: Record<string, string> = {
  human: "Человек",
  elf: "Эльф",
  dwarf: "Дварф",
  halfling: "Полурослик",
  gnome: "Гном",
  halfElf: "Полуэльф",
  halfOrc: "Полуорк",
  tiefling: "Тифлинг",
  dragonborn: "Драконорождённый",
};