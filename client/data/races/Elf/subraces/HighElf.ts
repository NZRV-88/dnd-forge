import type { SubraceInfo } from "../../types";

export const HighElf: SubraceInfo = {
    key: "high-elf",
    source: "PH14",
    name: "Высший Эльф",
    nameEn: "High Elf",
    desc: "Хранители древней магии и тайных знаний. Их города сияют изяществом архитектуры и величием заклинаний. Обладая острым умом и врождённым магическим талантом, они стремятся к совершенству в искусстве чародейства.",
    traits: [
        {
            name: "Увеличение характеристик",
            desc: "Значение вашего Интеллекта увеличивается на 1",
            abilityBonuses: { int: 1 },
        },
        {
            name: "Эльфийское оружие",
            desc: "Вы владеете коротким и длинным мечом, коротким и длинным луком",
            proficiencies: [
                { type: "weapon", key: "shortsword" },
                { type: "weapon", key: "longsword" },
                { type: "weapon", key: "shortbow" },
                { type: "weapon", key: "longbow" },
            ],
        },
        {
            name: "Дополнительный язык",
            desc: "Вы можете говорить, читать и писать на ещё одном языке, на ваш выбор",
            choices: [
                { type: "language", count: 1 },
            ]

        },
        {
            name: "Заговор",
            desc: "Выберите один заговор из списка заклинаний волшебника. Интеллект — ваша базовая характеристика для него",
            spells: [
                {
                    type: "choice",
                    level: 0,
                    count: 1,
                    desc: "",
                },
            ]

        },
    ],
}