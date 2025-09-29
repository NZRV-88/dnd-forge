import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ChoiceRenderer from "@/components/ui/ChoiceRenderer";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useCharacter } from "@/store/character";
import { FEATURES } from "@/data/classes/features/features";
import type { ChoiceOption } from "@/data/shared/choices";

export interface FeatureBlockProps {
  name: string;
  desc: string;
  featureLevel: number;
  source: "class" | "subclass" | "race" | "subrace";
  idx: number;
  choices?: ChoiceOption[];
  textMaxHeight?: number;
}

export default function FeatureBlock({
  name,
  desc,
  featureLevel,
  source,
  idx,
  choices,
  textMaxHeight = 80,
}: FeatureBlockProps) {
  const { draft, setChosenFeatures, setChosenFightingStyle } = useCharacter();
  const [expanded, setExpanded] = useState(false);
  const [textExpanded, setTextExpanded] = useState(false);
  const [needsToggle, setNeedsToggle] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const featureKey = `${source}-${idx}`; // уникальный ключ для этого блока

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

  if (draft.basics.level < featureLevel) return null;

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
      case "feature":
        return draft.chosen.features?.[sourceKey] ? [...draft.chosen.features[sourceKey]] : [];
      case "feat":
        return draft.chosen.feats ? [...draft.chosen.feats] : [];
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
    let total = 0;

    for (const choice of choiceList) {
      const cnt = choice.count ?? 1;
      total += cnt;

      const arr = getSelectedForChoice(choice, sourceKey);
      selected += Math.min(arr.length, cnt);

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
    const counts = countChoicesRecursive(choices, featureKey);
    selected = counts.selected;
    total = counts.total;
  }

  const hasUnfinishedChoice = total > 0 ? selected < total : false;
  const choiceCountDisplay = total > 0 ? `${selected}/${total}` : "";

  // --- Сброс вложенных при смене (если нужно) ---
  const handleFeatureChange = (value: string) => {
    // ChoiceRenderer обычно вызывает setChosenFeatures(featureKey, [value]) — оставляем тут для совместимости
    setChosenFeatures(featureKey, value ? [value] : []);
    // при смене старой выбранной фичи очищаем её вложенные fighting-style
    // оставляем прежнюю логику, если нужно:
    // setChosenFightingStyle(`feature-${prev}`, []);
  };

  return (
    <div className={`relative border rounded overflow-hidden ${hasUnfinishedChoice ? "border-blue-400" : "border-stone-200"}`}>
      {hasUnfinishedChoice && (
        <div className="absolute -top-2 -left-2 z-20">
          <div className="bg-blue-400 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs shadow-md"></div>
        </div>
      )}

      {/* Header */}
      <div
        className={`flex justify-between items-center p-2 cursor-pointer transition-colors duration-200 ${expanded ? "bg-primary/10 border-b border-primary" : "bg-muted/20 hover:bg-primary/5"}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-col">
          <span className="font-medium">{name}</span>
          <span className="text-xs text-muted-foreground mt-1">
            {featureLevel} уровень
            {choiceCountDisplay && ` • Выбор: ${choiceCountDisplay}`}
          </span>
        </div>
        <div className="flex items-center justify-center">
          {expanded ? <ChevronUp className="w-6 h-6 text-primary" /> : <ChevronDown className="w-6 h-6 text-primary" />}
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="p-2 text-xs text-muted-foreground [&>p]:mb-4 whitespace-pre-line">
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
            <button
              className="text-lime-500 font-semibold text-xs mt-1 hover:text-lime-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation(); // чтобы клик не закрывал блок
                setTextExpanded(!textExpanded);
              }}
            >
              {textExpanded ? "Свернуть" : "Показать больше"}
            </button>
          )}

          {choices && choices.length > 0 && (
            <div className="mt-2">
              {choices.map((choice, ci) => (
                <ChoiceRenderer key={`${featureKey}-${ci}`} ci={ci} source={featureKey} choices={[choice]} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
