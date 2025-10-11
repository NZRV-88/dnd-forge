import { 
  Hammer, 
  Swords, 
  Sword, 
  Volume2, 
  Sun, 
  Droplets, 
  Skull, 
  Flame, 
  Brain, 
  Zap, 
  Snowflake, 
  Bolt, 
  Skull as PoisonSkull 
} from 'lucide-react';

export type DamageTypes = "Дробящий" | "Колющий" | "Рубящий" | "Звук" | "Излучение" | "Кислота" | "Некротический" | "Огонь" | "Психический" | "Силовой" | "Холод" | "Электричество" | "Яд" | "Лед" | "Гром";

export interface DamageType {
    key: DamageTypes;
    nameEn?: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}

export const DamageTypes: DamageType[] = [
    { 
        key: "Дробящий",
        nameEn: "Bludgeoning",
        description: "Тупые объекты, сжатие, падение",
        icon: Hammer,
        color: "text-gray-400"
    },
    { 
        key: "Колющий",
        nameEn: "Piercing",
        description: "Клыки, прокалывающие объекты",
        icon: Sword,
        color: "text-gray-300"
    },
    { 
        key: "Рубящий",
        nameEn: "Slashing",
        description: "Когти, режущие объекты",
        icon: Swords,
        color: "text-gray-300"
    },
    { 
        key: "Звук",
        nameEn: "Thunder",
        description: "Оглушительный звук",
        icon: Volume2,
        color: "text-purple-400"
    },
    { 
        key: "Излучение",
        nameEn: "Radiant",
        description: "Священная энергия, палящая радиация",
        icon: Sun,
        color: "text-orange-300"
    },
    { 
        key: "Кислота",
        nameEn: "Acid",
        description: "Едкие жидкости, пищеварительные ферменты",
        icon: Droplets,
        color: "text-green-300"
    },
    { 
        key: "Некротический",
        nameEn: "Necrotic",
        description: "Энергия, высасывающая жизнь",
        icon: Skull,
        color: "text-gray-300"
    },
    { 
        key: "Огонь",
        nameEn: "Fire",
        description: "Пламя, невыносимый жар",
        icon: Flame,
        color: "text-red-300"
    },
    { 
        key: "Психический",
        nameEn: "Psychic",
        description: "Энергия, разрывающая разум",
        icon: Brain,
        color: "text-pink-300"
    },
    { 
        key: "Силовой",
        nameEn: "Force",
        description: "Чистая магическая энергия",
        icon: Bolt,
        color: "text-yellow-300"
    },
    { 
        key: "Холод",
        nameEn: "Cold",
        description: "Ледяная вода, ледяные порывы",
        icon: Snowflake,
        color: "text-blue-300"
    },
    { 
        key: "Электричество",
        nameEn: "Lightning",
        description: "Молния, электричество",
        icon: Zap,
        color: "text-blue-400"
    },
    { 
        key: "Яд",
        nameEn: "Poison",
        description: "Токсичный газ, яды",
        icon: PoisonSkull,
        color: "text-purple-400"
    },
    { 
        key: "Лед",
        nameEn: "Ice",
        description: "Ледяная вода, ледяные порывы",
        icon: Snowflake,
        color: "text-blue-300"
    },
    { 
        key: "Гром",
        nameEn: "Thunder",
        description: "Оглушительный звук",
        icon: Volume2,
        color: "text-yellow-300"
    },
];

// Функция для получения иконки по типу урона
export const getIconByType = (damageType: DamageTypes): { icon: React.ComponentType<{ className?: string }>, color: string } => {
    const type = DamageTypes.find(t => t.key === damageType);
    if (type) {
        return { icon: type.icon, color: type.color };
    }
    // Возвращаем иконку по умолчанию для неизвестных типов
    return { icon: Sword, color: "text-gray-400" };
};