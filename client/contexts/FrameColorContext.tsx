import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FrameColorContextType {
  frameColor: string;
  setFrameColor: (color: string) => void;
}

const FrameColorContext = createContext<FrameColorContextType | undefined>(undefined);

export const useFrameColor = () => {
  const context = useContext(FrameColorContext);
  if (!context) {
    throw new Error('useFrameColor must be used within a FrameColorProvider');
  }
  return context;
};

interface FrameColorProviderProps {
  children: ReactNode;
}

export const FrameColorProvider = ({ children }: FrameColorProviderProps) => {
  const [frameColor, setFrameColor] = useState('gold');

  // Функция для обновления цветов скроллбара
  const updateScrollbarColors = (color: string) => {
    const root = document.documentElement;
    
    // Полная палитра цветов
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
    
    const baseColor = FRAME_COLORS[color as keyof typeof FRAME_COLORS] || FRAME_COLORS.gold;
    
    // Создаем более светлые и темные варианты
    const lightColor = adjustColorBrightness(baseColor, 20);
    const darkColor = adjustColorBrightness(baseColor, -20);
    
    root.style.setProperty('--scrollbar-thumb', baseColor);
    root.style.setProperty('--scrollbar-thumb-hover', lightColor);
    root.style.setProperty('--scrollbar-thumb-active', darkColor);
  };
  
  // Функция для изменения яркости цвета
  const adjustColorBrightness = (color: string, percent: number) => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  };

  // Обновляем цвета скроллбара при изменении темы
  const handleSetFrameColor = (color: string) => {
    setFrameColor(color);
    updateScrollbarColors(color);
  };

  // Инициализируем цвета при загрузке
  React.useEffect(() => {
    updateScrollbarColors(frameColor);
  }, []);

  return (
    <FrameColorContext.Provider value={{ frameColor, setFrameColor: handleSetFrameColor }}>
      {children}
    </FrameColorContext.Provider>
  );
};
