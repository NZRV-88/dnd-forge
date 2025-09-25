import { useNavigate, useParams } from "react-router-dom";
import { X } from "@/components/refs/icons";
import { useCharacter } from "@/store/character";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";

type ExitButtonProps = {
    onClick?: () => void;
};
export default function ExitButton({ onClick }: ExitButtonProps) {
    const nav = useNavigate();
    const user = useAuth();
    const { id: urlId } = useParams<{ id: string }>();

    const {
        basics,
        stats,
        asi,
        totalAbilityBonuses,
        skills,
        languages,
        tools,
        feats,
        spells,
    } = useCharacter();

    const handleExit = async () => {
        try {
            if (basics.name) {
                const { error } = await supabase
                    .from("characters")
                    .upsert(
                        {
                            id: urlId,
                            user_id: user.id,
                            data: {
                                basics,
                                stats,
                                asi,
                                totalAbilityBonuses,
                                skills,
                                languages,
                                tools,
                                feats,
                                spells,
                            },
                            updated_at: new Date().toISOString(),
                        },
                        { onConflict: "id" }
                    );

                if (error) {
                    console.error("Ошибка при сохранении персонажа:", error);
                    alert("Не удалось сохранить персонажа");
                    return;
                }
            }

            if (onClick) {
                onClick(); // вызов внешнего обработчика, если передан
            }

            nav("/characters");
        } catch (err) {
            console.error("Ошибка при сохранении персонажа:", err);
            alert("Ошибка при сохранении персонажа");
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