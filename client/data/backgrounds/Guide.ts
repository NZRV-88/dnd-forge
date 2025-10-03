import { BackgroundInfo } from "./types";

export const Guide: BackgroundInfo = {
  key: "guide",
  name: "Проводник",
  source: "PH24",
  nameEn: "Guide",
  desc: "Дикий странник, чувствующий душу лесов и сердце гор как своё собственное.",
  longDesc: "Вы вошли в возраст под открытым небом, вдали от обжитых земель. Домом вам было то место, где вы решили расстелить свой спальник. В дикой природе есть чудеса — странные чудовища, девственные леса и ручьи, заросшие руины огромных залов, по которым когда-то ходили великаны — и исследуя их, вы научились постоять за себя. Временами вам доводилось быть проводником дружественным жрецам природы, которые обучали вас основам магии дикой природы.",
  proficiencies: [  
    { type: "skill", key: "survival" },
    { type: "skill", key: "stealth" },
    { type: "tool-proficiency", key: "cartographer" },
],
equipmentChoices: [
  {
    name: "Поклажа проводника",
    description: "Выберите один из вариантов экипировки",
    choices: [
      {
        name: "Дорожный узел",
        items: [
          { type: "weapon", key: "shortbow", quantity: 1 }, 
          { type: "ammunition", key: "arrow", quantity: 20 },
          { type: "tool", key: "cartographer", quantity: 1 }, 
          { type: "gear", key: "bedroll", quantity: 1 },
          { type: "gear", key: "quiver", quantity: 1 },
          { type: "gear", key: "tent", quantity: 1 },
          { type: "gear", key: "travelers-clothes", quantity: 1 },
        ],
        gold: 3
      },
      {
        name: "Только золото",
        items: [], // Без предметов
        gold: 50 // 50 ЗМ
      }
    ]
  }
],
feature: [
  {
    key: "ability-scores",
    name: "Увеличение характеристик ",
    desc: "Предыстория «Проводник» позволяет вам выбирать между ловкостью, телосложением и мудростью. Увеличьте один из этих показателей на 2, а другой — на 1 или увеличьте все три показателя на 1. Ни одно из этих увеличений не может повысить показатель выше 20.",
    choices: [
      {
        type: "ability",
        count: 3,
        options: ["dex", "con", "wis"],
        abilityMode: "flexible",
        maxSameChoice: 2  // можно выбрать одну способность максимум 2 раза (для +2)
      }
    ]
  },
  {
    key: "magic-initiate-druid",
    name: "Посвящённый в магию (Друид)",
    feat: "magic-initiate-druid"
  },
  ]
};