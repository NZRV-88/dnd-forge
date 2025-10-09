import React, { useState } from 'react';
import { getBackpackItems, getItemDetails, canEquipItem, isItemEquipped } from "@/utils/equipmentUtils";
import { formatCost } from "@/utils/itemUtils";
import { calculateTotalWeight, calculateMaxCarryWeight, isOverloaded } from "@/utils/weightUtils";
import { calculatePurchaseCost } from "@/utils/currencyUtils";
import DynamicFrame from "@/components/ui/DynamicFrame";
import { ItemDetailsSidebar } from "@/components/characterList/ItemDetailsSidebar";
import { Coins, Package, Plus, Trash2 } from "lucide-react";

interface InventoryTabProps {
  characterData: any;
  equipped: any;
  onUpdateEquipment?: (newEquipment: any[]) => void;
  onUpdateCurrency?: (newCurrency: any) => void;
  frameColor: string;
  getFrameColor: (color: string) => string;
  hasMagicWeaponMastery: (itemDetails: any) => boolean;
  translateAbility: (ability: string) => string;
}

export default function InventoryTab({
  characterData,
  equipped,
  onUpdateEquipment,
  onUpdateCurrency,
  frameColor,
  getFrameColor,
  hasMagicWeaponMastery,
  translateAbility
}: InventoryTabProps) {
  
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isItemDetailsOpen, setIsItemDetailsOpen] = useState(false);
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
  const [loadingPurchase, setLoadingPurchase] = useState<Set<string>>(new Set());

  // Получаем предметы из рюкзака
  const backpackItems = getBackpackItems(characterData);
  
  // Рассчитываем вес
  const currentWeight = calculateTotalWeight(characterData);
  const maxWeight = calculateMaxCarryWeight(characterData);
  const isOverloadedFlag = isOverloaded(currentWeight);

  // Получаем количество предмета
  const getQuantityForItem = (itemKey: string): number => {
    return itemQuantities[itemKey] || 1;
  };

  // Обновляем количество предмета
  const updateItemQuantity = (itemKey: string, quantity: number) => {
    setItemQuantities(prev => ({
      ...prev,
      [itemKey]: Math.max(1, quantity)
    }));
  };

  // Увеличиваем количество
  const incrementQuantity = (itemKey: string) => {
    updateItemQuantity(itemKey, getQuantityForItem(itemKey) + 1);
  };

  // Уменьшаем количество
  const decrementQuantity = (itemKey: string) => {
    updateItemQuantity(itemKey, getQuantityForItem(itemKey) - 1);
  };

  // Открываем детали предмета
  const openItemDetails = (item: any) => {
    setSelectedItem(item);
    setIsItemDetailsOpen(true);
  };

  // Закрываем детали предмета
  const closeItemDetails = () => {
    setIsItemDetailsOpen(false);
    setSelectedItem(null);
  };

  // Удаляем предмет
  const handleDeleteItem = async (itemName: string) => {
    if (!onUpdateEquipment || !characterData?.equipment) return;
    
    const newEquipment = characterData.equipment.filter((item: any) => {
      const itemNameToCheck = typeof item === 'string' ? item : item.name;
      return itemNameToCheck !== itemName;
    });
    
    onUpdateEquipment(newEquipment);
  };

  // Покупаем предмет
  const handlePurchaseItem = async (item: any, quantity: number) => {
    // Логика покупки предмета
    console.log('Purchasing item:', item, 'quantity:', quantity);
  };

  // Добавляем предмет с количеством
  const handleAddItemWithQuantity = async (item: any, quantity: number) => {
    // Логика добавления предмета
    console.log('Adding item:', item, 'quantity:', quantity);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Заголовок */}
      <div className="flex items-center gap-2 mb-4">
        <Package className="w-5 h-5" style={{ color: getFrameColor(frameColor) }} />
        <h2 className="text-xl font-bold text-gray-100">Инвентарь</h2>
      </div>

      {/* Информация о весе */}
      <div className="mb-4">
        <DynamicFrame frameType="actions" className="w-full">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">Вес:</span>
                <span className={`font-semibold ${isOverloadedFlag ? 'text-red-400' : 'text-gray-200'}`}>
                  {currentWeight.toFixed(1)} / {maxWeight.toFixed(1)} фнт.
                </span>
              </div>
              {isOverloadedFlag && (
                <span className="text-red-400 text-sm font-medium">Перегружен!</span>
              )}
            </div>
          </div>
        </DynamicFrame>
      </div>

      {/* Рюкзак */}
      <div className="flex-1 overflow-y-auto">
        <DynamicFrame frameType="actions" className="w-full">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-200 mb-3">Рюкзак</h3>
            
            {backpackItems.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Рюкзак пуст</p>
              </div>
            ) : (
              <div className="space-y-2">
                {backpackItems.map((item, index) => {
                  const itemDetails = getItemDetails(item.name, characterData);
                  const canEquip = canEquipItem(item.name, characterData);
                  const isEquipped = isItemEquipped(item.name, characterData);
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openItemDetails(item)}
                            className="text-left hover:text-blue-400 transition-colors"
                          >
                            <div className="font-medium text-gray-200">{item.name}</div>
                            <div className="text-sm text-gray-400">{item.category}</div>
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span>Вес: {item.weight} фнт.</span>
                          <span>Стоимость: {formatCost(item.cost)}</span>
                          {canEquip && (
                            <span className={`px-2 py-1 rounded text-xs ${
                              isEquipped ? 'bg-green-600 text-green-200' : 'bg-gray-600 text-gray-300'
                            }`}>
                              {isEquipped ? 'Экипирован' : 'Можно экипировать'}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Количество */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => decrementQuantity(item.name)}
                            disabled={getQuantityForItem(item.name) <= 1}
                            className="w-6 h-6 flex items-center justify-center text-white rounded transition-colors hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold"
                            style={{ backgroundColor: getFrameColor(frameColor) }}
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={getQuantityForItem(item.name)}
                            onChange={(e) => updateItemQuantity(item.name, parseInt(e.target.value) || 1)}
                            className="w-12 px-1 py-1 text-center text-gray-200 bg-neutral-800 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                          />
                          <button
                            onClick={() => incrementQuantity(item.name)}
                            className="w-6 h-6 flex items-center justify-center text-white rounded transition-colors hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold"
                            style={{ backgroundColor: getFrameColor(frameColor) }}
                          >
                            +
                          </button>
                        </div>
                        
                        {/* Кнопки действий */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              const quantity = getQuantityForItem(item.name);
                              handlePurchaseItem(itemDetails, quantity);
                            }}
                            disabled={loadingPurchase.has(`${itemDetails?.itemType}-${itemDetails?.key}`)}
                            className="h-6 w-16 flex items-center justify-center text-white rounded transition-colors hover:bg-opacity-20 disabled:opacity-50 disabled:cursor-not-allowed text-xs border"
                            style={{
                              borderColor: getFrameColor(frameColor),
                              '--hover-bg': getFrameColor(frameColor) + '20'
                            } as any}
                          >
                            {loadingPurchase.has(`${itemDetails?.itemType}-${itemDetails?.key}`) ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              'КУПИТЬ'
                            )}
                          </button>
                          
                          <button
                            onClick={() => {
                              const quantity = getQuantityForItem(item.name);
                              handleAddItemWithQuantity(itemDetails, quantity);
                            }}
                            disabled={loadingItems.has(`${itemDetails?.itemType}-${itemDetails?.key}`)}
                            className="h-6 w-20 flex items-center justify-center text-white rounded transition-colors hover:bg-opacity-20 disabled:opacity-50 disabled:cursor-not-allowed text-xs border"
                            style={{
                              borderColor: getFrameColor(frameColor),
                              '--hover-bg': getFrameColor(frameColor) + '20'
                            } as any}
                          >
                            {loadingItems.has(`${itemDetails?.itemType}-${itemDetails?.key}`) ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              'ДОБАВИТЬ'
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleDeleteItem(item.name)}
                            className="h-6 w-6 flex items-center justify-center text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DynamicFrame>
      </div>

      {/* Сайдбар с деталями предмета */}
      {isItemDetailsOpen && selectedItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end"
          onClick={closeItemDetails}
        >
          <div 
            className="w-full max-w-md bg-neutral-900 h-full overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-100">
                {selectedItem.name}
              </h2>
              <button
                onClick={closeItemDetails}
                className="text-gray-400 hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            {(() => {
              const itemDetails = getItemDetails(selectedItem.name, characterData);
              if (!itemDetails) {
                return (
                  <div className="text-gray-400">
                    <div className="text-gray-300 mb-2">
                      <span className="font-medium">Категория:</span> {selectedItem.category}
                    </div>
                    <div className="text-gray-300 mb-2">
                      <span className="font-medium">Стоимость:</span> {selectedItem.cost}
                    </div>
                    <div className="text-gray-300">
                      <span className="font-medium">Вес:</span> {selectedItem.weight} фнт.
                    </div>
                  </div>
                );
              }

              return (
                <div className="space-y-3 text-xs">
                  <ItemDetailsSidebar
                    itemDetails={itemDetails}
                    characterData={characterData}
                    hasMagicWeaponMastery={hasMagicWeaponMastery}
                    translateAbility={translateAbility}
                    getFrameColor={getFrameColor}
                    frameColor={frameColor}
                  />

                  {/* Блок количества и добавления */}
                  <div className="mt-4 pt-3 border-t border-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">Количество:</span>
                      <button
                        onClick={() => decrementQuantity(selectedItem.name)}
                        disabled={getQuantityForItem(selectedItem.name) <= 1}
                        className="w-6 h-6 flex items-center justify-center text-white rounded transition-colors hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-bold"
                        style={{ backgroundColor: getFrameColor(frameColor) }}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={getQuantityForItem(selectedItem.name)}
                        onChange={(e) => updateItemQuantity(selectedItem.name, parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 text-center text-gray-200 bg-neutral-800 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => incrementQuantity(selectedItem.name)}
                        className="w-6 h-6 flex items-center justify-center text-white rounded transition-colors hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-bold"
                        style={{ backgroundColor: getFrameColor(frameColor) }}
                      >
                        +
                      </button>
                    </div>

                    {/* Стоимость покупки */}
                    <div className="mt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">Стоимость покупки:</span>
                        <span className="text-gray-200 font-semibold">
                          {calculatePurchaseCost(itemDetails, getQuantityForItem(selectedItem.name))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
