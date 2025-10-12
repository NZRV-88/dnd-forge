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
import { useDiceRolls } from "@/hooks/useDiceRolls";
import DiceRollModal from "@/components/ui/DiceRollModal";
import { ALL_FEATS } from "@/data/feats/feats";
import { Button } from "@/components/ui/button";
import { RACE_CATALOG } from "@/data/races";
import { CLASS_CATALOG } from "@/data/classes";
import { getEffectiveSpeed } from "@/data/races/types";
import { useCharacter } from "@/store/character";
import { useFrameColor } from "@/contexts/FrameColorContext"; 
import { supabase } from "@/lib/supabaseClient";
import AvatarUpload from "@/components/ui/AvatarUpload";

const LIST_KEY = "dnd-ru-characters";

export default function CharacterView() {
    const { id } = useParams();
    const nav = useNavigate();

    // character + local controlled HP state
    const [char, setChar] = useState<any | null>(null);
    const [curHp, setCurHp] = useState<number>(0);
    const [tempHp, setTempHp] = useState<number>(0);

    // Функция для обновления хитов
    const updateHpIfNeeded = () => {
        if (char && char.basics && hpMax > 0) {
            const currentHp = char.basics.hpCurrent;
            // Если hpCurrent равен null или меньше hpMax, обновляем его
            if (currentHp === null || currentHp < hpMax) {
                setCurHp(hpMax);
            }
        }
    };

    // roll log UI
    const [showLog, setShowLog] = useState(false);
    
    // Используем хук для бросков кубиков
    const { draft } = useCharacter();
    const {
        rollLog,
        setRollLog,
        diceModalOpen,
        setDiceModalOpen,
        diceRollData,
        addRoll
    } = useDiceRolls({ 
        characterName: char?.basics.name,
        characterData: draft, // Передаем draft вместо char для доступа к radiantStrikes
        onRollAdded: (logEntry) => {
            // Дополнительная логика при добавлении броска, если нужна
        }
    });


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
                
                // Вычисляем максимальные хиты для установки curHp
                const calculateHpMax = () => {
                    const b = draft.basics;
                    if (!b) return 0;
                    
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
                            const rolls: number[] = Array.isArray(draft.hpRolls) ? draft.hpRolls : [];
                            for (let lvl = 2; lvl <= level; lvl++) {
                                const idx = lvl - 2;
                                const dieValue = rolls[idx] && rolls[idx]! > 0 ? rolls[idx]! : 1;
                                hp += dieValue + conMod;
                            }
                        }
                    }
                    const extra = ((finalStats as any)._extraHp || 0) * level;
                    return Math.max(0, hp + extra);
                };
                
                const hpMax = calculateHpMax();
                // Если hpCurrent равен null или 0, устанавливаем его равным hpMax
                const initialHp = draft.basics?.hpCurrent === null || draft.basics?.hpCurrent === 0 ? hpMax : (draft.basics?.hpCurrent ?? 0);
                setCurHp(initialHp);
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

    // Обновляем curHp при изменении hpMax (например, при повышении уровня)
    useEffect(() => {
        updateHpIfNeeded();
    }, [hpMax, char]);

    // skill profs set (normalized)
    const skillProfs: string[] = Array.isArray(char.skills) ? char.skills : [];

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

    // Handle avatar change
    const handleAvatarChange = async (avatarUrl: string | null) => {
        if (!char) return;
        const updated = { ...char, avatar: avatarUrl };
        setChar(updated);
        
        // Save to Supabase
        try {
            const { error } = await supabase
                .from("characters")
                .update({ data: updated, updated_at: new Date() })
                .eq("id", id);
            if (error) {
                console.error("Ошибка сохранения аватарки:", error);
            }
        } catch (error) {
            console.error("Ошибка сохранения аватарки:", error);
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
    const classInfo = CLASS_CATALOG.find(
        (c) => c.key.toLowerCase() === b.class.toLowerCase()
    );
    const subclassInfo = classInfo?.subclasses.find(
        (s) => s.key.toLowerCase() === b.subclass.toLowerCase()
    );

    return (
        <div className="bg-neutral-900 text-gray-200 min-h-screen p-4 sm:p-6 font-sans flex justify-center">
            <div className="w-full max-w-[1200px] px-1 sm:px-0">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center border-b border-yellow-600 pb-4 mb-6 gap-4">
                    {/* Левая часть: аватар */}
                    <div className="flex flex-col items-center sm:items-start sm:mr-6">
                        <AvatarUpload
                            currentAvatar={char.avatar}
                            onAvatarChange={handleAvatarChange}
                            className="text-yellow-400"
                        />
                    </div>

                    {/* Правая часть: имя + инфо */}
                    <div className="flex flex-col items-start">
                        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-yellow-400">
                            {b.name || "Без имени"}
                        </h1>
                        <div className="mt-2 text-base sm:text-lg italic text-gray-300">
                            {raceInfo?.name || b.race}
                            {b.subrace ? ` (${b.subrace})` : ""} {/* TODO: сюда можно русское имя подрасы */}
                            {" • "}
                            {classInfo?.name || b.class}
                            {subclassInfo?.name ? ` (${subclassInfo.name})` : ""}
                            {" • ур. "}
                            {b.level || 1}

                        </div>
                    </div>
                </div>

                {/* ROW 1 */}
                <div className="grid gap-4 mb-6 grid-cols-1 lg:grid-cols-[620px_240px_320px]">
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
                <div className="grid gap-4 mb-6 -mt-4 grid-cols-1 lg:grid-cols-[300px_300px_240px]">
                    {/* Saving Throws (лево) */}
                    <div className="space-y-4">
                        <SavingThrows
                            stats={finalStats}
                            onRoll={(label, ability, value, type) => addRoll(label, ability, value, type)}
                        />
                        <PassiveSenses stats={finalStats} />
                        {/*<Proficiencies profs={char.profs || {}} />*/}
                    </div>

                    {/* Skills (право от спасбросков) */}
                    <div className="space-y-4">
                        <Skills
                            stats={finalStats}
                            profs={char?.skills || []}
                            expertise={char?.expertise || []}
                            proficiencyBonus={proficiencyBonus}
                            onRoll={addRoll}
                            onToggleProf={(skillKey) => {
                                const currentSkills = char?.skills || [];
                                const updated = currentSkills.includes(skillKey)
                                    ? currentSkills.filter((s: string) => s !== skillKey)
                                    : [...currentSkills, skillKey];

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

                {/* Navigation buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-2">
                    <Button onClick={() => nav(-1)}>Назад</Button>
                </div>

                {/* ROLL LOG (floating bottom-right) */}
                <RollLog rolls={rollLog} show={showLog} onToggle={() => setShowLog((s) => !s)} />

                {/* DICE ROLL MODAL */}
                <DiceRollModal 
                    isOpen={diceModalOpen}
                    onClose={() => setDiceModalOpen(false)}
                    rollData={diceRollData}
                />

            </div>
        </div>
    );
}
