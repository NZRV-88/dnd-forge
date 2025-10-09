/**
 * Конвертирует стоимость в медные монеты (ММ)
 */
export const convertToCopper = (cost: string): number => {
  if (!cost || cost === 'Неизвестно') return 0;
  
  const costStr = cost.toString().toLowerCase();
  let totalCopper = 0;
  
  // Платиновые монеты (ПМ) - 1000 ММ
  const platinumMatch = costStr.match(/(\d+)\s*пм/);
  if (platinumMatch) {
    totalCopper += parseInt(platinumMatch[1]) * 1000;
  }
  
  // Золотые монеты (ЗМ) - 100 ММ
  const goldMatch = costStr.match(/(\d+)\s*зм/);
  if (goldMatch) {
    totalCopper += parseInt(goldMatch[1]) * 100;
  }
  
  // Электрумовые монеты (ЭМ) - 50 ММ
  const electrumMatch = costStr.match(/(\d+)\s*эм/);
  if (electrumMatch) {
    totalCopper += parseInt(electrumMatch[1]) * 50;
  }
  
  // Серебряные монеты (СМ) - 10 ММ
  const silverMatch = costStr.match(/(\d+)\s*см/);
  if (silverMatch) {
    totalCopper += parseInt(silverMatch[1]) * 10;
  }
  
  // Медные монеты (ММ) - 1 ММ
  const copperMatch = costStr.match(/(\d+)\s*мм/);
  if (copperMatch) {
    totalCopper += parseInt(copperMatch[1]);
  }
  
  // Если нет указания валюты, считаем что это золотые монеты
  if (!platinumMatch && !goldMatch && !electrumMatch && !silverMatch && !copperMatch) {
    const numberMatch = costStr.match(/(\d+)/);
    if (numberMatch) {
      totalCopper += parseInt(numberMatch[1]) * 100; // По умолчанию ЗМ
    }
  }
  
  return totalCopper;
};

/**
 * Рассчитывает общее количество в ЗМ
 */
export const calculateTotalGold = (currency: any): number => {
  if (!currency) return 0;
  
  return currency.platinum * 10 + 
         currency.gold + 
         currency.electrum * 0.5 + 
         currency.silver * 0.1 + 
         currency.copper * 0.01;
};

/**
 * Конвертирует валюту при недостатке средств
 */
export const convertCurrency = (currentCurrency: any, requiredCopper: number): any => {
  let totalCopper = currentCurrency.platinum * 1000 + 
                   currentCurrency.gold * 100 + 
                   currentCurrency.electrum * 50 + 
                   currentCurrency.silver * 10 + 
                   currentCurrency.copper;
  
  if (totalCopper < requiredCopper) {
    return null; // Недостаточно средств
  }
  
  const newCurrency = { ...currentCurrency };
  totalCopper -= requiredCopper;
  
  // Конвертируем обратно в различные монеты
  newCurrency.platinum = Math.floor(totalCopper / 1000);
  totalCopper %= 1000;
  
  newCurrency.gold = Math.floor(totalCopper / 100);
  totalCopper %= 100;
  
  newCurrency.electrum = Math.floor(totalCopper / 50);
  totalCopper %= 50;
  
  newCurrency.silver = Math.floor(totalCopper / 10);
  totalCopper %= 10;
  
  newCurrency.copper = totalCopper;
  
  return newCurrency;
};

/**
 * Рассчитывает итоговую стоимость покупки
 */
export const calculatePurchaseCost = (item: any, quantity: number): string => {
  const itemCost = item.cost || 'Неизвестно';
  
  if (itemCost === 'Неизвестно') {
    return 'Неизвестно';
  }
  
  const costInCopper = convertToCopper(itemCost);
  const totalCostInCopper = costInCopper * quantity;
  
  // Конвертируем обратно в читаемый формат
  const platinum = Math.floor(totalCostInCopper / 1000);
  const gold = Math.floor((totalCostInCopper % 1000) / 100);
  const electrum = Math.floor((totalCostInCopper % 100) / 50);
  const silver = Math.floor((totalCostInCopper % 50) / 10);
  const copper = totalCostInCopper % 10;
  
  const parts: string[] = [];
  if (platinum > 0) parts.push(`${platinum} ПМ`);
  if (gold > 0) parts.push(`${gold} ЗМ`);
  if (electrum > 0) parts.push(`${electrum} ЭМ`);
  if (silver > 0) parts.push(`${silver} СМ`);
  if (copper > 0) parts.push(`${copper} ММ`);
  
  return parts.length > 0 ? parts.join(' ') : '0 ММ';
};

/**
 * Переводит валюту в читаемый формат
 */
export const translateCurrency = (cost: string): string => {
  if (!cost || cost === 'Неизвестно') return 'Неизвестно';
  
  // Если уже в правильном формате, возвращаем как есть
  if (cost.includes('ПМ') || cost.includes('ЗМ') || cost.includes('ЭМ') || cost.includes('СМ') || cost.includes('ММ')) {
    return cost;
  }
  
  // Если это просто число, считаем что это золотые монеты
  const numberMatch = cost.match(/(\d+)/);
  if (numberMatch) {
    return `${numberMatch[1]} ЗМ`;
  }
  
  return cost;
};
