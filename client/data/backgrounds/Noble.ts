import { BackgroundInfo } from "./types";

export const Noble: BackgroundInfo = {
  key: "noble",
  source: "PH24",
  name: "Дворянин",
  nameEn: "Noble",
  desc: "Родившийся в знатной семье, привыкший к роскоши и власти.",
  longDesc: "Вы выросли в замке, окруженные богатством, властью и привилегиями. Ваша семья, из мелких аристократов, позаботилась о том, чтобы вы получили первоклассное образование; часть его вы ценили, часть вызывала у вас негодование. Ваше пребывание в замке, особенно долгие часы наблюдений за своей семьей при дворе, также многому научили вас в вопросах лидерства.",
  proficiencies: [  
      { type: "skill", key: "history" },
      { type: "skill", key: "persuasion" },
  ],
  choices: [
    {
      type: "tool-proficiency",
      count: 1,
      options: ["gaming"],
      desc: "Выберите владение одним игровым набором"
    }
  ],
  equipmentChoices: [
    {
      name: "Экипировка дворянина",
      description: "Выберите один из вариантов экипировки",
      choices: [
        {
          name: "Роскошная экипировка",
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
            }, // Игровой набор (выбирается через choices)
            { type: "gear", key: "fine-clothes", quantity: 1 }, // Отличная одежда
            { type: "gear", key: "perfume", quantity: 1 } // Духи
          ],
          gold: 29 // 29 ЗМ
        },
        {
          name: "Денежное жалование",
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
    desc: "Благородное происхождение позволяет вам выбирать между силой, интеллектом и харизмой. Увеличьте один из этих показателей на 2, а другой — на 1 или увеличьте все три показателя на 1. Ни одно из этих увеличений не может повысить показатель выше 20.",
    choices: [
      {
        type: "ability",
        count: 3,
        options: ["str", "int", "cha"],
        abilityMode: "flexible",
        maxSameChoice: 2  // можно выбрать одну способность максимум 2 раза (для +2)
      }
    ]
  },
  {
    key: "skilled",
    name: "Одарённый ",
    feat: "skilled"
  },
  ]
};