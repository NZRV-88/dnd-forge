import React, { useState } from 'react';
import { FIGHTING_STYLES } from "@/data/classes/features/fightingStyles";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface FightingStylesSectionProps {
  draft: any;
  frameColor: string;
  getFrameColor: (color: string) => string;
  featuresSearchFilter?: string;
  showTitle?: boolean;
  className?: string;
}

export default function FightingStylesSection({
  draft,
  frameColor,
  getFrameColor,
  featuresSearchFilter = '',
  showTitle = true,
  className = ''
}: FightingStylesSectionProps) {
  
  const [expandedStyles, setExpandedStyles] = useState<Set<number>>(new Set());

  // Получаем боевые стили персонажа
  const getCharacterFightingStyles = () => {
    if (!draft?.chosen?.fightingStyle) return [];
    
    // Собираем все боевые стили из всех источников
    const allFightingStyles: string[] = [];
    Object.values(draft.chosen.fightingStyle).forEach(styles => {
      if (Array.isArray(styles)) {
        allFightingStyles.push(...styles);
      }
    });
    
    return allFightingStyles.map(styleKey => {
      const style = FIGHTING_STYLES.find(s => s.key === styleKey);
      return style;
    }).filter(Boolean);
  };

  // Фильтруем боевые стили
  const getFilteredFightingStyles = () => {
    let styles = getCharacterFightingStyles();
    
    if (featuresSearchFilter.trim()) {
      const searchLower = featuresSearchFilter.toLowerCase();
      styles = styles.filter(style => 
        style.name.toLowerCase().includes(searchLower) ||
        style.desc.toLowerCase().includes(searchLower)
      );
    }
    
    return styles;
  };

  // Переключаем состояние карточки боевого стиля
  const toggleStyleExpansion = (index: number) => {
    setExpandedStyles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const filteredStyles = getFilteredFightingStyles();

  // Если нет боевых стилей, не отображаем секцию
  if (filteredStyles.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {showTitle && (
        <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getFrameColor(frameColor) }}></span>
          БОЕВЫЕ СТИЛИ
        </h3>
      )}
      <div className="space-y-2">
        {filteredStyles.map((style, index) => (
          <div key={index} className="border-b border-gray-600 bg-neutral-900 shadow-inner shadow-sm">
            <Collapsible>
              <CollapsibleTrigger asChild>
                <div className="w-full p-3 bg-neutral-800 hover:bg-neutral-700 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{style.name}</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 bg-neutral-900">
                  <p className="text-gray-300 text-sm leading-relaxed">{style.desc}</p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        ))}
      </div>
    </div>
  );
}
