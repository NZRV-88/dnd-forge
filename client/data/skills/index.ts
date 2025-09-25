import { SKILLS } from "./skills";
import { Skill } from "./types";

// Мапа "ключ → русское название"
export const SKILL_LABELS: Record<string, string> = Object.fromEntries(
    SKILLS.map(s => [s.key, s.name])
);

// Мапа "ключ → английское название"
export const SKILL_LABELS_EN: Record<string, string> = Object.fromEntries(
    SKILLS.map(s => [s.key, s.nameEn])
);

// Утилита для поиска
export function getSkillByKey(key: string): Skill | undefined {
    return SKILLS.find(s => s.key === key);
}

export { SKILLS };

export function getSkillName(key: string, lang: "ru" | "en" = "ru"): string {
    const skill = SKILLS.find((s) => s.key === key);
    if (!skill) return key;
    return lang === "en" ? skill.nameEn : skill.name;
}

