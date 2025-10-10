import React, { useState } from 'react';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Palette, Check } from 'lucide-react';

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
      { key: 'gold', name: 'Золото', value: '#B59E54' },
      { key: 'silver', name: 'Серебро', value: '#C0C0C0' },
      { key: 'bronze', name: 'Бронза', value: '#CD7F32' },
      { key: 'copper', name: 'Медь', value: '#B87333' },
      { key: 'steel', name: 'Сталь', value: '#71797E' },
    ]
  },
  {
    name: 'Основные',
    colors: [
      { key: 'red', name: 'Красный', value: '#DC2626' },
      { key: 'blue', name: 'Синий', value: '#2563EB' },
      { key: 'green', name: 'Зеленый', value: '#16A34A' },
      { key: 'purple', name: 'Фиолетовый', value: '#9333EA' },
      { key: 'orange', name: 'Оранжевый', value: '#EA580C' },
      { key: 'pink', name: 'Розовый', value: '#EC4899' },
    ]
  },
  {
    name: 'Дополнительные',
    colors: [
      { key: 'cyan', name: 'Бирюзовый', value: '#0891B2' },
      { key: 'lime', name: 'Лайм', value: '#65A30D' },
      { key: 'indigo', name: 'Индиго', value: '#4F46E5' },
      { key: 'teal', name: 'Тиль', value: '#0D9488' },
      { key: 'emerald', name: 'Изумруд', value: '#059669' },
      { key: 'rose', name: 'Роза', value: '#E11D48' },
    ]
  },
  {
    name: 'Нейтральные',
    colors: [
      { key: 'amber', name: 'Янтарь', value: '#D97706' },
      { key: 'violet', name: 'Фиалка', value: '#7C3AED' },
      { key: 'fuchsia', name: 'Фуксия', value: '#C026D3' },
      { key: 'sky', name: 'Небо', value: '#0284C7' },
      { key: 'stone', name: 'Камень', value: '#78716C' },
      { key: 'neutral', name: 'Нейтральный', value: '#6B7280' },
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
