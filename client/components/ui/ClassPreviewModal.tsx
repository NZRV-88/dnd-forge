import { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CLASS_CATALOG, CLASS_LABELS } from "@/data/classes";
import type { ClassInfo } from "@/data/classes/types";
import FeatureBlock from "@/components/ui/FeatureBlock";
import * as Icons from "@/components/refs/icons";

interface ClassPreviewModalProps {
    isOpen: boolean;
    classKey: string | null;
    onClose: () => void;
    onConfirm: () => void;
}

export default function ClassPreviewModal({
    isOpen,
    classKey,
    onClose,
    onConfirm,
}: ClassPreviewModalProps) {
    // Информация о классе в превью
    const previewInfo = useMemo(
        () => classKey ? CLASS_CATALOG.find((c) => c.key === classKey) : null,
        [classKey],
    );

    // Все фичи для превью (за 20 уровней)
    const previewFeatures = useMemo(() => {
        if (!previewInfo) return [];

        const classFeats: {
            name: string;
            desc: string;
            choices?: any[];
            featureLevel: number;
            originalIndex: number;
            originalLevel: number;
            uniqueId: string;
        }[] = [];

        // Фичи класса за все 20 уровней (исключаем "Умение архетипа")
        Object.entries(previewInfo.features).forEach(([lvl, featsArr]) => {
            featsArr.forEach((f, featIdx) => {
                // Исключаем блоки "Умение архетипа" из предпросмотра
                if (f.name !== "Умение архетипа") {
                    classFeats.push({
                        name: f.name,
                        desc: f.desc,
                        choices: f.choices, // Добавляем choices для передачи в FeatureBlock
                        featureLevel: Number(lvl),
                        originalIndex: featIdx,
                        originalLevel: Number(lvl),
                        uniqueId: `preview-${previewInfo.key}-${lvl}-${featIdx}-${f.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`
                    });
                }
            });
        });

        classFeats.sort((a, b) => a.featureLevel - b.featureLevel);

        return classFeats;
    }, [previewInfo]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[80vh] p-0 overflow-hidden flex flex-col" hideCloseButton>
                <DialogHeader className="bg-gray-800 text-white p-4 m-0">
                    <DialogTitle className="text-center text-lg font-bold">
                        {previewInfo ? (CLASS_LABELS[previewInfo.key] || previewInfo.key).toUpperCase() : ""}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {previewInfo && (
                        <>
                            {/* Аватарка и описание */}
                            <div className="flex gap-4 items-start">
                                <img
                                    src={`/assets/class-avatars/${previewInfo.key}.png`}
                                    alt={CLASS_LABELS[previewInfo.key] || previewInfo.key}
                                    className="w-24 h-24 object-cover rounded-lg border-2 border-primary"
                                    onError={(e) => {
                                        e.currentTarget.src = "/assets/class-avatars/default.png";
                                    }}
                                />
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold mb-2">
                                        {CLASS_LABELS[previewInfo.key] || previewInfo.key}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {previewInfo.longDesc || previewInfo.desc}
                                    </p>
                                </div>
                            </div>

                            {/* Основная информация */}
                            <div className="grid grid-cols-2 gap-3 text-sm border-t pt-4">
                                <div className="flex items-center gap-2">
                                    <Icons.Heart className="w-5 h-5 text-red-500" />
                                    <span className="font-medium">Кость хитов: d{previewInfo.hitDice}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Основные характеристики:</span>{" "}
                                    {previewInfo.mainStats?.join(", ") || "—"}
                                </div>
                            </div>

                            {/* Особенности за 20 уровней */}
                            <div className="border-t pt-4">
                                <h3 className="text-base font-bold uppercase tracking-wider mb-3 border-l-2 border-primary pl-2">
                                    Особенности класса (1-20 уровень)
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {previewFeatures.map((f) => (
                                        <FeatureBlock
                                            key={f.uniqueId}
                                            name={f.name}
                                            desc={f.desc}
                                            choices={f.choices}
                                            featureLevel={f.featureLevel}
                                            source="class"
                                            idx={f.originalIndex}
                                            originalIndex={f.originalIndex}
                                            originalLevel={f.originalLevel}
                                            uniqueId={f.uniqueId}
                                            textMaxHeight={60}
                                            defaultExpanded={true}
                                            ignoreLevel={true}
                                            classInfo={previewInfo}
                                            showChoices={false}
                                        />
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Кнопки подтверждения */}
                <div className="flex gap-0 border-t border-gray-200">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 rounded-none border-0"
                    >
                        ОТМЕНА
                    </Button>
                    <Button
                        type="button"
                        onClick={onConfirm}
                        className="flex-1 rounded-none"
                    >
                        ДОБАВИТЬ КЛАСС
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
