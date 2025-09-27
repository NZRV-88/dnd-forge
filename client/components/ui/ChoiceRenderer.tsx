import type { ChoiceOption } from "@/data/shared/choices"; 
import React from "react";
import { useCharacter } from "@/store/character";
import { Abilities, ABILITIES } from "@/data/abilities";
import { Spells } from "@/data/spells";
import type { Spell } from "@/data/spells/types";
import { LANGUAGES } from "@/data/languages/languages";
import { ALL_FEATS } from "@/data/feats/feats"; 
import { Tools, TOOL_CATEGORY_LABELS } from "@/data/items/tools";
import { Feats } from "@/data/feats";
import { getAllCharacterData } from "@//utils/getAllCharacterData";
import * as Icons from "@/components/refs/icons";
interface ChoiceRendererProps {
    source: string; //"race" | "subrace" | "class" | "subclass" | "background"
    choices: ChoiceOption[];
    ci: number;
}

export default function ChoiceRenderer({ source, choices }: ChoiceRendererProps) {
    const {
        setChosenAbilities,
        removeChosenAbility,

        setChosenSkills,
        removeChosenSkill,

        setChosenTools,
        removeChosenTool,

        setChosenLanguages,
        removeChosenLanguage,

        setChosenSpells,
        removeChosenSpell,

        setChosenFeats,
        removeChosenFeat,

        draft,
    } = useCharacter();

    return (
        <div className="space-y-4">
            {choices.map((choice, ci) => {
                switch (choice.type) {
                    case "ability":
                        return Array.from({ length: choice.count ?? 1 }).map((_, idx) => {
                            const choiceKey = `${source}:ability:${ci}:${idx}`;
                            const selected = draft.chosen.abilities?.[source]?.[idx] ?? "";

                            return (
                                <select
                                    key={choiceKey}
                                    className="w-full rounded border p-2 text-sm"
                                    value={selected}
                                    onChange={(e) => {
                                        const value = e.target.value as keyof Abilities;
                                        if (!value) {
                                            // убираем из массива по индексу
                                            const updated = [...(draft.chosen.abilities[source] || [])];
                                            updated.splice(idx, 1);
                                            setChosenAbilities(source, updated);
                                        } else {
                                            // обновляем выбранную характеристику на текущем индексе
                                            const updated = [...(draft.chosen.abilities[source] || [])];
                                            updated[idx] = value;
                                            setChosenAbilities(source, updated);
                                        }
                                    }}
                                >
                                    <option value="">Выберите характеристику</option>
                                    {(choice.options || ABILITIES.map((a) => a.key)).map((opt) => (
                                        <option key={opt} value={opt}>
                                            {ABILITIES.find((a) => a.key === opt)?.label || opt}
                                        </option>
                                    ))}
                                </select>
                            );
                        });

                    case "spell":
                        return Array.from({ length: choice.count ?? 1 }).map((_, idx) => {
                            const choiceKey = `${source}:spell:${ci}:${idx}`;

                            // --- available spells (набор кандидатов) ---
                            let available: Spell[] = [];
                            if ((choice as any).spellLevel !== undefined) {
                                // если в ChoiceOption передаётся spellLevel
                                available = Spells.filter((s) => s.level === (choice as any).spellLevel);
                            } else if (choice.options) {
                                // или options — список ключей
                                available = Spells.filter((s) => choice.options?.includes(s.key));
                            }

                            // --- текущее выбранное значение для этого слота (по индексу) ---
                            const sourceArray = draft.chosen.spells?.[source] || [];
                            const selected = sourceArray[idx] ?? "";

                            // --- исключаем уже выбранные в других слотах, но оставляем текущее ---
                            const takenExceptCurrent = sourceArray.filter((_, i) => i !== idx);
                            const options = [...available]
                                .sort((a, b) => a.name.localeCompare(b.name, "ru", { sensitivity: "base" }))
                                .filter((s) => !takenExceptCurrent.includes(s.key) || s.key === selected);

                            return (
                                <select
                                    key={choiceKey}
                                    className="w-full rounded border p-2 text-sm"
                                    value={selected}
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        const prev = draft.chosen.spells?.[source] || [];
                                        const updated = [...prev];

                                        if (!value) {
                                            // удаляем слот (если пользователь вернул пустое значение)
                                            if (updated.length > idx) {
                                                updated.splice(idx, 1);
                                            }
                                        } else {
                                            // записываем выбор именно в этот индекс
                                            updated[idx] = value;
                                        }

                                        // сохраняем массив обратно в стор
                                        setChosenSpells(source, updated);
                                    }}
                                >
                                    <option value="">Выберите заклинание</option>
                                    {options.map((spell) => (
                                        <option key={spell.key} value={spell.key}>
                                            {spell.name}
                                        </option>
                                    ))}
                                </select>
                            );
                        });

                    case "tool":
                        return Array.from({ length: choice.count ?? 1 }).map((_, idx) => {
                            const choiceKey = `${source}:tool:${ci}:${idx}`;
                            const sourceArray = draft.chosen.tools?.[source] || [];
                            const selected = sourceArray[idx] ?? "";

                            // исключаем уже занятые, кроме текущего
                            const takenExceptCurrent = sourceArray.filter((_, i) => i !== idx);

                            return (
                                <div key={choiceKey} className="space-y-2">
                                    <select
                                        className="w-full rounded border p-2 text-sm"
                                        value={selected}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            const updated = [...sourceArray];

                                            if (!value) {
                                                updated.splice(idx, 1); // очищаем слот
                                            } else {
                                                updated[idx] = value; // пишем новый выбор
                                            }

                                            setChosenTools(source, updated);
                                        }}
                                    >
                                        <option value="">Выберите инструмент</option>
                                        {choice.options
                                            ?.filter((opt) => !takenExceptCurrent.includes(opt))
                                            .map((opt) => {
                                                const tool = Tools.find((t) => t.key === opt);
                                                return (
                                                    <option key={opt} value={opt}>
                                                        {tool?.name || opt}
                                                    </option>
                                                );
                                            })}
                                    </select>

                                    {/* Карточка выбранного инструмента */}
                                    {selected && (() => {
                                        const tool = Tools.find((t) => t.key === selected);
                                        if (!tool) return null;

                                        const categoryLabel =
                                            TOOL_CATEGORY_LABELS[tool.category] || tool.category;

                                        return (
                                            <div className="rounded-lg border border-stone-300 bg-stone-50 p-3 shadow-sm">
                                                <div className="font-medium text-stone-800">{tool.name}</div>
                                                {tool.desc && (
                                                    <p className="text-xs text-stone-600 mt-1">{tool.desc}</p>
                                                )}
                                                <div className="text-xs text-stone-500 mt-1">
                                                    Категория: {categoryLabel}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            );
                        });

                    case "language":
                        return Array.from({ length: choice.count ?? 1 }).map((_, idx) => {
                            const sourceArray = draft.chosen.languages?.[source] || [];
                            const selected = sourceArray[idx] ?? "";

                            // все известные языки (фиксированные + выборы)
                            const allData = getAllCharacterData(draft);
                            const taken = allData.languages.filter((l) => l !== selected); // оставляем текущий выбранный

                            return (
                                <select
                                    key={`${source}:language:${ci}:${idx}`}
                                    className="w-full rounded border p-2 text-sm"
                                    value={selected}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        const updated = [...sourceArray];
                                        if (!value) {
                                            // очищаем слот
                                            updated.splice(idx, 1);
                                        } else {
                                            updated[idx] = value;
                                        }
                                        setChosenLanguages(source, updated);
                                    }}
                                >
                                    <option value="">Выберите язык</option>
                                    {LANGUAGES.filter((lang) => !taken.includes(lang.key) || lang.key === selected)
                                        .map((lang) => (
                                            <option key={lang.key} value={lang.key}>
                                                {lang.name}
                                            </option>
                                        ))}
                                </select>
                            );
                        });

                    //case "spell":
                    //    let available: Spell[] = [];

                    //    if (choice.options) {
                    //        available = Spells.filter(s => choice.options!.includes(s.key));
                    //    } else if (choice.spellLevel !== undefined) {
                    //        available = Spells.filter(s => s.level === choice.spellLevel);
                    //        if (choice.spellClass) {
                    //            available = available.filter(s => s.classes?.includes(choice.spellClass));
                    //        }
                    //    }

                    //    return Array.from({ length: choice.count ?? 1 }).map((_, idx) => {
                    //        const choiceKey = `${source}:spell:${ci}:${idx}`;
                    //        const taken = draft.chosen.spells?.[source] ?? [];

                    //        return (
                    //            <select
                    //                key={choiceKey}
                    //                className="w-full rounded border p-2 text-sm"
                    //                value={draft.chosen.spells?.[choiceKey] ?? ""}
                    //                onChange={(e) => {
                    //                    const value = e.target.value;
                    //                    if (!value) {
                    //                        removeChosenSpell(source, choiceKey);
                    //                    } else {
                    //                        setChosenSpells(source, [...taken.filter(s => s !== choiceKey), value]);
                    //                    }
                    //                }}
                    //            >
                    //                <option value="">Выберите заклинание</option>
                    //                {available.map(spell => (
                    //                    <option key={spell.key} value={spell.key}>
                    //                        {spell.name}
                    //                    </option>
                    //                ))}
                    //            </select>
                    //        );
                    //    });

                    case "feat":
                        return Array.from({ length: choice.count ?? 1 }).map((_, idx) => {
                            const choiceKey = `${source}:feat:${ci}:${idx}`;
                            const selected = draft.chosen.feats[idx] || "";

                            return (
                                <div key={choiceKey} className="space-y-2">
                                    <select
                                        className="w-full rounded border p-2 text-sm"
                                        value={selected}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            const prevFeat = selected;

                                            if (!value) {
                                                // 1. удаляем сам фит
                                                if (prevFeat) {
                                                    removeChosenFeat(prevFeat);
                                                }

                                                // 2. очищаем вложенные выборы
                                                if (prevFeat) {
                                                    const cleanupPrefix = `feat:${prevFeat}`;
                                                    Object.keys(draft.chosen.abilities).forEach((key) => {
                                                        if (key.startsWith(cleanupPrefix)) setChosenAbilities(key, []);
                                                    });
                                                    Object.keys(draft.chosen.skills).forEach((key) => {
                                                        if (key.startsWith(cleanupPrefix)) setChosenSkills(key, []);
                                                    });
                                                    Object.keys(draft.chosen.tools).forEach((key) => {
                                                        if (key.startsWith(cleanupPrefix)) setChosenTools(key, []);
                                                    });
                                                    Object.keys(draft.chosen.languages).forEach((key) => {
                                                        if (key.startsWith(cleanupPrefix)) setChosenLanguages(key, []);
                                                    });
                                                    Object.keys(draft.chosen.spells).forEach((key) => {
                                                        if (key.startsWith(cleanupPrefix)) setChosenSpells(key, []);
                                                    });
                                                }
                                            } else {
                                                // 1. сохраняем новый фит
                                                setChosenFeats([
                                                    ...draft.chosen.feats.filter((f) => f !== selected),
                                                    value,
                                                ]);

                                                // 2. очищаем вложенные выборы для предыдущего фита
                                                if (prevFeat) {
                                                    const cleanupPrefix = `feat:${prevFeat}`;
                                                    Object.keys(draft.chosen.abilities).forEach((key) => {
                                                        if (key.startsWith(cleanupPrefix)) setChosenAbilities(key, []);
                                                    });
                                                    Object.keys(draft.chosen.skills).forEach((key) => {
                                                        if (key.startsWith(cleanupPrefix)) setChosenSkills(key, []);
                                                    });
                                                    Object.keys(draft.chosen.tools).forEach((key) => {
                                                        if (key.startsWith(cleanupPrefix)) setChosenTools(key, []);
                                                    });
                                                    Object.keys(draft.chosen.languages).forEach((key) => {
                                                        if (key.startsWith(cleanupPrefix)) setChosenLanguages(key, []);
                                                    });
                                                    Object.keys(draft.chosen.spells).forEach((key) => {
                                                        if (key.startsWith(cleanupPrefix)) setChosenSpells(key, []);
                                                    });
                                                }
                                            }
                                        }}
                                    >
                                        <option value="">Выберите талант</option>
                                        {ALL_FEATS.map((feat) => (
                                            <option key={feat.key} value={feat.key}>
                                                {feat.name}
                                            </option>
                                        ))}
                                    </select>

                                    {/* Карточка выбранного фита */}
                                    {selected && (() => {
                                        const feat = ALL_FEATS.find((f) => f.key === selected);
                                        if (!feat) return null;

                                        return (
                                            <div className="rounded-xl border border-stone-800 bg-gradient-to-b from-gray-100 to-gray-100 p-4 shadow-sm relative">
                                                <div className="absolute right-3 top-3 text-stone-500">
                                                    <Icons.Award className="w-5 h-5" />
                                                </div>

                                                <h4 className="font-semibold text-stone-900 tracking-wide">{feat.name}</h4>

                                                {feat.desc && (
                                                    <p className="text-sm text-stone-800/80 mt-2 leading-relaxed">
                                                        {feat.desc}
                                                    </p>
                                                )}

                                                {feat.effect?.map((eff, ei) => (
                                                    <div
                                                        key={ei}
                                                        className="mt-3 rounded border border-stone-200 bg-stone-50/70 p-2"
                                                    >
                                                        <div className="font-medium text-stone-900">{eff.name}</div>
                                                        {eff.desc && (
                                                            <p className="text-xs text-stone-800/70 mt-1">{eff.desc}</p>
                                                        )}

                                                        {eff.choices && (
                                                            <div className="mt-2">
                                                                <ChoiceRenderer
                                                                    source={`feat:${feat.key}:effect-${ei}`}
                                                                    choices={eff.choices}
                                                                    ci={ci * 100 + ei}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })()}
                                </div>
                            );
                        });

                    default:
                        return null;
                }
            })}
        </div>
    );
}