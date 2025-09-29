// /types/choice.ts

export type ChoiceType =
    | "ability"
    | "skill"
    | "tool"
    | "language"
    | "feat"
    | "spell";

export interface ChoiceOption {
    type: "ability" | "skill" | "tool" | "language" | "feat" | "spell" | "subclass" | "feature" | "fighting-style";
    count: number;
    value?: number;
    options?: string[];        // конкретный список для выбора 
    spellLevel?: number;      // ограничение по уровню заклинаний
    spellClass?: string;      // например "wizard"
    desc?: string;
    // описание
}

//export interface NestedChoice {
//    type: "ability" | "skill" | "tool" | "language" | "feat" | "spell" | "fighting-style" | "class-feature";
//    count: number;
//    value?: number;
//    options?: string[];       // конкретный список для выбора 
//    spellLevel?: number;      // ограничение по уровню заклинаний
//    spellClass?: string;      // например "wizard"
//    desc?: string;            // описание 
//}
