import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ChoiceRenderer from "@/components/ui/ChoiceRenderer";
import { ClassTraitsTable } from "@/components/ui/ClassTraitsTable";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useCharacter } from "@/store/character";
import { FEATURES } from "@/data/classes/features/features";
import type { ChoiceOption } from "@/data/shared/choices";
import type { ClassInfo } from "@/data/classes/types";

export interface FeatureBlockProps {
  name: string;
  desc: string;
  featureLevel?: number;
  source: string;
  idx: number;
  choices?: ChoiceOption[];
  textMaxHeight?: number;
  originalIndex?: number;
  originalLevel?: number;
  isSubclass?: boolean;
  uniqueId?: string;
  defaultExpanded?: boolean;
  ignoreLevel?: boolean;
  classInfo?: ClassInfo; // Добавляем информацию о классе для отображения таблицы особенностей
  showChoices?: boolean; // Показывать ли выборы в ClassTraitsTable
  customContent?: React.ReactNode; // Кастомный контент для отображения внутри блока
  featKey?: string; // Ключ feat для проверки завершенности его выборов
}

export default function FeatureBlock({
  name,
  desc,
  featureLevel,
  source,
  idx,
  choices,
  textMaxHeight = 80,
  originalIndex,
  originalLevel,
  isSubclass,
  uniqueId,
  defaultExpanded = false,
  ignoreLevel = false,
  classInfo,
  showChoices = true,
  customContent,
  featKey,
}: FeatureBlockProps) {
  const { draft, setChosenFeatures, setChosenFightingStyle } = useCharacter();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [textExpanded, setTextExpanded] = useState(false);
  const [needsToggle, setNeedsToggle] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Создаем уникальный ключ на основе уникального идентификатора
  const featureKey = uniqueId || (featureLevel ? `${source}-${featureLevel}-${idx}` : `${source}-${idx}`); // уникальный ключ для этого блока
  
  console.log('FeatureBlock:', {
    name,
    featureKey,
    uniqueId,
    source,
    featureLevel,
    idx,
    choices: choices?.length || 0
  });
  
  // Временное логирование для отладки

  useEffect(() => {
    if (expanded && contentRef.current) {
      // Небольшая задержка для корректного измерения высоты после рендера
      const timer = setTimeout(() => {
        if (contentRef.current) {
          setNeedsToggle(contentRef.current.scrollHeight > textMaxHeight);
        }
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [expanded, desc, textMaxHeight]);

  // Обновляем needsToggle при изменении textExpanded
  useEffect(() => {
    if (expanded && contentRef.current) {
      const timer = setTimeout(() => {
        if (contentRef.current) {
          setNeedsToggle(contentRef.current.scrollHeight > textMaxHeight);
        }
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [textExpanded, expanded, textMaxHeight]);

  // Сбрасываем textExpanded при закрытии блока
  useEffect(() => {
    if (!expanded) {
      setTextExpanded(false);
    }
  }, [expanded]);

  if (!ignoreLevel && featureLevel && draft.basics.level < featureLevel) return null;

  // --- Функция: получить выбранные значения для одного choice (возвращает массив выбранных ключей) ---
  const getSelectedForChoice = (choice: ChoiceOption, sourceKey: string): string[] => {
    switch (choice.type) {
      case "ability":
        return draft.chosen.abilities?.[sourceKey] ? [...draft.chosen.abilities[sourceKey]] : [];
      case "skill":
        return draft.chosen.skills?.[sourceKey] ? [...draft.chosen.skills[sourceKey]] : [];
      case "tool":
        return draft.chosen.tools?.[sourceKey] ? [...draft.chosen.tools[sourceKey]] : [];
      case "language":
        return draft.chosen.languages?.[sourceKey] ? [...draft.chosen.languages[sourceKey]] : [];
      case "spell":
        return draft.chosen.spells?.[sourceKey] ? [...draft.chosen.spells[sourceKey]] : [];
      case "fighting-style":
        return draft.chosen.fightingStyle?.[sourceKey] ? [...draft.chosen.fightingStyle[sourceKey]] : [];
                case "weapon-mastery":
                    const weaponMasteryResult = draft.chosen.weaponMastery?.[sourceKey] ? [...draft.chosen.weaponMastery[sourceKey]] : [];
                    console.log('FeatureBlock getSelectedForChoice: weapon-mastery:', {
                        sourceKey,
                        weaponMasteryResult,
                        allWeaponMastery: draft.chosen.weaponMastery
                    });
                    return weaponMasteryResult;
      case "feature":
        return draft.chosen.features?.[sourceKey] ? [...draft.chosen.features[sourceKey]] : [];
      case "feat":
        // Используем source-specific ключ для талантов
        const sourceFeats = draft.chosen.feats || [];
        const featKey = `${sourceKey}-0`; // используем индекс 0 для первого таланта
        const selectedFeat = sourceFeats.find(f => f.startsWith(featKey + ':'))?.split(':')[1];
        return selectedFeat ? [selectedFeat] : [];
      case "subclass":
        // В твоём ChoiceRenderer подкласс хранится в basics.subclass
        return draft.basics.subclass ? [draft.basics.subclass] : [];
      default:
        return [];
    }
  };

  // --- Рекурсивная функция: посчитать selected и total для списка choices ---
  // sourceKey — ключ, по которому хранятся выборы для текущего блока (обычно featureKey)
  const countChoicesRecursive = (choiceList: ChoiceOption[], sourceKey: string) => {
    let selected = 0;
    
    console.log('FeatureBlock countChoicesRecursive:', {
      name,
      sourceKey,
      choiceList,
      draft: {
        abilities: draft.chosen.abilities?.[sourceKey],
        skills: draft.chosen.skills?.[sourceKey],
        tools: draft.chosen.tools?.[sourceKey],
        languages: draft.chosen.languages?.[sourceKey],
        spells: draft.chosen.spells?.[sourceKey],
        weaponMastery: draft.chosen.weaponMastery?.[sourceKey],
        features: draft.chosen.features?.[sourceKey],
        fightingStyle: draft.chosen.fightingStyle?.[sourceKey]
      },
      allWeaponMastery: draft.chosen.weaponMastery,
      allSkills: draft.chosen.skills
    });
    let total = 0;

    for (const choice of choiceList) {
      const cnt = choice.count ?? 1;
      total += cnt;

      const arr = getSelectedForChoice(choice, sourceKey);
      // Фильтруем пустые значения при подсчете
      const filledArr = arr.filter(item => item !== "");
      selected += Math.min(filledArr.length, cnt);

      // если в этом choice выбранные элементы являются feature (т.е. нужно зайти в FEATURES и посчитать их вложенные choices)
      if (choice.type === "feature") {
        // для каждого выбранного feature (например, blessed-warrior или fighting-style)
        for (const chosenKey of arr) {
          const nestedFeature = FEATURES.find(f => f.key === chosenKey);
          if (nestedFeature?.choices && nestedFeature.choices.length > 0) {
            const nested = countChoicesRecursive(nestedFeature.choices, `feature-${chosenKey}`);
            // вложенные выборы увеличивают общий total и selected
            total += nested.total;
            selected += nested.selected;
          }
        }
      }

      // NOTE: мы намеренно НЕ рекурсируем по "subclass" здесь,
      // потому что сам выбор подкласса — отдельный выбор (1), а особенности подкласса
      // отображаются как отдельные FeatureBlock на других уровнях.
    }

    return { selected, total };
  };

  // --- Считаем для текущего блока (локально) ---
  let selected = 0;
  let total = 0;
  if (choices && choices.length > 0) {
    // Если есть featKey, используем его source, иначе используем featureKey
    const sourceForCount = featKey ? source : featureKey;
    const counts = countChoicesRecursive(choices, sourceForCount);
    selected = counts.selected;
    total = counts.total;
  }

  const hasUnfinishedChoice = showChoices && total > 0 ? selected < total : false;
  const choiceCountDisplay = showChoices && total > 0 ? `${selected}/${total}` : "";

  // --- Сброс вложенных при смене (если нужно) ---
  const handleFeatureChange = (value: string) => {
    // ChoiceRenderer обычно вызывает setChosenFeatures(featureKey, [value]) — оставляем тут для совместимости
    setChosenFeatures(featureKey, value ? [value] : []);
    // при смене старой выбранной фичи очищаем её вложенные fighting-style
    // оставляем прежнюю логику, если нужно:
    // setChosenFightingStyle(`feature-${prev}`, []);
  };

  return (
    <div className={`relative border-2 rounded ${hasUnfinishedChoice ? "border-blue-300" : "border-stone-200"}`}>
      {/* Верхний индикатор незавершённого выбора */}
      {hasUnfinishedChoice && (
        <div className="absolute -top-3 -left-3 z-20">
          <div className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg">!</div>
              </div>

          )}


      {/* Header */}
      <div
        className={`flex justify-between items-center p-2 cursor-pointer transition-colors duration-200 ${expanded ? "bg-primary/15 border-b border-primary/30" : "bg-muted/40 hover:bg-primary/10"}`}
        onClick={() => setExpanded(!expanded)}
          >

        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="font-medium">{name}</span>
            <span className="text-xs text-muted-foreground mt-1">
                          {featureLevel !== undefined && featureLevel !== null && featureLevel > 0 && `${featureLevel} уровень`}
                          {total > 0 && (
                              <span
                                  className={`ml-1 gap-1 px-2 py-0.5 text-[11px]`}
                              >Выбор: {choiceCountDisplay}
                              </span>
                          )}
            </span>
          </div>
         
        </div>
        <div className="flex items-center justify-center">
          {expanded ? <ChevronUp className="w-6 h-6 text-primary" /> : <ChevronDown className="w-6 h-6 text-primary" />}
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="p-2 text-xs text-muted-foreground [&>p]:mb-4 whitespace-pre-line">
          {/* Специальный случай для "Основные особенности класса" */}
          {name === "Основные особенности класса" && classInfo ? (
            <ClassTraitsTable 
              classInfo={classInfo} 
              choices={choices}
              source={featureKey}
              showChoices={showChoices}
            />
          ) : customContent ? (
            /* Кастомный контент */
            customContent
          ) : (
            <>
              <div 
                ref={contentRef} 
                className={`relative ${!textExpanded ? 'overflow-hidden' : ''}`}
                style={{ maxHeight: textExpanded ? "none" : `${textMaxHeight}px` }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{desc.replace(/\\n/g, "\n")}</ReactMarkdown>
                {!textExpanded && needsToggle && (
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card via-card/80 to-transparent pointer-events-none" />
                )}
              </div>

              {needsToggle && (
                <div
                  role="button"
                  tabIndex={0}
                  className="text-lime-500 font-semibold text-xs mt-1 hover:text-lime-600 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation(); // чтобы клик не закрывал блок
                    setTextExpanded(!textExpanded);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      setTextExpanded(!textExpanded);
                    }
                  }}
                >
                  {textExpanded ? "Свернуть" : "Показать больше"}
                </div>
              )}

              {choices && choices.length > 0 && showChoices && (
                <div className="mt-2">
                  {choices.map((choice, ci) => (
                    <ChoiceRenderer key={`${featureKey}-${ci}`} ci={ci} source={featureKey} choices={[choice]} isPreview={!showChoices} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
