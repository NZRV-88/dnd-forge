// /types/choice.ts

export type ChoiceType =
    | "ability"
    | "skill"
    | "tool"
    | "tool-proficiency"
    | "language"
    | "feat"
    | "spell";

export interface ChoiceOption {
    type: "ability" | "skill" | "tool" | "tool-proficiency" | "language" | "feat" | "spell" | "subclass" | "feature" | "fighting-style";
    count: number;
    value?: number;
    options?: string[];        // конкретный список для выбора 
    spellLevel?: number;      // ограничение по уровню заклинаний
    spellClass?: string;      // например "wizard"
    desc?: string;
    // описание
}