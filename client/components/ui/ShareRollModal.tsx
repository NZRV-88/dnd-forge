import React, { useState } from 'react';
import { X, Send, MessageCircle, Users, AlertCircle, CheckCircle, Zap } from 'lucide-react';
import QuickChannelSelector from './QuickChannelSelector';

interface ShareRollModalProps {
  isOpen: boolean;
  onClose: () => void;
  rollData: {
    characterName?: string;
    description: string;
    dice: string;
    modifier: number;
    result: number;
    diceRoll: number;
    type: string;
    individualRolls?: number[];
  } | null;
  onShare: (platform: 'telegram' | 'vk', chatId?: string, userId?: string, messageThreadId?: string) => Promise<void>;
}

export default function ShareRollModal({ isOpen, onClose, rollData, onShare }: ShareRollModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<'telegram' | 'vk' | null>(null);
  const [chatId, setChatId] = useState('');
  const [messageThreadId, setMessageThreadId] = useState('');
  const [userId, setUserId] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [shareResult, setShareResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);
  const [showQuickSelect, setShowQuickSelect] = useState(false);

  const handleQuickChannelSelect = (platform: 'telegram' | 'vk', channelId: string, channelName: string, messageThreadId?: string) => {
    setSelectedPlatform(platform);
    if (platform === 'telegram') {
      setChatId(channelId);
      setMessageThreadId(messageThreadId || '');
    } else {
      setUserId(channelId);
    }
    setShowQuickSelect(false);
    setShareResult({ success: true, message: `Выбран канал: ${channelName}` });
  };

  const handleShare = async () => {
    if (!selectedPlatform) return;
    
    setIsSharing(true);
    setShareResult(null);
    
    try {
      if (selectedPlatform === 'telegram' && chatId) {
        await onShare('telegram', chatId, undefined, messageThreadId);
        setShareResult({ success: true, message: 'Результат успешно отправлен в Telegram! (Демо-режим)' });
      } else if (selectedPlatform === 'vk' && userId) {
        await onShare('vk', undefined, userId);
        setShareResult({ success: true, message: 'Результат успешно отправлен в VK! (Демо-режим)' });
      }
      
      // Закрываем модальное окно через 2 секунды после успешной отправки
      setTimeout(() => {
        onClose();
        setShareResult(null);
        setChatId('');
        setUserId('');
        setSelectedPlatform(null);
      }, 2000);
    } catch (error) {
      console.error('Sharing error:', error);
      setShareResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Произошла ошибка при отправке' 
      });
    } finally {
      setIsSharing(false);
    }
  };

  const formatRollPreview = () => {
    const { characterName, description, dice, modifier, result, diceRoll, type, individualRolls } = rollData;
    const actionType = getActionTypeText(type);
    const modifierText = modifier !== 0 ? (modifier > 0 ? `+${modifier}` : `${modifier}`) : '';
    
    let calculationText = '';
    if (individualRolls && individualRolls.length > 0) {
      calculationText = `${individualRolls.join('+')}${modifierText}`;
    } else {
      calculationText = `${diceRoll}${modifierText}`;
    }

    let specialResult = '';
    if (dice === 'd20' && diceRoll === 20) {
      specialResult = ' 🎉 КРИТИЧЕСКИЙ УСПЕХ!';
    } else if (dice === 'd20' && diceRoll === 1) {
      specialResult = ' 💀 КРИТИЧЕСКИЙ ПРОВАЛ!';
    }

    return `${characterName} - ${description}
${actionType}: ${dice}
Результат: ${calculationText} = ${result}${specialResult}`;
  };

  const getActionTypeText = (type: string): string => {
    switch (type) {
      case "Спасбросок": return "СПАСБРОСОК";
      case "Урон": return "УРОН";
      case "Лечение": return "ЛЕЧЕНИЕ";
      case "Атака": return "ПОПАДАНИЕ";
      case "Заклинание": return "ЗАКЛИНАНИЕ";
      case "Навык": return "ПРОВЕРКА";
      default: return "БРОСОК";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Поделиться результатом броска</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Quick Select Button */}
        <div className="mb-4">
          <button
            onClick={() => setShowQuickSelect(!showQuickSelect)}
            className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Быстрый выбор каналов
          </button>
        </div>

        {/* Quick Channel Selector */}
        {showQuickSelect && (
          <div className="mb-4">
            <QuickChannelSelector onSelectChannel={handleQuickChannelSelect} />
          </div>
        )}

        {/* Demo Mode Notice */}
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-yellow-800 font-medium">Демо-режим</span>
          </div>
          <p className="text-xs text-yellow-700 mt-1">
            Для реальной отправки настройте токены в файле .env
          </p>
        </div>

        {/* Preview */}
        <div className="bg-gray-700 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Предварительный просмотр:</h3>
          <div className="text-sm text-gray-200 whitespace-pre-line">
            {formatRollPreview()}
          </div>
        </div>

        {/* Platform Selection */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-300">Выберите платформу:</h3>
          
          {/* Telegram */}
          <div className="flex items-center space-x-3">
            <input
              type="radio"
              id="telegram"
              name="platform"
              value="telegram"
              checked={selectedPlatform === 'telegram'}
              onChange={() => setSelectedPlatform('telegram')}
              className="text-blue-500"
            />
            <label htmlFor="telegram" className="flex items-center space-x-2 text-gray-300 cursor-pointer">
              <MessageCircle className="w-5 h-5 text-blue-400" />
              <span>Telegram</span>
            </label>
          </div>

          {/* VKontakte */}
          <div className="flex items-center space-x-3">
            <input
              type="radio"
              id="vk"
              name="platform"
              value="vk"
              checked={selectedPlatform === 'vk'}
              onChange={() => setSelectedPlatform('vk')}
              className="text-blue-500"
            />
            <label htmlFor="vk" className="flex items-center space-x-2 text-gray-300 cursor-pointer">
              <Users className="w-5 h-5 text-blue-500" />
              <span>VKontakte</span>
            </label>
          </div>
        </div>

        {/* Input Fields */}
        {selectedPlatform === 'telegram' && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Chat ID (Telegram):
              </label>
              <input
                type="text"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="Например: -1002519374277"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Получите Chat ID у @userinfobot в Telegram
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                ID Топика (опционально):
              </label>
              <input
                type="text"
                value={messageThreadId}
                onChange={(e) => setMessageThreadId(e.target.value)}
                placeholder="Например: 7357"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Для отправки в конкретный топик группы
              </p>
            </div>
          </div>
        )}

        {selectedPlatform === 'vk' && (
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              User ID (VKontakte):
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Введите User ID"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Получите User ID в настройках профиля VK
            </p>
          </div>
        )}

        {/* Результат отправки */}
        {shareResult && (
          <div className={`p-3 rounded-lg flex items-center gap-2 mb-4 ${
            shareResult.success 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {shareResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span className="text-sm font-medium">
              {shareResult.success ? shareResult.message : shareResult.error}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            disabled={isSharing}
          >
            Отмена
          </button>
          <button
            onClick={handleShare}
            disabled={!selectedPlatform || (selectedPlatform === 'telegram' && !chatId) || (selectedPlatform === 'vk' && !userId) || isSharing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            {isSharing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Отправка...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Поделиться</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
