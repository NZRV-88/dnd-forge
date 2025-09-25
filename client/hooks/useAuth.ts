import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useAuth() {
    const [user, setUser] = useState<any | null | undefined>(undefined);

    useEffect(() => {
        // загружаем текущего пользователя
        supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));

        // слушаем изменения (логин/логаут)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    return user;
}
