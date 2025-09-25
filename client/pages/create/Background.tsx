import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCharacter } from "@/store/character";
import StepArrows from "@/components/ui/StepArrows";
import { useParams } from "react-router-dom";
import * as Icons from "@/components/refs/icons";

import { 
  BACKGROUND_CATALOG, 
  BACKGROUND_LABELS, 
  getBackgroundByKey 
} from "@/data/backgrounds";
import type { BackgroundInfo } from "@/data/backgrounds/types";
import ExitButton from "@/components/ui/ExitButton";

const ABILITIES = [
  { key: "str", label: "Сила" },
  { key: "dex", label: "Ловкость" },
  { key: "con", label: "Телосложение" },
  { key: "int", label: "Интеллект" },
  { key: "wis", label: "Мудрость" },
  { key: "cha", label: "Харизма" },
];

export default function BackgroundPick() {
    const { id } = useParams<{ id: string }>(); 
  const nav = useNavigate();
  const { basics, setBasics, setBackgroundBonuses, setBackgroundSkills } = useCharacter(); // ← ДОБАВЛЕНО setBackgroundSkills
  const [selected, setSelected] = useState<string | null>(null);
  const selKey = selected || basics.background || null;
  const background = getBackgroundByKey(selKey) || null;

  const [abilityPicks, setAbilityPicks] = useState<(string | "")[]>([]);

  // Сортируем предыстории по алфавиту
  const sortedBackgrounds = [...BACKGROUND_CATALOG].sort((a, b) => 
    a.name.localeCompare(b.name, 'ru')
  );

  // Загрузка сохраненных выборов при монтировании
  useEffect(() => {
    if (basics.backgroundBonuses) {
      const picks = Object.entries(basics.backgroundBonuses)
        .flatMap(([ability, bonus]) => 
          Array(bonus).fill(ability)
        );
      setAbilityPicks(picks);
    }
  }, [basics.backgroundBonuses]);

  function onPickBackground(key: string) {
    const bg = getBackgroundByKey(key);
    if (bg) {
      // Сохраняем предысторию и её навыки ← ОБНОВЛЕНО
      setBasics({ 
        ...basics, 
        background: key,
        backgroundSkills: bg.skillProficiencies
      });
      setBackgroundSkills(bg.skillProficiencies); // ← ДОБАВЛЕНО
    }
    setSelected(key);
    // Сбрасываем выбор характеристик при смене предыстории
    setAbilityPicks([]);
  }

  function saveBackgroundChoices() {
    if (!background?.abilityBonuses) return;

    const bonus: Record<string, number> = {};
    abilityPicks.forEach((ability) => {
      if (ability) {
        bonus[ability] = (bonus[ability] || 0) + 1;
      }
    });

    setBackgroundBonuses(bonus);
  }

  const allAbilitiesPicked = background?.abilityBonuses 
    ? abilityPicks.filter(pick => pick !== "").length === background.abilityBonuses.count
    : true;

  const canProceed = basics.background !== null;

  return (
    <div className="container mx-auto py-10">
          <div className="mx-auto max-w-5xl relative">
              <StepArrows back={`/create/${id}/class`} next={`/create/${id}/race`} />   
              {/* крестик в правом верхнем углу */}
              <ExitButton />
        <div className="mb-6 flex items-baseline justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Выбор предыстории</h1>
            <p className="text-sm text-muted-foreground">
              Текущий выбор: {basics.background ? BACKGROUND_LABELS[basics.background] || basics.background : "не выбрана"}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                  {sortedBackgrounds.map((bg) => {
                      const isSelected = selected === bg.key || basics.background === bg.key;

                      return (
                          <button
                              key={bg.key}
                              onClick={() => onPickBackground(bg.key)}
                              aria-pressed={isSelected}
                              className={`text-left rounded-lg border p-3 flex flex-col justify-between transition hover:shadow-md hover:scale-[1.01] ${isSelected ? "border-2 border-primary shadow-lg scale-[1.02] bg-gradient-to-b from-primary/5 to-transparent" : ""}`}
                          >
                              {/* 👑 Корона */}
                              {isSelected && (
                                  <div className="absolute right-2 top-2 text-primary">
                                      <Icons.Crown className="w-5 h-5" />
                                  </div>
                              )}
                              <div className="flex items-center justify-between">
                                  <h3 className="font-medium">{bg.name}</h3>
                              </div>
                              <p className="mt-2 text-sm text-muted-foreground">{bg.desc}</p>
                          </button>
                      );
          })}
        </div>

        {/* Подробная информация о выбранной предыстории - показывается когда есть данные */}
        {background && (
          <div className="mt-6 rounded-xl border bg-card p-6">
            <h2 className="text-xl font-semibold mb-2">{background.name}</h2>
            <p className="mb-3 text-sm text-muted-foreground">{background.longDesc || background.desc}</p>

            {/* Навыки */}
            {background.skillProficiencies.length > 0 && (
              <div className="mb-4">
                <div className="text-sm font-medium">Владение навыками</div>
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {background.skillProficiencies.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Инструменты */}
            {background.toolProficiencies && background.toolProficiencies.length > 0 && (
              <div className="mb-4">
                <div className="text-sm font-medium">Владение инструментами</div>
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {background.toolProficiencies.map((tool) => (
                    <li key={tool}>{tool}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Языки */}
            {background.languages && background.languages.length > 0 && (
              <div className="mb-4">
                <div className="text-sm font-medium">Языки</div>
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {background.languages.map((language) => (
                    <li key={language}>{language}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Особенность */}
            <div className="mb-4">
              <div className="text-sm font-medium">Особенность: {background.feature.name}</div>
              <p className="mt-1 text-sm text-muted-foreground">{background.feature.desc}</p>
            </div>

            {/* Снаряжение */}
            <div className="mb-4">
              <div className="text-sm font-medium">Снаряжение</div>
              <ul className="mt-2 list-disc pl-5 text-sm">
                {background.equipment.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Выбор характеристик */}
            {background.abilityBonuses && (
              <div className="mb-4 p-4 bg-secondary/20 rounded-lg">
                <div className="text-sm font-medium">Бонусы характеристик</div>
                <p className="text-xs text-muted-foreground mb-3">
                  Выберите {background.abilityBonuses.count} характеристики для увеличения на {background.abilityBonuses.amount}
                </p>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {Array.from({ length: background.abilityBonuses.count }).map((_, i) => (
                    <select
                      key={i}
                      className="rounded-md border bg-background px-2 py-1"
                      value={abilityPicks[i] || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setAbilityPicks(prev => {
                          const newPicks = [...prev];
                          newPicks[i] = value;
                          return newPicks;
                        });
                      }}
                    >
                      <option value="">— Выберите —</option>
                      {ABILITIES.map((ability) => (
                        <option key={ability.key} value={ability.key}>
                          {ability.label}
                        </option>
                      ))}
                    </select>
                  ))}
                </div>

                <Button 
                  onClick={saveBackgroundChoices} 
                  disabled={!allAbilitiesPicked}
                  size="sm"
                >
                  Сохранить выбор
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Кнопки навигации - ВСЕГДА отображаются */}
        <div className="mt-6 flex justify-end gap-3">
        </div>
      </div>
    </div>
  );
}