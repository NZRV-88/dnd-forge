import React from "react";
import { useFrameColor } from "@/contexts/FrameColorContext";

type Props = {
  attacks: { name: string; bonus: number; damage: string }[];
  equipped?: {
    weaponSlot1?: { name: string; type: string; slots: number; versatileMode?: boolean }[];
    weaponSlot2?: { name: string; type: string; slots: number; versatileMode?: boolean }[];
    activeWeaponSlot?: number;
    armor?: { name: string; type: string };
    shield1?: { name: string; type: string };
    shield2?: { name: string; type: string };
  };
  stats?: Record<string, number>;
  proficiencyBonus?: number;
};

export default function Attacks({ attacks, equipped, stats, proficiencyBonus }: Props) {
  const { frameColor } = useFrameColor();

  // Получаем активное оружие
  const getActiveWeapons = () => {
    if (!equipped) return [];
    
    const activeSlot = equipped.activeWeaponSlot || 1;
    const weapons = activeSlot === 1 ? equipped.weaponSlot1 : equipped.weaponSlot2;
    
    return weapons || [];
  };

  // Получаем бонус к атаке для оружия
  const getAttackBonus = (weapon: any) => {
    if (!stats || !proficiencyBonus) return 0;
    
    // Для оружия ближнего боя используем силу, для дальнего - ловкость
    const abilityModifier = weapon.type === 'ranged' ? 
      Math.floor((stats.dex - 10) / 2) : 
      Math.floor((stats.str - 10) / 2);
    
    return abilityModifier + proficiencyBonus;
  };

  // Получаем урон для оружия
  const getDamage = (weapon: any) => {
    if (!stats) return "1d4";
    
    const abilityModifier = weapon.type === 'ranged' ? 
      Math.floor((stats.dex - 10) / 2) : 
      Math.floor((stats.str - 10) / 2);
    
    const modifierStr = abilityModifier >= 0 ? `+${abilityModifier}` : abilityModifier.toString();
    return `1d4 ${modifierStr}`; // Упрощенная формула урона
  };

  const activeWeapons = getActiveWeapons();

  return (
    <div
      className="relative text-gray-300 w-full h-[669px]"
      style={{
        backgroundImage: "url('/frames/actionFrame.svg')",
        backgroundSize: "100% auto",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center top",
      }}
    >
      {/* Контент внутри рамки */}
      <div className="relative z-10 px-4 pt-6 pb-4">
        {/* Заголовок */}
        <div className="text-center mb-4">
          <h3 className="text-gray-400 font-semibold uppercase text-sm">ДЕЙСТВИЯ</h3>
        </div>
        
        {/* Список атак */}
        <div className="space-y-2 text-sm">
          {activeWeapons.length > 0 ? (
            activeWeapons.map((weapon, i) => {
              const attackBonus = getAttackBonus(weapon);
              const damage = getDamage(weapon);
              
              return (
                <div key={i} className="flex justify-between items-center py-1">
                  <span className="text-gray-200 truncate pr-2">{weapon.name}</span>
                  <div className="flex gap-2 text-xs">
                    <span className="text-yellow-400 font-semibold">
                      {attackBonus >= 0 ? `+${attackBonus}` : attackBonus}
                    </span>
                    <span className="text-gray-300">{damage}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-500 text-sm py-4">
              Нет надетого оружия
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
