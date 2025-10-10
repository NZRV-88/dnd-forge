import { useState } from 'react';

export interface DiceRollData {
  characterName?: string;
  description: string;
  dice: string;
  modifier: number;
  result: number;
  diceRoll: number;
  type: string;
  individualRolls?: number[];
}

export interface RollLogEntry {
  entry: string;
  rollData: DiceRollData;
}

export interface UseDiceRollsProps {
  characterName?: string;
  characterData?: any; // Добавляем данные персонажа для проверки особенностей
  onRollAdded?: (entry: RollLogEntry) => void;
}

export function useDiceRolls({ characterName, characterData, onRollAdded }: UseDiceRollsProps = {}) {
  const [rollLog, setRollLog] = useState<string[]>([]);
  const [diceModalOpen, setDiceModalOpen] = useState(false);
  const [diceRollData, setDiceRollData] = useState<DiceRollData | null>(null);

  // Функция для парсинга строки урона (например, "1d8+3" или "1d8+5+5")
  const parseDamageDice = (diceString: string) => {
    // Сначала извлекаем кубики (например, "1d8")
    const diceMatch = diceString.match(/^(\d+)d(\d+)/);
    if (!diceMatch) {
      return { dice: "d20", modifier: 0 }; // По умолчанию
    }
    
    const [, numDice, diceSize] = diceMatch;
    const dice = `${numDice}d${diceSize}`;
    
    // Затем извлекаем все модификаторы (например, "+5+5" или "+3" или "-2")
    const modifierMatch = diceString.match(/[+-]\d+/g);
    let modifier = 0;
    if (modifierMatch) {
      modifier = modifierMatch.reduce((sum, mod) => sum + parseInt(mod), 0);
    }
    
    return { dice, modifier };
  };

  // Функция для броска кубика урона с учетом особенностей персонажа
  const rollDamageDiceWithFeatures = (diceString: string, isMeleeWeapon: boolean = false) => {
        console.log('DEBUG: rollDamageDiceWithFeatures called with:', { diceString, isMeleeWeapon, characterData: characterData?.basics });
        console.log('DEBUG: characterData.radiantStrikes:', characterData?.radiantStrikes);
    const { diceRoll: baseDiceRoll, finalResult: baseResult, individualRolls: baseIndividualRolls, dice: baseDice, modifier: baseModifier } = rollDamageDice(diceString);
    console.log('DEBUG: rollDamageDice result:', { baseDiceRoll, baseResult, baseIndividualRolls, baseDice, baseModifier });
    
    // Проверяем Сияющие удары для паладина
    let radiantDamage = 0;
    let radiantRolls: number[] = [];
    let hasRadiantStrikes = false;
    
    console.log('DEBUG: Checking radiant strikes conditions:', {
      class: characterData?.basics?.class,
      level: characterData?.basics?.level,
      radiantStrikes: characterData?.radiantStrikes,
      isMeleeWeapon
    });
    
    if (characterData?.basics?.class === 'paladin' && 
        characterData?.basics?.level >= 11 && 
        characterData?.radiantStrikes && 
        isMeleeWeapon) {
      hasRadiantStrikes = true;
      // Бросаем отдельный кубик 1d8 для излучения
      radiantRolls = [Math.floor(Math.random() * 8) + 1];
      radiantDamage = radiantRolls[0];
      console.log('DEBUG: Radiant strikes activated!', { radiantDamage, radiantRolls });
    }
    
    const totalDamage = baseResult + radiantDamage;
    const allIndividualRolls = [...baseIndividualRolls, ...radiantRolls];
    
    return {
      diceRoll: baseDiceRoll,
      finalResult: totalDamage,
      individualRolls: allIndividualRolls,
      dice: baseDice,
      modifier: baseModifier,
      baseDamage: baseResult,
      radiantDamage: radiantDamage,
      hasRadiantStrikes: hasRadiantStrikes,
      radiantRolls: radiantRolls
    };
  };

  // Функция для броска кубика урона
  const rollDamageDice = (diceString: string) => {
    const { dice, modifier } = parseDamageDice(diceString);
    
    // Если строка содержит несколько кубиков (например, "2d6 + 1d10")
    if (dice.includes(' + ')) {
      const diceParts = dice.split(' + ');
      const allIndividualRolls: number[] = [];
      let total = 0;
      
      for (const dicePart of diceParts) {
        const [numDice, diceSize] = dicePart.trim().split('d').map(Number);
        for (let i = 0; i < numDice; i++) {
          const roll = Math.floor(Math.random() * diceSize) + 1;
          allIndividualRolls.push(roll);
          total += roll;
        }
      }
      
      const finalResult = total + modifier;
      return { 
        diceRoll: total, 
        finalResult: finalResult, 
        individualRolls: allIndividualRolls,
        dice: dice,
        modifier: modifier
      };
    }
    
    // Для одного кубика используем старую логику
    const [numDice, diceSize] = dice.split('d').map(Number);
    const individualRolls = [];
    let total = 0;
    for (let i = 0; i < numDice; i++) {
      const roll = Math.floor(Math.random() * diceSize) + 1;
      individualRolls.push(roll);
      total += roll;
    }
    const finalResult = total + modifier;
    return { 
      diceRoll: total, 
      finalResult: finalResult, 
      individualRolls: individualRolls,
      dice: dice,
      modifier: modifier
    };
  };

  // Основная функция для добавления броска
  const addRoll = (
    desc: string, 
    abilityKey: string, 
    bonus: number, 
    type: string = "", 
    damageString?: string, 
    attackRoll?: number,
    isMeleeWeapon: boolean = false
  ) => {
    const d20 = attackRoll !== undefined ? attackRoll : Math.floor(Math.random() * 20) + 1;
    const total = d20 + bonus;
    
    let entry = "";
    let dice = "d20";
    let diceRoll = d20;
    let modifier = bonus;
    let result = total;
    let individualRolls: number[] = [];

    if (type === "Спасбросок") {
      entry = `${desc.toUpperCase()}: СПАС: ${d20} ${bonus >= 0 ? `+ ${bonus}` : bonus} = ${total}`;
    } else if (desc === "Инициатива") {
      entry = `ИНИЦИАТИВА: БРОСОК: ${d20} ${bonus >= 0 ? `+ ${bonus}` : bonus} = ${total}`;
    } else if (type === "Навык") {
      entry = `${desc.toUpperCase()}: ПРОВЕРКА: ${d20} ${bonus >= 0 ? `+ ${bonus}` : bonus} = ${total}`;
    } else if (type === "Атака") {
      // Для атак: название оружия uppercase: ПОПАДАНИЕ: бросок
      entry = `${desc.toUpperCase()}: ПОПАДАНИЕ: ${d20} ${bonus >= 0 ? `+ ${bonus}` : bonus} = ${total}`;
    } else if (type === "Урон") {
      // Для урона: используем правильный кубик урона с учетом особенностей
      console.log('DEBUG: addRoll called for damage with:', { desc, damageString, isMeleeWeapon, characterData: characterData?.basics });
      if (damageString) {
        const { diceRoll: damageDiceRoll, finalResult, individualRolls: damageIndividualRolls, dice: damageDice, modifier: damageModifier, baseDamage, radiantDamage, hasRadiantStrikes, radiantRolls } = rollDamageDiceWithFeatures(damageString, isMeleeWeapon);
        dice = damageDice;
        diceRoll = damageDiceRoll;
        modifier = damageModifier;
        result = finalResult;
        individualRolls = damageIndividualRolls;
        
        if (hasRadiantStrikes) {
          // Создаем отдельные записи для базового урона и излучения
          const baseRollsStr = damageIndividualRolls.slice(0, -radiantRolls.length).join('+');
          const radiantRollsStr = radiantRolls.join('+');
          const modStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
          
          // Запись для базового урона
          const baseEntry = `${desc.toUpperCase()}: УРОН (оружие): ${dice}${modStr} = ${baseRollsStr}${modStr} = ${baseDamage}`;
          
          // Запись для излучения
          const radiantEntry = `${desc.toUpperCase()}: УРОН (излучение): 1d8 = ${radiantRollsStr} = ${radiantDamage}`;
          
          // Создаем данные для модального окна - массив из 2 бросков
          const baseRollData: DiceRollData = {
            characterName: characterName || 'Персонаж',
            dice: dice,
            modifier: modifier,
            result: baseDamage,
            individualRolls: damageIndividualRolls.slice(0, -radiantRolls.length),
            description: `${desc} (оружие)`,
            timestamp: new Date().toISOString()
          };
          
          const radiantRollData: DiceRollData = {
            characterName: characterName || 'Персонаж',
            dice: '1d8',
            modifier: 0,
            result: radiantDamage,
            individualRolls: radiantRolls,
            description: `${desc} (излучение)`,
            timestamp: new Date().toISOString()
          };
          
          // Добавляем обе записи в лог
          setRollLog(prev => [...prev, { entry: baseEntry, rollData: baseRollData }]);
          setRollLog(prev => [...prev, { entry: radiantEntry, rollData: radiantRollData }]);
          
          // Вызываем callback для обеих записей
          onRollAdded?.({ entry: baseEntry, rollData: baseRollData });
          onRollAdded?.({ entry: radiantEntry, rollData: radiantRollData });
          
          // Передаем комбинированный объект в модальное окно
          const combinedRollData: DiceRollData = {
            characterName: characterName || 'Персонаж',
            dice: `${dice} + 1d8`, // Комбинированные кубики
            modifier: modifier,
            result: finalResult, // Общий результат
            individualRolls: damageIndividualRolls, // Все броски
            description: `${desc}`, // Только название оружия
            type: "Урон", // Указываем тип как урон
            timestamp: new Date().toISOString()
          };
          
          setDiceRollData(combinedRollData);
          setDiceModalOpen(true);
          
          return; // Выходим из функции, так как уже обработали все
        } else {
          // Обычный урон без особенностей
          if (modifier !== 0) {
            const individualRollsStr = individualRolls.join('+');
            const modStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
            entry = `${desc.toUpperCase()}: УРОН: ${dice}${modStr} = ${individualRollsStr}${modStr} = ${finalResult}`;
          } else {
            const individualRollsStr = individualRolls.join('+');
            entry = `${desc.toUpperCase()}: УРОН: ${dice} = ${individualRollsStr} = ${finalResult}`;
          }
        }
      } else {
        // Fallback на d20 если нет строки урона
        entry = `${desc.toUpperCase()}: УРОН: ${d20} ${bonus >= 0 ? `+ ${bonus}` : bonus} = ${total}`;
      }
    } else if (type === "Лечение") {
      // Для лечения: название заклинания uppercase: ЛЕЧЕНИЕ: бросок
      entry = `${desc.toUpperCase()}: ЛЕЧЕНИЕ: ${d20} ${bonus >= 0 ? `+ ${bonus}` : bonus} = ${total}`;
    } else if (type === "Заклинание") {
      // Для заклинаний: название заклинания uppercase: ЗАКЛИНАНИЕ: бросок
      entry = `${desc.toUpperCase()}: ЗАКЛИНАНИЕ: ${d20} ${bonus >= 0 ? `+ ${bonus}` : bonus} = ${total}`;
    } else {
      // Для характеристик
      entry = `${desc.toUpperCase()}: ПРОВЕРКА: ${d20} ${bonus >= 0 ? `+ ${bonus}` : bonus} = ${total}`;
    }

    // Показываем модальное окно с результатом броска
    const rollData: DiceRollData = {
      characterName: characterName || 'Персонаж',
      description: desc,
      dice: dice,
      modifier: modifier,
      result: result,
      diceRoll: diceRoll,
      type: type,
      individualRolls: individualRolls.length > 0 ? 
        individualRolls : 
        undefined
    };
    
    setDiceRollData(rollData);
    setDiceModalOpen(true);

    // Добавляем в лог
    const logEntry: RollLogEntry = { entry, rollData };
    setRollLog((prev) => [entry, ...prev].slice(0, 200));
    
    // Вызываем callback если передан
    onRollAdded?.(logEntry);
  };

  return {
    rollLog,
    setRollLog,
    diceModalOpen,
    setDiceModalOpen,
    diceRollData,
    setDiceRollData,
    addRoll,
    rollDamageDice,
    rollDamageDiceWithFeatures,
    parseDamageDice
  };
}
