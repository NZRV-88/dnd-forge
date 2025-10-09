import React from 'react';
import { getWeaponMasteryByKey } from "@/data/items/weapon-mastery";
import { getWeaponPropertyByName } from "@/data/items/weapons";

interface ItemDetailsSidebarProps {
  itemDetails: any;
  characterData: any;
  hasMagicWeaponMastery: (itemDetails: any) => boolean;
  translateAbility: (ability: string) => string;
  getFrameColor: (color: string) => string;
  frameColor: string;
}

export function ItemDetailsSidebar({
  itemDetails,
  characterData,
  hasMagicWeaponMastery,
  translateAbility,
  getFrameColor,
  frameColor
}: ItemDetailsSidebarProps) {
  if (!itemDetails) {
    return (
      <div className="text-gray-400">
        Информация о предмете не найдена
      </div>
    );
  }

  return (
    <div className="space-y-3 text-xs">
      {/* Категория в самом верху */}
      <div className="text-gray-400 mb-2">
        {itemDetails.category}
      </div>

      {/* Источник вверху */}
      {(itemDetails as any).source && (
        <div className="text-gray-400 mb-2">
          <span className="font-medium text-gray-200">Источник:</span> {(itemDetails as any).source}
        </div>
      )}
      
      <div className="space-y-2">
        {/* Для оружия показываем специальные параметры */}
        {itemDetails.itemType === 'weapon' && (
          <>
            <div className="text-gray-400">
              <span className="font-medium text-gray-200">Владение:</span> {(() => {
                // Проверяем владение оружием по английским ключам
                const weaponCategory = itemDetails.category === 'Простое оружие ближнего боя' || 
                                      itemDetails.category === 'Простое оружие дальнего боя' ? 'simple' :
                                      itemDetails.category === 'Воинское оружие ближнего боя' || 
                                      itemDetails.category === 'Воинское оружие дальнего боя' ? 'martial' : 
                                      itemDetails.category;
                const hasWeaponProficiency = characterData?.weapons?.includes(weaponCategory) || 
                                           characterData?.weapons?.includes(itemDetails.key);
                return hasWeaponProficiency ? 'Да' : 'Нет';
              })()}
            </div>
            <div className="text-gray-400">
              <span className="font-medium text-gray-200">Тип атаки:</span> {(itemDetails as any).type === 'ranged' ? 'Дальний бой' : 'Ближний бой'}
            </div>
            <div className="text-gray-400">
              <span className="font-medium text-gray-200">Дальность:</span> {(itemDetails as any).range || '5 фт'}
            </div>
            <div className="text-gray-400">
              <span className="font-medium text-gray-200">Урон:</span> {(itemDetails as any).damage}
            </div>
            <div className="text-gray-400">
              <span className="font-medium text-gray-200">Тип урона:</span> {(itemDetails as any).damageTypeTranslated}
            </div>
            {(itemDetails as any).bonusAttack && (
              <div className="text-gray-400">
                <span className="font-medium text-gray-200">Бонус к атаке:</span> +{(itemDetails as any).bonusAttack}
              </div>
            )}
            {(itemDetails as any).bonusDamage && (
              <div className="text-gray-400">
                <span className="font-medium text-gray-200">Бонус к урону:</span> +{(itemDetails as any).bonusDamage}
              </div>
            )}
            {itemDetails.weight !== undefined && (
              <div className="text-gray-400">
                <span className="font-medium text-gray-200">Вес:</span> {itemDetails.weight} фнт.
              </div>
            )}
            {itemDetails.cost && (
              <div className="text-gray-400">
                <span className="font-medium text-gray-200">Стоимость:</span> {itemDetails.cost}
              </div>
            )}
            {(itemDetails as any).properties && (itemDetails as any).properties.length > 0 && (
              <div className="text-gray-400">
                <span className="font-medium text-gray-200">Свойства:</span> {(itemDetails as any).properties.join(', ')}
              </div>
            )}
            {hasMagicWeaponMastery(itemDetails) && (
              <div className="text-gray-400">
                <span className="font-medium text-gray-200">Мастерство:</span> {getWeaponMasteryByKey((itemDetails as any).mastery)?.name || (itemDetails as any).mastery}
              </div>
            )}
          </>
        )}

        {/* Для доспехов */}
        {itemDetails.itemType === 'armor' && (
          <>
            <div className="text-gray-400">
              <span className="font-medium text-gray-200">Владение:</span> {(() => {
                // Проверяем владение доспехами по категориям
                const armorCategory = itemDetails.category === 'Лёгкий доспех' ? 'light' :
                                     itemDetails.category === 'Средний доспех' ? 'medium' :
                                     itemDetails.category === 'Тяжёлый доспех' ? 'heavy' :
                                     itemDetails.category === 'Щит' ? 'shield' :
                                     itemDetails.category;
                const hasArmorProficiency = characterData?.armors?.includes(armorCategory) ||
                                           characterData?.armors?.includes(itemDetails.key);
                return hasArmorProficiency ? 'Да' : 'Нет';
              })()}
            </div>
            <div className="text-gray-400">
              <span className="font-medium text-gray-200">Класс брони:</span> {(itemDetails as any).baseAC}
            </div>
            {itemDetails.weight !== undefined && (
              <div className="text-gray-400">
                <span className="font-medium text-gray-200">Вес:</span> {itemDetails.weight} фнт.
              </div>
            )}
            {itemDetails.cost && (
              <div className="text-gray-400">
                <span className="font-medium text-gray-200">Стоимость:</span> {itemDetails.cost}
              </div>
            )}
            {(itemDetails as any).disadvantageStealth && (
              <div className="text-gray-400">
                <span className="font-medium text-gray-200">Помеха:</span> Помеха к Скрытности
              </div>
            )}
            {(itemDetails as any).requirements && (itemDetails as any).requirements.strength && (
              <div className="text-gray-400">
                <span className="font-medium text-gray-200">Требования:</span> Сила {(itemDetails as any).requirements.strength}
              </div>
            )}
          </>
        )}

        {/* Для инструментов */}
        {itemDetails.itemType === 'tool' && (itemDetails as any).ability && (
          <>
            <div className="text-gray-400">
              <span className="font-medium text-gray-200">Характеристика:</span> {translateAbility((itemDetails as any).ability)}
            </div>
            {(itemDetails as any).utilize && (
              <div className="text-gray-400">
                <span className="font-medium text-gray-200">Использование:</span> {(itemDetails as any).utilize}
              </div>
            )}
          </>
        )}

        {/* Стоимость и вес для инструментов и других предметов (кроме оружия и доспехов) */}
        {itemDetails.itemType !== 'weapon' && itemDetails.itemType !== 'armor' && (
          <>
            {itemDetails.weight !== undefined && (
              <div className="text-gray-400">
                <span className="font-medium text-gray-200">Вес:</span> {itemDetails.weight} фнт.
              </div>
            )}
            {itemDetails.cost && (
              <div className="text-gray-400">
                <span className="font-medium text-gray-200">Стоимость:</span> {itemDetails.cost}
              </div>
            )}
          </>
        )}
      </div>

      {/* Описание */}
      {(itemDetails as any).description && (
        <div className="text-gray-400 mt-3 pt-3 border-t border-gray-700">
          <div className="font-medium text-gray-200 mb-2">Описание</div>
          <div className="whitespace-pre-line">
            {(itemDetails as any).description.split('\n').map((paragraph: string, index: number) => {
              // Обрабатываем курсив (текст между * *)
              const processItalic = (text: string) => {
                return text.split(/(\*[^*]+\*)/g).map((part, i) => {
                  if (part.startsWith('*') && part.endsWith('*')) {
                    return (
                      <em key={i} className="italic font-semibold">
                        {part.slice(1, -1)}
                      </em>
                    );
                  }
                  return part;
                });
              };

              // Определяем отступы по количеству пробелов в начале строки
              const indent = paragraph.match(/^(\s*)/)?.[1]?.length || 0;
              const indentClass = indent > 0 ? `ml-${Math.min(indent * 2, 16)}` : '';

              return (
                <div key={index} className={`${indentClass} ${index > 0 ? 'mt-1' : ''}`}>
                  {processItalic(paragraph.trim())}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Описания свойств оружия */}
      {itemDetails.itemType === 'weapon' && (itemDetails as any).properties && (itemDetails as any).properties.length > 0 && (
        <div className="text-gray-400 mt-3 pt-3 border-t border-gray-700">
          <div className="font-medium text-gray-200 mb-2">Описания свойств:</div>
          <div className="space-y-2">
            {(itemDetails as any).properties.map((property: string) => {
              const propertyInfo = getWeaponPropertyByName(property);
              if (!propertyInfo) {
                return (
                  <div key={property} className="text-xs text-red-400">
                    Свойство не найдено: {property}
                  </div>
                );
              }
              return (
                <div key={property} className="text-xs">
                  <div className="font-medium text-gray-200">{property}</div>
                  <div className="text-gray-400 mt-1">{propertyInfo.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Мастерство оружия */}
      {itemDetails.itemType === 'weapon' && hasMagicWeaponMastery(itemDetails) && (
        <div className="text-gray-400 mt-3 pt-3 border-t border-gray-700">
          <div className="font-medium text-gray-200 mb-2 flex items-center">
            <span 
              className="mr-2 text-lg"
              style={{ color: getFrameColor(frameColor) }}
            >
              ★
            </span>
            Мастерство: {getWeaponMasteryByKey((itemDetails as any).mastery)?.name || (itemDetails as any).mastery}
          </div>
          <div className="text-xs text-gray-400">
            {getWeaponMasteryByKey((itemDetails as any).mastery)?.desc || 'Описание мастерства не найдено'}
          </div>
        </div>
      )}
    </div>
  );
}