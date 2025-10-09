import { useState, useCallback } from 'react';
import { getAllCharacterSpells, getAvailableSpells, getFilteredSpells, getAvailableSpellLevels, getSpellSlotsForLevel, hasAvailableSlots, getMaxPreparedSpells } from "@/utils/spellUtils";
import { toast } from "@/hooks/use-toast";

interface UseSpellManagementProps {
  characterData: any;
  draft: any;
  setChosenSpells: (updater: (prev: any) => any) => void;
  saveToSupabase: () => void;
}

export const useSpellManagement = ({
  characterData,
  draft,
  setChosenSpells,
  saveToSupabase
}: UseSpellManagementProps) => {
  
  const [expandedSpells, setExpandedSpells] = useState<Set<number>>(new Set());
  const [addSpellSearch, setAddSpellSearch] = useState('');
  const [addSpellLevelFilter, setAddSpellLevelFilter] = useState<number | "all">("all");
  const [isAddSpellsOpen, setIsAddSpellsOpen] = useState(false);
  const [isPreparedSpellsOpen, setIsPreparedSpellsOpen] = useState(false);
  const [isLearnSpellsOpen, setIsLearnSpellsOpen] = useState(false);

  // Получаем все заклинания персонажа
  const allCharacterSpells = getAllCharacterSpells(characterData, draft);
  
  // Получаем доступные заклинания класса
  const availableSpells = getAvailableSpells(characterData);
  
  // Получаем подготовленные заклинания
  const preparedSpells = allCharacterSpells.filter(spell => spell.isPrepared);
  
  // Получаем изученные заклинания
  const learnedSpells = allCharacterSpells.filter(spell => spell.isLearned);
  
  // Получаем максимальное количество подготовленных заклинаний
  const maxPreparedSpells = getMaxPreparedSpells(characterData);
  
  // Получаем доступные уровни заклинаний
  const availableSpellLevels = getAvailableSpellLevels(availableSpells);
  
  // Фильтруем заклинания для добавления
  const filteredSpells = getFilteredSpells(availableSpells, addSpellSearch, addSpellLevelFilter);

  // Переключаем состояние карточки заклинания
  const toggleSpellExpansion = useCallback((index: number) => {
    setExpandedSpells(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  // Добавляем заклинание
  const addSpell = useCallback((spellKey: string) => {
    if (preparedSpells.length >= maxPreparedSpells) {
      toast({
        title: "Лимит достигнут",
        description: `Максимальное количество подготовленных заклинаний: ${maxPreparedSpells}`,
        variant: "destructive"
      });
      return;
    }
    
    setChosenSpells(prev => ({
      ...prev,
      [characterData.class.key]: [...(prev[characterData.class.key] || []), spellKey]
    }));
    
    saveToSupabase();
    
    toast({
      title: "Заклинание добавлено",
      description: "Заклинание было добавлено в список подготовленных",
    });
  }, [preparedSpells.length, maxPreparedSpells, setChosenSpells, characterData.class.key, saveToSupabase]);

  // Удаляем заклинание
  const removeSpell = useCallback((spellKey: string) => {
    setChosenSpells(prev => ({
      ...prev,
      [characterData.class.key]: (prev[characterData.class.key] || []).filter((key: string) => key !== spellKey)
    }));
    
    saveToSupabase();
    
    toast({
      title: "Заклинание удалено",
      description: "Заклинание было удалено из списка подготовленных",
    });
  }, [setChosenSpells, characterData.class.key, saveToSupabase]);

  // Получаем слоты заклинаний для уровня
  const getSpellSlots = useCallback((spellLevel: number) => {
    return getSpellSlotsForLevel(spellLevel, characterData);
  }, [characterData]);

  // Проверяем доступность слотов
  const hasSlots = useCallback((spellLevel: number) => {
    return hasAvailableSlots(spellLevel, characterData);
  }, [characterData]);

  // Используем слот заклинания
  const useSpellSlot = useCallback((spellLevel: number) => {
    if (!hasSlots(spellLevel)) {
      toast({
        title: "Нет доступных слотов",
        description: `Нет доступных слотов для заклинаний ${spellLevel} уровня`,
        variant: "destructive"
      });
      return;
    }
    
    // Здесь должна быть логика использования слота
    console.log('Using spell slot for level:', spellLevel);
    
    toast({
      title: "Слот использован",
      description: `Слот заклинания ${spellLevel} уровня был использован`,
    });
  }, [hasSlots]);

  // Освобождаем слот заклинания
  const freeSpellSlot = useCallback((spellLevel: number) => {
    // Здесь должна быть логика освобождения слота
    console.log('Freeing spell slot for level:', spellLevel);
    
    toast({
      title: "Слот освобожден",
      description: `Слот заклинания ${spellLevel} уровня был освобожден`,
    });
  }, []);

  return {
    // Состояние
    expandedSpells,
    addSpellSearch,
    addSpellLevelFilter,
    isAddSpellsOpen,
    isPreparedSpellsOpen,
    isLearnSpellsOpen,
    
    // Данные
    allCharacterSpells,
    availableSpells,
    preparedSpells,
    learnedSpells,
    maxPreparedSpells,
    availableSpellLevels,
    filteredSpells,
    
    // Функции
    toggleSpellExpansion,
    addSpell,
    removeSpell,
    getSpellSlots,
    hasSlots,
    useSpellSlot,
    freeSpellSlot,
    
    // Setters
    setAddSpellSearch,
    setAddSpellLevelFilter,
    setIsAddSpellsOpen,
    setIsPreparedSpellsOpen,
    setIsLearnSpellsOpen
  };
};
