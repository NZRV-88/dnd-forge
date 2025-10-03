import { BackgroundInfo } from "./types";

export const Scribe: BackgroundInfo = {
  key: "scribe",
  source: "PH24",
  nameEn: "Scribe",
  name: "Писарь",
  desc: "Педантичный летописец, превращающий хаос событий в стройные строки манускриптов",
  longDesc: "Годы вашего становления прошли в скриптории, в государственном учреждении или в монастыре, посвященном сохранению знаний. Там вы научились писать чётким почерком, создавая тонко написанные тексты. Возможно, вы переписывали правительственные документы или копировали рукописные тома. Возможно, у вас есть некоторые навыки в написании поэзии, повествовании или научных исследованиях. Прежде всего вы уделяете внимание деталям, что помогает вам избегать ошибок в документах, которые вы копируете и создаёте.",
  proficiencies: [  
    { type: "skill", key: "perception" },
    { type: "skill", key: "investigation" },
    { type: "tool-proficiency", key: "calligrapher" },
],
equipmentChoices: [
  {
    name: "Сундук писаря",
    description: "Выберите один из вариантов экипировки",
    choices: [
      {
        name: "Походная канцелярия",
        items: [
          { type: "tool", key: "calligrapher", quantity: 1 }, 
          { type: "gear", key: "parchment", quantity: 12 },
          { type: "gear", key: "lamp", quantity: 1 },
          { type: "gear", key: "oil", quantity: 3 },
          { type: "gear", key: "fine-clothes", quantity: 1 },
        ],
        gold: 23 
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
    desc: "Предыстория «Писарь» позволяет вам выбирать между ловкостью, интеллектом и мудростью. Увеличьте один из этих показателей на 2, а другой — на 1 или увеличьте все три показателя на 1. Ни одно из этих увеличений не может повысить показатель выше 20.",
    choices: [
      {
        type: "ability",
        count: 3,
        options: ["dex", "int", "wis"],
        abilityMode: "flexible",
        maxSameChoice: 2  // можно выбрать одну способность максимум 2 раза (для +2)
      }
    ]
  },
  {
    key: "skilled",
    name: "Одарённый",
    feat: "skilled"
  },
  ]
};