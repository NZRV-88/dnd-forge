import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { WEAPON_MASTERY } from '@/data/items/weapon-mastery';
import { WEAPON_PROPERTY } from '@/data/items/weapons';
import { DamageTypes } from '@/data/damageTypes';

export default function MagicItem() {
  const [name, setName] = useState<string>('');
  const [version, setVersion] = useState<string>('');
  const [rarity, setRarity] = useState<string>('common'); // По умолчанию "Обычный"
  const [itemType, setItemType] = useState<string>('weapon'); // По умолчанию "Оружие"
  const [weight, setWeight] = useState<string>(''); // Вес предмета
  const [cost, setCost] = useState<string>(''); // Стоимость предмета
  const [description, setDescription] = useState<string>(''); // Описание предмета
  
  // Поля для оружия
  const [attackBonus, setAttackBonus] = useState<string>('0'); // По умолчанию 0
  const [damageBonus, setDamageBonus] = useState<string>('0'); // По умолчанию 0
  const [weaponType, setWeaponType] = useState<string>('');
  const [weaponMastery, setWeaponMastery] = useState<string>('');
  const [weaponProperties, setWeaponProperties] = useState<string[]>([]); // Мультивыбор свойств
  const [damageSources, setDamageSources] = useState<Array<{
    id: string;
    diceCount: string;
    diceType: string;
    damageType: string;
  }>>([{ id: '1', diceCount: '', diceType: '', damageType: '' }]); // Источники урона
  
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/workshop');
  };

  // Функция для валидации числовых полей (только положительные числа)
  const handleNumberChange = (value: string, setter: (value: string) => void) => {
    if (value === '' || /^\d+$/.test(value)) {
      setter(value);
    }
  };

  // Функция для работы с мультивыбором свойств оружия
  const handlePropertyChange = (propertyKey: string, checked: boolean) => {
    if (checked) {
      setWeaponProperties(prev => [...prev, propertyKey]);
    } else {
      setWeaponProperties(prev => prev.filter(key => key !== propertyKey));
    }
  };

  // Функции для управления источниками урона
  const addDamageSource = () => {
    const newId = (damageSources.length + 1).toString();
    setDamageSources(prev => [...prev, { 
      id: newId, 
      diceCount: '', 
      diceType: '', 
      damageType: '' 
    }]);
  };

  const removeDamageSource = (id: string) => {
    if (damageSources.length > 1) {
      setDamageSources(prev => prev.filter(source => source.id !== id));
    }
  };

  const updateDamageSource = (id: string, field: 'diceCount' | 'diceType' | 'damageType', value: string) => {
    setDamageSources(prev => prev.map(source => 
      source.id === id ? { ...source, [field]: value } : source
    ));
  };

  // Функция валидации формы
  const isFormValid = () => {
    return name.trim() !== '' && description.trim() !== '';
  };

  // Функция сохранения предмета
  const handleSave = async () => {
    if (!isFormValid()) {
      alert('Пожалуйста, заполните обязательные поля: Название и Описание');
      return;
    }

    try {
      // Подготовка данных для сохранения
      const itemData = {
        name: name.trim(),
        version: version.trim(),
        rarity,
        itemType,
        weight: weight ? parseInt(weight) : 0,
        cost: cost ? parseInt(cost) : 0,
        description: description.trim(),
        weapon: itemType === 'weapon' ? {
          attackBonus,
          damageBonus,
          weaponType,
          weaponMastery,
          weaponProperties,
          damageSources
        } : null
      };

      console.log('Сохранение предмета:', itemData);
      
      // TODO: Здесь будет вызов к Supabase для сохранения
      // const { data, error } = await supabase
      //   .from('magic_items')
      //   .insert([{ user_id: user.id, data: itemData }]);
      
      alert('Предмет успешно сохранен!');
      navigate('/workshop');
      
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
      alert('Произошла ошибка при сохранении предмета');
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
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                     {/* Название */}
                     <div className="space-y-2 xl:col-span-2">
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

                     {/* Вес */}
                     <div className="space-y-2">
                       <label className="text-sm font-medium">Вес (фнт.)</label>
                       <Input
                         value={weight}
                         onChange={(e) => handleNumberChange(e.target.value, setWeight)}
                         placeholder="0"
                         type="text"
                         className="w-20"
                       />
                     </div>

                     {/* Стоимость */}
                     <div className="space-y-2">
                       <label className="text-sm font-medium">Стоимость (ЗМ)</label>
                       <Input
                         value={cost}
                         onChange={(e) => handleNumberChange(e.target.value, setCost)}
                         placeholder="0"
                         type="text"
                         className="w-16"
                       />
                     </div>
                   </div>

                   {/* Контент в зависимости от типа предмета */}
                   {itemType === 'weapon' && (
                     <div className="space-y-6">
                       <h3 className="text-lg font-semibold">Свойства оружия</h3>
                       
                       {/* Первый ряд - основные бонусы */}
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                         {/* Бонус Атаки */}
                         <div className="space-y-2">
                           <label className="text-sm font-medium">Бонус Атаки</label>
                           <Select value={attackBonus} onValueChange={setAttackBonus}>
                             <SelectTrigger>
                               <SelectValue placeholder="Выберите бонус" />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="-5">-5</SelectItem>
                               <SelectItem value="-4">-4</SelectItem>
                               <SelectItem value="-3">-3</SelectItem>
                               <SelectItem value="-2">-2</SelectItem>
                               <SelectItem value="-1">-1</SelectItem>
                               <SelectItem value="0">0</SelectItem>
                               <SelectItem value="+1">+1</SelectItem>
                               <SelectItem value="+2">+2</SelectItem>
                               <SelectItem value="+3">+3</SelectItem>
                               <SelectItem value="+4">+4</SelectItem>
                               <SelectItem value="+5">+5</SelectItem>
                             </SelectContent>
                           </Select>
                         </div>

                         {/* Бонус Урона */}
                         <div className="space-y-2">
                           <label className="text-sm font-medium">Бонус Урона</label>
                           <Select value={damageBonus} onValueChange={setDamageBonus}>
                             <SelectTrigger>
                               <SelectValue placeholder="Выберите бонус" />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="-5">-5</SelectItem>
                               <SelectItem value="-4">-4</SelectItem>
                               <SelectItem value="-3">-3</SelectItem>
                               <SelectItem value="-2">-2</SelectItem>
                               <SelectItem value="-1">-1</SelectItem>
                               <SelectItem value="0">0</SelectItem>
                               <SelectItem value="+1">+1</SelectItem>
                               <SelectItem value="+2">+2</SelectItem>
                               <SelectItem value="+3">+3</SelectItem>
                               <SelectItem value="+4">+4</SelectItem>
                               <SelectItem value="+5">+5</SelectItem>
                             </SelectContent>
                           </Select>
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

                         {/* Мастерство */}
                         <div className="space-y-2">
                           <label className="text-sm font-medium">Мастерство</label>
                           <Select value={weaponMastery} onValueChange={setWeaponMastery}>
                             <SelectTrigger>
                               <SelectValue placeholder="Выберите мастерство" />
                             </SelectTrigger>
                             <SelectContent>
                               {WEAPON_MASTERY.map((mastery) => (
                                 <SelectItem key={mastery.key} value={mastery.key}>
                                   {mastery.name}
                                 </SelectItem>
                               ))}
                             </SelectContent>
                           </Select>
                         </div>
                       </div>

                       {/* Второй ряд - свойства оружия */}
                       <div className="space-y-4">
                         <h4 className="text-md font-medium">Свойства оружия</h4>
                         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                           {WEAPON_PROPERTY.map((property) => (
                             <div key={property.key} className="flex items-center space-x-2">
                               <Checkbox
                                 id={property.key}
                                 checked={weaponProperties.includes(property.key)}
                                 onCheckedChange={(checked) => 
                                   handlePropertyChange(property.key, checked as boolean)
                                 }
                               />
                               <label
                                 htmlFor={property.key}
                                 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                               >
                                 {property.name}
                               </label>
                             </div>
                           ))}
                         </div>
                       </div>

                       {/* Третий ряд - источники урона */}
                       <div className="space-y-4">
                         <div className="flex items-center justify-between">
                           <h4 className="text-md font-medium">Источники урона</h4>
                           <Button
                             type="button"
                             variant="outline"
                             size="sm"
                             onClick={addDamageSource}
                             className="flex items-center gap-2"
                           >
                             <span className="text-lg">+</span>
                             Добавить источник урона
                           </Button>
                         </div>
                         
                         <div className="space-y-3">
                           {damageSources.map((source, index) => (
                             <div key={source.id} className="relative border rounded-lg p-4 bg-muted/30">
                               {/* Кнопка удаления */}
                               {damageSources.length > 1 && (
                                 <button
                                   type="button"
                                   onClick={() => removeDamageSource(source.id)}
                                   className="absolute top-2 right-2 text-muted-foreground hover:text-destructive transition-colors"
                                 >
                                   <span className="text-lg">×</span>
                                 </button>
                               )}
                               
                               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                 {/* Количество костей */}
                                 <div className="space-y-2">
                                   <label className="text-sm font-medium">
                                     Количество костей {index > 0 && `#${index + 1}`}
                                   </label>
                                   <Input
                                     value={source.diceCount}
                                     onChange={(e) => handleNumberChange(e.target.value, (value) => 
                                       updateDamageSource(source.id, 'diceCount', value)
                                     )}
                                     placeholder="1"
                                     type="text"
                                   />
                                 </div>

                                 {/* Тип костей */}
                                 <div className="space-y-2">
                                   <label className="text-sm font-medium">Тип костей</label>
                                   <Select 
                                     value={source.diceType} 
                                     onValueChange={(value) => updateDamageSource(source.id, 'diceType', value)}
                                   >
                                     <SelectTrigger>
                                       <SelectValue placeholder="Выберите тип костей" />
                                     </SelectTrigger>
                                     <SelectContent>
                                       <SelectItem value="d4">d4</SelectItem>
                                       <SelectItem value="d6">d6</SelectItem>
                                       <SelectItem value="d8">d8</SelectItem>
                                       <SelectItem value="d10">d10</SelectItem>
                                       <SelectItem value="d12">d12</SelectItem>
                                       <SelectItem value="d20">d20</SelectItem>
                                     </SelectContent>
                                   </Select>
                                 </div>

                                 {/* Тип урона */}
                                 <div className="space-y-2">
                                   <label className="text-sm font-medium">Тип урона</label>
                                   <Select 
                                     value={source.damageType} 
                                     onValueChange={(value) => updateDamageSource(source.id, 'damageType', value)}
                                   >
                                     <SelectTrigger>
                                       <SelectValue placeholder="Выберите тип урона" />
                                     </SelectTrigger>
                                     <SelectContent>
                                       {DamageTypes.map((type) => (
                                         <SelectItem key={type.key} value={type.key}>
                                           {type.key}
                                         </SelectItem>
                                       ))}
                                     </SelectContent>
                                   </Select>
                                 </div>
                               </div>
                             </div>
                           ))}
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

                   {/* Описание предмета */}
                   <div className="space-y-2">
                     <label className="text-sm font-medium">
                       Описание <span className="text-red-500">*</span>
                     </label>
                     <textarea
                       value={description}
                       onChange={(e) => setDescription(e.target.value)}
                       placeholder="Опишите магический предмет, его историю, особенности и эффекты..."
                       className="w-full min-h-[120px] px-3 py-2 border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md resize-vertical"
                     />
                   </div>

                   {/* Кнопки действий */}
                   <div className="flex justify-between pt-4">
                     <Button variant="outline" onClick={handleBack}>
                       Назад к мастерской
                     </Button>
                     <Button onClick={handleSave} disabled={!isFormValid()}>
                       Сохранить предмет
                     </Button>
                   </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
