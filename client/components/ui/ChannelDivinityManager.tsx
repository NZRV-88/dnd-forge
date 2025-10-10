import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Eye, RotateCcw, ChevronDown, Loader2, Clock, Moon, Zap } from 'lucide-react';
import { useCharacter } from '@/store/character';

interface ChannelDivinityManagerProps {
  level: number;
  frameColor?: string;
}

export default function ChannelDivinityManager({ level, frameColor = '#3B82F6' }: ChannelDivinityManagerProps) {
  const { draft, initializeChannelDivinity, useChannelDivinity, shortRestChannelDivinity, longRestChannelDivinity } = useCharacter();
  const [isUsing, setIsUsing] = useState(false);
  const [isShortResting, setIsShortResting] = useState(false);
  const [isLongResting, setIsLongResting] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState<'divine-sense' | 'turn-undead'>('divine-sense');

  // Инициализируем Проведение божественности, если его еще нет
  React.useEffect(() => {
    if (!draft.channelDivinity && level >= 3) {
      initializeChannelDivinity(level);
    }
  }, [level, initializeChannelDivinity, draft.channelDivinity]);

  const channelDivinity = draft.channelDivinity;
  if (!channelDivinity) return null;

  const maxUses = level >= 11 ? 3 : 2;
  const currentUses = channelDivinity.currentUses;
  const percentage = (currentUses / maxUses) * 100;

  const handleUseChannelDivinity = () => {
    if (currentUses > 0) {
      setIsUsing(true);
      useChannelDivinity();
      setTimeout(() => setIsUsing(false), 1000);
    }
  };

  const handleShortRest = () => {
    setIsShortResting(true);
    shortRestChannelDivinity();
    setTimeout(() => setIsShortResting(false), 1000);
  };

  const handleLongRest = () => {
    setIsLongResting(true);
    longRestChannelDivinity();
    setTimeout(() => setIsLongResting(false), 1000);
  };

  const canUse = currentUses > 0;
  const canShortRest = currentUses < maxUses;
  const canLongRest = currentUses < maxUses;

  return (
    <div className="space-y-2">
      <div className="border-b border-gray-600 bg-neutral-900 shadow-inner shadow-sm">
        <Collapsible>
          <CollapsibleTrigger asChild>
            <div className="w-full p-3 bg-neutral-800 hover:bg-neutral-700 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-start">
                  <span className="text-white font-medium">Проведение божественности</span>
                  <span className="text-xs text-gray-400 mt-1">
                    Использования: {currentUses}/{maxUses}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-neutral-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${percentage}%`, backgroundColor: percentage > 50 ? '#4CAF50' : percentage > 25 ? '#FF9800' : '#F44336' }}
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
                  Вы можете направлять божественную энергию непосредственно с Внешних планов, сотворяя магические эффекты. 
                  Вы начинаете с одним таким эффектом: <strong>Божественное чувство</strong>.
                </p>
                <p className="text-sm text-gray-300 leading-relaxed mt-2">
                  Вы можете использовать Проведение божественности этого класса {maxUses === 3 ? 'три' : 'два'} раза. 
                  Вы восстанавливаете одно потраченное использование Проведения по завершению Короткого отдыха, 
                  и вы восстанавливаете все потраченные использования по завершению Долгого отдыха.
                </p>
              </div>

              {/* Эффекты Проведения божественности */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-200 mb-2">Доступные эффекты:</h4>
                <div className="space-y-3">
                  {/* Божественное чувство (доступно с 3-го уровня) */}
                  <div className="bg-neutral-800 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Eye className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h5 className="text-sm font-medium text-white">Божественное чувство</h5>
                        <p className="text-xs text-gray-400 mt-1">
                          Бонусным действием вы можете открыть свое сознание для обнаружения Исчадий, Небожителей и Нежити. 
                          В течение следующих 10 минут или пока вы не получите состояние Недееспособный, вы знаете местоположение 
                          всех существ перечисленных типов в пределах 60 футов от вас и какие у этих существ типы.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Порицание врагов (доступно с 9-го уровня) */}
                  {level >= 9 && (
                    <div className="bg-neutral-800 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Zap className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h5 className="text-sm font-medium text-white">Порицание врагов</h5>
                          <p className="text-xs text-gray-400 mt-1">
                            Действием Магия вы можете потратить одно использование Проведения божественности этого класса, 
                            чтобы повергнуть врагов в благоговейный трепет. Продемонстрировав ваш Священный символ или оружие, 
                            вы можете нацелиться на видимых вами в пределах 60 футов от вас существ количеством не больше 
                            вашего модификатора Харизмы (минимум одно существо). Каждая цель должна преуспеть в спасброске 
                            Мудрости, иначе получит состояние Испуганный на 1 минуту или пока не получит урон.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                {/* Выбор эффекта */}
                {level >= 9 && (
                  <div className="mb-3">
                    <h5 className="text-sm font-medium text-gray-200 mb-2">Выберите эффект:</h5>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setSelectedEffect('divine-sense')}
                        className={`flex-1 text-xs ${
                          selectedEffect === 'divine-sense' 
                            ? 'bg-opacity-20' 
                            : 'bg-transparent hover:bg-opacity-10'
                        }`}
                        style={{ 
                          border: `1px solid ${frameColor}`,
                          color: frameColor,
                          backgroundColor: selectedEffect === 'divine-sense' ? `${frameColor}40` : 'transparent'
                        }}
                      >
                        Божественное чувство
                      </Button>
                      <Button
                        onClick={() => setSelectedEffect('turn-undead')}
                        className={`flex-1 text-xs ${
                          selectedEffect === 'turn-undead' 
                            ? 'bg-opacity-20' 
                            : 'bg-transparent hover:bg-opacity-10'
                        }`}
                        style={{ 
                          border: `1px solid ${frameColor}`,
                          color: frameColor,
                          backgroundColor: selectedEffect === 'turn-undead' ? `${frameColor}40` : 'transparent'
                        }}
                      >
                        Порицание врагов
                      </Button>
                    </div>
                  </div>
                )}

                {/* Кнопка использования */}
                <Button
                  onClick={handleUseChannelDivinity}
                  disabled={!canUse || isUsing}
                  className="w-full bg-transparent hover:bg-opacity-20 transition-colors"
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
                  {isUsing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {selectedEffect === 'divine-sense' ? (
                        <Eye className="w-4 h-4 mr-2" />
                      ) : (
                        <Zap className="w-4 h-4 mr-2" />
                      )}
                      {selectedEffect === 'divine-sense' ? 'БОЖЕСТВЕННОЕ ЧУВСТВО' : 'ПОРИЦАНИЕ ВРАГОВ'}
                    </>
                  )}
                </Button>

                {/* Кнопки отдыха */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleShortRest}
                    disabled={!canShortRest || isShortResting}
                    className="flex-1 bg-transparent border border-gray-500 text-gray-400 hover:bg-gray-500 hover:bg-opacity-20 hover:text-gray-300 transition-colors"
                  >
                    {isShortResting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Clock className="w-4 h-4 mr-2" />
                        КОРОТКИЙ ОТДЫХ
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleLongRest}
                    disabled={!canLongRest || isLongResting}
                    className="flex-1 bg-transparent border border-gray-500 text-gray-400 hover:bg-gray-500 hover:bg-opacity-20 hover:text-gray-300 transition-colors"
                  >
                    {isLongResting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Moon className="w-4 h-4 mr-2" />
                        ДОЛГИЙ ОТДЫХ
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
