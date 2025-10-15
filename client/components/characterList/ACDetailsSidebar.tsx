import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useCharacter } from '@/store/character';
import { getFrameColor } from '@/utils/colorUtils';
import { v4 as uuidv4 } from 'uuid';

interface ACDetailsSidebarProps {
  baseAC: number;
  finalAC: number;
  hasDefenseFightingStyle: boolean;
  isWearingArmor: boolean;
  equippedArmor?: any;
  acSource?: string | null;
  frameColor: string;
  onClose: () => void;
}

export default function ACDetailsSidebar({
  baseAC,
  finalAC,
  hasDefenseFightingStyle,
  isWearingArmor,
  equippedArmor,
  acSource,
  frameColor,
  onClose
}: ACDetailsSidebarProps) {
  
  const { draft, setDraft } = useCharacter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [acBonus, setACBonus] = useState(0);
  const [bonusSource, setBonusSource] = useState('');
  
  // Получаем бонусы из draft
  const appliedBonuses = draft.acBonuses || [];
  
  return (
    <div className="space-y-3 text-xs">
      {/* Содержимое */}
      <div className="space-y-2">
        {/* Итоговый КД */}
        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-white">
            {finalAC}
          </div>
          <div className="text-gray-400">Итоговый класс брони</div>
        </div>

        {/* Детали расчета */}
        <div className="text-gray-400">
          <span className="font-medium text-gray-200">Базовый КБ:</span> {baseAC}
          {acSource && (
            <span className="text-gray-500 ml-2">({acSource})</span>
          )}
        </div>

        {/* Примененные бонусы */}
        {appliedBonuses.map((bonus) => (
          <div key={bonus.id} className="text-gray-400">
            <span className="font-medium text-gray-200">Бонус:</span> +{bonus.bonus}
            <span className="text-gray-500 ml-2">({bonus.source})</span>
            <button
              onClick={() => {
                setDraft(prev => ({
                  ...prev,
                  acBonuses: prev.acBonuses?.filter(b => b.id !== bonus.id) || []
                }));
              }}
              className="ml-2 text-red-400 hover:text-red-300 text-xs"
            >
              ✕
            </button>
          </div>
        ))}

        {/* Боевой стиль "Оборона" */}
        {hasDefenseFightingStyle && (
          <div className="text-gray-400">
            <span className="font-medium text-gray-200">Боевой стиль "Оборона":</span> 
            {isWearingArmor ? (
              <span className="text-green-400 ml-2">+1 (активен)</span>
            ) : (
              <span className="text-gray-500 ml-2">+1 (неактивен - нет доспеха)</span>
            )}
          </div>
        )}

        {/* Информация о доспехе */}
        {equippedArmor && (
          <div className="text-gray-400">
            <span className="font-medium text-gray-200">Надетый доспех:</span> {equippedArmor.name}
          </div>
        )}

        {!equippedArmor && (
          <div className="text-gray-400">
            <span className="font-medium text-gray-200">Надетый доспех:</span> 
            <span className="text-gray-500 ml-2">Нет</span>
          </div>
        )}

        {/* Раскрывающееся меню для изменения КБ */}
        <div className="mt-3 pt-3 border-t border-gray-700">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full text-left text-gray-400 hover:text-gray-200 transition-colors"
          >
            <span className="font-medium text-gray-200">Дополнительные бонусы к КБ</span>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {isExpanded && (
            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 mb-1">Бонус</label>
                  <input
                    type="number"
                    value={acBonus}
                    onChange={(e) => setACBonus(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm bg-neutral-800 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
                    style={{
                      '--focus-ring-color': getFrameColor(frameColor)
                    } as React.CSSProperties}
                    onFocus={(e) => {
                      e.target.style.borderColor = getFrameColor(frameColor);
                      e.target.style.boxShadow = `0 0 0 2px ${getFrameColor(frameColor)}40`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#4B5563'; // border-gray-600
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="0"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 mb-1">Источник</label>
                  <input
                    type="text"
                    value={bonusSource}
                    onChange={(e) => setBonusSource(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-neutral-800 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
                    style={{
                      '--focus-ring-color': getFrameColor(frameColor)
                    } as React.CSSProperties}
                    onFocus={(e) => {
                      e.target.style.borderColor = getFrameColor(frameColor);
                      e.target.style.boxShadow = `0 0 0 2px ${getFrameColor(frameColor)}40`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#4B5563'; // border-gray-600
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="Например: Заклинание"
                  />
                </div>
              </div>
              
              <button
                onClick={() => {
                  if (acBonus !== 0 && bonusSource.trim()) {
                    const newBonus = {
                      id: uuidv4(),
                      bonus: acBonus,
                      source: bonusSource
                    };
                    setDraft(prev => ({
                      ...prev,
                      acBonuses: [...(prev.acBonuses || []), newBonus]
                    }));
                    setACBonus(0);
                    setBonusSource('');
                  }
                }}
                disabled={acBonus === 0 || !bonusSource.trim()}
                className="w-full px-3 py-2 bg-transparent hover:bg-opacity-20 disabled:bg-gray-600 disabled:cursor-not-allowed text-sm rounded transition-colors"
                style={{ 
                  border: `1px solid ${getFrameColor(frameColor)}`,
                  color: getFrameColor(frameColor)
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = `${getFrameColor(frameColor)}40`;
                    e.currentTarget.style.color = getFrameColor(frameColor);
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = getFrameColor(frameColor);
                  }
                }}
              >
                Применить бонус
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Объяснение боевого стиля "Оборона" */}
      {hasDefenseFightingStyle && (
        <div className="text-gray-400 mt-3 pt-3 border-t border-gray-700">
          <div className="font-medium text-gray-200 mb-2">Боевой стиль "Оборона"</div>
          <div className="text-gray-400">
            +1 к КБ, пока вы носите броню.
          </div>
        </div>
      )}

      {/* Дополнительная информация */}
      <div className="text-gray-400 mt-3 pt-3 border-t border-gray-700">
        <div className="font-medium text-gray-200 mb-2">Как рассчитывается КБ</div>
        <div className="text-gray-400 space-y-1">
          <div>Класс Брони (КБ) показывает, насколько хорошо ваш персонаж защищен от ранений в бою. На КБ влияют доспехи, которые вы носите, щит, который вы держите, и модификатор ловкости. Однако не все персонажи носят доспехи или держат щиты. Без доспехов или щита КБ вашего персонажа равен 10 + его модификатор ловкости. Если ваш персонаж носит доспехи, держит щит или и то и другое, рассчитайте КБ, следуя правилам в разделе «Снаряжение». Запишите КБ вашего персонажа в его карточке.</div>
        </div>
      </div>
    </div>
  );
}
