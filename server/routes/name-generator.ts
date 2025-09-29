import { RequestHandler } from "express";

interface NameGeneratorRequest {
    race?: string;
    class?: string;
    gender?: "male" | "female" | "any";
    style?: "fantasy" | "medieval" | "modern";
    count?: number;
}

interface NameGeneratorResponse {
    names: string[];
    success: boolean;
    error?: string;
}

export const handleNameGenerator: RequestHandler = async (req, res) => {
    try {
        const { race, class: characterClass, gender = "any", style = "fantasy", count = 1 }: NameGeneratorRequest = req.body;

        // Проверяем, есть ли API ключ для DeepSeek
        const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
        
        if (!deepseekApiKey) {
            // Fallback к статическим именам, если нет API ключа
            const staticNames = generateStaticNames(race, characterClass, gender, count);
            const response: NameGeneratorResponse = {
                names: staticNames,
                success: true
            };
            return res.json(response);
        }

        // Генерируем промпт для DeepSeek
        const prompt = createPrompt(race, characterClass, gender, style, count);
        
        // Вызываем DeepSeek API
        const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${deepseekApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: 'Ты эксперт по созданию имен для персонажей D&D. Отвечай только именами, разделенными запятыми, без дополнительных объяснений.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 200,
                temperature: 0.8
            })
        });

        if (!deepseekResponse.ok) {
            throw new Error(`DeepSeek API error: ${deepseekResponse.status}`);
        }

        const data = await deepseekResponse.json();
        const generatedText = data.choices[0]?.message?.content || '';
        
        // Парсим имена из ответа
        const names = generatedText
            .split(',')
            .map(name => name.trim())
            .filter(name => name.length > 0)
            .slice(0, count);

        const response: NameGeneratorResponse = {
            names: names.length > 0 ? names : generateStaticNames(race, characterClass, gender, count),
            success: true
        };

        res.json(response);

    } catch (error) {
        console.error('Name generation error:', error);
        
        // Fallback к статическим именам при ошибке
        const { race, class: characterClass, gender = "any", count = 1 } = req.body;
        const staticNames = generateStaticNames(race, characterClass, gender, count);
        
        const response: NameGeneratorResponse = {
            names: staticNames,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
        
        res.json(response);
    }
};

function createPrompt(race?: string, characterClass?: string, gender?: string, style?: string, count?: number): string {
    let prompt = `Создай ${count || 1} уникальное имя для D&D персонажа.`;
    
    // Строгие инструкции по избежанию известных имен
    prompt += ` НЕ используй имена из "Властелина колец" (Арагорн, Леголас, Гэндальф, Фродо, Голлум и т.д.). `;
    prompt += `НЕ используй имена из других популярных фэнтези (Гарри Поттер, Игра престолов и т.д.). `;
    prompt += `Создавай ОРИГИНАЛЬНЫЕ имена, которых нет в известных произведениях. `;
    
    if (gender && gender !== 'any') {
        prompt += `Имя должно быть для ${gender === 'male' ? 'мужского' : 'женского'} персонажа. `;
    }
    
    if (race) {
        const raceInstructions: Record<string, string> = {
            'elf': 'эльф - используй мягкие, мелодичные звуки (л, р, н, а, и, э). Примеры стиля: Аларион, Элара, Иларион',
            'human': 'человек - используй традиционные, понятные имена. Примеры стиля: Маркус, Элена, Виктор',
            'dwarf': 'дворф - используй твердые, горные звуки (к, г, р, о, у). Примеры стиля: Торгрим, Бруенор, Даррин',
            'halfling': 'халфлинг - используй добрые, домашние звуки. Примеры стиля: Перри, Рози, Тоби',
            'dragonborn': 'драконорожденный - используй мощные, драконьи звуки. Примеры стиля: Драко, Вулкан, Скай',
            'tiefling': 'тайфлинг - используй загадочные, демонические звуки. Примеры стиля: Люцифер, Асмодей, Валак',
            'gnome': 'гном - используй хитрые, изобретательные звуки. Примеры стиля: Гизмо, Тинкер, Спарк',
            'half-orc': 'полуорк - используй грубые, воинственные звуки. Примеры стиля: Грог, Тарк, Ург'
        };
        prompt += `Раса: ${raceInstructions[race.toLowerCase()] || race}. `;
    }
    
    if (characterClass) {
        const classInstructions: Record<string, string> = {
            'fighter': 'воин - имя должно звучать сильно и боевито',
            'wizard': 'маг - имя должно звучать мудро и мистически',
            'rogue': 'плут - имя должно звучать ловко и хитро',
            'cleric': 'жрец - имя должно звучать священно и благочестиво',
            'ranger': 'следопыт - имя должно звучать природно и дико',
            'bard': 'бард - имя должно звучать творчески и артистично',
            'paladin': 'паладин - имя должно звучать благородно и героически',
            'barbarian': 'варвар - имя должно звучать дико и первобытно',
            'monk': 'монах - имя должно звучать духовно и дисциплинированно',
            'warlock': 'колдун - имя должно звучать темно и мистически',
            'sorcerer': 'чародей - имя должно звучать природно и магически',
            'druid': 'друид - имя должно звучать природно и древне'
        };
        prompt += `Класс: ${classInstructions[characterClass.toLowerCase()] || characterClass}. `;
    }
    
    prompt += `Имя должно быть ОРИГИНАЛЬНЫМ, запоминающимся и подходящим для D&D. Отвечай ТОЛЬКО именем, без дополнительных слов.`;
    
    return prompt;
}

function generateStaticNames(race?: string, characterClass?: string, gender?: string, count: number = 1): string[] {
    // Статические базы данных имен (оригинальные D&D имена)
    const names: Record<string, string[]> = {
        elf: ["Аларион", "Элара", "Иларион", "Мираэль", "Турион", "Сильвана", "Дориан", "Элвин", "Фаэлин", "Нариэль"],
        human: ["Маркус", "Элена", "Виктор", "Ариэль", "Дмитрий", "Сергей", "Андрей", "Николай", "Анна", "Елена", "Мария", "Ольга"],
        dwarf: ["Торгрим", "Бруенор", "Даррин", "Харгрик", "Кордрин", "Мордин", "Торбек", "Вульфгар", "Дурин", "Траин"],
        halfling: ["Перри", "Рози", "Тоби", "Уиллоу", "Зак", "Альберт", "Берти", "Чарли", "Дейзи", "Эдди"],
        dragonborn: ["Драко", "Вулкан", "Скай", "Флейм", "Сторм", "Тандер", "Азур", "Кримсон", "Голд", "Сильвер"],
        tiefling: ["Люцифер", "Асмодей", "Бельфегор", "Маммон", "Левиафан", "Валак", "Абаддон", "Азраэль", "Бельзебуб", "Демогоргон"]
    };

    const selectedNames = names[race?.toLowerCase() || 'human'] || names.human;
    const result: string[] = [];
    
    for (let i = 0; i < count; i++) {
        const randomName = selectedNames[Math.floor(Math.random() * selectedNames.length)];
        result.push(randomName);
    }
    
    return result;
}
