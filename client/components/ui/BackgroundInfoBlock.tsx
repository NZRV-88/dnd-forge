import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getProficiencyName } from "@/data/proficiencies";
import type { BackgroundInfo } from "@/data/backgrounds/types";
import ChoiceRenderer from "@/components/ui/ChoiceRenderer";
import FeatureBlock from "@/components/ui/FeatureBlock";
import { ALL_FEATS } from "@/data/feats/feats";

interface BackgroundInfoBlockProps {
    backgroundInfo: BackgroundInfo;
    source: string;
}

export default function BackgroundInfoBlock({ 
    backgroundInfo, 
    source 
}: BackgroundInfoBlockProps) {
    return (
        <div className="space-y-6">
            {/* Карточка выбранной предыстории */}
            <Card className="min-h-[100px]">
                <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                        {/* Иконка предыстории */}
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                            {backgroundInfo.name.charAt(0)}
                        </div>
                        
                        {/* Название и описание */}
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg">{backgroundInfo.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                {backgroundInfo.longDesc || backgroundInfo.desc}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Детальная информация */}
            <div className="space-y-4">

                    {/* Владения навыками */}
                    {backgroundInfo.proficiencies?.some((p) => p.type === "skill") && (
                        <div>
                            <div className="text-sm font-medium">Владение навыками</div>
                            <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">
                                {backgroundInfo.proficiencies
                                    .filter((p) => p.type === "skill")
                                    .map((p) => (
                                        <li key={p.key}>
                                            {getProficiencyName(p)}
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    )}

                    {/* Владение инструментами */}
                    {backgroundInfo.proficiencies?.some((p) => p.type === "tool") && (
                        <div>
                            <div className="text-sm font-medium">Владение инструментами</div>
                            <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">
                                {backgroundInfo.proficiencies
                                    .filter((p) => p.type === "tool")
                                    .map((p) => (
                                        <li key={p.key}>
                                            {getProficiencyName(p)}
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    )}

                    {/* Языки */}
                    {backgroundInfo.languages?.length > 0 && (
                        <div>
                            <div className="text-sm font-medium">Языки</div>
                            <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">
                                {backgroundInfo.languages.map((lang) => (
                                    <li key={lang}>{lang}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Особенности */}
                    {Array.isArray(backgroundInfo.feature) ? (
                        backgroundInfo.feature.map((feature, index) => {
                            // Если это feat, отображаем как карточку feat
                            if (feature.feat) {
                                const featInfo = ALL_FEATS.find(f => f.key === feature.feat);
                                if (featInfo) {
                                    return (
                                        <div key={feature.key || index} className="mt-4">
                                            <div className="text-sm font-medium mb-2">Черта: {featInfo.name}</div>
                                            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                                                <CardContent className="p-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                                                            {featInfo.name.charAt(0)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-purple-900">{featInfo.name}</h4>
                                                            <p className="text-sm text-purple-700 mt-1">{featInfo.desc}</p>
                                                            {featInfo.effect && featInfo.effect.length > 0 && (
                                                                <div className="mt-2">
                                                                    <ChoiceRenderer
                                                                        choices={featInfo.effect[0].choices || []}
                                                                        source={`${source}-feat-${feature.feat}`}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    );
                                }
                            }
                            
                            // Обычная особенность - используем FeatureBlock
                            return (
                                <div key={feature.key || index} className="mt-4">
                                    <FeatureBlock
                                        feature={{
                                            name: feature.name,
                                            desc: feature.desc || "",
                                            level: 1,
                                            choices: feature.choices
                                        }}
                                        source={`${source}-feature-${index}`}
                                        showChoices={true}
                                    />
                                </div>
                            );
                        })
                    ) : (
                        <div className="mt-4">
                            <FeatureBlock
                                feature={{
                                    name: backgroundInfo.feature.name,
                                    desc: backgroundInfo.feature.desc,
                                    level: 1,
                                    choices: backgroundInfo.feature.choices
                                }}
                                source={`${source}-feature`}
                                showChoices={true}
                            />
                        </div>
                    )}

                    {/* Снаряжение */}
                    <div>
                        <div className="text-sm font-medium">Снаряжение</div>
                        <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">
                            {backgroundInfo.equipment.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>

                {/* Выборы предыстории */}
                {backgroundInfo.choices && backgroundInfo.choices.length > 0 && (
                    <div>
                        <div className="text-sm font-medium">Выборы</div>
                        <div className="mt-2">
                            <ChoiceRenderer
                                choices={backgroundInfo.choices}
                                source={source}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
