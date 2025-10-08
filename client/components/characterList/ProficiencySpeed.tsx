import React from "react";
import DynamicFrame from "@/components/ui/DynamicFrame";

type Props = {
  proficiencyBonus: number;
  speed: number;
  initiative: number;
  ac: number;
};

export default function ProficiencySpeed({ proficiencyBonus, speed, initiative, ac }: Props) {
  return (
    <div className="flex items-start justify-center pt-3">
      {/* Верхний ряд */}
      <div className="flex gap-3 justify-center">
        {/* Бонус мастерства */}
        <DynamicFrame
          frameType="prof"
          size="custom"
          className="relative flex flex-col items-center justify-center text-center"
          style={{
            width: "120px",       // подгон под характеристики
            height: "139px",      // такая же высота, как у HealthBlock
          }}
        >
          {/* Фон под рамкой */}
          <div 
            className="absolute inset-2 -z-10 opacity-50"
            style={{
              backgroundImage: `url('/frames/profFrameBg.svg')`,
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
          <div className="absolute top-7 text-[10px] font-bold text-gray-400 z-10">
            БОНУС
          </div>
          <div className="absolute inset-0 flex text-[22px] items-center justify-center text-xl font-bold text-white-300 z-10">
            +{proficiencyBonus}
          </div>
          <div className="absolute bottom-7 text-[10px] font-bold text-gray-400 z-10">
            МАСТЕРСТВА
          </div>
        </DynamicFrame>

        {/* Скорость передвижения */}
        <DynamicFrame
          frameType="prof"
          size="custom"
          className="relative flex flex-col items-center justify-center text-center"
          style={{
            width: "120px",
            height: "139px",      // такая же высота, как у HealthBlock
          }}
        >
          {/* Фон под рамкой */}
          <div 
            className="absolute inset-2 -z-10 opacity-50"
            style={{
              backgroundImage: `url('/frames/profFrameBg.svg')`,
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
          <div className="absolute top-7 text-[10px] font-bold text-gray-400 z-10">
            СКОРОСТЬ
          </div>
          <div className="absolute inset-0 flex text-[22px] items-center justify-center text-base font-bold text-white-300 z-10">
            {speed} фт.
          </div>
          <div className="absolute bottom-7 text-[10px] font-bold text-gray-400 z-10">
            ПЕРЕДВИЖЕНИЯ
          </div>
        </DynamicFrame>
      </div>
    </div>
  );
}
