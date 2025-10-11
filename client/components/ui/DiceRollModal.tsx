import React, { useState, useEffect } from 'react';

interface DiceRollModalProps {
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
    // Новые поля для поддержки нескольких бросков
    separateRolls?: Array<{
      name: string;
      dice: string;
      diceRoll: number;
      modifier: number;
      result: number;
      individualRolls?: number[];
    }>;
  } | null;
}

export default function DiceRollModal({ isOpen, onClose, rollData }: DiceRollModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (isOpen && rollData) {
      setIsAnimating(true);
      setShowResult(false);
      
      // Анимация броска кубика
      const animationTimer = setTimeout(() => {
        setIsAnimating(false);
        setShowResult(true);
      }, 800);

      return () => {
        clearTimeout(animationTimer);
      };
    }
  }, [isOpen, rollData]);

  if (!isOpen || !rollData) return null;

  const { description, dice, modifier, result, diceRoll, type, individualRolls, separateRolls } = rollData;

  // Определяем тип действия для отображения и его цвет
  const getActionType = () => {
    if (type === "Спасбросок") return { text: "СПАСБРОСОК", color: "text-green-400" };
    if (type === "Урон") return { text: "УРОН", color: "text-red-300" };
    if (type === "Лечение") return { text: "ЛЕЧЕНИЕ", color: "text-green-300" };
    if (type === "Атака") return { text: "ПОПАДАНИЕ", color: "text-blue-300" };
    if (type === "Заклинание") return { text: "ЗАКЛИНАНИЕ", color: "text-purple-400" };
    if (type === "Навык") return { text: "ПРОВЕРКА", color: "text-purple-400" };
    if (description === "Инициатива") return { text: "БРОСОК", color: "text-amber-600" };
    return { text: "ПРОВЕРКА", color: "text-purple-400" };
  };

  const actionType = getActionType();

  // Проверяем, есть ли отдельные броски (например, для Сияющих ударов)
  const hasSeparateRolls = separateRolls && separateRolls.length > 0;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div 
        className="bg-gray-800 border border-gray-600 rounded-lg p-4 min-w-[280px] cursor-pointer hover:bg-gray-700 transition-colors"
        onClick={onClose}
      >
        {hasSeparateRolls ? (
          // Новый формат: столбик с отдельными бросками
          <div className="space-y-3">
            {/* Заголовок */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-gray-300 text-sm font-semibold uppercase">
                {description}:
              </span>
              <span className={`text-sm font-semibold uppercase ${actionType.color}`}>
                {actionType.text}
              </span>
            </div>

            {/* Отдельные броски */}
            <div className="space-y-2">
              {separateRolls.map((roll, index) => (
                <div key={index} className="flex items-center justify-between">
                  {/* Левая часть: название и кубик */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300 text-xs font-medium">
                      {roll.name}:
                    </span>
                    <div className={`w-6 h-6 bg-gray-700 rounded flex items-center justify-center text-xs font-bold text-gray-300 transition-all duration-300 ${
                      isAnimating ? 'animate-spin' : ''
                    }`}>
                      {isAnimating ? '🎲' : roll.dice}
                    </div>
                    <span className="text-white text-sm font-bold">
                      {roll.individualRolls && roll.individualRolls.length > 0 
                        ? `${roll.individualRolls.join('+')}${roll.modifier !== 0 ? (roll.modifier > 0 ? `+${roll.modifier}` : `${roll.modifier}`) : ''}`
                        : `${roll.diceRoll}${roll.modifier !== 0 ? (roll.modifier > 0 ? `+${roll.modifier}` : `${roll.modifier}`) : ''}`
                      }
                    </span>
                  </div>
                  
                  {/* Правая часть: результат */}
                  <div className="flex items-center gap-2">
                    <div className="w-px h-4 bg-gray-500"></div>
                    <span className="text-gray-400 text-sm">=</span>
                    <span className="text-white text-lg font-bold">
                      {roll.result}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Общий результат */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-600">
              <span className="text-gray-300 text-sm font-semibold">
                ИТОГО:
              </span>
              <span className="text-white text-xl font-bold">
                {result}
              </span>
            </div>
          </div>
        ) : (
          // Старый формат: один бросок
          <div>
            {/* Заголовок */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gray-300 text-sm font-semibold uppercase">
                {description}:
              </span>
              <span className={`text-sm font-semibold uppercase ${actionType.color}`}>
                {actionType.text}
              </span>
            </div>

            {/* Кубик и результат */}
            <div className="flex items-center gap-3">
              {/* Иконки кубиков */}
              <div className="flex items-center gap-1">
                {dice.includes(' + ') ? (
                  // Для нескольких кубиков показываем отдельные квадратики
                  dice.split(' + ').map((dicePart, index) => (
                    <div key={index} className={`w-8 h-8 bg-gray-700 rounded flex items-center justify-center text-xs font-bold text-gray-300 transition-all duration-300 ${
                      isAnimating ? 'animate-spin' : ''
                    }`}>
                      {isAnimating ? '🎲' : dicePart.trim()}
                    </div>
                  ))
                ) : (
                  // Для одного кубика показываем как раньше
                  <div className={`w-8 h-8 bg-gray-700 rounded flex items-center justify-center text-xs font-bold text-gray-300 transition-all duration-300 ${
                    isAnimating ? 'animate-spin' : ''
                  }`}>
                    {isAnimating ? '🎲' : dice}
                  </div>
                )}
              </div>

              {/* Расчет */}
              <div className="flex items-center gap-2">
                <span className="text-white text-lg font-bold">
                  {individualRolls && individualRolls.length > 0 
                    ? `${individualRolls.join('+')}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : `${modifier}`) : ''}`
                    : `${diceRoll}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : `${modifier}`) : ''}`
                  }
                </span>
                <div className="w-px h-4 bg-gray-500"></div>
                <span className="text-gray-400 text-lg">=</span>
                <span className="text-white text-2xl font-bold">
                  {result}
                </span>
              </div>
            </div>

            {/* Специальные результаты */}
            {showResult && dice === 'd20' && diceRoll === 20 && (
              <div className="text-green-400 text-xs font-bold mt-1 animate-pulse">
                КРИТИЧЕСКИЙ УСПЕХ!
              </div>
            )}
            {showResult && dice === 'd20' && diceRoll === 1 && (
              <div className="text-red-400 text-xs font-bold mt-1 animate-pulse">
                КРИТИЧЕСКИЙ ПРОВАЛ!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
