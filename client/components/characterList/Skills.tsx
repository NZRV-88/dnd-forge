import React from "react";
import DynamicFrame from "@/components/ui/DynamicFrame";
import { useFrameColor } from "@/contexts/FrameColorContext";
import { SimpleTooltip } from "@/components/ui/SimpleTooltip";

// Импортируем FRAME_COLORS из DynamicFrame
const FRAME_COLORS = {
  gold: '#B59E54',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  copper: '#B87333',
  steel: '#71797E',
  red: '#DC2626',
  blue: '#2563EB',
  green: '#16A34A',
  purple: '#9333EA',
  orange: '#EA580C',
  pink: '#EC4899',
  cyan: '#0891B2',
  lime: '#65A30D',
  indigo: '#4F46E5',
  teal: '#0D9488',
  emerald: '#059669',
  rose: '#E11D48',
  amber: '#D97706',
  violet: '#7C3AED',
  fuchsia: '#C026D3',
  sky: '#0284C7',
  stone: '#78716C',
  neutral: '#6B7280',
  zinc: '#71717A',
  slate: '#64748B',
  gray: '#6B7280',
  cool: '#6B7280',
  warm: '#78716C',
  true: '#FFFFFF',
};

// Вспомогательная функция для получения цвета рамки
const getFrameColor = (color: string) => {
  return FRAME_COLORS[color as keyof typeof FRAME_COLORS] || FRAME_COLORS.gold;
};

type Props = {
  stats: Record<string, number>;
  onRoll: (label: string, key: string, value: number) => void;
  profs: string[];
  expertise: string[];  // навыки с экспертностью
  proficiencyBonus: number;
  onToggleProf?: (skillKey: string) => void; // опционально
  isActive?: boolean;
};

const SKILLS: Record<string, { ability: keyof typeof ABILITIES; ru: string }> = {
  athletics: { ability: "str", ru: "Атлетика" },
  acrobatics: { ability: "dex", ru: "Акробатика" },
  sleight: { ability: "dex", ru: "Ловкость рук" },
  stealth: { ability: "dex", ru: "Скрытность" },
  arcana: { ability: "int", ru: "Магия" },
  history: { ability: "int", ru: "История" },
  investigation: { ability: "int", ru: "Расследование" },
  nature: { ability: "int", ru: "Природа" },
  religion: { ability: "int", ru: "Религия" },
  animal: { ability: "wis", ru: "Обращение с животными" },
  insight: { ability: "wis", ru: "Проницательность" },
  medicine: { ability: "wis", ru: "Медицина" },
  perception: { ability: "wis", ru: "Восприятие" },
  survival: { ability: "wis", ru: "Выживание" },
  deception: { ability: "cha", ru: "Обман" },
  intimidation: { ability: "cha", ru: "Запугивание" },
  performance: { ability: "cha", ru: "Выступление" },
  persuasion: { ability: "cha", ru: "Убеждение" },
};

const ABILITIES: Record<string, string> = {
  str: "СИЛ",
  dex: "ЛОВ",
  con: "ТЕЛ",
  int: "ИНТ",
  wis: "МДР",
  cha: "ХАР",
};

const mod = (v: number) => Math.floor((v - 10) / 2);

export default function Skills({
  stats,
  onRoll,
  profs,
  expertise = [],
  proficiencyBonus,
  onToggleProf,
  isActive = true,
}: Props) {
  const profSet = new Set(profs);
  const expertiseSet = new Set(expertise);

  const sortedSkills = Object.entries(SKILLS).sort(([, a], [, b]) =>
    a.ru.localeCompare(b.ru, "ru")
  );

  const { frameColor } = useFrameColor();

  return (
    <DynamicFrame
      frameType="skills"
      size="custom"
      className="relative w-[310px] h-[810px]"
    >
      {/* Фон под рамкой */}
      <div 
        className="absolute top-0 -left-[5px] -right-[6px] bottom-0 -z-50 opacity-50"
        style={{
          backgroundImage: `url('/frames/skillFrameBg.svg')`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Контент */}
      <div
        className="flex flex-col px-12 pt-3 pb-8 z-10"
      >
        {sortedSkills.map(([key, { ability, ru }], index) => {
          const value = stats[ability] || 0;
          const hasProf = profSet.has(key);
          const hasExpertise = expertiseSet.has(key);
          const bonus = mod(value) + (hasProf ? proficiencyBonus : 0) + (hasExpertise ? proficiencyBonus : 0);

          return (
            <React.Fragment key={key}>
              {index > 0 && (
                <div 
                  className="h-px my-1"
                  style={{
                    backgroundColor: `${getFrameColor(frameColor)}40`
                  }}
                />
              )}
              <div
                className="grid grid-cols-[0px_35px_minmax(0,1fr)_10px] items-center py-[1px] text-sm"
              >
              {/* Владение */}
              {onToggleProf ? (
                <button
                  onClick={() => onToggleProf(key)}
                  className="w-4 h-4 rounded-full flex items-center justify-center focus:outline-none -ml-6"
                >
                  {hasProf || hasExpertise ? (
                    hasExpertise ? (
                      <SimpleTooltip content="Экспертность">
                        <span 
                          className="w-3 h-3 rounded-full block hover:opacity-70 relative"
                          style={{ backgroundColor: getFrameColor(frameColor) }}
                        >
                          <span 
                            className="absolute -inset-1 rounded-full border-2 border-transparent"
                            style={{ 
                              borderColor: `${getFrameColor(frameColor)}40`,
                              backgroundColor: 'transparent'
                            }}
                          >
                            <span 
                              className="absolute -inset-0.5 rounded-full border"
                              style={{ 
                                borderColor: getFrameColor(frameColor),
                                backgroundColor: 'transparent' 
                              }}
                            />
                          </span>
                        </span>
                      </SimpleTooltip>
                    ) : (
                      <span 
                        className="w-3 h-3 rounded-full block hover:opacity-70"
                        style={{ backgroundColor: getFrameColor(frameColor) }}
                      />
                    )
                  ) : (
                    <span 
                      className="w-3 h-3 rounded-full border block transition-colors duration-200"
                      style={{ 
                        borderColor: getFrameColor(frameColor),
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${getFrameColor(frameColor)}30`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    ></span>
                  )}
                </button>
              ) : (
                <div className="w-4 h-4 rounded-full flex items-center justify-center">
                  {hasProf || hasExpertise ? (
                    hasExpertise ? (
                      <SimpleTooltip content="Экспертность">
                        <span 
                          className="w-3 h-3 rounded-full block relative"
                          style={{ backgroundColor: getFrameColor(frameColor) }}
                        >
                          <span 
                            className="absolute -inset-1 rounded-full border-2 border-transparent"
                            style={{ 
                              borderColor: `${getFrameColor(frameColor)}40`,
                              backgroundColor: 'transparent'
                            }}
                          >
                            <span 
                              className="absolute -inset-0.5 rounded-full border"
                              style={{ 
                                borderColor: getFrameColor(frameColor),
                                backgroundColor: 'transparent' 
                              }}
                            />
                          </span>
                        </span>
                      </SimpleTooltip>
                    ) : (
                      <span 
                        className="w-3 h-3 rounded-full block"
                        style={{ backgroundColor: getFrameColor(frameColor) }}
                      />
                    )
                  ) : (
                    <span 
                      className="w-3 h-3 rounded-full border block transition-colors duration-200"
                      style={{ 
                        borderColor: getFrameColor(frameColor),
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${getFrameColor(frameColor)}30`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    ></span>
                  )}
                </div>
              )}

              {/* Модификатор */}
              <div className="text-xs text-gray-400">{ABILITIES[ability]}</div>

              {/* Название */}
              <div
                className="text-white whitespace-nowrap overflow-hidden text-ellipsis pr-4"
                title={ru}
              >
                {ru}
              </div>

              {/* Бонус */}
              <div
                className="flex justify-center"
                onClick={() => onRoll(ru, ability, bonus)}
              >
                <span 
                  className="flex items-center justify-center w-10 h-8 border-2 rounded-md font-bold text-sm cursor-pointer transition-colors min-w-10 min-h-8 ml-2"
                  style={{
                    borderColor: `${getFrameColor(frameColor)}40`,
                    backgroundColor: 'transparent',
                    width: '40px',
                    height: '32px'
                  }}
                  onMouseEnter={(e) => {
                    const lightColor = frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54';
                    e.currentTarget.style.backgroundColor = `${lightColor}20`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {bonus > 0 ? `+${bonus}` : bonus}
                </span>
              </div>
            </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Заголовок снизу - внутри рамки, но с абсолютным позиционированием */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-gray-400 uppercase text-sm font-semibold z-10">
        НАВЫКИ
      </div>
    </DynamicFrame>
  );
}
