import { BackgroundInfo } from "./types";

export const Acolyte: BackgroundInfo = {
    key: "acolyte",
    source: "PH24",
    nameEn: "Acolyte",
    name: "Послушник",
    desc: "Посвятивший жизнь служению божеству или храму.",
    longDesc: "Вы посвятили себя служению в храме, среди городских улиц или в уединении священной рощи. Там вы совершали обряды в честь бога или пантеона. Вы изучали религию под началом священника. Благодаря его наставлениям и вашей собственной преданности вы научились направлять капельку божественной силы на служение своему месту поклонения и людям, которые там молились.",
    proficiencies: [  
        { type: "skill", key: "insight" },
        { type: "skill", key: "religion" },
        { type: "tool-proficiency", key: "calligrapher" },
    ],
    equipmentChoices: [
      {
        name: "Поклажа послушника",
        description: "Выберите один из вариантов экипировки",
        choices: [
          {
            name: "Святыня скитальца",
            items: [
              { type: "tool", key: "calligrapher", quantity: 1 }, 
              { type: "gear", key: "book", quantity: 1 },
              { type: "gear", key: "holy-symbol", quantity: 1 },
              { type: "gear", key: "parchment", quantity: 10 },
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
        desc: "Предыстория «Послушник» позволяет вам выбирать между интеллектом, мудростью и харизмой. Увеличьте один из этих показателей на 2, а другой — на 1 или увеличьте все три показателя на 1. Ни одно из этих увеличений не может повысить показатель выше 20.",
        choices: [
          {
            type: "ability",
            count: 3,
            options: ["int", "wis", "cha"],
            abilityMode: "flexible",
            maxSameChoice: 2  // можно выбрать одну способность максимум 2 раза (для +2)
          }
        ]
      },
      {
        key: "magic-initiate-cleric",
        name: "Посвящённый в магию (Жрец)",
        feat: "magic-initiate-cleric"
      },
      ]
    };