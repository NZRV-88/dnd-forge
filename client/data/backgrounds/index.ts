export * from "./types";
export * from "./Sage";
export * from "./Criminal";
export * from "./Soldier";
export * from "./Noble";
export * from "./Hermit";
export * from "./Sailor";
export * from "./GuildArtisan";
export * from "./Outlander";
export * from "./Acolyte";
export * from "./Charlatan";
export * from "./Entertainer";
export * from "./FolkHero";
export * from "./Urchin";
export * from "./Wayfarer";
export * from "./Scribe";
export * from "./Guide";
export * from "./Artisan";

import type { BackgroundInfo } from "./types";
import { Sage } from "./Sage";
import { Criminal } from "./Criminal";
import { Soldier } from "./Soldier";
import { Noble } from "./Noble";
import { Hermit } from "./Hermit";
import { Sailor } from "./Sailor";
import { GuildArtisan } from "./GuildArtisan";
import { Outlander } from "./Outlander";
import { Acolyte } from "./Acolyte";
import { Charlatan } from "./Charlatan";
import { Entertainer } from "./Entertainer";
import { FolkHero } from "./FolkHero";
import { Urchin } from "./Urchin";
import { Wayfarer } from "./Wayfarer";
import { Scribe } from "./Scribe";
import { Guide } from "./Guide";
import { Artisan } from "./Artisan";

export const BACKGROUND_CATALOG: BackgroundInfo[] = [
  Acolyte,
  Charlatan,
  Criminal,
  Entertainer,
  FolkHero,
  GuildArtisan,
  Hermit,
  Noble,
  Outlander,
  Sage,
  Sailor,
  Soldier,
  Urchin,
  Wayfarer,
  Scribe,
  Guide,
  Artisan
];

export const BACKGROUND_LABELS: Record<string, string> = {
  acolyte: "Служитель культа",
  charlatan: "Мошенник",
  criminal: "Преступник",
  entertainer: "Артист",
  folkHero: "Народный герой",
  guildArtisan: "Гильдейский ремесленник",
  hermit: "Отшельник",
  noble: "Дворянин",
  outlander: "Чужеземец",
  sage: "Мудрец",
  sailor: "Моряк",
  scribe: "Писарь",
  soldier: "Воин",
  urchin: "Бездомный",
  wayfarer: "Бродяга",
  guide: "Проводник",
  artisan: "Ремесленник"
};

export const getBackgroundByKey = (key: string): BackgroundInfo | undefined => {
  return BACKGROUND_CATALOG.find(bg => bg.key === key);
};