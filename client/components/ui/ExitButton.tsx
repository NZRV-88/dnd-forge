import { useNavigate } from "react-router-dom";
import { X } from "@/components/refs/icons";
import { useCharacter } from "@/store/character";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

type ExitButtonProps = {
    onClick?: () => void;
};
export default function ExitButton({ onClick }: ExitButtonProps) {
    const nav = useNavigate();
    const { draft, saveToSupabase } = useCharacter();

    const handleExit = async () => {
        try {
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
    };

    return (
        <motion.button
            onClick={handleExit}
            className="absolute right-3 top-3 p-2 text-muted-foreground hover:text-foreground"
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <X className="h-5 w-5" />
        </motion.button>
    );
}