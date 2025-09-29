import { useState } from "react";
import { Button } from "./button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";

interface AvatarManagerProps {
    isOpen: boolean;
    onClose: () => void;
    currentAvatar?: string | null;
    onAvatarSelect: (avatarUrl: string | null) => void;
}

export default function AvatarManager({ isOpen, onClose, currentAvatar, onAvatarSelect }: AvatarManagerProps) {
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(currentAvatar || null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Проверяем размер файла (максимум 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("Размер файла не должен превышать 5MB");
            return;
        }

        // Проверяем тип файла
        if (!file.type.startsWith('image/')) {
            alert("Пожалуйста, выберите изображение");
            return;
        }

        setIsUploading(true);

        try {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                setSelectedAvatar(result);
                setIsUploading(false);
            };
            reader.onerror = () => {
                alert("Ошибка при чтении файла");
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error("Ошибка загрузки аватарки:", error);
            alert("Ошибка при загрузке аватарки");
            setIsUploading(false);
        }
    };

    const handleAccept = () => {
        onAvatarSelect(selectedAvatar);
        onClose();
    };

    const handleCancel = () => {
        setSelectedAvatar(currentAvatar || null);
        onClose();
    };

    const handleRemove = () => {
        setSelectedAvatar(null);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md p-0 overflow-hidden">
                <DialogHeader className="bg-gray-800 text-white p-4 m-0">
                    <DialogTitle className="text-center text-lg font-bold">МЕНЕДЖЕР ПОРТРЕТОВ</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6 p-6">
                    {/* Превью портрета */}
                    <div className="flex justify-center">
                        <div className="relative">
                            {selectedAvatar ? (
                                <img
                                    src={selectedAvatar}
                                    alt="Превью портрета"
                                    className="w-32 h-32 rounded-lg object-cover border-2 border-primary"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-lg bg-muted border-2 border-dashed border-muted-foreground flex items-center justify-center">
                                    <span className="text-muted-foreground text-sm">Нет портрета</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Кнопки управления */}
                    <div className="flex flex-col gap-3">
                        <div className="relative">
                            <input
                                id="avatar-upload-manager"
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleFileUpload}
                                disabled={isUploading}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full cursor-pointer"
                                disabled={isUploading}
                            >
                                {isUploading ? "Загрузка..." : "Загрузить изображение"}
                            </Button>
                        </div>

                        {selectedAvatar && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleRemove}
                                className="w-full text-destructive hover:text-destructive"
                            >
                                Удалить портрет
                            </Button>
                        )}
                    </div>

                    {/* Кнопки подтверждения */}
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            className="flex-1"
                        >
                            Отмена
                        </Button>
                        <Button
                            type="button"
                            onClick={handleAccept}
                            className="flex-1"
                        >
                            Принять
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
