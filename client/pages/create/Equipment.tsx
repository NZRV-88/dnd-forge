import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCharacter } from "@/store/character";
import { Button } from "@/components/ui/button";
import ExitButton from "@/components/ui/ExitButton";
import StepArrows from "@/components/ui/StepArrows";
import CharacterHeader from "@/components/ui/CharacterHeader";
import { useParams } from "react-router-dom";

// Снаряжение по умолчанию для каждого класса (адаптировано по PHB)
const DEFAULT_EQUIPMENT: Record<string, string[]> = {
    Варвар: [
        "Большой топор или любое другое простое оружие",
        "Два ручных топора или любое другое простое оружие ближнего боя",
        "Пакет путешественника и четыре метательных копья",
    ],
    Бард: [
        "Рапира, длинный меч или любое простое оружие",
        "Дипломатический пакет, развлекательный пакет или пакет путешественника",
        "Лютня или другой музыкальный инструмент",
        "Кожаный доспех и кинжал",
    ],
    Воин: [
        "Кольчуга или кожаный доспех, длинный лук и 20 стрел",
        "Боевой топор или любое простое оружие ближнего боя",
        "Щит или любое другое простое оружие",
        "Пакет доспеха или пакет путешественника",
    ],
    Волшебник: [
        "Посох или кинжал",
        "Пакет учёного или пакет путешественника",
        "Книга заклинаний",
    ],
    Друид: [
        "Деревянный щит или любое простое оружие",
        "Серп или любое простое оружие ближнего боя",
        "Пакет учёного или пакет путешественника",
        "Кожаный доспех, дубинка и набор травника",
    ],
    Жрец: [
        "Булава или военное оружие по выбору",
        "Щит или доспех по выбору",
        "Пакет жреца или пакет путешественника",
        "Священный символ",
        "Кольчуга",
    ],
    Колдун: [
        "Лёгкий арбалет и 20 болтов или любое простое оружие",
        "Компонентная сумка или фокус для заклинаний",
        "Пакет учёного или пакет путешественника",
        "Кожаный доспех, кинжал и два простых оружия",
    ],
    Монах: [
        "Короткий меч или любое простое оружие",
        "Пакет путешественника или пакет доспеха",
        "10 дротиков",
    ],
    Паладин: [
        "Военное оружие и щит или два военных оружия",
        "Пять метательных копий или любое простое оружие ближнего боя",
        "Пакет жреца или пакет путешественника",
        "Кольчуга и священный символ",
    ],
    Плут: [
        "Рапира или короткий меч",
        "Коротк��й лук и 20 стрел или короткий меч",
        "Пакет вора, дипломатический пакет или пакет путешественника",
        "Кожаный доспех, два кинжала и набор воровских инструментов",
    ],
    Следопыт: [
        "Частичный доспех или кожаный доспех",
        "Два меча или два простых оружия ближнего боя",
        "Длинный лук и колчан с 20 стрелами",
        "Пакет путешественника или пакет доспеха",
    ],
    Чародей: [
        "Лёгкий арбалет и 20 болтов или любое простое оружие",
        "Компонентная сумка или фокус для заклинаний",
        "Пакет учёного или пакет путешественника",
        "Два кинжала",
    ],
};

const DEFAULT_GOLD: Record<string, number> = {
    Варвар: 40,
    Бард: 100,
    Воин: 100,
    Волшебник: 80,
    Друид: 20,
    Жрец: 125,
    Колдун: 100,
    Монах: 5,
    Паладин: 100,
    Плут: 160,
    Следопыт: 100,
    Чародей: 120,
};

export default function EquipmentPick() {
    const { id } = useParams<{ id: string }>(); 
    const nav = useNavigate();
    const { draft, setBasics } = useCharacter();
    const [mode, setMode] = useState<"equipment" | "gold">("equipment");
    const [gold, setGold] = useState(DEFAULT_GOLD[draft.basics.class] || 50);

    // Сохраняем выбор и переходим далее
    const handleNext = () => {
        if (mode === "equipment") {
            setBasics({ equipment: DEFAULT_EQUIPMENT[draft.basics.class] || [] });
            setBasics({ gold: 0 });
        } else {
            setBasics({ equipment: [] });
            setBasics({ gold });
        }
        nav("/create/summary");
    };

    return (
        <div className="container mx-auto py-10">
            <div className="mx-auto max-w-5xl relative">
                <StepArrows back={`/create/${id}/abilities`} next={`/create/${id}/summary`} />   
                <ExitButton />

                {/* Шапка с именем и аватаркой */}
                <CharacterHeader />
                <h1 className="text-2xl font-bold mb-6 text-center">
                    Выбор снаряжения
                </h1>
                <div className="mb-6 flex gap-4 justify-center">
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            checked={mode === "equipment"}
                            onChange={() => setMode("equipment")}
                        />
                        Снаряжение по умолчанию ({draft.basics.class})
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            checked={mode === "gold"}
                            onChange={() => setMode("gold")}
                        />
                        Золотые монеты
                    </label>
                </div>
                {mode === "equipment" ? (
                    <div className="mb-4">
                        <div className="font-medium mb-2">Вы получите:</div>
                        <ul className="list-disc pl-6 text-sm">
                            {(DEFAULT_EQUIPMENT[draft.basics.class] || []).map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div className="mb-4">
                        <label className="block mb-2 font-medium">Количество золота</label>
                        <input
                            type="number"
                            min={0}
                            className="w-32 rounded-md border bg-background px-3 py-2 outline-none focus:border-primary"
                            value={gold}
                            onChange={(e) => setGold(Number(e.target.value))}
                        />
                        <span className="ml-2 text-muted-foreground">зм</span>
                    </div>
                )}

            </div>
        </div>
    );
}
