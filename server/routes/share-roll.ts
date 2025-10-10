import { RequestHandler } from "express";

export interface ShareRollRequest {
  characterName: string;
  rollDescription: string;
  dice: string;
  modifier: number;
  result: number;
  diceRoll: number;
  type: string;
  individualRolls?: number[];
  platform: 'telegram' | 'vk';
  chatId?: string; // для Telegram
  userId?: string; // для VK
}

export interface ShareRollResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Telegram Bot API endpoint
export const shareToTelegram: RequestHandler = async (req, res) => {
  try {
    const { rollData, chatId, messageThreadId } = req.body;
    
    if (!rollData || !chatId) {
      return res.status(400).json({ success: false, error: 'Roll data and chat ID are required for Telegram' });
    }
    
    const { characterName, description, dice, modifier, result, diceRoll, type, individualRolls } = rollData;

    // Форматируем сообщение для Telegram
    const message = formatRollMessage(characterName, description, dice, modifier, result, diceRoll, type, individualRolls);
    
    // Здесь должен быть ваш Telegram Bot Token
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      // Демо-режим для тестирования
      console.log('🎲 DEMO MODE: Telegram message would be sent:');
      console.log(`📱 To: ${chatId}`);
      console.log(`💬 Message: ${message}`);
      return res.json({ 
        success: true, 
        message: 'DEMO: Roll result would be shared to Telegram successfully',
        demo: true
      });
    }

    // Отправляем сообщение через Telegram Bot API
    const messagePayload: any = {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML'
    };
    
    // Добавляем message_thread_id если указан (для топиков)
    if (messageThreadId) {
      messagePayload.message_thread_id = messageThreadId;
    }
    
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(messagePayload)
    });

    if (!telegramResponse.ok) {
      throw new Error('Failed to send message to Telegram');
    }

    res.json({ success: true, message: 'Roll result shared to Telegram successfully' });
  } catch (error) {
    console.error('Telegram sharing error:', error);
    res.status(500).json({ success: false, error: 'Failed to share to Telegram' });
  }
};

// VKontakte API endpoint
export const shareToVK: RequestHandler = async (req, res) => {
  try {
    const { rollData, userId } = req.body;
    
    if (!rollData || !userId) {
      return res.status(400).json({ success: false, error: 'Roll data and user ID are required for VK' });
    }
    
    const { characterName, description, dice, modifier, result, diceRoll, type, individualRolls } = rollData;

    // Форматируем сообщение для VK
    const message = formatRollMessage(characterName, description, dice, modifier, result, diceRoll, type, individualRolls);
    
    // Здесь должен быть ваш VK Access Token
    const vkToken = process.env.VK_ACCESS_TOKEN;
    if (!vkToken) {
      // Демо-режим для тестирования
      console.log('🎲 DEMO MODE: VK message would be sent:');
      console.log(`👤 To: ${userId}`);
      console.log(`💬 Message: ${message}`);
      return res.json({ 
        success: true, 
        message: 'DEMO: Roll result would be shared to VK successfully',
        demo: true
      });
    }

    // Отправляем сообщение через VK API
    const vkResponse = await fetch('https://api.vk.com/method/messages.send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_token: vkToken,
        user_id: userId,
        message: message,
        v: '5.131'
      })
    });

    const vkData = await vkResponse.json();
    
    if (vkData.error) {
      throw new Error(vkData.error.error_msg);
    }

    res.json({ success: true, message: 'Roll result shared to VK successfully' });
  } catch (error) {
    console.error('VK sharing error:', error);
    res.status(500).json({ success: false, error: 'Failed to share to VK' });
  }
};

// Функция для форматирования сообщения о броске
function formatRollMessage(
  characterName: string,
  rollDescription: string,
  dice: string,
  modifier: number,
  result: number,
  diceRoll: number,
  type: string,
  individualRolls?: number[]
): string {
  const actionType = getActionTypeText(type);
  const modifierText = modifier !== 0 ? (modifier > 0 ? `+${modifier}` : `${modifier}`) : '';
  
  let calculationText = '';
  if (individualRolls && individualRolls.length > 0) {
    calculationText = `${individualRolls.join('+')}${modifierText}`;
  } else {
    calculationText = `${diceRoll}${modifierText}`;
  }

  // Специальные результаты для d20
  let specialResult = '';
  if (dice === 'd20' && diceRoll === 20) {
    specialResult = '\n🎉 <b>КРИТИЧЕСКИЙ УСПЕХ!</b>';
  } else if (dice === 'd20' && diceRoll === 1) {
    specialResult = '\n💀 <b>КРИТИЧЕСКИЙ ПРОВАЛ!</b>';
  }

  // Эмодзи для разных типов действий
  const actionEmoji = getActionEmoji(type);
  
  // Красивое форматирование с разделителями
  const separator = '━━━━━━━━━━━━━━━';
  
  return `${actionEmoji} <b>${characterName}</b> ${getActionVerb(type)}: <i>${rollDescription}</i>

${separator}
🎲 <b>Кость:</b> <code>${dice}</code>
🔢 <b>Бросок:</b> <code>${calculationText}</code>
📊 <b>Результат:</b> <code>${result}</code>${specialResult}
${separator}`;
}

function getActionTypeText(type: string): string {
  switch (type) {
    case "Спасбросок": return "СПАСБРОСОК";
    case "Урон": return "УРОН";
    case "Лечение": return "ЛЕЧЕНИЕ";
    case "Атака": return "ПОПАДАНИЕ";
    case "Заклинание": return "ЗАКЛИНАНИЕ";
    case "Навык": return "ПРОВЕРКА";
    default: return "БРОСОК";
  }
}

function getActionEmoji(type: string): string {
  switch (type) {
    case "Спасбросок": return "🛡️";
    case "Урон": return "⚔️";
    case "Лечение": return "💚";
    case "Атака": return "🎯";
    case "Заклинание": return "✨";
    case "Навык": return "🧠";
    default: return "🎲";
  }
}

function getActionVerb(type: string): string {
  switch (type) {
    case "Спасбросок": return "делает спасбросок";
    case "Урон": return "наносит урон";
    case "Лечение": return "лечит";
    case "Атака": return "атакует";
    case "Заклинание": return "колдует";
    case "Навык": return "проверяет навык";
    default: return "бросает кубик";
  }
}
