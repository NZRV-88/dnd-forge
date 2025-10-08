import React from "react";
import DynamicFrame from "@/components/ui/DynamicFrame";
import { useFrameColor } from "@/contexts/FrameColorContext";

type Props = {
  stats: Record<string, number>;
  onRoll: (label: string, key: string, value: number, type: string) => void;
};

const ABILITIES: Record<string, string> = {
  str: "СИЛ",
  dex: "ЛОВ",
  con: "ТЕЛ",
  int: "ИНТ",
  wis: "МУД",
  cha: "ХАР",
};

const mod = (v: number) => {
  const m = Math.floor((v - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
};

export default function SavingThrows({ stats, onRoll }: Props) {
  const { frameColor } = useFrameColor();
  
  // Преобразуем цвет из контекста в hex-код
  const getHexColor = (color: string) => {
    const colorMap: Record<string, string> = {
      'gold': '#B59E54',
      'silver': '#C0C0C0',
      'bronze': '#CD7F32',
      'copper': '#B87333',
      'red': '#DC2626',
      'blue': '#2563EB',
      'green': '#16A34A',
      'purple': '#9333EA',
      'orange': '#EA580C',
      'pink': '#EC4899',
      'cyan': '#0891B2',
      'lime': '#65A30D',
      'indigo': '#4F46E5',
      'teal': '#0D9488',
      'amber': '#D97706',
      'emerald': '#059669',
      'rose': '#E11D48',
      'violet': '#7C3AED',
      'fuchsia': '#C026D3',
      'sky': '#0284C7',
      'slate': '#475569',
      'gray': '#6B7280',
      'zinc': '#71717A',
      'neutral': '#737373',
      'stone': '#78716C'
    };
    return colorMap[color] || '#B59E54';
  };
  
  const hexColor = getHexColor(frameColor);
  
  // Функция для осветления цвета
  const lightenColor = (hex: string, amount: number) => {
    // Убираем # если есть
    const color = hex.replace('#', '');
    
    // Преобразуем в RGB
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    
    // Осветляем
    const newR = Math.min(255, Math.floor(r + (255 - r) * amount));
    const newG = Math.min(255, Math.floor(g + (255 - g) * amount));
    const newB = Math.min(255, Math.floor(b + (255 - b) * amount));
    
    // Возвращаем в hex
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  };
  
  const lightColor = lightenColor(hexColor, 0.3); // Осветляем на 30%
  
  // Отладочная информация
  console.log('SavingThrows frameColor:', frameColor, 'hexColor:', hexColor, 'lightColor:', lightColor);
  
  return (
    <DynamicFrame
      frameType="st"
      size="custom"
      className="relative p-4 text-gray-300 w-[300px]"
    >
      {/* Фон под рамкой */}
      <div 
        className="absolute top-1 left-0 right-0 bottom-1 -z-50 opacity-50"
        style={{
          backgroundImage: `url('/frames/STFrameBg.svg')`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transform: 'scaleX(1.14)'
        }}
      />
      
      <div className="grid grid-cols-2 gap-2 mb-4 relative z-10">
        {Object.entries(ABILITIES).map(([key, label]) => {
          const value = stats[key] || 0;
          return (
            <div
              key={key}
              className="relative w-[140px] h-[40px]"
            >
              <DynamicFrame
                frameType="st-mode"
                size="custom"
                className="absolute inset-0 w-[93%] h-full"
              />
              <div className="flex justify-between px-[19px] text-sm mt-[10px] ml-[13px] relative z-10">
                <span className="font-bold">{label}</span>
                <span 
                  className="flex justify-center border-2 rounded-md w-7 h-7 -mt-[3px] transition-all duration-200 relative z-20 cursor-pointer"
                  style={{ 
                    borderColor: `${hexColor}80`,
                    '--hover-bg': `${hexColor}80`
                  } as React.CSSProperties}
                  onClick={() =>
                    onRoll(label, key, value, "Спасбросок")
                  }
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${hexColor}20`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {mod(value)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center text-gray-300 uppercase text-sm font-semibold -mt-2 z-10">
        СПАСБРОСКИ
      </div>
    </DynamicFrame>
  );
}
