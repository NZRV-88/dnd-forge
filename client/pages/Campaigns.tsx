import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Campaigns() {
  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-baseline justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Кампании</h1>
            <p className="text-sm text-muted-foreground">
              Управление партиями и заметками мастера.
            </p>
          </div>
          <Button asChild variant="secondary">
            <Link to="/create">Добавить персонажа</Link>
          </Button>
        </div>
        <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
          Здесь будут ваши кампании, партии и мастерская информация. Можем
          связать с внешними сервисами.
        </div>
      </div>
    </div>
  );
}
