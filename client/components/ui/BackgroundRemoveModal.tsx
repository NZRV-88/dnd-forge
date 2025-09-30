import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { BackgroundInfo } from "@/data/backgrounds/types";

interface BackgroundRemoveModalProps {
    backgroundInfo: BackgroundInfo | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function BackgroundRemoveModal({
    backgroundInfo,
    isOpen,
    onClose,
    onConfirm,
}: BackgroundRemoveModalProps) {
    if (!backgroundInfo) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md" hideCloseButton>
                <DialogHeader>
                    <DialogTitle className="text-center text-lg font-semibold">
                        УБРАТЬ ПРЕДЫСТОРИЮ
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center space-y-4 py-4">
                    {/* Аватар предыстории */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-2xl font-bold">
                        {backgroundInfo.name.charAt(0)}
                    </div>

                    {/* Название предыстории */}
                    <div className="text-center">
                        <h3 className="text-lg font-semibold">{backgroundInfo.name}</h3>
                    </div>

                    {/* Предупреждение */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <p className="text-sm text-red-800">
                            Вы уверены, что хотите убрать предысторию "{backgroundInfo.name}". 
                            Все ваши выборы, которые вы сделали, будут потеряны.
                        </p>
                    </div>
                </div>

                {/* Кнопки */}
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                    >
                        ОТМЕНИТЬ
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        className="flex-1"
                    >
                        УБРАТЬ
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
