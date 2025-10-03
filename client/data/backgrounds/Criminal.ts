import { BackgroundInfo } from "./types";

export const Criminal: BackgroundInfo = {
  key: "criminal",
  name: "Преступник",
  source: "PH24",
  nameEn: "Criminal",
  desc: "Живёт по своим правилам, опыт улиц и теневой жизни.",
  longDesc: "Вы зарабатывали на жизнь в тёмных переулках, срезая кошельки и проникая в лавки. Возможно, вы были частью небольшой банды единомышленников-правонарушителей, присматривавшей друг за другом. А может быть, вы были одиноким волком, не желавшим иметь дел с местной гильдией воров и более грозными нарушителями закона.",
  proficiencies: [  
    { type: "skill", key: "sleight-of-hand" },
    { type: "skill", key: "stealth" },
    { type: "tool-proficiency", key: "thieve" },
],
equipmentChoices: [
  {
    name: "Мешок преступника",
    description: "Выберите один из вариантов экипировки",
    choices: [
      {
        name: "Набор тёмных дел",
        items: [
          { type: "weapon", key: "dagger", quantity: 2 }, 
          { type: "tool", key: "thieve", quantity: 1 }, 
          { type: "gear", key: "crowbar", quantity: 1 },
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
    desc: "Предыстория «Преступник» позволяет вам выбирать между ловкостью, телосложением и интеллектом. Увеличьте один из этих показателей на 2, а другой — на 1 или увеличьте все три показателя на 1. Ни одно из этих увеличений не может повысить показатель выше 20.",
    choices: [
      {
        type: "ability",
        count: 3,
        options: ["dex", "con", "int"],
        abilityMode: "flexible",
        maxSameChoice: 2  // можно выбрать одну способность максимум 2 раза (для +2)
      }
    ]
  },
  {
    key: "alert",
    name: "Бдительный",
    feat: "alert"
  },
  ]
};