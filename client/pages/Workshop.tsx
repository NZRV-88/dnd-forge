import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function Workshop() {
  const [creating, setCreating] = useState(false);
  const [magicItems, setMagicItems] = useState<any[]>([]); // Пока пустой массив

  const createNewItem = async () => {
    setCreating(true);
    // Здесь будет логика создания магического предмета
    setTimeout(() => {
      setCreating(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Мастерская</h1>
        <Button
          onClick={createNewItem}
          disabled={creating}
        >
          {creating ? "Создание..." : "Создать магический предмет"}
        </Button>
      </div>

      {magicItems.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Здесь будут карточки магических предметов */}
        </div>
      ) : (
        <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-10 text-center text-muted-foreground">
          <div className="text-base">
            Здесь появится список ваших магических предметов.
          </div>
          <div className="mt-2 text-sm">Создайте свой первый магический предмет.</div>
          <div className="mt-6">
            <Button onClick={createNewItem} disabled={creating}>
              {creating ? "Создание..." : "Создать первый предмет"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
