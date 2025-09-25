export interface Language {
    key: string;
    name: string;
    nameEn: string;
}

export const LANGUAGES: Language[] = [
    { key: "common", name: "Общий", nameEn: "Common" },
    { key: "dwarvish", name: "Дварфийский", nameEn: "Dwarvish" },
    { key: "elvish", name: "Эльфийский", nameEn: "Elvish" },
    { key: "gnomish", name: "Гномий", nameEn: "Gnomish" },
    { key: "orcish", name: "Орочий", nameEn: "Orc" },
    { key: "goblin", name: "Гоблинский", nameEn: "Goblin" },
    { key: "halfling", name: "Халфлингский", nameEn: "Halfling" },
    { key: "draconic", name: "Драконий", nameEn: "Draconic" },
    { key: "giant", name: "Гигантский", nameEn: "Giant" },
    { key: "sylvan", name: "Сильван", nameEn: "Sylvan" },
    { key: "celestial", name: "Небесный", nameEn: "Celestial" },
    { key: "infernal", name: "Инфернальный", nameEn: "Infernal" },
    { key: "abyssal", name: "Бездны", nameEn: "Abyssal" },
];

/**
 * Получить название языка по ключу.
 * @param key ключ языка (например "elvish")
 * @param locale "ru" | "en"
 */
export function getLanguageName(key: string, locale: "ru" | "en" = "ru"): string {
    const lang = LANGUAGES.find((l) => l.key === key);
    if (!lang) return key; // fallback
    return locale === "en" ? lang.nameEn : lang.name;
}
