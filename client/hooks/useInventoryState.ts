import { useState, useCallback } from 'react';
import { getBackpackItems, getItemDetails, canEquipItem, isItemEquipped } from "@/utils/equipmentUtils";
import { calculatePurchaseCost } from "@/utils/currencyUtils";
import { toast } from "@/hooks/use-toast";

interface UseInventoryStateProps {
  characterData: any;
  equipped: any;
  onUpdateEquipment?: (newEquipment: any[]) => void;
  onUpdateCurrency?: (newCurrency: any) => void;
}

export const useInventoryState = ({
  characterData,
  equipped,
  onUpdateEquipment,
  onUpdateCurrency
}: UseInventoryStateProps) => {
  
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isItemDetailsOpen, setIsItemDetailsOpen] = useState(false);
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
  const [loadingPurchase, setLoadingPurchase] = useState<Set<string>>(new Set());

  // Получаем предметы из рюкзака
  const backpackItems = getBackpackItems(characterData);

  // Получаем количество предмета
  const getQuantityForItem = useCallback((itemKey: string): number => {
    return itemQuantities[itemKey] || 1;
  }, [itemQuantities]);

  // Обновляем количество предмета
  const updateItemQuantity = useCallback((itemKey: string, quantity: number) => {
    setItemQuantities(prev => ({
      ...prev,
      [itemKey]: Math.max(1, quantity)
    }));
  }, []);

  // Увеличиваем количество
  const incrementQuantity = useCallback((itemKey: string) => {
    updateItemQuantity(itemKey, getQuantityForItem(itemKey) + 1);
  }, [updateItemQuantity, getQuantityForItem]);

  // Уменьшаем количество
  const decrementQuantity = useCallback((itemKey: string) => {
    updateItemQuantity(itemKey, getQuantityForItem(itemKey) - 1);
  }, [updateItemQuantity, getQuantityForItem]);

  // Открываем детали предмета
  const openItemDetails = useCallback((item: any) => {
    setSelectedItem(item);
    setIsItemDetailsOpen(true);
  }, []);

  // Закрываем детали предмета
  const closeItemDetails = useCallback(() => {
    setIsItemDetailsOpen(false);
    setSelectedItem(null);
  }, []);

  // Удаляем предмет
  const handleDeleteItem = useCallback(async (itemName: string) => {
    if (!onUpdateEquipment || !characterData?.equipment) return;
    
    const newEquipment = characterData.equipment.filter((item: any) => {
      const itemNameToCheck = typeof item === 'string' ? item : item.name;
      return itemNameToCheck !== itemName;
    });
    
    onUpdateEquipment(newEquipment);
    
    toast({
      title: "Предмет удален",
      description: `${itemName} был удален из инвентаря`,
    });
  }, [onUpdateEquipment, characterData?.equipment]);

  // Покупаем предмет
  const handlePurchaseItem = useCallback(async (item: any, quantity: number) => {
    if (!onUpdateCurrency || !characterData?.currency) return;
    
    const itemKey = `${item.itemType}-${item.key}`;
    setLoadingPurchase(prev => new Set(prev).add(itemKey));
    
    try {
      const costInCopper = calculatePurchaseCost(item, quantity);
      // Здесь должна быть логика покупки
      console.log('Purchasing item:', item, 'quantity:', quantity, 'cost:', costInCopper);
      
      toast({
        title: "Предмет куплен",
        description: `${item.name} (x${quantity}) был куплен`,
      });
    } catch (error) {
      toast({
        title: "Ошибка покупки",
        description: "Не удалось купить предмет",
        variant: "destructive"
      });
    } finally {
      setLoadingPurchase(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  }, [onUpdateCurrency, characterData?.currency]);

  // Добавляем предмет с количеством
  const handleAddItemWithQuantity = useCallback(async (item: any, quantity: number) => {
    if (!onUpdateEquipment) return;
    
    const itemKey = `${item.itemType}-${item.key}`;
    setLoadingItems(prev => new Set(prev).add(itemKey));
    
    try {
      // Здесь должна быть логика добавления предмета
      console.log('Adding item:', item, 'quantity:', quantity);
      
      toast({
        title: "Предмет добавлен",
        description: `${item.name} (x${quantity}) был добавлен в инвентарь`,
      });
    } catch (error) {
      toast({
        title: "Ошибка добавления",
        description: "Не удалось добавить предмет",
        variant: "destructive"
      });
    } finally {
      setLoadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  }, [onUpdateEquipment]);

  return {
    // Состояние
    selectedItem,
    isItemDetailsOpen,
    itemQuantities,
    loadingItems,
    loadingPurchase,
    backpackItems,
    
    // Функции
    getQuantityForItem,
    updateItemQuantity,
    incrementQuantity,
    decrementQuantity,
    openItemDetails,
    closeItemDetails,
    handleDeleteItem,
    handlePurchaseItem,
    handleAddItemWithQuantity
  };
};
