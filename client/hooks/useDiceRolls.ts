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
  onRollAdded?: (entry: RollLogEntry) => void;
}

export function useDiceRolls({ characterName, onRollAdded }: UseDiceRollsProps = {}) {
  const [rollLog, setRollLog] = useState<string[]>([]);
  const [diceModalOpen, setDiceModalOpen] = useState(false);
  const [diceRollData, setDiceRollData] = useState<DiceRollData | null>(null);

  // Функция для парсинга строки урона (например, "1d8+3")
  const parseDamageDice = (diceString: string) => {
    const match = diceString.match(/^(\d+)d(\d+)([+-]\d+)?$/);
    if (!match) {
      return { dice: "d20", modifier: 0 }; // По умолчанию
    }
    
    const [, numDice, diceSize, modifierStr] = match;
    const modifier = modifierStr ? parseInt(modifierStr) : 0;
    const dice = `${numDice}d${diceSize}`;
    
    return { dice, modifier };
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
    attackRoll?: number
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
      // Для урона: используем правильный кубик урона
      if (damageString) {
        const { diceRoll: damageDiceRoll, finalResult, individualRolls: damageIndividualRolls, dice: damageDice, modifier: damageModifier } = rollDamageDice(damageString);
        dice = damageDice;
        diceRoll = damageDiceRoll;
        modifier = damageModifier;
        result = finalResult;
        individualRolls = damageIndividualRolls;
        
        if (modifier !== 0) {
          const individualRollsStr = individualRolls.join('+');
          const modStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
          entry = `${desc.toUpperCase()}: УРОН: ${dice}${modStr} = ${individualRollsStr}${modStr} = ${finalResult}`;
        } else {
          const individualRollsStr = individualRolls.join('+');
          entry = `${desc.toUpperCase()}: УРОН: ${dice} = ${individualRollsStr} = ${finalResult}`;
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
    parseDamageDice
  };
}
