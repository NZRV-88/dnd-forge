import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

const LIST_KEY = "dnd-ru-characters";

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

export default function CharacterView() {
  const { id } = useParams();
  const nav = useNavigate();
  const [char, setChar] = useState<any | null>(null);
  const [curHp, setCurHp] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LIST_KEY) || "[]";
      const list = JSON.parse(raw);
      const found = list.find((c: any) => String(c.id) === String(id));
      setChar(found || null);
      if (found) setCurHp(Math.max(0, (found.basics.hpCurrent ?? 0)));
    } catch (e) {
      setChar(null);
    }
  }, [id]);

  const finalStats = useMemo(() => {
    if (!char) return {};
    const basics = char.basics || {};
    const stats = char.stats || {};
    const raceBonuses = basics.raceBonuses || {};
    const backgroundBonuses = basics.backgroundBonuses || {};
    const asi = char.asi || {};
    const asiBonuses: Record<string, number> = {};
    Object.values(asi).forEach((s: any) => {
      if (!s) return;
      if (s.mode === "asi") {
        if (s.s1) asiBonuses[s.s1] = (asiBonuses[s.s1] || 0) + 1;
        if (s.s2) asiBonuses[s.s2] = (asiBonuses[s.s2] || 0) + 1;
      }
    });
    const keys = ["str", "dex", "con", "int", "wis", "cha"] as const;
    const out: Record<string, number> = {};
    keys.forEach((k) => {
      const base = stats[k] || 0;
      out[k] = base + (raceBonuses[k] || 0) + (backgroundBonuses[k] || 0) + (asiBonuses[k] || 0);
    });
    return out;
  }, [char]);

  if (!char) {
    return (
      <div className="container mx-auto py-10">
        <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-10 text-center">
          <div className="text-lg">Персонаж не найден</div>
          <div className="mt-4">
            <Button onClick={() => nav(-1)}>Назад</Button>
          </div>
        </div>
      </div>
    );
  }

  const b = char.basics || {};
  const equipment = char.equipment || [];

  const hpMax = (() => {
    const die: Record<string, number> = {
      barbarian: 12,
      bard: 8,
      fighter: 10,
      wizard: 6,
      druid: 8,
      cleric: 8,
      warlock: 8,
      monk: 8,
      paladin: 10,
      rogue: 8,
      ranger: 10,
      sorcerer: 6,
    };
    const d = die[b.class as keyof typeof die] || 8;
    const con = char.stats?.con ?? 0;
    const conMod = Math.floor((con - 10) / 2);
    const level = b.level || 1;
    const hpMode = b.hpMode || "fixed";
    let hp = d + conMod;
    if (hpMode === "fixed") hp += (level - 1) * (Math.floor(d / 2) + 1 + conMod);
    else hp += (level - 1) * (1 + conMod);
    return Math.max(0, hp);
  })();

  const mod = (v: number) => {
    const m = Math.floor((v - 10) / 2);
    return `${m >= 0 ? "+" : ""}${m}`;
  };

  const saveHp = (val: number) => {
    setCurHp(val);
    try {
      const raw = localStorage.getItem(LIST_KEY) || "[]";
      const list = JSON.parse(raw);
      const idx = list.findIndex((c: any) => String(c.id) === String(id));
      if (idx !== -1) {
        list[idx].basics.hpCurrent = val;
        localStorage.setItem(LIST_KEY, JSON.stringify(list));
      }
    } catch {}
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-4xl rounded-2xl border bg-gradient-to-b from-amber-50 via-amber-100 to-amber-50 p-6 shadow-2xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold">{b.name || "Без имени"}</h1>
            <div className="text-sm text-muted-foreground">{b.race} • {CLASS_LABELS[b.class] || b.class}{b.subclass ? ` • ${b.subclass}` : ""} • ур. {b.level}</div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => nav(-1)}>Назад</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1 rounded-md border bg-white/60 p-4">
            <div className="mb-3 text-xs text-muted-foreground">Здоровье</div>
            <div className="flex items-center gap-3">
              <div className="text-xl font-bold">{curHp ?? 0} / {hpMax}</div>
              <div className="flex items-center gap-2">
                <button className="h-8 w-8 rounded-md border" onClick={() => saveHp(Math.max(0, (curHp ?? 0) - 1))}>−</button>
                <button className="h-8 w-8 rounded-md border" onClick={() => saveHp(Math.min(hpMax, (curHp ?? 0) + 1))}>+</button>
              </div>
            </div>

            <div className="mt-4 text-sm">
              <div className="text-xs text-muted-foreground">Снаряжение</div>
              {equipment.length > 0 ? (
                <ul className="list-disc pl-5">
                  {equipment.map((it: string, i: number) => <li key={i}>{it}</li>)}
                </ul>
              ) : (
                <div className="text-sm text-muted-foreground">—</div>
              )}
            </div>
          </div>

          <div className="col-span-2 rounded-md border bg-white/60 p-4">
            <div className="grid grid-cols-3 gap-3">
              {(["str", "dex", "con", "int", "wis", "cha"] as const).map((k) => {
                const val = (finalStats as any)[k] || 0;
                return (
                  <div key={k} className="rounded-md border p-3 bg-gradient-to-b from-white to-amber-50">
                    <div className="flex items-baseline justify-between">
                      <div className="text-sm font-medium">{k.toUpperCase()}</div>
                      <div className="text-xl font-extrabold">{val}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">{mod(val)}</div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4">
              <div className="text-xs text-muted-foreground">Примечание</div>
              <div className="text-sm text-muted-foreground">Редактируйте персонажа через «Редактировать». Этот экран даёт быстрый интерактивный обзор (HP, статистики, снаряжение).</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
