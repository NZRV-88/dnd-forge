import React from "react";
import DynamicFrame from "@/components/ui/DynamicFrame";
import { useFrameColor } from "@/contexts/FrameColorContext";

type Props = {
  stats: Record<string, number>;
  onRoll: (label: string, key: string, value: number) => void;
  profs: string[];
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
  proficiencyBonus,
  onToggleProf,
  isActive = true,
}: Props) {
  const profSet = new Set(profs);

  const sortedSkills = Object.entries(SKILLS).sort(([, a], [, b]) =>
    a.ru.localeCompare(b.ru, "ru")
  );

  const { frameColor } = useFrameColor();

  return (
    <DynamicFrame
      frameType="skills"
      size="custom"
      className="relative w-[310px] min-h-[600px]"
    >
      {/* Контент */}
      <div 
        className="flex flex-col px-12 pt-3 pb-8"
        style={{
          borderTop: `1px solid ${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}40`
        }}
      >
        {sortedSkills.map(([key, { ability, ru }], index) => {
          const value = stats[ability] || 0;
          const bonus = mod(value) + (profSet.has(key) ? proficiencyBonus : 0);

          return (
            <React.Fragment key={key}>
              {index > 0 && (
                <div 
                  className="h-px my-1"
                  style={{
                    backgroundColor: `${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}40`
                  }}
                />
              )}
              <div
                className="grid grid-cols-[0px_35px_minmax(0,1fr)_10px] items-center py-[3px] text-sm"
              >
              {/* Владение */}
              {onToggleProf ? (
                <button
                  onClick={() => onToggleProf(key)}
                  className="w-4 h-4 rounded-full flex items-center justify-center focus:outline-none -ml-6"
                >
                  {profSet.has(key) ? (
                    <span className="w-3 h-3 rounded-full bg-[#B59E54] block hover:bg-yellow-400/70"></span>
                  ) : (
                    <span className="w-3 h-3 rounded-full border border-neutral-500 block hover:bg-yellow-400/30"></span>
                  )}
                </button>
              ) : (
                <div className="w-4 h-4 rounded-full flex items-center justify-center">
                  {profSet.has(key) ? (
                    <span className="w-3 h-3 rounded-full bg-[#B59E54] block"></span>
                  ) : (
                    <span className="w-3 h-3 rounded-full border border-neutral-500 block"></span>
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
                onClick={() => onRoll(`Проверка: ${ru}`, ability, bonus)}
              >
                <span 
                  className="flex items-center justify-center w-10 h-8 border-2 rounded-md font-bold text-sm cursor-pointer transition-colors min-w-10 min-h-8 ml-2"
                  style={{
                    borderColor: `${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}40`,
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
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-center text-gray-400 text-xs font-bold uppercase">
        НАВЫКИ
      </div>
    </DynamicFrame>
  );
}
