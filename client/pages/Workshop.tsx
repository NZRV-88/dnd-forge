import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import * as Icons from '@/components/refs/icons';

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

      {/* Инструменты мастера */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-6">Инструменты мастера</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Генераторы */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.Settings className="w-5 h-5 text-primary" />
                Генераторы
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Создавайте случайный контент для ваших приключений
              </p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Icons.Book className="w-4 h-4 mr-2" />
                  Генератор имён
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Icons.Sword className="w-4 h-4 mr-2" />
                  Генератор столкновений
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Icons.Star className="w-4 h-4 mr-2" />
                  Генератор добычи
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Калькуляторы */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.Settings className="w-5 h-5 text-primary" />
                Калькуляторы
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Вычисляйте сложности и баланс для ваших игр
              </p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Icons.Sword className="w-4 h-4 mr-2" />
                  Калькулятор столкновений
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Icons.Award className="w-4 h-4 mr-2" />
                  Калькулятор опыта
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Icons.Zap className="w-4 h-4 mr-2" />
                  Калькулятор урона
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Справочники */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.Book className="w-5 h-5 text-primary" />
                Справочники
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Быстрый доступ к правилам и информации
              </p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Icons.Skull className="w-4 h-4 mr-2" />
                  Состояния
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Icons.Zap className="w-4 h-4 mr-2" />
                  Заклинания
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Icons.Skull className="w-4 h-4 mr-2" />
                  Монстры
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Инструменты */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.Settings className="w-5 h-5 text-primary" />
                Инструменты
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Полезные инструменты для ведения игры
              </p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Icons.Star className="w-4 h-4 mr-2" />
                  Бросок костей
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Icons.Clock className="w-4 h-4 mr-2" />
                  Трекер инициативы
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Icons.Book className="w-4 h-4 mr-2" />
                  Заметки мастера
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Ресурсы */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.Book className="w-5 h-5 text-primary" />
                Ресурсы
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Готовый контент для ваших приключений
              </p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Icons.Eye className="w-4 h-4 mr-2" />
                  Карты
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Icons.Star className="w-4 h-4 mr-2" />
                  Токены
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Icons.Settings className="w-4 h-4 mr-2" />
                  Звуковая панель
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Статистика */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.Award className="w-5 h-5 text-primary" />
                Статистика
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Анализ и статистика ваших игр
              </p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Icons.Clock className="w-4 h-4 mr-2" />
                  Статистика сессий
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Icons.Crown className="w-4 h-4 mr-2" />
                  Статистика персонажей
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Icons.ArrowUp className="w-4 h-4 mr-2" />
                  Аналитика кампаний
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Быстрые действия */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Быстрые действия</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Button size="lg" className="h-20 flex-col gap-2">
            <Icons.Star className="w-6 h-6" />
            <span>Быстрый бросок</span>
          </Button>
          <Button size="lg" variant="outline" className="h-20 flex-col gap-2">
            <Icons.Book className="w-6 h-6" />
            <span>Случайное имя</span>
          </Button>
          <Button size="lg" variant="outline" className="h-20 flex-col gap-2">
            <Icons.Sword className="w-6 h-6" />
            <span>Создать столкновение</span>
          </Button>
          <Button size="lg" variant="outline" className="h-20 flex-col gap-2">
            <Icons.Book className="w-6 h-6" />
            <span>Заметки</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
