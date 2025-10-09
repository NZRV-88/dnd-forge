import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { WEAPON_MASTERY } from '@/data/items/weapon-mastery';
import { WEAPON_PROPERTY, Weapons } from '@/data/items/weapons';
import { DamageTypes } from '@/data/damageTypes';
import { supabase } from '@/lib/supabaseClient';

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
  const [weaponKind, setWeaponKind] = useState<string>(''); // Вид оружия
  const [weaponMastery, setWeaponMastery] = useState<string>('');
  const [weaponCategory, setWeaponCategory] = useState<string>(''); // Категория оружия
  const [weaponRange, setWeaponRange] = useState<string>(''); // Дальность оружия
  const [weaponProperties, setWeaponProperties] = useState<string[]>([]); // Мультивыбор свойств
  const [damageSources, setDamageSources] = useState<Array<{
    id: string;
    diceCount: string;
    diceType: string;
    damageType: string;
  }>>([{ id: '1', diceCount: '', diceType: '', damageType: '' }]); // Источники урона
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Загружаем данные предмета для редактирования
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      setIsEditing(true);
      setEditingItemId(editId);
      loadItemForEdit(editId);
    }
  }, [searchParams]);

  const loadItemForEdit = async (itemId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('magic_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (error || !data) {
        console.error('Ошибка загрузки предмета:', error);
        alert('Ошибка загрузки предмета для редактирования');
        navigate('/workshop');
        return;
      }

      const itemData = data.data;
      
      // Заполняем форму данными предмета
      setName(itemData.name || '');
      setVersion(itemData.version || '');
      setRarity(itemData.rarity || 'common');
      setItemType(itemData.itemType || 'weapon');
      setWeight(itemData.weight?.toString() || '');
      setCost(itemData.cost?.toString() || '');
      setDescription(itemData.description || '');

      if (itemData.weapon) {
        setAttackBonus(itemData.weapon.attackBonus || '0');
        setDamageBonus(itemData.weapon.damageBonus || '0');
        setWeaponType(itemData.weapon.weaponType || '');
        setWeaponKind(itemData.weapon.weaponKind || '');
        setWeaponMastery(itemData.weapon.weaponMastery || '');
        setWeaponCategory(itemData.weapon.weaponCategory || '');
        setWeaponRange(itemData.weapon.weaponRange || '');
        setWeaponProperties(itemData.weapon.weaponProperties || []);
        setDamageSources(itemData.weapon.damageSources || [{ id: '1', diceCount: '', diceType: '', damageType: '' }]);
      }
    } catch (error) {
      console.error('Ошибка при загрузке предмета:', error);
      alert('Ошибка при загрузке предмета');
      navigate('/workshop');
    } finally {
      setLoading(false);
    }
  };

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

  // Обработчик изменения типа оружия
  const handleWeaponTypeChange = (type: string) => {
    setWeaponType(type);
    // Сбрасываем дальность при изменении типа оружия
    setWeaponRange('');
  };

  // Обработчик изменения дальности
  const handleRangeChange = (value: string) => {
    if (weaponType === 'melee') {
      // Для ближнего оружия только цифры
      const numericValue = value.replace(/\D/g, '');
      setWeaponRange(numericValue);
    } else if (weaponType === 'ranged') {
      // Для дальнего оружия формат --/--
      const parts = value.split('/');
      if (parts.length === 2) {
        const first = parts[0].replace(/\D/g, '');
        const second = parts[1].replace(/\D/g, '');
        setWeaponRange(`${first}/${second}`);
      } else if (value.includes('/')) {
        // Если есть слеш, но не в правильном формате
        const cleanValue = value.replace(/[^\d/]/g, '');
        setWeaponRange(cleanValue);
      } else {
        // Если нет слеша, добавляем его
        const numericValue = value.replace(/\D/g, '');
        if (numericValue) {
          setWeaponRange(`${numericValue}/`);
        } else {
          setWeaponRange('');
        }
      }
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
      setLoading(true);
      
      // Получаем текущего пользователя
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        alert('Ошибка авторизации. Пожалуйста, войдите в систему.');
        return;
      }

      // Подготовка данных для сохранения
      const itemData = {
        name: name.trim(),
        version: version.trim(),
        rarity,
        itemType,
        weight: weight ? parseInt(weight) : 0,
        cost: cost ? parseInt(cost) : 0,
        description: description.trim(),
        source: 'Homebrew', // Обязательно добавляем источник
        weapon: itemType === 'weapon' ? {
          attackBonus,
          damageBonus,
          weaponType,
          weaponKind,
          weaponMastery,
          weaponCategory,
          weaponRange,
          weaponProperties,
          damageSources
        } : null
      };

      console.log(isEditing ? 'Обновление предмета:' : 'Сохранение предмета:', itemData);
      
      let result;
      if (isEditing && editingItemId) {
        // Обновляем существующий предмет
        result = await supabase
          .from('magic_items')
          .update({ data: itemData })
          .eq('id', editingItemId)
          .select();
      } else {
        // Создаем новый предмет
        result = await supabase
          .from('magic_items')
          .insert([{ 
            user_id: user.id, 
            data: itemData
          }])
          .select();
      }
      
      if (result.error) {
        console.error('Ошибка при сохранении:', result.error);
        alert('Произошла ошибка при сохранении предмета: ' + result.error.message);
        return;
      }
      
      console.log('Предмет успешно сохранен:', result.data);
      alert(isEditing ? 'Предмет успешно обновлен!' : 'Предмет успешно создан!');
      navigate('/workshop');
      
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
      alert('Произошла ошибка при сохранении предмета');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="container mx-auto py-10 text-center">
        <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-10">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <div className="text-lg">Загрузка предмета для редактирования...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-4xl">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {isEditing ? 'Редактирование магического предмета' : 'Создание магического предмета'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Измените информацию о магическом предмете' : 'Заполните информацию о магическом предмете'}
          </p>
        </div>

        {/* Основная карточка */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
                   {/* Первый ряд полей */}
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[2fr_1fr_1fr_1fr_0.5fr_0.5fr] gap-3">
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

                     {/* Вес */}
                     <div className="space-y-2">
                       <label className="text-sm font-medium">Вес (фнт.)</label>
                       <Input
                         value={weight}
                         onChange={(e) => handleNumberChange(e.target.value, setWeight)}
                         placeholder="0"
                         type="text"
                       />
                     </div>

                     {/* Стоимость */}
                     <div className="space-y-2">
                       <label className="text-sm font-medium">Цена</label>
                       <Input
                         value={cost}
                         onChange={(e) => handleNumberChange(e.target.value, setCost)}
                         placeholder="0"
                         type="text"
                       />
                     </div>
                   </div>

                   {/* Контент в зависимости от типа предмета */}
                   {itemType === 'weapon' && (
                     <div className="space-y-6">
                       <h3 className="text-lg font-semibold">Оружие</h3>
                       
                       {/* Первый ряд - основные свойства */}
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                         {/* Категория */}
                         <div className="space-y-2">
                           <label className="text-sm font-medium">Категория</label>
                           <Select value={weaponCategory} onValueChange={setWeaponCategory}>
                             <SelectTrigger className="pl-2">
                               <SelectValue placeholder="--" />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="simple">Простое</SelectItem>
                               <SelectItem value="martial">Воинское</SelectItem>
                             </SelectContent>
                           </Select>
                         </div>

                         {/* Тип */}
                         <div className="space-y-2">
                           <label className="text-sm font-medium">Тип</label>
                           <Select value={weaponType} onValueChange={handleWeaponTypeChange}>
                             <SelectTrigger className="pl-2">
                               <SelectValue placeholder="--" />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="melee">Ближний бой</SelectItem>
                               <SelectItem value="ranged">Дальний бой</SelectItem>
                             </SelectContent>
                           </Select>
                         </div>

                         {/* Вид */}
                         <div className="space-y-2">
                           <label className="text-sm font-medium">Вид</label>
                           <Select value={weaponKind} onValueChange={setWeaponKind}>
                             <SelectTrigger className="pl-2">
                               <SelectValue placeholder="--" />
                             </SelectTrigger>
                             <SelectContent>
                               {Weapons.filter(weapon => !weapon.name.includes('+')).map((weapon) => (
                                 <SelectItem key={weapon.key} value={weapon.key}>
                                   {weapon.name}
                                 </SelectItem>
                               ))}
                             </SelectContent>
                           </Select>
                         </div>

                         {/* Мастерство */}
                         <div className="space-y-2">
                           <label className="text-sm font-medium">Мастерство</label>
                           <Select value={weaponMastery} onValueChange={setWeaponMastery}>
                             <SelectTrigger className="pl-2">
                               <SelectValue placeholder="--" />
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

                       {/* Второй ряд - бонусы и дальность */}
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         {/* Дальность */}
                         <div className="space-y-2">
                           <label className="text-sm font-medium">Дальность</label>
                           <Input
                             value={weaponRange}
                             onChange={(e) => handleRangeChange(e.target.value)}
                             placeholder={weaponType === 'melee' ? 'Введите число' : 'Введите формат --/--'}
                             className="pl-2"
                           />
                         </div>

                         {/* Бонус Атаки */}
                         <div className="space-y-2">
                           <label className="text-sm font-medium">Бонус атаки</label>
                           <Select value={attackBonus} onValueChange={setAttackBonus}>
                             <SelectTrigger className="pl-2">
                               <SelectValue placeholder="--" />
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
                           <label className="text-sm font-medium">Бонус урона</label>
                           <Select value={damageBonus} onValueChange={setDamageBonus}>
                             <SelectTrigger className="pl-2">
                               <SelectValue placeholder="--" />
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
                       </div>

                       {/* Третий ряд - свойства оружия */}
                       <div className="space-y-4">
                         <h4 className="text-md font-medium">Свойства</h4>
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


                       {/* Четвертый ряд - источники урона */}
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
                     <Button onClick={handleSave} disabled={!isFormValid() || loading}>
                       {loading ? 'Сохранение...' : (isEditing ? 'Обновить предмет' : 'Сохранить предмет')}
                     </Button>
                   </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
