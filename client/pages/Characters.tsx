import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCharacter } from "@/store/character";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabaseClient";
import { CLASS_CATALOG } from "@/data/classes";
import { RACE_CATALOG } from "@/data/races";
import { getClassByKey } from "@/data/classes";

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

type SupabaseCharacter = {
    id: string;
    user_id: string;
    data: {
        basics: Basics;
        stats?: Record<string, number>;
        hpRolls?: number[];
        avatar?: string | null;
        created?: string;
    };
    created_at: string;
};

export default function Characters() {
    const [characters, setCharacters] = useState<SupabaseCharacter[]>([]);
    const [loading, setLoading] = useState(true);
    const nav = useNavigate();
    const { } = useCharacter();

    useEffect(() => {
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setCharacters([]);
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("characters")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Ошибка загрузки:", error);
                setCharacters([]);
            } else {
                setCharacters(data || []);
            }
            setLoading(false);
        })();
    }, []);

    const edit = (id: string) => {
        nav(`/create/${id}/class`);
    };

    const remove = async (id: string) => {
        const { error } = await supabase.from("characters").delete().eq("id", id);
        if (error) {
            console.error("Ошибка удаления:", error);
            return;
        }
        setCharacters((prev) => prev.filter((c) => c.id !== id));
    };

    if (loading) {
        return <div className="p-4">Загрузка...</div>;
    }

    return (
        <div className="container mx-auto py-10">
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Мои персонажи</h1>
                <Button
                    onClick={() => {
                        nav(`/create`);
                    }}
                >
                    Создать персонажа
                </Button>
            </div>

            {characters.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {characters.map((char) => {
                        const b = char.data.basics;
                        const hpMax = calcMaxHPForCard(b, char.data.stats, char.data.hpRolls);

                        const classInfo = CLASS_CATALOG.find(
                            (c) => c.key.toLowerCase() === b.class.toLowerCase()
                        );
                        const subclassInfo = classInfo?.subclasses.find(
                            (s) => s.key.toLowerCase() === b.subclass.toLowerCase()
                        );
                        const raceInfo = RACE_CATALOG.find(
                            (c) => c.key.toLowerCase() === b.race.toLowerCase()
                        );

                        return (
                            <div
                                key={char.id}
                                className="group border bg-card shadow-sm transition hover:shadow-md flex flex-col"
                            >
                                {/* Верхняя часть с именем и инфой */}
                                <div
                                    className="p-5 flex items-center gap-4 relative bg-gray-400"
                                    style={
                                        classInfo?.bg
                                            ? {
                                                backgroundImage: `url(${classInfo.bg})`,
                                                backgroundSize: "cover",
                                                backgroundPosition: "center center",
                                                color: "white",
                                            }
                                            : {}
                                    }
                                >
                                    {classInfo?.bg && (
                                        <div className="absolute inset-0 bg-black/10" />
                                    )}

                                    <div className="relative flex items-center gap-4">
                                        {/* Портрет */}
                                        {char.data.avatar ? (
                                            <img
                                                src={char.data.avatar}
                                                alt="Портрет персонажа"
                                                className="w-[90px] h-[90px] rounded-lg object-cover border-2 border-white/20"
                                            />
                                        ) : (
                                            <div className="w-[90px] h-[90px] bg-gray-400/70 flex items-center justify-center text-4xl font-bold text-gray-100 font-monomakh rounded-lg">
                                                {b.name ? b.name.charAt(0).toUpperCase() : "?"}
                                            </div>
                                        )}

                                        {/* Имя и инфа */}
                                        <div>
                                            <h1 className="text-4xl font-monomakh mb-1">
                                                {b.name || "Без имени"}
                                            </h1>
                                            <div className="text-sm text-gray-200 drop-shadow">
                                                {raceInfo?.name || b.race } • {classInfo?.name || b.class}
                                                {subclassInfo?.name ? ` • ${subclassInfo.name}` : ""} • Уровень {b.level}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Средний блок с параметрами */}
                                {/* Узкая полоса-инфо */}
                                <div className="w-full bg-gray-800 text-gray-100 text-xs flex justify-center gap-6 py-1">
                                    <div>
                                        <span className="uppercase opacity-70 mr-1">Здоровье:</span>
                                        <span className="font-semibold">
                                            {Math.max(0, b.hpCurrent ?? 0)} / {hpMax}
                                        </span>
                                    </div>

                                    {char.created_at && (
                                        <div>
                                            <span className="uppercase opacity-70 mr-1">Создан:</span>
                                            <span className="font-semibold">
                                                {new Date(char.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Нижний блок с кнопками */}
                                <div className="mt-auto w-full border-t">
                                    <div className="flex w-full">
                                        {/* Просмотр */}
                                        <div
                                            onClick={() => nav(`/characters/${char.id}`)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => { if (e.key === "Enter") nav(`/characters/${char.id}`); }}
                                            className="flex-1 flex items-center justify-center py-3 cursor-pointer transition-colors hover:bg-gray-200 focus:bg-gray-600 text-center"
                                        >
                                            <span className="uppercase font-medium">VIEW</span>
                                        </div>
                                        {/* Редактировать */}
                                        <div
                                            onClick={() => edit(char.id)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => { if (e.key === "Enter") edit(char.id); }}
                                            className="flex-1 flex items-center justify-center py-3 cursor-pointer transition-colors hover:bg-gray-200 focus:bg-gray-600 text-center"
                                        >
                                            <span className="uppercase font-medium">EDIT</span>
                                        </div>
                                        {/* Удалить */}
                                        <div
                                            onClick={() => remove(char.id)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => { if (e.key === "Enter") remove(char.id); }}
                                            className="flex-1 flex items-center justify-center py-3 cursor-pointer transition-colors hover:bg-red-100 focus:bg-red-600 text-center"
                                        >
                                            <span className="uppercase font-medium text-red-500">DELETE</span>
                                        </div>
                                    </div>
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
                            <Button asChild onClick={() => {
                                nav(`/create`);
                            }}>
                            Создать нового
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

function calcMaxHPForCard(basics: Basics, stats?: Record<string, number>, hpRolls?: number[]) {
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
    if (level > 1) {
        if (hpMode === "fixed") {
            hp += (level - 1) * (Math.floor(d / 2) + 1 + conMod);
        } else {
            const rolls = hpRolls || [];
            for (let lvl = 2; lvl <= level; lvl++) {
                const idx = lvl - 2;
                const dieValue = rolls[idx] && rolls[idx]! > 0 ? rolls[idx]! : 1;
                hp += dieValue + conMod;
            }
        }
    }
    return Math.max(0, hp);
}
