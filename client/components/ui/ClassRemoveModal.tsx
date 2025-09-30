import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CLASS_LABELS } from "@/data/classes";
import type { ClassInfo } from "@/data/classes/types";

interface ClassRemoveModalProps {
    isOpen: boolean;
    classInfo: ClassInfo | undefined;
    onClose: () => void;
    onConfirm: () => void;
}

export default function ClassRemoveModal({
    isOpen,
    classInfo,
    onClose,
    onConfirm,
}: ClassRemoveModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md p-0 overflow-hidden" hideCloseButton>
                <DialogHeader className="bg-gray-800 text-white p-4 m-0">
                    <DialogTitle className="text-center text-lg font-bold">УБРАТЬ КЛАСС</DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-4">
                    {classInfo && (
                        <div className="flex flex-col items-center gap-4 text-center">
                            <img
                                src={`/assets/class-avatars/${classInfo.key}.png`}
                                alt={CLASS_LABELS[classInfo.key] || classInfo.key}
                                className="w-24 h-24 object-cover rounded-lg border-2 border-primary"
                                onError={(e) => {
                                    e.currentTarget.src = "/assets/class-avatars/default.png";
                                }}
                            />
                            <div>
                                <h3 className="text-lg font-bold mb-2">
                                    {CLASS_LABELS[classInfo.key] || classInfo.key}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Вы уверены, что хотите убрать все ваши уровни в классе {CLASS_LABELS[classInfo.key] || classInfo.key}?
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
