import React from "react";
import DynamicFrame from "@/components/ui/DynamicFrame";
import { useFrameColor } from "@/contexts/FrameColorContext";

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
  const { frameColor } = useFrameColor();
  
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
              {/* Фон под рамкой */}
              <div 
                className="absolute -top-[2px] left-1 right-1 bottom-0 -z-50 opacity-50"
                style={{
                  backgroundImage: `url('/frames/abilityFrameBg.svg')`,
                  backgroundSize: '100% 100%',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              />
              
              {/* Название характеристики над внутренней рамкой */}
              <div
                className="absolute top-[16%] left-1/2 -translate-x-1/2 text-center font-bold text-gray-300 leading-tight px-1 z-10"
                style={{
                  width: "90%",
                  fontSize: "9px",
                  lineHeight: "1.1rem",
                  wordBreak: "break-word"
                }}
              >
                {short}
              </div>

              {/* Модификатор в центре с рамкой */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center border-2 rounded-md w-[70px] h-[35px] -mt-[3px] flex items-center justify-center z-10 cursor-pointer"
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#F5F5F5",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                  borderColor: `${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}40`,
                  backgroundColor: 'transparent'
                }}
                onClick={() => onRoll(ru, key, Math.floor((value - 10) / 2))}
                onMouseEnter={(e) => {
                  const lightColor = frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54';
                  e.currentTarget.style.backgroundColor = `${lightColor}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title={`Бросок ${ru}`}
              >
                {mod}
              </div>

              {/* Значение характеристики внизу */}
              <div
                className="absolute bottom-[17%] left-1/2 -translate-x-1/2 text-center font-bold text-gray-400 z-10"
                style={{
                  fontSize: "14px",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.8)"
                }}
              >
                {value}
              </div>

            </DynamicFrame>
          );
        })}
    </div>
  );
}
