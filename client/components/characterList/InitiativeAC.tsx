import React, { useState } from "react";
import DynamicFrame from "@/components/ui/DynamicFrame";
import { useFrameColor } from "@/contexts/FrameColorContext";
import ConditionBlock from "./ConditionBlock";
import { hasFightingStyle } from "@/utils/getAllCharacterData";
import { useCharacter } from "@/store/character";
import ACDetailsSidebar from "./ACDetailsSidebar.tsx";

type Props = {
  initiative: number;
  ac: number;
  dex: number;
  characterData: any;
  onRoll: (label: string, abilityKey: string, value: number) => void;
};

export default function InitiativeAC({ initiative, dex, ac, characterData, onRoll }: Props) {
  const { frameColor } = useFrameColor();
  const { draft } = useCharacter();
  const [showACDetails, setShowACDetails] = useState(false);
  
  // Проверяем, есть ли у персонажа боевой стиль "Оборона"
  const hasDefenseFightingStyle = draft ? hasFightingStyle(draft, 'defense') : false;
  
  // Проверяем, надет ли доспех (любой доспех, кроме "без доспеха")
  const isWearingArmor = draft?.equipped?.armor && draft.equipped.armor.name !== 'no-armor';
  
  // Рассчитываем итоговый КД с учетом боевого стиля "Оборона" и бонусов
  const acBonuses = draft?.acBonuses || [];
  const totalACBonus = acBonuses.reduce((sum, bonus) => sum + bonus.bonus, 0);
  const finalAC = ac + (hasDefenseFightingStyle && isWearingArmor ? 1 : 0) + totalACBonus;
  
  // Определяем источник базового КБ
  const getACSource = () => {
    if (!draft?.equipped || !characterData?.equipment) return null;
    
    const { armor } = draft.equipped;
    let maxAC = 10; // Базовый КБ
    let source = null;
    
    // Проверяем доспех
    if (armor && armor.name !== 'no-armor') {
      // Сначала проверяем магические доспехи
      const magicArmor = characterData.equipment.find((item: any) => 
        typeof item === 'object' && 
        item.type === 'magic_item' && 
        item.itemType === 'armor' && 
        item.name === armor.name
      );
      
      if (magicArmor && typeof magicArmor === 'object' && magicArmor.armor) {
        const armorAC = parseInt(magicArmor.armor.armorClass) || 10;
        if (armorAC > maxAC) {
          maxAC = armorAC;
          source = armor.name;
        }
      } else {
        // Ищем в обычных доспехах (упрощенно)
        source = armor.name;
      }
    }
    
    // Проверяем магические предметы типа "item" (кольца, головные уборы, обувь, перчатки)
    // Пока что упрощенно - проверяем все магические предметы типа "item"
    const magicItems = characterData.equipment.filter((item: any) => 
      typeof item === 'object' && 
      item.type === 'magic_item' && 
      item.itemType === 'item'
    );
    
    // Ищем предметы с бонусом к классу брони
    const acBonusItems = magicItems.filter((item: any) => 
      item.item?.itemBonus === 'ac' && 
      item.item?.itemBonusValue
    );
    
    if (acBonusItems.length > 0) {
      // Берем максимальное фиксированное значение КБ от предметов
      const maxACValue = Math.max(...acBonusItems.map((item: any) => 
        parseInt(item.item.itemBonusValue) || 0
      ));
      
      // Если фиксированное значение КБ больше текущего, используем его
      if (maxACValue > maxAC) {
        const bestItem = acBonusItems.find((item: any) => 
          parseInt(item.item.itemBonusValue) === maxACValue
        );
        source = bestItem?.name || 'Магический предмет';
      }
    }
    
    return source;
  };
  
  const acSource = getACSource();
  
  const handleACClick = () => {
    setShowACDetails(!showACDetails);
  };

  return (
	<div className="relative text-gray-300 w-[562px] flex-shrink-0">
	  <div className="flex flex-row items-center space-x-4">
		{/* Инициатива */}
		<DynamicFrame
		  frameType="initiative"
		  size="custom"
		  className="relative flex flex-col items-center justify-center text-center flex-shrink-0"
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
		  className="relative flex flex-col items-center justify-center text-center flex-shrink-0"
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
		  <div 
			className="absolute inset-0 flex items-center justify-center text-3xl font-bold z-10 cursor-pointer"
			onClick={handleACClick}
		  >
			{finalAC ?? "--"}
		  </div>
		  <div className="absolute bottom-9 text-[10px] font-bold text-gray-400 z-10">
			БРОНИ
		  </div>
		</DynamicFrame>

		{/* Блок состояния */}
		<ConditionBlock />
	  </div>
	  
	  {/* Сайдбар с деталями КД */}
	  {showACDetails && (
		<div
		  className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end"
		  onClick={() => setShowACDetails(false)}
		>
		  <div 
			className="w-full max-w-md bg-neutral-900 h-full overflow-y-auto p-6 pt-20"
			onClick={(e) => e.stopPropagation()}
		  >
			<div className="flex justify-between items-center mb-4">
			  <h2 className="text-2xl font-bold text-gray-100">
				Класс брони
			  </h2>
			  <button
				onClick={() => setShowACDetails(false)}
				className="text-gray-400 hover:text-gray-200 text-2xl"
			  >
				×
			  </button>
			</div>

			<div className="space-y-3 text-xs">
			  <ACDetailsSidebar
				baseAC={ac}
				finalAC={finalAC}
				hasDefenseFightingStyle={hasDefenseFightingStyle}
				isWearingArmor={isWearingArmor}
				equippedArmor={draft?.equipped?.armor}
				acSource={acSource}
				frameColor={frameColor}
				onClose={() => setShowACDetails(false)}
			  />
			</div>
		  </div>
		</div>
	  )}
	</div>
  );
}
