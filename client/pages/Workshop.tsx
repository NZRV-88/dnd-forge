import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import * as Icons from '@/components/refs/icons';

export default function Workshop() {
  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-6xl">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Мастерская</h1>
          <p className="text-muted-foreground">
            Инструменты и ресурсы для мастера подземелий
          </p>
        </div>

        {/* Основные категории */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Генераторы */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.Wand className="w-5 h-5 text-primary" />
                Генераторы
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Создавайте случайный контент для ваших приключений
              </p>
              <div className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/workshop/name-generator">
                    <Icons.User className="w-4 h-4 mr-2" />
                    Генератор имён
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/workshop/encounter-generator">
                    <Icons.Swords className="w-4 h-4 mr-2" />
                    Генератор столкновений
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/workshop/loot-generator">
                    <Icons.Coins className="w-4 h-4 mr-2" />
                    Генератор добычи
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Калькуляторы */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.Calculator className="w-5 h-5 text-primary" />
                Калькуляторы
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Вычисляйте сложности и баланс для ваших игр
              </p>
              <div className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/workshop/encounter-calculator">
                    <Icons.Scale className="w-4 h-4 mr-2" />
                    Калькулятор столкновений
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/workshop/xp-calculator">
                    <Icons.Star className="w-4 h-4 mr-2" />
                    Калькулятор опыта
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/workshop/damage-calculator">
                    <Icons.Zap className="w-4 h-4 mr-2" />
                    Калькулятор урона
                  </Link>
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
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/workshop/conditions">
                    <Icons.AlertTriangle className="w-4 h-4 mr-2" />
                    Состояния
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/workshop/spells">
                    <Icons.Sparkles className="w-4 h-4 mr-2" />
                    Заклинания
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/workshop/monsters">
                    <Icons.Skull className="w-4 h-4 mr-2" />
                    Монстры
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Инструменты */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.Tool className="w-5 h-5 text-primary" />
                Инструменты
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Полезные инструменты для ведения игры
              </p>
              <div className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/workshop/dice-roller">
                    <Icons.Dice className="w-4 h-4 mr-2" />
                    Бросок костей
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/workshop/initiative-tracker">
                    <Icons.List className="w-4 h-4 mr-2" />
                    Трекер инициативы
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/workshop/notes">
                    <Icons.FileText className="w-4 h-4 mr-2" />
                    Заметки мастера
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Ресурсы */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.Folder className="w-5 h-5 text-primary" />
                Ресурсы
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Готовый контент для ваших приключений
              </p>
              <div className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/workshop/maps">
                    <Icons.Map className="w-4 h-4 mr-2" />
                    Карты
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/workshop/tokens">
                    <Icons.Circle className="w-4 h-4 mr-2" />
                    Токены
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/workshop/soundboard">
                    <Icons.Volume2 className="w-4 h-4 mr-2" />
                    Звуковая панель
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Статистика */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.BarChart className="w-5 h-5 text-primary" />
                Статистика
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Анализ и статистика ваших игр
              </p>
              <div className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/workshop/session-stats">
                    <Icons.Calendar className="w-4 h-4 mr-2" />
                    Статистика сессий
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/workshop/character-stats">
                    <Icons.Users className="w-4 h-4 mr-2" />
                    Статистика персонажей
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/workshop/campaign-analytics">
                    <Icons.TrendingUp className="w-4 h-4 mr-2" />
                    Аналитика кампаний
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Быстрые действия */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Быстрые действия</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button asChild size="lg" className="h-20 flex-col gap-2">
              <Link to="/workshop/quick-roll">
                <Icons.Dice className="w-6 h-6" />
                <span>Быстрый бросок</span>
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-20 flex-col gap-2">
              <Link to="/workshop/random-name">
                <Icons.User className="w-6 h-6" />
                <span>Случайное имя</span>
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-20 flex-col gap-2">
              <Link to="/workshop/encounter-builder">
                <Icons.Swords className="w-6 h-6" />
                <span>Создать столкновение</span>
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-20 flex-col gap-2">
              <Link to="/workshop/notes">
                <Icons.FileText className="w-6 h-6" />
                <span>Заметки</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
