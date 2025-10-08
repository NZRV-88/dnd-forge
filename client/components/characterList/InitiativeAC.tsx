import React from "react";
import DynamicFrame from "@/components/ui/DynamicFrame";
import { useFrameColor } from "@/contexts/FrameColorContext";

type Props = {
  initiative: number;
  ac: number;
  dex: number;
  onRoll: (label: string, abilityKey: string, value: number) => void;
};

export default function InitiativeAC({ initiative, dex, ac, onRoll }: Props) {
  const { frameColor } = useFrameColor();

  return (
	<div className="flex flex-row items-start space-x-4">
	  {/* Инициатива */}
	  <DynamicFrame
		frameType="initiative"
		size="custom"
		className="relative flex flex-col items-center justify-center text-center"
		style={{
		  width: "120px",
		  height: "140px",
		}}
	  >
		{/* Фон под рамкой */}
		<div 
		  className="absolute inset-[3px] -z-50 opacity-50"
		  style={{
			backgroundImage: `url('/frames/initiativeFrameBg.svg')`,
			backgroundSize: '100% 100%',
			backgroundPosition: 'center',
			backgroundRepeat: 'no-repeat'
		  }}
		/>
		
		<div className="absolute top-7 text-[10px] font-bold text-gray-400 -mt-3 z-10">
		  ИНИЦИАТИВА
		</div>
		<div 
			className="w-16 h-12 inset-0 flex items-center justify-center text-2xl font-bold border-2 rounded-md transition-colors cursor-pointer z-10"
			style={{
				borderColor: `${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}40`,
				backgroundColor: 'transparent'
			}}
			onClick={() => onRoll("Инициатива", "dex", initiative)}
			onMouseEnter={(e) => {
				const lightColor = frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54';
				e.currentTarget.style.backgroundColor = `${lightColor}20`;
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.backgroundColor = 'transparent';
			}}
		>
		  {initiative >= 0 ? `+${initiative}` : initiative}
		</div>
	  </DynamicFrame>

	  {/* Класс брони */}
	  <DynamicFrame
		frameType="ac"
		size="custom"
		className="relative flex flex-col items-center justify-center text-center"
		style={{
		  width: "120px",
		  height: "140px",
		}}
	  >
		{/* Фон под рамкой */}
		<div 
		  className="absolute inset-[10px] -z-50 opacity-50"
		  style={{
			backgroundImage: `url('/frames/ACFrameBg.svg')`,
			backgroundSize: '100% 100%',
			backgroundPosition: 'center',
			backgroundRepeat: 'no-repeat'
		  }}
		/>
		
		<div className="absolute top-10 text-[10px] font-bold text-gray-400 z-10">
		  КЛАСС
		</div>
		<div className="absolute inset-0 flex items-center justify-center text-3xl font-bold z-10">
		  {ac ?? "--"}
		</div>
		<div className="absolute bottom-9 text-[10px] font-bold text-gray-400 z-10">
		  БРОНИ
		</div>
	  </DynamicFrame>
	</div>
  );
}
