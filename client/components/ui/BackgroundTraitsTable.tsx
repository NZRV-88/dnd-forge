import React from 'react';
import { BackgroundInfo } from '@/data/backgrounds/types';
import { getProficiencyName } from '@/data/proficiencies';
import ChoiceRenderer from '@/components/ui/ChoiceRenderer';
import { ALL_FEATS } from '@/data/feats/feats';
import * as Icons from '@/components/refs/icons';
import type { ChoiceOption } from '@/data/shared/choices';

interface BackgroundTraitsTableProps {
  backgroundInfo: BackgroundInfo;
  choices?: ChoiceOption[];
  source?: string;
  showChoices?: boolean;
}

export function BackgroundTraitsTable({ backgroundInfo, choices, source, showChoices = false }: BackgroundTraitsTableProps) {

  // Группируем владения по типам
  const skillProfs = backgroundInfo.proficiencies?.filter(p => p.type === "skill") || [];
  const toolProfs = backgroundInfo.proficiencies?.filter(p => p.type === "tool" || p.type === "tool-proficiency") || [];

  // Получаем названия навыков
  const skillNames = skillProfs.map(prof => getProficiencyName(prof));

  // Получаем названия инструментов
  const toolNames = toolProfs.map(prof => getProficiencyName(prof));

  // Получаем языки
  const languages = backgroundInfo.languages || [];

  // Получаем снаряжение
  const equipment = backgroundInfo.equipment || [];

  return (
    <div className="space-y-3">
      {/* <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Основные особенности предыстории
      </div> */}
      
      <div className="text-xs text-muted-foreground space-y-2">
        {/* Владение навыками */}
        {skillNames.length > 0 && (
          <div>
            <span className="font-medium">Владение навыками:</span> {skillNames.join(', ')}
          </div>
        )}

        {/* Владение инструментами */}
        {toolNames.length > 0 && (
          <div>
            <span className="font-medium">Владение инструментами:</span> {toolNames.join(', ')}
          </div>
        )}

        {/* Языки */}
        {languages.length > 0 && (
          <div>
            <span className="font-medium">Языки:</span> {languages.join(', ')}
          </div>
        )}

        {/* Снаряжение */}
        {equipment.length > 0 && (
          <div>
            <span className="font-medium">Снаряжение:</span> {equipment.join(', ')}
          </div>
        )}

        {/* Выборы предыстории */}
        {choices && choices.length > 0 && showChoices && (
          <div className="mt-3">
            <ChoiceRenderer
              choices={choices}
              source={source || 'background-choices'}
              ci={0}
            />
          </div>
        )}
      </div>
    </div>
  );
}
