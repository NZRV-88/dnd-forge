import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Index() {
  return (
    <div className="bg-[radial-gradient(60%_30%_at_50%_0%,hsl(var(--primary)/0.1),transparent),radial-gradient(50%_40%_at_100%_0%,hsl(var(--accent)/0.25),transparent)]">
      {/* Hero */}
      {/*<section className="container mx-auto grid gap-10 pb-16 pt-12 md:grid-cols-2 md:gap-12 md:pb-24 md:pt-20 lg:items-center">*/}
      {/*  <div>*/}
      {/*    <h1 className="font-bold tracking-tight text-4xl leading-tight md:text-5xl lg:text-6xl">*/}
      {/*      Создавайте героев DnD на русском*/}
      {/*    </h1>*/}
      {/*    <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">*/}
      {/*      Полнофункциональный конструктор персонажей, вдохновлённый*/}
      {/*      dndbeyond.com. Пошаговое создание: раса, класс, характеристики,*/}
      {/*      черты, навыки, снаряжение и история — всё на русском языке.*/}
      {/*    </p>*/}
      {/*    <div className="mt-6 flex flex-wrap items-center gap-3">*/}
      {/*      <Button asChild size="lg">*/}
      {/*        <Link to="/create">Начать создание</Link>*/}
      {/*      </Button>*/}
      {/*      <Button asChild size="lg" variant="outline">*/}
      {/*        <a href="#how">Как это работает</a>*/}
      {/*      </Button>*/}
      {/*    </div>*/}
      {/*    <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground">*/}
      {/*      <div className="flex items-center gap-2">*/}
      {/*        <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary ring-1 ring-primary/20">*/}
      {/*          <svg*/}
      {/*            viewBox="0 0 24 24"*/}
      {/*            className="h-4 w-4"*/}
      {/*            fill="none"*/}
      {/*            stroke="currentColor"*/}
      {/*            strokeWidth="1.5"*/}
      {/*          >*/}
      {/*            <path d="M5 12l5 5L20 7" />*/}
      {/*          </svg>*/}
      {/*        </span>*/}
      {/*        Русский интерфейс*/}
      {/*      </div>*/}
      {/*      <div className="flex items-center gap-2">*/}
      {/*        <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary ring-1 ring-primary/20">*/}
      {/*          <svg*/}
      {/*            viewBox="0 0 24 24"*/}
      {/*            className="h-4 w-4"*/}
      {/*            fill="none"*/}
      {/*            stroke="currentColor"*/}
      {/*            strokeWidth="1.5"*/}
      {/*          >*/}
      {/*            <path d="M12 8v8M8 12h8" />*/}
      {/*          </svg>*/}
      {/*        </span>*/}
      {/*        Пошаговый мастер*/}
      {/*      </div>*/}
      {/*      <div className="flex items-center gap-2">*/}
      {/*        <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary ring-1 ring-primary/20">*/}
      {/*          <svg*/}
      {/*            viewBox="0 0 24 24"*/}
      {/*            className="h-4 w-4"*/}
      {/*            fill="none"*/}
      {/*            stroke="currentColor"*/}
      {/*            strokeWidth="1.5"*/}
      {/*          >*/}
      {/*            <circle cx="12" cy="12" r="9" />*/}
      {/*          </svg>*/}
      {/*        </span>*/}
      {/*        Сохранение офлайн*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*  </div>*/}

      {/*  */}{/* Preview Card */}
      {/*  <div className="relative">*/}
      {/*    <div className="absolute -inset-4 -z-10 rounded-2xl bg-gradient-to-tr from-primary/10 via-accent/10 to-transparent blur-2xl" />*/}
      {/*    <div className="rounded-xl border bg-card p-6 shadow-sm">*/}
      {/*      <div className="flex items-start justify-between">*/}
      {/*        <div>*/}
      {/*          <h3 className="text-2xl font-semibold">Элара Ночной Ветер</h3>*/}
      {/*          <p className="text-sm text-muted-foreground">*/}
      {/*            Эльф • Плут 3 ур. • Хаотично-добрый*/}
      {/*          </p>*/}
      {/*        </div>*/}
      {/*        <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-primary/20">*/}
      {/*          Превью*/}
      {/*        </span>*/}
      {/*      </div>*/}
      {/*      <div className="mt-6 grid grid-cols-3 gap-3">*/}
      {/*        {[*/}
      {/*          { k: "КД", v: 15 },*/}
      {/*          { k: "Инициатива", v: "+3" },*/}
      {/*          { k: "Скорость", v: "9 м" },*/}
      {/*          { k: "Сила", v: 10 },*/}
      {/*          { k: "Ловкость", v: 16 },*/}
      {/*          { k: "Телослож.", v: 12 },*/}
      {/*          { k: "Интеллект", v: 14 },*/}
      {/*          { k: "Мудрость", v: 10 },*/}
      {/*          { k: "Харизма", v: 13 },*/}
      {/*        ].map((s) => (*/}
      {/*          <div*/}
      {/*            key={s.k}*/}
      {/*            className="rounded-lg border bg-background p-3 text-center"*/}
      {/*          >*/}
      {/*            <div className="text-xs uppercase text-muted-foreground">*/}
      {/*              {s.k}*/}
      {/*            </div>*/}
      {/*            <div className="mt-1 text-xl font-semibold">{s.v}</div>*/}
      {/*          </div>*/}
      {/*        ))}*/}
      {/*      </div>*/}
      {/*      <div className="mt-6 rounded-lg border bg-muted/40 p-4">*/}
      {/*        <p className="text-sm leading-relaxed text-muted-foreground">*/}
      {/*          Тихая как ночь, Элара виртуозно владеет кинжалами и тенью.*/}
      {/*          Выберите свои черты и навыки, чтобы раскрыть её потенциал.*/}
      {/*        </p>*/}
      {/*      </div>*/}
      {/*      <div className="mt-6 flex justify-end">*/}
      {/*        <Button asChild>*/}
      {/*          <Link to="/create">Создать похожего</Link>*/}
      {/*        </Button>*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</section>*/}

      {/* Menu */}
      <section className="border-t bg-secondary/30 py-12">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold md:text-3xl">Меню</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                t: "Мои персонажи",
                d: "Список сохранённых героев, экспорт и печать.",
                href: "/characters",
              },
              {
                t: "Кампании",
                d: "Управление партиями и заметками мастера.",
                href: "/campaigns",
              },
              {
                t: "Кладбище персонажей",
                d: "Память о павших героях.",
                href: "/graveyard",
              },
              {
                t: "Мастерская",
                d: "Инструменты для мастера: генераторы, калькуляторы, справочники.",
                href: "/workshop",
              },
            ].map((f) => (
              <Link
                key={f.t}
                to={f.href}
                className="rounded-xl border bg-card p-5 shadow-sm transition hover:shadow-md"
              >
                <h3 className="text-lg font-semibold">{f.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
    {/*  <section id="how" className="border-t bg-secondary/30 py-16 md:py-24">*/}
    {/*    <div className="container mx-auto">*/}
    {/*      <h2 className="text-2xl font-bold md:text-3xl">*/}
    {/*        Как устроено создание*/}
    {/*      </h2>*/}
    {/*      <p className="mt-2 max-w-2xl text-muted-foreground">*/}
    {/*        Интуитивный ма��тер проведёт по всем шагам. В любой момент можно*/}
    {/*        вернуться назад и изменить выбор.*/}
    {/*      </p>*/}
    {/*      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">*/}
    {/*        {[*/}
    {/*          {*/}
    {/*            t: "Раса и происхождение",*/}
    {/*            d: "Выберите расу, подрасу и особенности.",*/}
    {/*          },*/}
    {/*          {*/}
    {/*            t: "Класс и архетип",*/}
    {/*            d: "Определите роль в партии и стиль игры.",*/}
    {/*          },*/}
    {/*          {*/}
    {/*            t: "Характеристики",*/}
    {/*            d: "Кости, поинт‑бай или стандартное распределение.",*/}
    {/*          },*/}
    {/*          { t: "Черты и навыки", d: "Таланты, языки, владения, умения." },*/}
    {/*          {*/}
    {/*            t: "Снаряжение",*/}
    {/*            d: "Стартовый набор, золото или индивидуальный выбор.",*/}
    {/*          },*/}
    {/*          {*/}
    {/*            t: "История",*/}
    {/*            d: "Личность, идеалы, привязанности и слабости.",*/}
    {/*          },*/}
    {/*        ].map((f, i) => (*/}
    {/*          <div*/}
    {/*            key={f.t}*/}
    {/*            className="relative rounded-xl border bg-card p-5 shadow-sm"*/}
    {/*          >*/}
    {/*            <div className="absolute -left-3 -top-3 inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-semibold shadow">*/}
    {/*              {i + 1}*/}
    {/*            </div>*/}
    {/*            <h3 className="text-lg font-semibold">{f.t}</h3>*/}
    {/*            <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>*/}
    {/*          </div>*/}
    {/*        ))}*/}
    {/*      </div>*/}
    {/*      <div className="mt-10">*/}
    {/*        <Button asChild size="lg">*/}
    {/*          <Link to="/create">Перейти к мастеру</Link>*/}
    {/*        </Button>*/}
    {/*      </div>*/}
    {/*    </div>*/}
    {/*  </section>*/}
    </div>
  );
}
