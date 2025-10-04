import React, { useState } from "react";
import { useFrameColor } from "@/contexts/FrameColorContext";
import { Weapons } from "@/data/items/weapons";
import { getClassByKey } from "@/data/classes";
import { Cantrips } from "@/data/spells/cantrips";

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
  classKey?: string;
  level?: number;
  onRoll?: (desc: string, ability: string, bonus: number, type: string, damageString?: string) => void;
  onSwitchWeaponSlot?: (slot: number) => void;
  characterData?: any;
};

type TabType = "actions" | "spells" | "inventory" | "features";
type ActionType = "attack" | "action" | "bonus" | "reaction";

export default function Attacks({ attacks, equipped, stats, proficiencyBonus, classKey, level, onRoll, onSwitchWeaponSlot, characterData }: Props) {
  const { frameColor } = useFrameColor();
  const [activeTab, setActiveTab] = useState<TabType>("actions");
  const [activeActionType, setActiveActionType] = useState<ActionType>("attack");

  // Получаем все оружие с информацией о слоте
  const getAllWeapons = () => {
    if (!equipped) return [];
    
    const activeSlot = equipped.activeWeaponSlot || 1;
    const allWeapons = [];
    
    // Добавляем оружие из первого слота
    if (equipped.weaponSlot1 && equipped.weaponSlot1.length > 0) {
      equipped.weaponSlot1.forEach(weapon => {
        allWeapons.push({ ...weapon, slot: 1, isActive: activeSlot === 1 });
      });
    }
    
    // Добавляем оружие из второго слота
    if (equipped.weaponSlot2 && equipped.weaponSlot2.length > 0) {
      equipped.weaponSlot2.forEach(weapon => {
        allWeapons.push({ ...weapon, slot: 2, isActive: activeSlot === 2 });
      });
    }
    
    return allWeapons;
  };

  // Получаем бонус к атаке для оружия
  const getAttackBonus = (weapon: any) => {
    if (!stats || !proficiencyBonus) return 0;
    
    // Находим данные об оружии по имени
    const weaponData = Weapons.find(w => w.name === weapon.name);
    const weaponType = weaponData?.type || 'melee';
    
    // Для оружия ближнего боя используем силу, для дальнего - ловкость
    const abilityModifier = weaponType === 'ranged' ? 
      Math.floor((stats.dex - 10) / 2) : 
      Math.floor((stats.str - 10) / 2);
    
    return abilityModifier + proficiencyBonus;
  };

  // Получаем урон для оружия
  const getDamage = (weapon: any) => {
    if (!stats) return "1d4";
    
    // Находим данные об оружии по имени
    const weaponData = Weapons.find(w => w.name === weapon.name);
    const baseDamage = weaponData?.damage || "1d4";
    const weaponType = weaponData?.type || 'melee';
    
    const abilityModifier = weaponType === 'ranged' ? 
      Math.floor((stats.dex - 10) / 2) : 
      Math.floor((stats.str - 10) / 2);
    
    const modifierStr = abilityModifier >= 0 ? `+${abilityModifier}` : abilityModifier.toString();
    return `${baseDamage} ${modifierStr}`;
  };

  const allWeapons = getAllWeapons();

  // Функция для получения русского названия заклинания
  const getSpellName = (spellKey: string) => {
    const spell = Cantrips.find(s => s.key === spellKey);
    return spell?.name || spellKey;
  };

  // Функция для получения данных заклинания
  const getSpellData = (spellKey: string) => {
    return Cantrips.find(s => s.key === spellKey);
  };

  // Получаем количество атак за действие (зависит от уровня и класса)
  const getAttacksPerAction = () => {
    // Базовая атака: 1
    let attacks = 1;
    
    // Добавляем дополнительные атаки из особенностей класса
    if (classKey && level) {
      const classInfo = getClassByKey(classKey);
      if (classInfo?.features) {
        // Проходим по всем уровням от 1 до текущего уровня
        for (let lvl = 1; lvl <= level; lvl++) {
          const features = classInfo.features[lvl];
          if (features) {
            features.forEach(feature => {
              if (feature.extraAttack) {
                attacks += feature.extraAttack;
              }
            });
          }
        }
      }
    }
    
    return attacks;
  };

  const tabs = [
    { key: "actions" as TabType, label: "ДЕЙСТВИЯ" },
    { key: "spells" as TabType, label: "ЗАКЛИНАНИЯ" },
    { key: "inventory" as TabType, label: "ИНВЕНТАРЬ" },
    { key: "features" as TabType, label: "ОСОБЕННОСТИ" }
  ];

  const actionTypes = [
    { key: "attack" as ActionType, label: "АТАКА" },
    { key: "action" as ActionType, label: "ДЕЙСТВИЕ" },
    { key: "bonus" as ActionType, label: "БОНУСНОЕ ДЕЙСТВИЕ" },
    { key: "reaction" as ActionType, label: "РЕАКЦИЯ" }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "actions":
        return (
          <div>
            {/* Подменю типов действий */}
            <div 
              className="flex gap-1 mb-2"
              style={{
                borderBottom: `1px solid ${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}20`
              }}
            >
              {actionTypes.map((actionType) => {
                const isActive = activeActionType === actionType.key;
                const frameColorHex = frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54';
                
                return (
                  <button
                    key={actionType.key}
                    onClick={() => setActiveActionType(actionType.key)}
                    className="px-2 py-1 text-xs font-semibold uppercase transition-all duration-200 relative rounded"
                    style={{
                      color: isActive ? '#FFFFFF' : '#6B7280',
                      backgroundColor: isActive ? frameColorHex : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = `${frameColorHex}20`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {actionType.label}
                  </button>
                );
              })}
            </div>
            
            {/* Заголовок с информацией о количестве атак */}
            {activeActionType === "attack" && (
              <div className="mt-5">
                <div 
                  className="text-xs font-semibold uppercase mb-2 flex items-center justify-between"
                  style={{
                    borderBottom: `1px solid ${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}20`
                  }}
                >
                  <div className="flex items-center">
                    <span style={{ color: frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54' }}>
                      ДЕЙСТВИЯ
                    </span>
                    <span className="text-gray-400 ml-2">• Атак за действие: {getAttacksPerAction()}</span>
                    <span className="text-gray-400 ml-2">• АКТИВНЫЙ НАБОР:</span>
                    
                    {/* Кнопки переключения слотов */}
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => onSwitchWeaponSlot?.(1)}
                        className={`px-3 py-1 text-xs font-semibold rounded transition-all duration-200 w-8 flex items-center justify-center ${
                          (equipped?.activeWeaponSlot || 1) === 1 
                            ? 'text-white' 
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                        style={{
                          backgroundColor: (equipped?.activeWeaponSlot || 1) === 1 
                            ? (frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54')
                            : 'transparent',
                          border: `1px solid ${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}40`
                        }}
                      >
                        I
                      </button>
                      <button
                        onClick={() => onSwitchWeaponSlot?.(2)}
                        className={`px-3 py-1 text-xs font-semibold rounded transition-all duration-200 w-8 flex items-center justify-center ${
                          (equipped?.activeWeaponSlot || 1) === 2 
                            ? 'text-white' 
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                        style={{
                          backgroundColor: (equipped?.activeWeaponSlot || 1) === 2 
                            ? (frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54')
                            : 'transparent',
                          border: `1px solid ${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}40`
                        }}
                      >
                        II
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Контент в зависимости от выбранного типа действия */}
            <div className="space-y-2 text-sm">
              {activeActionType === "attack" && (
                <div>
                  {/* Заголовки таблицы */}
                  <div className="grid gap-2 text-xs font-semibold uppercase text-gray-400 mb-2 pb-1 items-center" 
                       style={{ 
                         gridTemplateColumns: '2fr 1fr 1fr 1fr',
                         borderBottom: `1px solid ${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}20` 
                       }}>
                    <div className="flex items-center justify-start">АТАКА</div>
                    <div className="flex items-center justify-center">ДАЛЬНОСТЬ</div>
                    <div className="flex items-center justify-center">ПОПАДАНИЕ</div>
                    <div className="flex items-center justify-center">УРОН</div>
                  </div>
                  
                  {/* Строки с оружием и заклинаниями */}
                  {(() => {
                    const allActions = [];
                    
                    // Добавляем оружие
                    allWeapons.forEach((weapon, i) => {
                      allActions.push({ type: 'weapon', data: weapon, index: i });
                    });
                    
                    // Добавляем заклинания
                    if (characterData?.spells?.length > 0) {
                      characterData.spells.forEach((spell: string, i: number) => {
                        allActions.push({ type: 'spell', data: spell, index: i });
                      });
                    }
                    
                    if (allActions.length === 0) {
                      return (
                        <div className="text-center text-gray-500 text-sm py-4">
                          Нет доступных действий
                        </div>
                      );
                    }
                    
                    return allActions.map((action, i) => {
                      if (action.type === 'weapon') {
                        const weapon = action.data;
                        const attackBonus = getAttackBonus(weapon);
                        const damage = getDamage(weapon);
                        const weaponData = Weapons.find(w => w.name === weapon.name);
                        const range = weaponData?.range || (weaponData?.type === 'melee' ? '5 фт.' : '-');
                        
                        return (
                          <div key={`weapon-${action.index}`}>
                            <div className={`grid gap-2 text-xs py-1 items-center ${!weapon.isActive ? 'opacity-60' : ''}`}
                                 style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
                              <div className="text-gray-200 truncate flex items-center justify-start">
                                <span className="text-xs text-gray-500 mr-1 w-3 inline-block text-center">{weapon.slot === 1 ? 'I' : 'II'}</span>
                                {weapon.name}
                              </div>
                              <div className="text-gray-300 flex items-center justify-center">{range}</div>
                              <div 
                                className="text-gray-300 font-semibold border-2 w-[70px] rounded-md px-2 py-1 cursor-pointer transition-all duration-200 flex items-center justify-center mx-auto"
                                style={{
                                  borderColor: `${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}40`,
                                  backgroundColor: 'transparent'
                                }}
                                onClick={() => onRoll?.(weapon.name, weaponData?.type === 'ranged' ? 'dex' : 'str', attackBonus, "Атака")}
                                onMouseEnter={(e) => {
                                  const lightColor = frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54';
                                  e.currentTarget.style.backgroundColor = `${lightColor}20`;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                              >
                                {attackBonus > 0 ? `+${attackBonus}` : attackBonus === 0 ? '0' : attackBonus}
                              </div>
                              <div 
                                className="text-gray-300 border-2 w-[70px] rounded-md px-2 py-1 cursor-pointer transition-all duration-200 flex items-center justify-center mx-auto"
                                style={{
                                  borderColor: `${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}40`,
                                  backgroundColor: 'transparent'
                                }}
                                onClick={() => {
                                  const weaponData = Weapons.find(w => w.name === weapon.name);
                                  const weaponType = weaponData?.type || 'melee';
                                  const abilityModifier = weaponType === 'ranged' ? 
                                    Math.floor(((stats?.dex || 10) - 10) / 2) : 
                                    Math.floor(((stats?.str || 10) - 10) / 2);
                                  onRoll?.(weapon.name, weaponType === 'ranged' ? 'dex' : 'str', abilityModifier, "Урон", damage);
                                }}
                                onMouseEnter={(e) => {
                                  const lightColor = frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54';
                                  e.currentTarget.style.backgroundColor = `${lightColor}20`;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                              >
                                {damage}
                              </div>
                            </div>
                            
                            {/* Пунктирная линия между строками (кроме последней) */}
                            {i < allActions.length - 1 && (
                              <div 
                                className="my-1 h-px"
                                style={{
                                  borderTop: `1px dotted ${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}40`
                                }}
                              />
                            )}
                          </div>
                        );
                      } else if (action.type === 'spell') {
                        const spellKey = action.data;
                        const spellName = getSpellName(spellKey);
                        const spellData = getSpellData(spellKey);
                        // Для заклинаний используем харизму (паладин)
                        const spellAbility = 'cha';
                        const spellModifier = Math.floor(((stats?.[spellAbility] || 10) - 10) / 2);
                        const spellAttackBonus = spellModifier + (proficiencyBonus || 0);
                        
                        // Получаем дальность из данных заклинания
                        let spellRange = spellData?.range || "60 фт.";
                        
                        // Преобразуем в строку, если это число
                        if (typeof spellRange === 'number') {
                          spellRange = spellRange.toString();
                        }
                        
                        // Если дальность не содержит единицы измерения, добавляем "фт."
                        if (spellRange && typeof spellRange === 'string' && !spellRange.includes('фт') && !spellRange.includes('м') && !spellRange.includes('км') && !spellRange.includes('на себя') && !spellRange.toLowerCase().includes('касание')) {
                          spellRange = `${spellRange} фт.`;
                        }
                        
                        // Получаем урон из данных заклинания (без модификатора характеристики)
                        const spellDamage = spellData?.damage?.dice || "1d10";
                        
                        return (
                          <div key={`spell-${action.index}`}>
                            <div className="grid gap-2 text-xs py-1 items-center"
                                 style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
                              <div className="text-gray-200 truncate flex items-center justify-start">
                                <span className="text-xs text-gray-500 mr-1 w-3 inline-block text-center">★</span>
                                {spellName}
                              </div>
                              <div className="text-gray-300 flex items-center justify-center">{spellRange}</div>
                              <div 
                                className="text-gray-300 font-semibold border-2 w-[70px] rounded-md px-2 py-1 cursor-pointer transition-all duration-200 flex items-center justify-center mx-auto"
                                style={{
                                  borderColor: `${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}40`,
                                  backgroundColor: 'transparent'
                                }}
                                onClick={() => onRoll?.(spellName, spellAbility, spellAttackBonus, "Атака")}
                                onMouseEnter={(e) => {
                                  const lightColor = frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54';
                                  e.currentTarget.style.backgroundColor = `${lightColor}20`;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                              >
                                {spellAttackBonus > 0 ? `+${spellAttackBonus}` : spellAttackBonus === 0 ? '0' : spellAttackBonus}
                              </div>
                              <div 
                                className="text-gray-300 border-2 w-[70px] rounded-md px-2 py-1 cursor-pointer transition-all duration-200 flex items-center justify-center mx-auto"
                                style={{
                                  borderColor: `${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}40`,
                                  backgroundColor: 'transparent'
                                }}
                                onClick={() => onRoll?.(spellName, spellAbility, 0, "Урон", spellDamage)}
                                onMouseEnter={(e) => {
                                  const lightColor = frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54';
                                  e.currentTarget.style.backgroundColor = `${lightColor}20`;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                              >
                                {spellDamage}
                              </div>
                            </div>
                            
                            {/* Пунктирная линия между строками (кроме последней) */}
                            {i < allActions.length - 1 && (
                              <div 
                                className="my-1 h-px"
                                style={{
                                  borderTop: `1px dotted ${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}40`
                                }}
                              />
                            )}
                          </div>
                        );
                      }
                      return null;
                    });
                  })()}
                </div>
              )}
                
                {/* Таблица бонусных действий */}
                <div className="mt-6">
                  {/* Заголовок для бонусных действий */}
                  <div 
                    className="text-xs font-semibold uppercase mb-2 flex items-cente mt-6"
                    style={{
                      borderBottom: `1px solid ${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}20`
                    }}
                  >
                    <span style={{ color: frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54' }}>
                      БОНУСНЫЕ ДЕЙСТВИЯ
                    </span>
                  </div>
                  
                  {/* Заголовки таблицы */}
                  <div className="grid gap-2 text-xs font-semibold uppercase text-gray-400 mb-2 pb-1 items-center" 
                       style={{ 
                         gridTemplateColumns: '2fr 1fr 1fr 1fr',
                         borderBottom: `1px solid ${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}20` 
                       }}>
                    <div className="flex items-center justify-start">ДЕЙСТВИЕ</div>
                    <div className="flex items-center justify-center">ДАЛЬНОСТЬ</div>
                    <div className="flex items-center justify-center">ПОПАДАНИЕ</div>
                    <div className="flex items-center justify-center">УРОН</div>
                  </div>
                  
                  {/* Строки с бонусными действиями */}
                  {(() => {
                    const bonusActions = [];
                    
                    // Добавляем заклинания, которые являются бонусными действиями
                    if (characterData?.spells?.length > 0) {
                      characterData.spells.forEach((spell: string, i: number) => {
                        const spellData = getSpellData(spell);
                        // Проверяем, является ли заклинание бонусным действием
                        if (spellData?.castingTime === "бонусное действие" || 
                            spellData?.castingTime === "Бонусное действие" ||
                            spellData?.castingTime === "1 бонусное действие") {
                          bonusActions.push({ type: 'spell', data: spell, index: i });
                        }
                      });
                    }
                    
                    if (bonusActions.length === 0) {
                      return (
                        <div className="text-center text-gray-500 text-sm py-4">
                          Нет доступных бонусных действий
                        </div>
                      );
                    }
                    
                    return bonusActions.map((action, i) => {
                      if (action.type === 'spell') {
                        const spellKey = action.data;
                        const spellName = getSpellName(spellKey);
                        const spellData = getSpellData(spellKey);
                        const spellAbility = 'cha';
                        const spellModifier = Math.floor(((stats?.[spellAbility] || 10) - 10) / 2);
                        const spellAttackBonus = spellModifier + (proficiencyBonus || 0);
                        
                        // Получаем дальность из данных заклинания
                        let spellRange = spellData?.range || "60 фт.";
                        
                        // Преобразуем в строку, если это число
                        if (typeof spellRange === 'number') {
                          spellRange = spellRange.toString();
                        }
                        
                        // Если дальность не содержит единицы измерения, добавляем "фт."
                        if (spellRange && typeof spellRange === 'string' && !spellRange.includes('фт') && !spellRange.includes('м') && !spellRange.includes('км') && !spellRange.includes('на себя') && !spellRange.toLowerCase().includes('касание')) {
                          spellRange = `${spellRange} фт.`;
                        }
                        
                        // Получаем урон из данных заклинания (без модификатора характеристики)
                        const spellDamage = spellData?.damage?.dice || "1d10";
                        
                        return (
                          <div key={`bonus-spell-${action.index}`}>
                            <div className="grid gap-2 text-xs py-1 items-center"
                                 style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
                              <div className="text-gray-200 truncate flex items-center justify-start">
                                <span className="text-xs text-gray-500 mr-1 w-3 inline-block text-center">★</span>
                                {spellName}
                              </div>
                              <div className="text-gray-300 flex items-center justify-center">{spellRange}</div>
                              <div 
                                className="text-gray-300 font-semibold border-2 w-[70px] rounded-md px-2 py-1 cursor-pointer transition-all duration-200 flex items-center justify-center mx-auto"
                                style={{
                                  borderColor: `${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}40`,
                                  backgroundColor: 'transparent'
                                }}
                                onClick={() => onRoll?.(spellName, spellAbility, spellAttackBonus, "Атака")}
                                onMouseEnter={(e) => {
                                  const lightColor = frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54';
                                  e.currentTarget.style.backgroundColor = `${lightColor}20`;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                              >
                                {spellAttackBonus > 0 ? `+${spellAttackBonus}` : spellAttackBonus === 0 ? '0' : spellAttackBonus}
                              </div>
                              <div 
                                className="text-gray-300 border-2 w-[70px] rounded-md px-2 py-1 cursor-pointer transition-all duration-200 flex items-center justify-center mx-auto"
                                style={{
                                  borderColor: `${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}40`,
                                  backgroundColor: 'transparent'
                                }}
                                onClick={() => onRoll?.(spellName, spellAbility, 0, "Урон", spellDamage)}
                                onMouseEnter={(e) => {
                                  const lightColor = frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54';
                                  e.currentTarget.style.backgroundColor = `${lightColor}20`;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                              >
                                {spellDamage}
                              </div>
                            </div>
                            
                            {/* Пунктирная линия между строками (кроме последней) */}
                            {i < bonusActions.length - 1 && (
                              <div 
                                className="my-1 h-px"
                                style={{
                                  borderTop: `1px dotted ${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}40`
                                }}
                              />
                            )}
                          </div>
                        );
                      }
                      return null;
                    });
                  })()}
                </div>              
              {activeActionType === "action" && (
                <div className="text-center text-gray-500 text-sm py-4">
                  Действия будут здесь
                </div>
              )}
              
              {activeActionType === "bonus" && (
                <div className="text-center text-gray-500 text-sm py-4">
                  Бонусные действия теперь отображаются в разделе "АТАКА"
                </div>
              )}
              
              {activeActionType === "reaction" && (
                <div className="text-center text-gray-500 text-sm py-4">
                  Реакции будут здесь
                </div>
              )}
            </div>
          </div>
        );
      case "spells":
        return (
          <div>
            {/* Заговоры (всегда доступны) */}
            <div className="mb-4">
              <div 
                className="text-xs font-semibold uppercase mb-2 text-gray-400"
                style={{
                  borderBottom: `1px solid ${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}20`
                }}
              >
                ЗАГОВОРЫ (0 уровень)
              </div>
              <div className="text-sm text-gray-300 space-y-1">
                {characterData?.spells?.length > 0 ? (
                  characterData.spells.map((spell: string, index: number) => (
                    <div 
                      key={index} 
                      className="py-2 px-3 hover:bg-gray-700 rounded cursor-pointer transition-colors duration-200 border border-transparent hover:border-gray-600"
                      onClick={() => onRoll?.(spell, 'int', 0, "Заклинание")}
                    >
                      <div className="font-medium text-gray-200">{spell}</div>
                      <div className="text-xs text-gray-400">Заговор • Действие</div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-center py-4">
                    Нет заговоров
                  </div>
                )}
              </div>
            </div>
            
            {/* Подготовленные заклинания */}
            <div>
              <div 
                className="text-xs font-semibold uppercase mb-2 text-gray-400"
                style={{
                  borderBottom: `1px solid ${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}20`
                }}
              >
                ПОДГОТОВЛЕННЫЕ ЗАКЛИНАНИЯ
              </div>
              <div className="text-sm text-gray-300">
                <div className="text-gray-500 text-center py-4">
                  Система подготовки заклинаний будет добавлена позже
                </div>
              </div>
            </div>
          </div>
        );
      case "inventory":
        return (
          <div className="text-center text-gray-500 text-sm py-4">
            Инвентарь будет здесь
          </div>
        );
      case "features":
        return (
          <div className="text-center text-gray-500 text-sm py-4">
            Особенности будут здесь
          </div>
        );
      default:
        return null;
    }
  };

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
        {/* Вкладки в левом верхнем углу */}
        <div className="flex gap-0 mb-4">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const frameColorHex = frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54';
            
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-2 text-xs font-semibold uppercase transition-all duration-200 relative`}
                style={{
                  color: isActive ? frameColorHex : '#9CA3AF',
                  borderBottom: isActive ? `2px solid ${frameColorHex}` : 'none'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        
        {/* Контент вкладки */}
        {renderContent()}
      </div>
    </div>
  );
}