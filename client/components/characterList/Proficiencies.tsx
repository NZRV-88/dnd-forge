import React, { useState, useEffect } from "react";
import { useFrameColor } from "@/contexts/FrameColorContext";
import { Settings, X } from "lucide-react";
import { getToolName } from "@/data/items/tools";

// Импортируем FRAME_COLORS из DynamicFrame
const FRAME_COLORS = {
  gold: '#B59E54',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  copper: '#B87333',
  steel: '#71797E',
  red: '#DC2626',
  blue: '#2563EB',
  green: '#16A34A',
  purple: '#9333EA',
  orange: '#EA580C',
  pink: '#EC4899',
  cyan: '#0891B2',
  lime: '#65A30D',
  indigo: '#4F46E5',
  teal: '#0D9488',
  emerald: '#059669',
  rose: '#E11D48',
  amber: '#D97706',
  violet: '#7C3AED',
  fuchsia: '#C026D3',
  sky: '#0284C7',
  stone: '#78716C',
  neutral: '#6B7280',
  zinc: '#71717A',
  slate: '#64748B',
  gray: '#6B7280',
  cool: '#6B7280',
  warm: '#78716C',
  true: '#FFFFFF',
};

const getFrameColor = (color: string) => {
  return FRAME_COLORS[color as keyof typeof FRAME_COLORS] || FRAME_COLORS.gold;
};

// Функция для генерации динамического SVG proficiencyFrame
const getProficiencyFrameSvg = (color: string) => {
  const hexColor = FRAME_COLORS[color as keyof typeof FRAME_COLORS] || FRAME_COLORS.gold;
  
  return `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" id="Слой_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 594.96 724.85" style="enable-background:new 0 0 594.96 724.85;" xml:space="preserve">
<style type="text/css">
	.st0{clip-path:url(#SVGID_00000153686997206779015270000001183223655721033604_);fill:${hexColor};}
</style>
<g>
	<defs>
		<rect id="SVGID_1_" x="2.31" y="2.65" width="592.65" height="720.56"/>
	</defs>
	<clipPath id="SVGID_00000106861218441049207750000012369970898801251741_">
		<use xlink:href="#SVGID_1_"  style="overflow:visible;"/>
	</clipPath>
	<path style="clip-path:url(#SVGID_00000106861218441049207750000012369970898801251741_);fill:${hexColor};" d="M586.56,696.32h-4.52
		V29.53h4.52V696.32z M15.68,695.3h-4.54V28.48h4.54V695.3z M594.96,16.27v-4.09h-13.09V2.65h-5.71c0,0-2.26,3.28-8.34,3.28H29.45
		c-6.08,0-8.34-3.28-8.34-3.28H15.4v9.53H2.31v4.09C7.7,16.27,8,25.09,8,25.09V695.3c0,0-0.3,8.72-5.69,8.72v4.26H15.4v14.92h5.71
		V9.7h555.04v706.45H21.11v7.06c0,0,2.26-3.28,8.34-3.28h538.37c6.05,0,8.31,3.24,8.34,3.28h5.71v-14.92h13.09v-4.26
		c-5.39,0-5.69-8.8-5.69-8.8V25.09C589.27,25.09,589.57,16.27,594.96,16.27z"/>
</g>
</svg>`;
};

type ProficienciesData = {
    armor: string[];
    weapons: string[];
    tools: string[];
    languages: string[];
};

interface ProficienciesProps {
    data?: {
        armors?: string[];
        weapons?: string[];
        toolProficiencies?: string[];
        languages?: string[];
    };
}

// Функция для определения категорий владений
// Переводим языки на русский
const translateLanguages = (languages: string[]) => {
    const translations: { [key: string]: string } = {
        'common': 'Общий',
        'dwarvish': 'Дварфский',
        'elvish': 'Эльфийский',
        'giant': 'Гигантский',
        'gnomish': 'Гномий',
        'goblin': 'Гоблинский',
        'halfling': 'Полуросличий',
        'orc': 'Орочий',
        'abyssal': 'Бездны',
        'celestial': 'Небесный',
        'draconic': 'Драконий',
        'deep speech': 'Глубинная речь',
        'infernal': 'Адский',
        'primordial': 'Первородный',
        'sylvan': 'Лесной',
        'undercommon': 'Подземный общий'
    };
    
    return languages.map(lang => 
        translations[lang.toLowerCase()] || lang
    );
};

export default function Proficiencies({ data }: ProficienciesProps) {
    const { frameColor } = useFrameColor();
    
    const [proficiencies, setProficiencies] = useState<ProficienciesData>({
        armor: data?.armors || [],
        weapons: data?.weapons || [],
        tools: data?.toolProficiencies || [],
        languages: data?.languages || [],
    });

    const [isOpen, setIsOpen] = useState(false);

    // Обновляем данные при изменении пропсов
    useEffect(() => {
        if (data) {
            setProficiencies({
                armor: data.armors || [],
                weapons: data.weapons || [],
                tools: data.toolProficiencies || [],
                languages: data.languages || [],
            });
        } else {
            // Fallback to localStorage if no data provided
            const saved = localStorage.getItem("proficiencies");
            if (saved) setProficiencies(JSON.parse(saved));
        }
    }, [data]);

    // Сохраняем изменения
    useEffect(() => {
        localStorage.setItem("proficiencies", JSON.stringify(proficiencies));
    }, [proficiencies]);

    // Переводим категории на русский
    const translateArmorCategories = (armor: string[]) => {
        const translations: { [key: string]: string } = {
            'light': 'Легкая броня',
            'medium': 'Средняя броня', 
            'heavy': 'Тяжелая броня',
            'shield': 'Щиты'
        };
        
        return armor.map(item => 
            translations[item.toLowerCase()] || item
        );
    };

    // Создаем обратный словарь для поиска источников
    const getArmorSource = (translatedItem: string) => {
        const reverseTranslations: { [key: string]: string } = {
            'Легкая броня': 'light',
            'Средняя броня': 'medium',
            'Тяжелая броня': 'heavy',
            'Щиты': 'shield'
        };
        const originalKey = reverseTranslations[translatedItem];
        return originalKey ? data?.proficiencySources?.armors?.[originalKey] : undefined;
    };

    const translateWeaponCategories = (weapons: string[]) => {
        const translations: { [key: string]: string } = {
            'simple': 'Простое оружие',
            'martial': 'Воинское оружие'
        };
        
        return weapons.map(item => 
            translations[item.toLowerCase()] || item
        );
    };

    const getWeaponSource = (translatedItem: string) => {
        const reverseTranslations: { [key: string]: string } = {
            'Простое оружие': 'simple',
            'Воинское оружие': 'martial'
        };
        const originalKey = reverseTranslations[translatedItem];
        return originalKey ? data?.proficiencySources?.weapons?.[originalKey] : undefined;
    };

    const translateToolCategories = (tools: string[]) => {
        const categoryTranslations: { [key: string]: string } = {
            'artisan': 'Ремесленные инструменты',
            'musical': 'Музыкальные инструменты',
            'gaming': 'Игровые наборы'
        };
        
        return tools.map(item => {
            const lowerItem = item.toLowerCase();
            
            // Если это категория, переводим её
            if (categoryTranslations[lowerItem]) {
                return categoryTranslations[lowerItem];
            }
            
            // Если это конкретный инструмент, используем getToolName
            return getToolName(item, "ru");
        });
    };

    const getToolSource = (translatedItem: string) => {
        const reverseTranslations: { [key: string]: string } = {
            'Ремесленные инструменты': 'artisan',
            'Музыкальные инструменты': 'musical',
            'Игровые наборы': 'gaming'
        };
        
        // Сначала проверяем категории
        const originalKey = reverseTranslations[translatedItem];
        if (originalKey) {
            return data?.proficiencySources?.tools?.[originalKey];
        }
        
        // Если это не категория, ищем по оригинальному ключу среди всех инструментов
        const allTools = data?.proficiencySources?.tools || {};
        for (const [key, source] of Object.entries(allTools)) {
            const translatedKey = getToolName(key, "ru");
            if (translatedKey === translatedItem) {
                return source;
            }
        }
        
        return undefined;
    };

    const categories = {
        armor: translateArmorCategories(proficiencies.armor),
        weapons: translateWeaponCategories(proficiencies.weapons),
        tools: translateToolCategories(proficiencies.tools),
        languages: translateLanguages(proficiencies.languages)
    };


    const renderBlock = (title: string, items: string[], isLast: boolean = false, getSourceFn?: (item: string) => string | undefined) => {
        if (!items || items.length === 0) return null;
        return (
            <div className="mb-4">
                <div className="text-gray-400 font-semibold uppercase text-sm mb-2">
                    {title}
                </div>
                <div className="text-gray-200 text-sm mb-2">
                    {items.map((item, index) => {
                        const source = getSourceFn ? getSourceFn(item) : undefined;
                        return (
                            <span key={item}>
                                <span 
                                    className="cursor-help relative group"
                                    title={source || `Владение: ${item}`}
                                >
                                    {item}
                                    {/* Красивый tooltip */}
                                    {source && (
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                                            <div className="text-white font-semibold">{source}</div>
                                            {/* Стрелочка */}
                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                        </div>
                                    )}
                                </span>
                                {index < items.length - 1 && ", "}
                            </span>
                        );
                    })}
                </div>
                {!isLast && (
                    <div 
                        className="h-px"
                        style={{
                            backgroundColor: `${getFrameColor(frameColor)}40`
                        }}
                    />
                )}
            </div>
        );
    };

    return (
        <div
            className="relative text-gray-300 w-[300px] h-[400px]"
            style={{
                backgroundImage: `url('data:image/svg+xml;charset=utf-8,${encodeURIComponent(getProficiencyFrameSvg(frameColor))}')`,
                backgroundSize: "100% auto",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
            }}
        >
            {/* Фон под рамкой */}
            <div 
                className="absolute inset-2 -z-50 opacity-50"
                style={{
                    backgroundImage: `url('/frames/proficiencyFrameBg.svg')`,
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            />
            
            {/* Контент внутри рамки */}
            <div className="relative z-10 px-4 pt-8 pb-6 pl-6">
                {renderBlock("БРОНЯ", categories.armor, false, getArmorSource)}
                {renderBlock("ОРУЖИЕ", categories.weapons, false, getWeaponSource)}
                {renderBlock("ИНСТРУМЕНТЫ", categories.tools, false, getToolSource)}
                {renderBlock("ЯЗЫКИ", categories.languages, true, (translatedItem) => {
                    // Ищем по переведенному названию среди всех языков
                    const allLanguages = data?.proficiencySources?.languages || {};
                    for (const [key, source] of Object.entries(allLanguages)) {
                        const translatedKey = translateLanguages([key])[0];
                        if (translatedKey === translatedItem) {
                            return source;
                        }
                    }
                    return undefined;
                })}
            </div>

            {/* Заголовок + шестерёнка снизу */}
            <div className="flex items-center justify-center gap-2 text-gray-400 uppercase text-sm font-semibold -mt-2 z-10">
                ВЛАДЕНИЯ
                <button
                    onClick={() => setIsOpen(true)}
                    className="hover:text-yellow-400 focus:outline-none"
                >
                    <Settings size={18} />
                </button>
            </div>

            {/* Модалка */}
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div 
                        className="relative w-[520px] p-6 bg-neutral-900 border-2 rounded-lg shadow-lg text-gray-200"
                        style={{ borderColor: frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'bronze' ? '#CD7F32' : frameColor === 'copper' ? '#B87333' : '#B59E54' }}
                    >
                        {/* Заголовок */}
                        <div className="flex justify-between items-center border-b border-neutral-700 pb-2 mb-4">
                            <h2 className="text-lg font-semibold text-white uppercase">ВЛАДЕНИЯ</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="transition"
                                style={{ 
                                    color: 'inherit',
                                    '--hover-color': frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'bronze' ? '#CD7F32' : frameColor === 'copper' ? '#B87333' : '#B59E54'
                                } as React.CSSProperties}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'bronze' ? '#CD7F32' : frameColor === 'copper' ? '#B87333' : '#B59E54';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = 'inherit';
                                }}
                                title="Закрыть"
                            >
                                <X size={26} strokeWidth={3} />
                            </button>
                        </div>

                        {/* Редактирование */}
                        {(["armor", "weapons", "tools", "languages"] as const).map((key) => (
                            <div key={key} className="mb-4">
                                <label className="block text-sm font-semibold text-gray-300 mb-1">
                                    {key === "armor"
                                        ? "Броня"
                                        : key === "weapons"
                                            ? "Оружие"
                                            : key === "tools"
                                                ? "Инструменты"
                                                : "Языки"}
                                </label>
                                <textarea
                                    value={proficiencies[key].join(", ")}
                                    onChange={(e) =>
                                        setProficiencies({
                                            ...proficiencies,
                                            [key]: e.target.value
                                                .split(",")
                                                .map((s) => s.trim())
                                                .filter(Boolean),
                                        })
                                    }
                                    className="w-full bg-neutral-800 border border-neutral-600 rounded px-2 py-1 text-sm"
                                    rows={2}
                                    placeholder="Введите значения через запятую"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
