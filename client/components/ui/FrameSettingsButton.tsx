import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import FrameColorPicker from './FrameColorPicker';
import { useFrameColor } from '@/contexts/FrameColorContext';

interface FrameSettingsButtonProps {
  className?: string;
}

export default function FrameSettingsButton({ 
  className = '' 
}: FrameSettingsButtonProps) {
  const [showSettings, setShowSettings] = useState(false);
  const { frameColor, setFrameColor } = useFrameColor();

  const handleColorChange = (color: string) => {
    setFrameColor(color);
    setShowSettings(false); // Автоматически закрываем панель после выбора цвета
  };

  return (
    <div className={`relative ${className}`}>
      {/* Кнопка настроек */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
        title="Настройки фрейма"
      >
        <Settings className="w-4 h-4 text-gray-300" />
      </button>

      {/* Панель настроек */}
      {showSettings && (
        <div className="absolute top-12 -right-2 z-20 bg-gray-800 rounded-lg p-3 shadow-lg border border-gray-600 min-w-[200px]">
          <div className="space-y-2">
            <label className="text-xs text-gray-300 block">Цвет фрейма:</label>
            <FrameColorPicker
              currentColor={frameColor}
              onColorChange={handleColorChange}
              frameType="ability"
              className="text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
}
