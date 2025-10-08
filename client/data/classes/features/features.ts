import type { ChoiceOption } from "@/data/shared/choices";

export interface Feature {
    key: string;
    source: string;
    name: string;
    nameEn: string;
    desc: string;
    choices?: ChoiceOption[];
}

export const FEATURES: Feature[] = [
    {
        key: "fighting-style",
        source: "PH24",
        name: "Боевой стиль",
        nameEn: "Fighting Style",
        desc: "Вы получаете черту из категории Боевых стилей на ваш выбор.",
        choices: [
            {
                type: "fighting-style",
                count: 1,
            }
        ]
    },
    {
        key: "blessed-warrior",
        source: "PH24",
        name: "Благословенный воин",
        nameEn: "Blessed Warrior",
        desc: "Вы изучаете два заговора Жреца на ваш выбор. Эти заговоры считаются для вас заклинаниями Паладина и вашей заклинательной характеристикой для них является Харизма. Каждый раз, когда вы получаете уровень Паладина, вы можете заменить один из этих заговоров другим заговором Жреца.",
        choices: [
            {
                type: "spell",
                count: 2,
                spellClass: ["cleric"],
                spellLevel: 0,
            }
        ]
    },
    {
        key: "asi",
        source: "PH24",
        name: "Увеличение характеристик",
        nameEn: "Ability Score Improvement",
        desc: "Увеличьте значение одной из ваших характеристик на 2 или двух из ваших характеристик на 1. Эта черта не может увеличить значение характеристики выше 20.",
        choices: [
            {
                type: "feat",
                count: 1,
            }
        ]
    },
]