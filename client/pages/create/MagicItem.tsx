import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function MagicItem() {
  const [name, setName] = useState<string>('');
  const [version, setVersion] = useState<string>('');
  const [rarity, setRarity] = useState<string>('common'); // По умолчанию "Обычный"
  const [itemType, setItemType] = useState<string>('weapon'); // По умолчанию "Оружие"
  
  // Поля для оружия
  const [attackBonus, setAttackBonus] = useState<string>('');
  const [damageBonus, setDamageBonus] = useState<string>('');
  const [weaponType, setWeaponType] = useState<string>('');
  
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/workshop');
  };

  // Функция для валидации числовых полей
  const handleNumberChange = (value: string, setter: (value: string) => void) => {
    // Разрешаем только цифры, знак минус в начале и пустую строку
    if (value === '' || /^-?\d*$/.test(value)) {
      setter(value);
    }
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

            {/* Контент в зависимости от типа предмета */}
            {itemType === 'weapon' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Свойства оружия</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Бонус Атаки */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Бонус Атаки</label>
                    <Input
                      value={attackBonus}
                      onChange={(e) => handleNumberChange(e.target.value, setAttackBonus)}
                      placeholder="+1, +2, +3..."
                      type="text"
                    />
                  </div>

                  {/* Бонус Урона */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Бонус Урона</label>
                    <Input
                      value={damageBonus}
                      onChange={(e) => handleNumberChange(e.target.value, setDamageBonus)}
                      placeholder="+1, +2, +3..."
                      type="text"
                    />
                  </div>

                  {/* Тип Оружия */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Тип Оружия</label>
                    <Select value={weaponType} onValueChange={setWeaponType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип оружия" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="melee">Ближний бой</SelectItem>
                        <SelectItem value="ranged">Дальний бой</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {itemType === 'armor' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Свойства доспеха</h3>
                <p className="text-muted-foreground">Свойства доспеха будут добавлены позже</p>
              </div>
            )}

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
