import { Spell } from "./types";

export const SpellsLevel2: Spell[] = [
    // --- Воплощение (Evocation) ---
    {
        key: "magic-weapon",
        source: "PH24",
        nameEn: "Magic Weapon",
        name: "Магическое оружие",
        level: 2,
        school: "Преобразование",
        desc: `Вы касаетесь немагического оружия. Пока заклинание активно, это оружие становится магическим оружием с бонусом +1 к броскам атаки и урона. Заклинание заканчивается раньше времени, если вы сотворяете его снова.\n\n*Используя ячейку заклинания большего уровня*. Бонус к броскам атаки и урона увеличивается до +2 с ячейкой 3-го, 4-го или 5-го уровня и до +3 с ячейкой 6-го уровня или выше.`,
        isCombat: false,
        castingTime: ["Бонусное действие"],
        range: "Касание",
        components: ["В", "С"],
        duration: "1 час",
        classes: ["wizard", "ranger", "paladin", "sorcerer"],
        subclasses: ["oath-of-glory", "war-domain"],
    },
   
];
