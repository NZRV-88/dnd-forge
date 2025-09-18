import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCharacter } from "@/store/character";

const races = [
  {
    key: "Человек",
    desc: "Гибкие и амбициозные, быстро осваивают новые навыки.",
  },
  {
    key: "Эльф",
    desc: "Изящные, зоркие и долговечные, склонны к магии и искусствам.",
  },
  { key: "Полурослик", desc: "Незаметные и удачливые путешественники." },
  { key: "Дворф", desc: "Выносливые и стойкие, мастера ремесла и войны." },
  {
    key: "Полуорк",
    desc: "Сильные и внушающие страх, но способные на героизм.",
  },
  {
    key: "Тифлинг",
    desc: "Наследники инфернальной крови с харизмой и тайнами.",
  },
  {
    key: "Гном",
    desc: "Изобретательные и любознательные, с тягой к магии иллюзий.",
  },
];

export default function Race() {
  const nav = useNavigate();
  const { basics, choose } = useCharacter();

  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-baseline justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Выбор расы</h1>
            <p className="text-sm text-muted-foreground">
              Текущий выбор: {basics.race}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {races.map((r) => (
            <button
              key={r.key}
              onClick={() => choose({ race: r.key })}
              className={`text-left rounded-xl border p-5 transition hover:shadow ${basics.race === r.key ? "ring-2 ring-primary" : ""}`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{r.key}</h3>
                {basics.race === r.key && (
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary ring-1 ring-primary/20">
                    Выбрано
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{r.desc}</p>
            </button>
          ))}
        </div>

        <div className="mt-8 flex justify-between gap-3">
          <Button variant="secondary" onClick={() => nav("/create/background")}>
            Назад
          </Button>
          <Button onClick={() => nav("/create/abilities")}>
            Далее
          </Button>
        </div>
      </div>
    </div>
  );
}
