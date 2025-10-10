import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useFrameColor } from "@/contexts/FrameColorContext";
import DynamicFrame from "@/components/ui/DynamicFrame";
import { Weapons } from "@/data/items/weapons";
import { getClassByKey } from "@/data/classes";
import { Spells } from "@/data/spells";
import { Gears, Ammunitions } from "@/data/items/gear";
import { Armors } from "@/data/items/armors";
import { Tools } from "@/data/items/tools";
import { EQUIPMENT_PACKS } from "@/data/items/equipment-packs";
import { getWeaponMasteryByKey } from "@/data/items/weapon-mastery";
import { getWeaponPropertyByName } from "@/data/items/weapons";
import { ABILITIES } from "@/data/abilities";
import { SKILLS } from "@/data/skills";
import { LANGUAGES } from "@/data/languages/languages";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import LayOnHandsManager from "@/components/ui/LayOnHandsManager";
import ChannelDivinityManager from "@/components/ui/ChannelDivinityManager";
import AuraManager from "@/components/ui/AuraManager";
import { ItemDetailsSidebar } from "@/components/characterList/ItemDetailsSidebar";
import { ChevronDown, ChevronUp, Settings, Coins, Plus, Loader2, X, Zap, Wand, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCharacter } from "@/store/character";
import { ALL_FEATS } from "@/data/feats/feats";
import { FIGHTING_STYLES } from "@/data/classes/features/fightingStyles";
import FightingStylesSection from "@/components/characterList/FightingStylesSection";
import FeatsSection from "@/components/characterList/FeatsSection";

type Props = {
  attacks: { name: string; bonus: number; damage: string }[];
  equipped?: {
    weaponSlot1?: { name: string; type: string; slots: number; versatileMode?: boolean }[];
    weaponSlot2?: { name: string; type: string; slots: number; versatileMode?: boolean }[];
    activeWeaponSlot?: number;
    armor?: { name: string; type: string };
    shield1?: { name: string; type: string };
    shield2?: { name: string; type: string };
    capacityItem?: { name: string; capacity: number };
    otherItems?: { name: string; type: string; slots: number }[];
  };
  stats?: Record<string, number>;
  proficiencyBonus?: number;
  classKey?: string;
  level?: number;
  onRoll?: (desc: string, ability: string, bonus: number, type: string, damageString?: string, attackRoll?: number) => void;
  onSwitchWeaponSlot?: (slot: number) => void;
  onUpdateEquipped?: (newEquipped: any) => void;
  onUpdateEquipment?: (newEquipment: any[]) => void;
  onUpdateCurrency?: (newCurrency: any) => void;
  setDraft?: (updater: (prev: any) => any) => void;
  onSaveAll?: () => void;
  characterData?: any;
  char?: any;
  setChar?: (char: any) => void;
  draft?: any;
};

type TabType = "actions" | "spells" | "inventory" | "features";
type ActionType = "attack" | "action" | "bonus" | "reaction";

// Функция для отображения карточки заклинания
const renderSpellCard = (spell: any, onRemove?: () => void, onAdd?: () => void, isPrepared?: boolean, isLearned?: boolean, frameColor?: string, disabled?: boolean) => {
  return (
    <div className="border-b border-gray-600 bg-neutral-900 shadow-inner shadow-sm">
      <Collapsible>
        <CollapsibleTrigger asChild>
          <div className="w-full p-3 bg-neutral-800 hover:bg-neutral-700 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{spell.name}</span>
                {spell.needConcentration && (
                  <span 
                    className="text-gray-400 text-xs px-1 py-0.5 rounded font-medium hover:text-gray-300 transition-colors cursor-help relative group border border-gray-500"
                  >
                    К
                    {/* Tooltip для концентрации */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[9999] whitespace-nowrap">
                      Концентрация
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800"></div>
                    </div>
                  </span>
                )}
                {spell.isRitual && (
                  <span 
                    className="text-gray-400 text-xs px-1 py-0.5 rounded font-medium hover:text-gray-300 transition-colors cursor-help relative group border border-gray-500"
                  >
                    Р
                    {/* Tooltip для ритуала */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[9999] whitespace-nowrap">
                      Ритуал
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800"></div>
                    </div>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {(onRemove || onAdd) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (disabled) return;
                      if (onRemove && (isPrepared || isLearned)) {
                        onRemove();
                      } else if (onAdd && !isPrepared && !isLearned) {
                        onAdd();
                      } else if (onRemove) {
                        onRemove();
                      }
                    }}
                    disabled={disabled}
                    className={`w-6 h-6 bg-transparent border rounded flex items-center justify-center transition-colors relative group ${
                      disabled 
                        ? 'opacity-50' 
                        : 'hover:bg-red-500/20'
                    }`}
                    style={{
                      borderColor: disabled 
                        ? '#6B7280' 
                        : isPrepared || isLearned 
                          ? '#ef4444' 
                          : (frameColor || '#6B7280'),
                      color: disabled 
                        ? '#6B7280' 
                        : isPrepared || isLearned 
                          ? '#ef4444' 
                          : (frameColor || '#6B7280')
                    }}
                  >
                    {isPrepared || isLearned ? (
                      <X className="w-3 h-3" />
                    ) : (
                      <Plus className="w-3 h-3" />
                    )}
                    {/* Tooltip для кнопки */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[9999] whitespace-nowrap">
                      {disabled 
                        ? "Лимит исчерпан" 
                        : isPrepared || isLearned 
                          ? "Убрать" 
                          : "Добавить"
                      }
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800"></div>
                    </div>
                  </button>
                )}
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-1">
              {spell.isLegacy && (
                <span style={{ color: getFrameColor(frameColor) }}>Legacy</span>
              )}
              {spell.isLegacy && <span className="flex items-center">•</span>}
              <span className="flex items-center">{spell.level === 0 ? 'Заговор' : `${spell.level}-й уровень`}</span>
              <span className="flex items-center">•</span>
              <span className="flex items-center">{spell.school}</span>
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-2 text-xs space-y-2">
            {/* Категория в самом верху */}
            <div className="text-gray-400 mb-2">
              {spell.level === 0 ? 'Заговор' : `Заклинание ${spell.level} уровня`}
            </div>

            {/* Основные характеристики */}
            <div className="space-y-1">
              <div className="text-gray-400">
                <span className="font-medium text-gray-200">Источник:</span> {spell.source || 'PHB'}
              </div>
              
              <div className="text-gray-400">
                <span className="font-medium text-gray-200">Школа:</span> {spell.school}
              </div>
              
              <div className="text-gray-400">
                <span className="font-medium text-gray-200">Время сотворения:</span> {Array.isArray(spell.castingTime) ? spell.castingTime.join(', ') : spell.castingTime}
              </div>
              
              <div className="text-gray-400">
                <span className="font-medium text-gray-200">Дистанция:</span> {spell.range}
              </div>
              
              <div className="text-gray-400">
                <span className="font-medium text-gray-200">Компоненты:</span> {Array.isArray(spell.components) ? spell.components.join(', ') : spell.components}
              </div>
              
              <div className="text-gray-400">
                <span className="font-medium text-gray-200">Длительность:</span> {spell.duration}
              </div>

              {spell.heal && (
                <div className="text-gray-400">
                  <span className="font-medium text-gray-200">Лечение:</span> {spell.heal}
                </div>
              )}

              {spell.damage && (
                <div className="text-gray-400">
                  <span className="font-medium text-gray-200">Урон:</span> {spell.damage.dice} {spell.damage.type}
                </div>
              )}

              {spell.save && (
                <div className="text-gray-400">
                  <span className="font-medium text-gray-200">Спасбросок:</span> {spell.save}
                </div>
              )}
            </div>

            {/* Разделитель */}
            <div className="border-t border-gray-600 my-2"></div>

            {/* Описание */}
            {spell.desc && (
              <div className="text-gray-300">
                {spell.desc.split('\n').map((paragraph: string, index: number) => {
                  // Обрабатываем курсив
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
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

// Импортируем FRAME_COLORS из DynamicFrame
const FRAME_COLORS = {
  gold: '#B59E54',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  copper: '#B87333',
  steel: '#71797E',
  red: '#DC2626',
  blue: '#2563EB',
  green: '#16A34A',
  purple: '#9333EA',
  orange: '#EA580C',
  pink: '#EC4899',
  cyan: '#0891B2',
  lime: '#65A30D',
  indigo: '#4F46E5',
  teal: '#0D9488',
  emerald: '#059669',
  rose: '#E11D48',
  amber: '#D97706',
  violet: '#7C3AED',
  fuchsia: '#C026D3',
  sky: '#0284C7',
  stone: '#78716C',
  neutral: '#6B7280',
  zinc: '#71717A',
  slate: '#64748B',
  gray: '#6B7280',
  cool: '#6B7280',
  warm: '#78716C',
  true: '#FFFFFF',
};

// Вспомогательная функция для получения цвета рамки
const getFrameColor = (color: string) => {
  return FRAME_COLORS[color as keyof typeof FRAME_COLORS] || FRAME_COLORS.gold;
};

// Функция для генерации динамического SVG actionFrame
const getActionFrameSvg = (color: string) => {
  const hexColor = getFrameColor(color);
  
  return `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" id="Слой_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 289.93 307.31" preserveAspectRatio="none" style="enable-background:new 0 0 289.93 307.31;" xml:space="preserve">
<style type="text/css">
	.st0{clip-path:url(#SVGID_00000074437919751204614870000007753514779035950496_);fill:${hexColor};}
</style>
<g>
	<defs>
		<rect id="SVGID_1_" width="289.93" height="307.31"/>
	</defs>
	<clipPath id="SVGID_00000034811484770670226070000009542851693816943004_">
		<use xlink:href="#SVGID_1_"  style="overflow:visible;"/>
	</clipPath>
	<path style="clip-path:url(#SVGID_00000034811484770670226070000009542851693816943004_);fill:${hexColor};" d="M288.49,10.1
		c-0.45-1.41-1.05-2.74-1.81-4V6.01h-0.05c-1.25-2.06-2.97-3.58-5.17-4.56h2.75l4.28,4.47V10.1z M288.49,294.79
		c-0.36,1.83-0.96,3.56-1.81,5.22V7.31c0.2,0.31,0.37,0.64,0.51,0.98c0.58,1.36,1.03,2.75,1.35,4.19L288.49,294.79z M288.49,301.35
		l-4.28,4.47h-2.75c2.2-0.98,3.92-2.5,5.17-4.56h0.05v-0.09c0.78-1.26,1.38-2.59,1.81-4V301.35z M10.38,305.82
		c-1.32-0.32-2.53-0.87-3.63-1.66c-1.1-0.79-2.02-1.76-2.75-2.9V6.05c0.75-1.14,1.68-2.1,2.79-2.9c1.11-0.79,2.32-1.36,3.64-1.71
		H279.5c1.32,0.32,2.53,0.87,3.63,1.66c1.1,0.79,2.02,1.76,2.75,2.9v295.21c-0.75,1.14-1.68,2.1-2.79,2.9
		c-1.11,0.79-2.32,1.36-3.64,1.71H10.38z M5.68,305.82l-4.28-4.47v-4.14c0.45,1.41,1.06,2.74,1.81,4v0.09h0.05
		c1.25,2.06,2.97,3.58,5.17,4.56H5.68V305.82z M1.4,12.53c0.36-1.82,0.97-3.56,1.81-5.22V300c-0.2-0.31-0.37-0.64-0.51-0.98
		c-0.58-1.36-1.03-2.75-1.35-4.19L1.4,12.53z M1.4,5.96l4.28-4.47h2.75c-2.17,0.99-3.89,2.5-5.17,4.52H3.21V6.1
		c-0.78,1.26-1.38,2.59-1.81,4V5.96z M284.76,0H5.12L0,5.35v296.6l5.12,5.35h279.69l5.12-5.35V5.35L284.76,0z"/>
</g>
</svg>`;
};

export default function Attacks({ attacks, equipped, stats, proficiencyBonus, classKey, level, onRoll, onSwitchWeaponSlot, onUpdateEquipped, onUpdateEquipment, onUpdateCurrency, setDraft, onSaveAll, characterData, char, setChar }: Props) {
  const { frameColor } = useFrameColor();
  const [criticalHits, setCriticalHits] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<TabType>("actions");
  const [activeActionType, setActiveActionType] = useState<ActionType>("attack");
  const [loadingAttacks, setLoadingAttacks] = useState<Record<string, boolean>>({});
  const [loadingDamage, setLoadingDamage] = useState<Record<string, boolean>>({});
  
  
  
  // Состояние для экипировки (локальное, не синхронизируется с equipped)
  const [localEquipped, setLocalEquipped] = useState<{
    armor: string | null;
    mainSet: Array<{name: string, slots: number, isVersatile?: boolean, versatileMode?: boolean}>;
    additionalSet: Array<{name: string, slots: number, isVersatile?: boolean, versatileMode?: boolean}>;
    otherItems: Array<{name: string, slots: number}>;
  }>({
    armor: null,
    mainSet: [],
    additionalSet: [],
    otherItems: []
  });

  // Состояние для сайдбара управления инвентарем
  const [isInventorySidebarOpen, setIsInventorySidebarOpen] = useState(false);
  const [openSections, setOpenSections] = useState({
    addItems: false,
    myInventory: false
  });


  // Состояние для поиска и фильтров
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState<{[key: string]: number}>({});
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
  const [loadingPurchase, setLoadingPurchase] = useState<Set<string>>(new Set());
  
  // Состояние для поиска инвентаря
  const [inventorySearchFilter, setInventorySearchFilter] = useState('');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('all');
  const [isItemDetailsOpen, setIsItemDetailsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isSpellDetailsOpen, setIsSpellDetailsOpen] = useState(false);
  const [selectedSpell, setSelectedSpell] = useState<any>(null);
  const [isSpellSettingsOpen, setIsSpellSettingsOpen] = useState(false);
  const [isPreparedSpellsOpen, setIsPreparedSpellsOpen] = useState(false);
  const [isAddSpellsOpen, setIsAddSpellsOpen] = useState(false);
  const [isLearnSpellsOpen, setIsLearnSpellsOpen] = useState(false);
  const [expandedSpells, setExpandedSpells] = useState<Set<number>>(new Set());
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  
  // Состояние для вкладки особенностей
  const [featuresSearchFilter, setFeaturesSearchFilter] = useState('');
  const [featuresCategoryFilter, setFeaturesCategoryFilter] = useState('all');
  
  // Состояние для подсказки мастерства
  const [hoveredWeapon, setHoveredWeapon] = useState<string | null>(null);
  const [starPosition, setStarPosition] = useState<{ x: number; y: number } | null>(null);
  
  // Состояние для подсказки удаления
  const [hoveredDeleteItem, setHoveredDeleteItem] = useState<string | null>(null);
  
  // Состояние для подсказки валюты
  const [hoveredCurrency, setHoveredCurrency] = useState<string | null>(null);
  const [currencyPosition, setCurrencyPosition] = useState<{ x: number; y: number } | null>(null);
  const [currencyTimeout, setCurrencyTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Состояние для вкладки заклинаний
  const [spellSearch, setSpellSearch] = useState("");
  const [spellLevelFilter, setSpellLevelFilter] = useState<number | "all">("all");
  
  // Отдельные переменные для поиска в разных блоках
  const [addSpellSearch, setAddSpellSearch] = useState("");
  const [addSpellLevelFilter, setAddSpellLevelFilter] = useState<number | "all">("all");
  const [learnSpellSearch, setLearnSpellSearch] = useState("");
  const [learnSpellLevelFilter, setLearnSpellLevelFilter] = useState<number | "all">("all");
  
  // Состояние для tooltip'ов кнопок
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [buttonPosition, setButtonPosition] = useState<{ x: number; y: number } | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  // Получаем функции для работы со слотами заклинаний из контекста
  const { useSpellSlot: contextUseSpellSlot, freeSpellSlot: contextFreeSpellSlot, draft, setChosenSpells, setLearnedSpells, saveToSupabase } = useCharacter();
  
  // ===== УТИЛИТАРНЫЕ ФУНКЦИИ =====
  
  // Функция для получения всех заклинаний персонажа
  const getAllCharacterSpells = () => {
    const allSpells: any[] = [];
    const addedKeys = new Set<string>(); // Для предотвращения дублирования
    
    
    // Добавляем заговоры (0 уровень) - только те, что действительно заговоры
    if (characterData?.spells?.length > 0) {
      characterData.spells.forEach((spellKey: string) => {
        if (!addedKeys.has(spellKey)) {
          const spellData = getSpellData(spellKey);
          if (spellData && spellData.level === 0) { // Добавляем только заговоры (0 уровень)
            allSpells.push({
              ...spellData,
              key: spellKey,
              level: 0,
              isCantrip: true
            });
            addedKeys.add(spellKey);
          }
        }
      });
    }
    
    // Добавляем заклинания, которые дает класс автоматически
    if (characterData?.class?.features) {
      Object.entries(characterData.class.features).forEach(([level, features]) => {
        const levelNum = parseInt(level);
        // Добавляем заклинания только для особенностей текущего уровня и ниже
        if (levelNum <= characterData.level) {
          (features as any[]).forEach((feature: any) => {
            if (feature.spells && Array.isArray(feature.spells)) {
              feature.spells.forEach((spellKey: string) => {
                if (!addedKeys.has(spellKey)) {
                  const spellData = getSpellData(spellKey);
                  if (spellData) {
                    allSpells.push({
                      ...spellData,
                      key: spellKey,
                      level: spellData.level || 1,
                      isCantrip: spellData.level === 0,
                      isClassFeature: true // Помечаем как заклинание от особенности класса
                    });
                    addedKeys.add(spellKey);
                  }
                }
              });
            }
          });
        }
      });
    }
    
    // Добавляем подготовленные заклинания (1+ уровень)
    if (characterData?.class?.key && draft?.chosen?.spells?.[characterData.class.key]) {
      draft.chosen.spells[characterData.class.key].forEach((spellKey: string) => {
        if (!addedKeys.has(spellKey)) {
          const spellData = getSpellData(spellKey);
          if (spellData) {
            allSpells.push({
              ...spellData,
              key: spellKey,
              level: spellData.level || 1, // Используем уровень из данных заклинания
              isCantrip: false
            });
            addedKeys.add(spellKey);
          }
        }
      });
    }
    
    // Добавляем выученные заклинания
    if (characterData?.class?.key && draft?.chosen?.learnedSpells?.[characterData.class.key]) {
      draft.chosen.learnedSpells[characterData.class.key].forEach((spellKey: string) => {
        if (!addedKeys.has(spellKey)) {
          const spellData = getSpellData(spellKey);
          if (spellData) {
            allSpells.push({
              ...spellData,
              key: spellKey,
              level: spellData.level,
              isCantrip: spellData.level === 0,
              isLearned: true // Помечаем как выученное
            });
            addedKeys.add(spellKey);
          }
        }
      });
    }
    
    return allSpells;
  };
  
  // Функция для фильтрации заклинаний (только для блока "Добавить Заклинание")
  const getFilteredSpells = (search: string = addSpellSearch, levelFilter: number | "all" = addSpellLevelFilter) => {
    let spells = getAvailableSpells();
    
    // Фильтр по поиску
    if (search.trim()) {
      spells = spells.filter(spell => 
        spell.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Фильтр по уровню
    if (levelFilter !== "all") {
      spells = spells.filter(spell => spell.level === levelFilter);
    }
    
    // Сортировка по алфавиту
    spells.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    
    return spells;
  };

  // Функция для фильтрации заклинаний на вкладке "Заклинания"
  const getFilteredCharacterSpells = () => {
    let spells = getAllCharacterSpells();
    
    // Фильтр по поиску
    if (spellSearch.trim()) {
      spells = spells.filter(spell => 
        spell.name.toLowerCase().includes(spellSearch.toLowerCase())
      );
    }
    
    // Фильтр по уровню
    if (spellLevelFilter !== "all") {
      spells = spells.filter(spell => spell.level === spellLevelFilter);
    }
    
    // Сортировка по алфавиту
    spells.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    
    return spells;
  };
  
  // Функция для получения доступных уровней заклинаний (для блока "Добавить Заклинание")
  const getAvailableSpellLevels = () => {
    const spells = getAvailableSpells();
    const levels = new Set(spells.map(spell => spell.level));
    return Array.from(levels).sort((a, b) => a - b);
  };

  // Функция для получения доступных уровней заклинаний (для вкладки "Заклинания")
  const getCharacterSpellLevels = () => {
    const spells = getAllCharacterSpells();
    const levels = new Set(spells.map(spell => spell.level));
    return Array.from(levels).sort((a, b) => a - b);
  };

  // Функция для получения выбранных опций черты
  const getFeatChoices = (featKey: string) => {
    if (!draft?.chosen) return [];

    
    const choices: string[] = [];
    
    // Для черты "skilled" от предыстории ищем выборы в skills
    if (featKey === 'skilled') {
      // Ищем выборы навыков, связанные с чертой "skilled" от предыстории
      // Черта "skilled" должна иметь выборы в формате "background-skilled-*"
      Object.entries(draft.chosen.skills || {}).forEach(([source, skills]) => {
        if (source.includes('skilled') || source.includes('background-skilled')) {
          skills.forEach(skill => {
            choices.push(`skill:${skill}`);
          
          });
        }
      });
      
      // Ищем выборы инструментов, связанные с чертой "skilled" от предыстории
      Object.entries(draft.chosen.tools || {}).forEach(([source, tools]) => {
        if (source.includes('skilled') || source.includes('background-skilled')) {
          tools.forEach(tool => {
            choices.push(`tool:${tool}`);
           
          });
        }
      });
    } else {
      // Для других черт ищем по старому алгоритму
      const featEntries = (draft.chosen.feats || []).filter(f => f.includes(`:${featKey}`));
      
      featEntries.forEach(entry => {
        const parts = entry.split(':');
        if (parts.length >= 2) {
          const sourceKey = parts[0];
          const feat = parts[1];
          
          
          // Ищем все выборы для этого источника
          Object.entries(draft.chosen).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              value.forEach(v => {
                if (typeof v === 'string' && v.startsWith(`${sourceKey}:`)) {
                  const choiceParts = v.split(':');
                  if (choiceParts.length >= 3) {
                    const choiceType = choiceParts[1];
                    const choiceValue = choiceParts[2];
                    choices.push(`${choiceType}:${choiceValue}`);
                  }
                }
              });
            } else if (typeof value === 'object' && value !== null) {
              Object.entries(value).forEach(([source, values]) => {
                if (Array.isArray(values)) {
                  values.forEach(v => {
                    if (typeof v === 'string' && v.startsWith(`${sourceKey}:`)) {
                      const choiceParts = v.split(':');
                      if (choiceParts.length >= 3) {
                        const choiceType = choiceParts[1];
                        const choiceValue = choiceParts[2];
                        choices.push(`${choiceType}:${choiceValue}`);
                      }
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
    
    return choices;
  };

  // Функция для получения всех черт персонажа
  const getCharacterFeats = () => {
    const allFeats: any[] = [];
    const addedKeys = new Set<string>(); // Для предотвращения дублирования
    
    // Добавляем черты из выбранных фитов
    if (draft?.chosen?.feats) {
      draft.chosen.feats.forEach(featString => {
        const featKey = featString.split(':')[1];
        if (!addedKeys.has(featKey)) {
          const feat = ALL_FEATS.find(f => f.key === featKey);
          if (feat) {
            allFeats.push(feat);
            addedKeys.add(featKey);
          }
        }
      });
    }
    
    // Добавляем черты из особенностей класса
    if (characterData?.class?.features) {
      Object.values(characterData.class.features).flat().forEach((feature: any) => {
        // Проверяем поле feat (единственная черта)
        if (feature.feat && !addedKeys.has(feature.feat)) {
          const feat = ALL_FEATS.find(f => f.key === feature.feat);
          if (feat) {
            allFeats.push(feat);
            addedKeys.add(feature.feat);
          }
        }
        // Проверяем поле feats (массив черт)
        if (feature.feats && Array.isArray(feature.feats)) {
          feature.feats.forEach((featKey: string) => {
            if (!addedKeys.has(featKey)) {
              const feat = ALL_FEATS.find(f => f.key === featKey);
              if (feat) {
                allFeats.push(feat);
                addedKeys.add(featKey);
              }
            }
          });
        }
      });
    }
    
    // Добавляем черты из особенностей подкласса
    if (characterData?.subclass?.features) {
      Object.values(characterData.subclass.features).flat().forEach((feature: any) => {
        // Проверяем поле feat (единственная черта)
        if (feature.feat && !addedKeys.has(feature.feat)) {
          const feat = ALL_FEATS.find(f => f.key === feature.feat);
          if (feat) {
            allFeats.push(feat);
            addedKeys.add(feature.feat);
          }
        }
        // Проверяем поле feats (массив черт)
        if (feature.feats && Array.isArray(feature.feats)) {
          feature.feats.forEach((featKey: string) => {
            if (!addedKeys.has(featKey)) {
              const feat = ALL_FEATS.find(f => f.key === featKey);
              if (feat) {
                allFeats.push(feat);
                addedKeys.add(featKey);
              }
            }
          });
        }
      });
    }
    
    // Добавляем черты из предыстории
    if (characterData?.background?.features) {
      characterData.background.features.forEach((feature: any) => {
        // Проверяем поле feat (единственная черта)
        if (feature.feat && !addedKeys.has(feature.feat)) {
          const feat = ALL_FEATS.find(f => f.key === feature.feat);
          if (feat) {
            allFeats.push(feat);
            addedKeys.add(feature.feat);
          }
        }
        // Проверяем поле feats (массив черт)
        if (feature.feats && Array.isArray(feature.feats)) {
          feature.feats.forEach((featKey: string) => {
            if (!addedKeys.has(featKey)) {
              const feat = ALL_FEATS.find(f => f.key === featKey);
              if (feat) {
                allFeats.push(feat);
                addedKeys.add(featKey);
              }
            }
          });
        }
      });
    }
    
    
    return allFeats;
  };


  // Функция для фильтрации черт
  const getFilteredFeats = () => {
    let feats = getCharacterFeats();
    
    // Фильтр по поиску
    if (featuresSearchFilter.trim()) {
      feats = feats.filter(feat => 
        feat.name.toLowerCase().includes(featuresSearchFilter.toLowerCase())
      );
    }
    
    return feats;
  };


  // Функция для проверки доступности слотов заклинаний
  const hasAvailableSlots = (spellLevel: number) => {
    // Заговоры (0 уровень) не требуют слотов
    if (spellLevel === 0) {
      return true;
    }
    
    const totalSlots = getSpellSlotsForLevel(spellLevel);
    const usedSlots = draft?.usedSpellSlots?.[spellLevel] || 0;
    return usedSlots < totalSlots;
  };

  // Функция для использования слота заклинания
  const useSpellSlot = (spellLevel: number) => {
    // Заговоры (0 уровень) не используют слоты
    if (spellLevel === 0) {
      return;
    }
    
    if (hasAvailableSlots(spellLevel)) {
      contextUseSpellSlot(spellLevel);
    }
  };

  // Функция для освобождения слота заклинания
  const freeSpellSlot = (spellLevel: number) => {
    contextFreeSpellSlot(spellLevel);
  };

  // Функция для получения слотов заклинаний для уровня
  const getSpellSlotsForLevel = (spellLevel: number) => {

    // Используем данные из characterData, если доступен, иначе из draft
    const currentClass = characterData?.class || draft?.basics?.class;
    const currentLevel = characterData?.level || draft?.basics?.level;


    if (!currentClass || !currentLevel) {
      return 0;
    }

    // Получаем информацию о классе
    const classData = currentClass;

    if (!classData.spellcasting?.progression) {
      return 0;
    }

    const levelSlots = classData.spellcasting.progression[currentLevel];

    if (!levelSlots?.slots) {
      return 0;
    }

    // Возвращаем количество слотов для нужного уровня заклинаний
    // Для паладина: progression[1] = { slots: [2] } означает 2 ячейки 1-го уровня
    // slots[0] = количество ячеек 1-го уровня, slots[1] = количество ячеек 2-го уровня и т.д.
    const slots = levelSlots.slots[spellLevel - 1] || 0;
    return slots;
  };
  
  // Универсальная функция для обновления equipment
  const updateEquipment = (newEquipment: any[]) => {
    if (onUpdateEquipment) {
      onUpdateEquipment(newEquipment);
    }
  };
  
  // Универсальная функция для обновления валюты
  const updateCurrency = (newCurrency: any) => {
    if (onUpdateCurrency) {
      onUpdateCurrency(newCurrency);
    }
  };
  
  // Функция для очистки названия предмета от количества
  const getCleanItemName = (itemName: any) => {
    if (typeof itemName !== 'string') {
      return String(itemName);
    }
    return itemName.replace(/^\d+x\s+/, '');
  };

  // Функция для определения типа предмета
  const getItemType = (itemName: any) => {
    if (typeof itemName !== 'string') {
      return 'other';
    }
    const cleanName = itemName.replace(/^\d+x\s+/, '');
    
    // Проверяем оружие
    const weapon = Weapons.find(w => w.name === cleanName);
    if (weapon) return 'weapon';
    
    // Проверяем доспехи и щиты
    const armor = Armors.find(a => a.name === cleanName);
    if (armor) {
      if (armor.category === 'shield') return 'shield';
      return 'armor';
    }
    
    // Проверяем инструменты
    const tool = Tools.find(t => t.name === cleanName);
    if (tool) return 'tool';
    
    // Проверяем снаряжение
    const gear = Gears.find(g => g.name === cleanName);
    if (gear) return 'gear';
    
    // Проверяем боеприпасы
    const ammo = Ammunitions.find(a => a.name === cleanName);
    if (ammo) return 'ammunition';
    
    return 'other';
  };

  // Функция для получения категории предмета
  const getItemCategory = (itemName: any) => {
    if (typeof itemName !== 'string') {
      return 'Неизвестно';
    }
    const cleanName = itemName.replace(/^\d+x\s+/, '');
    
    // Проверяем оружие
    const weapon = Weapons.find(w => w.name === cleanName);
    if (weapon) {
      if (weapon.type === 'melee') {
        if (weapon.properties?.includes('finesse')) return 'Фехтовальное оружие';
        if (weapon.properties?.includes('thrown')) return 'Метательное оружие';
        return 'Рукопашное оружие';
      } else {
        return 'Дальнобойное оружие';
      }
    }
    
    // Проверяем доспехи
    const armor = Armors.find(a => a.name === cleanName);
    if (armor) {
      if (armor.category === 'shield') return 'Щит';
      return 'Доспех';
    }
    
    // Проверяем инструменты
    const tool = Tools.find(t => t.name === cleanName);
    if (tool) {
      const TOOL_CATEGORY_LABELS: Record<string, string> = {
        'artisan': 'Ремесленные инструменты',
        'musical': 'Музыкальный инструмент',
        'kit': 'Набор инструментов',
        'other': 'Другие инструменты'
      };
      return TOOL_CATEGORY_LABELS[tool.category] || tool.category;
    }
    
    // Проверяем снаряжение
    const gear = Gears.find(g => g.name === cleanName);
    if (gear) return 'Снаряжение';
    
    // Проверяем боеприпасы
    const ammo = Ammunitions.find(a => a.name === cleanName);
    if (ammo) return 'Боеприпасы';
    
    return 'Неизвестно';
  };

  // Функция для получения веса предмета
  const getItemWeight = (itemName: any) => {
    // Если это объект, используем его свойство weight
    if (typeof itemName === 'object' && itemName !== null) {
      const weight = itemName.weight;
      const quantity = itemName.quantity || 1;
      return (typeof weight === 'number' ? weight : 0) * quantity;
    }
    
    // Если это строка, ищем в массивах
    if (typeof itemName !== 'string') {
      return 0;
    }
    const cleanName = itemName.replace(/^\d+x\s+/, '');
    
    // Ищем в разных массивах
    let item = Gears.find(g => g.name === cleanName);
    if (item) return item.weight || 0;
    
    item = Ammunitions.find(a => a.name === cleanName);
    if (item) return item.weight || 0;
    
    const weapon = Weapons.find(w => w.name === cleanName);
    if (weapon) return weapon.weight || 0;
    
    const armor = Armors.find(a => a.name === cleanName);
    if (armor) return armor.weight || 0;
    
    const pack = EQUIPMENT_PACKS.find(p => p.name === cleanName);
    if (pack) return pack.weight || 0;
    
    const tool = Tools.find(t => t.name === cleanName);
    if (tool) return tool.weight || 0;
    
    return 0;
  };

  // Функция для получения стоимости предмета
  const getItemCost = (itemName: any) => {
    if (typeof itemName !== 'string') {
      return 'Неизвестно';
    }
    const cleanName = itemName.replace(/^\d+x\s+/, '');
    
    // Ищем в разных массивах
    let item = Gears.find(g => g.name === cleanName);
    if (item) {
      return translateCurrency(item.cost || 'Неизвестно');
    }
    
    item = Ammunitions.find(a => a.name === cleanName);
    if (item) {
      return translateCurrency(item.cost || 'Неизвестно');
    }
    
    const weapon = Weapons.find(w => w.name === cleanName);
    if (weapon) {
      return translateCurrency(weapon.cost || 'Неизвестно');
    }
    
    const armor = Armors.find(a => a.name === cleanName);
    if (armor) {
      return translateCurrency(armor.cost || 'Неизвестно');
    }
    
    const pack = EQUIPMENT_PACKS.find(p => p.name === cleanName);
    if (pack) {
      return translateCurrency(pack.cost || 'Неизвестно');
    }
    
    const tool = Tools.find(t => t.name === cleanName);
    if (tool) {
      return translateCurrency(tool.cost || 'Неизвестно');
    }
    
    return 'Неизвестно';
  };

  // Функция для получения количества предмета
  const getItemQuantity = (itemName: any) => {
    if (typeof itemName !== 'string') {
      return 1;
    }
    const match = itemName.match(/^(\d+)x\s+(.+)$/);
    if (match) {
      return parseInt(match[1]);
    }
    return 1;
  };
  
  // Универсальная функция для получения свойств предмета
  const getItemProperty = (item: any, property: 'weight' | 'cost' | 'quantity' | 'type' | 'category') => {
    if (typeof item === 'object' && item !== null) {
      switch (property) {
        case 'weight':
          return (typeof item.weight === 'number' ? item.weight : 0) * (item.quantity || 1);
        case 'cost':
          return item.cost || 'Неизвестно';
        case 'quantity':
          return item.quantity || 1;
        case 'type':
          return item.type || getItemType(item.name || item);
        case 'category':
          return item.category || getItemCategory(item.name || item);
        default:
          return null;
      }
    }
    
    // Для строк используем существующие функции
    const itemName = typeof item === 'string' ? item : (item.name || String(item));
    switch (property) {
      case 'weight':
        return getItemWeight(itemName);
      case 'cost':
        return getItemCost(itemName);
      case 'quantity':
        return getItemQuantity(itemName);
      case 'type':
        return getItemType(itemName);
      case 'category':
        return getItemCategory(itemName);
      default:
        return null;
    }
  };
  
  // Универсальная функция для получения статуса предмета
  const getItemStatus = (itemName: string) => {
    const cleanName = getCleanItemName(itemName);
    let itemType = getItemType(cleanName);
    
    // Проверяем, является ли это магическим предметом
    if (characterData?.equipment) {
      const magicItem = characterData.equipment.find(item => 
        typeof item === 'object' && 
        item.type === 'magic_item' && 
        item.name === cleanName
      );
      
      if (magicItem) {
        itemType = magicItem.itemType === 'weapon' ? 'weapon' : 
                   magicItem.itemType === 'armor' ? 'armor' : 
                   magicItem.itemType === 'item' ? 'other' : 'other';
      }
    }
    
    // Проверяем, экипирован ли предмет
    const isEquipped = localEquipped.armor === cleanName ||
      localEquipped.mainSet.some(item => item.name === cleanName) ||
      localEquipped.additionalSet.some(item => item.name === cleanName) ||
      localEquipped.otherItems.some(item => item.name === cleanName);
    
    // Проверяем, можно ли экипировать предмет
    const canEquip = itemType === 'weapon' || itemType === 'armor' || itemType === 'shield' || itemType === 'other';
    
    // Проверяем, является ли оружие универсальным
    const isVersatile = itemType === 'weapon' && isVersatileWeapon(cleanName);
    
    // Проверяем, можно ли переключить универсальный режим
    const canToggleVersatile = isVersatile && isEquipped;
    
    return {
      isEquipped,
      canEquip,
      isVersatile,
      canToggleVersatile,
      itemType
    };
  };
  
  
  // Функция для расчета итоговой стоимости покупки
  const calculatePurchaseCost = (item: any, quantity: number) => {
    const itemCost = item.cost || 'Неизвестно';
    if (itemCost === 'Неизвестно') return 'Стоимость неизвестна';
    
    // Парсим стоимость предмета
    const match = itemCost.match(/(\d+)\s*(gp|sp|cp|ЗМ|СМ|ММ|pp|ep)/i);
    if (!match) return itemCost;
    
    const amount = parseInt(match[1]);
    const currency = match[2].toLowerCase();
    
    // Переводим в русские обозначения для отображения
    let currencySymbol = '';
    switch (currency) {
      case 'pp':
      case 'пм':
        currencySymbol = 'ПМ';
        break;
      case 'gp':
      case 'зм':
        currencySymbol = 'ЗМ';
        break;
      case 'ep':
      case 'эм':
        currencySymbol = 'ЭМ';
        break;
      case 'sp':
      case 'см':
        currencySymbol = 'СМ';
        break;
      case 'cp':
      case 'мм':
        currencySymbol = 'ММ';
        break;
      default:
        currencySymbol = currency.toUpperCase();
    }
    
    const totalAmount = amount * quantity;
    return `${totalAmount} ${currencySymbol}`;
  };

  // Функция для переключения секций
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };


  // Функция для удаления предмета (удаляет всю стопку)
  const handleDeleteItem = async (itemName: string) => {
    const itemKey = `delete-${itemName}`;
    
    // Добавляем предмет в состояние загрузки
    setLoadingItems(prev => new Set(prev).add(itemKey));
    
    try {
      // Имитируем задержку (в реальном приложении здесь будет API вызов)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Удаляем всю стопку предметов из characterData.equipment
      const newEquipment = [...(characterData.equipment || [])];
      const cleanItemName = getCleanItemName(itemName);
      
      // Находим все предметы с таким именем и удаляем их полностью
      const filteredEquipment = newEquipment.filter(item => {
        const itemNameToCheck = typeof item === 'string' ? item : (item.name || String(item));
        const cleanItemNameToCheck = getCleanItemName(itemNameToCheck);
        return cleanItemNameToCheck !== cleanItemName;
      });

      // Обновляем только equipment (рюкзак), не затрагивая экипировку
      updateEquipment(filteredEquipment);

      // Показываем toast с успехом
      toast({
        title: "Предмет удален!",
        description: `${getCleanItemName(itemName)} удален из рюкзака`,
        duration: 3000,
      });
      
      // Закрываем сайдбар
      setIsItemDetailsOpen(false);
      setSelectedItem(null);
      
    } catch (error) {
      // Показываем toast с ошибкой
      toast({
        title: "Ошибка",
        description: "Не удалось удалить предмет из рюкзака",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      // Убираем предмет из состояния загрузки
      setLoadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  // Функция для открытия сайдбара с описанием предмета
  const openItemDetails = (item: any) => {
    setSelectedItem(item);
    setIsItemDetailsOpen(true);
  };

  // Функция для закрытия сайдбара с описанием предмета
  const closeItemDetails = () => {
    setIsItemDetailsOpen(false);
    setSelectedItem(null);
  };

  // Функция для открытия сайдбара с описанием заклинания
  const openSpellDetails = (spell: any) => {
    setSelectedSpell(spell);
    setIsSpellDetailsOpen(true);
  };

  // Функция для закрытия сайдбара с описанием заклинания
  const closeSpellDetails = () => {
    setIsSpellDetailsOpen(false);
    setSelectedSpell(null);
  };

  // Функции для управления сайдбаром настроек заклинаний
  const openSpellSettings = () => {
    setIsSpellSettingsOpen(true);
  };

  const closeSpellSettings = () => {
    setIsSpellSettingsOpen(false);
  };

  // Функция для переключения состояния карточки заклинания
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

  // Функция для расчета максимального количества подготовленных заклинаний
  const getMaxPreparedSpells = () => {
    if (!characterData?.class?.spellcasting) return 0;
    
    const level = characterData.level || 1;
    const levelSlots = characterData.class.spellcasting.progression[level as keyof typeof characterData.class.spellcasting.progression];
    const formula = levelSlots?.prepared || characterData.class.spellcasting.preparedFormula || "Math.max(1, level + chaMod)";
    
    // Получаем модификатор характеристики заклинания
    const spellcastingAbility = characterData.class.spellcasting.ability;
    const abilityScore = stats?.[spellcastingAbility] || 10;
    const abilityModifier = Math.floor((abilityScore - 10) / 2);
    
    // Заменяем переменные в формуле
    const formulaWithValues = formula
      .replace(/level/g, level.toString())
      .replace(/chaMod/g, abilityModifier.toString())
      .replace(/wisMod/g, abilityModifier.toString())
      .replace(/intMod/g, abilityModifier.toString());
    
    try {
      return Math.max(1, eval(formulaWithValues));
    } catch (error) {
      console.error('Error calculating max prepared spells:', error);
      return Math.max(1, level + abilityModifier);
    }
  };

  // Функция для получения доступных заклинаний класса
  const getAvailableSpells = () => {
    if (!characterData?.class?.key) return [];
    
    const classKey = characterData.class.key;
    const availableSpells: any[] = [];
    
    // Проверяем, может ли класс выбирать заговоры
    const canChooseCantrips = characterData?.class?.spellcasting?.cantrips > 0;
    
    // Получаем заговоры (0 уровень) только если класс может их выбирать
    if (canChooseCantrips && characterData.spells && characterData.spells.length > 0) {
      characterData.spells.forEach((spellKey: string) => {
        const spellData = getSpellData(spellKey);
        if (spellData && spellData.level === 0) { // Добавляем только заговоры (0 уровень)
          availableSpells.push({
            ...spellData,
            key: spellKey,
            level: 0,
            isCantrip: true
          });
        }
      });
    }
    
    // Получаем заклинания 1+ уровня из всех доступных заклинаний
    const allSpells = Spells;
    
    allSpells.forEach((spell: any) => {
      // Проверяем, доступно ли заклинание для этого класса
      if (spell.classes && spell.classes.includes(classKey)) {
        // Для заговоров проверяем, может ли класс их выбирать
        if (spell.level === 0 && !canChooseCantrips) {
          return; // Пропускаем заговоры для классов, которые их не выбирают
        }
        
        availableSpells.push({
          ...spell,
          key: spell.key || spell.name.toLowerCase().replace(/\s+/g, '-'),
          level: spell.level, // Используем уровень из данных заклинания
          isCantrip: spell.level === 0
        });
      }
    });
    
    
    return availableSpells;
  };

  // Функция для получения всех заклинаний без фильтрации по классу
  const getAllSpells = () => {
    // Преобразуем все заклинания в единый формат
    return Spells.map((spell: any) => ({
      ...spell,
      key: spell.key || spell.name.toLowerCase().replace(/\s+/g, '-'),
      level: spell.level,
      isCantrip: spell.level === 0
    }));
  };

  // Функция для фильтрации всех заклинаний
  const getFilteredAllSpells = (search: string = learnSpellSearch, levelFilter: number | "all" = learnSpellLevelFilter) => {
    let spells = getAllSpells();
    
    // Фильтр по поиску
    if (search.trim()) {
      spells = spells.filter(spell => 
        spell.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Фильтр по уровню
    if (levelFilter !== "all") {
      spells = spells.filter(spell => spell.level === levelFilter);
    }
    
    // Сортировка по алфавиту
    spells.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    
    return spells;
  };

  // Функция для получения уровней всех заклинаний
  const getAllSpellLevels = () => {
    const spells = getAllSpells();
    const levels = new Set(spells.map(spell => spell.level));
    return Array.from(levels).sort((a, b) => a - b);
  };

  // Функция для перевода английских ключей спасбросков в русские названия
  const translateSave = (saveKey: string) => {
    switch (saveKey.toLowerCase()) {
      case 'str': return 'Сила';
      case 'dex': return 'Ловкость';
      case 'con': return 'Телосложение';
      case 'int': return 'Интеллект';
      case 'wis': return 'Мудрость';
      case 'cha': return 'Харизма';
      default: return saveKey;
    }
  };

  // Получаем подготовленные заклинания из драфта
  const preparedSpells = characterData?.class ? (draft?.chosen?.spells?.[characterData.class.key] || []) : [];
  
  // Получаем выученные заклинания из драфта
  const learnedSpells = characterData?.class ? (draft?.chosen?.learnedSpells?.[characterData.class.key] || []) : [];

  // Функции для работы с количеством предметов
  const getQuantityForItem = (itemKey: string) => {
    return itemQuantities[itemKey] || 1;
  };

  const updateItemQuantity = (itemKey: string, quantity: number) => {
    setItemQuantities(prev => ({
      ...prev,
      [itemKey]: Math.max(1, quantity)
    }));
  };

  const incrementQuantity = (itemKey: string) => {
    updateItemQuantity(itemKey, getQuantityForItem(itemKey) + 1);
  };

  const decrementQuantity = (itemKey: string) => {
    const currentQuantity = getQuantityForItem(itemKey);
    if (currentQuantity > 1) {
      updateItemQuantity(itemKey, currentQuantity - 1);
    }
  };

  // Функция для перевода типа урона
  const translateDamageType = (type: string) => {
    const translations: Record<string, string> = {
      'bludgeoning': 'Дробящий',
      'slashing': 'Рубящий',
      'piercing': 'Колющий',
      'fire': 'Огонь',
      'cold': 'Холод',
      'lightning': 'Электричество',
      'thunder': 'Звук',
      'acid': 'Кислота',
      'poison': 'Яд',
      'psychic': 'Психический',
      'radiant': 'Излучение',
      'necrotic': 'Некротический',
      'force': 'Силовое поле'
    };
    return translations[type] || type;
  };

  // Функция для перевода типа оружия
  const translateWeaponType = (type: string) => {
    const translations: Record<string, string> = {
      'melee': 'Ближний бой',
      'ranged': 'Дальний бой'
    };
    return translations[type] || type;
  };

  // Функция для получения категории магического предмета
  const getMagicItemCategory = (item: any) => {
    if (item.itemType === 'weapon') {
      if (item.weapon?.weaponType === 'melee') {
        return 'Магическое оружие ближнего боя';
      } else if (item.weapon?.weaponType === 'ranged') {
        return 'Магическое оружие дальнего боя';
      } else {
        return 'Магическое оружие';
      }
    } else if (item.itemType === 'armor') {
      return 'Магический доспех';
    } else {
      return 'Магический предмет';
    }
  };

  // Функция для получения категории экипированного предмета
  const getEquippedItemCategory = (itemName: string) => {
    // Проверяем, является ли это магическим предметом из инвентаря
    if (characterData?.equipment) {
      const magicItem = characterData.equipment.find(item => 
        typeof item === 'object' && 
        item.type === 'magic_item' && 
        item.name === itemName
      );
      
      if (magicItem) {
        // Для магического оружия показываем вид оружия
        if (magicItem.itemType === 'weapon' && magicItem.weapon?.weaponKind) {
          // Находим название оружия в справочнике
          const weaponData = Weapons.find(w => w.key === magicItem.weapon.weaponKind);
          return weaponData ? weaponData.name : magicItem.weapon.weaponKind;
        }
        // Для магического доспеха показываем категорию
        if (magicItem.itemType === 'armor') {
          return getMagicItemCategory(magicItem);
        }
        // Для магических предметов типа "item" показываем тип предмета
        if (magicItem.itemType === 'item' && magicItem.item?.itemSubType) {
          const subTypeMap: Record<string, string> = {
            'ring': 'Кольцо',
            'headwear': 'Головной убор',
            'footwear': 'Обувь',
            'gloves': 'Перчатки'
          };
          return subTypeMap[magicItem.item.itemSubType] || magicItem.item.itemSubType;
        }
        return getMagicItemCategory(magicItem);
      }
    }
    
    // Для обычного оружия показываем название оружия вместо категории
    const weapon = Weapons.find(w => w.name === itemName);
    if (weapon) {
      return weapon.name;
    }
    
    // Для остальных предметов используем стандартную функцию
    return getItemCategory(itemName);
  };

  // Функция для форматирования цены (показывает "--" если цена 0)
  const formatCost = (cost: any) => {
    if (cost === 0 || cost === '0' || cost === null || cost === undefined) {
      return '--';
    }
    return cost;
  };

  // Функция для перевода характеристик
  const translateAbility = (abilityKey: string) => {
    const abilities: Record<string, string> = {
      'str': 'Сила',
      'dex': 'Ловкость',
      'con': 'Телосложение',
      'int': 'Интеллект',
      'wis': 'Мудрость',
      'cha': 'Харизма'
    };
    return abilities[abilityKey] || abilityKey;
  };

  // Функция для перевода свойств оружия
  const translateWeaponProperties = (properties: string[] | undefined) => {
    if (!properties || properties.length === 0) return [];
    
    const translations: Record<string, string> = {
      'loading': 'Перезарядка',
      'ammunition': 'Боеприпасы',
      'two-handed': 'Двуручное',
      'heavy': 'Тяжелое',
      'reach': 'Досягаемость',
      'versatile': 'Универсальное',
      'thrown': 'Метательное',
      'finesse': 'Фехтовальное',
      'light': 'Лёгкое'
    };
    
    return properties.map(prop => translations[prop] || prop);
  };

  // Функции для перевода свойств доспеха
  const translateArmorCategory = (category: string) => {
    const categoryTranslations: Record<string, string> = {
      'light': 'Легкая',
      'medium': 'Средняя',
      'heavy': 'Тяжелая',
      'shield': 'Щит'
    };
    return categoryTranslations[category] || category;
  };

  const translateDexBonus = (dexBonus: string) => {
    const dexBonusTranslations: Record<string, string> = {
      'none': 'Нет',
      'limited': '+2',
      'full': 'Полный модификатор'
    };
    return dexBonusTranslations[dexBonus] || dexBonus;
  };

  const translateStealthDisadvantage = (stealthDisadvantage: string) => {
    const stealthTranslations: Record<string, string> = {
      'none': 'Нет',
      'disadvantage': 'Помеха'
    };
    return stealthTranslations[stealthDisadvantage] || stealthDisadvantage;
  };

  // Функция для перевода валюты
  const translateCurrency = (cost: string) => {
    if (!cost || cost === 'Неизвестно') return 'Неизвестно';
    
    return cost
      .replace(/\b(\d+)\s*pp\b/gi, '$1 ПМ') // platinum pieces
      .replace(/\b(\d+)\s*gp\b/gi, '$1 ЗМ') // gold pieces
      .replace(/\b(\d+)\s*ep\b/gi, '$1 ЭМ') // electrum pieces
      .replace(/\b(\d+)\s*sp\b/gi, '$1 СМ') // silver pieces
      .replace(/\b(\d+)\s*cp\b/gi, '$1 ММ') // copper pieces
      .replace(/\b(\d+)\s*PP\b/g, '$1 ПМ') // platinum pieces (uppercase)
      .replace(/\b(\d+)\s*GP\b/g, '$1 ЗМ') // gold pieces (uppercase)
      .replace(/\b(\d+)\s*EP\b/g, '$1 ЭМ') // electrum pieces (uppercase)
      .replace(/\b(\d+)\s*SP\b/g, '$1 СМ') // silver pieces (uppercase)
      .replace(/\b(\d+)\s*CP\b/g, '$1 ММ') // copper pieces (uppercase)
      .replace(/\b(\d+)\s*СP\b/g, '$1 ММ') // copper pieces (mixed case)
      .replace(/\bpp\b/gi, 'ПМ')
      .replace(/\bgp\b/gi, 'ЗМ')
      .replace(/\bep\b/gi, 'ЭМ')
      .replace(/\bsp\b/gi, 'СМ')
      .replace(/\bcp\b/gi, 'ММ')
      .replace(/\bPP\b/g, 'ПМ')
      .replace(/\bGP\b/g, 'ЗМ')
      .replace(/\bEP\b/g, 'ЭМ')
      .replace(/\bSP\b/g, 'СМ')
      .replace(/\bCP\b/g, 'ММ')
      .replace(/\bСP\b/g, 'ММ');
  };

  // Функция для определения владения магическим оружием
  const hasMagicWeaponMastery = (itemDetails: any) => {
    if (itemDetails.itemType === 'weapon' && itemDetails.weaponCategory) {
      // Для магического оружия проверяем категорию в characterData.weapons
      const hasCategoryMastery = characterData?.weapons?.includes(itemDetails.weaponCategory);
      
      // Также проверяем конкретное мастерство по виду оружия
      let hasSpecificMastery = false;
      if (itemDetails.weaponKind && characterData?.weapons) {
        // Ищем оружие с таким же видом в списке оружия
        const weaponData = Weapons.find(w => w.key === itemDetails.weaponKind);
        if (weaponData?.key) {
          hasSpecificMastery = characterData.weapons.includes(weaponData.key);
        }
      }
      
      return hasCategoryMastery || hasSpecificMastery;
    } else if (itemDetails.mastery) {
      // Для обычного оружия проверяем конкретное мастерство
      return characterData?.weapons?.includes(itemDetails.key);
    }
    return false;
  };

  // Функция для получения полной информации о предмете
  const getItemDetails = (itemName: string) => {
    const cleanName = getCleanItemName(itemName);
    
    
    // Проверяем, является ли это магическим предметом из инвентаря
    if (characterData?.equipment) {
      const magicItem = characterData.equipment.find(item => 
        typeof item === 'object' && 
        item.type === 'magic_item' && 
        item.name === cleanName
      );
      
      
      if (magicItem) {
        // Возвращаем данные магического предмета в формате, ожидаемом системой
        const details = {
          name: magicItem.name,
          key: magicItem.name, // Добавляем поле key для совместимости
          itemType: magicItem.itemType,
          category: getMagicItemCategory(magicItem),
          cost: magicItem.cost,
          weight: magicItem.weight,
          description: magicItem.description,
          rarity: magicItem.rarity,
          source: 'Homebrew',
          // Для оружия добавляем дополнительные свойства
          ...(magicItem.itemType === 'weapon' && magicItem.weapon && {
            type: translateWeaponType(magicItem.weapon.weaponType),
            range: magicItem.weapon.weaponRange || (magicItem.weapon.weaponType === 'melee' ? '5 фт' : '-'),
            damage: magicItem.weapon.damageSources?.map(source => 
              `${source.diceCount}${source.diceType} ${translateDamageType(source.damageType)}`
            ).join(' + ') || '1d4',
            damageTypeTranslated: magicItem.weapon.damageSources?.map(source => 
              translateDamageType(source.damageType)
            ).join(', ') || '-',
            properties: translateWeaponProperties(magicItem.weapon.weaponProperties || []),
            mastery: magicItem.weapon.weaponMastery,
            weaponKind: magicItem.weapon.weaponKind,
            weaponCategory: magicItem.weapon.weaponCategory,
            bonusAttack: magicItem.weapon.attackBonus,
            bonusDamage: magicItem.weapon.damageBonus
          }),
          // Для доспеха добавляем дополнительные свойства
          ...(magicItem.itemType === 'armor' && magicItem.armor && {
            armorCategory: translateArmorCategory(magicItem.armor.armorCategory),
            armorClass: magicItem.armor.armorClass,
            dexBonus: translateDexBonus(magicItem.armor.dexBonus),
            strengthRequirement: magicItem.armor.strengthRequirement,
            stealthDisadvantage: translateStealthDisadvantage(magicItem.armor.stealthDisadvantage)
          })
        };
        return details;
      }
    }
    
    // Ищем в оружии
    const weapon = Weapons.find(w => w.name === cleanName);
    if (weapon) {
      // Определяем категорию оружия
      let weaponCategory = '';
      if (weapon.category === 'simple' && weapon.type === 'melee') {
        weaponCategory = 'Простое оружие ближнего боя';
      } else if (weapon.category === 'simple' && weapon.type === 'ranged') {
        weaponCategory = 'Простое дальнобойное оружие';
      } else if (weapon.category === 'martial' && weapon.type === 'melee') {
        weaponCategory = 'Воинское оружие ближнего боя';
      } else if (weapon.category === 'martial' && weapon.type === 'ranged') {
        weaponCategory = 'Воинское дальнобойное оружие';
      }

      return {
        ...weapon,
        itemType: 'weapon',
        category: weaponCategory,
        cost: translateCurrency(weapon.cost),
        properties: translateWeaponProperties(weapon.properties),
        damageTypeTranslated: translateDamageType(weapon.damageType)
      };
    }
    
    // Ищем в доспехах
    const armor = Armors.find(a => a.name === cleanName);
    if (armor) {
      // Определяем категорию доспеха
      let armorCategory = '';
      if (armor.category === 'light') {
        armorCategory = 'Лёгкий доспех';
      } else if (armor.category === 'medium') {
        armorCategory = 'Средний доспех';
      } else if (armor.category === 'heavy') {
        armorCategory = 'Тяжёлый доспех';
      } else if (armor.category === 'shield') {
        armorCategory = 'Щит';
      }

      return {
        ...armor,
        itemType: 'armor',
        category: armorCategory,
        cost: translateCurrency(armor.cost)
      };
    }
    
    // Ищем в инструментах
    const tool = Tools.find(t => t.name === cleanName);
    if (tool) {
      const TOOL_CATEGORY_LABELS: Record<string, string> = {
        'artisan': 'Ремесленные инструменты',
        'gaming': 'Игровой набор',
        'musical': 'Музыкальный инструмент',
        'kit': 'Набор инструментов',
        'other': 'Другие инструменты'
      };
      
      return {
        ...tool,
        itemType: 'tool',
        category: TOOL_CATEGORY_LABELS[tool.category] || tool.category,
        cost: translateCurrency(tool.cost),
        description: tool.desc
      };
    }
    
    // Ищем в снаряжении
    const gear = Gears.find(g => g.name === cleanName);
    if (gear) {
      return {
        ...gear,
        itemType: 'gear',
        category: 'Снаряжение',
        cost: translateCurrency(gear.cost),
        description: gear.desc
      };
    }
    
    // Ищем в боеприпасах
    const ammo = Ammunitions.find(a => a.name === cleanName);
    if (ammo) {
      return {
        ...ammo,
        itemType: 'ammunition',
        category: 'Боеприпасы',
        cost: translateCurrency(ammo.cost),
        description: ammo.desc
      };
    }
    
    return null;
  };

  // Функция для определения приоритета сортировки предметов
  const getItemSortPriority = (item: any) => {
    const itemType = item.type;
    
    // Приоритеты: 1 - доспехи, 2 - оружие, 3 - щиты, 4 - остальное
    if (itemType === 'armor') return 1;
    if (itemType === 'weapon') return 2;
    if (itemType === 'shield') return 3;
    return 4;
  };

  // Функция для получения предметов из рюкзака (не надетых)
  const getBackpackItems = () => {
    if (!characterData?.equipment || characterData.equipment.length === 0) {
      return [];
    }
    
    
    // Получаем все надетые предметы
    const allEquippedItems = [
      ...(localEquipped.armor ? [localEquipped.armor] : []),
      ...localEquipped.mainSet.map(item => item.name),
      ...localEquipped.additionalSet.map(item => item.name)
    ];
    
    // Фильтруем предметы, которые не надеты, и преобразуем в объекты
    const result = characterData.equipment
      .filter((item: any) => {
        // Если item - это объект, используем item.name
        const itemName = typeof item === 'string' ? item : (item.name || String(item));
        const cleanName = getCleanItemName(itemName);
        const isNotEquipped = !allEquippedItems.includes(cleanName);
        
        
        return isNotEquipped;
      })
      .map((item: any) => {
        const itemName = typeof item === 'string' ? item : (item.name || String(item));
        const itemType = typeof item === 'object' && item.type ? item.type : getItemType(itemName);
        
        
        // Проверяем, является ли предмет магическим
        const isMagicItem = typeof item === 'object' && item.type === 'magic_item';
        
        
        // Определяем категорию для отображения
        let displayCategory;
        if (isMagicItem) {
          // Для магического оружия показываем вид оружия вместо категории
          if (item.itemType === 'weapon' && item.weapon?.weaponKind) {
            const weaponData = Weapons.find(w => w.key === item.weapon.weaponKind);
            displayCategory = weaponData ? weaponData.name : item.weapon.weaponKind;
          } else {
            displayCategory = 'Магический предмет';
          }
        } else {
          displayCategory = getItemProperty(item, 'category');
        }

        const result = {
          name: itemName,
          type: isMagicItem ? 'magic_item' : getItemProperty(item, 'type'),
          category: displayCategory,
          weight: isMagicItem ? item.weight : getItemProperty(item, 'weight'),
          cost: isMagicItem ? item.cost : getItemProperty(item, 'cost'),
          quantity: getItemProperty(item, 'quantity'),
          equipped: false,
          // Добавляем дополнительные поля для магических предметов
          ...(isMagicItem && {
            magicItemId: item.magicItemId,
            rarity: item.rarity,
            itemType: item.itemType,
            weapon: item.weapon,
            description: item.description
          })
        };
        
        
        return result;
      })
      .sort((a, b) => {
        // Сначала сортируем по приоритету типа предмета
        const priorityA = getItemSortPriority(a);
        const priorityB = getItemSortPriority(b);
        
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        
        // Если приоритеты одинаковые, сортируем по алфавиту
        return a.name.localeCompare(b.name);
      });
    
    return result;
  };

  // Функция для добавления предмета в рюкзак
  const handleAddItem = async (item: any) => {
    const itemKey = `${item.type}-${item.key}`;
    
    // Добавляем предмет в состояние загрузки
    setLoadingItems(prev => new Set(prev).add(itemKey));
    
    try {
      // Имитируем задержку (в реальном приложении здесь будет API вызов)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Добавляем предмет в characterData.equipment
      const newEquipment = [...(characterData.equipment || [])];
      const existingItemIndex = newEquipment.findIndex(eq => {
        const eqName = typeof eq === 'string' ? eq : (eq.name || String(eq));
        const cleanEqName = getCleanItemName(eqName);
        const cleanItemName = getCleanItemName(item.name);
        return cleanEqName === cleanItemName;
      });
      
      if (existingItemIndex >= 0) {
        // Если предмет уже есть, увеличиваем количество
        const existingItem = newEquipment[existingItemIndex];
        if (typeof existingItem === 'object') {
          newEquipment[existingItemIndex] = {
            ...existingItem,
            quantity: (existingItem.quantity || 1) + 1
          };
        } else {
          // Если это строка, конвертируем в объект
          const match = existingItem.match(/^(\d+)x\s+(.+)$/);
          if (match) {
            const currentQuantity = parseInt(match[1]);
            newEquipment[existingItemIndex] = {
              name: match[2],
              type: item.type,
              category: item.category,
              weight: item.weight,
              cost: item.cost,
              quantity: currentQuantity + 1
            };
          } else {
            newEquipment[existingItemIndex] = {
              name: item.name,
              type: item.type,
              category: item.category,
              weight: item.weight,
              cost: item.cost,
              quantity: 2
            };
          }
        }
      } else {
        // Если предмета нет, добавляем новый объект
        newEquipment.push({
          name: item.name,
          type: item.type,
          category: item.category,
          weight: item.weight,
          cost: item.cost,
          quantity: 1
        });
      }

      // Обновляем только equipment (рюкзак), не затрагивая экипировку
      updateEquipment(newEquipment);

      // Показываем toast с успехом
      toast({
        title: "Предмет добавлен!",
        description: `${item.name} успешно добавлен в рюкзак`,
        duration: 3000,
      });
      
    } catch (error) {
      // Показываем toast с ошибкой
      toast({
        title: "Ошибка",
        description: "Не удалось добавить предмет в рюкзак",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      // Убираем предмет из состояния загрузки
      setLoadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  // Функция для конвертации стоимости в медные монеты (ММ)
  const convertToCopper = (cost: string): number => {
    const match = cost.match(/(\d+)\s*(gp|sp|cp|ЗМ|СМ|ММ|pp|ep)/i);
    if (!match) {
      return 0;
    }
    
    const amount = parseInt(match[1]);
    const currency = match[2].toLowerCase();
    
    
    switch (currency) {
      case 'pp':
      case 'пм':
        return amount * 1000; // 1 ПМ = 1000 ММ
      case 'gp':
      case 'зм':
        return amount * 100; // 1 ЗМ = 100 ММ
      case 'ep':
      case 'эм':
        return amount * 50;  // 1 ЭМ = 50 ММ
      case 'sp':
      case 'см':
        return amount * 10;  // 1 СМ = 10 ММ
      case 'cp':
      case 'мм':
        return amount;       // 1 ММ = 1 ММ
      default:
        return 0;
    }
  };

  // Функция для расчета общего количества в ЗМ
  const calculateTotalGold = () => {
    if (!characterData?.currency) return 0;
    const { platinum, gold, electrum, silver, copper } = characterData.currency;
    // Конвертируем все в медные монеты, затем в золотые (электрум учитывается)
    const totalCopper = platinum * 1000 + gold * 100 + electrum * 50 + silver * 10 + copper;
    return totalCopper / 100; // 1 ЗМ = 100 ММ
  };

  // Функция для конвертации валюты при недостатке средств
  const convertCurrency = (currentCurrency: any, requiredCopper: number) => {
    let totalCopper = currentCurrency.platinum * 1000 + 
                     currentCurrency.gold * 100 + 
                     currentCurrency.electrum * 50 + 
                     currentCurrency.silver * 10 + 
                     currentCurrency.copper;
    
    
    // Если недостаточно средств, конвертируем начиная с самых крупных монет
    if (totalCopper < requiredCopper) {
      const newCurrency = { ...currentCurrency };
      
      // Конвертируем платину в золото (1 ПМ = 10 ЗМ = 1000 ММ)
      while (newCurrency.platinum > 0 && totalCopper < requiredCopper) {
        newCurrency.platinum--;
        newCurrency.gold += 10;
        totalCopper += 1000;
      }
      
      // Конвертируем золото в серебро (1 ЗМ = 10 СМ = 100 ММ)
      while (newCurrency.gold > 0 && totalCopper < requiredCopper) {
        newCurrency.gold--;
        newCurrency.silver += 10;
        totalCopper += 100;
      }
      
      // Конвертируем серебро в медь (1 СМ = 10 ММ)
      while (newCurrency.silver > 0 && totalCopper < requiredCopper) {
        newCurrency.silver--;
        newCurrency.copper += 10;
        totalCopper += 10;
      }
      
      return newCurrency;
    }
    
    return currentCurrency;
  };

  // Функция для покупки предмета с указанным количеством
  const handlePurchaseItem = async (item: any, quantity: number) => {
    const itemType = item.itemType || item.type;
    const itemKey = `${itemType}-${item.key}`;

    // Добавляем предмет в состояние загрузки покупки
    setLoadingPurchase(prev => new Set(prev).add(itemKey));

    try {
      // Получаем стоимость предмета из данных предмета
      const itemCost = item.cost || 'Неизвестно';
      
      if (itemCost === 'Неизвестно') {
        throw new Error('Стоимость предмета неизвестна');
      }
      
      // Конвертируем стоимость в медные монеты
      const costInCopper = convertToCopper(itemCost) * quantity;
      
      // Сначала обновляем валюту, затем инвентарь
      let currentCurrency = characterData.currency || { platinum: 0, gold: 0, electrum: 0, silver: 0, copper: 0 };
      
      
      // Конвертируем валюту при необходимости
      const convertedCurrency = convertCurrency(currentCurrency, costInCopper);
      
      // Проверяем, достаточно ли денег после конвертации
      const totalCopperAfterConversion = convertedCurrency.platinum * 1000 + 
                                       convertedCurrency.gold * 100 + 
                                       convertedCurrency.electrum * 50 + 
                                       convertedCurrency.silver * 10 + 
                                       convertedCurrency.copper;
      
      if (costInCopper > totalCopperAfterConversion) {
        const currentTotal = Math.floor(totalCopperAfterConversion / 100);
        const requiredTotal = Math.floor(costInCopper / 100);
        throw new Error(`Требуется: ${requiredTotal} ЗМ, В наличии: ${currentTotal} ЗМ`);
      }
      
      // Имитируем задержку покупки
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Добавляем предмет в characterData.equipment (точно так же, как в handleAddItemWithQuantity)
      const newEquipment = [...(characterData.equipment || [])];
      const existingItemIndex = newEquipment.findIndex(eq => {
        const eqName = typeof eq === 'string' ? eq : (eq.name || String(eq));
        const cleanEqName = getCleanItemName(eqName);
        const cleanItemName = getCleanItemName(item.name);
        return cleanEqName === cleanItemName;
      });
      
      if (existingItemIndex >= 0) {
        // Если предмет уже есть, увеличиваем количество
        const existingItem = newEquipment[existingItemIndex];
        if (typeof existingItem === 'object') {
          newEquipment[existingItemIndex] = {
            ...existingItem,
            quantity: (existingItem.quantity || 1) + quantity
          };
        } else {
          // Если это строка, конвертируем в объект
          const match = existingItem.match(/^(\d+)x\s+(.+)$/);
          if (match) {
            const currentQuantity = parseInt(match[1]);
            newEquipment[existingItemIndex] = {
              name: match[2],
              type: itemType, // Используем правильный тип
              category: item.category,
              weight: item.weight,
              cost: item.cost,
              quantity: currentQuantity + quantity
            };
          } else {
            newEquipment[existingItemIndex] = {
              name: item.name,
              type: itemType, // Используем правильный тип
              category: item.category,
              weight: item.weight,
              cost: item.cost,
              quantity: 1 + quantity
            };
          }
        }
      } else {
        // Если предмета нет, добавляем новый объект
        newEquipment.push({
          name: item.name,
          type: itemType, // Используем правильный тип
          category: item.category,
          weight: item.weight,
          cost: item.cost,
          quantity: quantity
        });
      }

      // Вычитаем стоимость покупки из каждого типа монет по порядку
      // Порядок: Медь → Серебро → Электрум → Золото → Платина
      let remainingCost = costInCopper;
      let newCopper = convertedCurrency.copper;
      let newSilver = convertedCurrency.silver;
      let newElectrum = convertedCurrency.electrum;
      let newGold = convertedCurrency.gold;
      let newPlatinum = convertedCurrency.platinum;
      
      console.log('Starting deduction. Remaining cost:', remainingCost);
      
      // Сначала тратим медь
      if (remainingCost > 0 && newCopper > 0) {
        const copperToSpend = Math.min(newCopper, remainingCost);
        newCopper -= copperToSpend;
        remainingCost -= copperToSpend;
        console.log(`Spent ${copperToSpend} copper. Remaining cost: ${remainingCost}`);
      }
      
      // Затем тратим серебро (1 СМ = 10 ММ)
      if (remainingCost > 0 && newSilver > 0) {
        const silverToSpend = Math.min(newSilver, Math.ceil(remainingCost / 10));
        newSilver -= silverToSpend;
        remainingCost -= silverToSpend * 10;
        console.log(`Spent ${silverToSpend} silver. Remaining cost: ${remainingCost}`);
      }
      
      // Затем тратим электрум (1 ЭМ = 50 ММ)
      if (remainingCost > 0 && newElectrum > 0) {
        const electrumToSpend = Math.min(newElectrum, Math.ceil(remainingCost / 50));
        newElectrum -= electrumToSpend;
        remainingCost -= electrumToSpend * 50;
        console.log(`Spent ${electrumToSpend} electrum. Remaining cost: ${remainingCost}`);
      }
      
      // Затем тратим золото (1 ЗМ = 100 ММ)
      if (remainingCost > 0 && newGold > 0) {
        const goldToSpend = Math.min(newGold, Math.ceil(remainingCost / 100));
        newGold -= goldToSpend;
        remainingCost -= goldToSpend * 100;
        console.log(`Spent ${goldToSpend} gold. Remaining cost: ${remainingCost}`);
      }
      
      // Наконец, тратим платину (1 ПМ = 1000 ММ)
      if (remainingCost > 0 && newPlatinum > 0) {
        const platinumToSpend = Math.min(newPlatinum, Math.ceil(remainingCost / 1000));
        newPlatinum -= platinumToSpend;
        remainingCost -= platinumToSpend * 1000;
        console.log(`Spent ${platinumToSpend} platinum. Remaining cost: ${remainingCost}`);
      }
      
      // Если осталась "сдача" (отрицательный remainingCost), добавляем её обратно
      if (remainingCost < 0) {
        const change = Math.abs(remainingCost);
        console.log(`Change to give back: ${change} copper`);
        
        // Распределяем сдачу: Золото → Серебро → Медь (электрум не создается)
        const changeGold = Math.floor(change / 100);
        let remainingChange = change % 100;
        
        const changeSilver = Math.floor(remainingChange / 10);
        remainingChange = remainingChange % 10;
        
        const changeCopper = remainingChange;
        
        newGold += changeGold;
        newSilver += changeSilver;
        newCopper += changeCopper;
        
        console.log(`Change distributed: ${changeGold} gold, ${changeSilver} silver, ${changeCopper} copper`);
      }
      
      const newCurrency = {
        platinum: newPlatinum,
        gold: newGold,
        electrum: newElectrum,
        silver: newSilver,
        copper: newCopper
      };
      
      console.log('Final currency:', newCurrency);
      
      // Обновляем валюту и equipment одновременно
      if (onUpdateCurrency && onUpdateEquipment) {
        // Создаем обновленный объект char с новой валютой и equipment
        const updatedChar = {
          ...char,
          basics: {
            ...char.basics,
            currency: newCurrency,
            equipment: newEquipment
          }
        };
        
        // Обновляем состояние через setChar
        if (setChar) {
          setChar(updatedChar);
        }
        
        // Сохраняем в БД
        setTimeout(() => {
          if (onSaveAll) {
            onSaveAll();
          }
        }, 50);
      } else {
        // Fallback к отдельным обновлениям
        updateCurrency(newCurrency);
        await new Promise(resolve => setTimeout(resolve, 100));
        updateEquipment(newEquipment);
      }
      
      // Дополнительная задержка для стабилизации состояния
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Показываем toast с успехом
      toast({
        title: "Предмет куплен!",
        description: `${item.name} (${quantity} шт.) успешно куплен`,
        duration: 3000,
      });
      
    } catch (error) {
      // Показываем toast с ошибкой
      const errorMessage = error instanceof Error ? error.message : "Не удалось купить предмет";
      const isInsufficientFunds = errorMessage.includes("Недостаточно средств");
      
      toast({
        title: isInsufficientFunds ? "Недостаточно средств" : "Ошибка покупки",
        description: errorMessage,
        variant: "destructive",
        duration: 5000, // Увеличиваем время показа для ошибок
      });
    } finally {
      // Убираем предмет из состояния загрузки покупки
      setLoadingPurchase(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  // Функция для добавления предмета с указанным количеством
  const handleAddItemWithQuantity = async (item: any, quantity: number) => {
    // Используем itemType вместо type для правильного определения типа предмета
    const itemType = item.itemType || item.type;
    const itemKey = `${itemType}-${item.key}`;
    
    // Добавляем предмет в состояние загрузки
    setLoadingItems(prev => new Set(prev).add(itemKey));
    
    try {
      // Имитируем задержку (в реальном приложении здесь будет API вызов)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Добавляем предмет в characterData.equipment
      const newEquipment = [...(characterData.equipment || [])];
      const existingItemIndex = newEquipment.findIndex(eq => {
        const eqName = typeof eq === 'string' ? eq : (eq.name || String(eq));
        const cleanEqName = getCleanItemName(eqName);
        const cleanItemName = getCleanItemName(item.name);
        return cleanEqName === cleanItemName;
      });
      
      if (existingItemIndex >= 0) {
        // Если предмет уже есть, увеличиваем количество
        const existingItem = newEquipment[existingItemIndex];
        if (typeof existingItem === 'object') {
          newEquipment[existingItemIndex] = {
            ...existingItem,
            quantity: (existingItem.quantity || 1) + quantity
          };
        } else {
          // Если это строка, конвертируем в объект
          const match = existingItem.match(/^(\d+)x\s+(.+)$/);
          if (match) {
            const currentQuantity = parseInt(match[1]);
            newEquipment[existingItemIndex] = {
              name: match[2],
              type: itemType, // Используем правильный тип
              category: item.category,
              weight: item.weight,
              cost: item.cost,
              quantity: currentQuantity + quantity
            };
          } else {
            newEquipment[existingItemIndex] = {
              name: item.name,
              type: itemType, // Используем правильный тип
              category: item.category,
              weight: item.weight,
              cost: item.cost,
              quantity: 1 + quantity
            };
          }
        }
      } else {
        // Если предмета нет, добавляем новый объект
        newEquipment.push({
          name: item.name,
          type: itemType, // Используем правильный тип
          category: item.category,
          weight: item.weight,
          cost: item.cost,
          quantity: quantity
        });
      }

      // Обновляем только equipment (рюкзак), не затрагивая экипировку
      updateEquipment(newEquipment);

      // Показываем toast с успехом
      toast({
        title: "Предметы добавлены!",
        description: `${item.name} (${quantity} шт.) успешно добавлены в рюкзак`,
        duration: 3000,
      });
      
    } catch (error) {
      // Показываем toast с ошибкой
      toast({
        title: "Ошибка",
        description: "Не удалось добавить предметы в рюкзак",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      // Убираем предмет из состояния загрузки
      setLoadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  // Получение всех доступных предметов
  const getAllItems = () => {
    const items: Array<{type: string, key: string, name: string, cost: string, weight: number, category: string}> = [];
    
    // Добавляем оружие
    Weapons.forEach(weapon => {
      items.push({
        type: 'weapon',
        key: weapon.key,
        name: weapon.name,
        cost: translateCurrency(weapon.cost),
        weight: weapon.weight,
        category: 'Оружие'
      });
    });
    
    // Добавляем доспехи
    Armors.forEach(armor => {
      items.push({
        type: 'armor',
        key: armor.key,
        name: armor.name,
        cost: translateCurrency(armor.cost),
        weight: armor.weight,
        category: armor.category === 'shield' ? 'Щиты' : 'Доспехи'
      });
    });
    
    // Добавляем снаряжение
    Gears.forEach(gear => {
      items.push({
        type: 'gear',
        key: gear.key,
        name: gear.name,
        cost: translateCurrency(gear.cost),
        weight: gear.weight,
        category: 'Снаряжение'
      });
    });
    
    // Добавляем боеприпасы
    Ammunitions.forEach(ammo => {
      items.push({
        type: 'ammunition',
        key: ammo.key,
        name: ammo.name,
        cost: translateCurrency(ammo.cost),
        weight: ammo.weight,
        category: 'Боеприпасы'
      });
    });
    
    // Добавляем инструменты
    Tools.forEach(tool => {
      items.push({
        type: 'tool',
        key: tool.key,
        name: tool.name,
        cost: translateCurrency(tool.cost),
        weight: tool.weight,
        category: 'Инструменты'
      });
    });
    
    // Добавляем наборы снаряжения
    EQUIPMENT_PACKS.forEach(pack => {
      items.push({
        type: 'pack',
        key: pack.key,
        name: pack.name,
        cost: translateCurrency(pack.cost),
        weight: pack.weight,
        category: 'Наборы снаряжения'
      });
    });
    
    return items;
  };

  // Получение отфильтрованных предметов
  const getFilteredItems = () => {
    const allItems = getAllItems();
    return allItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchFilter.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  };

  // Получение отфильтрованных предметов инвентаря
  const getFilteredInventoryItems = (items: any[]) => {
    return items.filter(item => {
      const itemName = typeof item === 'string' ? item : (item.name || String(item));
      const matchesSearch = itemName.toLowerCase().includes(inventorySearchFilter.toLowerCase());
      
      // Определяем категорию предмета
      let itemCategory = 'other';
      if (typeof item === 'object' && item.type) {
        if (item.type === 'weapon') itemCategory = 'weapon';
        else if (item.type === 'armor') itemCategory = 'armor';
        else if (item.type === 'tool') itemCategory = 'tool';
      }
      
      const matchesCategory = inventoryCategoryFilter === 'all' || itemCategory === inventoryCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  };

  // Debug: выводим characterData для понимания структуры
  console.log('CharacterData debug:', {
    characterData,
    currency: characterData?.currency,
    weapons: characterData?.weapons,
    weaponsLength: characterData?.weapons?.length,
    weaponsContent: characterData?.weapons?.map(w => ({ key: w, type: typeof w })),
    weaponsArray: characterData?.weapons,
    char,
    charWeapons: char?.weapons,
    equipment: characterData?.equipment,
    equipmentLength: characterData?.equipment?.length
  });
  
  // Детальный лог characterData
  console.log('CharacterData keys:', Object.keys(characterData || {}));
  console.log('CharacterData equipment:', characterData?.equipment);
  console.log('CharacterData equipment type:', typeof characterData?.equipment);
  console.log('CharacterData equipment length:', characterData?.equipment?.length);
  
  // Детальный лог валюты
  if (characterData?.currency) {
    console.log('Currency in characterData:', characterData.currency);
  }
  
  // Дополнительный debug для weapons
  if (characterData?.weapons) {
    console.log('Weapons array details:', characterData.weapons);
    characterData.weapons.forEach((weapon, index) => {
      console.log(`Weapon ${index}:`, weapon);
    });
  }

  // Инициализация и синхронизация локального состояния на основе equipped
  useEffect(() => {
    if (equipped) {
      // Оружие из слота 1 идет в основной набор
      const mainWeapons = equipped.weaponSlot1?.map(w => ({
        name: w.name,
        slots: w.slots,
        isVersatile: (w as any).isVersatile || false,
        versatileMode: (w as any).versatileMode || false
      })) || [];
      
      // Оружие из слота 2 идет в дополнительный набор
      const additionalWeapons = equipped.weaponSlot2?.map(w => ({
        name: w.name,
        slots: w.slots,
        isVersatile: (w as any).isVersatile || false,
        versatileMode: (w as any).versatileMode || false
      })) || [];
      
      // Щиты из слота 1 идет в основной набор
      const mainShields = equipped.shield1 ? [{
        name: equipped.shield1.name,
        slots: (equipped.shield1 as any).slots || 1,
        isVersatile: (equipped.shield1 as any).isVersatile || false,
        versatileMode: (equipped.shield1 as any).versatileMode || false
      }] : [];
      
      // Щиты из слота 2 идет в дополнительный набор
      const additionalShields = equipped.shield2 ? [{
        name: equipped.shield2.name,
        slots: (equipped.shield2 as any).slots || 1,
        isVersatile: (equipped.shield2 as any).isVersatile || false,
        versatileMode: (equipped.shield2 as any).versatileMode || false
      }] : [];
      
      setLocalEquipped({
        armor: equipped.armor?.name || null,
        mainSet: [...mainWeapons, ...mainShields],
        additionalSet: [...additionalWeapons, ...additionalShields],
        otherItems: equipped.otherItems?.map(item => ({
          name: item.name,
          slots: item.slots
        })) || []
      });
    }
  }, [equipped]);

  // Мемоизируем тяжелые вычисления
  const equippedItems = useMemo(() => {
    if (!characterData?.equipment) return [];
    
    const equippedItems = [];
    
    // Доспехи
    if (localEquipped.armor) {
      // Проверяем, является ли это магическим предметом
      const magicItem = characterData.equipment.find(item => 
        typeof item === 'object' && 
        item.type === 'magic_item' && 
        item.name === localEquipped.armor
      );
      
      equippedItems.push({
        name: localEquipped.armor,
        type: 'armor',
        set: 'armor',
        weight: magicItem ? magicItem.weight : getItemProperty(localEquipped.armor, 'weight'),
        cost: magicItem ? magicItem.cost : getItemProperty(localEquipped.armor, 'cost'),
        quantity: magicItem ? magicItem.quantity : getItemProperty(localEquipped.armor, 'quantity'),
        equipped: true,
        slots: 1,
        isVersatile: false,
        versatileMode: false
      });
    }
    
    // Основной набор
    localEquipped.mainSet.forEach(item => {
      // Проверяем, является ли это магическим предметом
      const magicItem = characterData.equipment.find(equipItem => 
        typeof equipItem === 'object' && 
        equipItem.type === 'magic_item' && 
        equipItem.name === item.name
      );
      
      const itemType = magicItem ? (magicItem.itemType === 'weapon' ? 'weapon' : 'armor') : getItemType(item.name);
      
      equippedItems.push({
        name: item.name,
        type: itemType,
        set: 'main',
        weight: magicItem ? magicItem.weight : getItemProperty(item.name, 'weight'),
        cost: magicItem ? magicItem.cost : getItemProperty(item.name, 'cost'),
        quantity: magicItem ? magicItem.quantity : getItemProperty(item.name, 'quantity'),
        equipped: true,
        slots: item.slots,
        isVersatile: item.isVersatile,
        versatileMode: item.versatileMode
      });
    });
    
    // Дополнительный набор
    localEquipped.additionalSet.forEach(item => {
      // Проверяем, является ли это магическим предметом
      const magicItem = characterData.equipment.find(equipItem => 
        typeof equipItem === 'object' && 
        equipItem.type === 'magic_item' && 
        equipItem.name === item.name
      );
      
      const itemType = magicItem ? (magicItem.itemType === 'weapon' ? 'weapon' : 'armor') : getItemType(item.name);
      
      equippedItems.push({
        name: item.name,
        type: itemType,
        set: 'additional',
        weight: magicItem ? magicItem.weight : getItemProperty(item.name, 'weight'),
        cost: magicItem ? magicItem.cost : getItemProperty(item.name, 'cost'),
        quantity: magicItem ? magicItem.quantity : getItemProperty(item.name, 'quantity'),
        equipped: true,
        slots: item.slots,
        isVersatile: item.isVersatile,
        versatileMode: item.versatileMode
      });
    });
    
    // Прочие предметы (магические предметы типа "item")
    localEquipped.otherItems.forEach(item => {
      // Проверяем, является ли это магическим предметом
      const magicItem = characterData.equipment.find(equipItem => 
        typeof equipItem === 'object' && 
        equipItem.type === 'magic_item' && 
        equipItem.name === item.name
      );
      
      equippedItems.push({
        name: item.name,
        type: 'item',
        set: 'other',
        weight: magicItem ? magicItem.weight : 0,
        cost: magicItem ? magicItem.cost : 0,
        quantity: magicItem ? magicItem.quantity : 1,
        equipped: true,
        slots: item.slots,
        isVersatile: false,
        versatileMode: false
      });
    });
    
    return equippedItems;
  }, [localEquipped, characterData?.equipment]);

  const backpackItems = useMemo(() => {
    if (!characterData?.equipment || characterData.equipment.length === 0) return [];
    
    // Получаем все надетые предметы
    const allEquippedItems = [
      ...(localEquipped.armor ? [localEquipped.armor] : []),
      ...localEquipped.mainSet.map(item => item.name),
      ...localEquipped.additionalSet.map(item => item.name),
      ...localEquipped.otherItems.map(item => item.name)
    ];
    
    // Функция для определения приоритета сортировки предметов
    const getItemSortPriority = (item: any) => {
      const itemType = item.type;
      if (itemType === 'magic_item') return 0; // Магические предметы в самом верху
      if (itemType === 'armor') return 1;
      if (itemType === 'weapon') return 2;
      if (itemType === 'shield') return 3;
      return 4;
    };
    
    // Фильтруем предметы, которые не надеты, и преобразуем в объекты
    const result = characterData.equipment
      .filter((item: any) => {
        // Если item - это объект, используем item.name
        const itemName = typeof item === 'string' ? item : (item.name || String(item));
        const cleanName = getCleanItemName(itemName);
        const isNotEquipped = !allEquippedItems.includes(cleanName);
        
        return isNotEquipped;
      })
      .map((item: any) => {
        const itemName = typeof item === 'string' ? item : (item.name || String(item));
        const itemType = typeof item === 'object' && item.type ? item.type : getItemType(itemName);
        
        // Проверяем, является ли предмет магическим
        const isMagicItem = typeof item === 'object' && item.type === 'magic_item';
        
        // Определяем категорию для отображения
        let displayCategory;
        if (isMagicItem) {
          // Для магического оружия показываем вид оружия вместо категории
          if (item.itemType === 'weapon' && item.weapon?.weaponKind) {
            const weaponData = Weapons.find(w => w.key === item.weapon.weaponKind);
            displayCategory = weaponData ? weaponData.name : item.weapon.weaponKind;
          } else {
            displayCategory = 'Магический предмет';
          }
        } else {
          displayCategory = getItemProperty(item, 'category');
        }
        
        const result = {
          name: itemName,
          type: isMagicItem ? 'magic_item' : getItemProperty(item, 'type'),
          category: displayCategory,
          weight: isMagicItem ? item.weight : getItemProperty(item, 'weight'),
          cost: isMagicItem ? item.cost : getItemProperty(item, 'cost'),
          quantity: getItemProperty(item, 'quantity'),
          equipped: false,
          ...(isMagicItem && {
            magicItemId: item.magicItemId,
            rarity: item.rarity,
            itemType: item.itemType,
            weapon: item.weapon,
            description: item.description
          })
        };
        
        return result;
      })
      .sort((a, b) => {
        // Сначала сортируем по приоритету типа предмета
        const priorityA = getItemSortPriority(a);
        const priorityB = getItemSortPriority(b);
        
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        
        // Если приоритеты одинаковые, сортируем по алфавиту
        return a.name.localeCompare(b.name);
      });
    
    return result;
  }, [characterData?.equipment, localEquipped]);

  // Получаем все оружие с информацией о слоте
  const getAllWeapons = () => {
    console.log('getAllWeapons: equipped:', equipped);
    if (!equipped) {
      console.log('getAllWeapons: no equipped data');
      return [];
    }
    
    const activeSlot = equipped.activeWeaponSlot || 1;
    console.log('getAllWeapons: activeSlot:', activeSlot);
    const allWeapons = [];
    
    // Добавляем оружие из первого слота
    console.log('getAllWeapons: weaponSlot1:', equipped.weaponSlot1);
    if (equipped.weaponSlot1 && equipped.weaponSlot1.length > 0) {
      equipped.weaponSlot1.forEach(weapon => {
        console.log('getAllWeapons: adding weapon from slot 1:', weapon);
        
        // Проверяем, является ли это магическим предметом
        let weaponObj = { ...weapon, slot: 1, isActive: activeSlot === 1 };
        
        if (characterData?.equipment) {
          const magicItem = characterData.equipment.find(item => 
            typeof item === 'object' && 
            item.type === 'magic_item' && 
            item.name === weapon.name
          );
          
          if (magicItem && magicItem.itemType === 'weapon') {
            console.log('getAllWeapons: found magic item for equipped weapon:', magicItem);
            weaponObj = {
              ...weaponObj,
              magicItem: true,
              magicItemId: magicItem.magicItemId,
              rarity: magicItem.rarity,
              attackBonus: magicItem.weapon?.attackBonus || 0,
              damageBonus: magicItem.weapon?.damageBonus || 0,
              damageSources: magicItem.weapon?.damageSources || [],
              weaponKind: magicItem.weapon?.weaponKind,
              weaponMastery: magicItem.weapon?.weaponMastery,
              weaponCategory: magicItem.weapon?.weaponCategory,
              weaponRange: magicItem.weapon?.weaponRange,
              weaponProperties: magicItem.weapon?.weaponProperties || []
            } as any;
          }
        }
        
        allWeapons.push(weaponObj);
      });
    }
    
    // Добавляем оружие из второго слота
    console.log('getAllWeapons: weaponSlot2:', equipped.weaponSlot2);
    if (equipped.weaponSlot2 && equipped.weaponSlot2.length > 0) {
      equipped.weaponSlot2.forEach(weapon => {
        console.log('getAllWeapons: adding weapon from slot 2:', weapon);
        
        // Проверяем, является ли это магическим предметом
        let weaponObj = { ...weapon, slot: 2, isActive: activeSlot === 2 };
        
        if (characterData?.equipment) {
          const magicItem = characterData.equipment.find(item => 
            typeof item === 'object' && 
            item.type === 'magic_item' && 
            item.name === weapon.name
          );
          
          if (magicItem && magicItem.itemType === 'weapon') {
            console.log('getAllWeapons: found magic item for equipped weapon:', magicItem);
            weaponObj = {
              ...weaponObj,
              magicItem: true,
              magicItemId: magicItem.magicItemId,
              rarity: magicItem.rarity,
              attackBonus: magicItem.weapon?.attackBonus || 0,
              damageBonus: magicItem.weapon?.damageBonus || 0,
              damageSources: magicItem.weapon?.damageSources || [],
              weaponKind: magicItem.weapon?.weaponKind,
              weaponMastery: magicItem.weapon?.weaponMastery,
              weaponCategory: magicItem.weapon?.weaponCategory,
              weaponRange: magicItem.weapon?.weaponRange,
              weaponProperties: magicItem.weapon?.weaponProperties || []
            } as any;
          }
        }
        
        allWeapons.push(weaponObj);
      });
    }
    
    // Добавляем магические предметы-оружие из инвентаря
    if (characterData?.equipment) {
      const magicWeapons = characterData.equipment.filter(item => 
        item.type === 'magic_item' && item.itemType === 'weapon'
      );
      
      magicWeapons.forEach(weapon => {
        console.log('getAllWeapons: adding magic weapon from inventory:', weapon);
        // Создаем объект оружия в формате, ожидаемом системой
        const weaponObj = {
          name: weapon.name,
          type: weapon.weapon?.weaponType || 'melee',
          slots: 1, // По умолчанию 1 слот
          isVersatile: false,
          versatileMode: false,
          slot: 0, // 0 означает "не экипировано"
          isActive: false,
          // Добавляем данные магического предмета
          magicItem: true,
          magicItemId: weapon.magicItemId,
          rarity: weapon.rarity,
          attackBonus: weapon.weapon?.attackBonus || 0,
          damageBonus: weapon.weapon?.damageBonus || 0,
          damageSources: weapon.weapon?.damageSources || [],
          weaponKind: weapon.weapon?.weaponKind,
          weaponMastery: weapon.weapon?.weaponMastery,
          weaponProperties: weapon.weapon?.weaponProperties || []
        };
        
        allWeapons.push(weaponObj);
      });
    }
    
    console.log('getAllWeapons: final result:', allWeapons);
    return allWeapons;
  };

  // Получаем бонус к атаке для оружия
  const getAttackBonus = (weapon: any) => {
    if (!stats || !proficiencyBonus) return 0;
    
    // Находим данные об оружии по имени
    const weaponData = Weapons.find(w => w.name === weapon.name);
    const weaponType = weaponData?.type || weapon.type || 'melee';
    
    // Для оружия ближнего боя используем силу, для дальнего - ловкость
    const abilityModifier = weaponType === 'ranged' ? 
      Math.floor((stats.dex - 10) / 2) : 
      Math.floor((stats.str - 10) / 2);
    
    // Для магических предметов используем их собственный бонус атаки + модификатор характеристики + бонус мастерства (если есть владение)
    if (weapon.magicItem && weapon.attackBonus !== undefined) {
      const attackBonusNum = typeof weapon.attackBonus === 'string' ? parseInt(weapon.attackBonus) : weapon.attackBonus;
      
      // Проверяем владение оружием
      let hasMastery = false;
      if (weapon.weaponCategory) {
        // Проверяем категорию в characterData.weapons
        hasMastery = characterData?.weapons?.includes(weapon.weaponCategory);
        
        // Также проверяем конкретное мастерство по виду оружия
        if (!hasMastery && weapon.weaponKind && characterData?.weapons) {
          const weaponData = Weapons.find(w => w.key === weapon.weaponKind);
          if (weaponData?.key) {
            hasMastery = characterData.weapons.includes(weaponData.key);
          }
        }
      }
      
      return attackBonusNum + abilityModifier + (hasMastery ? proficiencyBonus : 0);
    }
    
    // Добавляем бонус к атаке из данных оружия
    const weaponBonus = weaponData?.bonusAttack || 0;
    
    return abilityModifier + proficiencyBonus + weaponBonus;
  };

  // Получаем урон для оружия
  const getDamage = (weapon: any) => {
    
    if (!stats) return "1d4";
    
    // Для магических предметов используем их собственные источники урона
    if (weapon.magicItem && weapon.damageSources && weapon.damageSources.length > 0) {
      
      // Создаем строку урона из всех источников
      const damageString = weapon.damageSources.map(source => {
        const diceCount = source.diceCount || 1; // Если diceCount отсутствует, используем 1
        return `${diceCount}${source.diceType}`;
      }).join(' + ');
      
      // Добавляем модификатор характеристики (Силы для ближнего боя, Ловкости для дальнего)
      const weaponType = weapon.weapon?.weaponType || weapon.type || 'melee';
      const abilityModifier = weaponType === 'ranged' ? 
        Math.floor((stats.dex - 10) / 2) : 
        Math.floor((stats.str - 10) / 2);
      
      // Добавляем бонус урона из магического предмета
      const magicDamageBonus = weapon.damageBonus || 0;
      const magicDamageBonusNum = typeof magicDamageBonus === 'string' ? parseInt(magicDamageBonus) : magicDamageBonus;
      const totalModifier = abilityModifier + magicDamageBonusNum;
      
      
      const modifierStr = totalModifier >= 0 ? `+${totalModifier}` : totalModifier.toString();
      
      // Проверяем критическое попадание для магического оружия
      const weaponKey = `${weapon.name}-${weapon.slot}`;
      const isCritical = criticalHits[weaponKey];
      
      let result;
      if (isCritical) {
        // Удваиваем количество кубиков для критического урона во всех источниках
        const doubledDamageString = weapon.damageSources.map(source => {
          const diceCount = source.diceCount || 1;
          return `${parseInt(diceCount.toString()) * 2}${source.diceType}`;
        }).join(' + ');
        result = `${doubledDamageString} ${modifierStr}`;
      } else {
        result = `${damageString} ${modifierStr}`;
      }
      
      console.log('getDamage: magic item result:', result);
      return result;
    }
    
    // Находим данные об оружии по имени
    const weaponData = Weapons.find(w => w.name === weapon.name);
    let baseDamage = weaponData?.damage || "1d4";
    const weaponType = weaponData?.type || 'melee';
    
    // Проверяем, является ли оружие универсальным и используется ли в двуручном режиме
    const isVersatile = weaponData?.properties?.includes('versatile') || false;
    const isTwoHanded = weapon.slots === 2; // Если занимает 2 слота, значит двуручный режим
    
    if (isVersatile && isTwoHanded) {
      // Увеличиваем урон на одну ступень для двуручного режима
      baseDamage = baseDamage.replace(/(\d+)d(\d+)/, (match, num, size) => {
        const diceSize = parseInt(size);
        let newSize = diceSize;
        
        // Увеличиваем размер кубика на 2 (1d4→1d6, 1d6→1d8, 1d8→1d10, 1d10→1d12)
        if (diceSize === 4) newSize = 6;
        else if (diceSize === 6) newSize = 8;
        else if (diceSize === 8) newSize = 10;
        else if (diceSize === 10) newSize = 12;
        else if (diceSize === 12) newSize = 12; // Максимум d12
        
        return `${num}d${newSize}`;
      });
    }
    
    const abilityModifier = weaponType === 'ranged' ? 
      Math.floor((stats.dex - 10) / 2) : 
      Math.floor((stats.str - 10) / 2);
    
    // Добавляем бонус к урону из данных оружия
    const weaponDamageBonus = weaponData?.bonusDamage || 0;
    const totalModifier = abilityModifier + weaponDamageBonus;
    
    const modifierStr = totalModifier >= 0 ? `+${totalModifier}` : totalModifier.toString();
    
    // Проверяем, есть ли критическое попадание для этого оружия
    const weaponKey = `${weapon.name}-${weapon.slot}`;
    const isCritical = criticalHits[weaponKey];
    
    if (isCritical) {
      // Удваиваем количество кубиков для критического урона во всех источниках
      const doubledDamage = baseDamage.replace(/(\d+)d(\d+)/g, (match, num, size) => {
        return `${parseInt(num) * 2}d${size}`;
      });
      return `${doubledDamage}${modifierStr}`;
    }
    
    return `${baseDamage}${modifierStr}`;
  };

  const allWeapons = getAllWeapons();
  console.log('Attacks: equipped:', equipped);
  console.log('Attacks: allWeapons from getAllWeapons:', allWeapons);
  
  // Проверяем оружие в инвентаре
  if (characterData?.equipment) {
    const weaponsInInventory = characterData.equipment.filter(item => 
      item.type === 'weapon' || item.category === 'weapon'
    );
    console.log('Attacks: weapons in inventory:', weaponsInInventory);
    console.log('Attacks: total equipment items:', characterData.equipment.length);
    console.log('Attacks: equipment types:', characterData.equipment.map(item => ({ name: item.name, type: item.type, category: item.category })));
  }

  // Функция для обработки атаки с проверкой критического попадания
  const handleAttack = async (weapon: any, ability: string, bonus: number, isSpell: boolean = false) => {
    const key = isSpell ? `spell-${weapon}` : `${weapon.name}-${weapon.slot}`;
    
    // Устанавливаем состояние загрузки
    setLoadingAttacks(prev => ({ ...prev, [key]: true }));
    
    // Бросаем d20 для атаки
    const attackRoll = Math.floor(Math.random() * 20) + 1;
    const isCritical = attackRoll === 20;
    
    // Тратим боеприпасы для дальнобойного и метательного оружия
    if (!isSpell) {
      const weaponData = Weapons.find(w => w.name === weapon.name);
      if (weaponData) {
        const isThrown = weaponData.properties?.includes('thrown');
        const isRanged = weaponData.type === 'ranged';
        
        // Для дальнобойного и метательного оружия тратим боеприпасы
        if (isRanged || isThrown) {
          consumeAmmunition(weaponData.key);
        }
      }
    }
    
    // Обновляем состояние критических попаданий
    if (isCritical) {
      const key = isSpell ? `spell-${weapon}` : `${weapon.name}-${weapon.slot}`;
      setCriticalHits(prev => ({ ...prev, [key]: true }));
    }
    
    // Вызываем оригинальную функцию onRoll с результатом броска
    if (onRoll) {
      // Передаем результат броска через параметры
      onRoll(isSpell ? weapon : weapon.name, ability, bonus, "Атака", undefined, attackRoll);
    }
    
    // Задержка 1 секунда перед сбросом состояния загрузки
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoadingAttacks(prev => ({ ...prev, [key]: false }));
  };

  // Функция для обработки урона с сбросом критического попадания
  const handleDamage = async (weapon: any, ability: string, modifier: number, damage: string, isSpell: boolean = false, isHealing: boolean = false) => {
    const damageType = isHealing ? "Лечение" : "Урон";
    
    const key = isSpell ? `spell-${weapon}` : `${weapon.name}-${weapon.slot}`;
    
    // Устанавливаем состояние загрузки для урона
    setLoadingDamage(prev => ({ ...prev, [key]: true }));
    
    const isCritical = criticalHits[key];
    
    // Сбрасываем критическое попадание при клике на урон
    if (isCritical) {
      setCriticalHits(prev => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    }
    
    // Вызываем оригинальную функцию onRoll с правильным типом
    onRoll?.(isSpell ? weapon : weapon.name, ability, modifier, damageType, damage);
    
    // Задержка 1 секунда перед сбросом состояния загрузки
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoadingDamage(prev => ({ ...prev, [key]: false }));
  };

  // Функция для получения русского названия заклинания
  const getSpellName = (spellKey: string) => {
    // Ищем заклинание в общем списке
    const spell = Spells.find(s => s.key === spellKey);
    if (spell) return spell.name;
    
    // Если не найдено, возвращаем ключ
    return spellKey;
  };

  // Функция для получения иконки типа урона
  const getDamageIcon = (damageType?: string) => {
    switch (damageType) {
      case "Огонь":
        return "🔥";
      case "Лед":
        return "❄️";
      case "Электричество":
        return "⚡";
      case "Кислота":
        return "🧪";
      case "Яд":
        return "☠️";
      case "Некротический":
        return "💀";
      case "Излучение":
        return "☀️";
      case "Психический":
        return "🧠";
      case "Силовой":
        return "✨";
      case "Гром":
        return "💥";
      default:
        return "🔮";
    }
  };

  // Функция для получения цвета типа урона
  const getDamageColor = (damageType?: string) => {
    switch (damageType) {
      case "Огонь":
        return { border: "#EF4444", bg: "#EF444420", text: "#FCA5A5" }; // Красный
      case "Лед":
        return { border: "#3B82F6", bg: "#3B82F620", text: "#93C5FD" }; // Синий
      case "Электричество":
        return { border: "#60A5FA", bg: "#60A5FA20", text: "#93C5FD" }; // Голубой
      case "Кислота":
        return { border: "#10B981", bg: "#10B98120", text: "#6EE7B7" }; // Зеленый
      case "Яд":
        return { border: "#8B5CF6", bg: "#8B5CF620", text: "#C4B5FD" }; // Фиолетовый
      case "Некротический":
        return { border: "#6B7280", bg: "#6B728020", text: "#D1D5DB" }; // Серый
      case "Излучение":
        return { border: "#F97316", bg: "#F9731620", text: "#FDBA74" }; // Оранжевый
      case "Психический":
        return { border: "#EC4899", bg: "#EC489920", text: "#F9A8D4" }; // Розовый
      case "Силовой":
        return { border: "#F59E0B", bg: "#F59E0B20", text: "#FCD34D" }; // Золотой
      case "Гром":
        return { border: "#F59E0B", bg: "#F59E0B20", text: "#FCD34D" }; // Желтый
      default:
        return { border: "#A855F7", bg: "#A855F720", text: "#C4B5FD" }; // Фиолетовый по умолчанию
    }
  };

  // Функция для получения данных заклинания
  const getSpellData = (spellKey: string) => {
    // Ищем заклинание в общем списке
    const spell = Spells.find(s => s.key === spellKey);
    if (spell) return spell;
    
    // Если не найдено, возвращаем undefined
    return undefined;
  };

  // Получаем количество атак за действие (зависит от уровня и класса)
  const getAttacksPerAction = () => {
    // Базовая атака: 1
    let attacks = 1;
    
    // Добавляем дополнительные атаки из особенностей класса
    if (classKey && level) {
      const classInfo = getClassByKey(classKey);
      if (classInfo?.features) {
        // Проходим по всем уровням от 1 до текущего уровня
        for (let lvl = 1; lvl <= level; lvl++) {
          const features = classInfo.features[lvl];
          if (features) {
            features.forEach(feature => {
              if (feature.extraAttack) {
                attacks += feature.extraAttack;
              }
            });
          }
        }
      }
    }
    
    return attacks;
  };


  // Функция для перевода валютных единиц на русский


  // Функция для получения количества боеприпасов для конкретного оружия
  const getAmmunitionCount = (weaponKey: string) => {
    if (!characterData?.equipment) return 0;
    
    // Находим боеприпасы, которые подходят для этого оружия
    const compatibleAmmo = Ammunitions.filter(ammo => 
      ammo.weapon && ammo.weapon.includes(weaponKey)
    );
    
    let totalCount = 0;
    characterData.equipment.forEach((item: any) => {
      if (typeof item === 'object' && item.name) {
        const ammo = compatibleAmmo.find(a => a.name === item.name);
        if (ammo) {
          totalCount += item.quantity || 1;
        }
      } else if (typeof item === 'string') {
        const ammo = compatibleAmmo.find(a => a.name === item);
        if (ammo) {
          totalCount += getItemQuantity(item);
        }
      }
    });
    
    return totalCount;
  };

  // Функция для проверки, нужно ли оружие боеприпасы
  const needsAmmunition = (weaponName: string) => {
    const weaponData = Weapons.find(w => w.name === weaponName);
    if (!weaponData) return false;
    
    const isThrown = weaponData.properties?.includes('thrown');
    const isRanged = weaponData.type === 'ranged';
    
    // Метательное оружие не требует боеприпасов - само оружие и есть боеприпас
    return isRanged && !isThrown;
  };

  // Функция для проверки доступности боеприпасов
  const hasAmmunition = (weaponName: string) => {
    const weaponData = Weapons.find(w => w.name === weaponName);
    if (!weaponData) return true; // Если оружие не найдено, считаем что боеприпасы есть
    
    if (!needsAmmunition(weaponName)) return true; // Если боеприпасы не нужны, считаем что они есть
    
    const ammoCount = getAmmunitionCount(weaponData.key);
    return ammoCount > 0;
  };

  // Функция для проверки доступности оружия (включая метательное)
  const hasWeaponAvailable = (weaponName: string) => {
    const weaponData = Weapons.find(w => w.name === weaponName);
    if (!weaponData) return true; // Если оружие не найдено, считаем что доступно
    
    const isThrown = weaponData.properties?.includes('thrown');
    
    if (isThrown) {
      // Для метательного оружия проверяем наличие самого оружия в инвентаре
      return hasThrownWeapon(weaponName);
    } else {
      // Для дальнобойного оружия проверяем боеприпасы
      return hasAmmunition(weaponName);
    }
  };

  // Функция для проверки доступности урона (учитывает критическое попадание)
  const hasDamageAvailable = (weaponName: string, weaponSlot: number) => {
    const weaponData = Weapons.find(w => w.name === weaponName);
    if (!weaponData) return true; // Если оружие не найдено, считаем что доступно
    
    // Если есть критическое попадание, урон всегда доступен
    const key = `${weaponName}-${weaponSlot}`;
    if (criticalHits[key]) return true;
    
    const isThrown = weaponData.properties?.includes('thrown');
    
    if (isThrown) {
      // Для метательного оружия проверяем наличие самого оружия в инвентаре
      return hasThrownWeapon(weaponName);
    } else {
      // Для дальнобойного оружия проверяем боеприпасы
      return hasAmmunition(weaponName);
    }
  };

  // Функция для проверки доступности метательного оружия
  const hasThrownWeapon = (weaponName: string) => {
    if (!characterData?.equipment) return false;
    
    // Ищем само оружие в инвентаре
    let weaponCount = 0;
    characterData.equipment.forEach((item: any) => {
      if (typeof item === 'object' && item.name) {
        if (item.name === weaponName) {
          weaponCount += item.quantity || 1;
        }
      } else if (typeof item === 'string') {
        const cleanName = getCleanItemName(item);
        if (cleanName === weaponName) {
          weaponCount += getItemQuantity(item);
        }
      }
    });
    
    return weaponCount > 0;
  };

  // Функция для траты боеприпасов
  const consumeAmmunition = (weaponKey: string) => {
    if (!characterData?.equipment || !setDraft) return false;
    
    // Проверяем, является ли оружие метательным
    const weaponData = Weapons.find(w => w.key === weaponKey);
    const isThrown = weaponData?.properties?.includes('thrown');
    
    if (isThrown) {
      // Для метательного оружия тратим само оружие из инвентаря
      const weaponName = weaponData.name;
      
      for (let i = 0; i < characterData.equipment.length; i++) {
        const item = characterData.equipment[i];
        
        if (typeof item === 'object' && item.name) {
          if (item.name === weaponName && item.quantity > 0) {
            // Уменьшаем количество на 1
            const newEquipment = [...characterData.equipment];
            newEquipment[i] = {
              ...item,
              quantity: item.quantity - 1
            };
            
            // Если количество стало 0, удаляем предмет
            if (newEquipment[i].quantity === 0) {
              newEquipment.splice(i, 1);
            }
            
            // Обновляем экипировку персонажа
            updateEquipment(newEquipment);
            
            return true;
          }
        } else if (typeof item === 'string') {
          const cleanName = getCleanItemName(item);
          if (cleanName === weaponName) {
            const quantity = getItemQuantity(item);
            if (quantity > 1) {
              // Уменьшаем количество в строке
              const newQuantity = quantity - 1;
              const newEquipment = [...characterData.equipment];
              newEquipment[i] = `${newQuantity}x ${cleanName}`;
              
              // Обновляем экипировку персонажа
              updateEquipment(newEquipment);
              
              return true;
            } else {
              // Удаляем предмет полностью
              const newEquipment = characterData.equipment.filter((_, index) => index !== i);
              
              // Обновляем экипировку персонажа
              updateEquipment(newEquipment);
              
              return true;
            }
          }
        }
      }
      
      return false; // Метательное оружие не найдено в инвентаре
    } else {
      // Для дальнобойного оружия ищем боеприпасы
      const compatibleAmmo = Ammunitions.filter(ammo => 
        ammo.weapon && ammo.weapon.includes(weaponKey)
      );
      
      // Ищем первый доступный боеприпас
      for (let i = 0; i < characterData.equipment.length; i++) {
        const item = characterData.equipment[i];
        
        if (typeof item === 'object' && item.name) {
          const ammo = compatibleAmmo.find(a => a.name === item.name);
          if (ammo && item.quantity > 0) {
            // Уменьшаем количество на 1
            const newEquipment = [...characterData.equipment];
            newEquipment[i] = {
              ...item,
              quantity: item.quantity - 1
            };
            
            // Если количество стало 0, удаляем предмет
            if (newEquipment[i].quantity === 0) {
              newEquipment.splice(i, 1);
            }
            
            // Обновляем экипировку персонажа
            updateEquipment(newEquipment);
            
            return true;
          }
        } else if (typeof item === 'string') {
          const ammo = compatibleAmmo.find(a => a.name === item);
          if (ammo) {
            const quantity = getItemQuantity(item);
            if (quantity > 1) {
              // Уменьшаем количество в строке
              const cleanName = getCleanItemName(item);
              const newQuantity = quantity - 1;
              const newEquipment = [...characterData.equipment];
              newEquipment[i] = `${newQuantity}x ${cleanName}`;
              
              // Обновляем экипировку персонажа
              updateEquipment(newEquipment);
              
              return true;
            } else {
              // Удаляем предмет полностью
              const newEquipment = characterData.equipment.filter((_, index) => index !== i);
              
              // Обновляем экипировку персонажа
              updateEquipment(newEquipment);
              
              return true;
            }
          }
        }
      }
      
      return false;
    }
  };

  // Функция для отображения боеприпасов под оружием
  const renderAmmunitionInfo = (itemName: string, noMargin: boolean = false) => {
    const weaponData = Weapons.find(w => w.name === itemName);
    if (!weaponData) return null;
    
    // Проверяем, является ли оружие метательным или дальнобойным
    const isThrown = weaponData.properties?.includes('thrown');
    const isRanged = weaponData.type === 'ranged';
    
    if (!isThrown && !isRanged) return null;
    
    if (isThrown) {
      // Для метательного оружия показываем количество самого оружия в инвентаре
      const weaponCount = hasThrownWeapon(itemName) ? 
        characterData?.equipment?.reduce((count: number, item: any) => {
          if (typeof item === 'object' && item.name === itemName) {
            return count + (item.quantity || 1);
          } else if (typeof item === 'string') {
            const cleanName = getCleanItemName(item);
            if (cleanName === itemName) {
              return count + getItemQuantity(item);
            }
          }
          return count;
        }, 0) || 0 : 0;
      
      if (weaponCount === 0) {
  return (
          <div className={`text-xs text-red-400 ${noMargin ? '' : 'mt-1'}`}>
            Закончились снаряды
          </div>
        );
      }
      
      return (
        <div className={`text-xs text-blue-400 ${noMargin ? '' : 'mt-1'}`}>
          Доступно: {weaponCount} шт.
        </div>
      );
    } else {
      // Для дальнобойного оружия показываем боеприпасы
      const ammoCount = getAmmunitionCount(weaponData.key);
      
      // Определяем название боеприпаса
      let ammoName = '';
      let ammoNameOutOfStock = '';
      if (weaponData.key === 'shortbow' || weaponData.key === 'longbow') {
        ammoName = 'стрел';
        ammoNameOutOfStock = 'стрелы';
      } else if (weaponData.key === 'light-crossbow' || weaponData.key === 'hand-crossbow' || weaponData.key === 'heavy-crossbow') {
        ammoName = 'болтов';
        ammoNameOutOfStock = 'болты';
      } else if (weaponData.key === 'blowgun') {
        ammoName = 'игл';
        ammoNameOutOfStock = 'иглы';
      }
      
      // Если боеприпасы закончились, показываем соответствующее сообщение
      if (ammoCount === 0) {
        return (
          <div className={`text-xs text-red-400 ${noMargin ? '' : 'mt-1'}`}>
            Закончились {ammoNameOutOfStock}
          </div>
        );
      }
      
      return (
        <div className={`text-xs text-blue-400 ${noMargin ? '' : 'mt-1'}`}>
          Доступно: {ammoCount} {ammoName}
        </div>
      );
    }
  };




  // Функция для проверки, является ли оружие универсальным
  const isVersatileWeapon = (itemName: string) => {
    const cleanName = getCleanItemName(itemName);
    const weapon = Weapons.find(w => w.name === cleanName);
    return weapon?.properties?.includes('versatile') || false;
  };

  // Функция для проверки, экипирован ли предмет
  const isItemEquipped = (itemName: string) => {
    const cleanName = getCleanItemName(itemName);
    const itemType = getItemType(itemName);
    
    switch (itemType) {
      case 'armor':
        return localEquipped.armor === cleanName;
      case 'weapon':
      case 'shield':
        return localEquipped.mainSet.some(item => item.name === cleanName) || 
               localEquipped.additionalSet.some(item => item.name === cleanName);
      default:
        return false;
    }
  };

  // Функция для определения количества слотов магического оружия
  const getMagicItemSlots = (magicItem: any) => {
    if (magicItem.itemType === 'weapon' && magicItem.weapon) {
      // Проверяем свойства оружия
      const properties = magicItem.weapon.weaponProperties || [];
      
      // Если есть свойство "two-handed" или "двуручное", занимает 2 слота
      if (properties.includes('two-handed') || properties.includes('Двуручное')) {
        return 2;
      }
      
      // Если есть свойство "versatile" или "универсальное", занимает 1 слот (по умолчанию)
      if (properties.includes('versatile') || properties.includes('Универсальное')) {
        return 1; // По умолчанию одноручный режим
      }
      
      // Остальное оружие занимает 1 слот
      return 1;
    }
    
    // Для доспехов и других предметов
    return 1;
  };

  // Функция для проверки, является ли магическое оружие универсальным
  const isMagicItemVersatile = (magicItem: any) => {
    if (magicItem.itemType === 'weapon' && magicItem.weapon) {
      const properties = magicItem.weapon.weaponProperties || [];
      return properties.includes('versatile') || properties.includes('Универсальное');
    }
    return false;
  };

  // Функция для проверки, можно ли экипировать предмет
  const canEquipItem = (itemName: string) => {
    const cleanName = getCleanItemName(itemName);
    
    console.log('canEquipItem: checking item:', itemName, 'clean name:', cleanName);
    console.log('canEquipItem: characterData.equipment:', characterData?.equipment);
    
    // Проверяем, является ли это магическим предметом из инвентаря
    if (characterData?.equipment) {
      const magicItem = characterData.equipment.find(item => {
        console.log('canEquipItem: checking item in equipment:', item);
        console.log('canEquipItem: item.type:', item.type, 'item.name:', item.name);
        return typeof item === 'object' && 
               item.type === 'magic_item' && 
               item.name === cleanName;
      });
      
      console.log('canEquipItem: found magic item:', magicItem);
      
      if (magicItem) {
        console.log('canEquipItem: magic item type:', magicItem.itemType);
        // Магические предметы можно экипировать только если это оружие или доспех
        if (magicItem.itemType === 'weapon') {
          // Для оружия проверяем слоты
          const requiredSlots = getMagicItemSlots(magicItem);
          const mainUsedSlots = getUsedSlots(localEquipped.mainSet);
          const additionalUsedSlots = getUsedSlots(localEquipped.additionalSet);
          
          const canEquip = (mainUsedSlots + requiredSlots <= 2) || (additionalUsedSlots + requiredSlots <= 2);
          console.log('canEquipItem: weapon can equip:', canEquip);
          return canEquip;
        } else if (magicItem.itemType === 'armor') {
          // Для доспеха проверяем, что нет другого доспеха
          const canEquip = !localEquipped.armor;
          console.log('canEquipItem: armor can equip:', canEquip);
          return canEquip;
        } else if (magicItem.itemType === 'item') {
          // Для магических предметов типа "item" проверяем слоты в "Прочее"
          const otherUsedSlots = getUsedSlots(localEquipped.otherItems);
          const canEquip = otherUsedSlots < 4; // Максимум 4 слота в "Прочее"
          console.log('canEquipItem: item can equip:', canEquip, 'otherUsedSlots:', otherUsedSlots);
          return canEquip;
        }
        
        console.log('canEquipItem: other magic item type, cannot equip');
        return false; // Остальные магические предметы нельзя экипировать
      }
    }
    
    // Обычная логика для стандартных предметов
    const itemType = getItemType(itemName);
    
    if (itemType === 'other') return false;
    
    // Проверяем ограничения
    if (itemType === 'armor' && localEquipped.armor) return false;
    if (itemType === 'shield' && (localEquipped.mainSet.some(item => item.name === cleanName) || localEquipped.additionalSet.some(item => item.name === cleanName))) return false;
    
    if (itemType === 'weapon' || itemType === 'shield') {
      const requiredSlots = getItemSlots(itemName);
      const mainUsedSlots = getUsedSlots(localEquipped.mainSet);
      const additionalUsedSlots = getUsedSlots(localEquipped.additionalSet);
      
      // Проверяем, есть ли место хотя бы в одном наборе
      return (mainUsedSlots + requiredSlots <= 2) || (additionalUsedSlots + requiredSlots <= 2);
    }
    
    return true;
  };

  // Функция для проверки, можно ли переключить универсальный режим
  const canToggleVersatileMode = (itemName: string) => {
    const cleanName = itemName.replace(/^\d+x\s+/, '');
    
    // Ищем оружие в обоих наборах
    const mainItem = localEquipped.mainSet.find(item => item.name === cleanName);
    const additionalItem = localEquipped.additionalSet.find(item => item.name === cleanName);
    const item = mainItem || additionalItem;
    
    if (!item || !item.isVersatile) {
      return false;
    }
    
    // Если переключаемся с двуручного на одноручный - всегда можно
    if (item.versatileMode) {
      return true;
    }
    
    // Если переключаемся с одноручного на двуручный - проверяем доступность слотов
    const currentSet = mainItem ? localEquipped.mainSet : localEquipped.additionalSet;
    const otherSet = mainItem ? localEquipped.additionalSet : localEquipped.mainSet;
    
    const currentUsedSlots = getUsedSlots(currentSet) - item.slots + 2; // 2 слота для двуручного режима
    const otherUsedSlots = getUsedSlots(otherSet);
    
    // Проверяем, есть ли место хотя бы в одном наборе
    return (currentUsedSlots <= 2) || (otherUsedSlots + 2 <= 2);
  };

  // Функция для автоматического сохранения изменений экипировки
  const autoSaveEquipmentChanges = (newLocalEquipped: typeof localEquipped) => {
    if (!equipped) return;
    
    // Конвертируем локальное состояние обратно в формат equipped
    const mainWeapons = newLocalEquipped.mainSet
      .filter(item => {
        // Проверяем, является ли предмет оружием (обычным или магическим)
        const itemType = getItemType(item.name);
        if (itemType === 'weapon') return true;
        
        // Проверяем, является ли предмет магическим оружием
        if (characterData?.equipment) {
          const magicItem = characterData.equipment.find(equipItem => 
            typeof equipItem === 'object' && 
            equipItem.type === 'magic_item' && 
            equipItem.name === item.name
          );
          return magicItem && magicItem.itemType === 'weapon';
        }
        
        return false;
      })
      .map(item => ({
        name: item.name,
        type: 'weapon' as const,
        slots: item.slots,
        isVersatile: item.isVersatile,
        versatileMode: item.versatileMode
      }));
    
    const additionalWeapons = newLocalEquipped.additionalSet
      .filter(item => {
        // Проверяем, является ли предмет оружием (обычным или магическим)
        const itemType = getItemType(item.name);
        if (itemType === 'weapon') return true;
        
        // Проверяем, является ли предмет магическим оружием
        if (characterData?.equipment) {
          const magicItem = characterData.equipment.find(equipItem => 
            typeof equipItem === 'object' && 
            equipItem.type === 'magic_item' && 
            equipItem.name === item.name
          );
          return magicItem && magicItem.itemType === 'weapon';
        }
        
        return false;
      })
      .map(item => ({
        name: item.name,
        type: 'weapon' as const,
        slots: item.slots,
        isVersatile: item.isVersatile,
        versatileMode: item.versatileMode
      }));
    
    const mainShields = newLocalEquipped.mainSet
      .filter(item => {
        // Проверяем, является ли предмет щитом (обычным или магическим)
        const itemType = getItemType(item.name);
        if (itemType === 'shield') return true;
        
        // Проверяем, является ли предмет магическим щитом
        if (characterData?.equipment) {
          const magicItem = characterData.equipment.find(equipItem => 
            typeof equipItem === 'object' && 
            equipItem.type === 'magic_item' && 
            equipItem.name === item.name
          );
          return magicItem && magicItem.itemType === 'armor' && magicItem.armor?.category === 'shield';
        }
        
        return false;
      })
      .map(item => ({
        name: item.name,
        type: 'shield' as const,
        slots: item.slots,
        isVersatile: item.isVersatile,
        versatileMode: item.versatileMode
      }));
    
    const additionalShields = newLocalEquipped.additionalSet
      .filter(item => {
        // Проверяем, является ли предмет щитом (обычным или магическим)
        const itemType = getItemType(item.name);
        if (itemType === 'shield') return true;
        
        // Проверяем, является ли предмет магическим щитом
        if (characterData?.equipment) {
          const magicItem = characterData.equipment.find(equipItem => 
            typeof equipItem === 'object' && 
            equipItem.type === 'magic_item' && 
            equipItem.name === item.name
          );
          return magicItem && magicItem.itemType === 'armor' && magicItem.armor?.category === 'shield';
        }
        
        return false;
      })
      .map(item => ({
        name: item.name,
        type: 'shield' as const,
        slots: item.slots,
        isVersatile: item.isVersatile,
        versatileMode: item.versatileMode
      }));
    
    // Обновляем equipped
    const updatedEquipped = {
      ...equipped,
      weaponSlot1: mainWeapons,
      weaponSlot2: additionalWeapons,
      shield1: mainShields[0] || null,
      shield2: additionalShields[0] || null,
      armor: newLocalEquipped.armor ? {
        name: newLocalEquipped.armor,
        type: 'armor' as const,
        slots: 1,
        isVersatile: false,
        versatileMode: false
      } : null,
      otherItems: newLocalEquipped.otherItems.map(item => ({
        name: item.name,
        type: 'item' as const,
        slots: item.slots
      }))
    };
    
    // Вызываем функцию обновления equipped из родительского компонента
    if (onUpdateEquipped) {
      onUpdateEquipped(updatedEquipped);
    }
  };

  // Функция для переключения универсального режима оружия
  const toggleVersatileMode = (itemName: string) => {
    if (!canToggleVersatileMode(itemName)) {
      return; // Блокируем переключение, если нет места
    }
    
    const cleanName = itemName.replace(/^\d+x\s+/, '');
    
    setLocalEquipped(prev => {
      // Ищем оружие в обоих наборах
      const mainItem = prev.mainSet.find(item => item.name === cleanName);
      const additionalItem = prev.additionalSet.find(item => item.name === cleanName);
      const item = mainItem || additionalItem;
      
      if (!item || !item.isVersatile) {
        return prev;
      }
      
      const newVersatileMode = !item.versatileMode;
      const newSlots = newVersatileMode ? 2 : 1;
      const updatedItem = { ...item, versatileMode: newVersatileMode, slots: newSlots };
      
      // Проверяем, помещается ли оружие в текущий набор
      const currentSet = mainItem ? prev.mainSet : prev.additionalSet;
      const otherSet = mainItem ? prev.additionalSet : prev.mainSet;
      
      const currentUsedSlots = getUsedSlots(currentSet) - item.slots + newSlots;
      const otherUsedSlots = getUsedSlots(otherSet);
      
      let newState = prev;
      
      if (currentUsedSlots <= 2) {
        // Помещается в текущий набор
        if (mainItem) {
          newState = {
            ...prev,
            mainSet: prev.mainSet.map(i => i.name === cleanName ? updatedItem : i)
          };
        } else {
          newState = {
            ...prev,
            additionalSet: prev.additionalSet.map(i => i.name === cleanName ? updatedItem : i)
          };
        }
      } else if (otherUsedSlots + newSlots <= 2) {
        // Помещается в другой набор
        if (mainItem) {
          newState = {
            ...prev,
            mainSet: prev.mainSet.filter(i => i.name !== cleanName),
            additionalSet: [...prev.additionalSet, updatedItem]
          };
        } else {
          newState = {
            ...prev,
            additionalSet: prev.additionalSet.filter(i => i.name !== cleanName),
            mainSet: [...prev.mainSet, updatedItem]
          };
        }
      } else {
        // Не помещается ни в один набор, заменяем текущий
        if (mainItem) {
          newState = {
            ...prev,
            mainSet: [updatedItem]
          };
        } else {
          newState = {
            ...prev,
            additionalSet: [updatedItem]
          };
        }
      }
      
      // Автоматически сохраняем изменения
      autoSaveEquipmentChanges(newState);
      
      return newState;
    });
  };

  // Функция для переключения экипировки предмета
  const toggleItemEquipped = (itemName: string) => {
    const cleanName = getCleanItemName(itemName);
    
    // Проверяем, является ли это магическим предметом из инвентаря
    let itemType = 'other';
    let magicItem = null;
    
    if (characterData?.equipment) {
      magicItem = characterData.equipment.find(item => 
        typeof item === 'object' && 
        item.type === 'magic_item' && 
        item.name === cleanName
      );
      
      if (magicItem) {
        itemType = magicItem.itemType === 'weapon' ? 'weapon' : 
                   magicItem.itemType === 'armor' ? 'armor' : 'other';
      }
    }
    
    // Если не магический предмет, используем обычную логику
    if (!magicItem) {
      itemType = getItemType(itemName);
    }
    
    setLocalEquipped(prev => {
      let newState = prev;
      
      switch (itemType) {
        case 'armor':
          newState = {
            ...prev,
            armor: prev.armor === cleanName ? null : cleanName
          };
          break;
          
        case 'weapon':
        case 'shield':
          // Если предмет уже экипирован, снимаем его
          const mainItem = prev.mainSet.find(item => item.name === cleanName);
          const additionalItem = prev.additionalSet.find(item => item.name === cleanName);
          
          if (mainItem) {
            newState = {
              ...prev,
              mainSet: prev.mainSet.filter(item => item.name !== cleanName)
            };
          } else if (additionalItem) {
            newState = {
              ...prev,
              additionalSet: prev.additionalSet.filter(item => item.name !== cleanName)
            };
          } else {
            // Если не экипирован, добавляем в подходящий набор
            const isVersatile = magicItem ? isMagicItemVersatile(magicItem) : isVersatileWeapon(itemName);
            const requiredSlots = magicItem ? getMagicItemSlots(magicItem) : getItemSlots(itemName, false);
            const mainUsedSlots = getUsedSlots(prev.mainSet);
            const additionalUsedSlots = getUsedSlots(prev.additionalSet);
            
            const newItem = {
              name: cleanName,
              slots: requiredSlots,
              isVersatile,
              versatileMode: false
            };
            
            // Сначала пытаемся добавить в основной набор
            if (mainUsedSlots + requiredSlots <= 2) {
              newState = {
                ...prev,
                mainSet: [...prev.mainSet, newItem]
              };
            }
            // Если не помещается в основной, добавляем в дополнительный
            else if (additionalUsedSlots + requiredSlots <= 2) {
              newState = {
                ...prev,
                additionalSet: [...prev.additionalSet, newItem]
              };
            }
            // Если не помещается ни в один, заменяем основной набор
            else {
              newState = {
                ...prev,
                mainSet: [newItem]
              };
            }
          }
          break;
          
        case 'other':
          // Обработка магических предметов типа "item"
          const otherItem = prev.otherItems.find(item => item.name === cleanName);
          
          if (otherItem) {
            // Если предмет уже экипирован, снимаем его
            newState = {
              ...prev,
              otherItems: prev.otherItems.filter(item => item.name !== cleanName)
            };
          } else {
            // Если не экипирован, добавляем в прочие предметы
            const newItem = {
              name: cleanName,
              slots: 1 // Магические предметы типа "item" занимают 1 слот
            };
            
            newState = {
              ...prev,
              otherItems: [...prev.otherItems, newItem]
            };
          }
          break;
          
        default:
          newState = prev;
      }
      
      // Автоматически сохраняем изменения
      autoSaveEquipmentChanges(newState);
      
      return newState;
    });
  };

  // Функция для подсчета слотов, занятых предметом
  const getItemSlots = (itemName: string, versatileMode?: boolean) => {
    const cleanName = itemName.replace(/^\d+x\s+/, '');
    const itemType = getItemType(itemName);
    
    if (itemType === 'weapon') {
      const weapon = Weapons.find(w => w.name === cleanName);
      if (weapon?.properties?.includes('two-handed')) {
        return 2;
      }
      if (weapon?.properties?.includes('versatile') && versatileMode) {
        return 2;
      }
      return 1;
    }
    
    if (itemType === 'shield') {
      return 1;
    }
    
    return 0;
  };

  // Функция для подсчета занятых слотов в наборе
  const getUsedSlots = (set: Array<{name: string, slots: number, isVersatile?: boolean, versatileMode?: boolean}>) => {
    return set.reduce((total, item) => total + item.slots, 0);
  };

  // Функция для подсчета свободных слотов в наборе
  const getFreeSlots = (set: Array<{name: string, slots: number, isVersatile?: boolean, versatileMode?: boolean}>) => {
    const used = getUsedSlots(set);
    return Math.max(0, 2 - used); // Максимум 2 слота на набор
  };

  // Функция для подсчета занятых слотов в наборе
  const getUsedSlotsCount = (set: Array<{name: string, slots: number, isVersatile?: boolean, versatileMode?: boolean}>) => {
    return getUsedSlots(set);
  };

  // Подсчет общего веса инвентаря
  const calculateTotalWeight = () => {
    if (!characterData?.equipment) {
      return 0;
    }
    
    let totalWeight = 0;
    characterData.equipment.forEach((item: any) => {
      const weight = getItemWeight(item);
      totalWeight += weight;
    });
    
    return totalWeight;
  };

  // Расчет максимального переносимого веса
  const calculateMaxCarryWeight = () => {
    const strength = stats?.str || 10;
    const baseCapacity = strength * 15; // Базовая формула D&D 5e
    
    // Добавляем capacity от надетых предметов
    const equippedCapacity = equipped?.capacityItem?.capacity || 0;
    
    return baseCapacity + equippedCapacity;
  };

  // Проверка перегрузки
  const isOverloaded = (currentWeight: number) => {
    const maxWeight = calculateMaxCarryWeight();
    return currentWeight > maxWeight;
  };

  // Компонент для отображения валюты с иконками
  const CurrencyDisplay = () => {
    if (!characterData?.currency) return null;
    
    const { platinum, gold, electrum, silver, copper } = characterData.currency;
    const totalValue = platinum * 1000 + gold * 100 + electrum * 50 + silver * 10 + copper;
    
    if (totalValue === 0) return null;
    
    const currencyItems = [];
    
    if (platinum > 0) {
      currencyItems.push(
        <div key="platinum" className="flex items-center gap-1 cursor-help">
          <div 
            className="w-4 h-4 flex items-center justify-center"
            onMouseEnter={(e) => {
              // Очищаем предыдущий таймаут
              if (currencyTimeout) {
                clearTimeout(currencyTimeout);
                setCurrencyTimeout(null);
              }
              
              const rect = e.currentTarget.getBoundingClientRect();
              setHoveredCurrency('platinum');
              setCurrencyPosition({
                x: rect.left + rect.width / 2,
                y: rect.top
              });
            }}
            onMouseLeave={() => {
              // Устанавливаем таймаут для скрытия подсказки
              const timeout = setTimeout(() => {
                setHoveredCurrency(null);
                setCurrencyPosition(null);
                setCurrencyTimeout(null);
              }, 100);
              setCurrencyTimeout(timeout);
            }}
          >
            {/* Ромб (платина) */}
            <div className="w-2 h-2 transform rotate-45" style={{ backgroundColor: '#E5E4E2' }}></div>
          </div>
          <span className="text-sm font-semibold text-gray-300">{platinum}</span>
        </div>
      );
    }
    
    if (gold > 0) {
      currencyItems.push(
        <div key="gold" className="flex items-center gap-1 cursor-help">
          <div 
            className="w-4 h-4 flex items-center justify-center"
            onMouseEnter={(e) => {
              // Очищаем предыдущий таймаут
              if (currencyTimeout) {
                clearTimeout(currencyTimeout);
                setCurrencyTimeout(null);
              }
              
              const rect = e.currentTarget.getBoundingClientRect();
              setHoveredCurrency('gold');
              setCurrencyPosition({
                x: rect.left + rect.width / 2,
                y: rect.top
              });
            }}
            onMouseLeave={() => {
              // Устанавливаем таймаут для скрытия подсказки
              const timeout = setTimeout(() => {
                setHoveredCurrency(null);
                setCurrencyPosition(null);
                setCurrencyTimeout(null);
              }, 100);
              setCurrencyTimeout(timeout);
            }}
          >
            {/* Круг (золото) */}
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#DAA520' }}></div>
          </div>
          <span className="text-sm font-semibold" style={{ color: '#DAA520' }}>{gold}</span>
        </div>
      );
    }
    
    if (electrum > 0) {
      currencyItems.push(
        <div key="electrum" className="flex items-center gap-1 cursor-help">
          <div 
            className="w-4 h-4 flex items-center justify-center"
            onMouseEnter={(e) => {
              // Очищаем предыдущий таймаут
              if (currencyTimeout) {
                clearTimeout(currencyTimeout);
                setCurrencyTimeout(null);
              }
              
              const rect = e.currentTarget.getBoundingClientRect();
              setHoveredCurrency('electrum');
              setCurrencyPosition({
                x: rect.left + rect.width / 2,
                y: rect.top
              });
            }}
            onMouseLeave={() => {
              // Устанавливаем таймаут для скрытия подсказки
              const timeout = setTimeout(() => {
                setHoveredCurrency(null);
                setCurrencyPosition(null);
                setCurrencyTimeout(null);
              }, 100);
              setCurrencyTimeout(timeout);
            }}
          >
            {/* Шестиугольник (электрум) */}
            <div 
              className="w-2 h-2" 
              style={{ 
                backgroundColor: '#C0C0C0',
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
              }}
            ></div>
          </div>
          <span className="text-sm font-semibold text-gray-300">{electrum}</span>
        </div>
      );
    }
    
    if (silver > 0) {
      currencyItems.push(
        <div key="silver" className="flex items-center gap-1 cursor-help">
          <div 
            className="w-4 h-4 flex items-center justify-center"
            onMouseEnter={(e) => {
              // Очищаем предыдущий таймаут
              if (currencyTimeout) {
                clearTimeout(currencyTimeout);
                setCurrencyTimeout(null);
              }
              
              const rect = e.currentTarget.getBoundingClientRect();
              setHoveredCurrency('silver');
              setCurrencyPosition({
                x: rect.left + rect.width / 2,
                y: rect.top
              });
            }}
            onMouseLeave={() => {
              // Устанавливаем таймаут для скрытия подсказки
              const timeout = setTimeout(() => {
                setHoveredCurrency(null);
                setCurrencyPosition(null);
                setCurrencyTimeout(null);
              }, 100);
              setCurrencyTimeout(timeout);
            }}
          >
            {/* Треугольник (серебро) */}
            <div 
              className="w-3 h-3" 
              style={{ 
                backgroundColor: '#C0C0C0',
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
              }}
            ></div>
          </div>
          <span className="text-sm font-semibold text-gray-300">{silver}</span>
        </div>
      );
    }
    
    if (copper > 0) {
      currencyItems.push(
        <div key="copper" className="flex items-center gap-1 cursor-help">
          <div 
            className="w-4 h-4 flex items-center justify-center"
            onMouseEnter={(e) => {
              // Очищаем предыдущий таймаут
              if (currencyTimeout) {
                clearTimeout(currencyTimeout);
                setCurrencyTimeout(null);
              }
              
              const rect = e.currentTarget.getBoundingClientRect();
              setHoveredCurrency('copper');
              setCurrencyPosition({
                x: rect.left + rect.width / 2,
                y: rect.top
              });
            }}
            onMouseLeave={() => {
              // Устанавливаем таймаут для скрытия подсказки
              const timeout = setTimeout(() => {
                setHoveredCurrency(null);
                setCurrencyPosition(null);
                setCurrencyTimeout(null);
              }, 100);
              setCurrencyTimeout(timeout);
            }}
          >
            {/* Квадрат (медь) */}
            <div className="w-3 h-3" style={{ backgroundColor: '#B87333' }}></div>
          </div>
          <span className="text-sm font-semibold text-orange-400">{copper}</span>
        </div>
      );
    }
    
  return (
      <div 
        className="flex items-center gap-3 mr-4"
        onMouseLeave={() => {
          // Очищаем таймаут и сразу скрываем подсказку
          if (currencyTimeout) {
            clearTimeout(currencyTimeout);
            setCurrencyTimeout(null);
          }
          setHoveredCurrency(null);
          setCurrencyPosition(null);
        }}
      >
        {currencyItems}
      </div>
    );
  };

  const tabs = [
    { key: "actions" as TabType, label: "ДЕЙСТВИЯ" },
    { key: "spells" as TabType, label: "ЗАКЛИНАНИЯ" },
    { key: "inventory" as TabType, label: "ИНВЕНТАРЬ" },
    { key: "features" as TabType, label: "ОСОБЕННОСТИ" }
  ];

  const actionTypes = [
    { key: "attack" as ActionType, label: "АТАКА" },
    { key: "action" as ActionType, label: "ДЕЙСТВИЕ" },
    { key: "bonus" as ActionType, label: "БОНУСНОЕ ДЕЙСТВИЕ" },
    { key: "reaction" as ActionType, label: "РЕАКЦИЯ" }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "actions":
  return (
          <div>
            {/* Подменю типов действий */}
            <div 
              className="flex gap-1 mb-2"
            >
              {actionTypes.map((actionType) => {
                const isActive = activeActionType === actionType.key;
                const frameColorHex = getFrameColor(frameColor);
                
                return (
                  <button
                    key={actionType.key}
                    onClick={() => setActiveActionType(actionType.key)}
                    className="px-2 py-1 text-xs font-semibold uppercase transition-all duration-200 relative rounded"
                    style={{
                      color: isActive ? '#FFFFFF' : '#6B7280',
                      backgroundColor: isActive ? frameColorHex : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = `${frameColorHex}20`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {actionType.label}
                  </button>
                );
              })}
            </div>
            
            {/* Заголовок с информацией о количестве атак */}
            {activeActionType === "attack" && (
              <div className="mt-5">
                <div 
                  className="text-xs font-semibold uppercase mb-4 flex items-center justify-between pb-2"
                  style={{
                    borderBottom: `1px solid ${getFrameColor(frameColor)}60`
                  }}
                >
                  <div className="flex items-center">
                    <span style={{ color: getFrameColor(frameColor) }}>
                      ДЕЙСТВИЯ
                    </span>
                    <span className="text-gray-400 ml-2">• Атак за действие: {getAttacksPerAction()}</span>
                    <span className="text-gray-400 ml-2">• АКТИВНЫЙ НАБОР:</span>
                    
                    {/* Кнопки переключения слотов */}
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => onSwitchWeaponSlot?.(1)}
                        className={`px-3 py-1 text-sm font-semibold rounded transition-all duration-200 w-[25px] h-[25px] flex items-center justify-center ${
                          (equipped?.activeWeaponSlot || 1) === 1 
                            ? 'text-white' 
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                        style={{
                          backgroundColor: (equipped?.activeWeaponSlot || 1) === 1 
                            ? getFrameColor(frameColor)
                            : 'transparent',
                          border: `1px solid ${getFrameColor(frameColor)}40`
                        }}
                      >
                        I
                      </button>
                      <button
                        onClick={() => onSwitchWeaponSlot?.(2)}
                        className={`px-3 py-1 text-sm font-semibold rounded transition-all duration-200 w-[25px] h-[25px] flex items-center justify-center ${
                          (equipped?.activeWeaponSlot || 1) === 2 
                            ? 'text-white' 
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                        style={{
                          backgroundColor: (equipped?.activeWeaponSlot || 1) === 2 
                            ? getFrameColor(frameColor)
                            : 'transparent',
                          border: `1px solid ${getFrameColor(frameColor)}40`
                        }}
                      >
                        II
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Контент в зависимости от выбранного типа действия */}
      <div className="space-y-2 text-sm">
              {activeActionType === "attack" && (
                <div>
                  {/* Заголовки таблицы */}
                  <div className="grid gap-2 text-sm font-semibold uppercase text-gray-400 mb-2 pb-1 items-center" 
                       style={{ 
                         gridTemplateColumns: '2fr 1fr 1fr 1fr',
                         borderBottom: `1px solid ${getFrameColor(frameColor)}20` 
                       }}>
                    <div className="flex items-center justify-start">АТАКА</div>
                    <div className="flex items-center justify-center">ДАЛЬНОСТЬ</div>
                    <div className="flex items-center justify-center">ПОПАДАНИЕ</div>
                    <div className="flex items-center justify-center">УРОН</div>
          </div>
                  
                  {/* Строки с оружием и заклинаниями */}
                  {(() => {
                    const allActions = [];
                    
                    // Добавляем только активное оружие
                    console.log('Attacks: allWeapons:', allWeapons);
                    const activeWeapons = allWeapons.filter(weapon => weapon.isActive);
                    console.log('Attacks: activeWeapons:', activeWeapons);
                    activeWeapons.forEach((weapon, i) => {
                      console.log(`Attacks: adding weapon ${weapon.name} to actions`);
                      allActions.push({ type: 'weapon', data: weapon, index: i });
                    });
                    
                    // Добавляем заклинания только с castingTime = "Действие"
                    console.log('Attacks: characterData:', characterData);
                    console.log('Attacks: characterData.spells:', characterData?.spells);
                    if (characterData?.spells?.length > 0) {
                      console.log('Attacks: characterData.spells:', characterData.spells);
                      characterData.spells.forEach((spell: string, i: number) => {
                        const spellData = getSpellData(spell);
                        console.log(`Attacks: spell ${spell}:`, spellData);
                        // Проверяем, является ли заклинание действием
                        const castingTime = spellData?.castingTime;
                        const isAction = Array.isArray(castingTime) 
                            ? castingTime.includes("Действие")
                            : castingTime === "Действие";
                        console.log(`Attacks: spell ${spell} castingTime:`, castingTime, 'isAction:', isAction, 'isCombat:', spellData?.isCombat);
                        if (isAction && spellData?.isCombat) {
                          allActions.push({ type: 'spell', data: spell, index: i });
                        }
                      });
                    }
                    
                    console.log('Attacks: final allActions:', allActions);
                    if (allActions.length === 0) {
                      return (
                        <div className="text-center text-gray-500 text-sm py-4">
                          Нет доступных действий
                        </div>
                      );
                    }
                    
                    return allActions.map((action, i) => {
                      if (action.type === 'weapon') {
                        const weapon = action.data;
                        const attackBonus = getAttackBonus(weapon);
                        const damage = getDamage(weapon);
                        const weaponData = Weapons.find(w => w.name === weapon.name);
                        const range = weapon.magicItem && weapon.weaponRange ? 
                          (weapon.weaponRange.includes('/') ? weapon.weaponRange : `${weapon.weaponRange} фт.`) : 
                          (weaponData?.range || (weaponData?.type === 'melee' ? '5 фт.' : '-'));
                        
                        // Определяем владение оружием
                        const hasWeaponMastery = () => {
                          if (weapon.magicItem && weapon.weaponCategory) {
                            // Для магического оружия проверяем категорию в characterData.weapons
                            const hasCategoryMastery = characterData?.weapons?.includes(weapon.weaponCategory);
                            
                            // Также проверяем конкретное мастерство по виду оружия
                            let hasSpecificMastery = false;
                            if (weapon.weaponKind && characterData?.weapons) {
                              // Ищем оружие с таким же видом в списке оружия
                              const weaponData = Weapons.find(w => w.key === weapon.weaponKind);
                              if (weaponData?.key) {
                                hasSpecificMastery = characterData.weapons.includes(weaponData.key);
                              }
                            }
                            
                            return hasCategoryMastery || hasSpecificMastery;
                          } else if (weaponData?.mastery) {
                            // Для обычного оружия проверяем конкретное мастерство
                            return characterData?.weapons?.includes(weaponData.key);
                          }
                          return false;
                        };

                        const hasMastery = hasWeaponMastery();
                        
                        return (
                          <div key={`weapon-${action.index}`}>
                            <div className={`grid gap-2 text-sm py-1 items-center ${!weapon.isActive ? 'opacity-60' : ''}`}
                                 style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
                              <div className="text-gray-200 flex flex-col justify-start relative">
                                <div className="flex items-center">
                                  <span className="text-sm text-gray-500 mr-1 w-3 inline-block text-center">{weapon.slot === 1 ? 'I' : 'II'}</span>
                                  <div className="flex items-center">
                                    <div className="flex flex-col">
                                      <div className="flex items-center">
                                        {weapon.name}
                                        {hasMastery && (
                                          <span 
                                            className="ml-1 text-lg cursor-help relative"
                                            style={{ color: getFrameColor(frameColor) }}
                                            onMouseEnter={(e) => {
                                              const rect = e.currentTarget.getBoundingClientRect();
                                              setHoveredWeapon(`${weapon.name}-${weapon.slot}`);
                                              setStarPosition({
                                                x: rect.left + rect.width / 2,
                                                y: rect.top
                                              });
                                            }}
                                            onMouseLeave={() => {
                                              setHoveredWeapon(null);
                                              setStarPosition(null);
                                            }}
                                          >
                                            ★
                                          </span>
                                        )}
                                      </div>
                                      {weapon.magicItem && weapon.weaponKind && (
                                        <div className="text-xs text-gray-400 mt-0.5">
                                          {Weapons.find(w => w.key === weapon.weaponKind)?.name || weapon.weaponKind}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {/* Показываем количество боеприпасов для дальнобойного оружия с отступом под номер слота */}
                                <div className="ml-4">
                                  {renderAmmunitionInfo(weapon.name, true)}
                                </div>
                              </div>
                              <div className="text-gray-300 flex items-center justify-center">{range}</div>
                              <div 
                                className={`text-gray-300 font-semibold border-2 w-[70px] rounded-md px-2 py-1 transition-all duration-200 flex items-center justify-center mx-auto ${
                                  hasWeaponAvailable(weapon.name) ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{
                                  borderColor: hasWeaponAvailable(weapon.name) ? `${getFrameColor(frameColor)}40` : '#6B7280',
                                  backgroundColor: 'transparent'
                                }}
                                onClick={() => hasWeaponAvailable(weapon.name) && handleAttack(weapon, weaponData?.type === 'ranged' ? 'dex' : 'str', attackBonus)}
                                onMouseEnter={(e) => {
                                  if (!hasWeaponAvailable(weapon.name)) return;
                                  const lightColor = criticalHits[`${weapon.name}-${weapon.slot}`] 
                                    ? '#F59E0B' 
                                    : getFrameColor(frameColor);
                                  e.currentTarget.style.backgroundColor = `${lightColor}20`;
                                }}
                                onMouseLeave={(e) => {
                                  if (!hasWeaponAvailable(weapon.name)) return;
                                  e.currentTarget.style.backgroundColor = criticalHits[`${weapon.name}-${weapon.slot}`] 
                                    ? '#F59E0B20' 
                                    : 'transparent';
                                }}
                              >
                                {loadingAttacks[`${weapon.name}-${weapon.slot}`] ? (
                                  <div className="w-4 h-5 flex items-center justify-center">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  </div>
                                ) : (
                                  attackBonus > 0 ? `+${attackBonus}` : attackBonus === 0 ? '0' : attackBonus
                                )}
                              </div>
                              <div className="relative flex items-center justify-center mx-auto">
                                {/* Молния слева от рамки (абсолютное позиционирование) */}
                                {criticalHits[`${weapon.name}-${weapon.slot}`] && (
                                  <span className="absolute -left-6 text-yellow-400 text-lg animate-pulse z-10">
                                    ⚡
                                  </span>
                                )}
                                
                                {/* Рамка с уроном */}
                                <div 
                                  className={`text-gray-300 font-semibold border-2 w-[70px] rounded-md px-2 py-1 transition-all duration-200 flex items-center justify-center ${
                                    !hasDamageAvailable(weapon.name, weapon.slot) 
                                      ? 'cursor-not-allowed opacity-50'
                                      : criticalHits[`${weapon.name}-${weapon.slot}`] 
                                        ? 'text-yellow-300 font-bold animate-pulse cursor-pointer' 
                                        : 'cursor-pointer'
                                  }`}
                                  style={{
                                    borderColor: !hasDamageAvailable(weapon.name, weapon.slot) 
                                      ? '#6B7280'
                                      : criticalHits[`${weapon.name}-${weapon.slot}`] 
                                        ? '#F59E0B' 
                                        : `${getFrameColor(frameColor)}40`,
                                    backgroundColor: !hasDamageAvailable(weapon.name, weapon.slot)
                                      ? 'transparent'
                                      : criticalHits[`${weapon.name}-${weapon.slot}`] 
                                        ? '#F59E0B20' 
                                        : 'transparent'
                                  }}
                                  onClick={() => {
                                    if (!hasDamageAvailable(weapon.name, weapon.slot)) return;
                                    const weaponData = Weapons.find(w => w.name === weapon.name);
                                    const weaponType = weaponData?.type || weapon.type || 'melee';
                                    const abilityModifier = weaponType === 'ranged' ? 
                                      Math.floor(((stats?.dex || 10) - 10) / 2) : 
                                      Math.floor(((stats?.str || 10) - 10) / 2);
                                    
                                    // Для магических предметов добавляем бонус урона
                                    const magicDamageBonus = weapon.damageBonus || 0;
                                    const magicDamageBonusNum = typeof magicDamageBonus === 'string' ? parseInt(magicDamageBonus) : magicDamageBonus;
                                    const totalModifier = abilityModifier + magicDamageBonusNum;
                                    
                                    // Для магического оружия используем результат getDamage, который уже учитывает критический урон
                                    const damageString = getDamage(weapon);
                                    
                                    // Извлекаем только кости урона (без модификатора) для передачи в onRoll
                                    const damageDice = weapon.damageSources ? 
                                      weapon.damageSources.map(source => {
                                        const diceCount = source.diceCount || 1;
                                        const weaponKey = `${weapon.name}-${weapon.slot}`;
                                        const isCritical = criticalHits[weaponKey];
                                        const finalDiceCount = isCritical ? parseInt(diceCount.toString()) * 2 : parseInt(diceCount.toString());
                                        return `${finalDiceCount}${source.diceType}`;
                                      }).join(' + ') : 
                                      damage;
                                    
                                    // Добавляем модификатор к костям для правильного расчета
                                    const damageWithModifier = `${damageDice}${totalModifier >= 0 ? '+' : ''}${totalModifier}`;
                                    
                                    
                                    handleDamage(weapon, weaponType === 'ranged' ? 'dex' : 'str', totalModifier, damageWithModifier);
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!hasDamageAvailable(weapon.name, weapon.slot)) return;
                                    const lightColor = criticalHits[`${weapon.name}-${weapon.slot}`] 
                                      ? '#F59E0B' 
                                      : getFrameColor(frameColor);
                                    e.currentTarget.style.backgroundColor = `${lightColor}20`;
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!hasDamageAvailable(weapon.name, weapon.slot)) return;
                                    e.currentTarget.style.backgroundColor = criticalHits[`${weapon.name}-${weapon.slot}`] 
                                      ? '#F59E0B20' 
                                      : 'transparent';
                                  }}
                                >
                                  {loadingDamage[`${weapon.name}-${weapon.slot}`] ? (
                                    <div className="w-4 h-5 flex items-center justify-center">
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    </div>
                                  ) : (
                                    damage
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Пунктирная линия между строками (кроме последней) */}
                            {i < allActions.length - 1 && (
                              <div 
                                className="my-1 h-px"
                                style={{
                                  borderTop: `1px dotted ${getFrameColor(frameColor)}40`
                                }}
                              />
                            )}
                          </div>
                        );
                      } else if (action.type === 'spell') {
                        const spellKey = action.data;
                        const spellName = getSpellName(spellKey);
                        const spellData = getSpellData(spellKey);
                        // Для заклинаний используем харизму (паладин)
                        const spellAbility = 'cha';
                        const spellModifier = Math.floor(((stats?.[spellAbility] || 10) - 10) / 2);
                        const spellAttackBonus = spellModifier + (proficiencyBonus || 0);
                        
                        // Получаем дальность из данных заклинания
                        let spellRange = spellData?.range || "60 фт.";
                        
                        // Преобразуем в строку, если это число
                        if (typeof spellRange === 'number') {
                          spellRange = String(spellRange);
                        }
                        
                        // Если дальность не содержит единицы измерения, добавляем "фт." только для числовых значений
                        if (spellRange && typeof spellRange === 'string' && !spellRange.includes('фт') && !spellRange.includes('м') && !spellRange.includes('км') && !spellRange.includes('на себя') && !spellRange.toLowerCase().includes('касание') && !isNaN(Number(spellRange))) {
                          spellRange = `${spellRange} фт.`;
                        }
                        
                        // Проверяем, нужно ли показывать бонус попадания
                        const isSelfTarget = spellRange && spellRange.toLowerCase().includes('на себя');
                        const showAttackBonus = !isSelfTarget;
                        
                        // Получаем урон из данных заклинания (без модификатора характеристики)
                        const spellDamage = spellData?.damage?.dice || "1d10";
                        
                        return (
                          <div key={`spell-${action.index}`}>
                            <div className="grid gap-2 text-sm py-1 items-center"
                                 style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
                              <div className="text-gray-200 truncate flex items-center justify-start">
                                <span className="text-sm text-gray-500 mr-1 w-3 inline-block text-center">★</span>
                                {spellName}
                              </div>
                              <div className="text-gray-300 flex items-center justify-center">{spellRange}</div>
                              <div 
                                className={`text-gray-300 font-semibold w-[70px] rounded-md px-2 py-1 transition-all duration-200 flex items-center justify-center mx-auto ${
                                  showAttackBonus ? 'cursor-pointer border-2' : 'cursor-default'
                                }`}
                                style={{
                                  borderColor: showAttackBonus ? `${getFrameColor(frameColor)}40` : 'transparent',
                                  backgroundColor: 'transparent'
                                }}
                                onClick={showAttackBonus ? () => handleAttack(spellName, spellAbility, spellAttackBonus, true) : undefined}
                                onMouseEnter={showAttackBonus ? (e) => {
                                  const lightColor = criticalHits[`spell-${spellName}`] 
                                    ? '#F59E0B' 
                                    : getFrameColor(frameColor);
                                  e.currentTarget.style.backgroundColor = `${lightColor}20`;
                                } : undefined}
                                onMouseLeave={showAttackBonus ? (e) => {
                                  e.currentTarget.style.backgroundColor = criticalHits[`spell-${spellName}`] 
                                    ? '#F59E0B20' 
                                    : 'transparent';
                                } : undefined}
                              >
                                {loadingAttacks[`spell-${spellName}`] ? (
                                  <div className="w-4 h-5 flex items-center justify-center">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  </div>
                                ) : showAttackBonus ? (
                                  spellAttackBonus > 0 ? `+${spellAttackBonus}` : spellAttackBonus === 0 ? '0' : spellAttackBonus
                                ) : (
                                  '--'
                                )}
                              </div>
                              <div className="relative flex items-center justify-center mx-auto">
                                {/* Иконка типа урона слева от рамки для заклинаний */}
                                {criticalHits[`spell-${spellName}`] && (
                                  <span 
                                    className="absolute -left-6 text-lg animate-pulse z-10"
                                    style={{ 
                                      color: getDamageColor(spellData?.damage?.type).text,
                                      filter: spellData?.damage?.type === "Электричество" ? "hue-rotate(200deg) saturate(1.5)" : 
                                             spellData?.damage?.type === "Силовой" ? "hue-rotate(0deg) saturate(0.3) brightness(1.2)" : "none"
                                    }}
                                  >
                                    {getDamageIcon(spellData?.damage?.type)}
                                  </span>
                                )}
                                
                                {/* Рамка с уроном заклинания */}
                                <div 
                                  className={`text-gray-300 font-semibold border-2 w-[70px] rounded-md px-2 py-1 cursor-pointer transition-all duration-200 flex items-center justify-center ${
                                    criticalHits[`spell-${spellName}`] 
                                      ? 'font-bold animate-pulse' 
                                      : ''
                                  }`}
                                  style={{
                                    borderColor: criticalHits[`spell-${spellName}`] 
                                      ? getDamageColor(spellData?.damage?.type).border
                                      : `${getFrameColor(frameColor)}40`,
                                    backgroundColor: criticalHits[`spell-${spellName}`] 
                                      ? getDamageColor(spellData?.damage?.type).bg
                                      : 'transparent',
                                    color: criticalHits[`spell-${spellName}`] 
                                      ? getDamageColor(spellData?.damage?.type).text
                                      : '#D1D5DB'
                                  }}
                                  onClick={() => {
                                    const criticalDamage = criticalHits[`spell-${spellName}`] ? 
                                      spellDamage.replace(/(\d+)d(\d+)/, (match, num, size) => `${parseInt(num) * 2}d${size}`) : 
                                      spellDamage;
                                    handleDamage(spellName, spellAbility, 0, criticalDamage, true);
                                  }}
                                  onMouseEnter={(e) => {
                                    const lightColor = criticalHits[`spell-${spellName}`] 
                                      ? getDamageColor(spellData?.damage?.type).border
                                      : getFrameColor(frameColor);
                                    e.currentTarget.style.backgroundColor = `${lightColor}20`;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = criticalHits[`spell-${spellName}`] 
                                      ? getDamageColor(spellData?.damage?.type).bg
                                      : 'transparent';
                                  }}
                                >
                                  {loadingDamage[`spell-${spellName}`] ? (
                                    <div className="w-4 h-5 flex items-center justify-center">
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    </div>
                                  ) : (
                                    criticalHits[`spell-${spellName}`] ? 
                                      spellDamage.replace(/(\d+)d(\d+)/, (match, num, size) => `${parseInt(num) * 2}d${size}`) : 
                                      spellDamage
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Пунктирная линия между строками (кроме последней) */}
                            {i < allActions.length - 1 && (
                              <div 
                                className="my-1 h-px"
                                style={{
                                  borderTop: `1px dotted ${getFrameColor(frameColor)}40`
                                }}
                              />
                            )}
                          </div>
                        );
                      }
                      return null;
                    });
                  })()}
                </div>
              )}
                
                {/* Таблица бонусных действий */}
                <div className="mt-6">
                  {/* Заголовок для бонусных действий */}
                  <div 
                    className="text-xs font-semibold uppercase mb-2 flex items-center mt-6 pb-2"
                    style={{
                      borderBottom: `1px solid ${getFrameColor(frameColor)}60`
                    }}
                  >
                    <span style={{ color: getFrameColor(frameColor) }}>
                      БОНУСНЫЕ ДЕЙСТВИЯ
                    </span>
                  </div>
                  
                  {/* Заголовки таблицы */}
                  <div className="grid gap-2 text-sm font-semibold uppercase text-gray-400 mb-2 pb-1 items-center mt-4" 
                       style={{ 
                         gridTemplateColumns: '2fr 1fr 1fr 1fr',
                         borderBottom: `1px solid ${getFrameColor(frameColor)}20` 
                       }}>
                    <div className="flex items-center justify-start">АТАКА</div>
                    <div className="flex items-center justify-center">ДАЛЬНОСТЬ</div>
                    <div className="flex items-center justify-center">ПОПАДАНИЕ</div>
                    <div className="flex items-center justify-center">УРОН</div>
                  </div>
                  
                  {/* Строки с бонусными действиями */}
                  {(() => {
                    const bonusActions = [];
                    
                    // Добавляем заклинания, которые являются бонусными действиями
                    if (characterData?.spells?.length > 0) {
                      console.log('Attacks: checking bonus actions, characterData.spells:', characterData.spells);
                      characterData.spells.forEach((spell: string, i: number) => {
                        const spellData = getSpellData(spell);
                        console.log(`Attacks: bonus spell ${spell}:`, spellData);
                        // Проверяем, является ли заклинание бонусным действием
                        const castingTime = spellData?.castingTime;
                        const isBonusAction = Array.isArray(castingTime) 
                            ? castingTime.includes("Бонусное действие")
                            : castingTime === "Бонусное действие";
                        console.log(`Attacks: bonus spell ${spell} castingTime:`, castingTime, 'isBonusAction:', isBonusAction, 'isCombat:', spellData?.isCombat);
                        if (isBonusAction && spellData?.isCombat) {
                          bonusActions.push({ type: 'spell', data: spell, index: i });
                        }
                      });
                    }
                    
                    if (bonusActions.length === 0) {
                      return (
                        <div className="text-center text-gray-500 text-sm py-4">
                          Нет доступных бонусных действий
                        </div>
                      );
                    }
                    
                    return bonusActions.map((action, i) => {
                      if (action.type === 'spell') {
                        const spellKey = action.data;
                        const spellName = getSpellName(spellKey);
                        const spellData = getSpellData(spellKey);
                        const spellAbility = 'cha';
                        const spellModifier = Math.floor(((stats?.[spellAbility] || 10) - 10) / 2);
                        const spellAttackBonus = spellModifier + (proficiencyBonus || 0);
                        
                        // Получаем дальность из данных заклинания
                        let spellRange = spellData?.range || "60 фт.";
                        
                        // Преобразуем в строку, если это число
                        if (typeof spellRange === 'number') {
                          spellRange = String(spellRange);
                        }
                        
                        // Если дальность не содержит единицы измерения, добавляем "фт." только для числовых значений
                        if (spellRange && typeof spellRange === 'string' && !spellRange.includes('фт') && !spellRange.includes('м') && !spellRange.includes('км') && !spellRange.includes('на себя') && !spellRange.toLowerCase().includes('касание') && !isNaN(Number(spellRange))) {
                          spellRange = `${spellRange} фт.`;
                        }
                        
                        // Проверяем, нужно ли показывать бонус попадания
                        const isSelfTarget = spellRange && spellRange.toLowerCase().includes('на себя');
                        const showAttackBonus = !isSelfTarget;
                        
                        // Получаем урон из данных заклинания (без модификатора характеристики)
                        const spellDamage = spellData?.damage?.dice || "1d10";
                        
                        return (
                          <div key={`bonus-spell-${action.index}`}>
                            <div className="grid gap-2 text-sm py-1 items-center"
                                 style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
                              <div className="text-gray-200 truncate flex items-center justify-start">
                                <span className="text-sm text-gray-500 mr-1 w-3 inline-block text-center">★</span>
                                {spellName}
                              </div>
                              <div className="text-gray-300 flex items-center justify-center">{spellRange}</div>
                              <div 
                                className={`text-gray-300 font-semibold w-[70px] rounded-md px-2 py-1 transition-all duration-200 flex items-center justify-center mx-auto ${
                                  showAttackBonus ? 'cursor-pointer border-2' : 'cursor-default'
                                }`}
                                style={{
                                  borderColor: showAttackBonus ? `${getFrameColor(frameColor)}40` : 'transparent',
                                  backgroundColor: 'transparent'
                                }}
                                onClick={showAttackBonus ? () => handleAttack(spellName, spellAbility, spellAttackBonus, true) : undefined}
                                onMouseEnter={showAttackBonus ? (e) => {
                                  const lightColor = criticalHits[`spell-${spellName}`] 
                                    ? '#F59E0B' 
                                    : getFrameColor(frameColor);
                                  e.currentTarget.style.backgroundColor = `${lightColor}20`;
                                } : undefined}
                                onMouseLeave={showAttackBonus ? (e) => {
                                  e.currentTarget.style.backgroundColor = criticalHits[`spell-${spellName}`] 
                                    ? '#F59E0B20' 
                                    : 'transparent';
                                } : undefined}
                              >
                                {loadingAttacks[`spell-${spellName}`] ? (
                                  <div className="w-4 h-5 flex items-center justify-center">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  </div>
                                ) : showAttackBonus ? (
                                  spellAttackBonus > 0 ? `+${spellAttackBonus}` : spellAttackBonus === 0 ? '0' : spellAttackBonus
                                ) : (
                                  '--'
                                )}
                              </div>
                              <div className="relative flex items-center justify-center mx-auto">
                                {/* Иконка типа урона слева от рамки для заклинаний */}
                                {criticalHits[`spell-${spellName}`] && (
                                  <span 
                                    className="absolute -left-6 text-lg animate-pulse z-10"
                                    style={{ 
                                      color: getDamageColor(spellData?.damage?.type).text,
                                      filter: spellData?.damage?.type === "Электричество" ? "hue-rotate(200deg) saturate(1.5)" : 
                                             spellData?.damage?.type === "Силовой" ? "hue-rotate(0deg) saturate(0.3) brightness(1.2)" : "none"
                                    }}
                                  >
                                    {getDamageIcon(spellData?.damage?.type)}
                                  </span>
                                )}
                                
                                {/* Рамка с уроном заклинания */}
                                <div 
                                  className={`text-gray-300 font-semibold border-2 w-[70px] rounded-md px-2 py-1 cursor-pointer transition-all duration-200 flex items-center justify-center ${
                                    criticalHits[`spell-${spellName}`] 
                                      ? 'font-bold animate-pulse' 
                                      : ''
                                  }`}
                                  style={{
                                    borderColor: criticalHits[`spell-${spellName}`] 
                                      ? getDamageColor(spellData?.damage?.type).border
                                      : `${getFrameColor(frameColor)}40`,
                                    backgroundColor: criticalHits[`spell-${spellName}`] 
                                      ? getDamageColor(spellData?.damage?.type).bg
                                      : 'transparent',
                                    color: criticalHits[`spell-${spellName}`] 
                                      ? getDamageColor(spellData?.damage?.type).text
                                      : '#D1D5DB'
                                  }}
                                  onClick={() => {
                                    const criticalDamage = criticalHits[`spell-${spellName}`] ? 
                                      spellDamage.replace(/(\d+)d(\d+)/, (match, num, size) => `${parseInt(num) * 2}d${size}`) : 
                                      spellDamage;
                                    handleDamage(spellName, spellAbility, 0, criticalDamage, true);
                                  }}
                                  onMouseEnter={(e) => {
                                    const lightColor = criticalHits[`spell-${spellName}`] 
                                      ? getDamageColor(spellData?.damage?.type).border
                                      : getFrameColor(frameColor);
                                    e.currentTarget.style.backgroundColor = `${lightColor}20`;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = criticalHits[`spell-${spellName}`] 
                                      ? getDamageColor(spellData?.damage?.type).bg
                                      : 'transparent';
                                  }}
                                >
                                  {loadingDamage[`spell-${spellName}`] ? (
                                    <div className="w-4 h-5 flex items-center justify-center">
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    </div>
                                  ) : (
                                    criticalHits[`spell-${spellName}`] ? 
                                      spellDamage.replace(/(\d+)d(\d+)/, (match, num, size) => `${parseInt(num) * 2}d${size}`) : 
                                      spellDamage
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Пунктирная линия между строками (кроме последней) */}
                            {i < bonusActions.length - 1 && (
                              <div 
                                className="my-1 h-px"
                                style={{
                                  borderTop: `1px dotted ${getFrameColor(frameColor)}40`
                                }}
                              />
                            )}
                          </div>
                        );
                      }
                      return null;
                    });
                  })()}
                </div>              
              {activeActionType === "action" && (
                <div className="text-center text-gray-500 text-sm py-4">
                  Действия будут здесь
                </div>
              )}
              
              {activeActionType === "bonus" && (
                <div className="text-center text-gray-500 text-sm py-4">
                  Бонусные действия теперь отображаются в разделе "АТАКА"
                </div>
              )}
              
              {activeActionType === "reaction" && (
                <div className="text-center text-gray-500 text-sm py-4">
                  Реакции будут здесь
                </div>
              )}
            </div>
          </div>
        );
      case "spells":
        console.log('Rendering spells tab');
        const filteredSpells = getFilteredCharacterSpells();
        const availableLevels = getCharacterSpellLevels();
        console.log('filteredSpells:', filteredSpells);
        console.log('availableLevels:', availableLevels);
        
        return (
          <div className="space-y-4">
            {/* Поисковая строка и кнопка настроек */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Поиск заклинаний..." 
                  value={spellSearch} 
                  onChange={(e) => setSpellSearch(e.target.value)} 
                  className="w-full pl-10 pr-3 py-2 bg-transparent border rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-0"
                  style={{
                    borderColor: getFrameColor(frameColor)
                  }}
                />
              </div>
              <button
                onClick={openSpellSettings}
                className="p-2 bg-transparent border rounded-md text-gray-400 hover:text-gray-200 transition-colors"
                style={{
                  borderColor: getFrameColor(frameColor)
                }}
                title="Настройки заклинаний"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
            
            {/* Фильтры по уровню */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSpellLevelFilter("all")}
                className="px-1 py-0.5 rounded text-xs font-medium transition-colors border"
                style={{
                  backgroundColor: spellLevelFilter === "all" ? getFrameColor(frameColor) : 'transparent',
                  borderColor: getFrameColor(frameColor),
                  color: spellLevelFilter === "all" ? '#FFFFFF' : getFrameColor(frameColor)
                }}
                onMouseEnter={(e) => {
                  if (spellLevelFilter !== "all") {
                    e.currentTarget.style.backgroundColor = `${getFrameColor(frameColor)}20`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (spellLevelFilter !== "all") {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                ВСЕ
              </button>
              {availableLevels.map(level => (
                <button
                  key={level}
                  onClick={() => setSpellLevelFilter(level)}
                  className="px-1 py-0.5 rounded text-xs font-medium transition-colors border"
                  style={{
                    backgroundColor: spellLevelFilter === level ? getFrameColor(frameColor) : 'transparent',
                    borderColor: getFrameColor(frameColor),
                    color: spellLevelFilter === level ? '#FFFFFF' : getFrameColor(frameColor)
                  }}
                  onMouseEnter={(e) => {
                    if (spellLevelFilter !== level) {
                      e.currentTarget.style.backgroundColor = `${getFrameColor(frameColor)}20`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (spellLevelFilter !== level) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {`- ${level} -`}
                </button>
        ))}
      </div>
            
            
            {/* Таблицы заклинаний по уровням */}
            {filteredSpells.length > 0 ? (
              <div className="space-y-6">
                {(() => {
                  // Группируем заклинания по уровням
                  console.log('Spells tab: filteredSpells:', filteredSpells);
                  const spellsByLevel = filteredSpells.reduce((acc, spell) => {
                    const level = spell.level;
                    console.log('Spells tab: grouping spell', spell.name, 'level:', level);
                    if (!acc[level]) {
                      acc[level] = [];
                    }
                    acc[level].push(spell);
                    return acc;
                  }, {} as Record<number, any[]>);
                  
                  console.log('Spells tab: spellsByLevel:', spellsByLevel);
                  
                  // Сортируем уровни
                  const sortedLevels = Object.keys(spellsByLevel).map(Number).sort((a, b) => a - b);
                  console.log('Spells tab: sortedLevels:', sortedLevels);
                  
                  return sortedLevels.map(level => {
                    const spells = spellsByLevel[level];
                    const levelName = level === 0 ? 'ЗАГОВОРЫ' : `${level} УРОВЕНЬ`;
                    console.log(`Spells tab: rendering level ${level} (${levelName}) with ${spells.length} spells:`, spells.map(s => s.name));
                    
                    return (
                      <div key={level} className="space-y-2">
                        {/* Заголовок уровня */}
                        <div
                          className="text-xs font-semibold uppercase mb-2 text-gray-400 flex items-center justify-between pb-2"
                          style={{
                            borderBottom: `1px solid ${getFrameColor(frameColor)}20`
                          }}
                        >
                          <span>{levelName}</span>
              {level > 0 && (() => {
                console.log(`Getting slots for level ${level}`);
                const slots = getSpellSlotsForLevel(level);
                console.log(`Level ${level} slots:`, slots);
                console.log(`Rendering checkboxes for level ${level}, slots: ${slots}`);
                return (
                  <div className="flex items-center gap-2 mr-4">
                    <div className="flex gap-1">
                      {Array.from({ length: Math.max(slots, 1) }, (_, i) => {
                        const isUsed = i < (draft?.usedSpellSlots?.[level] || 0);
                        const isAvailable = i < slots;
                        return (
                          <div
                            key={i}
                            className="w-5 h-5 border-2 flex items-center justify-center relative cursor-pointer hover:opacity-80"
                            style={{
                              borderColor: isAvailable ? getFrameColor(frameColor) : '#6B7280',
                              backgroundColor: 'transparent'
                            }}
                            onClick={() => {
                              if (isUsed) {
                                freeSpellSlot(level);
                              } else if (isAvailable) {
                                useSpellSlot(level);
                              }
                            }}
                          >
                            {/* Внутренний квадрат для эффекта "квадрат в квадрате" */}
                            {isUsed && (
                              <div
                                className="w-3 h-3"
                                style={{
                                  backgroundColor: getFrameColor(frameColor)
                                }}
                              />
                            )}
    </div>
  );
                      })}
                    </div>
                    <span className="text-xs text-gray-400">ЯЧЕЙКИ</span>
                  </div>
                );
              })()}
                        </div>
                        
                {/* Заголовки таблицы */}
                <div className="grid gap-2 text-xs font-semibold uppercase text-gray-400 mb-2 pb-1 items-center" 
                     style={{ 
                       gridTemplateColumns: 'auto 2fr 1fr 1fr 1fr 1fr',
                       borderBottom: `1px solid ${getFrameColor(frameColor)}20` 
                     }}>
                  <div className="flex items-center justify-start w-8"></div>
                  <div className="flex items-center justify-start">НАЗВАНИЕ</div>
                  <div className="text-center">ВРМ</div>
                  <div className="text-center">ДЛН</div>
                  <div className="text-center">ППД</div>
                  <div className="text-center">ЭФФЕКТ</div>
                </div>
                        
                        {/* Строки заклинаний для этого уровня */}
                        {spells.map((spell, index) => {
                          const spellAbility = 'cha';
                          const spellModifier = Math.floor(((stats?.[spellAbility] || 10) - 10) / 2);
                          const spellAttackBonus = spellModifier + (proficiencyBonus || 0);
                          const spellCastingModifier = spellAttackBonus; // Заклинательный модификатор = модификатор характеристики + бонус мастерства
                          
                          // Получаем дальность
                          let spellRange = spell.range || "60 фт.";
                          if (typeof spellRange === 'number') {
                            spellRange = String(spellRange);
                          }
                          if (spellRange && typeof spellRange === 'string' && !spellRange.includes('фт') && !spellRange.includes('м') && !spellRange.includes('км') && !spellRange.includes('на себя') && !spellRange.toLowerCase().includes('касание') && !isNaN(Number(spellRange))) {
                            spellRange = `${spellRange} фт.`;
                          }
                          
                          // Проверяем, нужно ли показывать бонус попадания
                          const isSelfTarget = spellRange && spellRange.toLowerCase().includes('на себя');
                          const showAttackBonus = !isSelfTarget;
                          
                          // Получаем время сотворения
                          const castingTime = Array.isArray(spell.castingTime) ? spell.castingTime[0] : spell.castingTime;
                          
                          // Сокращаем время сотворения
                          const shortCastingTime = castingTime === 'Действие' ? 'Д' : 
                                                  castingTime === 'Бонусное действие' ? 'БД' : 
                                                  castingTime || '—';
                          
                          // Получаем эффект (только урон, не описание)
                          const effect = spell.damage?.dice || '—';
                          
                          return (
                            <div key={index}>
                              <div className="grid gap-2 text-sm py-1 items-center"
                                   style={{ gridTemplateColumns: 'auto 2fr 1fr 1fr 1fr 1fr' }}>
                                {/* Кнопка использования */}
                                <div className="flex items-center justify-start w-8">
                                  <button
                                    onClick={() => {
                                      if (hasAvailableSlots(spell.level)) {
                                        useSpellSlot(spell.level);
                                        // Не бросаем кубик, только используем слот
                                      }
                                    }}
                                    disabled={loadingAttacks[`spell-${spell.name}`] || (!hasAvailableSlots(spell.level) && spell.level > 0)}
                                    className={`w-6 h-6 bg-transparent rounded flex items-center justify-center transition-colors border ${
                                      !hasAvailableSlots(spell.level) && spell.level > 0 ? 'opacity-50 cursor-pointer' : 'hover:opacity-80'
                                    }`}
                                    style={{
                                      borderColor: getFrameColor(frameColor),
                                      color: getFrameColor(frameColor)
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!loadingAttacks[`spell-${spell.name}`] && (hasAvailableSlots(spell.level) || spell.level === 0)) {
                                        e.currentTarget.style.backgroundColor = `${getFrameColor(frameColor)}20`;
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!loadingAttacks[`spell-${spell.name}`] && (hasAvailableSlots(spell.level) || spell.level === 0)) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                      }
                                    }}
                                  >
                                    {loadingAttacks[`spell-${spell.name}`] ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : !hasAvailableSlots(spell.level) && spell.level > 0 ? (
                                      <X className="w-3 h-3" />
                                    ) : (
                                      <Wand className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              
                                {/* Название */}
                                <div className="text-gray-200 flex items-center justify-start cursor-pointer hover:text-gray-100" onClick={() => openSpellDetails(spell)}>
                                  <div className="break-words">
                                    <div className="font-medium">{spell.name}</div>
                                    {spell.isLegacy && (
                                      <div className="text-xs mt-1" style={{ color: getFrameColor(frameColor) }}>
                                        Legacy
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Время */}
                                <div className="text-gray-300 flex items-center justify-center">
                                  {shortCastingTime}
                                </div>
                                
                                {/* Дальность */}
                                <div className="text-gray-300 flex items-center justify-center">
                                  {spellRange || '—'}
                                </div>
                                
                                {/* Попадание/Спасбросок */}
                                <div className="text-gray-300 flex flex-col items-center justify-center">
                                  {spell.save ? (
                                    (() => {
                                      // Сл спасброска одинаковая для всех заклинаний заклинателя
                                      const spellcastingAbility = characterData?.class?.spellcasting?.ability || 'cha';
                                      const spellcastingModifier = Math.floor(((stats?.[spellcastingAbility] || 10) - 10) / 2);
                                      const saveDC = 8 + (proficiencyBonus || 0) + spellcastingModifier;
                                      const abilityInfo = ABILITIES.find(a => a.key === spellcastingAbility);
                                      const abilityShort = abilityInfo?.keyRu || spellcastingAbility.toUpperCase();
                                      return (
                                        <>
                                          <div className="text-xs">{abilityShort}</div>
                                          <div className="text-sm font-semibold">{saveDC}</div>
                                        </>
                                      );
                                    })()
                                  ) : spell.isCombat && showAttackBonus ? (
                                    <button
                                      onClick={() => handleAttack(spell.name, spellAbility, spellAttackBonus, true)}
                                      disabled={loadingAttacks[`spell-${spell.name}`] || (!hasAvailableSlots(spell.level) && spell.level > 0)}
                                      className="w-12 h-8 bg-transparent disabled:bg-gray-600 rounded text-sm font-semibold transition-colors border flex items-center justify-center"
                                      style={{
                                        borderColor: getFrameColor(frameColor),
                                        color: getFrameColor(frameColor)
                                      }}
                                      onMouseEnter={(e) => {
                                        if (!loadingAttacks[`spell-${spell.name}`] && (hasAvailableSlots(spell.level) || spell.level === 0)) {
                                          e.currentTarget.style.backgroundColor = `${getFrameColor(frameColor)}20`;
                                        }
                                      }}
                                      onMouseLeave={(e) => {
                                        if (!loadingAttacks[`spell-${spell.name}`] && (hasAvailableSlots(spell.level) || spell.level === 0)) {
                                          e.currentTarget.style.backgroundColor = 'transparent';
                                        }
                                      }}
                                    >
                                      {loadingAttacks[`spell-${spell.name}`] ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        spellAttackBonus > 0 ? `+${spellAttackBonus}` : spellAttackBonus === 0 ? '0' : spellAttackBonus
                                      )}
                                    </button>
                                  ) : (
                                    '—'
                                  )}
                                </div>
                                
                                {/* Эффект */}
                                <div className="text-gray-300 flex items-center justify-center">
                                  {spell.damage?.dice ? (
                                    <button
                                      onClick={() => handleDamage(spell.name, spellAbility, spellCastingModifier, spell.damage.dice, true)}
                                      disabled={loadingDamage[`spell-${spell.name}`]}
                                      className="w-16 h-8 bg-transparent disabled:bg-gray-600 rounded text-sm font-semibold transition-colors border flex items-center justify-center"
                                      style={{
                                        borderColor: getFrameColor(frameColor),
                                        color: getFrameColor(frameColor)
                                      }}
                                      onMouseEnter={(e) => {
                                        if (!loadingDamage[`spell-${spell.name}`]) {
                                          e.currentTarget.style.backgroundColor = `${getFrameColor(frameColor)}20`;
                                        }
                                      }}
                                      onMouseLeave={(e) => {
                                        if (!loadingDamage[`spell-${spell.name}`]) {
                                          e.currentTarget.style.backgroundColor = 'transparent';
                                        }
                                      }}
                                    >
                                      {loadingDamage[`spell-${spell.name}`] ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        spell.damage.dice
                                      )}
                                    </button>
                                  ) : spell.heal ? (
                                    <button
                                      onClick={() => {
                                        handleDamage(spell.name, spellAbility, spellModifier, spell.heal, true, true);
                                      }}
                                      disabled={loadingDamage[`spell-${spell.name}`]}
                                      className="w-20 h-8 bg-transparent disabled:bg-gray-600 rounded text-sm font-semibold transition-colors border flex items-center justify-center"
                                      style={{
                                        borderColor: getFrameColor(frameColor),
                                        color: getFrameColor(frameColor)
                                      }}
                                      onMouseEnter={(e) => {
                                        if (!loadingDamage[`spell-${spell.name}`]) {
                                          e.currentTarget.style.backgroundColor = `${getFrameColor(frameColor)}20`;
                                        }
                                      }}
                                      onMouseLeave={(e) => {
                                        if (!loadingDamage[`spell-${spell.name}`]) {
                                          e.currentTarget.style.backgroundColor = 'transparent';
                                        }
                                      }}
                                    >
                                      {loadingDamage[`spell-${spell.name}`] ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        `${spell.heal}+${spellModifier}`
                                      )}
                                    </button>
                                  ) : (
                                    effect
                                  )}
                                </div>
                              </div>
                              
                              {/* Пунктирная линия между строками (кроме последней) */}
                              {index < spells.length - 1 && (
                                <div 
                                  className="my-1"
                                  style={{
                                    borderBottom: `1px dashed ${getFrameColor(frameColor)}20`
                                  }}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  });
                })()}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                {spellSearch.trim() ? 'Заклинания не найдены' : 'Нет заклинаний'}
              </div>
            )}
          </div>
        );
      case "inventory":
        const currentWeight = calculateTotalWeight();
        const maxWeight = calculateMaxCarryWeight();
        
        // Используем мемоизированные данные
        

        // Функция для сохранения изменений в драфт (оставляем для совместимости)
        const saveEquipmentChanges = () => {
          if (!equipped) return;
          
          // Конвертируем локальное состояние обратно в формат equipped
          const mainWeapons = localEquipped.mainSet
            .filter(item => getItemType(item.name) === 'weapon')
            .map(item => ({
              name: item.name,
              type: 'weapon' as const,
              slots: item.slots,
              isVersatile: item.isVersatile,
              versatileMode: item.versatileMode
            }));
          
          const additionalWeapons = localEquipped.additionalSet
            .filter(item => getItemType(item.name) === 'weapon')
            .map(item => ({
              name: item.name,
              type: 'weapon' as const,
              slots: item.slots,
              isVersatile: item.isVersatile,
              versatileMode: item.versatileMode
            }));
          
          const mainShields = localEquipped.mainSet
            .filter(item => getItemType(item.name) === 'shield')
            .map(item => ({
              name: item.name,
              type: 'shield' as const,
              slots: item.slots,
              isVersatile: item.isVersatile,
              versatileMode: item.versatileMode
            }));
          
          const additionalShields = localEquipped.additionalSet
            .filter(item => getItemType(item.name) === 'shield')
            .map(item => ({
              name: item.name,
              type: 'shield' as const,
              slots: item.slots,
              isVersatile: item.isVersatile,
              versatileMode: item.versatileMode
            }));
          
          // Обновляем equipped
          const updatedEquipped = {
            ...equipped,
            weaponSlot1: mainWeapons,
            weaponSlot2: additionalWeapons,
            shield1: mainShields[0] || null,
            shield2: additionalShields[0] || null,
            armor: localEquipped.armor ? {
              name: localEquipped.armor,
              type: 'armor' as const,
              slots: 1,
              isVersatile: false,
              versatileMode: false
            } : null
          };
          
          // Вызываем функцию обновления equipped из родительского компонента
          if (onUpdateEquipped) {
            onUpdateEquipped(updatedEquipped);
          }
        };
        
        return (
          <div>
            {/* Заголовок с весом и валютой */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm font-semibold text-gray-300">
                ПЕРЕНОСИМЫЙ ВЕС: 
                <span className={`ml-2 ${isOverloaded(currentWeight) ? 'text-red-400' : 'text-gray-200'}`}>
                  {currentWeight}/{maxWeight}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <CurrencyDisplay />
              </div>
            </div>
            
            
            {/* Скроллируемый блок инвентаря */}
            <div className="overflow-y-auto space-y-6">
              {/* Блок ЭКИПИРОВКА */}
              <div>
                <div className="text-sm font-semibold text-gray-300 mb-2">ЭКИПИРОВКА</div>
                
                {/* Заголовки таблицы */}
                <div className="grid gap-2 text-sm font-semibold uppercase text-gray-400 mb-2 pb-1 items-center" 
                     style={{ 
                       gridTemplateColumns: 'auto 2fr 1fr 1fr 1fr',
                       borderBottom: `1px solid ${getFrameColor(frameColor)}20` 
                     }}>
                  <div className="flex items-center justify-start">✓</div>
                  <div className="flex items-center justify-start">НАЗВАНИЕ</div>
                  <div className="text-center">ВЕС</div>
                  <div className="text-center">ЦЕНА</div>
                </div>
                
                {/* Строки таблицы */}
                <div className="space-y-1">
                  {/* Доспехи (только доспехи, не щиты) */}
                  <div className="text-xs text-gray-400 mt-2 mb-1 font-semibold uppercase flex items-center gap-2">
                    ДОСПЕХ
                    <div className="flex gap-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: localEquipped.armor
                            ? getFrameColor(frameColor)
                            : '#4B5563'
                        }}
                      />
                    </div>
                  </div>
                  {equippedItems.filter(item => item.set === 'armor' && item.type === 'armor').length > 0 ? (
                    equippedItems.filter(item => item.set === 'armor' && item.type === 'armor').map((item, index) => (
                      <div key={`armor-${index}`}>
                        <div className="grid gap-2 text-sm py-1 items-center"
                             style={{ gridTemplateColumns: 'auto 2fr 1fr 1fr 1fr' }}>
                          <div className="flex justify-start items-center">
                            <div 
                              className="w-5 h-5 border-2 flex items-center justify-center relative cursor-pointer hover:opacity-80"
                              style={{
                                borderColor: item.equipped ? getFrameColor(frameColor) : '#6B7280',
                                backgroundColor: 'transparent'
                              }}
                              onClick={() => toggleItemEquipped(item.name)}
                            >
                              {item.equipped && (
                                <div
                                  className="w-3 h-3"
                                  style={{
                                    backgroundColor: getFrameColor(frameColor)
                                  }}
                                />
                              )}
                            </div>
                          </div>
                           <div className="text-gray-200 break-words cursor-pointer hover:text-gray-100" onClick={() => openItemDetails(item)}>
                             <div>{getCleanItemName(item.name)}</div>
                             <div className="text-xs text-gray-500 mt-1">{getEquippedItemCategory(item.name)}</div>
                           </div>
                          <div className="text-gray-400 text-center">{item.weight} фнт.</div>
                          <div className="text-gray-400 text-center">{formatCost(item.cost)}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 text-sm py-2">
                      Нет надетого доспеха
                    </div>
                  )}
                  
                  {/* Разделитель между доспехом и основным набором */}
                  <div 
                    className="text-xs font-semibold uppercase mb-2 text-gray-400"
                    style={{
                      borderBottom: `1px solid ${getFrameColor(frameColor)}20`
                    }}
                  />
                  
                  {/* Основной набор (I) */}
                  <div className="text-xs text-gray-400 mt-2 mb-1 font-semibold uppercase flex items-center gap-2">
                    ОСНОВНОЙ НАБОР
                        <div className="flex gap-1">
                          {Array.from({ length: 2 }, (_, i) => (
                            <div
                              key={i}
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: i < getUsedSlotsCount(localEquipped.mainSet)
                                  ? getFrameColor(frameColor)
                                  : '#4B5563'
                              }}
                            />
        ))}
      </div>
                  </div>
                  {equippedItems.filter(item => item.set === 'main').length > 0 ? (
                    equippedItems.filter(item => item.set === 'main').map((item, index) => (
                      <div key={`main-${index}`}>
                        <div className="grid gap-2 text-sm py-1 items-center"
                             style={{ gridTemplateColumns: 'auto 2fr 1fr 1fr 1fr' }}>
                          <div className="flex justify-start items-center">
                            <div 
                              className="w-5 h-5 border-2 flex items-center justify-center relative cursor-pointer hover:opacity-80"
                              style={{
                                borderColor: item.equipped ? getFrameColor(frameColor) : '#6B7280',
                                backgroundColor: 'transparent'
                              }}
                              onClick={() => toggleItemEquipped(item.name)}
                            >
                              {item.equipped && (
                                <div
                                  className="w-3 h-3"
                                  style={{
                                    backgroundColor: getFrameColor(frameColor)
                                  }}
                                />
                              )}
                            </div>
                          </div>
                          <div className="text-gray-200 break-words flex items-center gap-2">
                            <div className="flex-1 cursor-pointer hover:text-gray-100" onClick={() => openItemDetails(item)}>
                              <div>{getCleanItemName(item.name)}</div>
                              <div className="text-xs text-gray-500 mt-1">{getEquippedItemCategory(item.name)}</div>
                              {renderAmmunitionInfo(item.name)}
                            </div>
                            {item.isVersatile && (
                              <div className="flex items-center gap-1">
                                <div
                                  className={`w-4 h-4 rounded-full ${canToggleVersatileMode(item.name) ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed opacity-50'}`}
                                  style={{
                                    backgroundColor: item.versatileMode ? getFrameColor(frameColor) : 'transparent',
                                    border: `2px solid ${getFrameColor(frameColor)}`
                                  }}
                                  onClick={() => canToggleVersatileMode(item.name) && toggleVersatileMode(item.name)}
                                  title={canToggleVersatileMode(item.name) 
                                    ? (item.versatileMode ? 'Двуручный режим (2 слота) - клик для переключения' : 'Одноручный режим (1 слот) - клик для переключения')
                                    : 'Недостаточно свободных слотов для переключения в двуручный режим'
                                  }
                                />
                                <span className="text-xs text-gray-400">
                                  {item.versatileMode ? '2H' : '1H'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="text-gray-400 text-center">{item.weight} фнт.</div>
                          <div className="text-gray-400 text-center">{formatCost(item.cost)}</div>
                        </div>
                        {index < equippedItems.filter(item => item.set === 'main').length - 1 && (
                          <div 
                            className="my-1 h-px"
                            style={{
                              borderTop: `1px dotted ${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}40`
                            }}
                          />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 text-sm py-2">
                      Основной набор пуст
                    </div>
                  )}
                  
                   {/* Разделитель между наборами */}
                   <div 
                     className="text-xs font-semibold uppercase mb-2 text-gray-400"
                     style={{
                       borderBottom: `1px solid ${getFrameColor(frameColor)}20`
                     }}
                   />
                  
                  {/* Дополнительный набор (II) */}
                  <div className="text-xs text-gray-400 mt-2 mb-1 font-semibold uppercase flex items-center gap-2">
                    ДОПОЛНИТЕЛЬНЫЙ НАБОР
                        <div className="flex gap-1">
                          {Array.from({ length: 2 }, (_, i) => (
                            <div
                              key={i}
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: i < getUsedSlotsCount(localEquipped.additionalSet)
                                  ? getFrameColor(frameColor)
                                  : '#4B5563'
                              }}
                            />
                          ))}
                        </div>
                  </div>
                  {equippedItems.filter(item => item.set === 'additional').length > 0 ? (
                    equippedItems.filter(item => item.set === 'additional').map((item, index) => (
                      <div key={`additional-${index}`}>
                        <div className="grid gap-2 text-sm py-1 items-center"
                             style={{ gridTemplateColumns: 'auto 2fr 1fr 1fr 1fr' }}>
                          <div className="flex justify-start items-center">
                            <div 
                              className="w-5 h-5 border-2 flex items-center justify-center relative cursor-pointer hover:opacity-80"
                              style={{
                                borderColor: item.equipped ? getFrameColor(frameColor) : '#6B7280',
                                backgroundColor: 'transparent'
                              }}
                              onClick={() => toggleItemEquipped(item.name)}
                            >
                              {item.equipped && (
                                <div
                                  className="w-3 h-3"
                                  style={{
                                    backgroundColor: getFrameColor(frameColor)
                                  }}
                                />
                              )}
                            </div>
                          </div>
                          <div className="text-gray-200 break-words flex items-center gap-2">
                            <div className="flex-1 cursor-pointer hover:text-gray-100" onClick={() => openItemDetails(item)}>
                              <div>{getCleanItemName(item.name)}</div>
                              <div className="text-xs text-gray-500 mt-1">{getEquippedItemCategory(item.name)}</div>
                              {renderAmmunitionInfo(item.name)}
                            </div>
                            {item.isVersatile && (
                              <div className="flex items-center gap-1">
                                <div
                                  className={`w-4 h-4 rounded-full ${canToggleVersatileMode(item.name) ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed opacity-50'}`}
                                  style={{
                                    backgroundColor: item.versatileMode ? getFrameColor(frameColor) : 'transparent',
                                    border: `2px solid ${getFrameColor(frameColor)}`
                                  }}
                                  onClick={() => canToggleVersatileMode(item.name) && toggleVersatileMode(item.name)}
                                  title={canToggleVersatileMode(item.name) 
                                    ? (item.versatileMode ? 'Двуручный режим (2 слота) - клик для переключения' : 'Одноручный режим (1 слот) - клик для переключения')
                                    : 'Недостаточно свободных слотов для переключения в двуручный режим'
                                  }
                                />
                                <span className="text-xs text-gray-400">
                                  {item.versatileMode ? '2H' : '1H'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="text-gray-400 text-center">{item.weight} фнт.</div>
                          <div className="text-gray-400 text-center">{formatCost(item.cost)}</div>
                        </div>
                        {index < equippedItems.filter(item => item.set === 'additional').length - 1 && (
                          <div 
                            className="my-1 h-px"
                            style={{
                              borderTop: `1px dotted ${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}40`
                            }}
                          />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 text-sm py-2">
                      Дополнительный набор пуст
                    </div>
                  )}

                  {/* Прочее */}
                  <div className="text-xs text-gray-400 mt-4 mb-1 font-semibold uppercase flex items-center gap-2">
                    ПРОЧЕЕ
                        <div className="flex gap-1">
                          {Array.from({ length: 4 }, (_, i) => (
                            <div
                              key={i}
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: i < getUsedSlotsCount(localEquipped.otherItems)
                                  ? getFrameColor(frameColor)
                                  : '#4B5563'
                              }}
                            />
                          ))}
                        </div>
                  </div>
                  {equippedItems.filter(item => item.set === 'other').length > 0 ? (
                    equippedItems.filter(item => item.set === 'other').map((item, index) => (
                      <div key={`other-${index}`}>
                        <div className="grid gap-2 text-sm py-1 items-center"
                             style={{ gridTemplateColumns: 'auto 2fr 1fr 1fr 1fr' }}>
                          <div className="flex justify-start items-center">
                            <div 
                              className="w-5 h-5 border-2 flex items-center justify-center relative cursor-pointer hover:opacity-80"
                              style={{
                                borderColor: item.equipped ? getFrameColor(frameColor) : '#6B7280',
                                backgroundColor: 'transparent'
                              }}
                              onClick={() => toggleItemEquipped(item.name)}
                            >
                              {item.equipped && (
                                <div
                                  className="w-3 h-3"
                                  style={{
                                    backgroundColor: getFrameColor(frameColor)
                                  }}
                                />
                              )}
                            </div>
                          </div>
                          <div className="text-gray-200 break-words cursor-pointer hover:text-gray-100" onClick={() => openItemDetails(item)}>
                            <div>{getCleanItemName(item.name)}</div>
                            <div className="text-xs text-gray-500 mt-1">{getEquippedItemCategory(item.name)}</div>
                          </div>
                          <div className="text-gray-400 text-center">{item.weight} фнт.</div>
                          <div className="text-gray-400 text-center">{formatCost(item.cost)}</div>
                        </div>
                        {index < equippedItems.filter(item => item.set === 'other').length - 1 && (
                          <div 
                            className="w-full h-px my-1"
                            style={{
                              borderTop: `1px dotted ${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}40`
                            }}
                          />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 text-sm py-2">
                      Прочее пусто
                    </div>
                  )}
                  
                </div>
              </div>
              
              {/* Поиск и фильтры для РЮКЗАКА */}
              <div className="space-y-4 mb-6">
                {/* Поиск по названию */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Поиск предметов в рюкзаке..."
                      value={inventorySearchFilter}
                      onChange={(e) => setInventorySearchFilter(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-transparent border rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-0"
                      style={{
                        borderColor: getFrameColor(frameColor)
                      }}
                    />
                  </div>
                  <button
                    onClick={() => setIsInventorySidebarOpen(true)}
                    className="p-2 bg-transparent border rounded-md text-gray-400 hover:text-gray-200 transition-colors"
                    style={{
                      borderColor: getFrameColor(frameColor)
                    }}
                    title="Управление инвентарём"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Фильтр по категории */}
                <div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setInventoryCategoryFilter('all')}
                      className="px-1 py-0.5 rounded text-xs font-medium transition-colors border"
                      style={{
                        backgroundColor: inventoryCategoryFilter === 'all' ? getFrameColor(frameColor) : 'transparent',
                        borderColor: getFrameColor(frameColor),
                        color: inventoryCategoryFilter === 'all' ? '#FFFFFF' : getFrameColor(frameColor)
                      }}
                      onMouseEnter={(e) => {
                        if (inventoryCategoryFilter !== 'all') {
                          e.currentTarget.style.backgroundColor = `${getFrameColor(frameColor)}20`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (inventoryCategoryFilter !== 'all') {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      ВСЕ
                    </button>
                    <button
                      onClick={() => setInventoryCategoryFilter('weapon')}
                      className="px-1 py-0.5 rounded text-xs font-medium transition-colors border"
                      style={{
                        backgroundColor: inventoryCategoryFilter === 'weapon' ? getFrameColor(frameColor) : 'transparent',
                        borderColor: getFrameColor(frameColor),
                        color: inventoryCategoryFilter === 'weapon' ? '#FFFFFF' : getFrameColor(frameColor)
                      }}
                      onMouseEnter={(e) => {
                        if (inventoryCategoryFilter !== 'weapon') {
                          e.currentTarget.style.backgroundColor = `${getFrameColor(frameColor)}20`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (inventoryCategoryFilter !== 'weapon') {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      ОРУЖИЕ
                    </button>
                    <button
                      onClick={() => setInventoryCategoryFilter('armor')}
                      className="px-1 py-0.5 rounded text-xs font-medium transition-colors border"
                      style={{
                        backgroundColor: inventoryCategoryFilter === 'armor' ? getFrameColor(frameColor) : 'transparent',
                        borderColor: getFrameColor(frameColor),
                        color: inventoryCategoryFilter === 'armor' ? '#FFFFFF' : getFrameColor(frameColor)
                      }}
                      onMouseEnter={(e) => {
                        if (inventoryCategoryFilter !== 'armor') {
                          e.currentTarget.style.backgroundColor = `${getFrameColor(frameColor)}20`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (inventoryCategoryFilter !== 'armor') {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      ДОСПЕХИ
                    </button>
                    <button
                      onClick={() => setInventoryCategoryFilter('tool')}
                      className="px-1 py-0.5 rounded text-xs font-medium transition-colors border"
                      style={{
                        backgroundColor: inventoryCategoryFilter === 'tool' ? getFrameColor(frameColor) : 'transparent',
                        borderColor: getFrameColor(frameColor),
                        color: inventoryCategoryFilter === 'tool' ? '#FFFFFF' : getFrameColor(frameColor)
                      }}
                      onMouseEnter={(e) => {
                        if (inventoryCategoryFilter !== 'tool') {
                          e.currentTarget.style.backgroundColor = `${getFrameColor(frameColor)}20`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (inventoryCategoryFilter !== 'tool') {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      ИНСТРУМЕНТЫ
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Таблица РЮКЗАК */}
              <div>
                <div className="text-sm font-semibold text-gray-300 mb-2">РЮКЗАК</div>
                
                {/* Заголовки таблицы */}
                <div className="grid gap-2 text-sm font-semibold uppercase text-gray-400 mb-2 pb-1 items-center" 
                     style={{ 
                       gridTemplateColumns: 'auto 2fr 1fr 1fr 1fr 1fr',
                       borderBottom: `1px solid ${getFrameColor(frameColor)}20` 
                     }}>
                  <div className="flex items-center justify-start">✓</div>
                  <div className="flex items-center justify-start">НАЗВАНИЕ</div>
                  <div className="text-center">ВЕС</div>
                  <div className="text-center">КЛВ</div>
                  <div className="text-center">ЦЕНА</div>
                </div>
                
                {/* Строки таблицы */}
                <div className="space-y-1">
                  {getFilteredInventoryItems(backpackItems).length > 0 ? (
                    getFilteredInventoryItems(backpackItems).map((item, index) => {
                      // item уже является объектом с нужными полями
                      const cleanName = getCleanItemName(item.name);
                      const category = item.category || getEquippedItemCategory(item.name);
                      const weight = item.weight;
                      const cost = item.cost;
                      const quantity = item.quantity;
                      const itemType = item.type;
                      
                      return (
                      <div key={index}>
                        <div className="grid gap-2 text-sm py-1 items-center"
                             style={{ gridTemplateColumns: 'auto 2fr 1fr 1fr 1fr 1fr' }}>
                          <div className="flex justify-start items-center">
                            {(itemType === 'weapon' || itemType === 'armor' || itemType === 'shield' || itemType === 'magic_item') ? (
                              <div 
                                className={`w-5 h-5 border-2 flex items-center justify-center relative ${
                                  canEquipItem(cleanName) 
                                    ? 'cursor-pointer hover:opacity-80' 
                                    : 'cursor-not-allowed opacity-50'
                                }`}
                                style={{
                                  borderColor: canEquipItem(cleanName) ? getFrameColor(frameColor) : '#6B7280',
                                  backgroundColor: 'transparent'
                                }}
                                onClick={() => canEquipItem(cleanName) && toggleItemEquipped(cleanName)}
                                title={!canEquipItem(cleanName) ? 'Недостаточно слотов для экипировки' : undefined}
                              />
                            ) : (
                              <div className="w-4 h-4" />
                            )}
                          </div>
                          <div className="text-gray-200 break-words cursor-pointer hover:text-gray-100" onClick={() => openItemDetails(item)}>
                            <div>
                              {cleanName}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{category}</div>
                          </div>
                          <div className="text-gray-400 text-center">{weight} фнт.</div>
                          <div className="text-gray-400 text-center">{quantity}</div>
                          <div className="text-gray-400 text-center">{formatCost(cost)}</div>
                        </div>
                        {index < backpackItems.length - 1 && (
                          <div 
                            className="my-1 h-px"
                            style={{
                              borderTop: `1px dotted ${frameColor === 'gold' ? '#B59E54' : frameColor === 'silver' ? '#C0C0C0' : frameColor === 'copper' ? '#B87333' : '#B59E54'}40`
                            }}
                          />
                        )}
    </div>
  );
                  })
                  ) : (
                    <div className="text-center text-gray-500 text-sm py-4">
                      Рюкзак пуст
                    </div>
                  )}
                </div>
              </div>
      </div>
    </div>
  );
      case "features":
        return (
          <div className="h-full flex flex-col">
            {/* Поиск и фильтры */}
            <div className="space-y-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск особенностей..."
                  value={featuresSearchFilter}
                  onChange={(e) => setFeaturesSearchFilter(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-transparent border rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-0"
                  style={{
                    borderColor: getFrameColor(frameColor)
                  }}
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFeaturesCategoryFilter('all')}
                  className="px-1 py-0.5 rounded text-xs font-medium transition-colors border"
                  style={{
                    backgroundColor: featuresCategoryFilter === 'all' ? getFrameColor(frameColor) : 'transparent',
                    borderColor: getFrameColor(frameColor),
                    color: featuresCategoryFilter === 'all' ? '#FFFFFF' : getFrameColor(frameColor)
                  }}
                  onMouseEnter={(e) => {
                    if (featuresCategoryFilter !== 'all') {
                      e.currentTarget.style.backgroundColor = `${getFrameColor(frameColor)}20`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (featuresCategoryFilter !== 'all') {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  ВСЕ
                </button>
                <button
                  onClick={() => setFeaturesCategoryFilter('feats')}
                  className="px-1 py-0.5 rounded text-xs font-medium transition-colors border"
                  style={{
                    backgroundColor: featuresCategoryFilter === 'feats' ? getFrameColor(frameColor) : 'transparent',
                    borderColor: getFrameColor(frameColor),
                    color: featuresCategoryFilter === 'feats' ? '#FFFFFF' : getFrameColor(frameColor)
                  }}
                  onMouseEnter={(e) => {
                    if (featuresCategoryFilter !== 'feats') {
                      e.currentTarget.style.backgroundColor = `${getFrameColor(frameColor)}20`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (featuresCategoryFilter !== 'feats') {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  ЧЕРТЫ
                </button>
                <button
                  onClick={() => setFeaturesCategoryFilter('fighting-styles')}
                  className="px-1 py-0.5 rounded text-xs font-medium transition-colors border"
                  style={{
                    backgroundColor: featuresCategoryFilter === 'fighting-styles' ? getFrameColor(frameColor) : 'transparent',
                    borderColor: getFrameColor(frameColor),
                    color: featuresCategoryFilter === 'fighting-styles' ? '#FFFFFF' : getFrameColor(frameColor)
                  }}
                  onMouseEnter={(e) => {
                    if (featuresCategoryFilter !== 'fighting-styles') {
                      e.currentTarget.style.backgroundColor = `${getFrameColor(frameColor)}20`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (featuresCategoryFilter !== 'fighting-styles') {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  БОЕВЫЕ СТИЛИ
                </button>
              </div>
            </div>

            {/* Контент */}
            <div className="flex-1 overflow-y-auto space-y-6">
              {/* Особенности класса */}
              {characterData?.class?.key === 'paladin' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getFrameColor(frameColor) }}></span>
                    ОСОБЕННОСТИ КЛАССА
                  </h3>
                  <div className="space-y-3">
                    <LayOnHandsManager level={draft.basics.level || 1} frameColor={getFrameColor(frameColor)} />
                    {(() => {
                      const level = draft.basics.level || 1;
                      const subclass = draft.basics.subclass;
                      const channelDivinity = draft.channelDivinity;
                      
                      
                      return level >= 3 && (
                        <ChannelDivinityManager 
                          level={level} 
                          frameColor={getFrameColor(frameColor)}
                          subclass={subclass}
                        />
                      );
                    })()}
                    <AuraManager level={draft.basics.level || 1} frameColor={getFrameColor(frameColor)} subclass={draft.basics.subclass} />
                  </div>
                </div>
              )}

              {/* Выученные черты */}
              {(featuresCategoryFilter === 'all' || featuresCategoryFilter === 'feats') && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getFrameColor(frameColor) }}></span>
                    ЧЕРТЫ
                  </h3>
                  {getFilteredFeats().length === 0 ? (
                    <p className="text-gray-400 text-sm py-4">
                      Черты отсутствуют
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {getFilteredFeats().map((feat, index) => (
                        <div key={index} className="border-b border-gray-600 bg-neutral-900 shadow-inner shadow-sm">
                          <Collapsible>
                            <CollapsibleTrigger asChild>
                              <div className="w-full p-3 bg-neutral-800 hover:bg-neutral-700 transition-colors cursor-pointer">
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-col items-start">
                                    <span className="text-white font-medium">{feat.name}</span>
                                    {feat.isLegacy && (
                                      <span 
                                        className="text-xs font-medium mt-1"
                                        style={{ color: getFrameColor(frameColor) }}
                                      >
                                        Legacy
                                      </span>
                                    )}
                                  </div>
                                  <ChevronDown className="w-4 h-4 text-gray-400" />
                                </div>
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="p-4 bg-neutral-900">
                                <div className="space-y-3">
                                  <p className="text-gray-300 text-sm leading-relaxed">{feat.desc}</p>
                                  
                                  {feat.effect && feat.effect.length > 0 && (
                                    <div className="space-y-2">
                                      <h4 className="text-sm font-semibold text-gray-200">Эффекты:</h4>
                                      {feat.effect.map((effect, effectIndex) => {
                                        const choices = getFeatChoices(feat.key);
                                        console.log('Displaying feat choices for:', feat.key, 'choices:', choices);
                                        
                                        return (
                                          <div key={effectIndex} className="bg-neutral-800 p-3 rounded border-l-2" style={{ borderLeftColor: getFrameColor(frameColor) }}>
                                            {effect.name && (
                                              <h5 className="text-sm font-medium text-gray-200 mb-1">{effect.name}</h5>
                                            )}
                                            {effect.desc && (
                                              <p className="text-xs text-gray-300 leading-relaxed">{effect.desc}</p>
                                            )}
                                            
                                            {/* Отображение выбранных опций внутри эффекта */}
                                            {choices.length > 0 && (
                                              <div>
                                                <h6 className="text-sm font-semibold text-gray-200 mb-2">Выбранные опции:</h6>
                                                <div className="space-y-1">
                                                  {choices.map((choice, choiceIndex) => {
                                                    const [choiceType, choiceValue] = choice.split(':');
                                                    let displayName = choiceValue;
                                                    
                                                    // Переводим ключи в читаемые названия
                                                    if (choiceType === 'skill') {
                                                      const skill = SKILLS.find(s => s.key === choiceValue);
                                                      displayName = skill?.name || choiceValue;
                                                    } else if (choiceType === 'tool') {
                                                      const tool = Tools.find(t => t.key === choiceValue);
                                                      displayName = tool?.name || choiceValue;
                                                    } else if (choiceType === 'language') {
                                                      const language = LANGUAGES.find(l => l.key === choiceValue);
                                                      displayName = language?.name || choiceValue;
                                                    } else if (choiceType === 'ability') {
                                                      const ability = ABILITIES.find(a => a.key === choiceValue);
                                                      displayName = ability?.label || choiceValue;
                                                    }
                                                    
                                                    return (
                                                      <div key={choiceIndex} className="text-xs text-gray-300">
                                                        • {displayName}
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                  
                                  {feat.prerequisites && (
                                    <div className="space-y-1">
                                      <h4 className="text-sm font-semibold text-gray-200">Требования:</h4>
                                      <div className="text-xs text-gray-300 space-y-1">
                                        {feat.prerequisites.level && (
                                          <p>• Уровень: {feat.prerequisites.level}</p>
                                        )}
                                        {feat.prerequisites.oneOfAbilities && (
                                          <p>• Характеристики: {Object.entries(feat.prerequisites.oneOfAbilities).map(([key, value]) => `${key} ${value}+`).join(' или ')}</p>
                                        )}
                                        {feat.prerequisites.races && (
                                          <p>• Расы: {feat.prerequisites.races.join(', ')}</p>
                                        )}
                                        {feat.prerequisites.spellcasting && (
                                          <p>• Заклинательство</p>
                                        )}
                                        {feat.prerequisites.armor && (
                                          <p>• Доспехи: {feat.prerequisites.armor}</p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Боевые стили */}
              {(featuresCategoryFilter === 'all' || featuresCategoryFilter === 'fighting-styles') && (
                <FightingStylesSection
                  draft={draft}
                  frameColor={frameColor}
                  getFrameColor={getFrameColor}
                  featuresSearchFilter={featuresSearchFilter}
                  showTitle={true}
                />
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="relative text-gray-300 w-[561px] h-[669px] flex-shrink-0"
      style={{
        backgroundImage: `url('data:image/svg+xml;charset=utf-8,${encodeURIComponent(getActionFrameSvg(frameColor))}')`,
        backgroundSize: "100% auto",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center top",
      }}
    >
      {/* Фон под рамкой */}
      <div 
        className="absolute top-0 left-1 right-1 bottom-0 -z-50 opacity-50"
        style={{
          backgroundImage: `url('/frames/actionFrameBg.svg')`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transform: 'scaleY(1.1)',
          transformOrigin: 'center'
        }}
      />
      
      {/* Контент внутри рамки */}
      <div className="relative z-10 px-4 pt-6 pb-4 h-full flex flex-col">
        {/* Вкладки в левом верхнем углу */}
        <div className="flex gap-0 mb-4 flex-shrink-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const frameColorHex = getFrameColor(frameColor);
            
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-2 text-xs font-semibold uppercase transition-all duration-200 relative`}
                style={{
                  color: isActive ? frameColorHex : '#9CA3AF',
                  borderBottom: isActive ? `2px solid ${frameColorHex}` : 'none'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        
        {/* Контент вкладки с скроллом */}
        <div className="flex-1 overflow-y-auto scrollbar-thin" style={{
          scrollbarColor: 'rgba(156, 163, 175, 0.6) #1a1a1a'
        }}>
          {renderContent()}
        </div>
      </div>

      {/* Сайдбар управления инвентарем */}
      {isInventorySidebarOpen && (
        <div 
          className="fixed top-16 left-0 right-0 bottom-0 bg-black bg-opacity-50 z-[99999] flex justify-end"
          style={{ zIndex: '99999 !important' }}
          onClick={() => setIsInventorySidebarOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-neutral-900 h-full overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-100">
                Управление инвентарем
              </h2>
              <button
                onClick={() => setIsInventorySidebarOpen(false)}
                className="text-gray-400 hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              {/* ДОБАВИТЬ ПРЕДМЕТЫ */}
              <Collapsible open={openSections.addItems} onOpenChange={() => toggleSection('addItems')}>
                <div className="bg-neutral-900 shadow-inner shadow-sm">
                  <CollapsibleTrigger asChild>
                    <div 
                      className="flex justify-between items-center p-2 cursor-pointer transition-colors duration-200"
                      style={{
                        backgroundColor: '#394b59',
                        borderBottom: openSections.addItems ? `1px solid ${getFrameColor(frameColor)}30` : 'none',
                        borderLeft: !openSections.addItems ? `3px solid ${getFrameColor(frameColor)}` : 'none'
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <span className="font-medium text-white">ДОБАВИТЬ ПРЕДМЕТЫ</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center">
                        {openSections.addItems ? <ChevronUp className="w-6 h-6 text-white" /> : <ChevronDown className="w-6 h-6 text-white" />}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-4">
                      {/* Фильтры */}
                      <div className="space-y-4 mb-6">
                        {/* Поиск по названию */}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Поиск предметов..."
                            value={searchFilter}
                            onChange={(e) => {
                              setSearchFilter(e.target.value);
                              setItemsPerPage(10);
                            }}
                            className="w-full pl-10 pr-3 py-2 bg-transparent border rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-0"
                            style={{
                              borderColor: getFrameColor(frameColor)
                            }}
                          />
                        </div>
                        
                        {/* Фильтр по категории */}
                        <div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => setCategoryFilter('all')}
                              className="px-1 py-0.5 rounded text-xs font-medium transition-colors border"
                              style={{
                                backgroundColor: categoryFilter === 'all' ? getFrameColor(frameColor) : 'transparent',
                                borderColor: getFrameColor(frameColor),
                                color: categoryFilter === 'all' ? '#FFFFFF' : getFrameColor(frameColor)
                              }}
                              onMouseEnter={(e) => {
                                if (categoryFilter !== 'all') {
                                  e.currentTarget.style.backgroundColor = `${getFrameColor(frameColor)}20`;
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (categoryFilter !== 'all') {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }
                              }}
                            >
                              ВСЕ
                            </button>
                            {['Оружие', 'Доспехи', 'Щиты', 'Снаряжение', 'Боеприпасы', 'Инструменты', 'Наборы снаряжения'].map(category => (
                              <button
                                key={category}
                                onClick={() => setCategoryFilter(category)}
                                className="px-1 py-0.5 rounded text-xs font-medium transition-colors border"
                                style={{
                                  backgroundColor: categoryFilter === category ? getFrameColor(frameColor) : 'transparent',
                                  borderColor: getFrameColor(frameColor),
                                  color: categoryFilter === category ? '#FFFFFF' : getFrameColor(frameColor)
                                }}
                                onMouseEnter={(e) => {
                                  if (categoryFilter !== category) {
                                    e.currentTarget.style.backgroundColor = `${getFrameColor(frameColor)}20`;
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (categoryFilter !== category) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }
                                }}
                              >
                                {category.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Список предметов */}
                      <div className="space-y-2 overflow-y-auto max-h-96">
                        {getFilteredItems().slice(0, itemsPerPage).map((item) => (
                          <div
                            key={item.key}
                            className="border-b border-gray-600 bg-neutral-900 shadow-inner shadow-sm"
                          >
                            <Collapsible>
                              <CollapsibleTrigger asChild>
                                <div className="flex justify-between items-center p-2 cursor-pointer transition-colors duration-200 bg-neutral-800 hover:bg-neutral-700 min-w-0">
                                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                                    <span className="font-medium text-gray-200 break-words">
                                      {item.name}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      {item.category}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400">
                                      {translateCurrency(item.cost)}
                                    </span>
                                    <div className="flex gap-1">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handlePurchaseItem(item, 1);
                                        }}
                                        onMouseEnter={(e) => {
                                          const rect = e.currentTarget.getBoundingClientRect();
                                          setButtonPosition({
                                            x: rect.left + rect.width / 2,
                                            y: rect.top - 10
                                          });
                                          setHoveredButton(`purchase-${item.type}-${item.key}`);
                                          setTimeout(() => setShowTooltip(true), 100);
                                        }}
                                        onMouseLeave={() => {
                                          setHoveredButton(null);
                                          setButtonPosition(null);
                                          setShowTooltip(false);
                                        }}
                                        disabled={loadingPurchase.has(`${item.type}-${item.key}`)}
                                        className="p-1 text-white rounded transition-colors hover:opacity-80 relative group disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{
                                          backgroundColor: getFrameColor(frameColor),
                                        }}
                                      >
                                        {loadingPurchase.has(`${item.type}-${item.key}`) ? (
                                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                          <Coins className="w-4 h-4" />
                                        )}
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAddItem(item);
                                        }}
                                        onMouseEnter={(e) => {
                                          const rect = e.currentTarget.getBoundingClientRect();
                                          setButtonPosition({
                                            x: rect.left + rect.width / 2,
                                            y: rect.top - 10
                                          });
                                          setHoveredButton(`add-${item.type}-${item.key}`);
                                          setTimeout(() => setShowTooltip(true), 100);
                                        }}
                                        onMouseLeave={() => {
                                          setHoveredButton(null);
                                          setButtonPosition(null);
                                          setShowTooltip(false);
                                        }}
                                        disabled={loadingItems.has(`${item.type}-${item.key}`)}
                                        className="p-1 text-white rounded transition-colors hover:opacity-80 relative group disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{
                                          backgroundColor: getFrameColor(frameColor),
                                        }}
                                      >
                                        {loadingItems.has(`${item.type}-${item.key}`) ? (
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                          <Plus className="w-4 h-4" />
                                        )}
                                      </button>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                  </div>
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                {(() => {
                                  const itemDetails = getItemDetails(item.name);
                                  console.log('Attacks: itemDetails for', item.name, ':', itemDetails);
                                  if (!itemDetails) {
                                    return (
                                      <div className="p-2 text-xs text-gray-400">
                                        <div className="text-gray-300 mb-2">
                                          <span className="font-medium">Категория:</span> {item.category}
                                        </div>
                                        <div className="text-gray-300 mb-2">
                                          <span className="font-medium">Стоимость:</span> {translateCurrency(item.cost)}
                                        </div>
                                        <div className="text-gray-300">
                                          <span className="font-medium">Вес:</span> {item.weight} фнт.
                                        </div>
                                      </div>
                                    );
                                  }

                                  return (
                                    <div className="p-2">
                                      <ItemDetailsSidebar
                                        itemDetails={itemDetails}
                                        characterData={characterData}
                                        hasMagicWeaponMastery={hasMagicWeaponMastery}
                                        translateAbility={translateAbility}
                                        getFrameColor={getFrameColor}
                                        frameColor={frameColor}
                                        onDeleteItem={handleDeleteItem}
                                        loadingItems={loadingItems}
                                        hoveredDeleteItem={hoveredDeleteItem}
                                        onMouseEnterDelete={setHoveredDeleteItem}
                                        onMouseLeaveDelete={() => setHoveredDeleteItem(null)}
                                      />
                                      
                                      {/* Блок количества и добавления (для всех предметов) */}
                                      <div className="mt-3 pt-3 border-t border-gray-700">
                                          <div className="flex items-center gap-2">
                                            <span className="text-white font-medium">Количество:</span>
                                            <button
                                              onClick={() => decrementQuantity(itemDetails.key)}
                                              disabled={getQuantityForItem(itemDetails.key) <= 1}
                                              className="w-6 h-6 flex items-center justify-center text-white rounded transition-colors hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-bold"
                                              style={{ backgroundColor: getFrameColor(frameColor) }}
                                            >
                                              −
                                            </button>
                                            <input
                                              type="number"
                                              min="1"
                                              value={getQuantityForItem(itemDetails.key)}
                                              onChange={(e) => updateItemQuantity(itemDetails.key, parseInt(e.target.value) || 1)}
                                              className="w-16 px-2 py-1 text-center text-gray-200 bg-neutral-800 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                              style={{ 
                                                borderColor: getFrameColor(frameColor) + '40',
                                                '--tw-ring-color': getFrameColor(frameColor) + '40'
                                              } as any}
                                            />
                                            <button
                                              onClick={() => incrementQuantity(itemDetails.key)}
                                              className="w-6 h-6 flex items-center justify-center text-white rounded transition-colors hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-bold"
                                              style={{ backgroundColor: getFrameColor(frameColor) }}
                                            >
                                              +
                                            </button>
                                            <button
                                              onClick={() => {
                                                const quantity = getQuantityForItem(itemDetails.key);
                                                handlePurchaseItem(itemDetails, quantity);
                                              }}
                                              disabled={loadingPurchase.has(`${itemDetails.itemType}-${itemDetails.key}`)}
                                              className="h-6 w-16 flex items-center justify-center text-white rounded transition-colors hover:bg-opacity-20 disabled:opacity-50 disabled:cursor-not-allowed text-xs border"
                                              style={{ 
                                                borderColor: getFrameColor(frameColor),
                                                '--hover-bg': getFrameColor(frameColor) + '20'
                                              } as any}
                                              onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = getFrameColor(frameColor) + '20';
                                              }}
                                              onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                              }}
                                            >
                                              {loadingPurchase.has(`${itemDetails.itemType}-${itemDetails.key}`) ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                              ) : (
                                                'КУПИТЬ'
                                              )}
                                            </button>
                                            <button
                                              onClick={() => {
                                                const quantity = getQuantityForItem(itemDetails.key);
                                                handleAddItemWithQuantity(itemDetails, quantity);
                                              }}
                                              disabled={loadingItems.has(`${itemDetails.itemType}-${itemDetails.key}`)}
                                              className="h-6 w-20 flex items-center justify-center text-white rounded transition-colors hover:bg-opacity-20 disabled:opacity-50 disabled:cursor-not-allowed text-xs border"
                                              style={{ 
                                                borderColor: getFrameColor(frameColor),
                                                '--hover-bg': getFrameColor(frameColor) + '20'
                                              } as any}
                                              onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = getFrameColor(frameColor) + '20';
                                              }}
                                              onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                              }}
                                            >
                                              {loadingItems.has(`${itemDetails.itemType}-${itemDetails.key}`) ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                              ) : (
                                                'ДОБАВИТЬ'
                                              )}
                                            </button>
                                          </div>
                                          
                                          {/* Блок стоимости покупки */}
                                          <div className="mt-3">
                                            <div className="flex items-center gap-2">
                                              <span className="text-white font-medium">Стоимость покупки:</span>
                                              <span className="text-gray-200 font-semibold">
                                                {calculatePurchaseCost(itemDetails, getQuantityForItem(itemDetails.key))}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                    </div>
                                  );
                                })()}
                              </CollapsibleContent>
                            </Collapsible>
                          </div>
                        ))}
                        
                        {/* Кнопка "Показать еще" */}
                        {getFilteredItems().length > itemsPerPage && (
                          <button
                            onClick={() => setItemsPerPage(prev => prev + 10)}
                            className="w-full py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
                            style={{ color: getFrameColor(frameColor) }}
                          >
                            Показать еще ({getFilteredItems().length - itemsPerPage} предметов)
                          </button>
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>

              {/* МОЙ ИНВЕНТАРЬ */}
              <Collapsible open={openSections.myInventory} onOpenChange={() => toggleSection('myInventory')}>
                <div className="bg-neutral-900 shadow-inner shadow-sm">
                  <CollapsibleTrigger asChild>
                    <div 
                      className="flex justify-between items-center p-2 cursor-pointer transition-colors duration-200"
                      style={{
                        backgroundColor: '#394b59',
                        borderBottom: openSections.myInventory ? `1px solid ${getFrameColor(frameColor)}30` : 'none',
                        borderLeft: !openSections.myInventory ? `3px solid ${getFrameColor(frameColor)}` : 'none'
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <span className="font-medium text-white">МОЙ ИНВЕНТАРЬ</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center">
                        {openSections.myInventory ? <ChevronUp className="w-6 h-6 text-white" /> : <ChevronDown className="w-6 h-6 text-white" />}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="p-4">
                                {getBackpackItems().length === 0 ? (
                                  <div className="text-center text-gray-500 text-sm py-4">
                                    Рюкзак пуст
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {getBackpackItems().map((item, index) => {
                                      // item уже является объектом с нужными полями
                                      const cleanName = getCleanItemName(item.name);
                                      const category = item.category || getEquippedItemCategory(item.name);
                                      const weight = item.weight;
                                      const cost = item.cost;
                                      const quantity = item.quantity;
                                      const isMagicItem = item.type === 'magic_item';
                                      
                                      return (
                                        <div
                                          key={`${item.name}-${index}`}
                                          className={`flex justify-between items-center p-2 rounded border-b ${
                                            isMagicItem 
                                              ? 'bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30' 
                                              : 'bg-neutral-800 border-gray-600'
                                          }`}
                                        >
                                          <div className="flex flex-col gap-1 flex-1 min-w-0 cursor-pointer hover:text-gray-100" onClick={() => openItemDetails(item)}>
                                            <span className={`font-medium break-words ${
                                              isMagicItem ? 'text-purple-200' : 'text-gray-200'
                                            }`}>
                                              {cleanName}
                                              {isMagicItem && item.rarity && (
                                                <span className={`ml-2 text-xs px-1 py-0.5 rounded ${
                                                  item.rarity === 'common' ? 'bg-gray-600 text-gray-200' :
                                                  item.rarity === 'uncommon' ? 'bg-green-600 text-green-200' :
                                                  item.rarity === 'rare' ? 'bg-blue-600 text-blue-200' :
                                                  item.rarity === 'very_rare' ? 'bg-purple-600 text-purple-200' :
                                                  item.rarity === 'legendary' ? 'bg-orange-600 text-orange-200' :
                                                  item.rarity === 'artifact' ? 'bg-red-600 text-red-200' :
                                                  'bg-gray-600 text-gray-200'
                                                }`}>
                                                  {item.rarity === 'common' ? 'Обычный' :
                                                   item.rarity === 'uncommon' ? 'Необычный' :
                                                   item.rarity === 'rare' ? 'Редкий' :
                                                   item.rarity === 'very_rare' ? 'Очень редкий' :
                                                   item.rarity === 'legendary' ? 'Легендарный' :
                                                   item.rarity === 'artifact' ? 'Артефакт' :
                                                   item.rarity}
                                                  </span>
                                              )}
                                            </span>
                                            <span className={`text-xs ${
                                              isMagicItem ? 'text-purple-300' : 'text-gray-400'
                                            }`}>
                                              {category}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-400">
                                              {cost} • {weight} фнт.
                                            </span>
                                            <span className="text-xs text-gray-300 bg-gray-700 px-2 py-1 rounded">
                                              x{quantity}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </CollapsibleContent>
                </div>
              </Collapsible>
            </div>
          </div>
        </div>
      )}

      {/* Сайдбар с описанием предмета */}
      {isItemDetailsOpen && selectedItem && (
        <div 
          className="fixed top-16 left-0 right-0 bottom-0 bg-black bg-opacity-50 z-[99999] flex justify-end"
          style={{ zIndex: '99999 !important' }}
          onClick={closeItemDetails}
        >
          <div 
            className="w-full max-w-md bg-neutral-900 h-full overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-100">
                {getCleanItemName(selectedItem.name)}
              </h2>
              <button
                onClick={closeItemDetails}
                className="text-gray-400 hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            {(() => {
              
              const itemDetails = getItemDetails(selectedItem.name);
              if (!itemDetails) {
                return (
                  <div className="text-gray-400">
                    Информация о предмете не найдена
                  </div>
                );
              }

              return (
                <ItemDetailsSidebar
                  itemDetails={itemDetails}
                  characterData={characterData}
                  hasMagicWeaponMastery={hasMagicWeaponMastery}
                  translateAbility={translateAbility}
                  getFrameColor={getFrameColor}
                  frameColor={frameColor}
                  onDeleteItem={handleDeleteItem}
                  loadingItems={loadingItems}
                  hoveredDeleteItem={hoveredDeleteItem}
                  onMouseEnterDelete={setHoveredDeleteItem}
                  onMouseLeaveDelete={() => setHoveredDeleteItem(null)}
                />
              );
            })()}
          </div>
        </div>
      )}

      {/* Portal для подсказки мастерства */}
      {hoveredWeapon && starPosition && createPortal(
        <div 
          className="fixed px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg whitespace-nowrap pointer-events-none"
          style={{ 
            zIndex: 99999,
            left: starPosition.x,
            top: starPosition.y - 35, // Увеличиваем отступ сверху
            transform: 'translateX(-50%)'
          }}
        >
          <div className="text-white font-semibold">Мастерство</div>
          {/* Стрелочка вниз */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>,
        document.body
      )}

      {/* Portal для подсказки валюты */}
      {hoveredCurrency && currencyPosition && createPortal(
        <div 
          className="fixed px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg whitespace-nowrap pointer-events-none"
          style={{ 
            zIndex: 99999,
            left: currencyPosition.x,
            top: currencyPosition.y - 40, // Увеличиваем отступ сверху
            transform: 'translateX(-50%)'
          }}
        >
          <div className="text-white font-semibold">
            {hoveredCurrency === 'platinum' && 'Платина'}
            {hoveredCurrency === 'gold' && 'Золото'}
            {hoveredCurrency === 'electrum' && 'Электрум'}
            {hoveredCurrency === 'silver' && 'Серебро'}
            {hoveredCurrency === 'copper' && 'Медь'}
          </div>
          {/* Стрелочка вниз */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>,
        document.body
      )}

      {/* Сайдбар с описанием заклинания */}
      {isSpellDetailsOpen && selectedSpell && (
        <div 
          className="fixed top-16 left-0 right-0 bottom-0 bg-black bg-opacity-50 z-[99999] flex justify-end"
          style={{ zIndex: '99999 !important' }}
          onClick={closeSpellDetails}
        >
          <div 
            className="w-full max-w-md bg-neutral-900 h-full overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-100">
                {selectedSpell.name}
              </h2>
              <button
                onClick={closeSpellDetails}
                className="text-gray-400 hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Категория в самом верху */}
              <div className="text-gray-400 mb-2">
                {selectedSpell.level === 0 ? 'Заговор' : `Заклинание ${selectedSpell.level} уровня`}
              </div>

              {/* Источник вверху */}
              <div className="text-gray-400 mb-2">
                <span className="font-medium text-gray-200">Источник:</span> {selectedSpell.source}
              </div>
              
              <div className="space-y-2">
                <div className="text-gray-400">
                  <span className="font-medium text-gray-200">Школа:</span> {selectedSpell.school}
                </div>
                
                <div className="text-gray-400">
                  <span className="font-medium text-gray-200">Время сотворения:</span> {Array.isArray(selectedSpell.castingTime) ? selectedSpell.castingTime.join(', ') : selectedSpell.castingTime}
                </div>
                
                <div className="text-gray-400">
                  <span className="font-medium text-gray-200">Дистанция:</span> {selectedSpell.range}
                </div>
                
                <div className="text-gray-400">
                  <span className="font-medium text-gray-200">Компоненты:</span> {Array.isArray(selectedSpell.components) ? selectedSpell.components.join(', ') : selectedSpell.components}
                </div>
                
                <div className="text-gray-400">
                  <span className="font-medium text-gray-200">Длительность:</span> {selectedSpell.duration}
                </div>

                {selectedSpell.needConcentration && (
                  <div className="text-gray-400">
                    <span className="font-medium text-gray-200">Концентрация:</span> Да
                  </div>
                )}

                {selectedSpell.isRitual && (
                  <div className="text-gray-400">
                    <span className="font-medium text-gray-200">Ритуал:</span> Да
                  </div>
                )}

                {selectedSpell.damage && (
                  <>
                    <div className="text-gray-400">
                      <span className="font-medium text-gray-200">Урон:</span> {selectedSpell.damage.dice}
                    </div>
                    
                    {selectedSpell.damage.type && (
                      <div className="text-gray-400">
                        <span className="font-medium text-gray-200">Тип урона:</span> {selectedSpell.damage.type}
                      </div>
                    )}
                  </>
                )}

                {selectedSpell.save && (
                  <div className="text-gray-400">
                    <span className="font-medium text-gray-200">Спасбросок:</span> {(() => {
                      const abilityInfo = ABILITIES.find(a => a.key === selectedSpell.save);
                      return abilityInfo?.label || selectedSpell.save.toUpperCase();
                    })()}
                  </div>
                )}
              </div>

              {/* Описание */}
              {selectedSpell.desc && (
                <div className="text-gray-400 mt-3 pt-3 border-t border-gray-700">
                  <div className="font-medium text-gray-200 mb-1">Описание:</div>
                  <div className="whitespace-pre-line">
                    {selectedSpell.desc.split('\n').map((paragraph, index) => {
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
            </div>
          </div>
        </div>
      )}

      {/* Сайдбар настроек заклинаний */}
      {isSpellSettingsOpen && (
        <div 
          className="fixed top-16 left-0 right-0 bottom-0 bg-black bg-opacity-50 z-[99999] flex justify-end"
          style={{ zIndex: '99999 !important' }}
          onClick={closeSpellSettings}
        >
          <div 
            className="w-full max-w-md bg-neutral-900 h-full overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-100">
                Настройки заклинаний
              </h2>
              <button
                onClick={closeSpellSettings}
                className="text-gray-400 hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Блок "Добавить Заклинание" */}
              <Collapsible open={isAddSpellsOpen} onOpenChange={() => setIsAddSpellsOpen(!isAddSpellsOpen)}>
                <div className="bg-neutral-900 shadow-inner shadow-sm">
                  <CollapsibleTrigger asChild>
                    <div 
                      className="flex justify-between items-center p-2 cursor-pointer transition-colors duration-200"
                      style={{
                        backgroundColor: '#394b59',
                        borderBottom: isAddSpellsOpen ? `1px solid ${getFrameColor(frameColor)}30` : 'none',
                        borderLeft: !isAddSpellsOpen ? `3px solid ${getFrameColor(frameColor)}` : 'none'
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <span className="font-medium text-white">ДОБАВИТЬ ЗАКЛИНАНИЕ</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center">
                        {isAddSpellsOpen ? <ChevronUp className="w-6 h-6 text-white" /> : <ChevronDown className="w-6 h-6 text-white" />}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-4">
                      {/* Информация о подготовленных заклинаниях */}
                      <div className="text-sm text-gray-400 text-center py-3 border-b border-gray-700">
                        Подготовленные заклинания: {preparedSpells.length}/{getMaxPreparedSpells()}
                      </div>

                      {/* Поиск и фильтры */}
                      <div className="space-y-4 mb-6">
                        {/* Поиск по названию */}
                        <div>
                          <label className="text-sm font-medium text-gray-200 mb-2 block">
                            Поиск по названию
                          </label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Введите название заклинания..."
                              value={addSpellSearch}
                              onChange={(e) => setAddSpellSearch(e.target.value)}
                              className="w-full pl-10 pr-3 py-2 bg-transparent border rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-0"
                              style={{
                                borderColor: getFrameColor(frameColor)
                              }}
                            />
                          </div>
                        </div>
                        
                        {/* Фильтр по уровню */}
                        <div>
                          <label className="text-sm font-medium text-gray-200 mb-2 block">
                            Уровень заклинания
                          </label>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => setAddSpellLevelFilter("all")}
                              className="px-1 py-0.5 rounded text-xs font-medium transition-colors border"
                              style={{
                                backgroundColor: addSpellLevelFilter === "all" ? getFrameColor(frameColor) : 'transparent',
                                borderColor: getFrameColor(frameColor),
                                color: addSpellLevelFilter === "all" ? '#FFFFFF' : getFrameColor(frameColor)
                              }}
                            >
                              ВСЕ
                            </button>
                            {getAvailableSpellLevels().map(level => (
                              <button
                                key={level}
                                onClick={() => setAddSpellLevelFilter(level)}
                                className="px-1 py-0.5 rounded text-xs font-medium transition-colors border"
                                style={{
                                  backgroundColor: addSpellLevelFilter === level ? getFrameColor(frameColor) : 'transparent',
                                  borderColor: getFrameColor(frameColor),
                                  color: addSpellLevelFilter === level ? '#FFFFFF' : getFrameColor(frameColor)
                                }}
                              >
                                {`- ${level} -`}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {getFilteredSpells().map((spell, index) => {
                          const isPrepared = preparedSpells.includes(spell.key);
                          const isDisabled = !isPrepared && preparedSpells.length >= getMaxPreparedSpells();
                          return (
                            <div key={index}>
                              {renderSpellCard(
                                spell,
                                async () => {
                                  if (characterData?.class?.key) {
                                    if (isPrepared) {
                                      // Убираем заклинание из подготовленных
                                      const newSpells = preparedSpells.filter(key => key !== spell.key);
                                      setChosenSpells(characterData.class.key, newSpells);
                                      await saveToSupabase();
                                    } else if (preparedSpells.length < getMaxPreparedSpells()) {
                                      // Добавляем заклинание в подготовленные
                                      const newSpells = [...preparedSpells, spell.key];
                                      setChosenSpells(characterData.class.key, newSpells);
                                      await saveToSupabase();
                                    }
                                  }
                                },
                                undefined,
                                isPrepared,
                                false,
                                getFrameColor(frameColor),
                                isDisabled
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
              
              {/* Блок "Подготовленные Заклинания" */}
              <Collapsible open={isPreparedSpellsOpen} onOpenChange={() => setIsPreparedSpellsOpen(!isPreparedSpellsOpen)}>
                <div className="bg-neutral-900 shadow-inner shadow-sm">
                  <CollapsibleTrigger asChild>
                    <div 
                      className="flex justify-between items-center p-2 cursor-pointer transition-colors duration-200"
                      style={{
                        backgroundColor: '#394b59',
                        borderBottom: isPreparedSpellsOpen ? `1px solid ${getFrameColor(frameColor)}30` : 'none',
                        borderLeft: !isPreparedSpellsOpen ? `3px solid ${getFrameColor(frameColor)}` : 'none'
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <span className="font-medium text-white">ПОДГОТОВЛЕННЫЕ ЗАКЛИНАНИЯ</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center">
                        {isPreparedSpellsOpen ? <ChevronUp className="w-6 h-6 text-white" /> : <ChevronDown className="w-6 h-6 text-white" />}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-4">
                      {preparedSpells.length === 0 && learnedSpells.length === 0 ? (
                        <p className="text-gray-400 py-4">
                          Подготовленные заклинания отсутствуют
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {/* Показываем подготовленные заклинания */}
                          {preparedSpells.map((spellKey, index) => {
                            // Находим полную информацию о заклинании
                            const spell = getAvailableSpells().find(s => s.key === spellKey);
                            if (!spell) return null;
                            
                            return (
                              <div key={index}>
                                {renderSpellCard(
                                  spell,
                                  async () => {
                                    if (characterData?.class?.key && draft?.chosen?.spells) {
                                      const newSpells = preparedSpells.filter((_, i) => i !== index);
                                      setChosenSpells(characterData.class.key, newSpells);
                                      await saveToSupabase();
                                    }
                                  },
                                  undefined,
                                  true,
                                  false,
                                  getFrameColor(frameColor)
                                )}
                              </div>
                            );
                          })}
                          
                          {/* Показываем выученные заклинания */}
                          {learnedSpells.length > 0 && (
                            <>
                              <div className="text-sm text-gray-300 font-medium py-2 border-t border-gray-600 mt-4">
                                Выученные заклинания:
                              </div>
                              {learnedSpells.map((spellKey, index) => {
                                // Находим полную информацию о заклинании
                                const spell = getAllSpells().find(s => s.key === spellKey);
                                if (!spell) return null;
                                
                                return (
                                  <div key={`learned-${index}`}>
                                    {renderSpellCard(
                                      { ...spell, name: `${spell.name} (Выучено)` },
                                      async () => {
                                        if (characterData?.class?.key) {
                                          const newSpells = learnedSpells.filter((_, i) => i !== index);
                                          setLearnedSpells(characterData.class.key, newSpells);
                                          await saveToSupabase();
                                        }
                                      },
                                      undefined,
                                      false,
                                      true,
                                      getFrameColor(frameColor)
                                    )}
                                  </div>
                                );
                              })}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
              
              {/* Блок "Выучить Заклинание" */}
              <Collapsible open={isLearnSpellsOpen} onOpenChange={() => setIsLearnSpellsOpen(!isLearnSpellsOpen)}>
                <div className="bg-neutral-900 shadow-inner shadow-sm">
                  <CollapsibleTrigger asChild>
                    <div 
                      className="flex justify-between items-center p-2 cursor-pointer transition-colors duration-200"
                      style={{
                        backgroundColor: '#394b59',
                        borderBottom: isLearnSpellsOpen ? `1px solid ${getFrameColor(frameColor)}30` : 'none',
                        borderLeft: !isLearnSpellsOpen ? `3px solid ${getFrameColor(frameColor)}` : 'none'
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <span className="font-medium text-white">ВЫУЧИТЬ ЗАКЛИНАНИЕ</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center">
                        {isLearnSpellsOpen ? <ChevronUp className="w-6 h-6 text-white" /> : <ChevronDown className="w-6 h-6 text-white" />}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-4">
                      {/* Предупреждение */}
                      <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 mt-0.5">
                          </div>
                          <div className="text-sm text-yellow-200">
                            <span className="font-medium">Внимание!</span> Добавление данных заклинаний не затрагивает лимит подготовленных заклинаний. Спросите разрешения Мастера перед добавлением!
                          </div>
                        </div>
                      </div>

                      {/* Поиск и фильтры */}
                      <div className="space-y-4 mb-6">
                        {/* Поиск по названию */}
                        <div>
                          <label className="text-sm font-medium text-gray-200 mb-2 block">
                            Поиск по названию
                          </label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Введите название заклинания..."
                              value={learnSpellSearch}
                              onChange={(e) => setLearnSpellSearch(e.target.value)}
                              className="w-full pl-10 pr-3 py-2 bg-transparent border rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-0"
                              style={{
                                borderColor: getFrameColor(frameColor)
                              }}
                            />
                          </div>
                        </div>
                        
                        {/* Фильтр по уровню */}
                        <div>
                          <label className="text-sm font-medium text-gray-200 mb-2 block">
                            Уровень заклинания
                          </label>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => setLearnSpellLevelFilter("all")}
                              className="px-1 py-0.5 rounded text-xs font-medium transition-colors border"
                              style={{
                                backgroundColor: learnSpellLevelFilter === "all" ? getFrameColor(frameColor) : 'transparent',
                                borderColor: getFrameColor(frameColor),
                                color: learnSpellLevelFilter === "all" ? '#FFFFFF' : getFrameColor(frameColor)
                              }}
                            >
                              ВСЕ
                            </button>
                            {getAllSpellLevels().map(level => (
                              <button
                                key={level}
                                onClick={() => setLearnSpellLevelFilter(level)}
                                className="px-1 py-0.5 rounded text-xs font-medium transition-colors border"
                                style={{
                                  backgroundColor: learnSpellLevelFilter === level ? getFrameColor(frameColor) : 'transparent',
                                  borderColor: getFrameColor(frameColor),
                                  color: learnSpellLevelFilter === level ? '#FFFFFF' : getFrameColor(frameColor)
                                }}
                              >
                                {`- ${level} -`}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {getFilteredAllSpells().map((spell, index) => {
                          const isLearned = learnedSpells.includes(spell.key);
                          return (
                            <div key={index}>
                              {renderSpellCard(
                                spell,
                                async () => {
                                  if (characterData?.class?.key) {
                                    if (isLearned) {
                                      // Убираем заклинание из выученных
                                      const newSpells = learnedSpells.filter(key => key !== spell.key);
                                      setLearnedSpells(characterData.class.key, newSpells);
                                      await saveToSupabase();
                                    } else {
                                      // Добавляем заклинание в выученные
                                      const newSpells = [...learnedSpells, spell.key];
                                      setLearnedSpells(characterData.class.key, newSpells);
                                      await saveToSupabase();
                                    }
                                  }
                                },
                                undefined,
                                false,
                                isLearned,
                                getFrameColor(frameColor)
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            </div>
          </div>
        </div>
      )}
      
      {/* Портал для tooltip'ов кнопок */}
      {hoveredButton && buttonPosition && showTooltip && createPortal(
        <div
          className="fixed px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg pointer-events-none z-[9999] whitespace-nowrap transition-opacity duration-200"
          style={{
            left: buttonPosition.x,
            top: buttonPosition.y,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="text-white font-semibold">
            {hoveredButton.startsWith('purchase-') ? 'Купить' : 'Добавить'}
          </div>
          {/* Стрелочка вниз */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>,
        document.body
      )}
    </div>
  );
}