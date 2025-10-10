import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useCharacter } from "@/store/character";
import { CLASS_CATALOG, CLASS_LABELS } from "@/data/classes";
import type { ClassInfo } from "@/data/classes/types";
import ExitButton from "@/components/ui/ExitButton";
import StepArrows from "@/components/ui/StepArrows";
import CharacterHeader from "@/components/ui/CharacterHeader";
import * as Icons from "@/components/refs/icons";
import { Search } from "lucide-react";
import FeatureBlock from "@/components/ui/FeatureBlock";
import ClassPreviewModal from "@/components/ui/ClassPreviewModal";
import ClassRemoveModal from "@/components/ui/ClassRemoveModal";
import HealthSettingsModal from "@/components/ui/HealthSettingsModal";
import { Spells } from "@/data/spells";
import { getAllCharacterData } from "@/utils/getAllCharacterData";

const ALL_CLASSES = [
    "fighter",
    "rogue",
    "wizard",
    "cleric",
    "ranger",
    "bard",
    "barbarian",
    "monk",
    "paladin",
    "warlock",
    "sorcerer",
    "druid",
];

/**
 * Рассчитывает максимальные хиты согласно правилам D&D
 * @param info - информация о классе
 * @param level - уровень персонажа
 * @param conMod - модификатор Телосложения
 * @param hpMode - режим расчета хитов ("fixed" = среднее значение, "roll" = минимум)
 */
function calcMaxHP(
    info: ClassInfo | undefined,
    level: number,
    conMod: number,
    hpMode: "fixed" | "roll",
    hpRolls?: number[],
    hpPerLevel?: number,
) {
    if (!info || level < 1) return 0;
    
    const hitDie = info.hitDice;
    
    // 1-й уровень: максимум кости хитов + модификатор Телосложения
    let hp = hitDie + conMod;
    
    // 2+ уровни: добавляем хиты за каждый уровень
    if (level > 1) {
        if (hpMode === "fixed") {
            const averageHitDie = Math.ceil(hitDie / 2) + 1;
            hp += (level - 1) * (averageHitDie + conMod);
        } else {
            const rolls = hpRolls || [];
            for (let lvl = 2; lvl <= level; lvl++) {
                const idx = lvl - 2;
                const dieValue = rolls[idx] && rolls[idx]! > 0 ? rolls[idx]! : 1;
                hp += dieValue + conMod;
            }
        }
    }
    
    // Добавляем бонус хитов за уровень от расы/подрасы
    if (hpPerLevel) {
        hp += hpPerLevel * level;
    }
    
    console.log('🔍 calcMaxHP debug:', {
        hitDie,
        level,
        conMod,
        hpMode,
        hpPerLevel,
        baseHp: hitDie + conMod,
        additionalHp: level > 1 ? (hpMode === "fixed" ? (level - 1) * (Math.ceil(hitDie / 2) + 1 + conMod) : 'rolled') : 0,
        raceBonus: hpPerLevel ? hpPerLevel * level : 0,
        totalHp: hp
    });
    
    return hp;
}

export default function ClassPick() {
    const { id } = useParams<{ id: string }>();
    const nav = useNavigate();
    const { draft, setBasics, setLevel, setHpRollAtLevel, resetHpRolls, clearClassChoices, setChosenSpells, removeChosenSpell, loadFromSupabase, isLoading, abilityBonuses, setDraft } = useCharacter();
    
    // Модальные окна
    const [previewClass, setPreviewClass] = useState<string | null>(null);
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
    const [showHealthSettings, setShowHealthSettings] = useState(false);
    
    // Состояние для управления вкладками и сворачиванием
    const [activeTab, setActiveTab] = useState<'features' | 'spells'>('features');
    const [isFeaturesCollapsed, setIsFeaturesCollapsed] = useState(false);
    const [isSpellsCollapsed, setIsSpellsCollapsed] = useState(false);
    
    // Состояние для управления заклинаниями
    const [isPreparedSpellsOpen, setIsPreparedSpellsOpen] = useState(false);
    const [isAddSpellsOpen, setIsAddSpellsOpen] = useState(false);
    const [expandedSpells, setExpandedSpells] = useState<Set<number>>(new Set());
    
    // Состояние для поиска и фильтров заклинаний
    const [spellSearch, setSpellSearch] = useState('');
    const [spellLevelFilter, setSpellLevelFilter] = useState<number | 'all'>('all');
    
    // Получаем подготовленные заклинания из драфта
    const preparedSpells = draft.basics.class ? (draft.chosen.spells[draft.basics.class] || []) : [];
    
    // Загружаем персонажа при редактировании
    useEffect(() => {
        if (id && draft.id !== id && !isLoading) {
            loadFromSupabase(id);
        }
    }, [id, draft.id, loadFromSupabase, isLoading]);

    const info = useMemo(
        () => CLASS_CATALOG.find((c) => c.key === draft.basics.class),
        [draft.basics.class],
    );
    // Получаем данные персонажа для hpPerLevel и финальных характеристик
    const characterData = getAllCharacterData(draft);
    
    // Используем финальное значение Телосложения с учетом бонусов от расы
    const baseConScore = Number(draft.stats?.con) || 10;
    const conBonus = characterData.abilityBonuses.con || 0;
    const conScore = baseConScore + conBonus;
    const conMod = Math.floor((conScore - 10) / 2);
    console.log('🔍 Character data debug:', {
        race: draft.basics.race,
        subrace: draft.basics.subrace,
        hpPerLevel: characterData.hpPerLevel,
        baseConScore,
        conBonus,
        conScore,
        conMod,
        abilityBonuses: characterData.abilityBonuses
    });
    const maxHP = calcMaxHP(info, draft.basics.level, conMod, draft.basics.hpMode || "fixed", draft.hpRolls, characterData.hpPerLevel);

    // Отслеживаем предыдущие значения для определения реальных изменений
    const [prevLevel, setPrevLevel] = useState(draft.basics.level);
    const [prevClass, setPrevClass] = useState(draft.basics.class);
    const [prevHpMode, setPrevHpMode] = useState(draft.basics.hpMode);
    const [prevHpRolls, setPrevHpRolls] = useState(draft.hpRolls);

    // Автоматически устанавливаем hpCurrent равным maxHP только при реальном изменении уровня/класса
    useEffect(() => {
        if (draft.basics.class && maxHP > 0) {
            const levelChanged = prevLevel !== draft.basics.level;
            const classChanged = prevClass !== draft.basics.class;
            const hpModeChanged = prevHpMode !== draft.basics.hpMode;
            const hpRollsChanged = JSON.stringify(prevHpRolls) !== JSON.stringify(draft.hpRolls);
            
            // Обновляем hpCurrent только если что-то реально изменилось
            if (levelChanged || classChanged || hpModeChanged || hpRollsChanged) {
                setBasics({ hpCurrent: maxHP });
            }
            
            // Обновляем предыдущие значения
            setPrevLevel(draft.basics.level);
            setPrevClass(draft.basics.class);
            setPrevHpMode(draft.basics.hpMode);
            setPrevHpRolls(draft.hpRolls);
        }
    }, [draft.basics.class, draft.basics.level, draft.basics.hpMode, draft.hpRolls, maxHP, setBasics, prevLevel, prevClass, prevHpMode, prevHpRolls]);

    const feats = useMemo(() => {
        if (!info) return [];

        const classFeats: { 
            name: string; 
            desc: string; 
            choices?: any[]; 
            featureLevel: number;
            originalIndex: number;
            originalLevel: number;
            isSubclass?: boolean;
            uniqueId: string;
        }[] = [];

        // Фичи класса
        Object.entries(info.features).forEach(([lvl, featsArr]) => {
            featsArr.forEach((f, featIdx) => classFeats.push({ 
                ...f, 
                featureLevel: Number(lvl),
                originalIndex: featIdx,
                originalLevel: Number(lvl),
                uniqueId: `${info.key}-${lvl}-${featIdx}-${f.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`
            }));
        });

        // Фичи подклассов, если выбрана
        const subclass = info.subclasses.find(sc => sc.key === draft.basics.subclass);
        if (subclass) {
            Object.entries(subclass.features || {}).forEach(([lvl, featsArr]) => {
                featsArr.forEach((f, featIdx) => classFeats.push({ 
                    ...f, 
                    featureLevel: Number(lvl),
                    originalIndex: featIdx,
                    originalLevel: Number(lvl),
                    isSubclass: true,
                    uniqueId: `${info.key}-subclass-${subclass.key}-${lvl}-${featIdx}-${f.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`
                }));
            });
        }

        // Можно отсортировать по уровню
        classFeats.sort((a, b) => a.featureLevel - b.featureLevel);

        return classFeats;
    }, [info, draft.basics.subclass]);

    // Показываем загрузку если контекст еще не готов
    if (isLoading) {
        return <div className="p-4">Загрузка...</div>;
    }

    const handleClassClick = (classKey: string) => {
        // Если класс уже выбран, не показываем превью
        if (draft.basics.class === classKey) return;
        
        // Показываем превью класса
        setPreviewClass(classKey);
    };

    const handleAddClass = () => {
        if (previewClass) {
            setBasics({ class: previewClass });
            setPreviewClass(null);
        }
    };

    const handleCancelPreview = () => {
        setPreviewClass(null);
    };

    const handleRemoveClass = () => {
        clearClassChoices(); // clearClassChoices уже сбрасывает уровень на 1
        setShowRemoveConfirm(false);
    };

    // Функция для очистки данных при понижении уровня
    const cleanupOnLevelDecrease = (newLevel: number) => {
        if (!info) return;
        

        // Создаем функцию для очистки выборов по уровню
        const cleanupChoicesByLevel = (choices: any, targetLevel: number) => {
            const cleaned = { ...choices };
            const currentClass = info.key;
            
            // Очищаем выборы для уровней выше targetLevel
            Object.keys(cleaned).forEach(key => {
                // Проверяем разные паттерны ключей:
                // 1. Стандартный паттерн: class-level-choice
                const standardMatch = key.match(/-(\d+)-/);
                // 2. Паттерн особенностей: class-level-featureIndex-featureName
                const featureMatch = key.match(new RegExp(`^${currentClass}-(\\d+)-\\d+-`));
                // 3. Паттерн подклассов: class-subclass-subclassName-level-featureIndex-featureName
                const subclassMatch = key.match(new RegExp(`^${currentClass}-subclass-\\w+-(\\d+)-`));
                
                let level = -1;
                if (standardMatch) {
                    level = parseInt(standardMatch[1]);
                } else if (featureMatch) {
                    level = parseInt(featureMatch[1]);
                } else if (subclassMatch) {
                    level = parseInt(subclassMatch[1]);
                }
                
                if (level > targetLevel && (key.startsWith(`${currentClass}-`) || key.startsWith('class-'))) {
                    delete cleaned[key];
                }
            });
            
            return cleaned;
        };

        // Функция для очистки вложенных выборов особенностей
        const cleanupNestedFeatureChoices = (choices: any, targetLevel: number) => {
            const cleaned = { ...choices };
            const currentClass = info.key;
            
            // Находим все ключи особенностей для уровней выше targetLevel
            const featureKeysToRemove: string[] = [];
            
            Object.keys(cleaned).forEach(key => {
                const featureMatch = key.match(new RegExp(`^${currentClass}-(\\d+)-\\d+-`));
                if (featureMatch) {
                    const level = parseInt(featureMatch[1]);
                    if (level > targetLevel) {
                        featureKeysToRemove.push(key);
                    }
                }
            });
            
            // Удаляем все вложенные выборы для найденных особенностей
            featureKeysToRemove.forEach(featureKey => {
                // Удаляем саму особенность
                delete cleaned[featureKey];
                
                // Извлекаем название особенности из ключа (например, "boevoystil" из "paladin-2-0-boevoystil")
                const featureNameMatch = featureKey.match(new RegExp(`^${currentClass}-\\d+-\\d+-(.+)$`));
                if (featureNameMatch) {
                    const featureName = featureNameMatch[1];
                    
                    // Удаляем вложенные выборы с ключами типа "feature-{featureName}"
                    Object.keys(cleaned).forEach(key => {
                        if (key === `feature-${featureName}`) {
                            delete cleaned[key];
                        }
                    });
                } else {
                    // Если название особенности пустое (например, "paladin-2-0-"), 
                    // удаляем все ключи, начинающиеся с "feature-"
                    Object.keys(cleaned).forEach(key => {
                        if (key.startsWith('feature-')) {
                            delete cleaned[key];
                        }
                    });
                }
            });
            
            return cleaned;
        };

        // 1. Очищаем выборы класса по уровням
        const cleanedAbilitiesBase = cleanupChoicesByLevel(draft.chosen.abilities, newLevel);
        const cleanedSkills = cleanupChoicesByLevel(draft.chosen.skills, newLevel);
        const cleanedTools = cleanupChoicesByLevel(draft.chosen.tools, newLevel);
        const cleanedToolProficiencies = cleanupChoicesByLevel(draft.chosen.toolProficiencies, newLevel);
        const cleanedLanguages = cleanupChoicesByLevel(draft.chosen.languages, newLevel);
        // Очищаем особенности и вложенные выборы
        const cleanedFeatures = cleanupNestedFeatureChoices(draft.chosen.features, newLevel);
        
        // Очищаем вложенные выборы из fightingStyle и weaponMastery
        const cleanedFightingStyle = { ...draft.chosen.fightingStyle };
        const cleanedWeaponMastery = { ...draft.chosen.weaponMastery };
        
        // Находим все особенности для удаления и удаляем связанные вложенные выборы
        Object.keys(draft.chosen.features || {}).forEach(key => {
            const featureMatch = key.match(new RegExp(`^${info.key}-(\\d+)-\\d+-`));
            if (featureMatch) {
                const level = parseInt(featureMatch[1]);
                if (level > newLevel) {
                    // Удаляем все ключи, начинающиеся с "feature-" из всех типов выборов
                    Object.keys(cleanedFightingStyle).forEach(fightingKey => {
                        if (fightingKey.startsWith('feature-')) {
                            delete cleanedFightingStyle[fightingKey];
                        }
                    });
                    
                    Object.keys(cleanedWeaponMastery).forEach(weaponKey => {
                        if (weaponKey.startsWith('feature-')) {
                            delete cleanedWeaponMastery[weaponKey];
                        }
                    });
                }
            }
        });

        // 2. Очищаем подготовленные заклинания, которые выходят за лимит
        const currentPreparedSpells = draft.chosen.spells[info.key] || [];
        
        // Получаем заклинания, которые должны быть доступны через особенности класса на новом уровне
        const classSpellsFromFeatures = getClassSpellsFromFeatures(info, newLevel);
        
        // Рассчитываем лимит подготовленных заклинаний для нового уровня
        const preparedLimit = getPreparedSpellsLimit(info, newLevel, draft.stats?.cha || 10);
        
        // Разделяем заклинания на полученные через особенности и обычные
        const featureSpells: string[] = [];
        const regularSpells: string[] = [];
        
        currentPreparedSpells.forEach((spell: any) => {
            const spellName = typeof spell === 'string' ? spell : spell.name;
            
            if (classSpellsFromFeatures.includes(spellName)) {
                featureSpells.push(spellName);
            } else {
                regularSpells.push(spellName);
            }
        });
        
        // Рассчитываем лимит для текущего уровня персонажа
        const currentPreparedLimit = getPreparedSpellsLimit(info, draft.basics.level, draft.stats?.cha || 10);
        
        let validSpells: string[] = [];
        
        // Убираем заклинания ТОЛЬКО если лимит уменьшился
        if (preparedLimit < currentPreparedLimit) {
            const limitDifference = currentPreparedLimit - preparedLimit;
            
            // Убираем только то количество заклинаний, на которое уменьшился лимит
            // НЕ убираем все заклинания сверх нового лимита
            const spellsToRemove = limitDifference;
            const validRegularSpells = regularSpells.slice(0, regularSpells.length - spellsToRemove);
            
            validSpells = [...featureSpells, ...validRegularSpells];
        } else {
            // Если лимит не изменился или увеличился - оставляем все заклинания
            validSpells = [...featureSpells, ...regularSpells];
        }

        // 3. Проверяем, правильно ли удаляются особенности при понижении уровня
        const cleanedSpells = { ...draft.chosen.spells };

        // 4. Очищаем ASI черты из draft.chosen.feats для уровней выше нового
        console.log('🧹 Очистка ASI черт:', {
            currentLevel: draft.basics.level,
            newLevel,
            classKey: info.key,
            allFeats: draft.chosen.feats,
            willDecrease: draft.basics.level > newLevel
        });
        
        // Также очищаем выборы характеристик для ASI особенностей уровней выше нового
        const cleanedAbilitiesForAsi = { ...draft.chosen.abilities };
        Object.keys(cleanedAbilitiesForAsi).forEach(abilityKey => {
            let shouldDelete = false;
            
            // Проверяем формат class-level-index- (например, paladin-4-0-)
            const levelMatch = abilityKey.match(new RegExp(`^${info.key}-(\\d+)-`));
            if (levelMatch) {
                const level = parseInt(levelMatch[1]);
                if (level > newLevel) {
                    console.log('🗑️ Удаляем выборы характеристик для ASI уровня (формат class-level):', abilityKey, level);
                    shouldDelete = true;
                }
            }
            
            // Проверяем формат feat:ability-score-improvement:effect-* для ASI уровней
            if (abilityKey.startsWith('feat:ability-score-improvement:effect-')) {
                // Проверяем, есть ли соответствующая ASI черта для уровня выше нового
                const hasAsiFeatAboveLevel = draft.chosen.feats.some(featKey => {
                    const match = featKey.match(new RegExp(`^${info.key}-(\\d+)-\\d+--\\d+:ability-score-improvement$`));
                    if (match) {
                        const level = parseInt(match[1]);
                        return level > newLevel;
                    }
                    return false;
                });
                
                if (hasAsiFeatAboveLevel) {
                    console.log('🗑️ Удаляем выборы характеристик для ASI черты (формат feat:):', abilityKey);
                    shouldDelete = true;
                }
            }
            
            if (shouldDelete) {
                delete cleanedAbilitiesForAsi[abilityKey];
            }
        });
        
        // Объединяем очистку обычных выборов характеристик с очисткой ASI выборов
        const cleanedAbilities = { ...cleanedAbilitiesBase, ...cleanedAbilitiesForAsi };
        
        // Подробно показываем каждую черту
        draft.chosen.feats.forEach((feat, index) => {
            console.log(`📋 Черта ${index}:`, {
                featKey: feat,
                length: feat.length,
                parts: feat.split(':'),
                matchResult: feat.match(/^(\w+)-(\d+)-(\d+)--(\d+):(.+)$/)
            });
        });
        
        const cleanedFeats = draft.chosen.feats.filter(featKey => {
            // Проверяем, является ли это ASI чертой для уровня выше нового
            // Формат: paladin-4-0--0:great-weapon-master (с двойным дефисом)
            const match = featKey.match(/^(\w+)-(\d+)-(\d+)--(\d+):(.+)$/);
            if (match) {
                const [, classKey, levelStr, idxStr1, idxStr2, featName] = match;
                const level = parseInt(levelStr);
                console.log('🔍 Проверяем черту:', {
                    featKey,
                    classKey,
                    level,
                    featName,
                    isCurrentClass: classKey === info.key,
                    isLevelAbove: level > newLevel,
                    shouldRemove: classKey === info.key && level > newLevel
                });
                // Если это черта от ASI особенности класса и уровень выше нового
                if (classKey === info.key && level > newLevel) {
                    console.log('❌ Удаляем черту:', featKey);
                    return false; // Удаляем эту черту
                }
            }
            return true; // Оставляем все остальные черты
        });
        
        console.log('✅ Результат очистки черт:', {
            originalCount: draft.chosen.feats.length,
            cleanedCount: cleanedFeats.length,
            removedCount: draft.chosen.feats.length - cleanedFeats.length,
            originalFeats: draft.chosen.feats,
            cleanedFeats,
            willDecrease: draft.basics.level > newLevel,
            currentLevel: draft.basics.level,
            newLevel
        });

        // 5. Очищаем броски HP для уровней выше нового
        let validHpRolls: number[] = [];
        if (draft.hpRolls && draft.hpRolls.length > newLevel - 1) {
            validHpRolls = draft.hpRolls.slice(0, newLevel - 1);
        }

        // Применяем все изменения через setDraft
        setDraft(d => ({
            ...d,
            chosen: {
                ...d.chosen,
                abilities: cleanedAbilities,
                skills: cleanedSkills,
                tools: cleanedTools,
                toolProficiencies: cleanedToolProficiencies,
                languages: cleanedLanguages,
                features: cleanedFeatures,
                fightingStyle: cleanedFightingStyle,
                weaponMastery: cleanedWeaponMastery,
                feats: cleanedFeats,
                spells: {
                    ...cleanedSpells,
                    [info.key]: validSpells
                }
            },
            hpRolls: validHpRolls
        }));
    };

    // Функция для получения максимального уровня заклинаний для данного уровня класса
    const getMaxSpellLevelForLevel = (classInfo: ClassInfo, level: number) => {
        if (!classInfo.spellcasting) return 0;
        
        const levelSlots = classInfo.spellcasting.progression[level as keyof typeof classInfo.spellcasting.progression];
        if (!levelSlots) return 0;
        
        return levelSlots.slots.length;
    };

    // Функция для получения заклинаний из особенностей класса на определенном уровне
    const getClassSpellsFromFeatures = (classInfo: ClassInfo, maxLevel: number) => {
        const spells: string[] = [];
        
        // Проходим по всем уровням от 1 до maxLevel
        for (let level = 1; level <= maxLevel; level++) {
            const features = classInfo.features[level as keyof typeof classInfo.features];
            if (features) {
                features.forEach(feature => {
                    // Проверяем, есть ли у особенности поле spells
                    if ((feature as any).spells && Array.isArray((feature as any).spells)) {
                        spells.push(...(feature as any).spells);
                    }
                });
            }
        }
        
        return spells;
    };

    // Функция для расчета лимита подготовленных заклинаний
    const getPreparedSpellsLimit = (classInfo: ClassInfo, level: number, chaScore: number) => {
        if (!classInfo.spellcasting || !classInfo.spellcasting.preparedFormula) {
            return 0;
        }
        
        const chaMod = Math.floor((chaScore - 10) / 2);
        
        // Вычисляем формулу: Math.max(1, chaMod + Math.floor(level / 2))
        const limit = Math.max(1, chaMod + Math.floor(level / 2));
        
        return limit;
    };


    const hasSelectedClass = Boolean(draft.basics.class);

    // Функции для обработки кликов по заголовкам
    const handleFeaturesClick = () => {
        if (activeTab === 'features') {
            // Если вкладка уже активна, сворачиваем/разворачиваем
            setIsFeaturesCollapsed(!isFeaturesCollapsed);
        } else {
            // Если вкладка не активна, переключаемся и разворачиваем
            setActiveTab('features');
            setIsFeaturesCollapsed(false);
        }
    };

    const handleSpellsClick = () => {
        if (activeTab === 'spells') {
            // Если вкладка уже активна, сворачиваем/разворачиваем
            setIsSpellsCollapsed(!isSpellsCollapsed);
        } else {
            // Если вкладка не активна, переключаемся и разворачиваем
            setActiveTab('spells');
            setIsSpellsCollapsed(false);
        }
    };

    // Функция для переключения состояния карточки заклинания
    const toggleSpellExpansion = (index: number) => {
        setExpandedSpells(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    // Функция для форматирования компонентов заклинания
    const formatComponents = (components: string[]) => {
        return components.map(comp => {
            switch (comp) {
                case 'В': return 'Вербальный';
                case 'С': return 'Соматический';
                case 'М': return 'Материальный';
                default: return comp;
            }
        }).join(', ');
    };

    // Функция для перевода английских ключей спасбросков в русские названия
    const translateSave = (saveKey: string) => {
        switch (saveKey.toLowerCase()) {
            case 'str': return 'Сила';
            case 'dex': return 'Ловкость';
            case 'con': return 'Телосложение';
            case 'int': return 'Интеллект';
            case 'wis': return 'Мудрость';
            case 'cha': return 'Харизма';
            default: return saveKey; // Если ключ не найден, возвращаем как есть
        }
    };

    // Компонент для отображения поля заклинания
    const SpellField = ({ label, value }: { label: string; value: string }) => (
        <div className="py-1">
            <span className="font-medium text-foreground text-xs">{label}: </span>
            <span className="text-muted-foreground text-xs">{value}</span>
        </div>
    );

    // Функция для форматирования описания с markdown
    const formatSpellDescription = (text: string) => {
        if (!text) return '';
        
        // Заменяем \n\n на параграфы
        const paragraphs = text.split('\n\n').map((paragraph, index) => {
            if (!paragraph.trim()) return null;
            
            // Обрабатываем курсив *текст* как жирный курсив
            const formattedParagraph = paragraph.replace(/\*([^*]+)\*/g, '<em class="italic font-bold">$1</em>');
            
            return (
                <p key={index} className="mb-2 last:mb-0">
                    <span dangerouslySetInnerHTML={{ __html: formattedParagraph }} />
                </p>
            );
        }).filter(Boolean);
        
        return paragraphs;
    };

    // Компонент для отображения описания заклинания
    const SpellDescription = ({ spell }: { spell: any }) => (
        <div className="space-y-2">
            {/* Основные поля */}
            <div className="-space-y-2">
                {spell.castingTime && <SpellField label="Время сотворения" value={spell.castingTime} />}
                {spell.range && <SpellField label="Дистанция" value={spell.range} />}
                {spell.components && spell.components.length > 0 && (
                    <SpellField label="Компоненты" value={formatComponents(spell.components)} />
                )}
                {spell.duration && <SpellField label="Длительность" value={spell.duration} />}
                {spell.heal && <SpellField label="Лечение" value={spell.heal} />}
                {spell.damage?.dice && <SpellField label="Урон" value={spell.damage.dice} />}
                {spell.damage?.type && <SpellField label="Тип урона" value={spell.damage.type} />}
                {spell.save && <SpellField label="Спасбросок" value={translateSave(spell.save)} />}
                {spell.source && <SpellField label="Источник" value={spell.source} />}
            </div>
            
            {/* Разделитель */}
            <div className="border-t border-border my-2"></div>
            
            {/* Описание */}
            {spell.desc && (
                <div className="text-xs text-muted-foreground leading-relaxed">
                    {formatSpellDescription(spell.desc)}
                </div>
            )}
        </div>
    );

    // Функция для расчета максимального количества подготовленных заклинаний
    const getMaxPreparedSpells = () => {
        if (!info?.spellcasting) return 0;
        
        // Получаем формулу из данных класса (приоритет: уровень -> класс -> умолчание)
        const levelSlots = info.spellcasting.progression[draft.basics.level as keyof typeof info.spellcasting.progression];
        const formula = levelSlots?.prepared || info.spellcasting.preparedFormula || "Math.max(1, level + chaMod)";
        
        // Получаем модификатор основной характеристики из финальных данных
        const abilityKey = info.spellcasting.ability;
        const baseAbilityScore = Number(draft.stats?.[abilityKey]) || 10;
        const abilityBonus = abilityBonuses?.[abilityKey] || 0;
        const finalAbilityScore = baseAbilityScore + abilityBonus;
        const abilityMod = Math.floor((finalAbilityScore - 10) / 2);
        
        // Выполняем формулу из данных класса
        const level = draft.basics.level;
        const chaMod = abilityMod; // Для паладина это chaMod
        
        try {
            // Безопасное выполнение формулы
            const processedFormula = formula
                .replace(/level/g, level.toString())
                .replace(/chaMod/g, chaMod.toString());
            
            // eslint-disable-next-line no-eval
            return Math.max(1, eval(processedFormula));
        } catch (error) {
            console.error('Ошибка в формуле подготовленных заклинаний:', error);
            return 1; // Fallback значение
        }
    };

    // Функция для получения информации о слотах заклинаний
    const getSpellSlotsInfo = () => {
        if (!info?.spellcasting) return null;
        
        const levelSlots = info.spellcasting.progression[draft.basics.level as keyof typeof info.spellcasting.progression];
        if (!levelSlots) return null;
        
        return {
            slots: levelSlots.slots,
            maxLevel: levelSlots.slots.length,
            totalSlots: levelSlots.slots.reduce((sum, count) => sum + count, 0)
        };
    };

    // Функция для получения доступных заклинаний класса
    const getAvailableSpells = () => {
        if (!info?.spellcasting) return [];
        
        // Получаем доступные слоты заклинаний для текущего уровня
        const levelSlots = info.spellcasting.progression[draft.basics.level as keyof typeof info.spellcasting.progression];
        if (!levelSlots) return [];
        
        // Определяем максимальный уровень заклинаний, доступный на текущем уровне
        const maxSpellLevel = levelSlots.slots.length;
        
        // Фильтруем заклинания по классу и уровню
        return Spells.filter((spell) => 
            spell.classes && 
            spell.classes.includes(info.key) &&
            spell.level <= maxSpellLevel
        );
    };

    // Функция для фильтрации заклинаний по поиску и уровню
    const getFilteredSpells = () => {
        let spells = getAvailableSpells();
        
        // Фильтр по поиску
        if (spellSearch.trim()) {
            spells = spells.filter(spell => 
                spell.name.toLowerCase().includes(spellSearch.toLowerCase())
            );
        }
        
        // Фильтр по уровню
        if (spellLevelFilter !== 'all') {
            spells = spells.filter(spell => spell.level === spellLevelFilter);
        }
        
        return spells;
    };

    // Функция для получения доступных уровней заклинаний
    const getAvailableSpellLevels = () => {
        const spells = getAvailableSpells();
        const levels = [...new Set(spells.map(spell => spell.level))].sort((a, b) => a - b);
        return levels;
    };

    return (
        <div className="container mx-auto py-10">
            <div className="mx-auto max-w-5xl relative overflow-visible">
                <StepArrows
                    back={`/create/${id}`}
                    next={`/create/${id}/background`}
                />
                <ExitButton />

                {/* Шапка с именем и аватаркой */}
                <CharacterHeader />

                {/* Заголовок - показываем только до выбора класса */}
                {!hasSelectedClass && (
                    <div className="mb-6">
                        <h1 className="text-base font-bold uppercase tracking-wider text-foreground mb-3 border-l-2 border-primary pl-2">
                            ВЫБОР КЛАССА
                        </h1>
                    </div>
                )}

                {/* Заголовок после выбора класса */}
                {hasSelectedClass && (
                    <div className="mb-6">
                        <h1 className="text-base font-bold uppercase tracking-wider text-foreground mb-3 border-l-2 border-primary pl-2">
                            ВЫБОР КЛАССА
                        </h1>
                        <div className="text-[15px] font-semibold">
                            УРОВЕНЬ ПЕРСОНАЖА: <span className="text-primary">{draft.basics.level}</span>
                    </div>
                </div>
                )}

                {/* Class grid */}
                <div className={hasSelectedClass ? "flex gap-4" : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"}>
                    {/* Карточка класса - фиксированного размера */}
                    <div className={hasSelectedClass ? "w-80" : "contents"}>
                    {ALL_CLASSES.map((k) => {
                        const c = CLASS_CATALOG.find((x) => x.key === k)!;
                        const isSelected = draft.basics.class === k;
                            
                            // Если класс выбран, показываем только его
                            if (hasSelectedClass && !isSelected) return null;
                       
                        return (
                            <button
                                key={k}
                                    onClick={() => handleClassClick(k)}
                                    disabled={isSelected}
                                    className={`text-left rounded-xl border bg-card transition hover:shadow-md hover:scale-[1.01] relative min-h-[100px] ${isSelected
                                        ? "border-2 border-primary shadow-lg scale-[1.02] bg-gradient-to-b from-primary/5 to-transparent"
                                        : ""
                                    }`}
                            >
                                <div className="flex items-center">
                                    <img
                                        src={`/assets/class-avatars/${c.key}.png`}
                                        alt={CLASS_LABELS[c.key] || c.key}
                                        className="ml-2 h-20 w-20 object-cover rounded-md flex-shrink-0 border"
                                        onError={(e) => {
                                            e.currentTarget.src = "/assets/class-avatars/default.png";
                                        }}
                                    />
                                    <div className="flex-1 pl-3 pr-2 py-4">
                                        <div className="flex items-center justify-between">
                                            <h3
                                                className={`font-medium tracking-wide ${isSelected ? "text-primary font-bold" : ""
                                                    }`}
                                            >
                                                {CLASS_LABELS[c.key] || c.key}
                                            </h3>
                                            {isSelected && (
                                                <div className="absolute right-2 top-2 text-primary">
                                                    <Icons.Crown className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {c.desc}
                                        </p>
                                    </div>
                                </div>
                                    
                                    {/* Красный крестик для удаления */}
                                    {isSelected && (
                                        <div
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setShowRemoveConfirm(true);
                                            }}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                            className="absolute right-2 bottom-2 p-1 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors cursor-pointer"
                                            title="Убрать класс"
                                        >
                                            <Icons.X className="w-4 h-4" />
                                        </div>
                                    )}
                            </button>
                        );
                    })}
                    </div>

                    {/* Кнопки уровня справа от карточки класса */}
                    {hasSelectedClass && (
                        <div className="flex flex-col justify-center gap-2">
                            <button
                                onClick={() => setLevel(Math.min(20, draft.basics.level + 1))}
                                className="w-8 h-8 rounded-lg border border-border bg-background hover:bg-muted transition-colors disabled:opacity-50 flex items-center justify-center"
                                disabled={draft.basics.level >= 20}
                                title="Повысить уровень"
                            >
                                <Icons.ArrowUp className="w-4 h-4 text-foreground" />
                            </button>
                            <div className="text-sm text-muted-foreground w-8 text-center">
                                {draft.basics.level}
                            </div>
                            <button
                                onClick={() => {
                                    const newLevel = Math.max(1, draft.basics.level - 1);
                                    if (newLevel < draft.basics.level) {
                                        cleanupOnLevelDecrease(newLevel);
                                    }
                                    setLevel(newLevel);
                                }}
                                className="w-8 h-8 rounded-lg border border-border bg-background hover:bg-muted transition-colors disabled:opacity-50 flex items-center justify-center"
                                disabled={draft.basics.level <= 1}
                                title="Понизить уровень"
                            >
                                <Icons.ArrowDown className="w-4 h-4 text-foreground" />
                            </button>
                        </div>
                    )}

                    {/* Блок здоровья (справа) */}
                    {hasSelectedClass && info && (
                        <Card className="w-fit border bg-card shadow-md min-h-[100px]">
                            <CardContent className="p-4 relative h-full flex flex-col justify-center">
                                <button
                                    onClick={() => setShowHealthSettings(true)}
                                    className="absolute top-2 right-2 p-1 rounded hover:bg-muted transition-colors"
                                    title="Настройки здоровья"
                                >
                                    <Icons.Settings className="w-4 h-4 text-muted-foreground" />
                                </button>
                                
                                <div className="text-left pr-8">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-sm text-muted-foreground">Здоровье: </span>
                                        <span className="text-sm text-muted-foreground">{maxHP}</span>
                                    </div>
                                    
                                    <div className="text-sm text-muted-foreground">
                                        Кость хитов: d{info.hitDice}
                                    </div>
                                    
                                    <Icons.Heart className="w-4 h-4 text-red-500 absolute bottom-2 right-2" />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Информация о выбранном классе */}
                {info && hasSelectedClass && (
                    <Card className="mt-6 overflow-hidden border bg-card shadow-md">
                        <CardHeader className="border-b pb-3">
                            <CardTitle className="text-xl font-bold tracking-wide">
                                {CLASS_LABELS[info.key] || info.key}
                            </CardTitle>
                            {info.longDesc ? (
                                <p className="mt-1 text-sm text-muted-foreground italic leading-relaxed whitespace-pre-line">
                                    {info.longDesc}
                                </p>
                            ) : (
                                <p className="mt-1 text-sm text-muted-foreground italic leading-relaxed">
                                    {info.desc}
                                </p>
                            )}
                        </CardHeader>

                        <CardContent className="space-y-6 pt-6">
                            {/* Заголовки вкладок */}
                            <div className="flex items-center gap-6 mb-3">
                                        <button
                                    onClick={handleFeaturesClick}
                                    className={`flex items-center gap-2 text-base font-bold uppercase tracking-wider border-l-2 pl-2 transition-colors ${
                                        activeTab === 'features'
                                            ? 'text-foreground border-primary'
                                            : 'text-muted-foreground border-transparent hover:text-foreground'
                                    }`}
                                >
                                    <span>Особенности</span>
                                    <Icons.ChevronDown 
                                        className={`w-4 h-4 transition-transform ${
                                            activeTab === 'features' && !isFeaturesCollapsed ? 'rotate-180' : ''
                                        }`} 
                                    />
                                        </button>
                                
                                        <button
                                    onClick={handleSpellsClick}
                                    className={`flex items-center gap-2 text-base font-bold uppercase tracking-wider border-l-2 pl-2 transition-colors ${
                                        activeTab === 'spells'
                                            ? 'text-foreground border-primary'
                                            : 'text-muted-foreground border-transparent hover:text-foreground'
                                    }`}
                                >
                                    <span>Заклинания</span>
                                    <Icons.ChevronDown 
                                        className={`w-4 h-4 transition-transform ${
                                            activeTab === 'spells' && !isSpellsCollapsed ? 'rotate-180' : ''
                                        }`} 
                                    />
                                        </button>
                            </div>

                            {/* Контент вкладки особенностей */}
                            {activeTab === 'features' && !isFeaturesCollapsed && (
                            <div className="grid grid-cols-1 gap-4">
                                {feats.map((f, idx) => (
                                    <FeatureBlock
                                        key={f.uniqueId}
                                        name={f.name}
                                        desc={f.desc}
                                        featureLevel={f.featureLevel}
                                        source="class"
                                        idx={idx}
                                        choices={f.choices}
                                        originalIndex={f.originalIndex}
                                        originalLevel={f.originalLevel}
                                        isSubclass={f.isSubclass}
                                        uniqueId={f.uniqueId}
                                            classInfo={info}
                                    />
                                ))}
                            </div>
                            )}
                            
                            {/* Контент вкладки заклинаний */}
                            {activeTab === 'spells' && !isSpellsCollapsed && (
                                <div className="space-y-4">
                                    
                                    {/* Шапка "Подготовленные Заклинания" */}
                                    <div className="border rounded-lg">
                                        <button
                                            onClick={() => setIsPreparedSpellsOpen(!isPreparedSpellsOpen)}
                                            className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                                        >
                                            <span className="font-semibold">Подготовленные Заклинания</span>
                                            <Icons.ChevronDown 
                                                className={`w-5 h-5 transition-transform ${isPreparedSpellsOpen ? 'rotate-180' : ''}`} 
                                            />
                                        </button>
                                        
                                        {isPreparedSpellsOpen && (
                                            <div className="px-4 pb-4 border-t">
                                                {preparedSpells.length === 0 ? (
                                                    <p className="text-muted-foreground py-4">
                                                        Подготовленные заклинания отсутствуют
                                                    </p>
                                                ) : (
                                                    <div className="py-4 space-y-2">
                                                        {preparedSpells.map((spellKey, index) => {
                                                            // Находим полную информацию о заклинании
                                                            const spell = getAvailableSpells().find(s => s.key === spellKey);
                                                            if (!spell) return null;
                                                            
                                                            const isExpanded = expandedSpells.has(-index - 1); // Используем отрицательные числа для подготовленных заклинаний
                                                            
                                                            return (
                                                                <div key={index} className="border rounded-lg bg-muted/30">
                                                                    {/* Шапка карточки */}
                                                                    <div className="flex items-center justify-between p-3">
                                                                        <button
                                                                            onClick={() => toggleSpellExpansion(-index - 1)}
                                                                            className="flex-1 text-left hover:bg-muted/50 rounded transition-colors"
                                                                        >
                                                                            <div className="font-medium text-base flex items-center gap-2">
                                                                                {spell.name}
                                                                                {/* Индикаторы */}
                                                                                <div className="flex gap-1">
                                                                                    {spell.needConcentration && (
                                                                                        <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded font-medium">
                                                                                            К
                                                                                        </span>
                                                                                    )}
                                                                                    {spell.isRitual && (
                                                                                        <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded font-medium">
                                                                                            Р
                                                                                        </span>
                )}
            </div>
                                                                            </div>
                                                                            <div className="text-sm text-muted-foreground mt-1">
                                                                                {spell.isLegacy ? (
                                                                                    <>
                                                                                        <span style={{ color: '#b59e54' }}>Legacy</span>
                                                                                        <span> • </span>
                                                                                    </>
                                                                                ) : null}
                                                                                {spell.level}-й уровень • {spell.school}
                                                                            </div>
                                                                        </button>
                                                                        <div className="flex items-center gap-2 ml-3">
                                                                            <button
                                                                                onClick={() => {
                                                                                    if (draft.basics.class) {
                                                                                        const newSpells = preparedSpells.filter((_, i) => i !== index);
                                                                                        setChosenSpells(draft.basics.class, newSpells);
                                                                                    }
                                                                                }}
                                                                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-500/10 rounded transition-colors"
                                                                                title="Удалить заклинание"
                                                                            >
                                                                                <Icons.X className="w-4 h-4" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => toggleSpellExpansion(-index - 1)}
                                                                                className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted/50 transition-colors"
                                                                                title={isExpanded ? "Свернуть" : "Развернуть"}
                                                                            >
                                                                                <Icons.ChevronDown 
                                                                                    className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                                                                                />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {/* Описание заклинания */}
                                                                    {isExpanded && (
                                                                        <div className="px-3 pb-3 border-t bg-muted/20">
                                                                            <div className="pt-3">
                                                                                <SpellDescription spell={spell} />
                                                                            </div>
                                                                        </div>
                                                                    )}
        </div>
    );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Шапка "Добавить Заклинание" */}
                                    <div className="border rounded-lg">
                                        <button
                                            onClick={() => setIsAddSpellsOpen(!isAddSpellsOpen)}
                                            className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                                        >
                                            <span className="font-semibold">Добавить Заклинание</span>
                                            <Icons.ChevronDown 
                                                className={`w-5 h-5 transition-transform ${isAddSpellsOpen ? 'rotate-180' : ''}`} 
                                            />
                                        </button>
                                        
                                        {isAddSpellsOpen && (
                                            <div className="px-4 pb-4 border-t">
                                                {/* Информация о подготовленных заклинаниях */}
                                                <div className="text-sm text-muted-foreground text-center py-3 border-b">
                                                    Подготовленные заклинания: {preparedSpells.length}/{getMaxPreparedSpells()}
                                                </div>
                                                
                                                {/* Поиск и фильтры */}
                                                <div className="space-y-4 py-4">
                                                    {/* Поисковая строка */}
                                                    <div className="relative">
                                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                        <input
                                                            type="text"
                                                            placeholder="Поиск заклинаний..."
                                                            value={spellSearch}
                                                            onChange={(e) => setSpellSearch(e.target.value)}
                                                            className="w-full pl-10 pr-3 py-2 bg-transparent border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-0"
                                                            style={{
                                                                borderColor: 'hsl(var(--border))'
                                                            }}
                                                        />
                                                    </div>
                                                    
                                                    {/* Фильтры по уровню */}
                                                    <div className="flex flex-wrap gap-2">
                                                        <button
                                                            onClick={() => setSpellLevelFilter('all')}
                                                            className={`px-2 py-1 rounded text-xs font-medium transition-colors border ${
                                                                spellLevelFilter === 'all'
                                                                    ? 'bg-primary text-primary-foreground border-primary'
                                                                    : 'bg-transparent text-muted-foreground border-border hover:bg-muted'
                                                            }`}
                                                        >
                                                            ВСЕ
                                                        </button>
                                                        {getAvailableSpellLevels().map(level => (
                                                            <button
                                                                key={level}
                                                                onClick={() => setSpellLevelFilter(level)}
                                                                className={`px-2 py-1 rounded text-xs font-medium transition-colors border ${
                                                                    spellLevelFilter === level
                                                                        ? 'bg-primary text-primary-foreground border-primary'
                                                                        : 'bg-transparent text-muted-foreground border-border hover:bg-muted'
                                                                }`}
                                                            >
                                                                {level === 0 ? 'ЗАГОВОРЫ' : `${level} УРОВЕНЬ`}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                
                                                <div className="py-4 space-y-2">
                                                    {getFilteredSpells().map((spell, index) => {
                                                        const isExpanded = expandedSpells.has(index);
    return (
                                                            <div key={index} className="border rounded-lg bg-muted/30">
                                                        {/* Шапка карточки */}
                                                        <div className="flex items-center justify-between p-3">
                                                            <button
                                                                onClick={() => toggleSpellExpansion(index)}
                                                                className="flex-1 text-left hover:bg-muted/50 rounded transition-colors"
                                                            >
                                                                <div className="font-medium text-base flex items-center gap-2">
                                                                    {spell.name}
                                                                    {/* Индикаторы */}
                                                                    <div className="flex gap-1">
                                                                        {spell.needConcentration && (
                                                                            <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded font-medium">
                                                                                К
                                                                            </span>
                                                                        )}
                                                                        {spell.isRitual && (
                                                                            <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded font-medium">
                                                                                Р
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="text-sm text-muted-foreground mt-1">
                                                                    {spell.isLegacy ? (
                                                                        <>
                                                                            <span style={{ color: '#b59e54' }}>Legacy</span>
                                                                            <span> • </span>
                                                                        </>
                                                                    ) : null}
                                                                    {spell.level}-й уровень • {spell.school}
                                                                </div>
                                                            </button>
                                                            <div className="flex items-center gap-2 ml-3">
                <button
                                                                    onClick={() => {
                                                                        if (draft.basics.class) {
                                                                            if (preparedSpells.includes(spell.key)) {
                                                                                // Убираем заклинание из подготовленных
                                                                                const newSpells = preparedSpells.filter(key => key !== spell.key);
                                                                                setChosenSpells(draft.basics.class, newSpells);
                                                                            } else if (preparedSpells.length < getMaxPreparedSpells()) {
                                                                                // Добавляем заклинание в подготовленные
                                                                                const newSpells = [...preparedSpells, spell.key];
                                                                                setChosenSpells(draft.basics.class, newSpells);
                                                                            }
                                                                        }
                                                                    }}
                                                                    disabled={!preparedSpells.includes(spell.key) && preparedSpells.length >= getMaxPreparedSpells()}
                                                                    className={
                                                                        preparedSpells.includes(spell.key)
                                                                            ? 'p-1.5 text-red-500 hover:text-red-700 hover:bg-red-500/10 rounded transition-colors'
                                                                            : 'px-3 py-1.5 text-xs font-medium bg-transparent border border-[#96bf6b] text-[#96bf6b] hover:bg-[#96bf6b]/10 rounded transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:border-muted disabled:cursor-not-allowed'
                                                                    }
                                                                    title={preparedSpells.includes(spell.key) ? "Убрать заклинание" : "Подготовить заклинание"}
                                                                >
                                                                    {preparedSpells.includes(spell.key) ? (
                                                                        <Icons.X className="w-4 h-4" />
                                                                    ) : (
                                                                        'ПОДГОТОВИТЬ'
                                                                    )}
                </button>
                <button
                                                                            onClick={() => toggleSpellExpansion(index)}
                                                                            className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted/50 transition-colors"
                                                                            title={isExpanded ? "Свернуть" : "Развернуть"}
                >
                                                                            <Icons.ChevronDown 
                                                                                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                                                                            />
                </button>
            </div>
                                                                </div>
                                                                
                                                                {/* Описание заклинания */}
                                                                {isExpanded && (
                                                                    <div className="px-3 pb-3 border-t bg-muted/20">
                                                                        <div className="pt-3">
                                                                            <SpellDescription spell={spell} />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Модальные окна */}
            <ClassPreviewModal
                isOpen={!!previewClass}
                classKey={previewClass}
                onClose={handleCancelPreview}
                onConfirm={handleAddClass}
            />

            <ClassRemoveModal
                isOpen={showRemoveConfirm}
                classInfo={info}
                onClose={() => setShowRemoveConfirm(false)}
                onConfirm={handleRemoveClass}
            />

            <HealthSettingsModal
                isOpen={showHealthSettings}
                classInfo={info}
                level={draft.basics.level}
                conMod={conMod}
                maxHP={maxHP}
                hpMode={draft.basics.hpMode || "fixed"}
                hpRolls={draft.hpRolls || []}
                onClose={() => setShowHealthSettings(false)}
                onHpRoll={setHpRollAtLevel}
                onResetHpRolls={resetHpRolls}
                onSetHpCurrent={(hp) => setBasics({ hpCurrent: hp })}
            />
        </div>
    );
}