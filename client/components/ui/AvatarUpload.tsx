interface AvatarUploadProps {
    currentAvatar?: string;
    onAvatarChange: (avatarUrl: string | null) => void;
    className?: string;
}

export default function AvatarUpload({ currentAvatar, onAvatarChange, className = "" }: AvatarUploadProps) {

    return (
        <div className={`flex flex-col items-center ${className}`}>
            <div className="relative w-full h-full">
                {currentAvatar ? (
                    <img
                        src={currentAvatar}
                        alt="Портрет персонажа"
                        className="w-full h-full rounded-lg object-cover"
                    />
                ) : (
                    <div className="w-full h-full rounded-lg bg-muted border-2 border-dashed border-muted-foreground flex items-center justify-center">
                        <span className="text-muted-foreground text-xs">Нет портрета</span>
                    </div>
                )}
            </div>
        </div>
    );
}
