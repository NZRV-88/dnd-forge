import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const nav = useNavigate();

    // Вход по email/паролю
    async function handleSignIn(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        setLoading(false);

        if (error) {
            setError(error.message);
        } else {
            nav("/characters"); // редирект на список персонажей
        }
    }

    // Регистрация (signUp)
    async function handleSignUp(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        setLoading(false);

        if (error) {
            setError(error.message);
        } else {
            alert("Подтверди почту по ссылке, отправленной на email 📩");
        }
    }

    // OAuth (Twitch / Discord)
    async function handleOAuth(provider: "twitch" | "discord") {
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: window.location.origin, // вернёт сюда после логина
            },
        });

        if (error) {
            setError(error.message);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-sm rounded bg-white p-6 shadow">
                <h1 className="mb-4 text-xl font-bold">Войти в аккаунт</h1>

                <form className="space-y-3" onSubmit={handleSignIn}>
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full rounded border px-3 py-2"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Пароль"
                        className="w-full rounded border px-3 py-2"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button
                        type="submit"
                        className="w-full rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                        disabled={loading}
                    >
                        {loading ? "Загрузка..." : "Войти"}
                    </button>
                </form>

                <button
                    onClick={handleSignUp}
                    className="mt-2 w-full rounded border px-3 py-2 hover:bg-gray-50"
                    disabled={loading}
                >
                    Регистрация
                </button>

                <div className="my-4 border-t pt-4 text-center text-sm text-gray-500">
                    или войти через
                </div>

                <div className="flex space-x-2">
                    <button
                        onClick={() => handleOAuth("twitch")}
                        className="flex-1 rounded bg-purple-600 px-3 py-2 text-white hover:bg-purple-700"
                    >
                        Twitch
                    </button>

                    <button
                        onClick={() => handleOAuth("discord")}
                        className="flex-1 rounded bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700"
                    >
                        Discord
                    </button>
                </div>

                {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            </div>
        </div>
    );
}
