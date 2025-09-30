import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCharacter } from "@/store/character";

const alignments = [
  "Законно-добр��й",
  "Нейтрально-добрый",
  "Хаотично-добрый",
  "Законно-нейтральный",
  "Истинно-нейтральный",
  "Хаотично-нейтральный",
  "Законно-злой",
  "Нейтрально-злой",
  "Хаотично-злой",
];

function Stat({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const mod = Math.floor((value - 10) / 2);
  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-baseline justify-between">
        <h4 className="text-sm font-medium text-muted-foreground">{label}</h4>
        <span className="text-xs text-muted-foreground">Модификатор</span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="text-2xl font-semibold">{value}</div>
        <div className="rounded-md bg-muted px-2 py-1 text-sm">
          {mod >= 0 ? `+${mod}` : mod}
        </div>
      </div>
      <input
        className="mt-3 w-full accent-primary"
        type="range"
        min={8}
        max={18}
        step={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
      />
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>8</span>
        <span>18</span>
      </div>
    </div>
  );
}

export default function Create() {
  const [step, setStep] = useState(1);
  const { basics, setBasics, stats, setStat, save } = useCharacter();

  const totalPoints = useMemo(
    () => stats.str + stats.dex + stats.con + stats.int + stats.wis + stats.cha,
    [stats],
  );

  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 grid grid-cols-3 gap-3">
          {["Основы", "Характеристики", "Итоги"].map((t, i) => {
            const active = step === i + 1;
            const done = step > i + 1;
            return (
              <div
                key={t}
                className={`flex items-center gap-3 rounded-xl border p-3 ${active ? "ring-2 ring-primary" : ""}`}
              >
                <span
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-sm font-semibold ${done ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}
                >
                  {i + 1}
                </span>
                <span className="text-sm font-medium">{t}</span>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            {step === 1 && (
              <div>
                <h2 className="text-xl font-semibold">Основная информация</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Выбор расы, класса и предыстории перенесён на отдельные
                  страницы.
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-sm text-muted-foreground">
                      Имя персонажа
                    </label>
                    <input
                      value={basics.name}
                      onChange={(e) => setBasics({ name: e.target.value })}
                      placeholder="Например, Элара"
                      spellCheck={false}
                      className="mt-1 w-full rounded-md border bg-background px-3 py-2 outline-none ring-0 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">
                      Раса
                    </label>
                    <div className="mt-1 flex items-center justify-between rounded-md border bg-background px-3 py-2">
                      <span>{basics.race}</span>
                      <Button asChild size="sm" variant="outline">
                        <Link to="/create/race">Изменить</Link>
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">
                      Класс
                    </label>
                    <div className="mt-1 flex items-center justify-between rounded-md border bg-background px-3 py-2">
                      <span>{basics.class}</span>
                      <Button asChild size="sm" variant="outline">
                        <Link to="/create/class">Изменить</Link>
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">
                      Предыстория
                    </label>
                    <div className="mt-1 flex items-center justify-between rounded-md border bg-background px-3 py-2">
                      <span>{basics.background}</span>
                      <Button asChild size="sm" variant="outline">
                        <Link to="/create/background">Изменить</Link>
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">
                      Мировоззрение
                    </label>
                    <select
                      value={basics.alignment}
                      onChange={(e) => setBasics({ alignment: e.target.value })}
                      className="mt-1 w-full rounded-md border bg-background px-3 py-2 focus:border-primary"
                    >
                      {alignments.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-xl font-semibold">Характеристики</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Быстрая настройка значений (8–18). Общее сейчас: {totalPoints}
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Stat
                    label="Сила"
                    value={stats.str}
                    onChange={(v) => setStat("str", v)}
                  />
                  <Stat
                    label="Ловкость"
                    value={stats.dex}
                    onChange={(v) => setStat("dex", v)}
                  />
                  <Stat
                    label="Телосложение"
                    value={stats.con}
                    onChange={(v) => setStat("con", v)}
                  />
                  <Stat
                    label="Интеллект"
                    value={stats.int}
                    onChange={(v) => setStat("int", v)}
                  />
                  <Stat
                    label="Мудрость"
                    value={stats.wis}
                    onChange={(v) => setStat("wis", v)}
                  />
                  <Stat
                    label="Харизма"
                    value={stats.cha}
                    onChange={(v) => setStat("cha", v)}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-xl font-semibold">Итоги персонажа</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Проверьте, всё ли верно, затем сохраните локально.
                </p>
                <div className="mt-6 grid gap-6">
                  <div className="rounded-xl border p-4">
                    <h3 className="font-medium">Основы</h3>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                      <div>
                        <span className="text-foreground/70">Имя:</span>{" "}
                        {basics.name || "—"}
                      </div>
                      <div>
                        <span className="text-foreground/70">Раса:</span>{" "}
                        {basics.race}
                      </div>
                      <div>
                        <span className="text-foreground/70">Класс:</span>{" "}
                        {basics.class}
                      </div>
                      <div>
                        <span className="text-foreground/70">Предыстория:</span>{" "}
                        {basics.background}
                      </div>
                      <div>
                        <span className="text-foreground/70">
                          Мировоззрение:
                        </span>{" "}
                        {basics.alignment}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border p-4">
                    <h3 className="font-medium">Характеристики</h3>
                    <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-6">
                      {Object.entries(stats).map(([k, v]) => {
                        const label: Record<string, string> = {
                          str: "Сила",
                          dex: "Ловкость",
                          con: "Телослож.",
                          int: "Интеллект",
                          wis: "Мудрость",
                          cha: "Харизма",
                        };
                        const mod = Math.floor((v - 10) / 2);
                        return (
                          <div
                            key={k}
                            className="rounded-lg border p-3 text-center"
                          >
                            <div className="text-xs uppercase text-muted-foreground">
                              {label[k]}
                            </div>
                            <div className="mt-1 text-xl font-semibold">
                              {v}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {mod >= 0 ? `+${mod}` : mod}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <Button
                variant="secondary"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1}
              >
                Назад
              </Button>
              {step < 3 ? (
                <Button
                  onClick={() => setStep((s) => Math.min(3, s + 1))}
                  disabled={step === 1 && basics.name.trim().length === 0}
                >
                  Далее
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    save();
                    alert(
                      "Персонаж сохранён в браузере. Позже добавим экспорт и печать.",
                    );
                  }}
                >
                  Сохранить локально
                </Button>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border bg-card p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Краткая сводка</h3>
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary ring-1 ring-primary/20">
                  Черновик
                </span>
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                {basics.name ? (
                  <>
                    <div className="text-foreground font-medium">
                      {basics.name}
                    </div>
                    <div>
                      {basics.race} • {basics.class} • ур. {basics.level}
                      {basics.subclass ? ` • ${basics.subclass}` : ""}
                    </div>
                    <div>
                      {basics.alignment} • издание: {basics.edition}
                    </div>
                  </>
                ) : (
                  <div>Укажите имя в шаге «Основы»</div>
                )}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {Object.entries(stats).map(([k, v]) => {
                  const label: Record<string, string> = {
                    str: "Сл",
                    dex: "Лвк",
                    con: "Тел",
                    int: "Инт",
                    wis: "Мдр",
                    cha: "Хрз",
                  };
                  return (
                    <div
                      key={k}
                      className="rounded-md border bg-background p-2 text-center"
                    >
                      <div className="text-[10px] uppercase text-muted-foreground">
                        {label[k]}
                      </div>
                      <div className="text-base font-semibold">{v}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border bg-secondary/30 p-4">
              <h4 className="font-medium">Подсказки</h4>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>
                  Страницы выбора:{" "}
                  <Link className="underline" to="/create/race">
                    Раса
                  </Link>
                  ,{" "}
                  <Link className="underline" to="/create/class">
                    Класс
                  </Link>
                  ,{" "}
                  <Link className="underline" to="/create/background">
                    Предыстория
                  </Link>
                  .
                </li>
                <li>
                  Повышение характеристик и таланты выбираются на странице
                  класса на уровнях 4/8/12/16/19.
                </li>
                <li>Данные сохраняются локально и не покидают ваш браузер.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
