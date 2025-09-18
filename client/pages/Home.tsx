import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-8 text-center">Кузница персонажей D&D</h1>
        <nav className="flex flex-col gap-6">
          <Link
            to="/characters"
            className="block rounded-lg border px-6 py-4 text-xl font-medium text-center hover:bg-primary/10 transition"
          >
            Мои персонажи
          </Link>
          <Link
            to="/campaigns"
            className="block rounded-lg border px-6 py-4 text-xl font-medium text-center hover:bg-primary/10 transition"
          >
            Мои кампании
          </Link>
          <Link
            to="/graveyard"
            className="block rounded-lg border px-6 py-4 text-xl font-medium text-center hover:bg-primary/10 transition"
          >
            Кладбище
          </Link>
        </nav>
      </div>
    </div>
  );
}