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
    <div className="space-y-3 -mt-[9px]">
      {/* Верхний ряд */}
      <div className="flex gap-3 justify-center">
        {/* Бонус мастерства */}
        <DynamicFrame
          frameType="prof"
          size="custom"
          className="relative flex flex-col items-center justify-center text-center"
          style={{
            width: "120px",       // подгон под характеристики
            height: "140px",      // та же высота, что у abilityFrame
          }}
        >
          <div className="absolute top-7 text-[10px] font-bold text-gray-400">
            БОНУС
          </div>
          <div className="absolute inset-0 flex text-[22px] items-center justify-center text-xl font-bold text-white-300">
            +{proficiencyBonus}
          </div>
          <div className="absolute bottom-7 text-[10px] font-bold text-gray-400">
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
            height: "140px",
          }}
        >
          <div className="absolute top-7 text-[10px] font-bold text-gray-400">
            СКОРОСТЬ
          </div>
          <div className="absolute inset-0 flex text-[22px] items-center justify-center text-base font-bold text-white-300">
            {speed} фт.
          </div>
          <div className="absolute bottom-7 text-[10px] font-bold text-gray-400">
            ПЕРЕДВИЖЕНИЯ
          </div>
        </DynamicFrame>
      </div>
    </div>
  );
}
