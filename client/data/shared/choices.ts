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
    abilityMode?: "flexible" | "unique"; // flexible: можно +2/+1 или +1/+1/+1, unique: все должны быть разными
    maxSameChoice?: number;   // максимум раз, сколько можно выбрать одну и ту же опцию (для flexible режима)
    // описание
}