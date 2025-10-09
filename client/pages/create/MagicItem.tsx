import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function MagicItem() {
  const [name, setName] = useState<string>('');
  const [version, setVersion] = useState<string>('');
  const [rarity, setRarity] = useState<string>('');
  const [itemType, setItemType] = useState<string>('');
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/workshop');
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-4xl">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Создание магического предмета</h1>
          <p className="text-muted-foreground">
            Заполните информацию о магическом предмете
          </p>
        </div>

        {/* Основная карточка */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Первый ряд полей */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Название */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Название <span className="text-red-500">*</span>
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Введите название предмета"
                />
              </div>

              {/* Версия */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Версия</label>
                <Input
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="Версия"
                />
              </div>

              {/* Редкость */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Редкость <span className="text-red-500">*</span>
                </label>
                <Select value={rarity} onValueChange={setRarity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите редкость" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="common">Обычный</SelectItem>
                    <SelectItem value="uncommon">Необычный</SelectItem>
                    <SelectItem value="rare">Редкий</SelectItem>
                    <SelectItem value="very-rare">Очень редкий</SelectItem>
                    <SelectItem value="legendary">Легендарный</SelectItem>
                    <SelectItem value="artifact">Артефакт</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Тип предмета */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Тип предмета <span className="text-red-500">*</span>
                </label>
                <Select value={itemType} onValueChange={setItemType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weapon">Оружие</SelectItem>
                    <SelectItem value="armor">Доспех</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Кнопка назад */}
            <div className="flex justify-start pt-4">
              <Button variant="outline" onClick={handleBack}>
                Назад к мастерской
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
