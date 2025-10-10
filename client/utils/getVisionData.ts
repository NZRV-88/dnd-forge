import { CharacterDraft } from "@/store/character";
import { getRaceByKey, getSubraceByKey } from "@/data/races/index";
import type { VisionProficiency } from "@/data/races/types";

export type VisionData = {
    "Ночное зрение": { distance: number; source: string };
    "Слепое зрение": { distance: number; source: string };
    "Чувство вибраций": { distance: number; source: string };
    "Истинное зрение": { distance: number; source: string };
};

/**
 * Извлекает данные о зрении персонажа из расы и подрасы
 */
export function getVisionData(draft: CharacterDraft): VisionData {
    const visions: VisionData = {
        "Ночное зрение": { distance: 0, source: "" },
        "Слепое зрение": { distance: 0, source: "" },
        "Чувство вибраций": { distance: 0, source: "" },
        "Истинное зрение": { distance: 0, source: "" },
    };

    if (!draft.basics.race) return visions;

    const race = getRaceByKey(draft.basics.race);
    if (!race) return visions;

    const raceName = race.name || "Раса";
    const subraceName = draft.basics.subrace ? getSubraceByKey(draft.basics.race, draft.basics.subrace)?.name : null;
    const raceSource = subraceName ? `${raceName} (${subraceName})` : raceName;

    // Обрабатываем зрение из черт расы
    if (race.traits) {
        race.traits.forEach(trait => {
            if (trait.vision) {
                trait.vision.forEach((vision: VisionProficiency) => {
                    if (visions[vision.type].distance < vision.distance) {
                        visions[vision.type] = {
                            distance: vision.distance,
                            source: raceSource
                        };
                    }
                });
            }
        });
    }

    // Обрабатываем зрение из черт подрасы
    if (draft.basics.subrace) {
        const subrace = getSubraceByKey(draft.basics.race, draft.basics.subrace);
        if (subrace?.traits) {
            subrace.traits.forEach(trait => {
                if (trait.vision) {
                    trait.vision.forEach((vision: VisionProficiency) => {
                        if (visions[vision.type].distance < vision.distance) {
                            visions[vision.type] = {
                                distance: vision.distance,
                                source: raceSource
                            };
                        }
                    });
                }
            });
        }
    }

    return visions;
}
