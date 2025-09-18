export type Feature = { name: string; desc: string; source?: string };

export type SubclassInfo = {
  key: string;
  desc: string;
  features?: Record<number, Feature[]>;
};

export interface ClassInfo {
  key: string;
  desc: string;
  longDesc?: string; // расширенное описание
  hitDice: number;
  mainStats: string[];
  subclasses: SubclassInfo[];
  features: Record<number, Feature[]>;
}