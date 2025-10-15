import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FRAME_COLORS } from '@/utils/colorUtils';

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
    
    const baseColor = FRAME_COLORS[color as keyof typeof FRAME_COLORS] || FRAME_COLORS.gold;
    
    // Полупрозрачный серый скроллбар
    root.style.setProperty('--scrollbar-thumb', 'rgba(156, 163, 175, 0.6)'); // gray-400 с 60% прозрачности
    root.style.setProperty('--scrollbar-thumb-hover', 'rgba(156, 163, 175, 0.8)'); // gray-400 с 80% прозрачности
    root.style.setProperty('--scrollbar-thumb-active', 'rgba(156, 163, 175, 0.4)'); // gray-400 с 40% прозрачности
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
