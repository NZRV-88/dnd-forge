import type { Proficiency } from "@/data/proficiencies";

export type BackgroundFeature = {
    name: string;
    desc: string;
};

export interface BackgroundInfo {
    key: string;
    name: string;
    desc: string;
    longDesc?: string;
    proficiencies?: Proficiency[];   // Владение (например: [{ type: "skill", name: "Атлетика" }])
    languages?: string[];
    equipment: string[];
    feature: BackgroundFeature;
    abilityBonuses?: {
        count: number;
        amount: number;
    };
    choices?: ChoiceOption[];
    suggestedCharacteristics?: {
        personalityTraits: string[];
        ideals: string[];
        bonds: string[];
        flaws: string[];
    };
}

export interface ChoiceOption {
    type: "ability" | "skill" | "tool" | "language" | "feat" | "spell";
    count: number;
    value?: number;
    options?: string[];
}