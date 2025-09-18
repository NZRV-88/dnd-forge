import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCharacter } from "@/store/character";
import { Button } from "@/components/ui/button";

const LIST_KEY = "dnd-ru-characters";
const EDITING_ID_KEY = "dnd-ru-editing-id";

function upsertCharacter(character: any) {
  const list = JSON.parse(localStorage.getItem(LIST_KEY) || "[]");
  const editingId = localStorage.getItem(EDITING_ID_KEY);
  if (editingId) {
    const idx = list.findIndex((c: any) => String(c.id) === editingId);
    if (idx !== -1) {
      const prev = list[idx];
      list[idx] = { ...character, id: prev.id, created: prev.created };
    } else {
      list.push(character);
    }
    localStorage.removeItem(EDITING_ID_KEY);
  } else {
    list.push(character);
  }
  localStorage.setItem(LIST_KEY, JSON.stringify(list));
}

// Local mapping of class keys to Russian labels (kept small and explicit)
const CLASS_LABELS: Record<string, string> = {
  fighter: "Воин",
  rogue: "Плут",
  wizard: "Волшебник",
  cleric: "Жрец",
  ranger: "Следопыт",
  bard: "Бард",
  barbarian: "Варвар",
  monk: "Монах",
  paladin: "Паладин",
  warlock: "Колдун",
  sorcerer: "Чародей",
  druid: "Друид",
};

export default function Summary() {
  const nav = useNavigate();
  const { basics, stats, asi } = useCharacter();

  // Compute final stats including race/background/ASI bonuses
  const { finalStats, breakdown } = useMemo(() => {
    const keys = ["str", "dex", "con", "int", "wis", "cha"] as const;
    const f: Record<string, number> = {};
    const bdown: Record<string, string[]> = {};

    const raceBonuses = (basics as any).raceBonuses || {};
    const backgroundBonuses = (basics as any).backgroundBonuses || {};

    // Pre-calc ASI bonuses per ability
    const asiBonuses: Record<string, number> = {};
    Object.values(asi || {}).forEach((s: any) => {
      if (!s) return;
      if (s.mode === "asi") {
        if (s.s1) asiBonuses[s.s1] = (asiBonuses[s.s1] || 0) + 1;
        if (s.s2) asiBonuses[s.s2] = (asiBonuses[s.s2] || 0) + 1;
      }
    });

    keys.forEach((k) => {
      const base = (stats as any)[k] || 0;
      const r = raceBonuses[k] || 0;
      const bg = backgroundBonuses[k] || 0;
      const a = asiBonuses[k] || 0;
      f[k] = base + r + bg + a;
      const parts: string[] = [`${base} (баз.)`];
      if (r) parts.push(`${r > 0 ? "+" : ""}${r} (раса)`);
      if (bg) parts.push(`${bg > 0 ? "+" : ""}${bg} (предыстория)`);
      if (a) parts.push(`${a > 0 ? "+" : ""}${a} (ASI)`);
      bdown[k] = parts;
    });

    return { finalStats: f, breakdown: bdown };
  }, [stats, basics, asi]);

  const equipment = (basics as any).equipment || [];
  const gold = (basics as any).gold || 0;

  // Utility to format modifier
  const mod = (v: number) => {
    const m = Math.floor((v - 10) / 2);
    return `${m >= 0 ? "+" : ""}${m}`;
  };

  const handleSave = () => {
    const editingId = localStorage.getItem(EDITING_ID_KEY);
    const character = {
      basics,
      stats: finalStats,
      asi,
      equipment,
      gold,
      created: new Date().toISOString(),
      id: editingId ? Number(editingId) : Date.now(),
    };
    upsertCharacter(character);
    nav("/characters");
  };

  const classLabel = CLASS_LABELS[(basics as any).class] || (basics as any).class || "—";
  const subclassLabel = (basics as any).subclass ? ` / ${(basics as any).subclass}` : "";

  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-4xl rounded-2xl border bg-gradient-to-b from-amber-50 via-amber-100 to-amber-50 p-6 shadow-2xl">
        <div className="flex items-center gap-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-md border bg-gradient-to-b from-yellow-200 to-yellow-100 flex items-center justify-center text-xl font-bold text-amber-900">✦</div>
            <div>
              <h1 className="text-3xl font-extrabold">Лист персонажа</h1>
              <div className="text-sm text-muted-foreground">Подробная сводка — стиль Dungeons & Dragons</div>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Button variant="secondary" onClick={() => nav(-1)}>Назад</Button>
            <Button onClick={handleSave}>Сохранить</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: basics & equipment */}
          <div className="col-span-1 rounded-lg border bg-white/60 p-4 shadow-inner">
            <div className="mb-4">
              <div className="text-xs text-muted-foreground">Имя</div>
              <div className="text-lg font-semibold">{(basics as any).name || "—"}</div>
            </div>
            <div className="mb-4">
              <div className="text-xs text-muted-foreground">Класс / Подкласс</div>
              <div className="text-lg font-semibold">{classLabel}{subclassLabel}</div>
            </div>
            <div className="mb-4">
              <div className="text-xs text-muted-foreground">Раса</div>
              <div className="text-lg">{(basics as any).race || "—"}</div>
            </div>
            <div className="mb-4">
              <div className="text-xs text-muted-foreground">Уровень</div>
              <div className="text-lg">{(basics as any).level || 1}</div>
            </div>
            <div className="mb-4">
              <div className="text-xs text-muted-foreground">Предыстория</div>
              <div className="text-lg">{(basics as any).background || "—"}</div>
            </div>

            <div className="mt-4">
              <div className="text-xs text-muted-foreground mb-2">Снаряжение</div>
              {equipment.length > 0 ? (
                <ul className="list-disc pl-5 text-sm">
                  {equipment.map((it: string, i: number) => (
                    <li key={i}>{it}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-muted-foreground">—</div>
              )}
              {gold > 0 && (
                <div className="mt-2 text-sm">
                  <span className="font-semibold">Золото:</span> {gold} зм
                </div>
              )}
            </div>
          </div>

          {/* Middle + right: stats */}
          <div className="col-span-2 rounded-lg border bg-white/60 p-4">
            <div className="grid grid-cols-3 gap-3">
              {(["str", "dex", "con", "int", "wis", "cha"] as const).map((k) => {
                const label = k.toUpperCase();
                const value = (finalStats as any)[k] ?? 0;
                const parts = (breakdown as any)[k] || [];
                return (
                  <div key={k} className="rounded-md border p-3 bg-gradient-to-b from-white to-amber-50">
                    <div className="flex items-baseline justify-between">
                      <div className="text-sm font-medium">{label}</div>
                      <div className="text-xl font-extrabold">{value}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">{mod(value)}</div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {parts.map((p: string, i: number) => (
                        <div key={i}>{p}</div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 text-sm text-muted-foreground">Примечание: показаны базовые значения и бонусы от расы, предыстории и ASI.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
