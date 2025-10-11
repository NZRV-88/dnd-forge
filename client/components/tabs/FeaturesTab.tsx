import React, { useState } from 'react';
import { ALL_FEATS } from "@/data/feats/feats";
import DynamicFrame from "@/components/ui/DynamicFrame";
import { Star, Search, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SKILLS } from "@/data/skills";
import { Tools } from "@/data/items/tools";
import { LANGUAGES } from "@/data/languages/languages";
import { ABILITIES } from "@/data/abilities";
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
  const [featuresSearchFilter, setFeaturesSearchFilter] = useState('');
  const [featuresCategoryFilter, setFeaturesCategoryFilter] = useState<'all' | 'feats' | 'fighting-styles'>('all');

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


  // Фильтруем черты
  const getFilteredFeats = () => {
    let feats = getCharacterFeats();
    
    // Применяем общий поиск
    if (featuresSearchFilter.trim()) {
      const searchLower = featuresSearchFilter.toLowerCase();
      feats = feats.filter(feat => 
        feat.name.toLowerCase().includes(searchLower) ||
        feat.description.toLowerCase().includes(searchLower)
      );
    }
    
    return feats;
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


  const filteredFeats = getFilteredFeats();

  return (
    <div className="h-full flex flex-col">
      {/* Поиск и фильтры */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск особенностей..."
            value={featuresSearchFilter}
            onChange={(e) => setFeaturesSearchFilter(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-transparent border rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-0"
            style={{
              borderColor: getFrameColor(frameColor)
            }}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFeaturesCategoryFilter('all')}
            className="px-1 py-0.5 rounded text-xs font-medium transition-colors border"
            style={{
              backgroundColor: featuresCategoryFilter === 'all' ? getFrameColor(frameColor) : 'transparent',
              borderColor: getFrameColor(frameColor),
              color: featuresCategoryFilter === 'all' ? '#FFFFFF' : getFrameColor(frameColor)
            }}
            onMouseEnter={(e) => {
              if (featuresCategoryFilter !== 'all') {
                e.currentTarget.style.backgroundColor = `${getFrameColor(frameColor)}20`;
              }
            }}
            onMouseLeave={(e) => {
              if (featuresCategoryFilter !== 'all') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            ВСЕ
          </button>
          <button
            onClick={() => setFeaturesCategoryFilter('feats')}
            className="px-1 py-0.5 rounded text-xs font-medium transition-colors border"
            style={{
              backgroundColor: featuresCategoryFilter === 'feats' ? getFrameColor(frameColor) : 'transparent',
              borderColor: getFrameColor(frameColor),
              color: featuresCategoryFilter === 'feats' ? '#FFFFFF' : getFrameColor(frameColor)
            }}
            onMouseEnter={(e) => {
              if (featuresCategoryFilter !== 'feats') {
                e.currentTarget.style.backgroundColor = `${getFrameColor(frameColor)}20`;
              }
            }}
            onMouseLeave={(e) => {
              if (featuresCategoryFilter !== 'feats') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            ЧЕРТЫ
          </button>
          <button
            onClick={() => setFeaturesCategoryFilter('fighting-styles')}
            className="px-1 py-0.5 rounded text-xs font-medium transition-colors border"
            style={{
              backgroundColor: featuresCategoryFilter === 'fighting-styles' ? getFrameColor(frameColor) : 'transparent',
              borderColor: getFrameColor(frameColor),
              color: featuresCategoryFilter === 'fighting-styles' ? '#FFFFFF' : getFrameColor(frameColor)
            }}
            onMouseEnter={(e) => {
              if (featuresCategoryFilter !== 'fighting-styles') {
                e.currentTarget.style.backgroundColor = `${getFrameColor(frameColor)}20`;
              }
            }}
            onMouseLeave={(e) => {
              if (featuresCategoryFilter !== 'fighting-styles') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            БОЕВЫЕ СТИЛИ
          </button>
        </div>
      </div>

      {/* Контент */}
      <div className="flex-1 overflow-y-auto space-y-6">
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
        {(featuresCategoryFilter === 'all' || featuresCategoryFilter === 'feats') && (
          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getFrameColor(frameColor) }}></span>
              ЧЕРТЫ
            </h3>
            {filteredFeats.length === 0 ? (
              <p className="text-gray-400 text-sm py-4">
                Черты отсутствуют
              </p>
            ) : (
              <div className="space-y-2">
                {filteredFeats.map((feat, index) => (
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
                            <p className="text-gray-300 text-sm leading-relaxed">{feat.desc}</p>
                            
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
                                        <p className="text-xs text-gray-300 leading-relaxed">{effect.desc}</p>
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
        )}

        {/* Боевые стили */}
        {(featuresCategoryFilter === 'all' || featuresCategoryFilter === 'fighting-styles') && (
          <FightingStylesSection
            draft={draft}
            frameColor={frameColor}
            getFrameColor={getFrameColor}
            featuresSearchFilter={featuresSearchFilter}
            showTitle={true}
          />
        )}
      </div>
    </div>
  );
}
