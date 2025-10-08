// src/data/spells/index.ts
import { Cantrips } from "./cantrips";
import { SpellsLevel1 } from "./spellLevel1";
import { SpellsLevel2 } from "./spellLevel2";
// import { Level2Spells } from "./level2";
// ...

export const Spells = [
    ...Cantrips,
    ...SpellsLevel1,
    ...SpellsLevel2
    // ...Level2Spells,
];
