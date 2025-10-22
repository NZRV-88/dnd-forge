import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Eye, RotateCcw, ChevronDown, Loader2, Clock, Moon, Zap, Shield, Sword, Heart, TreePine, Crown, Flame, Target } from 'lucide-react';
import { useCharacter } from '@/store/character';
import { getFrameColor } from '@/utils/colorUtils';

interface ChannelDivinityManagerProps {
  level: number;
  frameColor?: string;
  subclass?: string;
  draft?: any;
}

export default function ChannelDivinityManager({ level, frameColor = 'blue', subclass, draft: passedDraft }: ChannelDivinityManagerProps) {
  const characterContext = useCharacter();
  
  if (!characterContext) {
    return null;
  }
  
  const { initializeChannelDivinity, useChannelDivinity, shortRestChannelDivinity, longRestChannelDivinity, updateChannelDivinityMaxUses } = characterContext;
  
  // Используем только переданный draft
  const currentDraft = passedDraft;
  
  // Проверяем подкласс из разных источников
  const actualSubclass = subclass || currentDraft?.basics?.subclass || currentDraft?.subclass;
  const [isUsing, setIsUsing] = useState(false);
  const [isShortResting, setIsShortResting] = useState(false);
  const [isLongResting, setIsLongResting] = useState(false);

  // Инициализируем Проведение божественности, если его еще нет
  React.useEffect(() => {
    if (!currentDraft.channelDivinity && level >= 3) {
      initializeChannelDivinity(level);
    }
  }, [initializeChannelDivinity, currentDraft.channelDivinity]);

  // Обновляем максимум использований при изменении уровня (не сбрасывая текущие значения)
  React.useEffect(() => {
    if (currentDraft.channelDivinity && level >= 3) {
      const expectedMaxUses = level >= 11 ? 3 : 2;
      if (currentDraft.channelDivinity.maxUses !== expectedMaxUses) {
        updateChannelDivinityMaxUses(level);
      }
    }
  }, [level, updateChannelDivinityMaxUses, currentDraft.channelDivinity]);

  const channelDivinity = currentDraft.channelDivinity;

  // Проверяем уровень - Проведение божественности доступно с 3 уровня
  if (level < 3) {
    return null;
  }

  if (!channelDivinity) {
    return null;
  }

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
                        <Target className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
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

                  {/* Обет вражды (доступно для Клятвы возмездия с 3-го уровня) */}
                  {actualSubclass === 'oath-of-vengeance' && (
                    <div className="bg-neutral-800 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Sword className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h5 className="text-sm font-medium text-white">Обет вражды</h5>
                          <p className="text-xs text-gray-400 mt-1">
                            Когда вы совершаете действие Атака, можете потратить одно использование вашего Проведения божественности, 
                            чтобы дать Обет вражды видимому вами в пределах 30 футов от вас существу. Вы совершаете с Преимуществом 
                            броски атаки по этому существу в течение 1 минуты или пока снова не используете это умение.
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Если Хиты этого существа опускаются до 0 до окончания обета, вы можете перенести обет на другое 
                            существо в пределах 30 футов от вас (действий не требуется).
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Священное оружие (доступно для Клятвы преданности с 3-го уровня) */}
                  {actualSubclass === 'oath-of-devotion' && (
                    <div className="bg-neutral-800 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Shield className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h5 className="text-sm font-medium text-white">Священное оружие</h5>
                          <p className="text-xs text-gray-400 mt-1">
                            Когда вы совершаете действие Атака, можете потратить одно использование вашего Проведения божественности, 
                            чтобы наполнить положительной энергией одно Рукопашное оружие, которое вы держите. В течение 10 минут 
                            или пока вы снова не используете это умение, вы добавляете ваш модификатор Харизмы к броскам атаки, 
                            совершаемым вами с этим оружием (минимальный бонус +1).
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            При каждом попадании этим оружием вы можете изменить тип наносимого урона на урон Излучением. 
                            Оружие также испускает Яркий свет на 20 футов и Тусклый свет ещё на 20 футов.
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Вы можете прекратить этот эффект досрочно (действий не требуется). Этот эффект также заканчивается, 
                            если вы не держите или не несёте это оружие.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Воодушевляющий удар (доступно для Клятвы славы с 3-го уровня) */}
                  {actualSubclass === 'oath-of-glory' && (
                    <div className="bg-neutral-800 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Heart className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h5 className="text-sm font-medium text-white">Воодушевляющий удар</h5>
                          <p className="text-xs text-gray-400 mt-1">
                            Немедленно после сотворения Божественной кары вы можете потратить одно использование вашего 
                            Проведения божественности и распределить Временные хиты существам в пределах 30 футов от вас 
                            на ваш выбор (можно выбрать себя).
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Общее количество Временных хитов равно 2к8 + ваш уровень Паладина; вы распределяете 
                            Временные хиты на своё усмотрение.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Несравненный атлет (доступно для Клятвы славы с 3-го уровня) */}
                  {actualSubclass === 'oath-of-glory' && (
                    <div className="bg-neutral-800 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Crown className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h5 className="text-sm font-medium text-white">Несравненный атлет</h5>
                          <p className="text-xs text-gray-400 mt-1">
                            Бонусным действием вы можете потратить одно использование вашего Проведения божественности, 
                            чтобы усилить свой атлетизм. В течение 1 часа вы совершаете с Преимуществом проверки 
                            Силы (Атлетика) и Ловкости (Акробатика).
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Дальность ваших Прыжков в длину и в высоту увеличивается на 10 футов (это дополнительное 
                            расстояние требует траты перемещения, как обычно).
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Гнев природы (доступно для Клятвы Древних с 3-го уровня) */}
                  {actualSubclass === 'oath-of-the-ancients' && (
                    <div className="bg-neutral-800 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <TreePine className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h5 className="text-sm font-medium text-white">Гнев природы</h5>
                          <p className="text-xs text-gray-400 mt-1">
                            Действием Магия вы можете потратить одно использование Проведения божественности этого класса, 
                            чтобы призвать призрачные лозы, опутывающие врагов. Выберите видимых вами в пределах 15 футов 
                            от вас существ.
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Выбранные существа должны преуспеть в спасброске Силы, иначе получат состояние Опутанный 
                            на 1 минуту. Существо с этим состоянием повторяет спасбросок в конце каждого из своих ходов, 
                            при успехе оканчивая на себе это состояние.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Гнев Дракона (доступно для Клятвы повелителя драконов с 3-го уровня) */}
                  {actualSubclass === 'oath-of-the-dragonlord' && (
                    <div className="bg-neutral-800 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Flame className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h5 className="text-sm font-medium text-white">Гнев Дракона</h5>
                          <p className="text-xs text-gray-400 mt-1">
                            Действием вы можете имитировать ужасное присутствие дракона, используя божественный канал. 
                            Вы издаете такой же громкий рев, как взрослый дракон.
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Каждое существо на ваш выбор, находящееся в пределах 60 футов от вас и знающее о вашем 
                            присутствии, должно преуспеть в спасброске Мудрости со Сл 14, иначе станет испуганным на 1 минуту. 
                            Существо может повторять спасбросок в конце каждого своего хода, заканчивая эффект на себе в случае успеха.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Презрение к недостойным (доступно для Клятвы повелителя драконов с 3-го уровня) */}
                  {actualSubclass === 'oath-of-the-dragonlord' && (
                    <div className="bg-neutral-800 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Crown className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h5 className="text-sm font-medium text-white">Презрение к недостойным</h5>
                          <p className="text-xs text-gray-400 mt-1">
                            Клятва повелителя драконов возвышает вас над множеством развращенных и слабых. 
                            Действием вы можете произнести клятву Повелителя Драконов, используя божественный канал.
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Вражеские существа в пределах 30 футов от вас, Большого размера или меньше, должны преуспеть 
                            в спасброске Харизмы. При провале существо сбивается с ног и теряет концентрацию на всех 
                            заклинаниях, которые оно поддерживало активными.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col space-y-3">

                {/* Кнопка использования */}
                <Button
                  onClick={handleUseChannelDivinity}
                  disabled={!canUse || isUsing}
                  className="w-full bg-transparent hover:bg-opacity-20 transition-colors"
                  style={{ 
                    border: `1px solid ${getFrameColor(frameColor)}`,
                    color: getFrameColor(frameColor)
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${getFrameColor(frameColor)}40`;
                    e.currentTarget.style.color = getFrameColor(frameColor);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = getFrameColor(frameColor);
                  }}
                >
                  {isUsing ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Eye className="w-4 h-4 mr-2" />
                  )}
                  {isUsing ? 'Используется...' : 'Использовать Проведение божественности'}
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
