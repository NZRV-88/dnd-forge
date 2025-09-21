export type BackgroundFeature = {
  name: string;
  desc: string;
};

export interface BackgroundInfo {
  key: string;
  name: string;
  desc: string;
  longDesc?: string;
  skillProficiencies: string[];
  toolProficiencies?: string[];
  languages?: string[];
  equipment: string[];
  feature: BackgroundFeature;
  abilityBonuses?: {
    count: number;
    amount: number;
  };
  suggestedCharacteristics?: {
    personalityTraits: string[];
    ideals: string[];
    bonds: string[];
    flaws: string[];
  };
}