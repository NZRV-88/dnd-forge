import React from 'react';
import { useFrameColor } from '@/contexts/FrameColorContext';

interface AvatarFrameWithImageProps {
  currentAvatar?: string;
  className?: string;
}

const FRAME_COLORS = {
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
};

export default function AvatarFrameWithImage({ currentAvatar, className = '' }: AvatarFrameWithImageProps) {
  const { frameColor } = useFrameColor();
  const actualFrameColor = FRAME_COLORS[frameColor as keyof typeof FRAME_COLORS] || FRAME_COLORS.gold;

  return (
    <div className={`w-32 h-32 mx-auto ${className}`}>
      {currentAvatar ? (
        <img
          src={currentAvatar}
          alt="Портрет персонажа"
          className="w-full h-full rounded-2xl border-4 object-cover"
          style={{ borderColor: actualFrameColor }}
        />
      ) : (
        <div 
          className="w-full h-full rounded-2xl border-4 border-dashed flex items-center justify-center bg-gray-100"
          style={{ borderColor: actualFrameColor }}
        >
          <span className="text-gray-500 text-sm text-center">Нет портрета</span>
        </div>
      )}
    </div>
  );
}