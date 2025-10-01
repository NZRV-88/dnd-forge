import { useNavigate } from "react-router-dom";
import { X } from "@/components/refs/icons";
import { useCharacter } from "@/store/character";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

type ExitButtonProps = {
    onClick?: () => void;
};
export default function ExitButton({ onClick }: ExitButtonProps) {
    const nav = useNavigate();
    const { draft, saveToSupabase } = useCharacter();
    const [saving, setSaving] = useState(false);

    const handleExit = async () => {
        try {
            if (saving) return;
            setSaving(true);
            const t = toast({ title: "Сохранение...", description: "Секунду, сохраняем персонажа" });
            await saveToSupabase();
            t.update({ title: "Готово", description: "Персонаж сохранён", duration: 2000 });

            if (onClick) {
                onClick(); // вызов внешнего обработчика, если передан
            }

            nav("/characters");
        } catch (err) {
            console.error("Ошибка при сохранении персонажа:", err);
            toast({ title: "Ошибка", description: "Не удалось сохранить персонажа", variant: "destructive" });
        }
        finally {
            setSaving(false);
        }
    };

    return (
        <motion.button
            onClick={handleExit}
            disabled={saving}
            aria-busy={saving}
            aria-label={saving ? "Сохранение" : "Выход"}
            className={`absolute right-3 top-3 p-2 z-50 ${saving ? "opacity-60 cursor-not-allowed" : "text-muted-foreground hover:text-foreground"}`}
            whileHover={!saving ? { rotate: 90, scale: 1.1 } : undefined}
            whileTap={!saving ? { scale: 0.9 } : undefined}
            transition={{ type: "spring", stiffness: 300 }}
        >
            {saving ? (
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
            ) : (
                <X className="h-5 w-5" />
            )}
        </motion.button>
    );
}