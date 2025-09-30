import React, { useState, useRef, useEffect } from 'react';
import { ClassInfo } from '@/data/classes/types';
import { getProficiencyName } from '@/data/proficiencies';
import { ABILITIES } from '@/data/abilities';
import { SKILLS } from '@/data/skills';
import ChoiceRenderer from '@/components/ui/ChoiceRenderer';
import type { ChoiceOption } from '@/data/shared/choices';

interface ClassTraitsTableProps {
  classInfo: ClassInfo;
  choices?: ChoiceOption[];
  source?: string;
  showChoices?: boolean; // Показывать ли выборы навыков
}

export function ClassTraitsTable({ classInfo, choices, source, showChoices = false }: ClassTraitsTableProps) {
  const [textExpanded, setTextExpanded] = useState(false);
  const [needsToggle, setNeedsToggle] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const textMaxHeight = 80; // Максимальная высота до сворачивания

  // Логика сворачивания текста
  useEffect(() => {
    if (contentRef.current) {
      const timer = setTimeout(() => {
        if (contentRef.current) {
          setNeedsToggle(contentRef.current.scrollHeight > textMaxHeight);
        }
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [textMaxHeight]);

  // Сбрасываем textExpanded при изменении контента
  useEffect(() => {
    if (!textExpanded) {
      setTextExpanded(false);
    }
  }, [classInfo]);

  // Группируем владения по типам
  const armorProfs = classInfo.proficiencies?.filter(p => p.type === "armor") || [];
  const weaponProfs = classInfo.proficiencies?.filter(p => p.type === "weapon") || [];
  const savingThrowProfs = classInfo.proficiencies?.filter(p => p.type === "savingThrow") || [];
  const skillProfs = classInfo.proficiencies?.filter(p => p.type === "skill") || [];

  // Получаем названия спасбросков
  const savingThrowNames = savingThrowProfs.map(prof => {
    const ability = ABILITIES.find(a => a.key === prof.key);
    return ability ? ability.label : prof.key;
  });

  // Получаем названия навыков из choices (если есть) или из proficiencies
  let skillNames: string[] = [];
  let skillCount = 0; // Количество навыков для выбора
  let skillDescription = ""; // Описание навыков
  
  // Сначала получаем фиксированные навыки из proficiencies
  const fixedSkills = skillProfs.map(prof => getProficiencyName(prof));
  
  if (choices && choices.length > 0) {
    // Ищем choice с типом "skill"
    const skillChoice = choices.find(choice => choice.type === "skill");
    
    if (skillChoice && skillChoice.options) {
      // Получаем количество навыков для выбора
      skillCount = skillChoice.count || 0;
      // Получаем названия навыков из options
      const choiceSkills = skillChoice.options.map(option => {
        // Ищем навык в SKILLS по ключу
        const skill = SKILLS.find(s => s.key === option);
        return skill ? skill.name : option.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      });
      
      // Объединяем фиксированные навыки и выбор навыков
      if (fixedSkills.length > 0) {
        skillDescription = `${fixedSkills.join(", ")}; выберите ${skillCount}: ${choiceSkills.join(", ")}`;
        skillNames = [...fixedSkills, ...choiceSkills];
      } else {
        skillDescription = `Выберите ${skillCount}: ${choiceSkills.join(", ")}`;
        skillNames = choiceSkills;
      }
    } else {
      // Если нет choices для навыков, используем только фиксированные
      skillDescription = fixedSkills.join(", ");
      skillNames = fixedSkills;
    }
  } else {
    // Fallback на proficiencies
    skillDescription = fixedSkills.join(", ");
    skillNames = fixedSkills;
  }

  // Формируем строки таблицы
  const tableRows = [
    {
      label: "Основные характеристики",
      value: classInfo.mainStats.join(" или ")
    },
    {
      label: "Кость хитов",
      value: `d${classInfo.hitDice} за уровень ${classInfo.name.toLowerCase()}а`
    },
    {
      label: "Владение спасбросками",
      value: savingThrowNames.length > 0 ? savingThrowNames.join(", ") : "—"
    },
    {
      label: "Владение навыками",
      value: skillDescription || "—"
    },
    {
      label: "Владение оружием",
      value: weaponProfs.length > 0 ? "Простое и воинское оружие" : "—"
    },
    {
      label: "Владение доспехами",
      value: armorProfs.length > 0 ? "Лёгкие, средние и тяжёлые доспехи, щиты" : "—"
    }
  ];

  return (
    <div className="w-full">
      <div className="pb-3">
        <p className="text-xs text-muted-foreground">
          Как персонаж 1-го уровня:
        </p>
      </div>
      <div className="pt-0">
        <div className="space-y-1">
          <div 
            ref={contentRef} 
            className={`relative ${!textExpanded ? 'overflow-hidden' : ''}`}
            style={{ maxHeight: textExpanded ? "none" : `${textMaxHeight}px` }}
          >
            <p className="text-xs text-muted-foreground mb-3">
              Получите все особенности из таблицы "Основные особенности класса".
            </p>
            
            <div className="bg-muted/30 rounded-lg overflow-hidden">
              <div className="bg-primary/10 px-4 py-2">
                <h4 className="font-semibold text-xs">Основные особенности класса</h4>
              </div>
              <div className="divide-y divide-border">
                {tableRows.map((row, index) => (
                  <div 
                    key={index} 
                    className={`px-4 py-3 flex justify-between items-start ${
                      index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                    }`}
                  >
                    <span className="font-medium text-xs text-foreground min-w-0 flex-1">
                      {row.label}:
                    </span>
                    <span className="text-xs text-muted-foreground text-right ml-4 max-w-[60%]">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {!textExpanded && needsToggle && (
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card via-card/80 to-transparent pointer-events-none" />
            )}
          </div>

          {needsToggle && (
            <button
              className="text-lime-500 font-semibold text-xs mt-1 hover:text-lime-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setTextExpanded(!textExpanded);
              }}
            >
              {textExpanded ? "Свернуть" : "Показать больше"}
            </button>
          )}

          {/* Показываем выборы навыков, если нужно */}
          {showChoices && choices && choices.length > 0 && source && (
            <div className="mt-4">
              {choices.map((choice, ci) => (
                <ChoiceRenderer key={`${source}-${ci}`} ci={ci} source={source} choices={[choice]} />
              ))}
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
