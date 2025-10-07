export type DamageTypes = "Дробящий" | "Колющий" | "Рубящий" | "Звук" | "Излучение" | "Кислота" | "Некротический" | "Огонь" | "Психический" | "Силовой" | "Холод" | "Электричество" | "Яд";

export interface DamageType {
    key: DamageTypes;
    nameEn?: string;
    description: string;
}

export const DamageTypes: DamageType[] = [
    { 
        key: "Дробящий",
        nameEn: "Bludgeoning",
        description: "Тупые объекты, сжатие, падение",
    },
    { 
        key: "Колющий",
        nameEn: "Piercing",
        description: "Клыки, прокалывающие объекты",
    },
    { 
        key: "Рубящий",
        nameEn: "Slashing",
        description: "Когти, режущие объекты",
    },
    { 
        key: "Звук",
        nameEn: "Thunder",
        description: "Оглушительный звук",
    },
    { 
        key: "Излучение",
        nameEn: "Radiant",
        description: "Священная энергия, палящая радиация",
    },
    { 
        key: "Кислота",
        nameEn: "Acid",
        description: "Едкие жидкости, пищеварительные ферменты",
    },
    { 
        key: "Некротический",
        nameEn: "Necrotic",
        description: "Энергия, высасывающая жизнь",
    },
    { 
        key: "Огонь",
        nameEn: "Fire",
        description: "Пламя, невыносимый жар",
    },
    { 
        key: "Психический",
        nameEn: "Psychic",
        description: "Энергия, разрывающая разум",
    },
    { 
        key: "Силовой",
        nameEn: "Force",
        description: "Чистая магическая энергия",
    },
    { 
        key: "Холод",
        nameEn: "Cold",
        description: "Ледяная вода, ледяные порывы",
    },
    { 
        key: "Электричество",
        nameEn: "Lightning",
        description: "Молния, электричество",
    },
    { 
        key: "Яд",
        nameEn: "Poison",
        description: "Токсичный газ, яды",
    },
];