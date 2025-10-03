import React from "react";
import DynamicFrame from "@/components/ui/DynamicFrame";

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
  return m >= 0 ? `+${m}` : `${m}`;
};

export default function AbilityScoresEditable({ stats, onRoll }: Props) {
  return (
    <div className="flex justify-between w-[620px] mx-auto">
        {Object.entries(ABILITIES).map(([key, { ru, short }]) => {
          const value = stats[key] || 0;
          const mod = formatMod(value);

          return (
            <DynamicFrame
              key={key}
              frameType="ability"
              size="medium"
              className="relative flex flex-col items-center text-center"
            >
              {/* Название характеристики над внутренней рамкой */}
              <div
                className="absolute top-[16%] left-1/2 -translate-x-1/2 text-center font-bold text-gray-300 leading-tight px-1"
                style={{
                  width: "90%",
                  fontSize: "9px",
                  lineHeight: "1.1rem",
                  wordBreak: "break-word"
                }}
              >
                {short}
              </div>

              {/* Значение характеристики в центре */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#F5F5F5",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.8)"
                }}
              >
                {value}
              </div>

              {/* Модификатор внизу */}
              <div
                className="absolute bottom-[20%] left-1/2 -translate-x-1/2 text-center font-bold"
                style={{
                  fontSize: "14px",
                  color: "#F5F5F5",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.8)"
                }}
              >
                {mod}
              </div>

              {/* Кнопка броска */}
              <button
                onClick={() => onRoll(`${ru} (${short})`, key, Math.floor((value - 10) / 2))}
                className="absolute inset-0 w-full h-full opacity-0 hover:opacity-20 transition-opacity bg-gray-200 rounded"
                title={`Бросок ${ru}`}
              />
            </DynamicFrame>
          );
        })}
    </div>
  );
}
