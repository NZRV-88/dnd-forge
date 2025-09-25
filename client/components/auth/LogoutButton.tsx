import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
    const nav = useNavigate();

    async function handleLogout() {
        await supabase.auth.signOut();
        nav("/login"); // после выхода кидаем на страницу логина
    }

    return (
        <button
            onClick={handleLogout}
            className="rounded bg-red-600 px-3 py-2 text-white hover:bg-red-700"
        >
            Выйти
        </button>
    );
}
