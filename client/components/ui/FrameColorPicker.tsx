import React, { useState } from 'react';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Palette, Check } from 'lucide-react';
import { FRAME_COLORS } from '@/utils/colorUtils';

interface FrameColorPickerProps {
  currentColor: string;
  onColorChange: (color: string) => void;
  frameType: 'ability' | 'health' | 'ac' | 'initiative' | 'prof' | 'st' | 'stMode';
  className?: string;
}

const COLOR_GROUPS = [
  {
    name: 'Металлы',
    colors: [
      { key: 'gold', name: 'Золото', value: FRAME_COLORS.gold },
      { key: 'silver', name: 'Серебро', value: FRAME_COLORS.silver },
      { key: 'bronze', name: 'Бронза', value: FRAME_COLORS.bronze },
      { key: 'copper', name: 'Медь', value: FRAME_COLORS.copper },
      { key: 'steel', name: 'Сталь', value: FRAME_COLORS.steel },
    ]
  },
  {
    name: 'Основные',
    colors: [
      { key: 'red', name: 'Красный', value: FRAME_COLORS.red },
      { key: 'blue', name: 'Синий', value: FRAME_COLORS.blue },
      { key: 'green', name: 'Зеленый', value: FRAME_COLORS.green },
      { key: 'purple', name: 'Фиолетовый', value: FRAME_COLORS.purple },
      { key: 'orange', name: 'Оранжевый', value: FRAME_COLORS.orange },
      { key: 'pink', name: 'Розовый', value: FRAME_COLORS.pink },
    ]
  },
  {
    name: 'Дополнительные',
    colors: [
      { key: 'cyan', name: 'Бирюзовый', value: FRAME_COLORS.cyan },
      { key: 'lime', name: 'Лайм', value: FRAME_COLORS.lime },
      { key: 'indigo', name: 'Индиго', value: FRAME_COLORS.indigo },
      { key: 'teal', name: 'Тиль', value: FRAME_COLORS.teal },
      { key: 'emerald', name: 'Изумруд', value: FRAME_COLORS.emerald },
      { key: 'rose', name: 'Роза', value: FRAME_COLORS.rose },
    ]
  },
  {
    name: 'Нейтральные',
    colors: [
      { key: 'amber', name: 'Янтарь', value: FRAME_COLORS.amber },
      { key: 'violet', name: 'Фиалка', value: FRAME_COLORS.violet },
      { key: 'fuchsia', name: 'Фуксия', value: FRAME_COLORS.fuchsia },
      { key: 'sky', name: 'Небо', value: FRAME_COLORS.sky },
      { key: 'stone', name: 'Камень', value: FRAME_COLORS.stone },
      { key: 'neutral', name: 'Нейтральный', value: FRAME_COLORS.neutral },
    ]
  }
];

export default function FrameColorPicker({ 
  currentColor, 
  onColorChange, 
  frameType,
  className = '' 
}: FrameColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleColorSelect = (colorKey: string) => {
    onColorChange(colorKey);
    setIsOpen(false);
  };

  const getCurrentColorName = () => {
    for (const group of COLOR_GROUPS) {
      const color = group.colors.find(c => c.key === currentColor);
      if (color) return color.name;
    }
    return 'Золото';
  };

  const getCurrentColorValue = () => {
    for (const group of COLOR_GROUPS) {
      const color = group.colors.find(c => c.key === currentColor);
      if (color) return color.value;
    }
    return '#B59E54';
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className={`flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-200 hover:text-white border border-gray-600 ${className}`}
        >
          <Palette className="w-4 h-4" />
          <span className="hidden sm:inline">{getCurrentColorName()}</span>
          <div 
            className="w-4 h-4 rounded border border-gray-400"
            style={{ backgroundColor: getCurrentColorValue() }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Выберите цвет фрейма</h3>
          
          {COLOR_GROUPS.map((group) => (
            <div key={group.name} className="space-y-2">
              <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                {group.name}
              </h4>
              <div className="grid grid-cols-6 gap-2">
                {group.colors.map((color) => (
                  <button
                    key={color.key}
                    onClick={() => handleColorSelect(color.key)}
                    className={`
                      relative w-8 h-8 rounded border-2 transition-all hover:scale-110
                      ${currentColor === color.key 
                        ? 'border-gray-800 shadow-md' 
                        : 'border-gray-300 hover:border-gray-400'
                      }
                    `}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {currentColor === color.key && (
                      <Check className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow-sm" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
          
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Тип фрейма: {frameType}</span>
              <span>Цвет: {getCurrentColorName()}</span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
