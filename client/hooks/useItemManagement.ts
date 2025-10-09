import { useState, useCallback } from 'react';
import { getItemDetails, canEquipItem, isItemEquipped, isVersatileWeapon } from "@/utils/equipmentUtils";
import { toast } from "@/hooks/use-toast";

interface UseItemManagementProps {
  characterData: any;
  equipped: any;
  onUpdateEquipped?: (newEquipped: any) => void;
  onUpdateEquipment?: (newEquipment: any[]) => void;
}

export const useItemManagement = ({
  characterData,
  equipped,
  onUpdateEquipped,
  onUpdateEquipment
}: UseItemManagementProps) => {
  
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());

  // Проверяем, может ли предмет быть экипирован
  const canEquip = useCallback((itemName: string) => {
    return canEquipItem(itemName, characterData);
  }, [characterData]);

  // Проверяем, экипирован ли предмет
  const isEquipped = useCallback((itemName: string) => {
    return isItemEquipped(itemName, characterData);
  }, [characterData]);

  // Проверяем, является ли предмет универсальным оружием
  const isVersatile = useCallback((itemName: string) => {
    return isVersatileWeapon(itemName);
  }, []);

  // Экипируем предмет
  const equipItem = useCallback(async (itemName: string, slot?: string) => {
    if (!onUpdateEquipped || !canEquip(itemName)) return;
    
    const itemKey = `equip-${itemName}`;
    setLoadingItems(prev => new Set(prev).add(itemKey));
    
    try {
      const itemDetails = getItemDetails(itemName, characterData);
      if (!itemDetails) {
        throw new Error('Предмет не найден');
      }
      
      // Здесь должна быть логика экипировки предмета
      console.log('Equipping item:', itemName, 'slot:', slot);
      
      toast({
        title: "Предмет экипирован",
        description: `${itemName} был экипирован`,
      });
    } catch (error) {
      toast({
        title: "Ошибка экипировки",
        description: "Не удалось экипировать предмет",
        variant: "destructive"
      });
    } finally {
      setLoadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  }, [onUpdateEquipped, canEquip, characterData]);

  // Снимаем предмет
  const unequipItem = useCallback(async (itemName: string) => {
    if (!onUpdateEquipped) return;
    
    const itemKey = `unequip-${itemName}`;
    setLoadingItems(prev => new Set(prev).add(itemKey));
    
    try {
      // Здесь должна быть логика снятия предмета
      console.log('Unequipping item:', itemName);
      
      toast({
        title: "Предмет снят",
        description: `${itemName} был снят`,
      });
    } catch (error) {
      toast({
        title: "Ошибка снятия",
        description: "Не удалось снять предмет",
        variant: "destructive"
      });
    } finally {
      setLoadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  }, [onUpdateEquipped]);

  // Переключаем состояние экипировки предмета
  const toggleItemEquipped = useCallback(async (itemName: string) => {
    if (isEquipped(itemName)) {
      await unequipItem(itemName);
    } else {
      await equipItem(itemName);
    }
  }, [isEquipped, unequipItem, equipItem]);

  // Переключаем режим универсального оружия
  const toggleVersatileMode = useCallback(async (itemName: string) => {
    if (!isVersatile(itemName)) return;
    
    const itemKey = `versatile-${itemName}`;
    setLoadingItems(prev => new Set(prev).add(itemKey));
    
    try {
      // Здесь должна быть логика переключения режима универсального оружия
      console.log('Toggling versatile mode for item:', itemName);
      
      toast({
        title: "Режим изменен",
        description: `Режим ${itemName} был изменен`,
      });
    } catch (error) {
      toast({
        title: "Ошибка изменения режима",
        description: "Не удалось изменить режим оружия",
        variant: "destructive"
      });
    } finally {
      setLoadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  }, [isVersatile]);

  // Получаем слоты предмета
  const getItemSlots = useCallback((itemName: string, versatileMode?: boolean) => {
    const itemDetails = getItemDetails(itemName, characterData);
    if (!itemDetails) return 0;
    
    // Здесь должна быть логика определения слотов предмета
    return 1; // По умолчанию 1 слот
  }, [characterData]);

  // Получаем использованные слоты
  const getUsedSlots = useCallback((set: Array<{name: string, slots: number, isVersatile?: boolean, versatileMode?: boolean}>) => {
    return set.reduce((total, item) => {
      if (item.isVersatile && item.versatileMode) {
        return total + (item.slots * 2); // Универсальное оружие в двуручном режиме занимает 2 слота
      }
      return total + item.slots;
    }, 0);
  }, []);

  // Получаем свободные слоты
  const getFreeSlots = useCallback((set: Array<{name: string, slots: number, isVersatile?: boolean, versatileMode?: boolean}>) => {
    const maxSlots = 2; // Максимальное количество слотов оружия
    const usedSlots = getUsedSlots(set);
    return Math.max(0, maxSlots - usedSlots);
  }, [getUsedSlots]);

  return {
    // Состояние
    loadingItems,
    
    // Функции проверки
    canEquip,
    isEquipped,
    isVersatile,
    
    // Функции управления
    equipItem,
    unequipItem,
    toggleItemEquipped,
    toggleVersatileMode,
    
    // Функции слотов
    getItemSlots,
    getUsedSlots,
    getFreeSlots
  };
};
