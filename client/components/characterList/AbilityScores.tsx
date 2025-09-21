import React from "react";

type Props = {
  stats: Record<string, number>;
  onRoll: (label: string, abilityKey: string, value: number) => void;
};

const ABILITIES: Record<string, { ru: string; short: string }> = {
  str: { ru: "Сила", short: "СИЛА" },
  dex: { ru: "Ловкость", short: "ЛОВКОСТЬ" },
  con: { ru: "Телосложение", short: "ТЕЛОСЛОЖЕНИЕ" },
  int: { ru: "Интеллект", short: "ИНТЕЛЛЕКТ" },
  wis: { ru: "Мудрость", short: "МУДРОСТЬ" },
  cha: { ru: "Харизма", short: "ХАРИЗМА" },
};

const formatMod = (v: number) => {
  const m = Math.floor((v - 10) / 2);
  return m >= 0 ? m : m;
};

export default function AbilityScores({ stats, onRoll }: Props) {
  return (
    <div className="flex justify-between w-[620px] mx-auto">
      {Object.entries(ABILITIES).map(([key, { ru, short }]) => {
        const value = stats[key] || 0;
        const modValue = formatMod(value)
        const mod = `+${modValue}`;
        

        return (
          <div
            key={key}
            className="relative flex flex-col items-center text-center"
            style={{
              width: "103px",
              height: "148px",
              backgroundImage: "url('/frames/abilityFrame.svg')",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* Название характеристики над внутренней рамкой */}
            <div
              className="absolute top-[16%] left-1/2 -translate-x-1/2 text-center font-bold text-gray-300 leading-tight px-1"
              style={{
                width: "90%",          // ограничиваем ширину
                fontSize: "9px",      // уменьшаем базовый размер
                lineHeight: "1.1rem",  // компактный интерлиньяж
                wordBreak: "break-word" // разрешаем перенос слов
              }}
            >
              {short}
            </div>

            {/* Внутренняя рамка для модификатора */}
            <button
              onClick={() => onRoll(`Проверка: ${ru}`, key, modValue)}
              className="absolute top-[33%] left-1/2 -translate-x-1/2 w-16 h-9 flex items-center justify-center border-2 border-[#B59E54] rounded-md bg-neutral-800 text-lg font-bold text-gray-200 shadow-inner hover:bg-[#B59E54]/20"
              style={{ borderColor: "#B59E54" }} // золотая рамка
            >
              {mod}
            </button>

            {/* Число характеристики в центре овала */}
            <div className="absolute bottom-[23%] left-1/2 -translate-x-1/2 translate-y-1/2 text-base font-bold text-gray-200">
              {value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
