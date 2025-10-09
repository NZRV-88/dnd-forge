/**
 * Переводит английские ключи спасбросков в русские названия
 */
export const translateSave = (saveKey: string): string => {
  switch (saveKey.toLowerCase()) {
    case 'str':
    case 'strength':
      return 'Сила';
    case 'dex':
    case 'dexterity':
      return 'Ловкость';
    case 'con':
    case 'constitution':
      return 'Телосложение';
    case 'int':
    case 'intelligence':
      return 'Интеллект';
    case 'wis':
    case 'wisdom':
      return 'Мудрость';
    case 'cha':
    case 'charisma':
      return 'Харизма';
    default:
      return saveKey;
  }
};

/**
 * Переводит тип урона
 */
export const translateDamageType = (type: string): string => {
  const translations: Record<string, string> = {
    'acid': 'Кислотный',
    'bludgeoning': 'Дробящий',
    'cold': 'Холод',
    'fire': 'Огонь',
    'force': 'Силовой',
    'lightning': 'Молния',
    'necrotic': 'Некротический',
    'poison': 'Яд',
    'psychic': 'Психический',
    'radiant': 'Излучение',
    'slashing': 'Рубящий',
    'thunder': 'Звук'
  };
  
  return translations[type.toLowerCase()] || type;
};

/**
 * Переводит тип оружия
 */
export const translateWeaponType = (type: string): string => {
  const translations: Record<string, string> = {
    'melee': 'Ближний бой',
    'ranged': 'Дальний бой'
  };
  
  return translations[type.toLowerCase()] || type;
};

/**
 * Переводит характеристики
 */
export const translateAbility = (abilityKey: string): string => {
  const abilities: Record<string, string> = {
    'str': 'Сила',
    'strength': 'Сила',
    'dex': 'Ловкость',
    'dexterity': 'Ловкость',
    'con': 'Телосложение',
    'constitution': 'Телосложение',
    'int': 'Интеллект',
    'intelligence': 'Интеллект',
    'wis': 'Мудрость',
    'wisdom': 'Мудрость',
    'cha': 'Харизма',
    'charisma': 'Харизма'
  };
  
  return abilities[abilityKey.toLowerCase()] || abilityKey;
};

/**
 * Переводит свойства оружия
 */
export const translateWeaponProperties = (properties: string[] | undefined): string[] => {
  if (!properties || properties.length === 0) return [];
  
  const translations: Record<string, string> = {
    'ammunition': 'Боеприпасы',
    'finesse': 'Фехтовальное',
    'heavy': 'Тяжёлое',
    'light': 'Лёгкое',
    'loading': 'Перезарядка',
    'reach': 'Дальнобойное',
    'special': 'Особое',
    'thrown': 'Метательное',
    'two-handed': 'Двуручное',
    'versatile': 'Универсальное'
  };
  
  return properties.map(prop => translations[prop.toLowerCase()] || prop);
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
