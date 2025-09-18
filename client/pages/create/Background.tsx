import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCharacter } from "@/store/character";

const ABILITIES = [
  { key: "str", label: "Сила" },
  { key: "dex", label: "Ловкость" },
  { key: "con", label: "Телосложение" },
  { key: "int", label: "Интеллект" },
  { key: "wis", label: "Мудрость" },
  { key: "cha", label: "Харизма" },
];

const backgrounds = [
  {
    key: "Академик",
    desc: "Учёный, исследователь знаний и древностей.",
    skills: ["История", "Исследование"],
    abilityChoices: { count: 2, amount: 1 },
  },
  { key: "Беззаконник", desc: "Живёт по своим правилам, опыт улиц.", skills: ["Скрытность", "Атлетика"] },
  {
    key: "Гильдейский ремесленник",
    desc: "Мастер дела, член ремесленной гильдии.",
    skills: ["Мастерство", "Ремёсла"],
  },
  { key: "Воин", desc: "Опыт службы, дисциплина и боевые навыки.", skills: ["Атлетика", "Выживание"] },
  { key: "Отшельник", desc: "Годы уединения, духовные прозрения.", skills: ["Медицина", "Выживание"] },
  { key: "Моряк", desc: "Море, корабли и дальние странствия.", skills: ["Навигация", "Манипуляция"] },
  { key: "Благородный", desc: "Знатное происхождение, связи и обязанности.", skills: ["Убеждение", "История"] },
  { key: "Преступник", desc: "Подпо��ье, контакты и скрытность.", skills: ["Скрытность", "Улица"] },
];

export default function BackgroundPick() {
  const nav = useNavigate();
  const { basics, choose, setBasics, setBackgroundBonuses } = useCharacter();
  const [selected, setSelected] = useState<string | null>(null);
  const selKey = selected || basics.background || null;
  const b = backgrounds.find((x) => x.key === selKey) || null;

  // local picks for ability choices
  const [abilityPicks, setAbilityPicks] = useState<(keyof any | "")[]>([]);

  function onPickBackground(key: string) {
    choose({ background: key });
    setSelected(key);
    // reset local picks when selecting a new background
    setAbilityPicks([]);
  }

  function saveBackgroundChoices() {
    // build bonus object from picks if any
    const bonus: Record<string, number> = {};
    const current = b?.abilityChoices;
    if (current && abilityPicks.length > 0) {
      abilityPicks.forEach((k) => {
        if (!k) return;
        bonus[k as string] = (bonus[k as string] || 0) + current.amount;
      });
      // persist bonuses into basics.backgroundBonuses
      setBackgroundBonuses(bonus as any);
    } else {
      // clear previous bonuses if any
      setBackgroundBonuses({});
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-baseline justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Выбор предыстории</h1>
            <p className="text-sm text-muted-foreground">
              Текущий выбор: {basics.background}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {backgrounds.map((bg) => (
            <button
              key={bg.key}
              onClick={() => onPickBackground(bg.key)}
              className={`text-left rounded-xl border p-5 transition hover:shadow ${basics.background === bg.key ? "ring-2 ring-primary" : ""}`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{bg.key}</h3>
                {basics.background === bg.key && (
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary ring-1 ring-primary/20">Выбрано</span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{bg.desc}</p>
            </button>
          ))}
        </div>

        {/* Details panel */}
        {b && (
          <div className="mt-6 rounded-xl border bg-card p-6">
            <h2 className="text-xl font-semibold mb-2">{b.key}</h2>
            <p className="mb-3 text-sm text-muted-foreground">{b.desc}</p>
            {b.skills && (
              <div className="mb-3">
                <div className="text-sm font-medium">Навыки, даваемые предысторией</div>
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {b.skills.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {b.abilityChoices ? (
              <div className="mb-3">
                <div className="text-sm font-medium">Выбор характеристик</div>
                <div className="text-xs text-muted-foreground mb-2">Выберите {b.abilityChoices.count} характеристик. Каждая даст +{b.abilityChoices.amount}.</div>
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: b.abilityChoices.count }).map((_, i) => (
                    <select
                      key={i}
                      className="rounded-md border bg-background px-2 py-1"
                      value={abilityPicks[i] || ""}
                      onChange={(e) => {
                        const v = e.target.value as any;
                        setAbilityPicks((prev) => {
                          const copy = [...prev];
                          copy[i] = v;
                          return copy;
                        });
                      }}
                    >
                      <option value="">—</option>
                      {ABILITIES.map((a) => (
                        <option key={a.key} value={a.key}>{a.label}</option>
                      ))}
                    </select>
                  ))}
                </div>
                <div className="mt-3">
                  <Button onClick={saveBackgroundChoices}>Сохранить выбор</Button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Эта предыстория не даёт выбора характеристик.</div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => nav("/create/class")}>Назад</Button>
              <Button onClick={() => nav("/create/race")}>Далее</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
