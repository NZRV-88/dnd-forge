import React, { useState } from 'react';
import { ALL_FEATS } from "@/data/feats/feats";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface FeatsSectionProps {
  characterData: any;
  draft: any;
  frameColor: string;
  getFrameColor: (color: string) => string;
  featuresSearchFilter?: string;
  showTitle?: boolean;
  className?: string;
}

export default function FeatsSection({
  characterData,
  draft,
  frameColor,
  getFrameColor,
  featuresSearchFilter = '',
  showTitle = true,
  className = ''
}: FeatsSectionProps) {
  
  const [expandedFeats, setExpandedFeats] = useState<Set<number>>(new Set());

  // Получаем выбранные опции черты
  const getFeatChoices = (featKey: string) => {
    if (!draft?.chosen) return [];
    
    const choices = draft.chosen.feats || {};
    return choices[featKey] || [];
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

  // Если нет черт, не отображаем секцию
  if (filteredFeats.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {showTitle && (
        <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getFrameColor(frameColor) }}></span>
          ЧЕРТЫ
        </h3>
      )}
      <div className="space-y-2">
        {filteredFeats.map((feat, index) => (
          <div key={index} className="border-b border-gray-600 bg-neutral-900 shadow-inner shadow-sm">
            <Collapsible>
              <CollapsibleTrigger asChild>
                <div className="w-full p-3 bg-neutral-800 hover:bg-neutral-700 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{feat.name}</span>
                      {feat.choices && feat.choices.length > 0 && (
                        <span className="text-xs bg-blue-600 text-blue-200 px-2 py-1 rounded">
                          {feat.choices.length} выборов
                        </span>
                      )}
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 bg-neutral-900">
                  <div className="text-gray-300 text-sm leading-relaxed">
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
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        ))}
      </div>
    </div>
  );
}
