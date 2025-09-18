import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useCharacter } from "@/store/character";
import type { ClassInfo } from "@/data/classes/types";
import { CLASS_CATALOG } from "@/data/classes";

// Словарь с типами хитов для классов
const HIT_DICE: Record<string, number> = {
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

// Русские лейблы для классов
const CLASS_LABELS: Record<string, string> = {
  barbarian: "Варвар",
  bard: "Бард",
  fighter: "Воин",
  wizard: "Волшебник",
  druid: "Друид",
  cleric: "Жрец",
  warlock: "Колдун",
  monk: "Монах",
  paladin: "Паладин",
  rogue: "Плут",
  ranger: "Следопыт",
  sorcerer: "Чародей",
};

const ALL_CLASSES = [
  "fighter",
  "rogue",
  "wizard",
  "cleric",
  "ranger",
  "bard",
  "barbarian",
  "monk",
  "paladin",
  "warlock",
  "sorcerer",
  "druid",
];

function calcMaxHP(
  cls: string,
  level: number,
  conMod: number,
  hpMode: "fixed" | "roll",
) {
  const die = HIT_DICE[cls] || 8;
  if (level < 1) return 0;
  let hp = die + conMod;
  if (hpMode === "fixed") {
    hp += (level - 1) * (Math.floor(die / 2) + 1 + conMod);
  } else {
    hp += (level - 1) * (1 + conMod);
  }
  return hp;
}

function getInfo(cls: string): ClassInfo {
  const found = CLASS_CATALOG.find((c) => c.key === cls);
  if (found) return found;
  // Generic fallback
  return {
    key: cls,
    desc: "Ключевые особенности класса (упрощённо).",
    subclasses: [
      { key: "Архетип А", desc: "Подкласс с защитным уклоном." },
      { key: "Архетип Б", desc: "Подкласс с атакующим уклоном." },
      { key: "Архетип В", desc: "Смешанный стиль." },
    ],
    features: {
      1: [{ name: "Основы класса", desc: "Базовые умения и экипировка." }],
      3: [{ name: "Подкласс", desc: "Доступ к особенностям выбранного пути." }],
      4: [
        {
          name: "Увеличение характеристик",
          desc: "Повышение параметров или талант.",
        },
      ],
      5: [
        {
          name: "Усиление класса",
          desc: "Существенное улучшение боевых/магических умений.",
        },
      ],
    },
  };
}

function buildFeatureList(
  info: ClassInfo,
  level: number,
  subclass?: string,
): { level: number; f: Feature }[] {
  const list: { level: number; f: Feature }[] = [];
  for (let l = 1; l <= level; l++) {
    const feats = info.features[l];
    if (feats) feats.forEach((f) => list.push({ level: l, f }));
    if (subclass) {
      const sc = info.subclasses.find((s) => s.key === subclass);
      const sFeats = sc?.features?.[l];
      if (sFeats) sFeats.forEach((f) => list.push({ level: l, f }));
    }
    if ([4, 8, 12, 16, 19].includes(l)) {
      list.push({
        level: l,
        f: {
          name: "Увеличение характеристик / Талант",
          desc: "На этом уровне вы выбираете: +2 к одной характеристике, +1 к двум различным, либо талант.",
        },
      });
    }
  }
  return list;
}

const ASI_LEVELS = [4, 8, 12, 16, 19] as const;
const ABILITY_OPTIONS = [
  { key: "str", label: "Сила" },
  { key: "dex", label: "Ловкость" },
  { key: "con", label: "Телосложение" },
  { key: "int", label: "Интеллект" },
  { key: "wis", label: "Мудрость" },
  { key: "cha", label: "Харизма" },
] as const;

import { ALL_FEATS } from "@/data/feats";

function AsiConfigurator() {
  const { basics, asi, setAsiMode, setAsiStats, setAsiFeat } = useCharacter();
  const available = ASI_LEVELS.filter((l) => l <= basics.level);
  if (available.length === 0)
    return (
      <p className="text-sm text-muted-foreground">
        Повышения характеристик начнутся с 4 уровня.
      </p>
    );
  return (
    <div className="space-y-4">
      {available.map((lvl) => {
        const choice = asi && asi[lvl] ? asi[lvl] : { mode: "asi" as const };
        return (
          <div key={lvl} className="rounded-lg border bg-card p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">{lvl}-й уровень</div>
              <div className="flex items-center gap-3 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name={`mode-${lvl}`}
                    checked={choice.mode === "asi"}
                    onChange={() => setAsiMode(lvl, "asi")}
                  />{" "}
                  Повысить характеристики
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name={`mode-${lvl}`}
                    checked={choice.mode === "feat"}
                    onChange={() => setAsiMode(lvl, "feat")}
                  />{" "}
                  Черта
                </label>
              </div>
            </div>

            {choice.mode === "asi" ? (
              <div className="mt-3 grid gap-2">
                <div className="text-xs text-muted-foreground">
                  Выберите две характеристики для +1 (или одну — в обоих полях,
                  чтобы получить +2). Максимум 20.
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    className="rounded-md border bg-background px-2 py-1"
                    value={choice.s1 || ""}
                    onChange={(e) =>
                      setAsiStats(lvl, e.target.value as any, choice.s2)
                    }
                  >
                    <option value="">—</option>
                    {ABILITY_OPTIONS.map((o) => (
                      <option key={o.key} value={o.key}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <select
                    className="rounded-md border bg-background px-2 py-1"
                    value={choice.s2 || ""}
                    onChange={(e) =>
                      setAsiStats(lvl, choice.s1, e.target.value as any)
                    }
                  >
                    <option value="">—</option>
                    {ABILITY_OPTIONS.map((o) => (
                      <option key={o.key} value={o.key}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="mt-3 grid gap-2">
                <div className="text-xs text-muted-foreground">
                  Выберите талант
                </div>
                <select
                  className="rounded-md border bg-background px-2 py-1"
                  value={choice.feat || ""}
                  onChange={(e) => setAsiFeat(lvl, e.target.value)}
                >
                  <option value="">—</option>
                  {ALL_FEATS.map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.key}
                    </option>
                  ))}
                </select>
                {choice.feat && (
                  <p className="text-xs text-muted-foreground">
                    {ALL_FEATS.find((f) => f.key === choice.feat)?.desc ||
                      "Описание см. на dnd.su"}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ClassPick() {
  const nav = useNavigate();
  const { basics, choose, setLevel, setSubclass, stats, setBasics } =
    useCharacter();

  const info = useMemo(() => getInfo(basics.class), [basics.class]);
  const features = useMemo(
    () => buildFeatureList(info, basics.level, basics.subclass),
    [info, basics.level, basics.subclass],
  );

  // Модификатор Телосложения из общих характеристик
  const conMod =
    stats?.con !== undefined ? Math.floor((stats.con - 10) / 2) : 0;

  const maxHP = calcMaxHP(basics.class, basics.level, conMod, basics.hpMode);

  // Корректируем текущие хиты при изменении максимума
  useEffect(() => {
    const cur = basics.hpCurrent ?? 0;
    if (cur > maxHP || cur === 0) {
      setBasics({ hpCurrent: Math.min(cur || maxHP, maxHP) });
    }
  }, [maxHP]);

  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Выбор класса</h1>
            <p className="text-sm text-muted-foreground">
              Текущий: {CLASS_LABELS[basics.class] || basics.class} • ур.{" "}
              {basics.level}
              {basics.subclass ? ` • ${basics.subclass}` : ""}
            </p>
            <div className="mt-2 text-xs text-muted-foreground">
              Источник описаний: dnd.su • Редакция: {basics.edition}
            </div>
          </div>
          <Button variant="secondary" onClick={() => nav(-1)}>
            Назад
          </Button>
        </div>

        {/* Class grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_CLASSES.map((k) => {
            const c =
              CLASS_CATALOG.find((x) => x.key === k) ??
              ({
                key: k,
                desc: "Ключевые особенности класса (упрощённо).",
              } as any);
            return (
              <button
                key={k}
                onClick={() => choose({ class: k })}
                className={`text-left rounded-xl border p-5 transition hover:shadow ${basics.class === k ? "ring-2 ring-primary" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{CLASS_LABELS[k] || k}</h3>
                  {basics.class === k && (
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary ring-1 ring-primary/20">
                      Выбрано
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Информация о выбранном классе */}
        {info && (
          <div className="mt-8 rounded-xl border bg-card p-6 flex items-center gap-8">
            {/* Аватар слева */}
            <div className="flex-shrink-0">
              <img
                src={`/assets/class-avatars/${info.key}.png`}
                alt={CLASS_LABELS[info.key] || info.key}
                className="w-32 h-32 object-cover rounded-xl border"
                style={{ background: "#222" }}
                onError={e => { e.currentTarget.src = "/assets/class-avatars/default.png"; }}
              />
            </div>
            {/* Описание и заголовок справа */}
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold mb-1">{CLASS_LABELS[info.key] || info.key}</h2>
              <div className="flex gap-4 text-sm text-muted-foreground mb-2">
                <span>Кость хитов: <span className="font-normal">d{info.hitDice}</span></span>
                <span>Основные характеристики: <span className="font-normal">{info.mainStats?.join(", ") || "—"}</span></span>
              </div>
              {info.longDesc && (
                <p className="mb-2 text-sm text-muted-foreground whitespace-pre-line">{info.longDesc}</p>
              )}
            </div>
          </div>
        )}

        {/* Level + subclass + features */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="rounded-2xl border bg-card p-6">
            <h2 className="text-lg font-semibold">Уровень персонажа</h2>
            <div className="mt-3 flex items-center gap-4">
              <input
                type="range"
                min={1}
                max={20}
                step={1}
                value={basics.level}
                onChange={(e) => setLevel(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
              <span className="w-12 text-center text-lg font-semibold">
                {basics.level}
              </span>
            </div>

            {/* HP summary and controls */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-md border bg-background p-3 text-center">
                <div className="text-xs uppercase text-muted-foreground">
                  Макс. ХП
                </div>
                <div className="text-xl font-semibold">{maxHP}</div>
              </div>
              <div className="rounded-md border bg-background p-3 text-center">
                <div className="text-xs uppercase text-muted-foreground">
                  Текущие ХП
                </div>
                <div className="mt-1 flex items-center justify-center gap-2">
                  <button
                    className="h-8 w-8 rounded-md border text-lg leading-none"
                    onClick={() =>
                      setBasics({
                        hpCurrent: Math.max(0, (basics.hpCurrent ?? 0) - 1),
                      })
                    }
                  >
                    −
                  </button>
                  <input
                    type="number"
                    className="w-20 rounded-md border bg-background px-2 py-1 text-center"
                    value={basics.hpCurrent ?? 0}
                    onChange={(e) =>
                      setBasics({
                        hpCurrent: Math.max(
                          0,
                          Math.min(parseInt(e.target.value || "0"), maxHP),
                        ),
                      })
                    }
                  />
                  <button
                    className="h-8 w-8 rounded-md border text-lg leading-none"
                    onClick={() =>
                      setBasics({
                        hpCurrent: Math.min(maxHP, (basics.hpCurrent ?? 0) + 1),
                      })
                    }
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {basics.level >= 3 && (
              <div className="mt-6">
                <h3 className="font-medium">Подкласс</h3>
                <p className="text-sm text-muted-foreground">
                  Выберите путь с 3 уровня.
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {info.subclasses.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setSubclass(s.key)}
                      className={`text-left rounded-lg border p-4 hover:shadow ${basics.subclass === s.key ? "ring-2 ring-primary" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{s.key}</span>
                        {basics.subclass === s.key && (
                          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary ring-1 ring-primary/20">
                            Выбрано
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {s.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8">
              <h3 className="font-medium">Умения по уровням</h3>
              <ul className="mt-3 space-y-3">
                {features.map(({ level, f }, i) => (
                  <li key={i} className="rounded-lg border bg-background p-3">
                    <div className="text-xs text-muted-foreground">
                      {level}-й уровень
                    </div>
                    <div className="font-medium">{f.name}</div>
                    <div className="text-sm text-muted-foreground whitespace-pre-line">
                      {f.desc}
                    </div>
                    {f.source && (
                      <div className="mt-1 text-[10px] text-muted-foreground">
                        Источник: {f.source}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                Описание упрощено для быстрого старта — можно донастроить позже.
              </p>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => nav(-1)}>
                Назад
              </Button>
              <Button onClick={() => nav("/create/background")}>Далее</Button>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border bg-secondary/30 p-4">
              <h4 className="font-medium">Настройка улучшений</h4>
              <AsiConfigurator />
            </div>
            <div className="rounded-2xl border bg-secondary/30 p-4">
              <h4 className="font-medium">Подсказки</h4>
              <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                <li>Подкласс доступен с 3 уровня.</li>
                <li>
                  На уровнях 4/8/12/16/19 выберите повышение характеристик или
                  черту.
                </li>
                <li>Изменения сохраняются локально.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
