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
import FeatureBlock from "@/components/ui/FeatureBlock";
import ClassPreviewModal from "@/components/ui/ClassPreviewModal";
import ClassRemoveModal from "@/components/ui/ClassRemoveModal";
import HealthSettingsModal from "@/components/ui/HealthSettingsModal";
import { SpellsLevel1 } from "@/data/spells/spellLevel1";

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
    
    return hp;
}

export default function ClassPick() {
    const { id } = useParams<{ id: string }>();
    const nav = useNavigate();
    const { draft, setBasics, setLevel, setHpRollAtLevel, resetHpRolls, clearClassChoices, setChosenSpells, removeChosenSpell, loadFromSupabase, isLoading, abilityBonuses } = useCharacter();
    
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
    
    // Получаем подготовленные заклинания из драфта
    const preparedSpells = draft.basics.class ? (draft.chosen.spells[draft.basics.class] || []) : [];
    console.log('Class: draft.chosen.spells:', draft.chosen.spells);
    console.log('Class: preparedSpells for class', draft.basics.class, ':', preparedSpells);
    
    // Загружаем персонажа при редактировании
    useEffect(() => {
        if (id && draft.id !== id && !isLoading) {
            console.log('Class: Loading character from Supabase, id:', id, 'draft.id:', draft.id);
            loadFromSupabase(id);
        }
    }, [id, draft.id, loadFromSupabase, isLoading]);

    const info = useMemo(
        () => CLASS_CATALOG.find((c) => c.key === draft.basics.class),
        [draft.basics.class],
    );
    const conScore = Number(draft.stats?.con) || 10;
    const conMod = Math.floor((conScore - 10) / 2);

    const maxHP = calcMaxHP(info, draft.basics.level, conMod, draft.basics.hpMode || "fixed", draft.hpRolls);

    // Автоматически устанавливаем hpCurrent равным maxHP при выборе класса или изменении уровня
    useEffect(() => {
        if (draft.basics.class && maxHP > 0) {
            // Если hpCurrent равен null, обновляем его до maxHP
            // Если hpCurrent не null, но больше maxHP (например, при понижении уровня), обновляем его
            if (draft.basics.hpCurrent === null || (draft.basics.hpCurrent !== null && draft.basics.hpCurrent > maxHP)) {
                setBasics({ hpCurrent: maxHP });
            }
        }
    }, [draft.basics.class, draft.basics.level, draft.basics.hpMode, draft.hpRolls, maxHP, setBasics]);

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
        return SpellsLevel1.filter((spell) => 
            spell.classes && 
            spell.classes.includes(info.key) &&
            spell.level <= maxSpellLevel
        );
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
                                onClick={() => setLevel(Math.max(1, draft.basics.level - 1))}
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
                                                
                                                <div className="py-4 space-y-2">
                                                    {getAvailableSpells().map((spell, index) => {
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
                                                                                console.log('Class: removing spell', spell.key, 'from prepared spells:', newSpells);
                                                                                setChosenSpells(draft.basics.class, newSpells);
                                                                            } else if (preparedSpells.length < getMaxPreparedSpells()) {
                                                                                // Добавляем заклинание в подготовленные
                                                                                const newSpells = [...preparedSpells, spell.key];
                                                                                console.log('Class: adding spell', spell.key, 'to prepared spells:', newSpells);
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