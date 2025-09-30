import { useState } from "react";
import { useCharacter } from "@/store/character";
import AvatarManager from "./AvatarManager";
import NameGenerator from "./NameGenerator";

export default function CharacterHeader() {
    const { draft, setDraft } = useCharacter();
    const [isAvatarManagerOpen, setIsAvatarManagerOpen] = useState(false);
    const [localName, setLocalName] = useState(draft?.basics?.name || "");

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement> | string) => {
        const newName = typeof e === 'string' ? e : e.target.value;
        setLocalName(newName);
        
        // Обновляем в store
        setDraft(d => ({
            ...d,
            basics: {
                ...d.basics,
                name: newName,
            },
        }));
    };

    const handleAvatarSelect = (avatarUrl: string | null) => {
        setDraft(d => ({
            ...d,
            avatar: avatarUrl,
        }));
    };

    const handleAvatarClick = () => {
        setIsAvatarManagerOpen(true);
    };

    return (
        <>
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20 mb-6">
                <div className="container mx-auto py-4">
                    <div className="flex items-center gap-4">
                        {/* Портрет */}
                        <div 
                            className="flex-shrink-0 cursor-pointer group"
                            onClick={handleAvatarClick}
                        >
                            {draft?.avatar ? (
                                <img
                                    src={draft.avatar}
                                    alt="Портрет персонажа"
                                    className="w-24 h-24 rounded-lg object-cover border-2 border-primary/30 group-hover:border-primary/60 transition-colors"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-lg bg-muted border-2 border-dashed border-muted-foreground flex items-center justify-center group-hover:border-primary/60 transition-colors">
                                    <span className="text-muted-foreground text-xs">Портрет</span>
                                </div>
                            )}
                        </div>

                        {/* Поле имени */}
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-muted-foreground mb-1">
                                Имя персонажа
                            </label>
                            <input
                                type="text"
                                value={localName}
                                onChange={handleNameChange}
                                placeholder="Введите имя персонажа"
                                spellCheck={false}
                                className="w-full text-2xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/50 focus:ring-0"
                            />
                            <NameGenerator 
                                onNameGenerated={handleNameChange}
                                className="mt-2"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Модальное окно управления портретами */}
            <AvatarManager
                isOpen={isAvatarManagerOpen}
                onClose={() => setIsAvatarManagerOpen(false)}
                currentAvatar={draft?.avatar}
                onAvatarSelect={handleAvatarSelect}
            />
        </>
    );
}
