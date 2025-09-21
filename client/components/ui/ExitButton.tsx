import { useNavigate } from "react-router-dom";
import { X } from "@/components/refs/icons";
import { useCharacter } from "@/store/character";
import { motion } from "framer-motion";

export default function ExitButton() {
    const nav = useNavigate();
    const { basics, save } = useCharacter();

    const handleExit = () => {
        // сохраняем только если персонаж создан
        if (basics.name) {
            save();
        }
        nav("/characters");
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
