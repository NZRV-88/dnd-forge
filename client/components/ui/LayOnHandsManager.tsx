import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Heart, Shield, RotateCcw, ChevronDown, Plus, Minus, Loader2 } from 'lucide-react';
import { useCharacter } from '@/store/character';

interface LayOnHandsManagerProps {
  level: number;
  frameColor?: string;
}

export default function LayOnHandsManager({ level, frameColor = '#3B82F6' }: LayOnHandsManagerProps) {
  const { draft, initializeLayOnHands, useLayOnHands, restoreLayOnHands, updateLayOnHandsMaxPoints } = useCharacter();
  const [healAmount, setHealAmount] = useState(1);
  const [isHealing, setIsHealing] = useState(false);
  const [isCuringPoison, setIsCuringPoison] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Инициализируем Возложение рук, если его еще нет
  React.useEffect(() => {
    if (!draft.layOnHands) {
      initializeLayOnHands(level);
    }
  }, [initializeLayOnHands, draft.layOnHands]);

  // Обновляем максимум очков при изменении уровня (не сбрасывая текущие значения)
  React.useEffect(() => {
    if (draft.layOnHands && draft.layOnHands.maxPoints !== level * 5) {
      updateLayOnHandsMaxPoints(level);
    }
  }, [level, updateLayOnHandsMaxPoints, draft.layOnHands]);

  const layOnHands = draft.layOnHands;
  if (!layOnHands) return null;

  const maxPoints = level * 5;
  const currentPoints = layOnHands.currentPoints;
  const usedPoints = layOnHands.usedPoints;
  const percentage = (currentPoints / maxPoints) * 100;

  const handleHeal = () => {
    if (currentPoints >= healAmount && healAmount > 0) {
      setIsHealing(true);
      useLayOnHands(healAmount);
      setTimeout(() => setIsHealing(false), 1000);
    }
  };

  const handleCurePoison = () => {
    if (currentPoints >= 5) {
      setIsCuringPoison(true);
      useLayOnHands(5);
      setTimeout(() => setIsCuringPoison(false), 1000);
    }
  };

  const handleRestore = () => {
    setIsRestoring(true);
    restoreLayOnHands();
    setTimeout(() => setIsRestoring(false), 1000);
  };

  const canHeal = currentPoints >= healAmount && healAmount > 0;
  const canCurePoison = currentPoints >= 5;

  const incrementHealAmount = () => {
    if (healAmount < currentPoints) {
      setHealAmount(healAmount + 1);
    }
  };

  const decrementHealAmount = () => {
    if (healAmount > 1) {
      setHealAmount(healAmount - 1);
    }
  };

  return (
    <div className="space-y-2">
      <div className="border-b border-gray-600 bg-neutral-900 shadow-inner shadow-sm">
        <Collapsible>
          <CollapsibleTrigger asChild>
            <div className="w-full p-3 bg-neutral-800 hover:bg-neutral-700 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-start">
                  <span className="text-white font-medium">Возложение рук</span>
                  <span className="text-xs text-gray-400 mt-1">
                    Резерв целительной силы: {currentPoints}/{maxPoints} очков
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-neutral-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${percentage}%`, backgroundColor: percentage > 25 ? '#4CAF50' : '#F44336' }}
                    ></div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4 bg-neutral-900">
              {/* Описание способности */}
              <div className="mb-4">
                <p className="text-sm text-gray-300 leading-relaxed">
                  Ваше благословенное касание может лечить раны. У вас есть резерв целительной силы, восстанавливающийся, когда вы завершаете Долгий отдых. С помощью этого резерва вы можете восстанавливать Хиты; количество Хитов в этом резерве равно вашему уровню Паладина, умноженному на 5.
                </p>
                <p className="text-sm text-gray-300 leading-relaxed mt-2">
                  Бонусным действием вы можете прикоснуться к существу (включая себя) и зачерпнуть силу из резерва, восстанавливая этому существу Хиты. Их количество не должно превышать число, оставшееся в резерве. Вы также можете потратить 5 Хитов из резерва, чтобы снять с существа состояние Отравленный; эти потраченные Хиты не исцеляют существо.
                </p>
              </div>

              <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={decrementHealAmount}
                    disabled={healAmount <= 1}
                    className="w-10 h-10 p-0 flex items-center justify-center"
                    style={{ 
                      backgroundColor: frameColor,
                      color: 'white',
                      border: `1px solid ${frameColor}`
                    }}
                  >
                    <Minus className="w-4 h-4 font-bold" />
                  </Button>
                  
                  <div className="w-12 h-8 bg-transparent text-white text-lg font-semibold text-center flex items-center justify-center">
                    {healAmount}
                  </div>
                  
                  <Button
                    onClick={incrementHealAmount}
                    disabled={healAmount >= currentPoints}
                    className="w-10 h-10 p-0 flex items-center justify-center"
                    style={{ 
                      backgroundColor: frameColor,
                      color: 'white',
                      border: `1px solid ${frameColor}`
                    }}
                  >
                    <Plus className="w-4 h-4 font-bold" />
                  </Button>
                  
                  <Button
                    onClick={handleHeal}
                    disabled={!canHeal || isHealing}
                    className="flex-1 bg-transparent hover:bg-opacity-20 transition-colors"
                    style={{ 
                      border: `1px solid ${frameColor}`,
                      color: frameColor
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `${frameColor}40`;
                      e.currentTarget.style.color = frameColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = frameColor;
                    }}
                  >
                    {isHealing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "ЛЕЧИТЬ"
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleCurePoison}
                    disabled={!canCurePoison || isCuringPoison}
                    className="flex-1 bg-transparent hover:bg-opacity-20 transition-colors"
                    style={{ 
                      border: `1px solid ${frameColor}`,
                      color: frameColor
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `${frameColor}40`;
                      e.currentTarget.style.color = frameColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = frameColor;
                    }}
                  >
                    {isCuringPoison ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "СНЯТЬ ОТРАВЛЕНИЕ"
                    )}
                  </Button>
                </div>

                <Button
                  onClick={handleRestore}
                  className="w-full bg-transparent border border-gray-500 text-gray-400 hover:bg-gray-500 hover:bg-opacity-20 hover:text-gray-300 transition-colors"
                  disabled={currentPoints === maxPoints || isRestoring}
                >
                  {isRestoring ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      ВОССТАНОВИТЬ
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
