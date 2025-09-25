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
