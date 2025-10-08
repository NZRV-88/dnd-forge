import React from 'react';
import { useFrameColor } from '@/contexts/FrameColorContext';

interface ConditionBlockProps {
  // Здесь можно добавить пропсы для состояний персонажа
  // например: conditions?: string[], exhaustion?: number, etc.
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

// Вспомогательная функция для получения цвета рамки
const getFrameColor = (color: string) => {
  return FRAME_COLORS[color as keyof typeof FRAME_COLORS] || FRAME_COLORS.gold;
};

// Функция для генерации динамического SVG conditionFrame
const getConditionFrameSvg = (color: string) => {
  const hexColor = getFrameColor(color);
  
  return `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" id="Слой_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 191.79 100" style="enable-background:new 0 0 191.79 100;" xml:space="preserve">
<style type="text/css">
	.st0{clip-path:url(#SVGID_00000171696861770939944030000010469763359886749355_);fill:${hexColor};}
</style>
<g>
	<defs>
		<rect id="SVGID_1_" width="191.79" height="100"/>
	</defs>
	<clipPath id="SVGID_00000169529749726618591060000004765894090106221752_">
		<use xlink:href="#SVGID_1_"  style="overflow:visible;"/>
	</clipPath>
	<path style="fill:${hexColor};" d="M189.93,70.91h-1V5.95
	h1V70.91z M2.96,70.68h-1V5.72h1V70.68z M191.78,3.02V2.11h-2.89V0h-1.26c0,0-0.5,0.73-1.84,0.73H5.99C4.65,0.73,4.15,0,4.15,0
	H2.89v2.11H0.01v0.91c1.19,0,1.26,1.96,1.26,1.96v65.71c0,0-0.07,1.93-1.26,1.93v0.94h2.89v3.31h1.26V1.56h183.48V75.3H4.15v1.56
	c0,0,0.5-0.73,1.84-0.73H185.8c1.33,0,1.83,0.72,1.84,0.73h1.26v-3.31h2.89v-0.94c-1.19,0-1.26-1.95-1.26-1.95V4.97
	C190.53,4.97,190.59,3.02,191.78,3.02z"/>
</g>
</svg>`;
};

export default function ConditionBlock({}: ConditionBlockProps) {
  const { frameColor } = useFrameColor();
  
  return (
    <div
      className="relative p-3 text-gray-300 -ml-[39px] mt-[15px]"
      style={{
        width: "100%",
        height: "120px",
        backgroundImage: `url('data:image/svg+xml;charset=utf-8,${encodeURIComponent(getConditionFrameSvg(frameColor))}')`,
        backgroundSize: "100% auto",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center top",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      {/* Контент блока состояний */}
      <div className="text-center">
        <div className="text-xs font-bold uppercase text-gray-400 mb-1">
          СОСТОЯНИЯ
        </div>
        <div className="text-sm text-gray-300">
          Нет состояний
        </div>
      </div>
    </div>
  );
}
