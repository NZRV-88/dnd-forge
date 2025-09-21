// === Dragonborn.ts — описание расы Драконорожденных ===

import { RaceInfo } from "./types";
import { DraconicAncestries } from "./traits/DraconicAncestry";

export const Dragonborn: RaceInfo = {
    avatar: "/assets/race-avatars/dragonborn.png",
    key: "dragonborn",
    name: "Драконорожденный",
    desc: "Гордая раса, носящая в себе наследие драконов.",
    longDesc: "Драконорожденные — это гордая и благородная раса, потомки древних драконов. Они славятся своей силой, честью и магическим дыханием, отражающим их наследие.",
    speed: 30,
    size: "Средний",
    age: "Живут до 80 лет, взрослеют быстрее людей.",
    alignment: "Чаще всего склонны к законным убеждениям.",
    languages: ["Общий", "Драконий"],
    abilityBonuses: { str: 2, cha: 1 },

    traits: [
        {
            name: "Драконье наследие",
            desc: "Выберите одно из доступных наследий драконов. Оно определяет тип вашего дыхания и сопротивление урону.",
        },
        {
            name: "Оружие дыхания",
            desc: "Вы можете использовать действие, чтобы изрыгнуть разрушительное дыхание. Урон и форма зависят от вашего наследия.",
        },
        {
            name: "Сопротивление урону",
            desc: "Вы получаете сопротивление урону того же типа, что и ваше дыхание.",
        },
    ],

    proficiencies: {
        weapons: [],
        armors: [],
        tools: [],
        languages: ["Общий", "Драконий"],
        skills: [],
        savingThrows: [],
        vision: [],
    },

    // Наследия (вместо subraces)
    ancestries: DraconicAncestries,
};
