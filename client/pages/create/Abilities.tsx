import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCharacter } from "@/store/character";
import { Button } from "@/components/ui/button";
import ExitButton from "@/components/ui/ExitButton";
import StepArrows from "@/components/ui/StepArrows";

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];
const ABILITY_KEYS = [
  { key: "str", label: "Сила" },
  { key: "dex", label: "Ловкость" },
  { key: "con", label: "Телосложение" },
  { key: "int", label: "Интеллект" },
  { key: "wis", label: "Мудрость" },
  { key: "cha", label: "Харизма" },
];

function rollStat() {
  // 4d6 drop lowest
  const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
  rolls.sort((a, b) => a - b);
  return rolls[1] + rolls[2] + rolls[3];
}

function rollArray() {
  return Array.from({ length: 6 }, rollStat);
}

export default function AbilitiesPick() {
  const nav = useNavigate();
  const { stats, setStat } = useCharacter();
  const [mode, setMode] = useState<"array" | "roll">("array");
  const [pool, setPool] = useState<number[]>(STANDARD_ARRAY);
  const [rolled, setRolled] = useState<number[]>([]);
  const [assign, setAssign] = useState<{ [k: string]: number }>({});

  // Инициализация значений из сохраненных характеристик
  useEffect(() => {
    // Проверяем, есть ли уже распределенные значения
    const hasAssignedValues = Object.values(stats).some(val => val !== 10); // 10 - значение по умолчанию
    
    if (hasAssignedValues) {
      // Если значения уже были распределены, используем их
      setAssign({ ...stats });
      
      // Определяем, какой массив был использован (стандартный или брошенный)
      const currentValues = Object.values(stats);
      const isStandardArray = JSON.stringify([...currentValues].sort((a, b) => b - a)) === 
                             JSON.stringify([...STANDARD_ARRAY].sort((a, b) => b - a));
      
      setMode(isStandardArray ? "array" : "roll");
      if (!isStandardArray) {
        setPool(currentValues);
        setRolled(currentValues);
      }
    }
  }, [stats]);

  // Roll new stats
  const handleRoll = () => {
    const arr = rollArray();
    setRolled(arr);
    setPool(arr);
    setAssign({}); // Сбрасываем распределение при новом броске
  };

  // Assign stat to ability
  const handleAssign = (ability: string, value: number) => {
    setAssign((prev) => {
      const updated = { ...prev };
      updated[ability] = value;
      return updated;
    });
  };

  // Проверка, все ли значения распределены
  const allAssigned = (() => {
    const assignedValues = Object.values(assign).filter((v) => typeof v === "number") as number[];
    if (assignedValues.length !== pool.length) return false;
    
    // Создаем копии массивов для сравнения
    const sortedAssigned = [...assignedValues].sort((a, b) => a - b);
    const sortedPool = [...pool].sort((a, b) => a - b);
    
    return JSON.stringify(sortedAssigned) === JSON.stringify(sortedPool);
  })();

  // Сохранить и перейти далее
  const handleNext = () => {
    // Сохраняем выбранные значения
    ABILITY_KEYS.forEach(({ key }) => {
      if (assign[key] !== undefined) {
        setStat(key as keyof typeof stats, assign[key]);
      }
    });
      nav("/create/equipment");
  };

  // Сброс распределения
  const handleReset = () => {
    setAssign({});
  };

  return (
    <div className="container mx-auto py-10">
          <div className="mx-auto max-w-5xl relative">
              <StepArrows back="/create/race" next="/create/equipment" />   
              <ExitButton />
        <h1 className="text-2xl font-bold mb-6 text-center">Распределение характеристик</h1>
        
        <div className="mb-6 flex gap-4 justify-center">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={mode === "array"}
              onChange={() => {
                setMode("array");
                setPool(STANDARD_ARRAY);
                setAssign({});
              }}
            />
            Стандартный массив
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={mode === "roll"}
              onChange={() => {
                setMode("roll");
                handleRoll();
              }}
            />
            Бросок кубиков
          </label>
        </div>

        {mode === "roll" && (
          <div className="mb-4 text-center">
            <Button size="sm" variant="outline" onClick={handleRoll}>
              Бросить заново
            </Button>
            {rolled.length > 0 && (
              <div className="mt-2 text-sm text-muted-foreground">
                Ваши значения:{" "}
                <span className="font-mono">{rolled.join(", ")}</span>
              </div>
            )}
          </div>
        )}

        <div className="mb-4">
          <div className="text-sm font-medium mb-2">Доступные значения:</div>
          <div className="flex gap-2 flex-wrap">
            {pool.map((value, index) => {
              const assignedCount = Object.values(assign).filter(v => v === value).length;
              const totalCount = pool.filter(v => v === value).length;
              const available = totalCount - assignedCount;
              
              return (
                <span
                  key={index}
                  className={`px-2 py-1 rounded text-xs ${
                    available > 0 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {value} {available > 0 ? `(${available})` : ''}
                </span>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 mb-4">
          {ABILITY_KEYS.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-3">
              <span className="w-28 font-medium">{label}</span>
              <select
                className="rounded-md border bg-background px-2 py-1 flex-1"
                value={assign[key] ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    setAssign((prev) => {
                      const updated = { ...prev };
                      delete updated[key];
                      return updated;
                    });
                  } else {
                    handleAssign(key, Number(val));
                  }
                }}
              >
                <option value="">— Не выбрано —</option>
                {Array.from(new Set(pool)).map((value) => {
                  const assignedCount = Object.values(assign).filter(v => v === value).length;
                  const totalCount = pool.filter(v => v === value).length;
                  const isAvailable = assignedCount < totalCount || assign[key] === value;
                  
                  return (
                    <option
                      key={value}
                      value={value}
                      disabled={!isAvailable && assign[key] !== value}
                    >
                      {value}
                      {assign[key] === value ? " (выбрано)" : ""}
                      {!isAvailable && assign[key] !== value ? " (использовано)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
          ))}
        </div>

        {allAssigned && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg">
            <div className="text-sm text-green-800 text-center">
              Все характеристики распределены! Можно переходить дальше.
            </div>
          </div>
        )}

        <div className="flex gap-2 justify-between items-center">
          <div>
            <Button variant="outline" size="sm" onClick={handleReset}>
              Сбросить
            </Button>
          </div>
          <div className="flex gap-3">
          </div>
        </div>
      </div>
    </div>
  );
}