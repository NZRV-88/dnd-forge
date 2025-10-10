import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Star, ChevronDown } from 'lucide-react';
import { useCharacter } from '@/store/character';

interface RadiantStrikesManagerProps {
  level: number;
  frameColor?: string;
}

export default function RadiantStrikesManager({ level, frameColor = '#3B82F6' }: RadiantStrikesManagerProps) {
  const characterContext = useCharacter();
  
  if (!characterContext) {
    return null;
  }
  
  const { draft } = characterContext;
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Сияющие удары доступны с 11 уровня
  if (level < 11) {
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
                  <span className="text-white font-medium">Сияющие удары</span>
                  <span className="text-xs text-gray-400 mt-1">
                    Пассивная способность
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
                  Ваши удары теперь обладают сверхъестественной силой. Когда вы попадаете по цели броском атаки 
                  Рукопашным оружием или Безоружным ударом, цель получает 1к8 дополнительного урона Излучением.
                </p>
              </div>

              {/* Детали способности */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-200 mb-2">Механика способности:</h4>
                <div className="space-y-3">
                  <div className="bg-neutral-800 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h5 className="text-sm font-medium text-white">Дополнительный урон</h5>
                        <p className="text-xs text-gray-400 mt-1">
                          +1к8 урона Излучением при каждом успешном попадании рукопашным оружием или безоружным ударом
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-neutral-800 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h5 className="text-sm font-medium text-white">Автоматическое применение</h5>
                        <p className="text-xs text-gray-400 mt-1">
                          Эффект работает при каждом успешном попадании без дополнительных действий
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-neutral-800 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h5 className="text-sm font-medium text-white">Тип урона</h5>
                        <p className="text-xs text-gray-400 mt-1">
                          Излучение - не может быть заблокирован обычной броней или сопротивлением к физическому урону
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Важные замечания */}
              <div className="bg-neutral-800 rounded-lg p-3">
                <h5 className="text-sm font-medium text-white mb-2">Важные замечания:</h5>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Работает только с рукопашным оружием и безоружными ударами</li>
                  <li>• Не применяется к дальнобойному оружию</li>
                  <li>• Урон добавляется к каждому попаданию отдельно</li>
                  <li>• Эффект постоянный и не требует ресурсов</li>
                </ul>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
