import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";

function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2", className)}>
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/20">
        {/* D20 icon */}
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" />
          <polyline points="12,2 12,22" />
          <polyline points="3,7 21,7" />
          <polyline points="3,17 21,17" />
          <polyline points="3,7 12,12 21,7" />
        </svg>
      </span>
      <div className="leading-tight">
        <span className="block text-sm font-semibold tracking-wide text-foreground/80">
          Кузница
        </span>
        <span className="block -mt-0.5 text-lg font-bold tracking-wide text-foreground">
          Персонажей
        </span>
      </div>
    </Link>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              to="/"
              className="text-sm text-foreground/70 hover:text-foreground"
            >
              Главная
            </Link>
            <Link
              to="/characters"
              className="text-sm text-foreground/70 hover:text-foreground"
            >
              Мои персонажи
            </Link>
            <Link
              to="/campaigns"
              className="text-sm text-foreground/70 hover:text-foreground"
            >
              Кампании
            </Link>
            <Link
              to="/graveyard"
              className="text-sm text-foreground/70 hover:text-foreground"
            >
              Кладбище
            </Link>
            <Link
              to="/create"
              className="text-sm text-foreground/70 hover:text-foreground"
            >
              Создать персонажа
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="secondary">
              <Link to="/create">Начать</Link>
            </Button>
          </div>
        </div>
      </header>
      <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary/70" />

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-background/60">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-8 md:h-20 md:flex-row">
          <Logo className="opacity-80" />
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Кузница Персонажей. Неофициальный
            фан-сайт DnD. Все права принадлежат их владельцам.
            <br />
            Источники правил и текстов: dnd.su (5e SRD и материалы), указываются
            на страницах умений.
          </p>
          <div className="flex items-center gap-3">
            <Button asChild size="sm" variant="ghost">
              <Link to="/">Политика</Link>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link to="/">Контакты</Link>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
