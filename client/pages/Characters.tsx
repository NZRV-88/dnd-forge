import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

type Basics = {
  name: string;
  race: string;
  class: string;
  background: string;
  alignment: string;
  level: number;
  subclass: string;
  edition: string;
  hpMode?: "fixed" | "roll";
  hpCurrent?: number;
};

type SavedCharacter = {
  id: number | string;
  created?: string;
  basics: Basics;
  stats?: Record<string, number>;
  asi?: Record<string, any>;
  equipment?: string[];
  gold?: number;
};

const STORAGE_LIST_KEY = "dnd-ru-characters";
const STORAGE_DRAFT_KEY = "dnd-ru-character";
const EDITING_ID_KEY = "dnd-ru-editing-id";

export default function Characters() {
  const [characters, setCharacters] = useState<SavedCharacter[]>([]);
  const nav = useNavigate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_LIST_KEY);
      if (!raw) return;
      const list = JSON.parse(raw) as SavedCharacter[];
      setCharacters(Array.isArray(list) ? list : []);
    } catch {
      setCharacters([]);
    }
  }, []);

  const edit = (c: SavedCharacter) => {
    try {
      localStorage.setItem(EDITING_ID_KEY, String(c.id));
      const draft = {
        basics: c.basics,
        stats: c.stats || {},
        asi: c.asi || {},
      };
      localStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(draft));
    } catch {}
    nav("/create/class");
  };

  const remove = (id: SavedCharacter["id"]) => {
    setCharacters((prev) => {
      const next = prev.filter((c) => c.id !== id);
      try {
        localStorage.setItem(STORAGE_LIST_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Мои персонажи</h1>
        <Button asChild>
          <Link to="/create">Создать персонажа</Link>
        </Button>
      </div>

      {characters.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {characters.map((item) => {
            const b = item.basics;
            const hpMax = calcMaxHPForCard(b, item.stats);
            return (
              <div
                key={item.id}
                className="group rounded-xl border bg-card p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold leading-tight">
                      {b.name || "Без имени"}
                    </h2>
                    <div className="text-sm text-muted-foreground">
                      {b.race} • {b.class}
                      {b.subclass ? ` • ${b.subclass}` : ""} • ур. {b.level}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {b.alignment} • {b.edition}
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-md border bg-background p-2 text-center">
                    <div className="text-[11px] uppercase text-muted-foreground">
                      Здоровье
                    </div>
                    <div className="font-semibold">
                      {Math.max(0, b.hpCurrent ?? 0)} / {hpMax}
                    </div>
                  </div>
                  {item.created && (
                    <div className="rounded-md border bg-background p-2 text-center">
                      <div className="text-[11px] uppercase text-muted-foreground">
                        Создан
                      </div>
                      <div className="font-semibold">
                        {new Date(item.created).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => edit(item)}
                  >
                    Редактировать
                  </Button>
                  <Button variant="outline" asChild size="sm">
                    <Link to={`/characters/${item.id}`}>Просмотр</Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(item.id)}
                  >
                    Удалить
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-10 text-center text-muted-foreground">
          <div className="text-base">
            Здесь появится список ваших персонажей.
          </div>
          <div className="mt-2 text-sm">Сохраните героя на шаге «Итоги».</div>
          <div className="mt-6">
            <Button asChild>
              <Link to="/create">Созда��ь нового</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function calcMaxHPForCard(basics: Basics, stats?: Record<string, number>) {
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
  const d = die[basics.class as keyof typeof die] || 8;
  const con = stats?.con ?? 0;
  const conMod = Math.floor((con - 10) / 2);
  const level = basics.level || 1;
  const hpMode = basics.hpMode || "fixed";
  let hp = d + conMod;
  if (hpMode === "fixed") hp += (level - 1) * (Math.floor(d / 2) + 1 + conMod);
  else hp += (level - 1) * (1 + conMod);
  return Math.max(0, hp);
}
