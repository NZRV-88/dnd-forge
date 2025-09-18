export default function Graveyard() {
  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-5xl">
        <div>
          <h1 className="text-2xl font-semibold">Кладбище персонажей</h1>
          <p className="text-sm text-muted-foreground">
            Память о павших героях.
          </p>
        </div>
        <div className="mt-6 rounded-2xl border bg-card p-8 text-center text-muted-foreground">
          Здесь мы с почётом храним павших героев. Позже добавим экспорт
          памятных страниц.
        </div>
      </div>
    </div>
  );
}
