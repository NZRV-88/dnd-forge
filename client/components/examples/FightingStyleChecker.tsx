import React from 'react';
import { useCharacter } from '@/store/character';
import { hasFightingStyle, getAllFightingStyles } from '@/utils/getAllCharacterData';
import { FIGHTING_STYLES } from '@/data/classes/features/fightingStyles';

export default function FightingStyleChecker() {
    const { draft } = useCharacter();
    
    if (!draft) {
        return <div>Персонаж не загружен</div>;
    }
    
    const hasDefense = hasFightingStyle(draft, 'defense');
    const allStyles = getAllFightingStyles(draft);
    
    return (
        <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Проверка боевых стилей</h3>
            
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <span className="font-medium">Боевой стиль "Оборона":</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                        hasDefense ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                        {hasDefense ? 'Да' : 'Нет'}
                    </span>
                </div>
                
                <div>
                    <span className="font-medium">Все боевые стили:</span>
                    <div className="mt-1">
                        {allStyles.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                                {allStyles.map(styleKey => {
                                    const style = FIGHTING_STYLES.find(s => s.key === styleKey);
                                    return (
                                        <span 
                                            key={styleKey}
                                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                                        >
                                            {style?.name || styleKey}
                                        </span>
                                    );
                                })}
                            </div>
                        ) : (
                            <span className="text-gray-500">Нет выбранных боевых стилей</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
