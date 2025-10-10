import React from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Shield, ChevronDown, Loader2 } from 'lucide-react';
import { useCharacter } from '@/store/character';

interface AuraManagerProps {
  level: number;
  frameColor?: string;
  subclass?: string;
}

export default function AuraManager({ level, frameColor = '#3B82F6', subclass }: AuraManagerProps) {
  const characterContext = useCharacter();
  
  if (!characterContext) {
    return null;
  }
  
  const { draft } = characterContext;
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isActivating, setIsActivating] = React.useState(false);

  // Определяем доступные ауры в зависимости от уровня и подкласса
  const availableAuras = [];
  
  // Базовые ауры для всех паладинов
  if (level >= 6) {
    availableAuras.push({
      name: 'Аура защиты',
      level: 6,
      radius: level >= 18 ? 30 : 10,
      description: 'Вы и ваши союзники в области действия ауры получаете бонус к спасброскам, равный вашему модификатору Харизмы (минимальный бонус +1).',
      icon: '🛡️',
      type: 'base'
    });
  }
  
  if (level >= 10) {
    availableAuras.push({
      name: 'Аура отваги',
      level: 10,
      radius: level >= 18 ? 30 : 10,
      description: 'Вы и ваши союзники в вашей Ауре Защиты обладаете Иммунитетом к состоянию Испуганный. Если союзник с состоянием Испуганный входит в ауру, то это состояние не имеет на него эффекта, пока он там находится.',
      icon: '💪',
      type: 'base'
    });
  }

  // Уникальные ауры для подклассов
  if (subclass === 'oath-of-the-ancients') {
    if (level >= 7) {
      availableAuras.push({
        name: 'Аура опеки',
        level: 7,
        radius: level >= 18 ? 30 : 10,
        description: 'Древняя магия пронизывает вас, образуя мистическую защиту и ослабляя энергию извне Материального плана; вы и ваши союзники в вашей Ауре защиты обладаете Сопротивлением Некротическому и Психическому урону и урону Излучением.',
        icon: '🌿',
        type: 'subclass'
      });
    }
    
    if (level >= 20) {
      availableAuras.push({
        name: 'Древний чемпион',
        level: 20,
        radius: 30,
        description: 'Бонусным действием вы можете усилить свою Ауру защиты первобытной силой, дарующей описанные ниже преимущества на 1 минуту или пока вы не окончите их (действий не требуется).',
        icon: '👑',
        type: 'subclass',
        special: true,
        effects: [
          'Насадить повиновение: Враги в вашей ауре совершают с Помехой спасброски против ваших заклинаний и эффектов Проведения божественности.',
          'Регенерация: В начале каждого вашего хода вы восстанавливаете 10 Хитов.',
          'Быстрые заклинания: Каждый раз, когда вы сотворяете заклинание со временем сотворения в действие, можете сотворить его не действием, а Бонусным действием.'
        ]
      });
    }
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
                <div key={index} className={`rounded-lg p-3 ${
                  aura.type === 'subclass' ? 'bg-emerald-900/30 border border-emerald-700/50' : 'bg-neutral-700'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{aura.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h6 className="text-sm font-medium text-white">{aura.name}</h6>
                        <span className="text-xs text-gray-500">(Уровень {aura.level})</span>
                        <span className="text-xs text-blue-400">Радиус {aura.radius} футов</span>
                        {aura.type === 'subclass' && (
                          <span className="text-xs text-emerald-400 font-medium">Подкласс</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{aura.description}</p>
                      
                      {/* Специальные эффекты для Древнего чемпиона */}
                      {aura.special && aura.effects && (
                        <div className="mt-2">
                          <h7 className="text-xs font-medium text-yellow-400 mb-1 block">Особые эффекты:</h7>
                          <ul className="text-xs text-gray-400 space-y-1">
                            {aura.effects.map((effect, effectIndex) => (
                              <li key={effectIndex} className="flex items-start gap-1">
                                <span className="text-yellow-400 mt-0.5">•</span>
                                <span>{effect}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
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
