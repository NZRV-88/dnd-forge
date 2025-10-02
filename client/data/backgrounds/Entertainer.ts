import { BackgroundInfo } from "./types";

export const Entertainer: BackgroundInfo = {
  key: "entertainer",
  source: "PH24",
  name: "Артист",
  nameEn: "Entertainer",
  desc: "Актер, музыкант, танцор или другой исполнитель.",
  longDesc: "Вы провели большую часть своей юности следуя за бродячими ярмарками и карнавалами, иногда работая на музыкантов и акробатов в обмен на уроки. Возможно, вы научились ходить по канату, играть на лютне в особом стиле или декламировать стихи с безупречной дикцией. По сей день вы наслаждаетесь аплодисментами и стремитесь на сцену.",
  proficiencies: [  
    { type: "skill", key: "acrobatics" },
    { type: "skill", key: "performance" },
],
choices: [
  {
    type: "tool-proficiency",
    count: 1,
    options: ["musical"],
    desc: "Выберите владение одним музыкальным инструментом"
  }
],
equipmentChoices: [
  {
    name: "Экипировка артиста",
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
                options: ["musical"],
                desc: "Выберите музыкальный инструмент"
              }
            ],
            quantity: 1 
          }, 
          { type: "gear", key: "costume", quantity: 2 }, 
          { type: "gear", key: "mirror", quantity: 1 },
          { type: "gear", key: "perfume", quantity: 1 },
          { type: "gear", key: "travelers-clothes", quantity: 1 },
        ],
        gold: 11 // 29 ЗМ
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
    desc: "Предыстория «Артист» позволяет вам выбирать между силой, ловкостью и харизмой. Увеличьте один из этих показателей на 2, а другой — на 1 или увеличьте все три показателя на 1. Ни одно из этих увеличений не может повысить показатель выше 20.",
    choices: [
      {
        type: "ability",
        count: 3,
        options: ["str", "dex", "cha"],
        abilityMode: "flexible",
        maxSameChoice: 2  // можно выбрать одну способность максимум 2 раза (для +2)
      }
    ]
  },
  {
    key: "musician",
    name: "Музыкант ",
    feat: "musician"
  },
  ]
};