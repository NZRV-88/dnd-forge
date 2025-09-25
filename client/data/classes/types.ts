export type Feature = { name: string; desc: string; source?: string };

export type SubclassInfo = {
    key: string;
    name?: string,
    nameEn?: string,
    desc: string;
    features?: Record<number, Feature[]>;
};

export interface ClassInfo {
    bg?: string; // ссылка на фон карточки класса
    key: string; // ключ класса на английском
    name: string; // название класса на русском
    desc: string; // короткое описание класса
    longDesc?: string; // расширенное описание
    hitDice: number; // кость хитов
    mainStats: string[]; // основные характеристики класса
    subclasses: SubclassInfo[]; // доступные подклассы
    features: Record<number, Feature[]>;
}