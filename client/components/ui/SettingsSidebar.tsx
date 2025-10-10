import React, { useState } from 'react';
import { X, Settings, Palette, Send, MessageCircle } from 'lucide-react';
import FrameColorPicker from './FrameColorPicker';
import { useFrameColor } from '@/contexts/FrameColorContext';
import { useSocialSharing } from '@/hooks/useSocialSharing';

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  telegramEnabled: boolean;
  setTelegramEnabled: (enabled: boolean) => void;
  telegramChatId: string;
  setTelegramChatId: (chatId: string) => void;
  telegramThreadId: string;
  setTelegramThreadId: (threadId: string) => void;
  autoShare: boolean;
  setAutoShare: (autoShare: boolean) => void;
}

export default function SettingsSidebar({ 
  isOpen, 
  onClose, 
  telegramEnabled, 
  setTelegramEnabled, 
  telegramChatId, 
  setTelegramChatId, 
  telegramThreadId, 
  setTelegramThreadId, 
  autoShare, 
  setAutoShare 
}: SettingsSidebarProps) {
  const { frameColor, setFrameColor } = useFrameColor();
  const { shareRoll, isLoading } = useSocialSharing();

  const handleColorChange = (color: string) => {
    setFrameColor(color);
  };

  const handleTestTelegram = async () => {
    if (!telegramEnabled || !telegramChatId) return;
    
    const testRollData = {
      characterName: 'Тестовый персонаж',
      description: 'Тестовая атака',
      dice: 'd20',
      modifier: 5,
      result: 15,
      diceRoll: 10,
      type: 'Атака',
      individualRolls: [10]
    };

    try {
      const result = await shareRoll('telegram', testRollData, telegramChatId, undefined, telegramThreadId);
      if (result.success) {
        alert('Тестовое сообщение отправлено успешно!');
      } else {
        alert(`Ошибка: ${result.error}`);
      }
    } catch (error) {
      alert(`Ошибка отправки: ${error}`);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed top-16 left-0 right-0 bottom-0 bg-black bg-opacity-50 z-[999999] flex justify-end"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed top-16 right-0 w-full max-w-md bg-neutral-900 h-full overflow-y-auto p-6 z-[999999]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-300" />
            <h2 className="text-lg font-semibold text-white">Настройки</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Frame Color Settings */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-4 h-4 text-gray-300" />
            <h3 className="text-md font-medium text-white">Цвет фрейма</h3>
          </div>
          <div className="space-y-3">
            <label className="text-sm text-gray-300 block">Выберите цвет:</label>
            <FrameColorPicker
              currentColor={frameColor}
              onColorChange={handleColorChange}
              frameType="ability"
              className="text-sm"
            />
          </div>
        </div>

        {/* Telegram Settings */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-4 h-4 text-gray-300" />
            <h3 className="text-md font-medium text-white">Telegram</h3>
          </div>
          
          <div className="space-y-4">
            {/* Enable Telegram */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="telegramEnabled"
                checked={telegramEnabled}
                onChange={(e) => setTelegramEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="telegramEnabled" className="text-sm text-gray-300">
                Включить отправку в Telegram
              </label>
            </div>

            {/* Auto Share */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="autoShare"
                checked={autoShare}
                onChange={(e) => setAutoShare(e.target.checked)}
                disabled={!telegramEnabled}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
              />
              <label htmlFor="autoShare" className="text-sm text-gray-300">
                Автоматически отправлять все броски
              </label>
            </div>

              {/* Chat ID */}
              <div>
                <label htmlFor="chatId" className="block text-sm text-gray-300 mb-2">
                  Chat ID группы:
                </label>
                <input
                  type="text"
                  id="chatId"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  disabled={!telegramEnabled}
                  placeholder="-1002519374277"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
                <p className="text-xs text-gray-400 mt-1">
                  ID группы или канала в Telegram
                </p>
              </div>

              {/* Thread ID */}
              <div>
                <label htmlFor="threadId" className="block text-sm text-gray-300 mb-2">
                  ID топика (опционально):
                </label>
                <input
                  type="text"
                  id="threadId"
                  value={telegramThreadId}
                  onChange={(e) => setTelegramThreadId(e.target.value)}
                  disabled={!telegramEnabled}
                  placeholder="7357"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Для отправки в конкретный топик группы
                </p>
              </div>

            {/* Test Button */}
            <button
              onClick={handleTestTelegram}
              disabled={!telegramEnabled || !telegramChatId || isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
              {isLoading ? 'Отправка...' : 'Тестовая отправка'}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="text-xs text-gray-400 space-y-1">
          <p>💡 Настройки сохраняются локально</p>
          <p>🎲 Для автоматической отправки включите "Автоматически отправлять все броски"</p>
        </div>
      </div>
    </>
  );
}
