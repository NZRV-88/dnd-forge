import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProficiencyName } from "@/data/proficiencies";
import type { BackgroundInfo } from "@/data/backgrounds/types";
import ChoiceRenderer from "@/components/ui/ChoiceRenderer";
import FeatureBlock from "@/components/ui/FeatureBlock";
import { ALL_FEATS } from "@/data/feats/feats";
import * as Icons from "@/components/refs/icons";
import { BackgroundTraitsTable } from "@/components/ui/BackgroundTraitsTable";

interface BackgroundInfoBlockProps {
    backgroundInfo: BackgroundInfo;
    source: string;
    onRemove?: () => void;
}

export default function BackgroundInfoBlock({ 
    backgroundInfo, 
    source,
    onRemove
}: BackgroundInfoBlockProps) {
    return (
        <div className="space-y-6">
            {/* Карточка выбранной предыстории - точно как до выбора */}
            <div className="relative text-left rounded-lg border p-4 flex flex-col justify-between transition hover:shadow-md border-2 border-primary shadow-lg bg-gradient-to-b from-primary/5 to-transparent">
                <div className="absolute right-2 top-2 text-primary">
                    <Icons.Crown className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-medium text-lg">{backgroundInfo.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{backgroundInfo.desc}</p>
                </div>
                {/* Крестик для удаления в нижнем правом углу */}
                {onRemove && (
                    <button
                        onClick={onRemove}
                        className="absolute bottom-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                        <Icons.X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Детальная информация в стиле Class.tsx */}
            <Card className="border bg-card shadow-md">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                        {backgroundInfo.name}
                    </CardTitle>
                    {backgroundInfo.longDesc ? (
                        <p className="mt-1 text-sm text-muted-foreground italic leading-relaxed whitespace-pre-line">
                            {backgroundInfo.longDesc}
                        </p>
                    ) : (
                        <p className="mt-1 text-sm text-muted-foreground italic leading-relaxed">
                            {backgroundInfo.desc}
                        </p>
                    )}
                </CardHeader>

                <CardContent className="space-y-6 pt-6">
                    {/* Основные особенности предыстории */}
                    <BackgroundTraitsTable
                        backgroundInfo={backgroundInfo}
                        choices={backgroundInfo.choices}
                        source={`${source}-traits`}
                        showChoices={true}
                    />

                    <h3 className="text-base font-bold uppercase tracking-wider text-foreground mb-3 border-l-2 border-primary pl-2">
                        Особенности
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        {/* Особенности предыстории */}
                        {Array.isArray(backgroundInfo.feature) ? (
                            backgroundInfo.feature.map((feature, index) => {
                                // Если это feat, отображаем как карточку feat внутри FeatureBlock
                                if (feature.feat) {
                                    const featInfo = ALL_FEATS.find(f => f.key === feature.feat);
                                    if (featInfo) {
                                        // Собираем все выборы из эффектов feat
                                        const featChoices = featInfo.effect?.flatMap(eff => eff.choices || []) || [];
                                        
                                        return (
                                            <FeatureBlock
                                                key={feature.key || index}
                                                name={feature.name}
                                                desc={feature.desc || ""}
                                                source={`${source}-feat-${feature.feat}`}
                                                idx={index + 10}
                                                choices={featChoices}
                                                featKey={feature.feat}
                                                customContent={
                                                    <div className="mt-3 rounded-xl border border-stone-800 bg-gradient-to-b from-gray-100 to-gray-100 p-4 shadow-sm relative">
                                                        <div className="absolute right-3 top-3 text-stone-500">
                                                            <Icons.Award className="w-5 h-5" />
                                                        </div>

                                                        <h4 className="font-semibold text-stone-900 tracking-wide">
                                                            {featInfo.name}
                                                        </h4>

                                                        {featInfo.desc && (
                                                            <p className="text-sm text-stone-800/80 mt-2 leading-relaxed">
                                                                {featInfo.desc}
                                                            </p>
                                                        )}

                                                        {/* Эффекты фита */}
                                                        {featInfo.effect?.map((eff, ei) => (
                                                            <div
                                                                key={ei}
                                                                className="mt-3 rounded border border-stone-200 bg-stone-50/70 p-2"
                                                            >
                                                                <div className="font-medium text-stone-900">
                                                                    {eff.name}
                                                                </div>
                                                                {eff.desc && (
                                                                    <p className="text-xs text-stone-700 mt-1">
                                                                        {eff.desc}
                                                                    </p>
                                                                )}
                                                                {eff.choices && eff.choices.length > 0 && (
                                                                    <div className="mt-2">
                                                                        <ChoiceRenderer
                                                                            choices={eff.choices}
                                                                            source={`${source}-feat-${feature.feat}`}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                }
                                            />
                                        );
                                    }
                                }
                                
                                // Обычная особенность - используем FeatureBlock без уровня
                                return (
                                    <FeatureBlock
                                        key={feature.key || index}
                                        name={feature.name}
                                        desc={feature.desc || ""}
                                        source={`${source}-feature-${index}`}
                                        idx={index + 10}
                                        choices={feature.choices}
                                    />
                                );
                            })
                        ) : (
                            <FeatureBlock
                                name={backgroundInfo.feature.name}
                                desc={backgroundInfo.feature.desc}
                                source={`${source}-feature`}
                                idx={10}
                                choices={backgroundInfo.feature.choices}
                            />
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
