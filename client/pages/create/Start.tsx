import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCharacter } from "@/store/character";
import { Button } from "@/components/ui/button";

export default function Start() {
  const nav = useNavigate();
  const { basics, setName, setHpMode } = useCharacter();
  const [name, setLocalName] = useState(basics.name || "");
  const [hpMode, setLocalHpMode] = useState<"fixed" | "roll">(
    basics.hpMode || "fixed",
  );

  const handleNext = () => {
    setName(name);
    setHpMode(hpMode);
    nav("/create/class");
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-md rounded-2xl border bg-card p-8 shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Создание персонажа
        </h1>
        <div className="mb-6">
          <label className="block mb-2 font-medium">Имя персонажа</label>
          <input
            className="w-full rounded-md border bg-background px-3 py-2 outline-none focus:border-primary"
            value={name}
            onChange={(e) => setLocalName(e.target.value)}
            placeholder="Введите имя"
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 font-medium">Рост хит-поинтов</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={hpMode === "fixed"}
                onChange={() => setLocalHpMode("fixed")}
              />
              Фиксированный (усреднённый)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={hpMode === "roll"}
                onChange={() => setLocalHpMode("roll")}
              />
              Бросок кубика
            </label>
          </div>
        </div>
        <Button className="w-full" onClick={handleNext} disabled={!name.trim()}>
          Далее
        </Button>
      </div>
    </div>
  );
}
