import { RequestHandler } from "express";

// Простой прокси к основному генератору имен
// Импортируем функцию из основного файла
export const handleAdvancedNameGenerator: RequestHandler = async (req, res) => {
    try {
        // Импортируем функцию генерации из основного файла
        const { generateCyrillicFantasyName } = await import("../../api/advanced-name-generator");
        
        const { race, class: characterClass, gender = "any", count = 1 } = req.body;
        
        console.log('Локальный роут: Генерируем имя для:', { race, characterClass, gender, count });
        
        const names = [];
        for (let i = 0; i < count; i++) {
            const name = generateCyrillicFantasyName(race, characterClass, gender);
            names.push(name);
        }
        
        res.json({
            success: true,
            names: names
        });
        
    } catch (error) {
        console.error('Ошибка в локальном роуте advanced-name-generator:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
