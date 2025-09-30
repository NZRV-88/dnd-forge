import type { Proficiency } from "@/data/proficiencies";
import type { SOURCES } from "@/data/sources";
import type { ChoiceOption } from "@/data/shared/choices";
export type SourceKey = keyof typeof SOURCES;

export type BackgroundFeature = {
    key: string;
    name: string;
    desc?: string;
    feat?: string;
    choices?: ChoiceOption[];
};

export interface BackgroundInfo {
    key: string;
    source: SourceKey;
    name: string;
    nameEn: string;
    desc: string;
    longDesc?: string;
    proficiencies?: Proficiency[];   // Владение (например: [{ type: "skill", name: "Атлетика" }])
    languages?: string[];
    equipment: string[];
    feature: BackgroundFeature[];
    choices?: ChoiceOption[];
    suggestedCharacteristics?: {
        personalityTraits: string[];
        ideals: string[];
        bonds: string[];
        flaws: string[];
    };
}