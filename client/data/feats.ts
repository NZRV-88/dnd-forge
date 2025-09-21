import type { Abilities } from "@/store/character";

export interface Feat {
  key: string;
  name: string;
  desc: string;
  effects?: {
    abilities?: Partial<Record<keyof Abilities, number>>;
    abilityChoice?: (keyof Abilities)[];
    skills?: Partial<Record<string, number>>;
    initiative?: number;
    speed?: number;
    hp?: number; // бонус хитов за уровень
    proficiencies?: string[];
    extraTraits?: any;
  };
  prerequisites?: {
    abilities?: Partial<Record<keyof Abilities, number>>;
    races?: string[];
    feats?: string[];
    level?: number;
  };
}

export const ALL_FEATS: Feat[] = [
  {
    key: "actor",
    name: "Актёр",
    desc: "Вы лучше обманываете и выступаете, а также можете подражать чужой речи.",
    effects: { abilities: { cha: 1 }, skills: { "Обман": 2, "Выступление": 2 } },
  },
  {
    key: "alert",
    name: "Бдительный",
    desc: "Вы получаете +5 к инициативе, не можете быть застигнуты врасплох.",
    effects: { initiative: 5 },
  },
  {
    key: "athlete",
    name: "Атлет",
    desc: "Вы улучшаете Силу или Ловкость (на выбор) и получаете бонусы к прыжкам и лазанию.",
    effects: { abilityChoice: ["str", "dex"] },
  },
  {
    key: "charger",
    name: "Удар с разбега",
    desc: "Если вы используете рывок, можете нанести усиленный удар или толчок.",
  },
  {
    key: "crossbow_expert",
    name: "Эксперт арбалета",
    desc: "Игнорируете свойство Loading, можете стрелять вблизи без помех.",
  },
  {
    key: "defensive_duelist",
    name: "Защитный дуэлянт",
    desc: "Если у вас finesse оружие, можете реакцией добавить бонус мастерства к КД.",
    prerequisites: { abilities: { dex: 13 } },
  },
  {
    key: "dual_wielder",
    name: "Мастер парного оружия",
    desc: "Можете использовать не-лёгкое оружие в каждой руке и получаете +1 к КД.",
  },
  {
    key: "dungeon_delver",
    name: "Исследователь подземелий",
    desc: "Вы внимательнее к ловушкам и тайным дверям, устойчивее к их эффектам.",
  },
  {
    key: "durable",
    name: "Выносливый",
    desc: "Бонус +1 к Телосложению и минимум восстановления здоровья на отдыхе = 2× модификатор Телосложения.",
    effects: { abilities: { con: 1 } },
  },
  {
    key: "elemental_adept",
    name: "Владыка стихий",
    desc: "Заклинания выбранного типа урона игнорируют сопротивление.",
  },
  {
    key: "grappler",
    name: "Борец",
    desc: "Вы лучше удерживаете врагов в захвате.",
    prerequisites: { abilities: { str: 13 } },
  },
  {
    key: "great_weapon_master",
    name: "Мастер тяжёлого оружия",
    desc: "Вы наносите разрушительные удары тяжёлым оружием и получаете бонусные атаки.",
    extraTraits: { damageTradeOff: { attackPenalty: -5, damageBonus: 10 } },
  },
  {
    key: "healer",
    name: "Целитель",
    desc: "Вы эффективнее используете аптечки и можете лечить союзников.",
  },
  {
    key: "heavily_armored",
    name: "Тяжёлая броня",
    desc: "Вы обучены ношению тяжёлой брони и получаете +1 к Силе.",
    effects: { abilities: { str: 1 } },
  },
  {
    key: "heavy_armor_master",
    name: "Мастер тяжёлой брони",
    desc: "В тяжёлой броне вы снижаете физический урон на 3.",
    effects: { abilities: { str: 1 } },
  },
  {
    key: "inspiring_leader",
    name: "Вдохновляющий лидер",
    desc: "Можете давать союзникам временные хиты через речь.",
    effects: { abilities: { cha: 1 } },
  },
  {
    key: "keen_mind",
    name: "Острый ум",
    desc: "Вы всегда знаете направление, время и запоминаете детали.",
    effects: { abilities: { int: 1 } },
  },
  {
    key: "lightly_armored",
    name: "Лёгкая броня",
    desc: "Вы обучены лёгкой броне и получаете +1 к Силе или Ловкости.",
    effects: { abilityChoice: ["str", "dex"] },
  },
  {
    key: "linguist",
    name: "Лингвист",
    desc: "Вы изучаете три языка и лучше создаёте шифры.",
    effects: { abilities: { int: 1 } },
  },
  {
    key: "lucky",
    name: "Удачливый",
    desc: "Вы можете перебрасывать кубы три раза в день.",
  },
  {
    key: "mage_slayer",
    name: "Охотник на магов",
    desc: "Вы эффективнее сражаетесь против заклинателей.",
  },
  {
    key: "magic_initiate",
    name: "Магическое посвящение",
    desc: "Выучиваете 2 заговорa и одно заклинание 1 уровня из выбранного класса.",
  },
  {
    key: "martial_adept",
    name: "Боевой адепт",
    desc: "Получаете 2 приёма и 1 куб боевого превосходства.",
  },
  {
    key: "medium_armor_master",
    name: "Мастер средней брони",
    desc: "Можете добавить +3 Ловкости к КД в средней броне.",
  },
  {
    key: "mobile",
    name: "Подвижный",
    desc: "Ваша скорость увеличивается на 10 футов.",
    effects: { speed: 10 },
  },
  {
    key: "moderately_armored",
    name: "Средняя броня",
    desc: "Вы обучены средней броне и щитам и получаете +1 к характеристике.",
    effects: { abilityChoice: ["str", "dex"] },
  },
  {
    key: "mounted_combatant",
    name: "Всадник",
    desc: "Вы эффективнее сражаетесь верхом и защищаете маунта.",
  },
  {
    key: "observant",
    name: "Наблюдательный",
    desc: "Бонус +1 к Интеллекту или Мудрости и лучшее восприятие деталей.",
    effects: { abilityChoice: ["int", "wis"] },
  },
  {
    key: "polearm_master",
    name: "Мастер древкового оружия",
    desc: "Вы можете делать дополнительные атаки древковым оружием.",
  },
  {
    key: "resilient",
    name: "Устойчивый",
    desc: "Бонус +1 к характеристике и владение её спасброском.",
    effects: { abilityChoice: ["str", "dex", "con", "int", "wis", "cha"] },
  },
  {
    key: "ritual_caster",
    name: "Ритуальный заклинатель",
    desc: "Вы можете изучать и применять ритуальные заклинания.",
  },
  {
    key: "savage_attacker",
    name: "Свирепый атакующий",
    desc: "Раз в ход можно перебросить урон оружия и выбрать лучший результат.",
  },
  {
    key: "sentinel",
    name: "Страж",
    desc: "Вы лучше контролируете поле боя, атаки врагов рядом с вами сложнее.",
  },
  {
    key: "sharpshooter",
    name: "Меткий стрелок",
    desc: "Дальнобойные атаки игнорируют укрытия, штраф −5 к атаке = +10 урона.",
    extraTraits: { damageTradeOff: { attackPenalty: -5, damageBonus: 10 } },
  },
  {
    key: "shield_master",
    name: "Мастер щита",
    desc: "Вы используете щит для защиты и атаки, добавляете его к спасброскам Ловкости.",
  },
  {
    key: "skilled",
    name: "Опытный",
    desc: "Вы получаете владение тремя новыми навыками или инструментами.",
  },
  {
    key: "skulker",
    name: "Скрытный",
    desc: "Вы лучше прячетесь и стреляете из укрытия.",
    effects: { abilities: { dex: 1 } },
  },
  {
    key: "spell_sniper",
    name: "Заклинатель-снайпер",
    desc: "Ваши заклинания атакующего типа бьют дальше и игнорируют укрытия.",
  },
  {
    key: "tavern_brawler",
    name: "Драчун",
    desc: "Вы лучше дерётесь без оружия и хватаете врагов.",
    effects: { abilityChoice: ["str", "con"] },
  },
  {
    key: "tough",
    name: "Живучий",
    desc: "Ваши максимальные хиты увеличиваются на 2 за каждый уровень.",
    effects: { hp: 2 },
  },
  {
    key: "war_caster",
    name: "Боевой заклинатель",
    desc: "Вы лучше концентрируетесь на заклинаниях и используете их в бою.",
  },
  {
    key: "weapon_master",
    name: "Мастер оружия",
    desc: "Вы получаете владение четырьмя видами оружия и +1 к характеристике.",
    effects: { abilityChoice: ["str", "dex"] },
  },
];
