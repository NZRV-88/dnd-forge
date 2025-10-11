import React, { useState } from 'react';
import { ALL_FEATS } from "@/data/feats/feats";
import DynamicFrame from "@/components/ui/DynamicFrame";
import { Star, ChevronDown } from "lucide-react";
import * as Icons from "@/components/refs/icons";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SKILLS } from "@/data/skills";
import { Tools } from "@/data/items/tools";
import { LANGUAGES } from "@/data/languages/languages";
import { ABILITIES } from "@/data/abilities";
import { getWeaponByKey } from "@/data/items/weapons";
import LayOnHandsManager from "@/components/ui/LayOnHandsManager";
import ChannelDivinityManager from "@/components/ui/ChannelDivinityManager";
import AuraManager from "@/components/ui/AuraManager";
import RadiantStrikesManager from "@/components/ui/RadiantStrikesManager";
import FightingStylesSection from "@/components/characterList/FightingStylesSection";

interface FeaturesTabProps {
  characterData: any;
  draft: any;
  frameColor: string;
  getFrameColor: (color: string) => string;
}

export default function FeaturesTab({
  characterData,
  draft,
  frameColor,
  getFrameColor
}: FeaturesTabProps) {
  
  const [expandedFeats, setExpandedFeats] = useState<Set<number>>(new Set());
  const [expandedProgression, setExpandedProgression] = useState<Set<number>>(new Set());
  const [activeSubTab, setActiveSubTab] = useState<'features' | 'progression'>('features');

  // Получаем выбранные опции черты
  const getFeatChoices = (featKey: string) => {
    if (!draft?.chosen) return [];
    
    const choices: string[] = [];
    
    // Для черты "skilled" от предыстории ищем выборы в skills
    if (featKey === 'skilled') {
      // Ищем выборы навыков, связанные с чертой "skilled" от предыстории
      // Черта "skilled" должна иметь выборы в формате "background-skilled-*"
      Object.entries(draft.chosen.skills || {}).forEach(([source, skills]) => {
        if (source.includes('skilled') || source.includes('background-skilled')) {
          if (Array.isArray(skills)) {
            skills.forEach(skill => {
              choices.push(`skill:${skill}`);
            });
          }
        }
      });
      
      // Ищем выборы инструментов, связанные с чертой "skilled" от предыстории
      Object.entries(draft.chosen.tools || {}).forEach(([source, tools]) => {
        if (source.includes('skilled') || source.includes('background-skilled')) {
          if (Array.isArray(tools)) {
            tools.forEach(tool => {
              choices.push(`tool:${tool}`);
            });
          }
        }
      });
      
      // Ищем выборы языков, связанные с чертой "skilled" от предыстории
      Object.entries(draft.chosen.languages || {}).forEach(([source, languages]) => {
        if (source.includes('skilled') || source.includes('background-skilled')) {
          if (Array.isArray(languages)) {
            languages.forEach(language => {
              choices.push(`language:${language}`);
            });
          }
        }
      });
    }
    
    return choices;
  };

  // Получаем выбранные опции особенности класса
  const getClassFeatureChoices = (featureName: string, featureLevel: number) => {
    if (!draft?.chosen) return [];
    
    const choices: string[] = [];
    
    // Специальная обработка для "Клятва Паладина" - подкласс хранится в draft.basics.subclass
    if (featureName === 'Клятва Паладина' && draft.basics.subclass) {
      choices.push(`subclass:${draft.basics.subclass}`);
    }
    
    // Специальная обработка для "Увеличение характеристик" - ищем черты по уровню
    if (featureName === 'Увеличение характеристик') {
      // Черты хранятся как массив строк в формате "source:featKey"
      if (Array.isArray(draft.chosen.feats)) {
        console.log('Debug - Все черты:', draft.chosen.feats);
        console.log('Debug - Ищем уровень:', featureLevel);
        draft.chosen.feats.forEach(featEntry => {
          const [source, featKey] = featEntry.split(':');
          console.log('Debug - Черта:', featEntry, 'Источник:', source, 'Ключ:', featKey);
          // Ищем черты, связанные с уровнем паладина
          if (source && featKey && source.includes('paladin') && source.includes('-' + featureLevel + '-')) {
            console.log('Debug - Найдена подходящая черта:', featKey);
            choices.push(`feat:${featKey}`);
          }
        });
      }
    }
    
    // Создаем маппинг особенностей к их типам выборов
    const featureChoiceMapping: { [key: string]: string[] } = {
      'Основные особенности класса': ['skills'],
      'Боевой стиль': ['features', 'fightingStyle', 'blessedWarrior'],
      'Оружейное мастерство': ['weaponMastery'],
      'Увеличение характеристик': ['feats'],
      'Клятва Паладина': ['subclass'],
      'Проведение божественности': ['channelDivinity'],
      'Аура защиты': ['aura'],
      'Аура отваги': ['aura'],
      'Расширение ауры': ['aura'],
      'Сияющие удары': ['radiantStrikes'],
      'Дополнительная атака': ['extraAttack'],
      'Верный скакун': ['spells'],
      'Порицание врагов': ['channelDivinity'],
      'Восстанавливающее касание': ['layOnHands'],
      'Эпический дар': ['feats']
    };
    
    const expectedChoices = featureChoiceMapping[featureName] || [];
    
    // Ищем выборы в различных категориях
    Object.entries(draft.chosen).forEach(([category, choicesData]) => {
      if (typeof choicesData === 'object' && choicesData !== null) {
        Object.entries(choicesData).forEach(([source, selectedItems]) => {
          // Проверяем, связан ли источник с особенностью класса и уровнем
          const isClassRelated = source.includes('class') || source.includes('paladin');
          const isLevelRelated = source.includes('level-' + featureLevel) || source.includes('-' + featureLevel + '-');
          const isCategoryMatch = expectedChoices.includes(category);
          
          // Для боевого стиля также проверяем источник feature-fighting-style
          const isFightingStyle = featureName === 'Боевой стиль' && source.includes('fighting-style');
          
          // Для боевого стиля также проверяем выборы типа feature
          const isFeatureChoice = featureName === 'Боевой стиль' && category === 'features' && 
            Array.isArray(selectedItems) && selectedItems.some(item => 
              item === 'fighting-style' || item === 'blessed-warrior'
            );
          
          if ((isClassRelated || isLevelRelated || isFightingStyle || isFeatureChoice) && (expectedChoices.length === 0 || isCategoryMatch)) {
            if (Array.isArray(selectedItems)) {
              selectedItems.forEach(item => {
                if (typeof item === 'string') {
                  // Для боевого стиля переводим ключи в читаемые названия
                  if (featureName === 'Боевой стиль' && item === 'fighting-style') {
                    // Если выбран боевой стиль, ищем конкретный стиль в fightingStyle
                    const fightingStyleChoices = draft.chosen.fightingStyle?.['feature-fighting-style'];
                    if (Array.isArray(fightingStyleChoices)) {
                      fightingStyleChoices.forEach(style => {
                        choices.push(`${category}:${style}`);
                      });
                    }
                  } else if (featureName === 'Боевой стиль' && item === 'blessed-warrior') {
                    choices.push(`${category}:Благословенный воин`);
                  } else {
                    choices.push(`${category}:${item}`);
                  }
                }
              });
            }
          }
        });
      }
    });
    
    return choices;
  };

  // Получаем все черты персонажа
  const getCharacterFeats = () => {
    const allFeats: any[] = [];
    
    if (!characterData?.feats) return allFeats;
    
    // Добавляем черты из characterData.feats (массив строк)
    characterData.feats.forEach((featKey: string) => {
        const feat = ALL_FEATS.find(f => f.key === featKey);
        if (feat) {
          allFeats.push({
            ...feat,
          source: 'character',
            choices: getFeatChoices(featKey)
          });
        }
      });
    
    return allFeats;
  };




  // Переключаем состояние карточки черты
  const toggleFeatExpansion = (index: number) => {
    setExpandedFeats(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Переключаем состояние карточки в развитии
  const toggleProgressionExpansion = (index: number) => {
    setExpandedProgression(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Функция для форматирования текста с поддержкой markdown
  const formatText = (text: string) => {
    if (!text) return '';
    
    // Заменяем \n\n на параграфы
    const paragraphs = text.split('\n\n').map((paragraph, index) => {
      if (!paragraph.trim()) return null;
      
      // Обрабатываем жирный текст **текст**
      let formattedParagraph = paragraph.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold">$1</strong>');
      
      // Обрабатываем курсив *текст*
      formattedParagraph = formattedParagraph.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
      
      // Обрабатываем отступы (начинающиеся с пробелов)
      const isIndented = paragraph.startsWith('  ') || paragraph.startsWith('\t');
      const indentClass = isIndented ? 'ml-4' : '';
      
      return (
        <p key={index} className={`mb-2 last:mb-0 ${indentClass}`}>
          <span dangerouslySetInnerHTML={{ __html: formattedParagraph }} />
        </p>
      );
    }).filter(Boolean);
    
    return paragraphs;
  };

  // Получаем особенности класса по уровням (только полученные на текущем уровне)
  const getClassFeaturesByLevel = () => {
    if (!characterData?.class) return [];

    const classInfo = characterData.class;
    const currentLevel = Number(characterData.level) || Number(draft.basics.level) || 1;
    const classFeats: { 
      name: string; 
      desc: string; 
      choices?: any[]; 
      effect?: any[];
      featureLevel: number;
      originalIndex: number;
      originalLevel: number;
      isSubclass?: boolean;
      uniqueId: string;
    }[] = [];

    // Фичи класса - только те, что получены на текущем уровне или раньше
    Object.entries(classInfo.features).forEach(([lvl, featsArr]) => {
      const level = Number(lvl);
      if (level <= currentLevel && Array.isArray(featsArr)) {
        featsArr.forEach((f, featIdx) => {
          // Исключаем "Основные особенности класса"
          if (f.name !== "Основные особенности класса") {
            classFeats.push({ 
              ...f, 
              featureLevel: level,
              originalIndex: featIdx,
              originalLevel: level,
              uniqueId: `${classInfo.key}-${lvl}-${featIdx}-${f.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`
            });
          }
        });
      }
    });

    // Фичи подклассов - только те, что получены на текущем уровне или раньше
    const subclass = classInfo.subclasses?.find((sc: any) => sc.key === draft.basics.subclass);
    if (subclass) {
      Object.entries(subclass.features || {}).forEach(([lvl, featsArr]) => {
        const level = Number(lvl);
        if (level <= currentLevel && Array.isArray(featsArr)) {
          featsArr.forEach((f, featIdx) => {
            classFeats.push({ 
              ...f, 
              featureLevel: level,
              originalIndex: featIdx,
              originalLevel: level,
              isSubclass: true,
              uniqueId: `${classInfo.key}-subclass-${subclass.key}-${lvl}-${featIdx}-${f.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`
            });
          });
        }
      });
    }

    // Сортируем по уровню
    classFeats.sort((a, b) => a.featureLevel - b.featureLevel);

    return classFeats;
  };


  return (
    <div className="h-full flex flex-col">
      {/* Заголовки подвкладок */}
      <div className="flex items-center gap-6 mb-3">
        <button
          onClick={() => setActiveSubTab('features')}
          className={`flex items-center gap-2 text-base font-bold uppercase tracking-wider border-l-2 pl-2 transition-colors ${
            activeSubTab === 'features'
              ? 'text-foreground border-primary'
              : 'text-muted-foreground border-transparent hover:text-foreground'
          }`}
        >
          <span>Особенности</span>
        </button>
        
        <button
          onClick={() => setActiveSubTab('progression')}
          className={`flex items-center gap-2 text-base font-bold uppercase tracking-wider border-l-2 pl-2 transition-colors ${
            activeSubTab === 'progression'
              ? 'text-foreground border-primary'
              : 'text-muted-foreground border-transparent hover:text-foreground'
          }`}
        >
          <span>Развитие</span>
        </button>
      </div>

      {/* Контент */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {/* Подвкладка "Особенности" */}
        {activeSubTab === 'features' && (
          <>
            {/* Особенности класса */}
            {characterData?.class?.key === 'paladin' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getFrameColor(frameColor) }}></span>
                  ОСОБЕННОСТИ КЛАССА
                </h3>
                <div className="space-y-3">
                  <LayOnHandsManager level={draft.basics.level || 1} frameColor={getFrameColor(frameColor)} />
                  {(() => {
                    const level = draft.basics.level || 1;
                    const subclass = draft.basics.subclass;
                    
                    return level >= 3 && (
                      <ChannelDivinityManager 
                        level={level} 
                        frameColor={getFrameColor(frameColor)}
                        subclass={subclass}
                      />
                    );
                  })()}
                  <AuraManager level={draft.basics.level || 1} frameColor={getFrameColor(frameColor)} subclass={draft.basics.subclass} />
                  <RadiantStrikesManager level={draft.basics.level || 1} frameColor={getFrameColor(frameColor)} />
                </div>
              </div>
            )}

            {/* Выученные черты */}
            <div>
              <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getFrameColor(frameColor) }}></span>
                ЧЕРТЫ
              </h3>
              {getCharacterFeats().length === 0 ? (
                <p className="text-gray-400 text-sm py-4">
                  Черты отсутствуют
                </p>
              ) : (
              <div className="space-y-2">
                  {getCharacterFeats().map((feat, index) => (
                    <div key={index} className="border-b border-gray-600 bg-neutral-900 shadow-inner shadow-sm">
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <div className="w-full p-3 bg-neutral-800 hover:bg-neutral-700 transition-colors cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col items-start">
                                <span className="text-white font-medium">{feat.name}</span>
                                {feat.isLegacy && (
                                  <span 
                                    className="text-xs font-medium mt-1"
                                    style={{ color: getFrameColor(frameColor) }}
                                  >
                                    Legacy
                                  </span>
                                )}
                      </div>
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                      </div>
                      </div>
                    </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="p-4 bg-neutral-900">
                            <div className="space-y-3">
                              <div className="text-gray-300 text-sm leading-relaxed">
                                {formatText(feat.desc)}
                              </div>
                              
                              {feat.effect && feat.effect.length > 0 && (
                                <div className="space-y-2">
                                  <h4 className="text-sm font-semibold text-gray-200">Эффекты:</h4>
                                  {feat.effect.map((effect, effectIndex) => {
                                    const choices = getFeatChoices(feat.key);
                                    console.log('Displaying feat choices for:', feat.key, 'choices:', choices);
                                    
                                    return (
                                      <div key={effectIndex} className="bg-neutral-800 p-3 rounded border-l-2" style={{ borderLeftColor: getFrameColor(frameColor) }}>
                                        {effect.name && (
                                          <h5 className="text-sm font-medium text-gray-200 mb-1">{effect.name}</h5>
                                        )}
                                        {effect.desc && (
                                          <div className="text-xs text-gray-300 leading-relaxed">
                                            {formatText(effect.desc)}
                          </div>
                        )}
                                        
                                        {/* Отображение выбранных опций внутри эффекта */}
                                        {choices.length > 0 && (
                                          <div>
                                            <h6 className="text-sm font-semibold text-gray-200 mb-2">Выбранные опции:</h6>
                                            <div className="space-y-1">
                                              {choices.map((choice, choiceIndex) => {
                                                const [choiceType, choiceValue] = choice.split(':');
                                                let displayName = choiceValue;
                                                
                                                // Переводим ключи в читаемые названия
                                                if (choiceType === 'skill') {
                                                  const skill = SKILLS.find(s => s.key === choiceValue);
                                                  displayName = skill?.name || choiceValue;
                                                } else if (choiceType === 'tool') {
                                                  const tool = Tools.find(t => t.key === choiceValue);
                                                  displayName = tool?.name || choiceValue;
                                                } else if (choiceType === 'language') {
                                                  const language = LANGUAGES.find(l => l.key === choiceValue);
                                                  displayName = language?.name || choiceValue;
                                                } else if (choiceType === 'ability') {
                                                  const ability = ABILITIES.find(a => a.key === choiceValue);
                                                  displayName = ability?.label || choiceValue;
                                                }
                                                
                                                return (
                                                  <div key={choiceIndex} className="text-xs text-gray-300">
                                                    • {displayName}
                      </div>
                                                );
                                              })}
              </div>
            </div>
                                        )}
                                      </div>
                                    );
                                  })}
        </div>
      )}

                              {feat.prerequisites && (
                                <div className="space-y-1">
                                  <h4 className="text-sm font-semibold text-gray-200">Требования:</h4>
                                  <div className="text-xs text-gray-300 space-y-1">
                                    {feat.prerequisites.level && (
                                      <p>• Уровень: {feat.prerequisites.level}</p>
                                    )}
                                    {feat.prerequisites.oneOfAbilities && (
                                      <p>• Характеристики: {Object.entries(feat.prerequisites.oneOfAbilities).map(([key, value]) => `${key} ${value}+`).join(' или ')}</p>
                                    )}
                                    {feat.prerequisites.races && (
                                      <p>• Расы: {feat.prerequisites.races.join(', ')}</p>
                                    )}
                                    {feat.prerequisites.spellcasting && (
                                      <p>• Заклинательство</p>
                                    )}
                                    {feat.prerequisites.armor && (
                                      <p>• Доспехи: {feat.prerequisites.armor}</p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Боевые стили */}
            <FightingStylesSection
              draft={draft}
              frameColor={frameColor}
              getFrameColor={getFrameColor}
              showTitle={true}
            />
          </>
        )}

        {/* Подвкладка "Развитие" */}
        {activeSubTab === 'progression' && (
              <div className="space-y-2">
            {getClassFeaturesByLevel().map((f, idx) => (
              <div key={f.uniqueId} className="border-b border-gray-600 bg-neutral-900 shadow-inner shadow-sm">
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <div className="w-full p-3 bg-neutral-800 hover:bg-neutral-700 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col items-start">
                          <span className="text-white font-medium">{f.name}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400">
                              {f.featureLevel}-й уровень
                            </span>
                            {f.isSubclass && (
                              <span 
                                className="text-xs font-medium px-2 py-1 rounded"
                                style={{ 
                                  backgroundColor: `${getFrameColor(frameColor)}20`,
                                  color: getFrameColor(frameColor)
                                }}
                              >
                                Подкласс
                          </span>
                        )}
                      </div>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </div>
                      </div>
                    </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-4 bg-neutral-900">
                      <div className="space-y-3">
                        <div className="text-gray-300 text-sm leading-relaxed">
                          {formatText(f.desc)}
                        </div>
                        
                        {f.effect && f.effect.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-200">Эффекты:</h4>
                            {f.effect.map((effect, effectIndex) => {
                              const choices = getClassFeatureChoices(f.name, f.featureLevel);
                              
                              return (
                                <div key={effectIndex} className="bg-neutral-800 p-3 rounded border-l-2" style={{ borderLeftColor: getFrameColor(frameColor) }}>
                                  {effect.name && (
                                    <h5 className="text-sm font-medium text-gray-200 mb-1">{effect.name}</h5>
                                  )}
                                  {effect.desc && (
                                    <div className="text-xs text-gray-300 leading-relaxed">
                                      {formatText(effect.desc)}
                                    </div>
                                  )}
                                  {effect.type && (
                                    <p className="text-xs text-gray-400 mt-1">Тип: {effect.type}</p>
                                  )}
                                  {effect.count && (
                                    <p className="text-xs text-gray-400">Количество: {effect.count}</p>
                                  )}
                                  {effect.options && (
                                    <div className="text-xs text-gray-400 mt-1">
                                      Опции: {Array.isArray(effect.options) ? effect.options.join(', ') : JSON.stringify(effect.options)}
                                    </div>
                                  )}
                                  
                                  {/* Отображение выбранных опций */}
                                  {choices.length > 0 && (
                                    <div className="mt-3">
                                      <h6 className="text-sm font-semibold text-gray-200 mb-2">Выбранные опции:</h6>
                            <div className="space-y-1">
                                        {choices.map((choice, choiceIndex) => {
                                          const [choiceType, choiceValue] = choice.split(':');
                                          let displayName = choiceValue;
                                          
                                          // Переводим ключи в читаемые названия
                                          if (choiceType === 'skill') {
                                            const skill = SKILLS.find(s => s.key === choiceValue);
                                            displayName = skill?.name || choiceValue;
                                          } else if (choiceType === 'tool') {
                                            const tool = Tools.find(t => t.key === choiceValue);
                                            displayName = tool?.name || choiceValue;
                                          } else if (choiceType === 'language') {
                                            const language = LANGUAGES.find(l => l.key === choiceValue);
                                            displayName = language?.name || choiceValue;
                                          } else if (choiceType === 'ability') {
                                            const ability = ABILITIES.find(a => a.key === choiceValue);
                                            displayName = ability?.label || choiceValue;
                                          }
                                          
                                          return (
                                            <div key={choiceIndex} className="text-xs text-gray-300">
                                              • {displayName}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        
                        {f.choices && f.choices.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-200">Выборы:</h4>
                            <div className="bg-neutral-800 p-3 rounded border-l-2" style={{ borderLeftColor: getFrameColor(frameColor) }}>
                              {/* Отображение выбранных опций для выборов */}
                              {(() => {
                                const choices = getClassFeatureChoices(f.name, f.featureLevel);
                                return choices.length > 0 ? (
                                  <div className="space-y-1">
                                    {choices.map((choice, choiceIndex) => {
                                      const [choiceType, choiceValue] = choice.split(':');
                                      let displayName = choiceValue;
                                      
                                      // Переводим ключи в читаемые названия
                                      if (choiceType === 'skill') {
                                        const skill = SKILLS.find(s => s.key === choiceValue);
                                        displayName = skill?.name || choiceValue;
                                      } else if (choiceType === 'tool') {
                                        const tool = Tools.find(t => t.key === choiceValue);
                                        displayName = tool?.name || choiceValue;
                                      } else if (choiceType === 'language') {
                                        const language = LANGUAGES.find(l => l.key === choiceValue);
                                        displayName = language?.name || choiceValue;
                                      } else if (choiceType === 'ability') {
                                        const ability = ABILITIES.find(a => a.key === choiceValue);
                                        displayName = ability?.label || choiceValue;
                                      } else if (choiceType === 'subclass') {
                                        // Для подкласса переводим ключ в название
                                        const subclassNames: { [key: string]: string } = {
                                          'oath-of-devotion': 'Клятва преданности',
                                          'oath-of-the-ancients': 'Клятва древних',
                                          'oath-of-glory': 'Клятва славы',
                                          'oath-of-vengeance': 'Клятва возмездия'
                                        };
                                        displayName = subclassNames[choiceValue] || choiceValue;
                                      } else if (choiceType === 'features') {
                                        // Для боевых стилей переводим ключи
                                        const fightingStyleNames: { [key: string]: string } = {
                                          'great_weapon_fighting': 'Бой большим оружием',
                                          'defense': 'Защита',
                                          'dueling': 'Дуэль',
                                          'protection': 'Защита',
                                          'two_weapon_fighting': 'Бой двумя оружиями',
                                          'archery': 'Стрельба из лука'
                                        };
                                        displayName = fightingStyleNames[choiceValue] || choiceValue;
                                      } else if (choiceType === 'weaponMastery') {
                                        // Для оружия переводим ключи в названия
                                        const weapon = getWeaponByKey(choiceValue);
                                        displayName = weapon?.name || choiceValue;
                                      } else if (choiceType === 'fightingStyle') {
                                        // Для конкретных боевых стилей переводим ключи
                                        const fightingStyleNames: { [key: string]: string } = {
                                          'great_weapon_fighting': 'Бой большим оружием',
                                          'defense': 'Защита',
                                          'dueling': 'Дуэль',
                                          'protection': 'Защита',
                                          'two_weapon_fighting': 'Бой двумя оружиями',
                                          'archery': 'Стрельба из лука'
                                        };
                                        displayName = fightingStyleNames[choiceValue] || choiceValue;
                                      } else if (choiceType === 'feat') {
                                        // Для черт ищем название в ALL_FEATS
                                        const feat = ALL_FEATS.find(f => f.key === choiceValue);
                                        displayName = feat?.name || choiceValue;
                                      }
                                      
                                      return (
                                        <div key={choiceIndex} className="text-xs text-gray-300">
                                          • {displayName}
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="text-xs text-gray-400 italic">
                                    Выбор не сделан
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
