import React from 'react';
import { Weapons } from "@/data/items/weapons";
import { getWeaponMasteryByKey } from "@/data/items/weapon-mastery";
import { translateDamageType } from "@/utils/translationUtils";
import { getItemDetails, hasMagicWeaponMastery } from "@/utils/equipmentUtils";
import DynamicFrame from "@/components/ui/DynamicFrame";
import { Zap, Wand } from "lucide-react";

interface ActionsTabProps {
  characterData: any;
  equipped: any;
  stats: Record<string, number>;
  proficiencyBonus: number;
  classKey?: string;
  level?: number;
  onRoll?: (desc: string, ability: string, bonus: number, type: string, damageString?: string, attackRoll?: number) => void;
  onSwitchWeaponSlot?: (slot: number) => void;
  frameColor: string;
  getFrameColor: (color: string) => string;
}

export default function ActionsTab({
  characterData,
  equipped,
  stats,
  proficiencyBonus,
  classKey,
  level,
  onRoll,
  onSwitchWeaponSlot,
  frameColor,
  getFrameColor
}: ActionsTabProps) {
  
  // Получаем все оружие персонажа
  const getAllWeapons = () => {
    const weapons: any[] = [];
    
    // Добавляем обычное оружие из инвентаря
    if (characterData?.equipment) {
      characterData.equipment.forEach((item: any) => {
        const itemName = typeof item === 'string' ? item : (item.name || String(item));
        const itemType = typeof item === 'object' && item.type ? item.type : 'other';
        
        if (itemType === 'magic_item' && item.itemType === 'weapon') {
          // Магическое оружие
          const weaponObj = {
            name: item.name,
            key: item.name,
            type: item.weapon?.weaponType || 'melee',
            category: item.weapon?.weaponCategory || 'simple',
            range: item.weapon?.weaponRange || (item.weapon?.weaponType === 'melee' ? '5 фт' : '-'),
            damage: item.weapon?.damageSources?.map((source: any) => 
              `${source.diceCount}${source.diceType} ${translateDamageType(source.damageType)}`
            ).join(' + ') || '1d4',
            properties: item.weapon?.weaponProperties || [],
            mastery: item.weapon?.weaponMastery,
            weaponKind: item.weapon?.weaponKind,
            weaponCategory: item.weapon?.weaponCategory,
            attackBonus: item.weapon?.attackBonus,
            damageBonus: item.weapon?.damageBonus,
            damageSources: item.weapon?.damageSources,
            isMagic: true
          };
          weapons.push(weaponObj);
        } else {
          // Обычное оружие
          const weapon = Weapons.find(w => w.name === itemName);
          if (weapon) {
            weapons.push({
              ...weapon,
              key: weapon.key,
              isMagic: false
            });
          }
        }
      });
    }
    
    return weapons;
  };

  // Получаем бонус атаки для оружия
  const getAttackBonus = (weapon: any) => {
    if (weapon.isMagic) {
      const abilityModifier = weapon.type === 'ranged' ? 
        Math.floor((stats.dex - 10) / 2) : 
        Math.floor((stats.str - 10) / 2);
      
      const hasMastery = hasMagicWeaponMastery(weapon, characterData);
      const proficiencyBonusValue = hasMastery ? proficiencyBonus : 0;
      
      const attackBonus = parseInt(weapon.attackBonus || '0');
      const totalBonus = attackBonus + abilityModifier + proficiencyBonusValue;
      
      return totalBonus;
    } else {
      const abilityModifier = weapon.type === 'ranged' ? 
        Math.floor((stats.dex - 10) / 2) : 
        Math.floor((stats.str - 10) / 2);
      
      const hasMastery = characterData?.weapons?.includes(weapon.category) || 
                        characterData?.weapons?.includes(weapon.key);
      const proficiencyBonusValue = hasMastery ? proficiencyBonus : 0;
      
      return abilityModifier + proficiencyBonusValue;
    }
  };

  // Получаем урон для оружия
  const getDamage = (weapon: any) => {
    if (weapon.isMagic) {
      const abilityModifier = weapon.type === 'ranged' ? 
        Math.floor((stats.dex - 10) / 2) : 
        Math.floor((stats.str - 10) / 2);
      
      const magicDamageBonus = parseInt(weapon.damageBonus || '0');
      const totalModifier = abilityModifier + magicDamageBonus;
      
      if (weapon.damageSources && weapon.damageSources.length > 0) {
        const damageString = weapon.damageSources.map((source: any) => 
          `${source.diceCount || 1}${source.diceType}`
        ).join(' + ');
        
        const modifierStr = totalModifier >= 0 ? `+${totalModifier}` : `${totalModifier}`;
        return `${damageString} ${modifierStr}`;
      }
      
      return `1d4 ${totalModifier >= 0 ? '+' : ''}${totalModifier}`;
    } else {
      const abilityModifier = weapon.type === 'ranged' ? 
        Math.floor((stats.dex - 10) / 2) : 
        Math.floor((stats.str - 10) / 2);
      
      const modifierStr = abilityModifier >= 0 ? `+${abilityModifier}` : `${abilityModifier}`;
      return `${weapon.damage} ${modifierStr}`;
    }
  };

  // Обработка атаки
  const handleAttack = async (weapon: any, ability: string, bonus: number, isSpell: boolean = false) => {
    if (!onRoll) return;
    
    const abilityModifier = ability === 'str' ? 
      Math.floor((stats.str - 10) / 2) : 
      Math.floor((stats.dex - 10) / 2);
    
    const hasMastery = weapon.isMagic ? 
      hasMagicWeaponMastery(weapon, characterData) : 
      (characterData?.weapons?.includes(weapon.category) || characterData?.weapons?.includes(weapon.key));
    
    const proficiencyBonusValue = hasMastery ? proficiencyBonus : 0;
    const totalBonus = abilityModifier + proficiencyBonusValue + bonus;
    
    onRoll(
      `Атака ${weapon.name}`,
      ability,
      totalBonus,
      'attack'
    );
  };

  // Обработка урона
  const handleDamage = async (weapon: any, ability: string, modifier: number, damage: string, isSpell: boolean = false, isHealing: boolean = false) => {
    if (!onRoll) return;
    
    const abilityModifier = ability === 'str' ? 
      Math.floor((stats.str - 10) / 2) : 
      Math.floor((stats.dex - 10) / 2);
    
    const totalModifier = abilityModifier + modifier;
    const damageWithModifier = `${damage}${totalModifier >= 0 ? '+' : ''}${totalModifier}`;
    
    onRoll(
      `Урон ${weapon.name}`,
      ability,
      totalModifier,
      isHealing ? 'healing' : 'damage',
      damageWithModifier
    );
  };

  // Получаем количество атак за действие
  const getAttacksPerAction = () => {
    if (!classKey) return 1;
    
    // Для воина на 5+ уровне - дополнительная атака
    if (classKey === 'fighter' && level && level >= 5) {
      return 2;
    }
    
    return 1;
  };

  const weapons = getAllWeapons();
  const attacksPerAction = getAttacksPerAction();

  return (
    <div className="h-full flex flex-col">
      {/* Заголовок */}
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5" style={{ color: getFrameColor(frameColor) }} />
        <h2 className="text-xl font-bold text-gray-100">Действия</h2>
      </div>

      {/* Таблица атак */}
      <div className="flex-1 overflow-y-auto">
        <DynamicFrame frameType="actions" className="w-full">
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-2 text-gray-300">Название</th>
                    <th className="text-center py-2 text-gray-300">Бонус</th>
                    <th className="text-center py-2 text-gray-300">Урон</th>
                    <th className="text-center py-2 text-gray-300">Действие</th>
                  </tr>
                </thead>
                <tbody>
                  {weapons.map((weapon, index) => {
                    const attackBonus = getAttackBonus(weapon);
                    const damage = getDamage(weapon);
                    const ability = weapon.type === 'ranged' ? 'dex' : 'str';
                    
                    return (
                      <tr key={index} className="border-b border-gray-700">
                        <td className="py-2 text-gray-200">
                          <div className="flex flex-col">
                            <span className="font-medium">{weapon.name}</span>
                            {weapon.weaponKind && (
                              <span className="text-xs text-gray-400">{weapon.weaponKind}</span>
                            )}
                          </div>
                        </td>
                        <td className="text-center py-2 text-gray-200">
                          <button
                            onClick={() => handleAttack(weapon, ability, weapon.isMagic ? parseInt(weapon.attackBonus || '0') : 0)}
                            className="px-3 py-1 rounded transition-colors hover:bg-opacity-20"
                            style={{ 
                              backgroundColor: getFrameColor(frameColor) + '20',
                              color: getFrameColor(frameColor)
                            }}
                          >
                            {attackBonus >= 0 ? '+' : ''}{attackBonus}
                          </button>
                        </td>
                        <td className="text-center py-2 text-gray-200">
                          <button
                            onClick={() => handleDamage(weapon, ability, weapon.isMagic ? parseInt(weapon.damageBonus || '0') : 0, weapon.damage)}
                            className="px-3 py-1 rounded transition-colors hover:bg-opacity-20"
                            style={{ 
                              backgroundColor: getFrameColor(frameColor) + '20',
                              color: getFrameColor(frameColor)
                            }}
                          >
                            {damage}
                          </button>
                        </td>
                        <td className="text-center py-2 text-gray-400">
                          {weapon.type === 'ranged' ? 'Дальний бой' : 'Ближний бой'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </DynamicFrame>
      </div>
    </div>
  );
}
