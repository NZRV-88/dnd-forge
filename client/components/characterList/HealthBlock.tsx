import React, { useState } from "react";
import DynamicFrame from "@/components/ui/DynamicFrame";

interface HealthBlockProps {
  curHp: number;
  setCurHp: (v: number) => void;
  tempHp: number;
  setTempHp: (v: number) => void;
  hpMax: number;
}

export default function HealthBlock({
  curHp,
  setCurHp,
  tempHp,
  setTempHp,
  hpMax,
}: HealthBlockProps) {
  const [hpChange, setHpChange] = useState<number>(1);

  const ROW_PX = 32;
  const LEFT_W = 80;
  const SLASH_W = 24;
  const TEMP_W = 80;

  const clampTemp = (v: number) => Math.max(0, Math.min(999, Math.floor(v)));

  const heal = () => {
    let newHp = curHp + hpChange;
    if (newHp > hpMax) {
      const overheal = newHp - hpMax;
      newHp = hpMax;
    }
    setCurHp(Math.max(0, newHp));
  };

  const damage = () => {
    let dmg = Math.max(0, Math.floor(hpChange));
    let newTemp = tempHp;
    if (newTemp > 0) {
      const absorbed = Math.min(newTemp, dmg);
      dmg -= absorbed;
      newTemp -= absorbed;
    }
    setTempHp(clampTemp(newTemp));
    setCurHp(Math.max(0, curHp - dmg));
  };

  return (
    <DynamicFrame
      frameType="health"
      size="custom"
      className="relative p-3 text-gray-300"
      style={{
        width: "94%",    // можно поставить фикс, напр. 360px
        height: "139px",  // подогнать под viewBox healthFrame.svg
        display: "grid",
        gridTemplateColumns: `${LEFT_W}px 1fr`,
        gridTemplateRows: `${ROW_PX}px ${ROW_PX}px ${ROW_PX}px`,
        columnGap: 12,
        alignItems: "center",
      }}
    >
      {/* Левая колонка */}
<div className="flex flex-col items-center justify-center space-y-2 mt-20 ml-3 relative z-10">
  <button
    onClick={heal}
    className="w-20 h-6 text-green-500 hover:text-green-400 hover:border-green-400 hover:bg-green-800/95 border border-green-500 text-xs font-bold uppercase rounded flex items-center justify-center bg-transparent"
  >
    ЛЕЧЕНИЕ
  </button>

      <input
        style={{ gridColumn: 1, 
                 gridRow: 2
              }}
        className="w-20 h-6 h-full text-center rounded bg-neutral-900 border border-neutral-600 text-sm text-white"
        type="number"
        value={hpChange}
        onChange={(e) => setHpChange(Number(e.target.value))}
      />

 <button
    onClick={damage}
    className="w-20 h-6 text-red-500 hover:text-red-400 hover:text-red-400 hover:red-green-400 hover:bg-red-800/95 border border-red-500 text-xs font-bold uppercase rounded flex items-center justify-center bg-transparent"
  >
    УРОН
  </button>
</div>

      {/* Правая колонка */}
      <div
        className="relative z-10"
        style={{
          gridColumn: 2,
          gridRow: 1,
          display: "grid",
          gridTemplateColumns: `1fr ${SLASH_W}px 1fr ${TEMP_W}px`,
          alignItems: "center",
          justifyItems: "center",
          height: ROW_PX,
        }}
        className="text-[11px] font-bold uppercase text-gray-400 mt-5 ml-3"
      >
        <div>ТЕКУЩЕЕ</div>
        <div/>
       
        <div>МАКС</div>
        <div>ВРМ</div>
      </div>

      <div
        style={{
          gridColumn: 2,
          gridRow: 2,
          display: "grid",
          gridTemplateColumns: `1fr ${SLASH_W}px 1fr ${TEMP_W}px`,
          alignItems: "center",
          justifyItems: "center",
          height: ROW_PX,
        }}
        className="text-2xl font-bold text-white-400 mt-3 ml-4"
      >
        {/* Текущее HP */}
        <div
          className={
            curHp / hpMax <= 0.3
              ? "text-red-500"
              : "text-white"
          }
        >
            {curHp}
        </div>
        {/* Слэш */}
        <div className="text-gray-400 text-xl">/</div>
        {/* Максимальное HP */}
        <div>{hpMax}</div>
        {/* Временное HP */}
      
 <div className="relative group flex items-center">
  <input
    type="number"
    value={tempHp === 0 ? "" : tempHp}
    placeholder="--"
    onChange={(e) => setTempHp(clampTemp(Number(e.target.value)))}
    className="w-14 text-center bg-transparent text-yellow-400 font-bold focus:outline-none placeholder-gray-500 
               [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
  />

  {/* Блок кнопок управления */}
  <div className="absolute -right-12 flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-200">
    <div className="flex flex-col border-2 border-[#B59E54] divide-y-0 divide-[#B59E54]">
      <button
        onClick={() => setTempHp(clampTemp(tempHp + 1))}
        className="w-8 h-6 flex items-center justify-center text-[#B59E54] font-bold hover:bg-[#B59E54]/20"
      >
        +
      </button>
      <button
        onClick={() => setTempHp(clampTemp(tempHp - 1))}
        className="w-8 h-6 flex items-center justify-center text-[#B59E54] font-bold hover:bg-[#B59E54]/20"
      >
        −
      </button>
    </div>
  </div>
</div>
       
         
      </div>

      <div
        style={{
          gridColumn: 2,
          gridRow: 3,
          display: "grid",
          gridTemplateColumns: `1fr ${SLASH_W}px 1fr ${TEMP_W}px`,
          alignItems: "center",
          justifyItems: "center",
          height: ROW_PX,
        }}
      >

        <div />
        <div className="text-xs font-bold uppercase text-gray-400 mt-3 ml-3">
          ЗДОРОВЬЕ
        </div>
        <div />
        <div />
      </div>
    </DynamicFrame>
  );
}
