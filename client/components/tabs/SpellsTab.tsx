import React, { useState } from 'react';
import { Spells } from "@/data/spells";
import { getAllCharacterSpells, getAvailableSpells, getFilteredSpells, getAvailableSpellLevels, getSpellSlotsForLevel, hasAvailableSlots, getMaxPreparedSpells } from "@/utils/spellUtils";
import DynamicFrame from "@/components/ui/DynamicFrame";
import { Wand, Search, Plus, Settings } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SpellsTabProps {
  characterData: any;
  draft: any;
  setChosenSpells: (updater: (prev: any) => any) => void;
  saveToSupabase: () => void;
  frameColor: string;
  getFrameColor: (color: string) => string;
}

export default function SpellsTab({
  characterData,
  draft,
  setChosenSpells,
  saveToSupabase,
  frameColor,
  getFrameColor
}: SpellsTabProps) {
  
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
  const toggleSpellExpansion = (index: number) => {
    setExpandedSpells(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Добавляем заклинание
  const addSpell = (spellKey: string) => {
    if (preparedSpells.length >= maxPreparedSpells) {
      return; // Достигнут лимит подготовленных заклинаний
    }
    
    setChosenSpells(prev => ({
      ...prev,
      [characterData.class.key]: [...(prev[characterData.class.key] || []), spellKey]
    }));
    
    saveToSupabase();
  };

  // Удаляем заклинание
  const removeSpell = (spellKey: string) => {
    setChosenSpells(prev => ({
      ...prev,
      [characterData.class.key]: (prev[characterData.class.key] || []).filter((key: string) => key !== spellKey)
    }));
    
    saveToSupabase();
  };

  // Получаем слоты заклинаний для уровня
  const getSpellSlots = (spellLevel: number) => {
    return getSpellSlotsForLevel(spellLevel, characterData);
  };

  // Проверяем доступность слотов
  const hasSlots = (spellLevel: number) => {
    return hasAvailableSlots(spellLevel, characterData);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Заголовок */}
      <div className="flex items-center gap-2 mb-4">
        <Wand className="w-5 h-5" style={{ color: getFrameColor(frameColor) }} />
        <h2 className="text-xl font-bold text-gray-100">Заклинания</h2>
      </div>

      {/* Слоты заклинаний */}
      <div className="mb-4">
        <DynamicFrame frameType="actions" className="w-full">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-200 mb-3">Слоты заклинаний</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => {
                const slots = getSpellSlots(level);
                if (slots === 0) return null;
                
                return (
                  <div key={level} className="text-center">
                    <div className="text-sm text-gray-400 mb-1">
                      {level === 0 ? 'Заговоры' : `${level} уровень`}
                    </div>
                    <div className="flex gap-1 justify-center">
                      {Array.from({ length: slots }, (_, i) => (
                        <div
                          key={i}
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center text-xs font-bold ${
                            hasSlots(level) ? 
                              'border-green-500 text-green-500' : 
                              'border-gray-500 text-gray-500'
                          }`}
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </DynamicFrame>
      </div>

      {/* Подготовленные заклинания */}
      <div className="mb-4">
        <DynamicFrame frameType="actions" className="w-full">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-200">
                Подготовленные заклинания ({preparedSpells.length}/{maxPreparedSpells})
              </h3>
              <button
                onClick={() => setIsPreparedSpellsOpen(!isPreparedSpellsOpen)}
                className="flex items-center gap-2 px-3 py-1 rounded transition-colors hover:bg-opacity-20"
                style={{ 
                  backgroundColor: getFrameColor(frameColor) + '20',
                  color: getFrameColor(frameColor)
                }}
              >
                <Settings className="w-4 h-4" />
                Управление
              </button>
            </div>
            
            {isPreparedSpellsOpen && (
              <div className="space-y-2">
                {preparedSpells.map((spell, index) => (
                  <Collapsible key={index}>
                    <CollapsibleTrigger
                      onClick={() => toggleSpellExpansion(index)}
                      className="w-full flex items-center justify-between p-2 rounded hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-200">{spell.name}</span>
                        <span className="text-sm text-gray-400">
                          {spell.level === 0 ? 'Заговор' : `${spell.level} уровень`}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSpell(spell.key);
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        Удалить
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-2 bg-gray-800 rounded">
                      <div className="text-sm text-gray-300">
                        <p className="mb-2">{spell.description}</p>
                        <div className="text-xs text-gray-400">
                          <p><strong>Время накладывания:</strong> {spell.castingTime}</p>
                          <p><strong>Дистанция:</strong> {spell.range}</p>
                          <p><strong>Компоненты:</strong> {spell.components}</p>
                          <p><strong>Длительность:</strong> {spell.duration}</p>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            )}
          </div>
        </DynamicFrame>
      </div>

      {/* Добавить заклинания */}
      <div className="flex-1 overflow-y-auto">
        <DynamicFrame frameType="actions" className="w-full">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-200">Доступные заклинания</h3>
              <button
                onClick={() => setIsAddSpellsOpen(!isAddSpellsOpen)}
                className="flex items-center gap-2 px-3 py-1 rounded transition-colors hover:bg-opacity-20"
                style={{ 
                  backgroundColor: getFrameColor(frameColor) + '20',
                  color: getFrameColor(frameColor)
                }}
              >
                <Plus className="w-4 h-4" />
                Добавить
              </button>
            </div>
            
            {isAddSpellsOpen && (
              <div className="space-y-4">
                {/* Поиск */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Поиск заклинаний..."
                    value={addSpellSearch}
                    onChange={(e) => setAddSpellSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* Фильтр по уровню */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setAddSpellLevelFilter("all")}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      addSpellLevelFilter === "all" ? 
                        'bg-blue-600 text-white' : 
                        'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Все
                  </button>
                  {availableSpellLevels.map(level => (
                    <button
                      key={level}
                      onClick={() => setAddSpellLevelFilter(level)}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        addSpellLevelFilter === level ? 
                          'bg-blue-600 text-white' : 
                          'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {level === 0 ? 'Заговоры' : `${level} уровень`}
                    </button>
                  ))}
                </div>
                
                {/* Список заклинаний */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredSpells.map((spell, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-200">{spell.name}</span>
                        <span className="text-sm text-gray-400">
                          {spell.level === 0 ? 'Заговор' : `${spell.level} уровень`}
                        </span>
                      </div>
                      <button
                        onClick={() => addSpell(spell.key)}
                        disabled={preparedSpells.length >= maxPreparedSpells}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                      >
                        Добавить
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DynamicFrame>
      </div>
    </div>
  );
}
