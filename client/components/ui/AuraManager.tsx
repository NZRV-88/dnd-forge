import React from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Shield, ChevronDown, Loader2 } from 'lucide-react';
import { useCharacter } from '@/store/character';

interface AuraManagerProps {
  level: number;
  frameColor?: string;
}

export default function AuraManager({ level, frameColor = '#3B82F6' }: AuraManagerProps) {
  const characterContext = useCharacter();
  
  if (!characterContext) {
    return null;
  }
  
  const { draft } = characterContext;
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isActivating, setIsActivating] = React.useState(false);

  // Определяем доступные ауры в зависимости от уровня
  const availableAuras = [];
  
  if (level >= 6) {
    availableAuras.push({
      name: 'Аура защиты',
      level: 6,
      radius: level >= 18 ? 30 : 10,
      description: 'Вы и ваши союзники в области действия ауры получаете бонус к спасброскам, равный вашему модификатору Харизмы (минимальный бонус +1).',
      icon: '🛡️'
    });
  }
  
  if (level >= 10) {
    availableAuras.push({
      name: 'Аура отваги',
      level: 10,
      radius: level >= 18 ? 30 : 10,
      description: 'Вы и ваши союзники в вашей Ауре Защиты обладаете Иммунитетом к состоянию Испуганный. Если союзник с состоянием Испуганный входит в ауру, то это состояние не имеет на него эффекта, пока он там находится.',
      icon: '💪'
    });
  }

  const handleActivateAura = () => {
    setIsActivating(true);
    // Здесь можно добавить логику активации ауры
    setTimeout(() => setIsActivating(false), 1000);
  };

  if (availableAuras.length === 0) {
    return null;
  }

  return (
    <div className="bg-neutral-800 rounded-lg p-4">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-0 h-auto hover:bg-transparent"
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: frameColor }}
              >
                🛡️
              </div>
              <div className="text-left">
                <h4 className="text-sm font-semibold text-white">АУРА ПАЛАДИНА</h4>
                <p className="text-xs text-gray-400">
                  {level >= 18 ? 'Радиус 30 футов' : level >= 6 ? 'Радиус 10 футов' : 'Недоступна'}
                </p>
              </div>
            </div>
            <ChevronDown 
              className={`w-4 h-4 text-gray-400 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`} 
            />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-4">
          <div className="space-y-4">
            {/* Общая информация об ауре */}
            <div className="bg-neutral-700 rounded-lg p-3">
              <h5 className="text-sm font-medium text-white mb-2">Общие правила ауры</h5>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Аура неактивна, пока у вас есть состояние Недееспособный</li>
                <li>• Каждое существо может получать бонус только от одной Ауры защиты одновременно</li>
                <li>• Если на существо действует несколько аур, оно выбирает, какая из них оказывает эффект</li>
                {level >= 18 && (
                  <li>• <strong className="text-yellow-400">Расширение ауры:</strong> Радиус увеличен до 30 футов</li>
                )}
              </ul>
            </div>

            {/* Доступные ауры */}
            <div className="space-y-3">
              {availableAuras.map((aura, index) => (
                <div key={index} className="bg-neutral-700 rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{aura.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h6 className="text-sm font-medium text-white">{aura.name}</h6>
                        <span className="text-xs text-gray-500">(Уровень {aura.level})</span>
                        <span className="text-xs text-blue-400">Радиус {aura.radius} футов</span>
                      </div>
                      <p className="text-xs text-gray-400">{aura.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Кнопка активации */}
            <Button
              onClick={handleActivateAura}
              disabled={isActivating}
              className="w-full"
              style={{
                backgroundColor: frameColor,
                color: 'white',
                border: `1px solid ${frameColor}`
              }}
            >
              {isActivating ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Shield className="w-4 h-4 mr-2" />
              )}
              {isActivating ? 'Активируется...' : 'Активировать ауру'}
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
