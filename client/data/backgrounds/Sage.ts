import { BackgroundInfo } from "./types";

export const Sage: BackgroundInfo = {
  key: "sage",
  source: "PH24",
  nameEn: "Sage",
  name: "Мудрец",
  desc: "Учёный, исследователь знаний и древностей.",
  longDesc: "Вы провели свои юные годы, путешествуя между поместьями и монастырями, выполняя для них работу и оказывая услуги в обмен на доступ к их библиотекам. Вы провели много долгих вечеров за книгами и свитками; вы изучали знания о мультивселенной, и даже основы магии — и ваш разум жаждет большего.",
  proficiencies: [  
    { type: "skill", key: "history" },
    { type: "skill", key: "arcana" },
    { type: "tool-proficiency", key: "calligrapher" },
],
equipmentChoices: [
  {
    name: "Экипировка мудреца",
    description: "Выберите один из вариантов экипировки",
    choices: [
      {
        name: "Учёный багаж",
        items: [
          { type: "weapon", key: "quarterstaff", quantity: 1 },
          { type: "tool", key: "calligrapher", quantity: 1 },
          { type: "gear", key: "book", quantity: 1 },
          { type: "gear", key: "parchment", quantity: 1 },
          { type: "gear", key: "robe", quantity: 1 },
        ],
        gold: 8
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
  desc: "Предыстория «Мудрец» позволяет вам выбирать между телосложением, интеллектом и мудростью. Увеличьте один из этих показателей на 2, а другой — на 1 или увеличьте все три показателя на 1. Ни одно из этих увеличений не может повысить показатель выше 20.",
  choices: [
    {
      type: "ability",
      count: 3,
      options: ["con", "int", "wis"],
      abilityMode: "flexible",
      maxSameChoice: 2  // можно выбрать одну способность максимум 2 раза (для +2)
    }
  ]
},
{
  key: "magic-initiate-wizard",
  name: "Посвящённый в магию (Волшебник)",
  feat: "magic-initiate-wizard"
},
]
};