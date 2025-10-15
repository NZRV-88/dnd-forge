import React from 'react';

interface ACDetailsSidebarProps {
  baseAC: number;
  finalAC: number;
  hasDefenseFightingStyle: boolean;
  isWearingArmor: boolean;
  equippedArmor?: any;
  acSource?: string | null;
  onClose: () => void;
}

export default function ACDetailsSidebar({
  baseAC,
  finalAC,
  hasDefenseFightingStyle,
  isWearingArmor,
  equippedArmor,
  acSource,
  onClose
}: ACDetailsSidebarProps) {
  
  return (
    <div className="space-y-3 text-xs">
      {/* Содержимое */}
      <div className="space-y-2">
        {/* Итоговый КД */}
        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-white">{finalAC}</div>
          <div className="text-gray-400">Итоговый класс брони</div>
        </div>

        {/* Детали расчета */}
        <div className="text-gray-400">
          <span className="font-medium text-gray-200">Базовый КБ:</span> {baseAC}
          {acSource && (
            <span className="text-gray-500 ml-2">({acSource})</span>
          )}
        </div>

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
