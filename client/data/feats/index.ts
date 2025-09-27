import { ALL_FEATS, Feat } from "./feats";

export const Feats = [
    ...ALL_FEATS,

];

export function getFeatByKey(key: string): Feat | undefined {
    return ALL_FEATS.find((a) => a.key === key);
}