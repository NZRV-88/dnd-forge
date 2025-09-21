import React from "react";

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

  return (
    <div className="frame-border relative w-[300px] min-h-[600px]">
      {/* Контент */}
      <div className="flex flex-col divide-y divide-neutral-700 -mt-1">
        {sortedSkills.map(([key, { ability, ru }]) => {
          const value = stats[ability] || 0;
          const bonus = mod(value) + (profSet.has(key) ? proficiencyBonus : 0);

          return (
            <div
              key={key}
              className="grid grid-cols-[30px_50px_minmax(0,1fr)_60px] items-center py-1 text-sm"
            >
              {/* Владение */}
              {onToggleProf ? (
                <button
                  onClick={() => onToggleProf(key)}
                  className="w-4 h-4 rounded-full flex items-center justify-center focus:outline-none"
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
                className="text-white whitespace-nowrap overflow-hidden text-ellipsis"
                title={ru}
              >
                {ru}
              </div>

              {/* Бонус */}
              <div
                className="flex justify-center"
                onClick={() => onRoll(`Проверка: ${ru}`, ability, bonus)}
              >
                <span className="px-2 py-0.5 w-10 border border-[#B59E54] rounded text-white-400 font-bold text-sm hover:bg-[#B59E54]/20 ml-3">
                  {bonus >= 0 ? `+${bonus}` : bonus}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Заголовок снизу */}
      <div className="text-center text-gray-400 text-xs font-bold uppercase mt-4">
        НАВЫКИ
      </div>
    </div>
  );
}
