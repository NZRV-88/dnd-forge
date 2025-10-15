import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Shield, ChevronDown, Heart, Zap, Crown, Sword, Sparkles, User, Sun } from 'lucide-react';
import { useCharacter } from '@/store/character';
import { getFrameColor } from '@/utils/colorUtils';

interface AuraManagerProps {
  level: number;
  frameColor?: string;
  subclass?: string;
  draft?: any;
}

export default function AuraManager({ level, frameColor = 'blue', subclass, draft }: AuraManagerProps) {
  // Убираем использование useCharacter, так как draft передается как проп
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Ауры доступны с 6 уровня
  if (level < 6) {
    return null;
  }

  // Определяем доступные ауры в зависимости от уровня и подкласса
  const availableAuras = [];
  
  // Базовые ауры для всех паладинов
  if (level >= 6) {
    availableAuras.push({
      name: 'Аура защиты',
      level: 6,
      radius: level >= 18 ? 30 : 10,
      description: 'Вы и ваши союзники в области действия ауры получаете бонус к спасброскам, равный вашему модификатору Харизмы (минимальный бонус +1).',
        icon: Shield,
      type: 'base'
    });
  }
  
  if (level >= 10) {
    availableAuras.push({
      name: 'Аура отваги',
      level: 10,
      radius: level >= 18 ? 30 : 10,
      description: 'Вы и ваши союзники в вашей Ауре Защиты обладаете Иммунитетом к состоянию Испуганный. Если союзник с состоянием Испуганный входит в ауру, то это состояние не имеет на него эффекта, пока он там находится.',
      icon: Heart,
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
        icon: Zap,
        type: 'subclass'
      });
    }
    
    if (level >= 20) {
      availableAuras.push({
        name: 'Древний чемпион',
        level: 20,
        radius: 30,
        description: 'Бонусным действием вы можете усилить свою Ауру защиты первобытной силой, дарующей описанные ниже преимущества на 1 минуту или пока вы не окончите их (действий не требуется).',
        icon: Crown,
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

  if (subclass === 'oath-of-devotion') {
    if (level >= 7) {
      availableAuras.push({
        name: 'Аура преданности',
        level: 7,
        radius: level >= 18 ? 30 : 10,
        description: 'Вы и ваши союзники в вашей Ауре защиты обладаете Иммунитетом к состоянию Очарованный. Если союзник с состоянием Очарованный входит в ауру, то это состояние не оказывает на него эффекта, пока он там находится.',
        icon: Sparkles,
        type: 'subclass'
      });
    }
    
    if (level >= 20) {
      availableAuras.push({
        name: 'Святой нимб',
        level: 20,
        radius: 30,
        description: 'Бонусным действием вы можете усилить свою Ауру защиты святой силой, дарующей описанные ниже преимущества на 10 минут или пока вы не окончите их (действий не требуется).',
        icon: Sun,
        type: 'subclass',
        special: true,
        effects: [
          'Священный оберег: Вы совершаете с Преимуществом спасброски, которые вас заставляют делать Исчадия и Нежить.',
          'Священный урон: Каждый раз, когда враг начинает свой ход в ауре, это существо получает урон Излучением, равный вашему модификатору Харизмы + ваш Бонус владения.',
          'Солнечный свет: Аура наполнена Ярким светом; этот свет — солнечный свет.'
        ]
      });
    }
  }

  if (subclass === 'oath-of-glory') {
    if (level >= 7) {
      availableAuras.push({
        name: 'Аура рвения',
        level: 7,
        radius: level >= 18 ? 30 : 10,
        description: 'Ваша Скорость увеличивается на 10 футов. Кроме того, каждый раз, когда ваш союзник начинает ход в вашей Ауре защиты или впервые за ход входит в неё, его Скорость увеличивается на 10 футов до конца его следующего хода.',
        icon: User,
        type: 'subclass'
      });
    }
  }

  if (subclass === 'oath-of-vengeance') {
    if (level >= 20) {
      availableAuras.push({
        name: 'Ангел отмщения',
        level: 20,
        radius: 30,
        description: 'Бонусным действием вы получаете описанные ниже преимущества на 10 минут или пока вы не окончите их (действий не требуется). Как только вы использовали это умение, не можете сделать это вновь, пока не завершите Долгий отдых.',
        icon: Sword,
        type: 'subclass',
        special: true,
        effects: [
          'Ужасающая аура: Каждый раз, когда враг начинает свой ход в вашей Ауре защиты, он должен преуспеть в спасброске Мудрости, иначе получит состояние Испуганный на 1 минуту или пока не получит урон.',
          'Преимущество на атаки: Броски атаки по существу с состоянием Испуганный совершаются с Преимуществом.'
        ]
      });
    }
  }

  // Сортируем ауры по уровню получения
  availableAuras.sort((a, b) => a.level - b.level);

  if (availableAuras.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="border-b border-gray-600 bg-neutral-900 shadow-inner shadow-sm">
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <div className="w-full p-3 bg-neutral-800 hover:bg-neutral-700 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-start">
                  <span className="text-white font-medium">Аура паладина</span>
                  <span className="text-xs text-gray-400 mt-1">
                    {level >= 18 ? 'Радиус 30 футов' : level >= 6 ? 'Радиус 10 футов' : 'Недоступна'}
                  </span>
                </div>
                <ChevronDown 
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`} 
                />
              </div>
            </div>
          </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="p-4 bg-neutral-900">
            {/* Описание способности */}
            <div className="mb-4">
              <p className="text-sm text-gray-300 leading-relaxed">
                Вы излучаете невидимую защитную ауру, исходящую от вас {level >= 18 ? '30' : '10'}-футовой Эманацией. 
                Аура неактивна, пока у вас есть состояние Недееспособный.
              </p>
              <p className="text-sm text-gray-300 leading-relaxed mt-2">
                Каждое существо может получать бонус только от одной Ауры одновременно; 
                если на него действует несколько таких аур, существо выбирает, какая из них оказывает на него эффект.
              </p>
            </div>

            {/* Доступные ауры */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-200 mb-2">Доступные ауры:</h4>
              <div className="space-y-3">
              {availableAuras.map((aura, index) => (
                <div key={index} className="bg-neutral-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <aura.icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      aura.name === 'Аура защиты' ? 'text-blue-400' :
                      aura.name === 'Аура отваги' ? 'text-red-400' :
                      aura.name === 'Аура опеки' ? 'text-green-400' :
                      aura.name === 'Древний чемпион' ? 'text-purple-400' :
                      aura.name === 'Аура преданности' ? 'text-yellow-400' :
                      aura.name === 'Святой нимб' ? 'text-orange-400' :
                      aura.name === 'Аура рвения' ? 'text-cyan-400' :
                      aura.name === 'Ангел отмщения' ? 'text-red-500' :
                      'text-blue-400'
                    }`} />
                    <div>
                      <h5 className="text-sm font-medium text-white">{aura.name}</h5>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">(Уровень {aura.level})</span>
                        {aura.type === 'subclass' && (
                          <span className="text-xs font-medium" style={{ color: getFrameColor(frameColor) }}>Подкласс</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{aura.description}</p>
                      
                      {/* Специальные эффекты для капстоунов */}
                      {aura.special && aura.effects && (
                        <div className="mt-2">
                          <h6 className="text-xs font-medium mb-1" style={{ color: getFrameColor(frameColor) }}>Особые эффекты:</h6>
                          <ul className="text-xs text-gray-400 space-y-1">
                            {aura.effects.map((effect, effectIndex) => (
                              <li key={effectIndex} className="flex items-start gap-1">
                                <span className="mt-0.5" style={{ color: getFrameColor(frameColor) }}>•</span>
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
            </div>

          </div>
        </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
