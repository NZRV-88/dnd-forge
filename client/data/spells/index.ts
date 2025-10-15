// src/data/spells/index.ts
import { Cantrips } from "./cantrips";
import { SpellsLevel1 } from "./spellLevel1";
import { SpellsLevel2 } from "./spellLevel2";
import { SpellsLevel3 } from "./spellLevel3";
import { SpellsLevel4 } from "./spellLevel4";
import { SpellsLevel5 } from "./spellLevel5";
// import { Level2Spells } from "./level2";
// ...

export const Spells = [
    ...Cantrips,
    ...SpellsLevel1,
    ...SpellsLevel2,
    ...SpellsLevel3,
    ...SpellsLevel4,
    ...SpellsLevel5,
    // ...Level2Spells,
];
