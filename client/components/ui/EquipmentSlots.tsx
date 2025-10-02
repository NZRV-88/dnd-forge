import React from 'react';
import { EquippedItem } from '../../store/character';

interface EquipmentSlotsProps {
    weaponSlot1?: EquippedItem[]; // массив оружия в слоте I
    weaponSlot2?: EquippedItem[]; // массив оружия в слоте II
    shield1?: EquippedItem | null; // щит в наборе I
    shield2?: EquippedItem | null; // щит в наборе II
    isVersatile?: boolean; // универсальное ли оружие
    versatileMode?: boolean; // в двуручном ли режиме
    onVersatileToggle?: () => void; // переключение режима
    activeWeaponSlot?: 1 | 2; // активный слот оружия
    onSlotClick?: (slot: 1 | 2) => void; // клик по слоту
    className?: string;
}

export default function EquipmentSlots({ 
    weaponSlot1,
    weaponSlot2,
    shield1,
    shield2,
    isVersatile = false, 
    versatileMode = false, 
    onVersatileToggle,
    activeWeaponSlot = 1,
    onSlotClick,
    className = ""
}: EquipmentSlotsProps) {
    const renderSlot = (index: number, isSlot1: boolean) => {
        const currentWeapons = isSlot1 ? (weaponSlot1 || []) : (weaponSlot2 || []);
        const weaponSlots = Array.isArray(currentWeapons) ? currentWeapons.reduce((sum, w) => sum + (w.slots || 0), 0) : 0;
        
        // Щит занимает 1 слот в соответствующем наборе
        const currentShield = isSlot1 ? shield1 : shield2;
        const shieldSlots = currentShield ? 1 : 0;
        const isShieldInThisSlot = !!currentShield;
        
        const totalSlots = weaponSlots + (isShieldInThisSlot ? shieldSlots : 0);
        const isOccupied = index < totalSlots;
        const isWeaponSlot = isVersatile && isOccupied && weaponSlots > 0;
        
        // Щит отображается в своем слоте (после оружия)
        const shieldSlotIndex = weaponSlots;
        const isShieldSlot = isOccupied && isShieldInThisSlot && index === shieldSlotIndex;
        
        // Определяем, какое оружие находится в этом слоте
        let weaponInSlot = null;
        let weaponSlotType = '';
        if (isOccupied && !isShieldSlot && weaponSlots > 0) {
            // Находим оружие, которое занимает этот слот
            let currentSlot = 0;
            for (const weapon of currentWeapons) {
                if (index >= currentSlot && index < currentSlot + weapon.slots) {
                    weaponInSlot = weapon;
                    weaponSlotType = weapon.slots === 1 ? 'one-handed' : 'two-handed';
                    break;
                }
                currentSlot += weapon.slots;
            }
        }
        
        const isClickable = isVersatile && !versatileMode && !isOccupied && isSlot1;
        const isClickableToCancel = isVersatile && versatileMode && isOccupied && isSlot1 && (totalSlots === 2);
        
        // Отладочная информация
        console.log(`Slot ${isSlot1 ? 'I' : 'II'}, index ${index}:`, {
            weapons: Array.isArray(currentWeapons) ? currentWeapons.map(w => w.name) : [],
            weaponSlots,
            shieldSlots: isShieldInThisSlot ? shieldSlots : 0,
            totalSlots,
            isOccupied,
            isShieldSlot,
            weaponInSlot: weaponInSlot?.name,
            weaponSlotType,
            shieldSlotIndex,
            activeWeaponSlot,
            shield1: shield1?.name,
            shield2: shield2?.name,
            currentShield: currentShield?.name,
            index
        });
        
        return (
            <div
                key={index}
                className={`
                    w-3 h-3 border border-gray-400 rounded-sm transition-colors
                    ${isOccupied ? (
                        isShieldSlot 
                            ? 'bg-blue-500' 
                            : weaponSlotType === 'one-handed' 
                                ? 'bg-green-500' 
                                : weaponSlotType === 'two-handed' 
                                    ? 'bg-[#804c2d]' 
                                    : 'bg-primary'
                    ) : 'bg-transparent'}
                    ${isClickable ? 'cursor-pointer hover:bg-[#cf995f] border-primary' : ''}
                    ${isClickableToCancel ? 'cursor-pointer hover:bg-[#cf995f] border-[#cf995f]' : ''}
                    ${isWeaponSlot ? 'ring-1 ring-primary/50' : ''}
                    ${isShieldSlot ? 'ring-1 ring-blue-500/50' : ''}
                    ${weaponSlotType === 'one-handed' ? 'ring-1 ring-green-500/50' : ''}
                    ${weaponSlotType === 'two-handed' ? 'ring-1 ring-[#24180b]' : ''}
                `}
                onClick={(isClickable || isClickableToCancel) ? (e) => {
                    e.stopPropagation();
                    onVersatileToggle?.();
                } : undefined}
                title={
                    isClickable 
                        ? 'Кликните для двуручного режима' 
                        : isClickableToCancel
                            ? 'Кликните для одноручного режима'
                            : isShieldSlot
                                ? `Щит: ${currentShield?.name}`
                                : weaponInSlot
                                    ? `${weaponSlotType === 'one-handed' ? 'Одноручное' : 'Двуручное'} оружие: ${weaponInSlot.name}`
                                    : isOccupied 
                                        ? 'Занято оружием' 
                                        : 'Свободно'
                }
            />
        );
    };

    return (
        <div className={`flex gap-2 ${className}`}>
            {/* Слот I */}
            <div className="flex items-center gap-1">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onSlotClick?.(1);
                    }}
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        activeWeaponSlot === 1
                            ? 'bg-transparent text-primary border border-primary'
                            : 'bg-transparent text-muted-foreground border border-transparent hover:border-muted-foreground/50'
                    }`}
                    title={activeWeaponSlot === 1 ? 'Активный слот I' : 'Переключить на слот I'}
                >
                    I
                </button>
                <div className="flex gap-1">
                    {Array.from({ length: 2 }, (_, index) => renderSlot(index, true))}
                </div>
            </div>
            
            {/* Слот II */}
            <div className="flex items-center gap-1">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onSlotClick?.(2);
                    }}
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        activeWeaponSlot === 2
                            ? 'bg-transparent text-primary border border-primary'
                            : 'bg-transparent text-muted-foreground border border-transparent hover:border-muted-foreground/50'
                    }`}
                    title={activeWeaponSlot === 2 ? 'Активный слот II' : 'Переключить на слот II'}
                >
                    II
                </button>
                <div className="flex gap-1">
                    {Array.from({ length: 2 }, (_, index) => renderSlot(index, false))}
                </div>
            </div>
        </div>
    );
}