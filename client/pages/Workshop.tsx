import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ChevronDown, ChevronUp, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { WEAPON_MASTERY } from '@/data/items/weapon-mastery';
import { WEAPON_PROPERTY, Weapons } from '@/data/items/weapons';

export default function Workshop() {
  const [creating, setCreating] = useState(false);
  const [magicItems, setMagicItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  // Загружаем магические предметы пользователя
  useEffect(() => {
    const loadMagicItems = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          console.error('Ошибка авторизации:', userError);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('magic_items')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Ошибка загрузки предметов:', error);
        } else {
          setMagicItems(data || []);
        }
      } catch (error) {
        console.error('Ошибка при загрузке предметов:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMagicItems();
  }, []);

  const createNewItem = async () => {
    setCreating(true);
    // Переходим на страницу создания магического предмета
    navigate('/create/magic-item');
    setCreating(false);
  };

  const editItem = (itemId: string) => {
    // Переходим на страницу редактирования (пока используем ту же страницу создания)
    navigate(`/create/magic-item?edit=${itemId}`);
  };

  const deleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('magic_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error('Ошибка при удалении предмета:', error);
        alert('Произошла ошибка при удалении предмета: ' + error.message);
        return;
      }

      // Обновляем список предметов
      setMagicItems(prev => prev.filter(item => item.id !== itemId));
      alert('Предмет успешно удален!');
    } catch (error) {
      console.error('Ошибка при удалении предмета:', error);
      alert('Произошла ошибка при удалении предмета');
    }
  };

  const addToInventory = async (item: any) => {
    try {
      // Получаем текущего пользователя
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        alert('Ошибка авторизации. Пожалуйста, войдите в систему.');
        return;
      }

      // Получаем список персонажей пользователя
      const { data: characters, error: charactersError } = await supabase
        .from('characters')
        .select('id, data')
        .eq('user_id', user.id);

      if (charactersError || !characters || characters.length === 0) {
        alert('У вас нет персонажей. Сначала создайте персонажа.');
        return;
      }

      // Если у пользователя только один персонаж, добавляем предмет к нему
      if (characters.length === 1) {
        const character = characters[0];
        const characterData = character.data || {};
        
        // Инициализируем инвентарь если его нет
        if (!characterData.basics) {
          characterData.basics = {};
        }
        if (!characterData.basics.equipment) {
          characterData.basics.equipment = [];
        }

        // Добавляем предмет в инвентарь
        const inventoryItem = {
          id: `magic_${item.id}`,
          name: item.data.name,
          type: 'magic_item',
          magicItemId: item.id,
          quantity: 1,
          ...item.data
        };

        characterData.basics.equipment.push(inventoryItem);

        console.log('Workshop: Added magic item to inventory:', {
          characterId: character.id,
          characterName: character.data?.basics?.name,
          item: inventoryItem,
          equipmentLength: characterData.basics.equipment.length
        });

        // Сохраняем обновленные данные персонажа
        const { error: updateError } = await supabase
          .from('characters')
          .update({ data: characterData })
          .eq('id', character.id);

        if (updateError) {
          console.error('Ошибка при добавлении предмета в инвентарь:', updateError);
          alert('Произошла ошибка при добавлении предмета в инвентарь: ' + updateError.message);
          return;
        }

        console.log('Workshop: Successfully saved character data:', {
          characterId: character.id,
          equipmentLength: characterData.basics.equipment.length,
          equipmentItems: characterData.basics.equipment.map(item => ({ name: item.name, type: item.type }))
        });

        alert(`Предмет "${item.data.name}" добавлен в инвентарь персонажа!`);
        return;
      }

      // Если у пользователя несколько персонажей, показываем список для выбора
      const characterNames = characters.map(char => char.data?.basics?.name || `Персонаж ${char.id}`);
      const selectedIndex = prompt(`Выберите персонажа для добавления предмета:\n${characterNames.map((name, index) => `${index + 1}. ${name}`).join('\n')}\n\nВведите номер персонажа (1-${characters.length}):`);
      
      if (!selectedIndex) return;

      const characterIndex = parseInt(selectedIndex) - 1;
      if (isNaN(characterIndex) || characterIndex < 0 || characterIndex >= characters.length) {
        alert('Неверный номер персонажа.');
        return;
      }

      const selectedCharacter = characters[characterIndex];
      const characterData = selectedCharacter.data || {};
      
      // Инициализируем инвентарь если его нет
      if (!characterData.basics) {
        characterData.basics = {};
      }
      if (!characterData.basics.equipment) {
        characterData.basics.equipment = [];
      }

      // Добавляем предмет в инвентарь
      const inventoryItem = {
        id: `magic_${item.id}`,
        name: item.data.name,
        type: 'magic_item',
        magicItemId: item.id,
        quantity: 1,
        ...item.data
      };

      characterData.basics.equipment.push(inventoryItem);

      console.log('Workshop: Added magic item to inventory (multiple characters):', {
        characterId: selectedCharacter.id,
        characterName: characterNames[characterIndex],
        item: inventoryItem,
        equipmentLength: characterData.basics.equipment.length
      });

      // Сохраняем обновленные данные персонажа
      const { error: updateError } = await supabase
        .from('characters')
        .update({ data: characterData })
        .eq('id', selectedCharacter.id);

      if (updateError) {
        console.error('Ошибка при добавлении предмета в инвентарь:', updateError);
        alert('Произошла ошибка при добавлении предмета в инвентарь: ' + updateError.message);
        return;
      }

      console.log('Workshop: Successfully saved character data (multiple characters):', {
        characterId: selectedCharacter.id,
        equipmentLength: characterData.basics.equipment.length,
        equipmentItems: characterData.basics.equipment.map(item => ({ name: item.name, type: item.type }))
      });

      alert(`Предмет "${item.data.name}" добавлен в инвентарь персонажа "${characterNames[characterIndex]}"!`);

    } catch (error) {
      console.error('Ошибка при добавлении предмета в инвентарь:', error);
      alert('Произошла ошибка при добавлении предмета в инвентарь');
    }
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'uncommon': return 'bg-green-100 text-green-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'very-rare': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-orange-100 text-orange-800';
      case 'artifact': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRarityName = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'Обычный';
      case 'uncommon': return 'Необычный';
      case 'rare': return 'Редкий';
      case 'very-rare': return 'Очень редкий';
      case 'legendary': return 'Легендарный';
      case 'artifact': return 'Артефакт';
      default: return rarity;
    }
  };

  const getItemSubtitle = (item: any) => {
    if (item.data.itemType === 'weapon' && item.data.weapon?.weaponKind) {
      return getWeaponName(item.data.weapon.weaponKind);
    } else if (item.data.itemType === 'armor') {
      return 'Доспех';
    }
    return 'Предмет';
  };

  const getWeaponMasteryName = (masteryKey: string) => {
    const mastery = WEAPON_MASTERY.find(m => m.key === masteryKey);
    return mastery ? mastery.name : masteryKey;
  };

  const getWeaponPropertyName = (propertyKey: string) => {
    const property = WEAPON_PROPERTY.find(p => p.key === propertyKey);
    return property ? property.name : propertyKey;
  };

  const getWeaponName = (weaponKey: string) => {
    const weapon = Weapons.find(w => w.key === weaponKey);
    return weapon ? weapon.name : weaponKey;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 text-center">
        <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-10">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <div className="text-lg">Загрузка предметов...</div>
          </div>
        </div>
      </div>
    );
  }

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
          {magicItems.map((item) => {
            const isExpanded = expandedItems.has(item.id);
            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight">
                        {item.data.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {getItemSubtitle(item)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getRarityColor(item.data.rarity)}>
                        {getRarityName(item.data.rarity)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">

                  {/* Кнопка раскрытия */}
                  <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(item.id)}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full justify-between p-0 h-auto">
                        <span className="text-sm text-muted-foreground">
                          {isExpanded ? 'Скрыть детали' : 'Показать детали'}
                        </span>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="space-y-3 pt-3">
                      {/* Основная информация */}
                      <div className="space-y-2">
                        {item.data.version && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Версия: </span>
                            <span className="font-medium">{item.data.version}</span>
                          </div>
                        )}
                        
                        {item.data.weight > 0 && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Вес: </span>
                            <span className="font-medium">{item.data.weight} фнт.</span>
                          </div>
                        )}
                        
                        {item.data.cost > 0 && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Стоимость: </span>
                            <span className="font-medium">{item.data.cost} ЗМ</span>
                          </div>
                        )}
                      </div>

                      {/* Детальная информация об оружии */}
                      {item.data.weapon && (
                        <div className="space-y-2 pt-2 border-t">
                          <h4 className="text-sm font-medium">Свойства оружия</h4>
                          <div className="space-y-1">
                            {item.data.weapon.weaponType && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Тип оружия: </span>
                                <span className="font-medium">
                                  {item.data.weapon.weaponType === 'melee' ? 'Ближний бой' : 'Дальний бой'}
                                </span>
                              </div>
                            )}
                            {item.data.weapon.weaponMastery && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Мастерство: </span>
                                <span className="font-medium">{getWeaponMasteryName(item.data.weapon.weaponMastery)}</span>
                              </div>
                            )}
                            {item.data.weapon.weaponProperties && item.data.weapon.weaponProperties.length > 0 && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Свойства: </span>
                                <span className="font-medium">
                                  {item.data.weapon.weaponProperties.map(prop => getWeaponPropertyName(prop)).join(', ')}
                                </span>
                              </div>
                            )}
                            {item.data.weapon.damageSources && item.data.weapon.damageSources.length > 0 && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Урон: </span>
                                <span className="font-medium">
                                  {item.data.weapon.damageSources.map((source: any, index: number) => 
                                    `${source.diceCount}${source.diceType} ${source.damageType}`
                                  ).join(' + ')}
                                </span>
                              </div>
                            )}
                            <div className="text-sm">
                              <span className="text-muted-foreground">Бонус атаки: </span>
                              <span className="font-medium">{item.data.weapon.attackBonus}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Бонус урона: </span>
                              <span className="font-medium">{item.data.weapon.damageBonus}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Описание */}
                      {item.data.description && (
                        <div className="pt-2 border-t">
                          <h4 className="text-sm font-medium mb-2">Описание</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.data.description}
                          </p>
                        </div>
                      )}

                      {/* Метаданные */}
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Создан: {new Date(item.created_at).toLocaleDateString('ru-RU')}</span>
                          <span>{item.data.source}</span>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Кнопки действий */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editItem(item.id)}
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Редактировать
                      </Button>
                      
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => addToInventory(item)}
                        className="flex items-center gap-2"
                      >
                        <span className="text-lg">+</span>
                        В инвентарь
                      </Button>
                    </div>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="flex items-center gap-2">
                          <Trash2 className="h-4 w-4" />
                          Удалить
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Удалить предмет?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Вы уверены, что хотите удалить "{item.data.name}"? Это действие нельзя отменить.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteItem(item.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Удалить
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
