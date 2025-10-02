import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { RaceInfo } from "@/data/races/types";

interface RaceRemoveModalProps {
    raceInfo: RaceInfo | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function RaceRemoveModal({
    raceInfo,
    isOpen,
    onClose,
    onConfirm,
}: RaceRemoveModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md p-0 overflow-hidden" hideCloseButton>
                <DialogHeader className="bg-gray-800 text-white p-4 m-0">
                    <DialogTitle className="text-center text-lg font-bold">УБРАТЬ РАСУ</DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-4">
                    {raceInfo && (
                        <div className="flex flex-col items-center gap-4 text-center">
                            <img
                                src={raceInfo.avatar}
                                alt={raceInfo.name}
                                className="w-24 h-24 object-cover rounded-lg border-2 border-primary"
                                onError={(e) => {
                                    e.currentTarget.src = "/assets/race-avatars/default.png";
                                }}
                            />
                            <div>
                                <h3 className="text-lg font-bold mb-2">
                                    {raceInfo.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Вы уверены, что хотите убрать расу {raceInfo.name}?
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
