// /pages/CharacterView.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AbilityScores from "@/components/characterList/AbilityScores";
import ProficiencySpeed from "@/components/characterList/ProficiencySpeed";
import HealthBlock from "@/components/characterList/HealthBlock";
import SavingThrows from "@/components/characterList/SavingThrows";
import Skills from "@/components/characterList/Skills";
import PassiveSenses from "@/components/characterList/PassiveSenses";
import Proficiencies from "@/components/characterList/Proficiencies";
import InitiativeAC from "@/components/characterList/InitiativeAC";
import RollLog from "@/components/characterList/RollLog";
import { ALL_FEATS } from "@/data/feats/feats";
import { Button } from "@/components/ui/button";
import { RACE_CATALOG } from "@/data/races";
import { CLASS_LABELS } from "@/data/classes";
import { getEffectiveSpeed } from "@/data/races/types"; 
import { supabase } from "@/lib/supabaseClient";

const LIST_KEY = "dnd-ru-characters";

export default function CharacterView() {
    const { id } = useParams();
    const nav = useNavigate();

    // character + local controlled HP state
    const [char, setChar] = useState<any | null>(null);
    const [curHp, setCurHp] = useState<number>(0);
    const [tempHp, setTempHp] = useState<number>(0);

    // roll log UI
    const [rollLog, setRollLog] = useState<string[]>([]);
    const [showLog, setShowLog] = useState(false);


    // Load character by id from Supabase
    useEffect(() => {
        (async () => {
            try {
                const { data, error } = await supabase
                    .from("characters")
                    .select("*")
                    .eq("id", id)
                    .single();
                if (error || !data) {
                    setChar(null);
                    return;
                }
                const draft = data.data || {};
                // normalize skills
                if (draft.skills) {
                    if (Array.isArray(draft.skills)) {
                        // ok
                    } else if (typeof draft.skills === "object") {
                        const arr: string[] = [];
                        for (const [k, v] of Object.entries(draft.skills)) {
                            if (v && (v === true || (typeof v === "object" && ("prof" in (v as any) ? (v as any).prof : true)))) {
                                arr.push(k);
                            }
                        }
                        draft.skills = arr;
                    } else {
                        draft.skills = [];
                    }
                } else {
                    draft.skills = [];
                }
                setChar(draft);
                setCurHp(draft.basics?.hpCurrent ?? 0);
                setTempHp(draft.basics?.hpTemp ?? 0);
            } catch {
                setChar(null);
            }
        })();
    }, [id]);

    // final stats calculation (ASIs + race + feats as before)
    const finalStats = useMemo(() => {
        if (!char) return {};
        const basics = char.basics || {};
        const stats = char.stats || {};
        const raceBonuses = basics.raceBonuses || {};
        const backgroundBonuses = basics.backgroundBonuses || {};
        const asi = char.asi || {};

        const asiBonuses: Record<string, number> = {};
        const featBonuses: Record<string, number> = {};
        let extraInitiative = 0;
        let extraSpeed = 0;
        let extraHp = 0;

        Object.values(asi).forEach((s: any) => {
            if (!s) return;
            if (s.mode === "asi") {
                if (s.s1) asiBonuses[s.s1] = (asiBonuses[s.s1] || 0) + 1;
                if (s.s2) asiBonuses[s.s2] = (asiBonuses[s.s2] || 0) + 1;
            } else if (s.mode === "feat" && s.feat) {
                const feat = ALL_FEATS.find((f) => f.key === s.feat);
                if (!feat?.effect) return;
                for (const bonus of feat.effect) {
                    // статичное увеличение характеристик
                    if (bonus.abilities) {
                        for (const [k, v] of Object.entries(bonus.abilities)) {
                            featBonuses[k] = (featBonuses[k] || 0) + (v as number);
                        }
                    }

                    // выбор характеристики
                    if (bonus.abilityChoice && s.choice) {
                        const chosen = s.choice as string;
                        if (bonus.abilityChoice.includes(chosen as any)) {
                            featBonuses[chosen] = (featBonuses[chosen] || 0) + 1;
                        }
                    }

                    // другие бонусы
                    if (bonus.initiative) extraInitiative += bonus.initiative;
                    if (bonus.speed) extraSpeed += bonus.speed;
                    if (bonus.hp) extraHp += bonus.hp;
                }
            }
        });

        const keys = ["str", "dex", "con", "int", "wis", "cha"] as const;
        const out: Record<string, number> = {};
        keys.forEach((k) => {
            const base = stats[k] || 0;
            const total =
                base +
                (raceBonuses[k] || 0) +
                (backgroundBonuses[k] || 0) +
                (asiBonuses[k] || 0) +
                (featBonuses[k] || 0);
            const capFromData = (char?.abilityMax && typeof char.abilityMax[k] === "number")
                ? char.abilityMax[k]
                : undefined;
            const maxVal = typeof capFromData === "number" ? capFromData : 20;
            out[k] = Math.min(maxVal, total);
        });

        return {
            ...out,
            _extraInitiative: extraInitiative,
            _extraSpeed: extraSpeed,
            _extraHp: extraHp,
        };
    }, [char]);

    if (!char) {
        return (
            <div className="container mx-auto py-10 text-center">
                <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-10">
                    <div className="text-lg">Персонаж не найден</div>
                    <div className="mt-4"><Button onClick={() => nav(-1)}>Назад</Button></div>
                </div>
            </div>
        );
    }

    const b = char.basics || {};

    // раса, подраса, класс, подкласс


    // speed, initiative, hpMax, proficiency
    const speed = (b.speed || 30) + (finalStats as any)._extraSpeed;
    const initiative =
        Math.floor((((finalStats as any).dex || 0) - 10) / 2) +
        ((finalStats as any)._extraInitiative || 0);

    const hpMax = (() => {
        const die: Record<string, number> = {
            barbarian: 12, bard: 8, fighter: 10, wizard: 6, druid: 8,
            cleric: 8, warlock: 8, monk: 8, paladin: 10, rogue: 8,
            ranger: 10, sorcerer: 6,
        };
        const d = die[b.class as keyof typeof die] || 8;
        const con = (finalStats as any).con ?? 0;
        const conMod = Math.floor((con - 10) / 2);
        const level = b.level || 1;
        const hpMode = b.hpMode || "fixed";
        let hp = d + conMod;
        if (level > 1) {
            if (hpMode === "fixed") {
                hp += (level - 1) * (Math.floor(d / 2) + 1 + conMod);
            } else {
                const rolls: number[] = Array.isArray(char.hpRolls) ? char.hpRolls : [];
                for (let lvl = 2; lvl <= level; lvl++) {
                    const idx = lvl - 2;
                    const dieValue = rolls[idx] && rolls[idx]! > 0 ? rolls[idx]! : 1;
                    hp += dieValue + conMod;
                }
            }
        }
        const extra = ((finalStats as any)._extraHp || 0) * level;
        return Math.max(0, hp + extra);
    })();

    const proficiencyBonus = (() => {
        const level = b.level || 1;
        if (level >= 17) return 6;
        if (level >= 13) return 5;
        if (level >= 9) return 4;
        if (level >= 5) return 3;
        return 2;
    })();

    // skill profs set (normalized)
    const skillProfs: string[] = Array.isArray(char.skills) ? char.skills : [];

    // universal addRoll function: any child can call it
    const addRoll = (desc: string, abilityKey: string, bonus: number, type: string = "") => {
        const d20 = Math.floor(Math.random() * 20) + 1;
        const total = d20 + bonus;
        const entry = `${desc} (${abilityKey.toUpperCase()}${type ? `, ${type}` : ""}): 🎲 ${d20} ${bonus >= 0 ? `+ ${bonus}` : bonus} = ${total}`;
        setRollLog((prev) => [entry, ...prev].slice(0, 200));
    };

    // Save changes back to Supabase
    const saveAll = async () => {
        try {
            if (!char) return;
            const updated = { ...char };
            updated.basics = { ...updated.basics, hpCurrent: curHp, hpTemp: tempHp };
            updated.skills = skillProfs;
            const { error } = await supabase
                .from("characters")
                .update({ data: updated, updated_at: new Date() })
                .eq("id", id);
            if (!error) setChar(updated);
        } catch {
            // noop
        }
    };

    // small helper to format ability mods
    const formatMod = (v: number) => {
        const m = Math.floor((v - 10) / 2);
        return m >= 0 ? `+${m}` : `${m}`;
    };

    const raceInfo = RACE_CATALOG.find(
        (c) => c.key.toLowerCase() === b.race.toLowerCase()
    );

    return (
        <div className="bg-neutral-900 text-gray-200 min-h-screen p-6 font-sans flex justify-center">
            <div className="w-[1200px]">

                {/* HEADER */}
                <div className="flex items-center border-b border-yellow-600 pb-4 mb-6">
                    {/* Левая часть: аватар */}
                    <div className="flex flex-col items-center mr-6">
                        <label htmlFor="avatar-upload" className="cursor-pointer">
                            {char.avatar ? (
                                <img
                                    src={char.avatar}
                                    alt="Аватар персонажа"
                                    className="w-28 h-28 rounded-lg object-cover border-2 border-yellow-600 hover:opacity-80 transition"
                                />
                            ) : (
                                <div className="w-28 h-28 rounded-lg bg-neutral-800 border-2 border-dashed border-yellow-600 flex items-center justify-center text-gray-500 hover:opacity-80 transition">
                                    Загрузить
                                </div>
                            )}
                        </label>

                        <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onload = () => {
                                        const url = reader.result as string;
                                        const updated = { ...char, avatar: url };
                                        setChar(updated);

                                        // сохраняем в localStorage
                                        const raw = localStorage.getItem("dnd-ru-characters") || "[]";
                                        const list = JSON.parse(raw);
                                        const idx = list.findIndex((c: any) => String(c.id) === String(id));
                                        if (idx >= 0) {
                                            list[idx].avatar = url;
                                            localStorage.setItem("dnd-ru-characters", JSON.stringify(list));
                                        }
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                    </div>

                    {/* Правая часть: имя + инфо */}
                    <div className="flex flex-col items-start">
                        <h1 className="text-4xl font-serif font-bold text-yellow-400">
                            {b.name || "Без имени"}
                        </h1>
                        <div className="mt-2 text-lg italic text-gray-300">
                            {raceInfo[b.name] || "Раса?"}
                            {b.subrace ? ` (${b.subrace})` : ""} {/* TODO: сюда можно русское имя подрасы */}
                            {" • "}
                            {raceInfo[b.name] || "Класс?"}
                            {b.subclass ? ` (${b.subclass})` : ""} {/* TODO: сюда можно русское имя подкласса */}
                            {" • ур. "}
                            {b.level || 1}

                        </div>
                    </div>
                </div>

                {/* ROW 1 */}
                <div className="grid grid-cols-[620px_240px_320px] gap-4 mb-6">
                    <div>
                        <AbilityScores
                            stats={finalStats}
                            onRoll={addRoll}
                        />
                    </div>

                    <div className="flex flex-col items-center justify-center space-y-3">
                        {/*<ProficiencySpeed proficiencyBonus={proficiencyBonus} speed={speed} />*/}
                    </div>

                    <div>
                        <HealthBlock
                            curHp={curHp}
                            setCurHp={setCurHp}
                            tempHp={tempHp}
                            setTempHp={setTempHp}
                            hpMax={hpMax}
                        />
                    </div>
                </div>

                {/* ROW 2: SavingThrows + Skills под характеристиками */}
                <div className="grid grid-cols-[300px_300px_240px] gap-4 mb-6 -mt-4">
                    {/* Saving Throws (лево) */}
                    <div className="space-y-4">
                        <SavingThrows
                            stats={finalStats}
                            onRoll={(label, ability, value) => addRoll(label, ability, value)}
                        />
                        <PassiveSenses stats={finalStats} />
                        {/*<Proficiencies profs={char.profs || {}} />*/}
                    </div>

                    {/* Skills (право от спасбросков) */}
                    <div className="space-y-4">
                        <Skills
                            stats={finalStats}
                            profs={char.skillProfs}
                            proficiencyBonus={proficiencyBonus}
                            onRoll={addRoll}
                      //      {/*profs={char.skills}   // ✅ теперь всегда из char*/}
                            onToggleProf={(skillKey) => {
                                const updated = char.skills.includes(skillKey)
                                    ? char.skills.filter((s: string) => s !== skillKey)
                                    : [...char.skills, skillKey];

                                setChar((prev: any) => ({ ...prev, skills: updated }));
                            }}
                        />
                    </div>

                    {/* Initiative + AC */}
                    <div className="-mt-4">
                        <InitiativeAC
                            initiative={initiative}
                            ac={b.ac ?? 10}
                            dex={(finalStats as any).dex ?? 0}
                            onRoll={addRoll}
                        />
                    </div>
                </div>

                {/* SAVE button */}
                <div className="flex justify-end gap-2">
                    <Button onClick={saveAll} className="bg-amber-500 text-black">Сохранить</Button>
                    <Button onClick={() => nav(-1)}>Назад</Button>
                </div>

                {/* ROLL LOG (floating bottom-right) */}
                <RollLog rolls={rollLog} show={showLog} onToggle={() => setShowLog((s) => !s)} />

            </div>
        </div>
    );
}
