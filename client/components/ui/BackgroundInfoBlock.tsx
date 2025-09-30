import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getProficiencyName } from "@/data/proficiencies";
import type { BackgroundInfo } from "@/data/backgrounds/types";
import ChoiceRenderer from "@/components/ui/ChoiceRenderer";

interface BackgroundInfoBlockProps {
    backgroundInfo: BackgroundInfo;
    source: string;
}

export default function BackgroundInfoBlock({ 
    backgroundInfo, 
    source 
}: BackgroundInfoBlockProps) {
    return (
        <Card className="min-h-[100px]">
            <CardContent className="p-4">
                <div className="space-y-3">
                    {/* Название и описание */}
                    <div>
                        <h3 className="font-semibold text-lg">{backgroundInfo.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {backgroundInfo.longDesc || backgroundInfo.desc}
                        </p>
                    </div>

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
                        backgroundInfo.feature.map((feature, index) => (
                            <div key={feature.key || index}>
                                <div className="text-sm font-medium">
                                    {feature.name}
                                </div>
                                {feature.desc && (
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {feature.desc}
                                    </p>
                                )}
                                {feature.choices && (
                                    <div className="mt-2">
                                        <ChoiceRenderer
                                            choices={feature.choices}
                                            source={`${source}-feature-${index}`}
                                        />
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div>
                            <div className="text-sm font-medium">
                                Особенность: {backgroundInfo.feature.name}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {backgroundInfo.feature.desc}
                            </p>
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
            </CardContent>
        </Card>
    );
}
