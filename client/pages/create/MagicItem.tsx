import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function MagicItem() {
  const [itemType, setItemType] = useState<string>('');
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/workshop');
  };

  const handleNext = () => {
    if (!itemType) return;
    // Здесь будет логика перехода к следующему шагу
    console.log('Выбранный тип предмета:', itemType);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-2xl">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Создание магического предмета</h1>
          <p className="text-muted-foreground">
            Выберите тип магического предмета для начала создания
          </p>
        </div>

        {/* Основная карточка */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Тип магического предмета</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Выберите тип предмета:</label>
              <Select value={itemType} onValueChange={setItemType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Выберите тип магического предмета" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weapon">Оружие</SelectItem>
                  <SelectItem value="armor">Доспех</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Описание выбранного типа */}
            {itemType && (
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">
                  {itemType === 'weapon' ? 'Оружие' : 'Доспех'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {itemType === 'weapon' 
                    ? 'Магическое оружие может увеличивать урон, давать бонусы к атаке или иметь особые свойства.'
                    : 'Магический доспех может увеличивать класс брони, давать сопротивление урону или другие защитные свойства.'
                  }
                </p>
              </div>
            )}

            {/* Кнопки навигации */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleBack}>
                Назад
              </Button>
              <Button 
                onClick={handleNext} 
                disabled={!itemType}
                className="min-w-[120px]"
              >
                Далее
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
