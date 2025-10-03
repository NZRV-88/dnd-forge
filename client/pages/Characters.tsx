import { useEffect, useState, useMemo, memo } from "react";
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
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState<string | null>(null);
    const nav = useNavigate();

    // Мемоизированные каталоги для быстрого поиска
    const classCatalogMap = useMemo(() => {
        const map = new Map();
        CLASS_CATALOG.forEach(cls => {
            map.set(cls.key.toLowerCase(), cls);
        });
        return map;
    }, []);

    const raceCatalogMap = useMemo(() => {
        const map = new Map();
        RACE_CATALOG.forEach(race => {
            map.set(race.key.toLowerCase(), race);
        });
        return map;
    }, []);
    
    // Безопасное получение useCharacter
    let initNewCharacter: (() => void) | null = null;
    let createNewCharacter: ((id: string) => Promise<void>) | null = null;
    try {
        const characterContext = useCharacter();
        initNewCharacter = characterContext.initNewCharacter;
        createNewCharacter = characterContext.createNewCharacter;
    } catch (error) {
        console.warn("CharacterProvider not available, character functions will be null");
    }

    useEffect(() => {
        (async () => {
            console.log('Characters: Начинаем загрузку персонажей...');
            const startTime = performance.now();
            
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.log('Characters: Пользователь не авторизован');
                setCharacters([]);
                setLoading(false);
                return;
            }


            console.log('Characters: Пользователь авторизован, загружаем персонажей...');
            
            // Добавляем таймаут для запроса
            const queryPromise = supabase
                .from("characters")
                .select("id, created_at, updated_at, data")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });
            
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Query timeout after 10 seconds')), 10000)
            );
            
            const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

            const endTime = performance.now();
            console.log(`Characters: Запрос к БД выполнен за ${endTime - startTime}ms`);

            if (error) {
                console.error("Characters: Ошибка загрузки:", error);
                if (error.message?.includes('timeout')) {
                    console.error("Characters: Запрос к БД превысил таймаут в 10 секунд!");
                }
                setCharacters([]);
            } else {
                console.log(`Characters: Загружено ${data?.length || 0} персонажей`);
                
                // Проверяем размер данных
                if (data && data.length > 0) {
                    const totalSize = JSON.stringify(data).length;
                    console.log(`Characters: Общий размер данных: ${(totalSize / 1024).toFixed(2)} KB`);
                }
                
                // Оптимизируем данные для отображения - извлекаем только нужные поля
                const optimizedData = (data || []).map(char => {
                    console.log('Characters: Обрабатываем персонажа:', char.id, 'data:', char.data);
                    return {
                        ...char,
                        // Добавляем name из data.basics для совместимости
                        name: char.data?.basics?.name || null,
                        // Извлекаем нужные поля из data для отображения
                        data: char.data ? {
                            basics: char.data.basics,
                            stats: char.data.stats,
                            hpRolls: char.data.hpRolls,
                            avatar: char.data.avatar
                        } : null
                    };
                });
                
                console.log('Characters: Оптимизированные данные:', optimizedData);
                
                setCharacters(optimizedData);
            }
            setLoading(false);
        })();
    }, []);

    const edit = async (id: string) => {
        setEditing(id);
        try {
            // Загружаем данные персонажа перед переходом
            if (initNewCharacter) {
                initNewCharacter();
            }
            // Ждем немного, чтобы драфт обновился
            await new Promise(resolve => setTimeout(resolve, 100));
            // Переходим сразу на страницу класса для редактирования
            nav(`/create/${id}/class`);
        } finally {
            setEditing(null);
        }
    };

    const createNew = async () => {
        if (!createNewCharacter || !initNewCharacter) {
            console.error("Character functions not available");
            return;
        }
        
        setCreating(true);
        const newId = uuidv4();
        console.log('Characters: Creating new character with ID:', newId);
        
        try {
            // Сначала очищаем localStorage
            console.log('Characters: Clearing localStorage before creating new character');
            try {
                localStorage.removeItem("characterDraft");
            } catch {
                // noop
            }
            
            // Затем очищаем драфт
            console.log('Characters: Clearing draft before creating new character');
            initNewCharacter();
            
            // Ждем немного, чтобы драфт обновился
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Создаем нового персонажа
            await createNewCharacter(newId);
            console.log('Characters: Character created, navigating to start page');
            nav(`/create/${newId}/start`);
        } catch (error) {
            console.error('Characters: Error creating character:', error);
        } finally {
            setCreating(false);
        }
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
                    onClick={createNew}
                    disabled={creating}
                >
                    {creating ? "Создание..." : "Создать персонажа"}
                </Button>
            </div>

            {characters.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {characters.map((char) => {
                        const b = char.data.basics;
                        
                        // Пропускаем персонажей без базовых данных
                        if (!b) {
                            return null;
                        }
                        
                        // Используем "Безымянный" если имя не задано
                        const displayName = b.name || "Безымянный";
                        
                        const hpMax = calcMaxHPForCard(b, char.data.stats, char.data.hpRolls);

                        // Используем мемоизированные каталоги для быстрого поиска
                        const classInfo = classCatalogMap.get((b.class || '').toLowerCase());
                        const subclassInfo = classInfo?.subclasses?.find(
                            (s) => s.key.toLowerCase() === (b.subclass || '').toLowerCase()
                        );
                        const raceInfo = raceCatalogMap.get((b.race || '').toLowerCase());

                        return (
                            <CharacterCard
                                key={char.id}
                                char={char}
                                classInfo={classInfo}
                                subclassInfo={subclassInfo}
                                raceInfo={raceInfo}
                                displayName={displayName}
                                hpMax={hpMax}
                                editing={editing}
                                onEdit={edit}
                                onRemove={remove}
                                onView={(id) => nav(`/character-list/${id}`)}
                            />
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
                            <Button asChild onClick={createNew} disabled={creating}>
                            {creating ? "Создание..." : "Создать нового"}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Мемоизированный компонент карточки персонажа
const CharacterCard = memo(({ 
    char, 
    classInfo, 
    subclassInfo, 
    raceInfo, 
    displayName, 
    hpMax, 
    editing, 
    onEdit, 
    onRemove, 
    onView 
}: {
    char: SupabaseCharacter;
    classInfo: any;
    subclassInfo: any;
    raceInfo: any;
    displayName: string;
    hpMax: number;
    editing: string | null;
    onEdit: (id: string) => void;
    onRemove: (id: string) => void;
    onView: (id: string) => void;
}) => {
    const b = char.data.basics;
    
    return (
        <div className="group border bg-card shadow-sm transition hover:shadow-md flex flex-col">
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
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-[90px] h-[90px] bg-gray-400/70 flex items-center justify-center text-4xl font-bold text-gray-100 font-monomakh rounded-lg">
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                    )}

                    {/* Имя и инфа */}
                    <div>
                        <h1 
                            className={`text-4xl font-monomakh mb-1 ${!b.name ? 'text-gray-400 italic' : ''}`}
                            title={!b.name ? 'Персонаж без имени - нажмите EDIT для редактирования' : ''}
                        >
                            {displayName}
                        </h1>
                        <div className="text-sm text-gray-200 drop-shadow">
                            {raceInfo?.name || b.race } • {classInfo?.name || b.class}
                            {subclassInfo?.name ? ` • ${subclassInfo.name}` : ""} • Уровень {b.level}
                        </div>
                    </div>
                </div>
            </div>

            {/* Средний блок с параметрами */}
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
                        onClick={() => onView(char.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === "Enter") onView(char.id); }}
                        className="flex-1 flex items-center justify-center py-3 cursor-pointer transition-colors hover:bg-gray-200 focus:bg-gray-600 text-center"
                    >
                        <span className="uppercase font-medium">VIEW</span>
                    </div>
                    {/* Редактировать */}
                    <div
                        onClick={() => onEdit(char.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === "Enter") onEdit(char.id); }}
                        className={`flex-1 flex items-center justify-center py-3 cursor-pointer transition-colors hover:bg-gray-200 focus:bg-gray-600 text-center ${editing === char.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <span className="uppercase font-medium">
                            {editing === char.id ? "ЗАГРУЗКА..." : "EDIT"}
                        </span>
                    </div>
                    {/* Удалить */}
                    <div
                        onClick={() => onRemove(char.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === "Enter") onRemove(char.id); }}
                        className="flex-1 flex items-center justify-center py-3 cursor-pointer transition-colors hover:bg-red-100 focus:bg-red-600 text-center"
                    >
                        <span className="uppercase font-medium text-red-500">DELETE</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

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
