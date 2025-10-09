import React, { useState } from 'react';
import { ALL_FEATS } from "@/data/feats/feats";
import { FIGHTING_STYLES } from "@/data/classes/features/fightingStyles";
import DynamicFrame from "@/components/ui/DynamicFrame";
import { Star, Search } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  const [expandedFightingStyles, setExpandedFightingStyles] = useState<Set<number>>(new Set());
  const [featSearch, setFeatSearch] = useState('');
  const [fightingStyleSearch, setFightingStyleSearch] = useState('');

  // Получаем выбранные опции черты
  const getFeatChoices = (featKey: string) => {
    if (!draft?.chosen) return [];
    
    const choices = draft.chosen.feats || {};
    return choices[featKey] || [];
  };

  // Получаем все черты персонажа
  const getCharacterFeats = () => {
    const allFeats: any[] = [];
    
    if (!characterData?.chosen?.feats) return allFeats;
    
    // Добавляем черты класса
    if (characterData.chosen.feats.class) {
      characterData.chosen.feats.class.forEach((featKey: string) => {
        const feat = ALL_FEATS.find(f => f.key === featKey);
        if (feat) {
          allFeats.push({
            ...feat,
            source: 'class',
            choices: getFeatChoices(featKey)
          });
        }
      });
    }
    
    // Добавляем черты подрасы
    if (characterData.chosen.feats.subrace) {
      characterData.chosen.feats.subrace.forEach((featKey: string) => {
        const feat = ALL_FEATS.find(f => f.key === featKey);
        if (feat) {
          allFeats.push({
            ...feat,
            source: 'subrace',
            choices: getFeatChoices(featKey)
          });
        }
      });
    }
    
    // Добавляем черты фона
    if (characterData.chosen.feats.background) {
      characterData.chosen.feats.background.forEach((featKey: string) => {
        const feat = ALL_FEATS.find(f => f.key === featKey);
        if (feat) {
          allFeats.push({
            ...feat,
            source: 'background',
            choices: getFeatChoices(featKey)
          });
        }
      });
    }
    
    return allFeats;
  };

  // Получаем боевые стили персонажа
  const getCharacterFightingStyles = () => {
    if (!draft?.chosen?.fightingStyle) return [];
    
    return draft.chosen.fightingStyle.map((styleKey: string) => {
      const style = FIGHTING_STYLES.find(s => s.key === styleKey);
      return style ? { ...style, source: 'class' } : null;
    }).filter(Boolean);
  };

  // Фильтруем черты
  const getFilteredFeats = () => {
    let feats = getCharacterFeats();
    
    if (featSearch.trim()) {
      const searchLower = featSearch.toLowerCase();
      feats = feats.filter(feat => 
        feat.name.toLowerCase().includes(searchLower) ||
        feat.description.toLowerCase().includes(searchLower)
      );
    }
    
    return feats;
  };

  // Фильтруем боевые стили
  const getFilteredFightingStyles = () => {
    let styles = getCharacterFightingStyles();
    
    if (fightingStyleSearch.trim()) {
      const searchLower = fightingStyleSearch.toLowerCase();
      styles = styles.filter(style => 
        style.name.toLowerCase().includes(searchLower) ||
        style.description.toLowerCase().includes(searchLower)
      );
    }
    
    return styles;
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

  // Переключаем состояние карточки боевого стиля
  const toggleFightingStyleExpansion = (index: number) => {
    setExpandedFightingStyles(prev => {
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
  const filteredFightingStyles = getFilteredFightingStyles();

  return (
    <div className="h-full flex flex-col">
      {/* Заголовок */}
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5" style={{ color: getFrameColor(frameColor) }} />
        <h2 className="text-xl font-bold text-gray-100">Черты</h2>
      </div>

      {/* Боевые стили */}
      {filteredFightingStyles.length > 0 && (
        <div className="mb-6">
          <DynamicFrame frameType="actions" className="w-full">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-200 mb-3">Боевые стили</h3>
              
              {/* Поиск боевых стилей */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск боевых стилей..."
                  value={fightingStyleSearch}
                  onChange={(e) => setFightingStyleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                {filteredFightingStyles.map((style, index) => (
                  <Collapsible key={index}>
                    <CollapsibleTrigger
                      onClick={() => toggleFightingStyleExpansion(index)}
                      className="w-full flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-200">{style.name}</span>
                        <span className="text-sm text-gray-400">({style.source})</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        {expandedFightingStyles.has(index) ? 'Свернуть' : 'Развернуть'}
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-3 bg-gray-700 rounded-lg mt-2">
                      <div className="text-sm text-gray-300">
                        <p className="mb-2">{style.description}</p>
                        {style.effects && (
                          <div className="text-xs text-gray-400">
                            <p><strong>Эффекты:</strong> {style.effects}</p>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </div>
          </DynamicFrame>
        </div>
      )}

      {/* Черты */}
      <div className="flex-1 overflow-y-auto">
        <DynamicFrame frameType="actions" className="w-full">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-200 mb-3">Черты</h3>
            
            {/* Поиск черт */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск черт..."
                value={featSearch}
                onChange={(e) => setFeatSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {filteredFeats.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Черты не найдены</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFeats.map((feat, index) => (
                  <Collapsible key={index}>
                    <CollapsibleTrigger
                      onClick={() => toggleFeatExpansion(index)}
                      className="w-full flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-200">{feat.name}</span>
                        <span className="text-sm text-gray-400">({feat.source})</span>
                        {feat.choices && feat.choices.length > 0 && (
                          <span className="text-xs bg-blue-600 text-blue-200 px-2 py-1 rounded">
                            {feat.choices.length} выборов
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">
                        {expandedFeats.has(index) ? 'Свернуть' : 'Развернуть'}
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-3 bg-gray-700 rounded-lg mt-2">
                      <div className="text-sm text-gray-300">
                        <p className="mb-2">{feat.description}</p>
                        
                        {feat.choices && feat.choices.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs text-gray-400 mb-1"><strong>Выбранные опции:</strong></p>
                            <div className="space-y-1">
                              {feat.choices.map((choice: string, choiceIndex: number) => (
                                <div key={choiceIndex} className="text-xs text-gray-300 bg-gray-600 px-2 py-1 rounded">
                                  {choice}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {feat.effects && (
                          <div className="text-xs text-gray-400">
                            <p><strong>Эффекты:</strong> {feat.effects}</p>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            )}
          </div>
        </DynamicFrame>
      </div>
    </div>
  );
}
