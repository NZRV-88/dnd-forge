import { useState } from "react";
import { Button } from "./button";

interface AvatarUploadProps {
    currentAvatar?: string;
    onAvatarChange: (avatarUrl: string | null) => void;
    className?: string;
}

export default function AvatarUpload({ currentAvatar, onAvatarChange, className = "" }: AvatarUploadProps) {
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
            // Конвертируем в base64 для хранения в localStorage/Supabase
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                onAvatarChange(result);
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

    const handleRemoveAvatar = () => {
        onAvatarChange(null);
    };

    return (
        <div className={`flex flex-col items-center space-y-4 ${className}`}>
            <div className="relative">
                {currentAvatar ? (
                    <img
                        src={currentAvatar}
                                    alt="Портрет персонажа"
                        className="w-32 h-32 rounded-lg object-cover border-2 border-primary"
                    />
                ) : (
                    <div className="w-32 h-32 rounded-lg bg-muted border-2 border-dashed border-muted-foreground flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">Нет портрета</span>
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                <label htmlFor="avatar-upload">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isUploading}
                        className="cursor-pointer"
                    >
                        {isUploading ? "Загрузка..." : currentAvatar ? "Изменить" : "Загрузить"}
                    </Button>
                </label>
                
                <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                />

                {currentAvatar && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveAvatar}
                        className="text-destructive hover:text-destructive"
                    >
                        Удалить портрет
                    </Button>
                )}
            </div>
        </div>
    );
}
