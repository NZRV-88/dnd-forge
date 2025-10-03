import { BackgroundInfo } from "./types";

export const Artisan: BackgroundInfo = {
  key: "artisan",
  name: "Ремесленник",
  source: "PH24",
  nameEn: "Artisan",
  desc: "Умелец, знающий, что истинное мастерство кроется в деталях, невидимых глазу обывателя.",
  longDesc: "Вы начали мыть полы и прилавки в мастерской ремесленника за несколько медяков в день, как только окрепли настолько, что могли носить ведро. Когда вы подросли и стали подмастерьем, вы научились как самостоятельно работать азы своего ремесла, так и тому, как умилостивить требовательного подчас покупателя. Ваша профессия также наделила вас внимательным к деталям взглядом.",
  proficiencies: [  
    { type: "skill", key: "investigation" },
    { type: "skill", key: "persuasion" },
    
],
choices: [
  {
    type: "tool-proficiency",
    count: 1,
    options: ["artisan"],
    desc: "Выберите владение одним ремесленным инструментом"
  }
],
equipmentChoices: [
  {
    name: "Багаж ремесленника",
    description: "Выберите один из вариантов экипировки",
    choices: [
      {
        name: "Ящик подмастерья",
        items: [
          { 
            choices: [
              {
                type: "tool",
                count: 1,
                options: ["artisan"],
                desc: "Выберите ремесленный инструмент"
              }
            ],
            quantity: 1 
          },
          { type: "gear", key: "pouch", quantity: 2 }, 
          { type: "gear", key: "travelers-clothes", quantity: 1 },
        ],
        gold: 32
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
    desc: "Предыстория «Ремесленник» позволяет вам выбирать между силой, ловкостью и интеллектом. Увеличьте один из этих показателей на 2, а другой — на 1 или увеличьте все три показателя на 1. Ни одно из этих увеличений не может повысить показатель выше 20.",
    choices: [
      {
        type: "ability",
        count: 3,
        options: ["str", "dex", "int"],
        abilityMode: "flexible",
        maxSameChoice: 2  // можно выбрать одну способность максимум 2 раза (для +2)
      }
    ]
  },
  {
    key: "crafter",
    name: "Мастеровой",
    feat: "crafter"
  },
  ]
};