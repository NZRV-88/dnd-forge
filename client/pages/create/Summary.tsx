import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import StepArrows from "@/components/ui/StepArrows";
import ExitButton from "@/components/ui/ExitButton";
import { useCharacter } from "@/store/character";
import { ABILITIES } from "@/data/abilities";
import { getRaceByKey } from "@/data/races";
import { getEffectiveSpeed } from "@/data/races/types";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { getAllCharacterData } from "@/utils/getAllCharacterData";

export default function Summary() {
    const user = useAuth();
    const { id: urlId } = useParams<{ id: string }>();
    const nav = useNavigate();
    const {
        //asi,
        draft,
        //stats,
        //totalAbilityBonuses,
        skills,
        languages,
        tools,
        feats,
        spells,
        saveToSupabase
        //equipment,
    } = useCharacter();

    const race = getRaceByKey(draft.basics.race);
    const subrace = race?.subraces?.find((s) => s.key === draft.basics.subrace) || null;
    const speed = getEffectiveSpeed(race, subrace);
    const { abilityBonuses } = getAllCharacterData(draft);

    const handleSave = async () => {
        try {
            await saveToSupabase();
            alert("Персонаж сохранён!");
            nav(`/characters/${draft.id}`);
        } catch (e) {
            console.error("Ошибка при сохранении персонажа:", e);
            alert("Ошибка при сохранении");
        }
    };

    return (
        <div className="container mx-auto py-10">
            <div className="mx-auto max-w-5xl relative">
                <StepArrows back={`/create/${urlId}/equipment`} next={null} />
                <ExitButton />

                {/* Заголовок */}
                <div className="mb-6 flex items-baseline justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            {draft.basics.name || "Безымянный герой"}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {draft.basics.race} {draft.basics.subrace && `(${draft.basics.subrace})`} •{" "}
                            {draft.basics.class} {draft.basics.subclass && `(${draft.basics.subclass})`}
                        </p>
                    </div>
                </div>

                {/* Основное */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="border-l-2 border-primary pl-2 uppercase tracking-wide">
                            Основное
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <div className="text-muted-foreground">Имя</div>
                            <div className="font-medium">{draft.basics.name}</div>
                        </div>
                        <div>
                            <div className="text-muted-foreground">Раса</div>
                            <div className="font-medium">{draft.basics.race}</div>
                        </div>
                        {draft.basics.subrace && (
                            <div>
                                <div className="text-muted-foreground">Подраса</div>
                                <div className="font-medium">{draft.basics.subrace}</div>
                            </div>
                        )}
                        <div>
                            <div className="text-muted-foreground">Класс</div>
                            <div className="font-medium">{draft.basics.class}</div>
                        </div>
                        {draft.basics.subclass && (
                            <div>
                                <div className="text-muted-foreground">Подкласс</div>
                                <div className="font-medium">{draft.basics.subclass}</div>
                            </div>
                        )}
                        <div>
                            <div className="text-muted-foreground">Скорость</div>
                            <div className="font-medium">{speed} футов</div>
                        </div>
                        {draft.basics.background && (
                            <div>
                                <div className="text-muted-foreground">Предыстория</div>
                                <div className="font-medium">{draft.basics.background}</div>
                            </div>
                        )}

                        {draft.basics.alignment && (
                            <div>
                                <div className="text-muted-foreground">Мировоззрение</div>
                                <div className="font-medium">{draft.basics.alignment}</div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Характеристики */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="border-l-2 border-primary pl-2 uppercase tracking-wide">
                            Характеристики
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {ABILITIES.map((a) => {
                            const base = draft.stats[a.key] || 0;
                            const bonus = abilityBonuses[a.key] || 0;
                            const total = Math.min(base + bonus, 20);
                            const modifier = Math.floor((total - 10) / 2);

                            return (
                                <div
                                    key={a.key}
                                    className="rounded border p-3 text-center shadow-sm"
                                >
                                    <div className="font-bold">{a.label}</div>
                                    <div className="text-2xl">{total}</div>
                                    <div className="text-muted-foreground text-sm">
                                        Модификатор: {modifier >= 0 ? `+${modifier}` : modifier}
                                    </div>
                                    {bonus > 0 && (
                                        <div className="text-xs text-green-600">+{bonus} от бонусов</div>
                                    )}
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* Языки */}
                {languages?.length > 0 && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="border-l-2 border-primary pl-2 uppercase tracking-wide">
                                Языки
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside text-sm">
                                {languages.map((l, i) => (
                                    <li key={i}>{l}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {/* Навыки */}
                {skills?.length > 0 && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="border-l-2 border-primary pl-2 uppercase tracking-wide">
                                Навыки
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside text-sm">
                                {skills.map((s, i) => (
                                    <li key={i}>{s}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {/* Инструменты */}
                {tools?.length > 0 && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="border-l-2 border-primary pl-2 uppercase tracking-wide">
                                Инструменты
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside text-sm">
                                {tools.map((t, i) => (
                                    <li key={i}>{t}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {/* Черты */}
                {feats?.length > 0 && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="border-l-2 border-primary pl-2 uppercase tracking-wide">
                                Черты
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside text-sm">
                                {feats.map((f, i) => (
                                    <li key={i}>{f}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {/* Заклинания */}
                {spells?.length > 0 && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="border-l-2 border-primary pl-2 uppercase tracking-wide">
                                Заклинания
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside text-sm">
                                {spells.map((sp, i) => (
                                    <li key={i}>{sp}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {/* Снаряжение */}
                {/*{equipment?.length > 0 && (*/}
                {/*    <Card className="mb-6">*/}
                {/*        <CardHeader>*/}
                {/*            <CardTitle className="border-l-2 border-primary pl-2 uppercase tracking-wide">*/}
                {/*                Снаряжение*/}
                {/*            </CardTitle>*/}
                {/*        </CardHeader>*/}
                {/*        <CardContent>*/}
                {/*            <ul className="list-disc list-inside text-sm">*/}
                {/*                {equipment.map((e, i) => (*/}
                {/*                    <li key={i}>{e}</li>*/}
                {/*                ))}*/}
                {/*            </ul>*/}
                {/*        </CardContent>*/}
                {/*    </Card>*/}
                {/*)}*/}

                {/* Кнопки */}
                <div className="flex justify-between">
                    <button
                        onClick={handleSave}
                        className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90"
                    >
                        Сохранить персонажа
                    </button>
                </div>
            </div>
        </div>
    );
}
