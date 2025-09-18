import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCharacter } from "@/store/character";
import { Button } from "@/components/ui/button";

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
  const [assign, setAssign] = useState<{ [k: string]: number }>({ ...stats });

  // Roll new stats
  const handleRoll = () => {
    const arr = rollArray();
    setRolled(arr);
    setPool(arr);
    setAssign({});
  };

  // Assign stat to ability
  const handleAssign = (ability: string, value: number) => {
    setAssign((prev) => {
      const updated = { ...prev };
      updated[ability] = value;
      return updated;
    });
  };

  // Проверка, все ли значения распределены (учитываем дубликаты)
  const allAssigned = (() => {
    const assignedValues = Object.values(assign).filter((v) => typeof v === "number") as number[];
    if (assignedValues.length !== pool.length) return false;
    const freq = (arr: number[]) => arr.reduce((m, x) => ((m[x] = (m[x] || 0) + 1), m), {} as Record<number, number>);
    const aFreq = freq(assignedValues);
    const pFreq = freq(pool);
    return Object.keys(pFreq).every((k) => aFreq[Number(k)] === pFreq[Number(k)]);
  })();

  // Сохранить и перейти далее
  const handleNext = () => {
    ABILITY_KEYS.forEach(({ key }) => setStat(key as any, assign[key]));
    nav("/create/summary");
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-lg rounded-2xl border bg-card p-8 shadow-lg">
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
            <div className="mt-2 text-sm text-muted-foreground">
              {rolled.length > 0 && (
                <span>
                  Ваши значения:{" "}
                  <span className="font-mono">{rolled.join(", ")}</span>
                </span>
              )}
            </div>
          </div>
        )}
        <div className="grid gap-3">
          {ABILITY_KEYS.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-3">
              <span className="w-28">{label}</span>
              <select
                className="rounded-md border bg-background px-2 py-1"
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
                <option value="">—</option>
                {pool.map((v, idx) => {
                  const assignedCount = Object.values(assign).filter((x) => x === v).length;
                  const availableCount = pool.filter((p) => p === v).length;
                  // If value already fully assigned elsewhere and it's not the current selection, hide it
                  if (assignedCount >= availableCount && assign[key] !== v) return null;
                  return (
                    <option key={`${idx}-${v}`} value={v}>
                      {v}
                    </option>
                  );
                })}
              </select>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-between gap-3">
          <Button variant="secondary" onClick={() => nav("/create/race")}>
            Назад
          </Button>
          <Button onClick={handleNext} disabled={!allAssigned}>
            Далее
          </Button>
        </div>
      </div>
    </div>
  );
}
