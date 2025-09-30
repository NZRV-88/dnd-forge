import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCharacter } from "@/store/character";
import StepArrows from "@/components/ui/StepArrows";
import CharacterHeader from "@/components/ui/CharacterHeader";
import * as Icons from "@/components/refs/icons";
import { 
  BACKGROUND_CATALOG, 
  BACKGROUND_LABELS, 
  getBackgroundByKey 
} from "@/data/backgrounds";
import type { BackgroundInfo } from "@/data/backgrounds/types";
import ExitButton from "@/components/ui/ExitButton";
import BackgroundRemoveModal from "@/components/ui/BackgroundRemoveModal";
import BackgroundInfoBlock from "@/components/ui/BackgroundInfoBlock";
export default function BackgroundPick() {
    const { id } = useParams<{ id: string }>();
    const nav = useNavigate();
    const { draft, setBackground, loadFromSupabase, isLoading } = useCharacter();

    // Загружаем персонажа при редактировании
    useEffect(() => {
        if (id && draft.id !== id) {
            loadFromSupabase(id);
        }
    }, [id, draft.id, loadFromSupabase]);

    // Модальные окна
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

    const backgroundInfo = getBackgroundByKey(draft.basics.background);
    const hasSelectedBackground = !!draft.basics.background;

    // Сортируем предыстории по алфавиту
    const sortedBackgrounds = [...BACKGROUND_CATALOG].sort((a, b) =>
        a.name.localeCompare(b.name, "ru"),
    );

    const handleBackgroundClick = (key: string) => {
        setBackground(key);
    };

    const handleRemoveBackground = () => {
        setBackground(null);
        setShowRemoveConfirm(false);
    };

    const handleCancelRemove = () => {
        setShowRemoveConfirm(false);
    };

    if (isLoading) {
        return (
            <div className="container mx-auto py-10">
                <div className="mx-auto max-w-5xl relative overflow-visible">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Загрузка персонажа...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <div className="mx-auto max-w-5xl relative overflow-visible">
                <StepArrows back={`/create/${id}/class`} next={`/create/${id}/race`} />
                <ExitButton />

                {/* Шапка с именем и аватаркой */}
                <CharacterHeader />

                {/* Условный заголовок */}
                {!hasSelectedBackground ? (
                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold">Выбор предыстории</h1>
                        <p className="text-sm text-muted-foreground">
                            Выберите предысторию вашего персонажа
                        </p>
                    </div>
                ) : (
                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold">ПРЕДЫСТОРИЯ ПЕРСОНАЖА</h1>
                    </div>
                )}

                {/* Сетка предысторий */}
                {!hasSelectedBackground ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {sortedBackgrounds.map((bg) => (
                            <button
                                key={bg.key}
                                onClick={() => handleBackgroundClick(bg.key)}
                                className="relative text-left rounded-lg border p-4 flex flex-col justify-between transition hover:shadow-md hover:border-primary/50"
                            >
                                <div>
                                    <h3 className="font-medium text-lg">{bg.name}</h3>
                                    <p className="mt-2 text-sm text-muted-foreground">{bg.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex justify-between gap-4">
                        {/* Блок выбранной предыстории */}
                        <div className="flex-1">
                            <BackgroundInfoBlock 
                                backgroundInfo={backgroundInfo!} 
                                source={`background-${draft.basics.background}`}
                                onRemove={() => setShowRemoveConfirm(true)}
                            />
                        </div>
                    </div>
                )}

                {/* Модальное окно подтверждения удаления */}
                <BackgroundRemoveModal
                    backgroundInfo={backgroundInfo}
                    isOpen={showRemoveConfirm}
                    onClose={handleCancelRemove}
                    onConfirm={handleRemoveBackground}
                />
            </div>
        </div>
    );
}