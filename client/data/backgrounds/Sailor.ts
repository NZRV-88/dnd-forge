import { BackgroundInfo } from "./types";

export const Sailor: BackgroundInfo = {
  key: "sailor",
  source: "PH24",
  name: "Моряк",
  nameEn: "Sailor",
  desc: "Бывалый моряк, знающий корабли и морские пути.",
  longDesc: "Вы жили на морских просторах, ветер дул вам в спину, и палуба покачивалась под вашими ногами. Вы сидели в большем количестве портовых баров, чем можете припомнить, проходили через сильные шторма и болтали с подводными обитателями.",
  proficiencies: [  
    { type: "skill", key: "acrobatics" },
    { type: "skill", key: "perception" },
    { type: "tool-proficiency", key: "navigator" },
],
equipmentChoices: [
  {
    name: "Экипировка моряка",
    description: "Выберите один из вариантов экипировки",
    choices: [
      {
        name: "Морская поклажа",
        items: [
          { type: "weapon", key: "dagger", quantity: 1 },
          { type: "tool", key: "navigator", quantity: 1 }, 
          { type: "gear", key: "rope", quantity: 1 },
          { type: "gear", key: "travelers-clothes", quantity: 1 },
        ],
        gold: 20
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
  desc: "Предыстория «Моряк» позволяет вам выбирать между силой, ловкостью и мудростью. Увеличьте один из этих показателей на 2, а другой — на 1 или увеличьте все три показателя на 1. Ни одно из этих увеличений не может повысить показатель выше 20.",
  choices: [
    {
      type: "ability",
      count: 3,
      options: ["str", "dex", "wis"],
      abilityMode: "flexible",
      maxSameChoice: 2  // можно выбрать одну способность максимум 2 раза (для +2)
    }
  ]
},
{
  key: "tavern-brawler",
  name: "Дебошир",
  feat: "tavern-brawler"
},
]
};