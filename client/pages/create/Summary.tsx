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

export default function Summary() {
  const nav = useNavigate();
  const { basics, stats, asi } = useCharacter();

  // Получить снаряжение и золото, если они есть
  const equipment = (basics as any).equipment || [];
  const gold = (basics as any).gold || 0;

  // Сохранить персонажа
  const handleSave = () => {
    const editingId = localStorage.getItem(EDITING_ID_KEY);
    const character = {
      basics,
      stats,
      asi,
      equipment,
      gold,
      created: new Date().toISOString(),
      id: editingId ? Number(editingId) : Date.now(),
    };
    upsertCharacter(character);
    nav("/characters");
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-8 shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Лист персонажа</h1>
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div>
            <div className="font-medium">Имя:</div>
            <div>{basics.name}</div>
          </div>
          <div>
            <div className="font-medium">Класс / Подкласс:</div>
            <div>
              {basics.class}
              {basics.subclass ? ` / ${basics.subclass}` : ""}
            </div>
          </div>
          <div>
            <div className="font-medium">Раса:</div>
            <div>{basics.race}</div>
          </div>
          <div>
            <div className="font-medium">Уровень:</div>
            <div>{basics.level}</div>
          </div>
          <div>
            <div className="font-medium">Предыстория:</div>
            <div>{basics.background}</div>
          </div>
          <div>
            <div className="font-medium">Мировоззрение:</div>
            <div>{basics.alignment}</div>
          </div>
        </div>
        <div className="mb-6">
          <div className="font-medium mb-2">Характеристики:</div>
          <ul className="grid grid-cols-3 gap-2 text-sm">
            {Object.entries(stats).map(([k, v]) => (
              <li key={k}>
                <span className="font-semibold">{k.toUpperCase()}:</span> {v}
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-6">
          <div className="font-medium mb-2">Снаряжение:</div>
          {equipment.length > 0 ? (
            <ul className="list-disc pl-6 text-sm">
              {equipment.map((item: string, i: number) => (
                <li key={i}>{item}</li>
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
        <div className="mt-8 flex justify-between gap-3">
          <Button variant="secondary" onClick={() => nav("/create/equipment")}>
            Назад
          </Button>
          <Button onClick={handleSave}>Сохранить</Button>
        </div>
      </div>
    </div>
  );
}
