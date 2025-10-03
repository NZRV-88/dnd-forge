import { BackgroundInfo } from "./types";

export const Hermit: BackgroundInfo = {
  key: "hermit",
  source: "PH24",
  nameEn: "Hermit",
  name: "Отшельник",
  desc: "Живущий в уединении, ищущий духовные или философские истины.",
  longDesc: "Вы провели свои ранние годы в одиночестве, в хижине или монастыре, далеко за пределами ближайшего поселения. В те дни единственными вашими спутниками были лесные обитатели и те, кто время от времени навещал вас, принося новости о внешнем мире и припасы. В уединении вы провели много часов, размышляя о тайнах сотворения мира.",
  proficiencies: [  
    { type: "skill", key: "medicine" },
    { type: "skill", key: "religion" },
    { type: "tool-proficiency", key: "herbalism" },
],
equipmentChoices: [
  {
    name: "Вьючка отшельника",
    description: "Выберите один из вариантов экипировки",
    choices: [
      {
        name: "Затворнический скарб",
        items: [
          { type: "weapon", key: "quarterstaff", quantity: 1 }, 
          { type: "tool", key: "herbalism", quantity: 1 }, 
          { type: "gear", key: "bedroll", quantity: 1 },
          { type: "gear", key: "book", quantity: 1 },
          { type: "gear", key: "lamp", quantity: 1 },
          { type: "gear", key: "oil", quantity: 3 },
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
    desc: "Предыстория «Отшельник» позволяет вам выбирать между телосложением, мудростью и харизмой. Увеличьте один из этих показателей на 2, а другой — на 1 или увеличьте все три показателя на 1. Ни одно из этих увеличений не может повысить показатель выше 20.",
    choices: [
      {
        type: "ability",
        count: 3,
        options: ["con", "wis", "cha"],
        abilityMode: "flexible",
        maxSameChoice: 2  // можно выбрать одну способность максимум 2 раза (для +2)
      }
    ]
  },
  {
    key: "healer",
    name: "Лекарь ",
    feat: "healer"
  },
  ]
};