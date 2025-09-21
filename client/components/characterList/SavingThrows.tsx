import React from "react";
import STFrame from "@src/assets/frames/STFrame.svg?react";
import STModeFrame from "@src/assets/frames/STModeFrame.svg?react";

type Props = {
  stats: Record<string, number>;
  onRoll: (label: string, key: string, value: number, type: string) => void;
};

const ABILITIES: Record<string, string> = {
  str: "СИЛ",
  dex: "ЛОВ",
  con: "ТЕЛ",
  int: "ИНТ",
  wis: "МУД",
  cha: "ХАР",
};

const mod = (v: number) => {
  const m = Math.floor((v - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
};

export default function SavingThrows({ stats, onRoll }: Props) {
  return (
    <div className="relative p-4 text-gray-300 w-[300px]">
      {/* Рамка всего блока */}
      <STFrame className="absolute inset-0 w-full h-full" />

      <div className="grid grid-cols-2 gap-2 mb-4 relative z-10">
        {Object.entries(ABILITIES).map(([key, label]) => {
          const value = stats[key] || 0;
          return (
            <div
              key={key}
              className="relative w-[140px] h-[50px] cursor-pointer"
              onClick={() =>
                onRoll(`Спасбросок ${label}`, key, value, "Спасбросок")
              }
            >
              <STModeFrame className="absolute inset-0 w-[93%] h-full"/>
              <div className="flex justify-between items-center px-[19px] text-sm mt-[11px] ml-[13px]">
                <span className="font-bold">{label}</span>
                <span className="flex items-center justify-center border-2 border-[#B59E54]/40 rounded-md w-7 h-7 bg-neutral-800 hover:bg-[#B59E54]/20">{mod(value)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center text-gray-300 uppercase text-sm font-semibold">
        СПАСБРОСКИ
      </div>
    </div>
  );
}
