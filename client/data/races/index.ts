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
export type { Proficiency } from "@/data/proficiencies";


// Импорт типов и конкретных рас
import type { RaceInfo, SubraceInfo } from "./types";
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
  // Сначала ищем по точному ключу
  let race = RACE_CATALOG.find(race => race.key === key);
  
  // Если не найдено, пробуем обратную совместимость для старых ключей
  if (!race) {
    if (key === "halfOrc") {
      race = RACE_CATALOG.find(race => race.key === "half-orc");
    } else if (key === "halfElf") {
      race = RACE_CATALOG.find(race => race.key === "half-elf");
    }
  }
  
  return race;
};

/** Находит подрасу по ключу */
export function getSubraceByKey(raceKey: string, subraceKey: string): SubraceInfo | undefined {
    const race = getRaceByKey(raceKey);
    if (!race || !race.subraces) return undefined;
    return race.subraces.find(s => s.key === subraceKey);
}

/** Возвращает сразу и расу, и подрасу */
export function getRaceAndSubrace(
    raceKey: string,
    subraceKey?: string
): { race?: RaceInfo; subrace?: SubraceInfo } {
    const race = getRaceByKey(raceKey);
    const subrace = race && subraceKey ? race.subraces?.find(s => s.key === subraceKey) : undefined;
    return { race, subrace };
}

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