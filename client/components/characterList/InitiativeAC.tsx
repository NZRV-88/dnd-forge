import React from "react";

type Props = {
  initiative: number;
  ac: number;
  dex: number;
  onRoll: (label: string, abilityKey: string, value: number) => void;
};

export default function InitiativeAC({ initiative, dex, ac, onRoll }: Props) {
  const initiativeFrameUrl = "/frames/initiativeFrame.svg";
  const acFrameUrl = "/frames/ACFrame.svg";

  return (
	<div className="flex flex-row items-start space-x-4">
	  {/* Инициатива */}
	  <div
		onClick={() => onRoll("Инициатива", "dex", initiative)} 
		className="relative flex flex-col items-center justify-center text-center"
		style={{
		  width: "120px",
		  height: "140px",
		  backgroundImage: `url('${initiativeFrameUrl}')`,
		  backgroundSize: "100% 100%",
		  backgroundRepeat: "no-repeat",
		}}
	  >
		<div className="absolute top-7 text-[10px] font-bold text-gray-400 -mt-3">
		  ИНИЦИАТИВА
		</div>
		<div 
			className="w-16 h-12 inset-0 flex items-center justify-center text-2xl font-bold border-2 border-[#B59E54] rounded-md bg-neutral-800 hover:bg-[#B59E54]/20">
		  {initiative >= 0 ? `+${initiative}` : initiative}
		</div>
	  </div>

	  {/* Класс брони */}
	  <div
		className="relative flex flex-col items-center justify-center text-center"
		style={{
		  width: "120px",
		  height: "140px",
		  backgroundImage: `url('${acFrameUrl}')`,
		  backgroundSize: "100% 100%",
		  backgroundRepeat: "no-repeat",
		}}
	  >
		<div className="absolute top-10 text-[10px] font-bold text-gray-400">
		  КЛАСС
		</div>
		<div className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
		  {ac ?? "--"}
		</div>
		<div className="absolute bottom-9 text-[10px] font-bold text-gray-400">
		  БРОНИ
		</div>
	  </div>
	</div>
  );
}
