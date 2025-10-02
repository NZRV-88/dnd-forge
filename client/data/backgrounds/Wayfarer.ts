import { BackgroundInfo } from "./types";

export const Wayfarer: BackgroundInfo = {
  key: "wayfarer",
  source: "PH24",
  name: "Бродяга",
  nameEn: "Wayfarer",
  desc: "Дорога была вашим единственным домом, а её пыль и звёзды стали вашими спутниками.",
  longDesc: "Вы выросли на улицах в окружении таких же злосчастных отбросов общества; с кем-то из них вы дружили, с кем-то соперничали. Вы спали, где придётся, перебиваясь подработками. Временами, когда голод становился невыносимым, вы прибегали к воровству. Тем не менее, вы никогда не теряли своей гордости и не оставляли надежды. Судьба ещё может вам улыбнуться.",
  proficiencies: [  
    { type: "skill", key: "insight" },
    { type: "skill", key: "stealth" },
    { type: "tool-proficiency", key: "thieves-tools" },
],
equipmentChoices: [
  {
    name: "Пожитки путешественника",
    description: "Выберите один из вариантов экипировки",
    choices: [
      {
        name: "Твроческий инвентарь",
        items: [
          { 
            choices: [
              {
                type: "tool",
                count: 1,
                options: ["gaming"],
                desc: "Выберите игровой набор"
              }
            ],
            quantity: 1 
          }, 
          { type: "weapon", key: "dagger", quantity: 2 }, 
          { type: "gear", key: "bedroll", quantity: 1 },
          { type: "gear", key: "pouch", quantity: 2 },
          { type: "gear", key: "travelers-clothes", quantity: 1 },
        ],
        gold: 16 
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
    desc: "Предыстория «Бродяга» позволяет вам выбирать между ловкостью, мудростью и харизмой. Увеличьте один из этих показателей на 2, а другой — на 1 или увеличьте все три показателя на 1. Ни одно из этих увеличений не может повысить показатель выше 20.",
    choices: [
      {
        type: "ability",
        count: 3,
        options: ["dex", "wis", "cha"],
        abilityMode: "flexible",
        maxSameChoice: 2  // можно выбрать одну способность максимум 2 раза (для +2)
      }
    ]
  },
  {
    key: "lucky",
    name: "Везучий ",
    feat: "lucky"
  },
  ]
};