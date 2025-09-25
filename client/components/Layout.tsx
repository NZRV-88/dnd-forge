import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabaseClient";
import { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Layout({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const userEmail =
        session?.user.email ??
        session?.user.user_metadata.full_name ??
        "Аккаунт";

    const initials =
        userEmail?.charAt(0).toUpperCase() +
        (userEmail?.split(" ")[1]?.charAt(0).toUpperCase() ?? "");

    return (
        <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-16 items-center justify-between">
                    <Link to="/" className="text-lg font-bold">
                        Heroes Forge
                    </Link>

                    <nav className="hidden items-center gap-6 md:flex">
                        <Link to="/">Главная</Link>
                        <Link to="/characters">Мои персонажи</Link>
                        <Link to="/campaigns">Кампании</Link>
                        <Link to="/graveyard">Кладбище</Link>
                        <Link to="/create">Создать персонажа</Link>
                    </nav>

                    <div className="flex items-center gap-2">
                        {session ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="rounded-full p-0">
                                        <Avatar>
                                            <AvatarFallback>{initials}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem disabled>
                                        {userEmail}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => supabase.auth.signOut()}
                                        className="cursor-pointer text-red-600"
                                    >
                                        Выйти
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button asChild size="sm" variant="secondary">
                                <Link to="/login">Войти</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary/70" />
            <main className="flex-1">{children}</main>
        </div>
    );
}
