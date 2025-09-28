export interface FightingStyle {
    key: string;
    name: string;
    nameEn: string;
    desc: string;
    effect?: {
        type: "armor-class" | "attack-roll" | "damage-roll" | "reroll-damage";
        value?: number;
        condition?: string; // описание условий (например: "wearing-armor", "two-handed-weapon")
    };
}

export const FIGHTING_STYLES: FightingStyle[] = [
    {
        key: "defense",
        name: "Оборона",
        nameEn: "Defense",
        desc: "+1 к КД, пока вы носите броню."
    },
    {
        key: "dueling",
        name: "Дуэлянт",
        nameEn: "Dueling",
        desc: "+2 к урону, если вы сражаетесь оружием в одной руке без второго оружия."
    },
    {
        key: "great_weapon_fighting",
        name: "Боевое оружие",
        nameEn: "Great Weapon Fighting",
        desc: "При броске урона оружием двумя руками можно перебросить кубы урона 1 и 2."
    },
    {
        key: "protection",
        name: "Защита",
        nameEn: "Protection",
        desc: "Реакцией даёте помеху атаке по союзнику рядом с вами, если у вас есть щит."
    },
    {
        key: "archery",
        name: "Стрельба",
        nameEn: "Archery",
        desc: "+2 к броскам атаки дальнобойным оружием."
    },
    {
        key: "two_weapon_fighting",
        name: "Двухоружейный бой",
        nameEn: "Two-Weapon Fighting",
        desc: "Добавляете модификатор характеристики урона к атаке второй рукой."
    }
];
