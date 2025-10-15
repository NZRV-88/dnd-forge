// Единая палитра цветов для всего приложения
export const FRAME_COLORS = {
  gold: '#B59E54',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  copper: '#B87333',
  steel: '#71797E',
  red: '#DC2626',
  blue: '#2563EB',
  green: '#16A34A',
  purple: '#9333EA',
  orange: '#EA580C',
  pink: '#EC4899',
  cyan: '#0891B2',
  lime: '#65A30D',
  indigo: '#4F46E5',
  teal: '#0D9488',
  emerald: '#059669',
  rose: '#E11D48',
  amber: '#D97706',
  violet: '#7C3AED',
  fuchsia: '#C026D3',
  sky: '#0284C7',
  stone: '#78716C',
  neutral: '#6B7280',
  zinc: '#71717A',
  slate: '#64748B',
  gray: '#6B7280',
  cool: '#6B7280',
  warm: '#78716C',
  true: '#FFFFFF',
} as const;

export type FrameColorKey = keyof typeof FRAME_COLORS;

// Функция для получения hex-кода цвета по ключу
export const getFrameColor = (colorKey: string): string => {
  return FRAME_COLORS[colorKey as FrameColorKey] || FRAME_COLORS.gold;
};

// Функция для получения полупрозрачного цвета
export const getFrameColorWithOpacity = (colorKey: string, opacity: number = 0.4): string => {
  const color = getFrameColor(colorKey);
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Функция для получения всех доступных цветов
export const getAllFrameColors = () => FRAME_COLORS;

// Функция для проверки, является ли цвет валидным
export const isValidFrameColor = (colorKey: string): colorKey is FrameColorKey => {
  return colorKey in FRAME_COLORS;
};
