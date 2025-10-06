// /pages/CharacterList.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AbilityScoresEditable from "@/components/characterList/AbilityScoresEditable";
import FrameSettingsButton from "@/components/ui/FrameSettingsButton";
import AvatarFrameWithImage from "@/components/ui/AvatarFrameWithImage";
import { useFrameColor } from "@/contexts/FrameColorContext";
import ProficiencySpeed from "@/components/characterList/ProficiencySpeed";
import HealthBlock from "@/components/characterList/HealthBlock";
import SavingThrows from "@/components/characterList/SavingThrows";
import Skills from "@/components/characterList/Skills";
import PassiveSenses from "@/components/characterList/PassiveSenses";
import Proficiencies from "@/components/characterList/Proficiencies";
import InitiativeAC from "@/components/characterList/InitiativeAC";
import Attacks from "@/components/characterList/Attacks";
import RollLog from "@/components/characterList/RollLog";
import DiceRollModal from "@/components/ui/DiceRollModal";
import { ALL_FEATS } from "@/data/feats/feats";
import { Button } from "@/components/ui/button";
import { RACE_CATALOG } from "@/data/races";
import { CLASS_CATALOG } from "@/data/classes";
import { getEffectiveSpeed } from "@/data/races/types"; 
import { supabase } from "@/lib/supabaseClient";
import { getAllCharacterData } from "@/utils/getAllCharacterData";
import { Armors } from "@/data/items/armors";

const LIST_KEY = "dnd-ru-characters";

export default function CharacterList() {
    const { id } = useParams();
    const nav = useNavigate();

    // character + local controlled HP state
    const [char, setChar] = useState<any | null>(null);
    
    // Обернем setChar для отладки
    let setCharCallCounter = 0;
    const setCharWithLog = (newChar: any | null) => {
        setCharCallCounter++;
        console.log(`setCharWithLog #${setCharCallCounter} called with currency:`, newChar?.basics?.currency);
        console.log(`setCharWithLog #${setCharCallCounter} timestamp:`, new Date().toISOString());
        console.log(`setCharWithLog #${setCharCallCounter} newChar object:`, newChar);
        console.log(`setCharWithLog #${setCharCallCounter} newChar.basics:`, newChar?.basics);
        console.log(`setCharWithLog #${setCharCallCounter} newChar.basics.currency:`, newChar?.basics?.currency);
        console.log(`setCharWithLog #${setCharCallCounter} newChar.basics.currency type:`, typeof newChar?.basics?.currency);
        console.log(`setCharWithLog #${setCharCallCounter} newChar.basics.currency keys:`, Object.keys(newChar?.basics?.currency || {}));
        console.log(`setCharWithLog #${setCharCallCounter} newChar.basics.currency values:`, Object.values(newChar?.basics?.currency || {}));
        console.trace(`setCharWithLog #${setCharCallCounter} call stack`);
        setChar(newChar);
    };
    const [curHp, setCurHp] = useState<number>(0);
    const [tempHp, setTempHp] = useState<number>(0);

    // roll log UI
    const [rollLog, setRollLog] = useState<string[]>([]);
    const [showLog, setShowLog] = useState(false);

    // dice roll modal
    const [diceModalOpen, setDiceModalOpen] = useState(false);
    const [diceRollData, setDiceRollData] = useState<any>(null);

    // frame color from context
    const { frameColor, setFrameColor } = useFrameColor();

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
                    setCharWithLog(null);
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
                
                // Инициализируем equipped если его нет
                if (!draft.equipped) {
                    draft.equipped = {
                        weaponSlot1: [],
                        weaponSlot2: [],
                        activeWeaponSlot: 1,
                        armor: null,
                        shield1: null,
                        shield2: null
                    };
                }
                
                setCharWithLog(draft);
                
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
                setTempHp(draft.basics?.tempHp ?? 0);
            } catch {
                setCharWithLog(null);
            }
        })();
    }, [id]);

    // final stats calculation using getAllCharacterData
    const finalStats = useMemo(() => {
        if (!char) return {};
        
        console.log('CharacterList: calculating finalStats for char:', {
            char,
            timestamp: new Date().toISOString()
        });
        
        // Используем getAllCharacterData для получения всех бонусов
        const characterData = getAllCharacterData(char);
        
        console.log('CharacterList: characterData from getAllCharacterData:', {
            characterData,
            abilityBonuses: characterData.abilityBonuses,
            timestamp: new Date().toISOString()
        });
        
        const keys = ["str", "dex", "con", "int", "wis", "cha"] as const;
        const out: Record<string, number> = {};
        
        keys.forEach((k) => {
            const base = char.stats?.[k] || 0;
            const bonuses = characterData.abilityBonuses?.[k] || 0;
            const total = base + bonuses;
            
            // Применяем ограничения максимума
            const maxVal = characterData.abilityMax?.[k] || 20;
            out[k] = Math.min(maxVal, total);
            
            console.log(`CharacterList: ${k}: base=${base} + bonuses=${bonuses} = ${total}, capped at ${out[k]}`);
        });

        console.log('CharacterList: final finalStats:', {
            finalStats: out,
            timestamp: new Date().toISOString()
        });

        return {
            ...out,
            _extraInitiative: characterData.initiativeBonus || 0,
            _extraSpeed: characterData.speed || 0,
            _extraHp: 0, // TODO: добавить расчет HP если нужно
        };
    }, [char, char?.basics?.currency]);

    // Обновляем curHp при изменении hpMax (например, при повышении уровня)
    useEffect(() => {
        if (char && char.basics) {
            // Вычисляем hpMax здесь, чтобы избежать проблем с порядком хуков
            const b = char.basics;
            const level = b.level || 1;
            const conValue = (finalStats as any).con || 10;
            const conMod = Math.floor((conValue - 10) / 2);
            
            let hp = 0;
            if (b.class === 'barbarian') {
                hp = 12 + conMod;
                for (let i = 2; i <= level; i++) {
                    hp += 7 + conMod; // 1d12 = 7 в среднем
                }
            } else if (b.class === 'fighter' || b.class === 'paladin' || b.class === 'ranger') {
                hp = 10 + conMod;
                for (let i = 2; i <= level; i++) {
                    hp += 6 + conMod; // 1d10 = 6 в среднем
                }
            } else if (b.class === 'bard' || b.class === 'cleric' || b.class === 'druid' || b.class === 'monk' || b.class === 'rogue' || b.class === 'warlock') {
                hp = 8 + conMod;
                for (let i = 2; i <= level; i++) {
                    hp += 5 + conMod; // 1d8 = 5 в среднем
                }
            } else if (b.class === 'sorcerer' || b.class === 'wizard') {
                hp = 6 + conMod;
                for (let i = 2; i <= level; i++) {
                    hp += 4 + conMod; // 1d6 = 4 в среднем
                }
            }
            
            const extra = ((finalStats as any)._extraHp || 0) * level;
            const calculatedHpMax = Math.max(0, hp + extra);
            
            const currentHp = b.hpCurrent;
            // Если hpCurrent равен null, обновляем его до hpMax
            // Если hpCurrent не null, но больше hpMax (например, при понижении уровня), обновляем его
            if (currentHp === null || (currentHp !== null && currentHp > calculatedHpMax)) {
                setCurHp(calculatedHpMax);
                
                // Обновляем hpCurrent в базе данных
                if (char.id) {
                    const updatedChar = {
                        ...char,
                        basics: {
                            ...char.basics,
                            hpCurrent: calculatedHpMax
                        }
                    };
                    
                    // Сохраняем в базу данных
                    supabase.from("characters")
                        .update({ 
                            data: updatedChar,
                            updated_at: new Date()
                        })
                        .eq("id", char.id)
                        .then(({ error }) => {
                            if (error) {
                                console.error('Error updating hpCurrent in database:', error);
                            } else {
                                console.log('Successfully updated hpCurrent in database');
                                // Обновляем локальное состояние
                                setChar(updatedChar);
                            }
                        });
                }
            }
        }
    }, [char, finalStats]);

    // Get all character data including proficiencies
    const characterData = useMemo(() => {
        if (!char) return null;
        console.log('CharacterList: calculating characterData for char:', char);
        console.log('CharacterList: char.basics.currency:', char?.basics?.currency);
        const result = getAllCharacterData(char);
        console.log('CharacterList: characterData result:', result);
        return result;
    }, [char?.basics?.currency, char?.basics?.equipment]);

    // skill profs set (normalized)
    const skillProfs: string[] = Array.isArray(char?.skills) ? char.skills : [];

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

    // Расчет класса брони с учетом доспехов и щитов
    const calculateAC = () => {
        const baseAC = 10; // Базовый AC без доспехов
        const dexValue = (finalStats as any).dex || 10;
        const dexMod = Math.floor((dexValue - 10) / 2);
        
        if (!char?.equipped) return Math.floor(baseAC + dexMod);
        
        const { armor, shield1, shield2 } = char.equipped;
        let totalAC = baseAC;
        
        // Добавляем AC от доспехов - ищем полные данные по имени
        if (armor) {
            const armorData = Armors.find(a => a.name === armor.name);
            if (armorData) {
                totalAC = armorData.baseAC || baseAC;
            } else {
                totalAC = baseAC;
            }
        }
        
        // Добавляем модификатор ловкости (если доспех это позволяет)
        if (!armor) {
            totalAC += dexMod;
        } else {
            const armorData = Armors.find(a => a.name === armor.name);
            if (armorData) {
                if (armorData.category === 'light') {
                    totalAC += dexMod;
                } else if (armorData.category === 'medium') {
                    const maxDex = armorData.maxDexBonus !== undefined ? armorData.maxDexBonus : 2;
                    const dexBonus = Math.min(dexMod, maxDex);
                    totalAC += dexBonus;
                } else if (armorData.category === 'heavy') {
                    const maxDex = armorData.maxDexBonus !== undefined ? armorData.maxDexBonus : 0;
                    const dexBonus = Math.min(dexMod, maxDex);
                    totalAC += dexBonus;
                }
            } else {
                // Если данные доспеха не найдены, добавляем полный модификатор ловкости
                totalAC += dexMod;
            }
        }
        
        // Добавляем бонус от щита только из активного набора
        const activeSlot = char.equipped.activeWeaponSlot || 1;
        if (activeSlot === 1 && shield1) {
            totalAC += 2; // Стандартный бонус щита из первого набора
        }
        if (activeSlot === 2 && shield2) {
            totalAC += 2; // Стандартный бонус щита из второго набора
        }
        
        return Math.floor(totalAC);
    };

    // universal addRoll function: any child can call it
    // Функция для парсинга кубиков урона (например, "1d8+3" или "1d8 +3" -> { dice: "1d8", modifier: 3 })
    const parseDamageDice = (damageString: string) => {
        const match = damageString.match(/^(\d+d\d+)\s*([+-]\d+)?$/);
        if (match) {
            const dice = match[1]; // "1d8"
            const modifier = match[2] ? parseInt(match[2]) : 0; // "+3" или "-1"
            return { dice, modifier };
        }
        return { dice: "1d4", modifier: 0 }; // По умолчанию
    };

    // Функция для броска кубика урона
    const rollDamageDice = (diceString: string) => {
        const { dice, modifier } = parseDamageDice(diceString);
        const [numDice, diceSize] = dice.split('d').map(Number);
        const individualRolls = [];
        let total = 0;
        for (let i = 0; i < numDice; i++) {
            const roll = Math.floor(Math.random() * diceSize) + 1;
            individualRolls.push(roll);
            total += roll;
        }
        const finalResult = total + modifier;
        return { 
            diceRoll: total, 
            finalResult: finalResult, 
            individualRolls: individualRolls,
            dice: dice,
            modifier: modifier
        };
    };

    const addRoll = (desc: string, abilityKey: string, bonus: number, type: string = "", damageString?: string, attackRoll?: number) => {
        const d20 = attackRoll !== undefined ? attackRoll : Math.floor(Math.random() * 20) + 1;
        const total = d20 + bonus;
        
        let entry = "";
        let dice = "d20";
        let diceRoll = d20;
        let modifier = bonus;
        let result = total;
        let individualRolls: number[] = [];

        if (type === "Спасбросок") {
            entry = `${desc.toUpperCase()}: СПАС: ${d20} ${bonus >= 0 ? `+ ${bonus}` : bonus} = ${total}`;
        } else if (desc === "Инициатива") {
            entry = `ИНИЦИАТИВА: БРОСОК: ${d20} ${bonus >= 0 ? `+ ${bonus}` : bonus} = ${total}`;
        } else if (type === "Навык") {
            entry = `${desc.toUpperCase()}: ПРОВЕРКА: ${d20} ${bonus >= 0 ? `+ ${bonus}` : bonus} = ${total}`;
        } else if (type === "Атака") {
            // Для атак: название оружия uppercase: ПОПАДАНИЕ: бросок
            entry = `${desc.toUpperCase()}: ПОПАДАНИЕ: ${d20} ${bonus >= 0 ? `+ ${bonus}` : bonus} = ${total}`;
        } else if (type === "Урон") {
            // Для урона: используем правильный кубик урона
            if (damageString) {
                const { diceRoll: damageDiceRoll, finalResult, individualRolls: damageIndividualRolls, dice: damageDice, modifier: damageModifier } = rollDamageDice(damageString);
                dice = damageDice;
                diceRoll = damageDiceRoll;
                modifier = damageModifier;
                result = finalResult;
                individualRolls = damageIndividualRolls;
                
                if (modifier !== 0) {
                    const individualRollsStr = individualRolls.join('+');
                    const modStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
                    entry = `${desc.toUpperCase()}: УРОН: ${dice}${modStr} = ${individualRollsStr}${modStr} = ${finalResult}`;
                } else {
                    const individualRollsStr = individualRolls.join('+');
                    entry = `${desc.toUpperCase()}: УРОН: ${dice} = ${individualRollsStr} = ${finalResult}`;
                }
            } else {
                // Fallback на d20 если нет строки урона
                entry = `${desc.toUpperCase()}: УРОН: ${d20} ${bonus >= 0 ? `+ ${bonus}` : bonus} = ${total}`;
            }
        } else if (type === "Заклинание") {
            // Для заклинаний: название заклинания uppercase: ЗАКЛИНАНИЕ: бросок
            entry = `${desc.toUpperCase()}: ЗАКЛИНАНИЕ: ${d20} ${bonus >= 0 ? `+ ${bonus}` : bonus} = ${total}`;
        } else {
            // Для характеристик
            entry = `${desc.toUpperCase()}: ПРОВЕРКА: ${d20} ${bonus >= 0 ? `+ ${bonus}` : bonus} = ${total}`;
        }

        // Показываем модальное окно с результатом броска
        const rollData = {
            description: desc,
            dice: dice,
            modifier: modifier,
            result: result,
            diceRoll: diceRoll,
            type: type,
            individualRolls: individualRolls.length > 0 ? 
                individualRolls : 
                undefined
        };
        setDiceRollData(rollData);
        setDiceModalOpen(true);

        setRollLog((prev) => [entry, ...prev].slice(0, 200));
    };

    // Функция переключения активного слота оружия
    const switchWeaponSlot = (slot: number) => {
        setCharWithLog((prev: any) => ({
            ...prev,
            equipped: {
                ...prev.equipped,
                activeWeaponSlot: slot
            }
        }));
    };

    // Функция обновления экипировки
    const updateEquipped = (newEquipped: any) => {
        setCharWithLog((prev: any) => ({
            ...prev,
            equipped: newEquipped
        }));
        
        // Сохраняем изменения в БД сразу после обновления состояния
        setTimeout(() => {
            saveAll(newEquipped);
        }, 50);
    };

    // Функция обновления только equipment (рюкзак)
    const updateEquipment = (newEquipment: any[]) => {
        const updatedChar = {
            ...char,
            basics: {
                ...char.basics,
                equipment: newEquipment
            }
        };
        
        // Сохраняем изменения в БД с обновленными данными
        setTimeout(() => {
            saveAllWithData(updatedChar);
        }, 50);
    };

    const updateCurrency = (newCurrency: any) => {
        console.log('updateCurrency called with:', newCurrency);
        console.trace('updateCurrency call stack');
        
        const updatedChar = {
            ...char,
            basics: {
                ...char.basics,
                currency: newCurrency
            }
        };
        
        console.log('Updated char with currency:', updatedChar.basics.currency);
        
        console.log('setChar called with currency:', updatedChar.basics.currency);
        setCharWithLog(updatedChar);
        
        // Сохраняем изменения в БД с обновленными данными
        setTimeout(() => {
            saveAllWithData(updatedChar);
        }, 50);
    };

    // Save changes back to Supabase with specific data
    const saveAllWithData = async (charData: any) => {
        try {
            if (!charData) return;
            
            const updated = { ...charData };
            updated.basics = { ...updated.basics, hpCurrent: curHp, hpTemp: tempHp };
            updated.skills = skillProfs;
            
            const { error } = await supabase
                .from("characters")
                .update({ data: updated, updated_at: new Date() })
                .eq("id", id);
            if (!error) {
                console.log("Character saved to database successfully");
            } else {
                console.error("Error updating character:", error);
            }
        } catch (error) {
            console.error("Error updating character:", error);
        }
    };

    // Save changes back to Supabase
    const saveAll = async (customEquipped?: any) => {
        try {
            if (!char) return;
            
            const updated = { ...char };
            updated.basics = { ...updated.basics, hpCurrent: curHp, hpTemp: tempHp };
            updated.skills = skillProfs;
            
            // Используем customEquipped если передан, иначе char.equipped
            if (customEquipped) {
                updated.equipped = customEquipped;
            }
            
            const { error } = await supabase
                .from("characters")
                .update({ data: updated, updated_at: new Date() })
                .eq("id", id);
            if (!error) {
                setCharWithLog(updated);
            } else {
                console.error("Error updating character:", error);
            }
        } catch (error) {
            console.error("Error updating character:", error);
        }
    };

    // Handle avatar change
    const handleAvatarChange = async (avatarUrl: string | null) => {
        if (!char) return;
        const updated = { ...char, avatar: avatarUrl };
        setCharWithLog(updated);
        
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

    // Handle HP changes
    const handleHpChange = async (newHp: number) => {
        if (!char) return;
        const updated = { 
            ...char, 
            basics: { 
                ...char.basics, 
                hpCurrent: newHp 
            } 
        };
        setCharWithLog(updated);
        setCurHp(newHp);
        
        // Save to Supabase
        try {
            const { error } = await supabase
                .from("characters")
                .update({ data: updated, updated_at: new Date() })
                .eq("id", id);
            if (error) {
                console.error("Ошибка сохранения здоровья:", error);
            }
        } catch (error) {
            console.error("Ошибка сохранения здоровья:", error);
        }
    };

    // Handle temp HP changes
    const handleTempHpChange = async (newTempHp: number) => {
        if (!char) return;
        const updated = { 
            ...char, 
            basics: { 
                ...char.basics, 
                tempHp: newTempHp 
            } 
        };
        setCharWithLog(updated);
        setTempHp(newTempHp);
        
        // Save to Supabase
        try {
            const { error } = await supabase
                .from("characters")
                .update({ data: updated, updated_at: new Date() })
                .eq("id", id);
            if (error) {
                console.error("Ошибка сохранения временных хитов:", error);
            }
        } catch (error) {
            console.error("Ошибка сохранения временных хитов:", error);
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
                        <AvatarFrameWithImage
                            currentAvatar={char.avatar}
                        />
                    </div>

                    {/* Правая часть: имя + инфо + настройки */}
                    <div className="flex flex-col items-start flex-1">
                        <div className="flex items-center gap-4 w-full">
                            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-yellow-400">
                                {b.name || "Без имени"}
                            </h1>
                            <FrameSettingsButton
                                className="ml-auto"
                            />
                        </div>
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
                    <div className="pt-3">
                        <AbilityScoresEditable
                            stats={finalStats}
                            onRoll={addRoll}
                        />
                    </div>

                    <div>
                        <ProficiencySpeed 
                            proficiencyBonus={proficiencyBonus} 
                            speed={speed}
                            initiative={initiative}
                            ac={calculateAC()}
                        />
                    </div>

                    <div className="pt-3">
                        <HealthBlock
                            curHp={curHp}
                            setCurHp={handleHpChange}
                            tempHp={tempHp}
                            setTempHp={handleTempHpChange}
                            hpMax={hpMax}
                        />
                    </div>
                </div>

                {/* ROW 2: SavingThrows + Skills + Initiative/AC + Attacks */}
                <div className="grid gap-4 mb-6 -mt-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-[300px_300px_600px]">
                    {/* Saving Throws (лево) */}
                    <div className="flex flex-col">
                        <SavingThrows
                            stats={finalStats}
                            onRoll={(label, ability, value, type) => addRoll(label, ability, value, type)}
                        />
                        <div className="mt-4">
                            <PassiveSenses stats={finalStats} />
                        </div>
                        <div className="">
                            <Proficiencies data={characterData} />
                        </div>
                    </div>

                    {/* Skills (право от спасбросков) */}
                    <div className="flex flex-col justify-between">
                        <div className="flex-1 pt-0 pb-0">
                            <Skills
                                stats={finalStats}
                                profs={characterData?.skills || []}
                                proficiencyBonus={proficiencyBonus}
                                onRoll={addRoll}
                                onToggleProf={(skillKey) => {
                                    const currentSkills = characterData?.skills || [];
                                    const updated = currentSkills.includes(skillKey)
                                        ? currentSkills.filter((s: string) => s !== skillKey)
                                        : [...currentSkills, skillKey];

                                    setCharWithLog((prev: any) => ({ ...prev, skills: updated }));
                                }}
                            />
                        </div>
                    </div>

                    {/* Правая колонка: Initiative/AC + Attacks */}
                    <div className="flex flex-col gap-4">
                        {/* Initiative + AC */}
                        <div className="-mt-4">
                            <InitiativeAC
                                initiative={initiative}
                                ac={calculateAC()}
                                dex={(finalStats as any).dex ?? 0}
                                onRoll={addRoll}
                            />
                        </div>

                        {/* Attacks (под инициативой/AC) */}
                        <div>
                <Attacks 
                    attacks={[]} 
                    equipped={char?.equipped}
                    stats={finalStats}
                    proficiencyBonus={proficiencyBonus}
                    classKey={char?.basics?.class}
                    level={char?.basics?.level}
                    onRoll={addRoll}
                    onSwitchWeaponSlot={switchWeaponSlot}
                    onUpdateEquipped={updateEquipped}
                    onUpdateEquipment={updateEquipment}
                    onUpdateCurrency={updateCurrency}
                    setDraft={(updater) => {
                        console.log('setDraft called with char:', char);
                        const updated = updater(char);
                        console.log('setDraft updated char:', updated);
                        // Автоматически сохраняем изменения в БД
                        setTimeout(() => {
                            saveAllWithData(updated);
                        }, 50);
                    }}
                    char={char}
                    setChar={setChar}
                    onSaveAll={saveAll}
                    characterData={characterData}
                />
                        </div>
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
