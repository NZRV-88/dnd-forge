import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import * as Icons from "@/components/refs/icons";
import type { ClassInfo } from "@/data/classes/types";

interface HealthSettingsModalProps {
    isOpen: boolean;
    classInfo: ClassInfo | undefined;
    level: number;
    conMod: number;
    maxHP: number;
    hpMode: "fixed" | "roll";
    hpRolls: number[];
    onClose: () => void;
    onHpRoll: (level: number, value: number) => void;
    onResetHpRolls: () => void;
}

export default function HealthSettingsModal({
    isOpen,
    classInfo,
    level,
    conMod,
    maxHP,
    hpMode,
    hpRolls,
    onClose,
    onHpRoll,
    onResetHpRolls,
}: HealthSettingsModalProps) {
    const [localHpRolls, setLocalHpRolls] = useState<number[]>(hpRolls);

    // Синхронизируем локальное состояние с пропсами при изменении
    useEffect(() => {
        setLocalHpRolls(hpRolls);
    }, [hpRolls]);


    const calculateMaxHP = () => {
        if (!classInfo) return 0;
        
        let hp = classInfo.hitDice + conMod;
        
        if (level > 1) {
            if (hpMode === "fixed") {
                const averageHitDie = Math.ceil(classInfo.hitDice / 2) + 1;
                hp += (level - 1) * (averageHitDie + conMod);
            } else {
                for (let lvl = 2; lvl <= level; lvl++) {
                    const idx = lvl - 2;
                    const dieValue = localHpRolls[idx] && localHpRolls[idx]! > 0 ? localHpRolls[idx]! : 1;
                    hp += dieValue + conMod;
                }
            }
        }
        
        return hp;
    };

    const currentMaxHP = calculateMaxHP();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md p-0 overflow-hidden" hideCloseButton>
                <DialogHeader className="bg-gray-800 text-white p-4 m-0">
                    <DialogTitle className="text-center text-lg font-bold">НАСТРОЙКА ЗДОРОВЬЯ</DialogTitle>
                </DialogHeader>
                
                <div className="p-6 space-y-6">
                    {/* Максимальное здоровье */}
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Icons.Heart className="w-6 h-6 text-red-500" />
                            <span className="text-xl font-semibold">Максимальное здоровье</span>
                        </div>
                        <div className="text-4xl font-bold text-primary">{currentMaxHP}</div>
                    </div>

                    {/* Бонусы здоровья */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold border-l-2 border-primary pl-2">Бонусы здоровья</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center p-2 rounded border">
                                <span>Телосложение (модификатор):</span>
                                <span className={`font-semibold ${conMod >= 0 ? "text-green-600" : "text-red-600"}`}>
                                    {conMod >= 0 ? "+" : ""}{conMod}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded border">
                                <span>Кость хитов класса:</span>
                                <span className="font-semibold">d{classInfo?.hitDice}</span>
                            </div>
                        </div>
                    </div>

                    {/* Броски кубика (если режим "roll") */}
                    {hpMode === "roll" && level > 1 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold border-l-2 border-primary pl-2">Броски кубика</h3>
                            
                            {/* Результаты бросков */}
                            <div className="space-y-3">
                                <div className="flex flex-wrap justify-center gap-1.5 max-w-[420px] mx-auto">
                                    {Array.from({ length: level - 1 }).map((_, i) => {
                                        const roll = localHpRolls[i] || 0;
                                        const isRolled = roll > 0;
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    if (!isRolled && classInfo) {
                                                        const newRoll = Math.floor(Math.random() * classInfo.hitDice) + 1;
                                                        const newRolls = [...localHpRolls];
                                                        newRolls[i] = newRoll;
                                                        setLocalHpRolls(newRolls);
                                                        onHpRoll(i + 2, newRoll);
                                                    }
                                                }}
                                                disabled={isRolled}
                                                className={`w-9 h-9 rounded border-2 flex items-center justify-center font-bold text-sm transition-colors ${
                                                    isRolled
                                                        ? "border-green-500 bg-green-50 text-green-700 cursor-default"
                                                        : "border-gray-300 bg-gray-50 text-gray-400 hover:border-primary hover:bg-muted cursor-pointer"
                                                }`}
                                            >
                                                {isRolled ? roll : "?"}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                        </div>
                    )}
                </div>

                {/* Кнопки управления */}
                <div className="flex gap-0 border-t border-gray-200">
                    {hpMode === "roll" && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setLocalHpRolls([]);
                                onResetHpRolls();
                            }}
                            className="flex-1 rounded-none border-0 bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600"
                        >
                            СБРОСИТЬ
                        </Button>
                    )}
                    <Button
                        type="button"
                        onClick={onClose}
                        className={hpMode === "roll" ? "flex-1 rounded-none" : "w-full rounded-none"}
                    >
                        ЗАКРЫТЬ
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
