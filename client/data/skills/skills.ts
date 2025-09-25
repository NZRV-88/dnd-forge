import { Skill } from "./types";

export const SKILLS: Skill[] = [
    // Сила
    {
        key: "athletics",
        name: "Атлетика",
        nameEn: "Athletics",
        ability: "STR",
        desc: "Проверки, связанные с прыжками, лазанием и другими физическими усилиями."
    },

    // Ловкость
    {
        key: "acrobatics",
        name: "Акробатика",
        nameEn: "Acrobatics",
        ability: "DEX",
        desc: "Балансирование, прыжки с акробатикой, уклонение от захвата."
    },
    {
        key: "sleight_of_hand",
        name: "Ловкость рук",
        nameEn: "Sleight of Hand",
        ability: "DEX",
        desc: "Карманные кражи, фокусы, манипуляции с предметами."
    },
    {
        key: "stealth",
        name: "Скрытность",
        nameEn: "Stealth",
        ability: "DEX",
        desc: "Проверки на незаметное перемещение и скрывание."
    },

    // Интеллект
    {
        key: "arcana",
        name: "Магия",
        nameEn: "Arcana",
        ability: "INT",
        desc: "Знания о заклинаниях, магических традициях и существах."
    },
    {
        key: "history",
        name: "История",
        nameEn: "History",
        ability: "INT",
        desc: "Исторические события, легенды, цивилизации и хроники."
    },
    {
        key: "investigation",
        name: "Анализ",
        nameEn: "Investigation",
        ability: "INT",
        desc: "Поиск улик, анализ улик, решение головоломок."
    },
    {
        key: "nature",
        name: "Природа",
        nameEn: "Nature",
        ability: "INT",
        desc: "Знания о растениях, животных, погоде и географии."
    },
    {
        key: "religion",
        name: "Религия",
        nameEn: "Religion",
        ability: "INT",
        desc: "Знания о богах, обрядах, религиозных символах."
    },

    // Мудрость
    {
        key: "insight",
        name: "Внимание",
        nameEn: "Insight",
        ability: "WIS",
        desc: "Понимание эмоций и намерений других существ."
    },
    {
        key: "medicine",
        name: "Медицина",
        nameEn: "Medicine",
        ability: "WIS",
        desc: "Оказание первой помощи и диагностика болезней."
    },
    {
        key: "perception",
        name: "Восприятие",
        nameEn: "Perception",
        ability: "WIS",
        desc: "Замечание деталей, поиск скрытых предметов или существ."
    },
    {
        key: "survival",
        name: "Выживание",
        nameEn: "Survival",
        ability: "WIS",
        desc: "Ориентирование, выслеживание, нахождение пищи и воды."
    },
    {
        key: "animal_handling",
        name: "Уход за животными",
        nameEn: "Animal Handling",
        ability: "WIS",
        desc: "Успокаивание животных, объездка лошади, понимание поведения зверей."
    },

    // Харизма
    {
        key: "deception",
        name: "Обман",
        nameEn: "Deception",
        ability: "CHA",
        desc: "Ложь, притворство, отвлечение внимания."
    },
    {
        key: "intimidation",
        name: "Запугивание",
        nameEn: "Intimidation",
        ability: "CHA",
        desc: "Угрозы, давление, демонстрация силы для запугивания."
    },
    {
        key: "performance",
        name: "Выступление",
        nameEn: "Performance",
        ability: "CHA",
        desc: "Пение, танцы, рассказывание историй и иные публичные выступления."
    },
    {
        key: "persuasion",
        name: "Убеждение",
        nameEn: "Persuasion",
        ability: "CHA",
        desc: "Аргументы, дипломатия, уговаривание и установление доверия."
    }
];
