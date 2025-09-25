export interface Skill {
    key: string;             // уникальный ключ (eng)
    name: string;            // название на русском
    nameEn: string;          // название на английском
    ability: "STR" | "DEX" | "INT" | "WIS" | "CHA"; // базовая характеристика
    desc?: string;           // описание, если нужно
}
