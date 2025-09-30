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
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md p-0 overflow-hidden" hideCloseButton>
                <DialogHeader className="bg-gray-800 text-white p-4 m-0">
                    <DialogTitle className="text-center text-lg font-bold">УБРАТЬ ПРЕДЫСТОРИЮ</DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-4">
                    {backgroundInfo && (
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-3xl font-bold border-2 border-primary">
                                {backgroundInfo.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-2">
                                    {backgroundInfo.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Вы уверены, что хотите убрать предысторию {backgroundInfo.name}?
                                    Все ваши выборы, которые вы сделали, будут потеряны.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Кнопки подтверждения */}
                <div className="flex gap-0 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 rounded-none border-0"
                    >
                        ОТМЕНИТЬ
                    </Button>
                    <Button
                        type="button"
                        onClick={onConfirm}
                        className="flex-1 rounded-none bg-red-500 hover:bg-red-600"
                    >
                        УБРАТЬ
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
