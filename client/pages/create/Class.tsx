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
    const { draft, setBasics, setLevel, setHpRollAtLevel, resetHpRolls, clearClassChoices, loadFromSupabase, isLoading, setHpCurrent } = useCharacter();
    
    // Модальные окна
    const [previewClass, setPreviewClass] = useState<string | null>(null);
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
    const [showHealthSettings, setShowHealthSettings] = useState(false);
    
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
                setHpCurrent(maxHP);
            }
        }
    }, [draft.basics.class, draft.basics.level, draft.basics.hpMode, draft.hpRolls, maxHP, setHpCurrent]);

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
                            <h3 className="text-base font-bold uppercase tracking-wider text-foreground mb-3 border-l-2 border-primary pl-2">
                                Особенности
                            </h3>
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
                onSetHpCurrent={setHpCurrent}
            />
        </div>
    );
}