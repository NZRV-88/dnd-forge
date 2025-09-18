import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCharacter } from "@/store/character";

const backgrounds = [
  { key: "Академик", desc: "Учёный, исследователь знаний и древностей." },
  { key: "Беззаконник", desc: "Живёт по своим правилам, опыт улиц." },
  {
    key: "Гильдейский ремесленник",
    desc: "Мастер дела, член ремесленной гильдии.",
  },
  { key: "Воин", desc: "Опыт службы, дисциплина и боевые навыки." },
  { key: "Отшельник", desc: "Годы уединения, духовные прозрения." },
  { key: "Моряк", desc: "Море, корабли и дальние странствия." },
  { key: "Благородный", desc: "Знатное происхождение, связи и обязанности." },
  { key: "Преступник", desc: "Подполье, контакты и скрытность." },
];

export default function BackgroundPick() {
  const nav = useNavigate();
  const { basics, choose } = useCharacter();

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
          {backgrounds.map((b) => (
            <button
              key={b.key}
              onClick={() => {
                choose({ background: b.key });
                nav("/create");
              }}
              className={`text-left rounded-xl border p-5 transition hover:shadow ${basics.background === b.key ? "ring-2 ring-primary" : ""
                }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{b.key}</h3>
                {basics.background === b.key && (
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary ring-1 ring-primary/20">
                    Выбрано
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {b.desc}
              </p>
            </button>
          ))}
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => nav("/create/class")}>
            Назад
          </Button>
          <Button onClick={() => nav("/create/race")}>Далее</Button>
        </div>
      </div>
    </div>
  );
}
