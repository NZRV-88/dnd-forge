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

const races = [
  {
    key: "Человек",
    desc: "Гибкие и амбициозные, быстро осваивают новые навыки.",
    skills: ["Адаптация", "Общение"],
    bonuses: { any: { count: 2, amount: 1 } },
  },
  {
    key: "Эльф",
    desc: "Изящные, зоркие и долговечные, склонны к магии и искусствам.",
    skills: ["Восприятие", "Ловкость"],
    subraces: ["Высший эльф", "Лесной эльф"],
    bonuses: { dex: 2 },
  },
  { key: "Полурослик", desc: "Незаметные и удачливые путешественники.", skills: ["Везение"] },
  { key: "Дворф", desc: "Выносливые и стойкие, мастера ремесла и войны.", skills: ["Выносливость"], bonuses: { con: 2 } },
  {
    key: "Полуорк",
    desc: "Сильные и внушающ��е страх, но способные на героизм.",
    skills: ["Атлетика"],
    bonuses: { str: 2 },
  },
  {
    key: "Тифлинг",
    desc: "Наследники инфернальной крови с харизмой и тайнами.",
    skills: ["Харизма"],
    bonuses: { cha: 2 },
  },
  {
    key: "Гном",
    desc: "Изобретательные и любознательные, с тягой к магии иллюзий.",
    skills: ["Интеллект"],
    subraces: ["Лесной гном", "Каменный гном"],
    bonuses: { int: 2 },
  },
];

export default function Race() {
  const nav = useNavigate();
  const { basics, choose, setRaceBonuses } = useCharacter();
  const [selected, setSelected] = useState<string | null>(null);
  const sel = selected || basics.race;
  const r = races.find((x) => x.key === sel) || null;

  const [subrace, setSubrace] = useState<string | null>(basics.subclass || null);
  const [abilityPickAny, setAbilityPickAny] = useState<(string | "")[]>([]);

  function pickRace(key: string) {
    choose({ race: key });
    setSelected(key);
    setSubrace(null);
    setAbilityPickAny([]);
  }

  function saveRaceChoices() {
    const bonuses: Record<string, number> = {};
    if (r?.bonuses) {
      if ((r.bonuses as any).any) {
        const any = (r.bonuses as any).any as { count: number; amount: number };
        abilityPickAny.forEach((k) => {
          if (!k) return;
          bonuses[k] = (bonuses[k] || 0) + any.amount;
        });
      } else {
        Object.assign(bonuses, r.bonuses as Record<string, number>);
      }
    }
    if (subrace) {
      // some subraces could give extra bonuses — simplistic: +1 to an ability for demo
      if (subrace.includes("Высший")) bonuses.int = (bonuses.int || 0) + 1;
      if (subrace.includes("Лесной")) bonuses.dex = (bonuses.dex || 0) + 1;
    }
    setRaceBonuses(bonuses as any);
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-baseline justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Выбор расы</h1>
            <p className="text-sm text-muted-foreground">Текущий выбор: {basics.race}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {races.map((rc) => (
            <button
              key={rc.key}
              onClick={() => pickRace(rc.key)}
              className={`text-left rounded-xl border p-5 transition hover:shadow ${basics.race === rc.key ? "ring-2 ring-primary" : ""}`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{rc.key}</h3>
                {basics.race === rc.key && (
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary ring-1 ring-primary/20">Выбрано</span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{rc.desc}</p>
            </button>
          ))}
        </div>

        {r && (
          <div className="mt-6 rounded-xl border bg-card p-6">
            <h2 className="text-xl font-semibold mb-2">{r.key}</h2>
            <p className="mb-3 text-sm text-muted-foreground">{r.desc}</p>
            {r.skills && (
              <div className="mb-3">
                <div className="text-sm font-medium">Навыки</div>
                <ul className="mt-2 list-disc pl-5 text-sm">{r.skills.map((s) => <li key={s}>{s}</li>)}</ul>
              </div>
            )}

            {r.subraces && (
              <div className="mb-3">
                <div className="text-sm font-medium">Подрасы</div>
                <div className="mt-2 flex gap-2">
                  {r.subraces.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSubrace(s)}
                      className={`rounded-md border px-3 py-1 text-sm ${subrace === s ? 'ring-2 ring-primary' : ''}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Any-choice ability selections */}
            {(r.bonuses as any)?.any && (
              <div className="mb-3">
                <div className="text-sm font-medium">Выбор бонусов</div>
                <div className="text-xs text-muted-foreground mb-2">Выберите {(r.bonuses as any).any.count} характеристик, каждая даст +{(r.bonuses as any).any.amount}.</div>
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: (r.bonuses as any).any.count }).map((_, i) => (
                    <select key={i} className="rounded-md border bg-background px-2 py-1" value={abilityPickAny[i] || ""} onChange={(e) => {
                      const v = e.target.value;
                      setAbilityPickAny(prev => { const copy = [...prev]; copy[i] = v; return copy; });
                    }}>
                      <option value="">—</option>
                      {ABILITIES.map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
                    </select>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => nav("/create/background")}>Назад</Button>
              <Button onClick={() => { saveRaceChoices(); nav("/create/abilities"); }}>Далее</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
