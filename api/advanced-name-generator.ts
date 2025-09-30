import type { VercelRequest, VercelResponse } from '@vercel/node';

interface NameGeneratorRequest {
    race?: string;
    class?: string;
    gender?: "male" | "female" | "any";
    count?: number;
}

interface NameGeneratorResponse {
    names: string[];
    success: boolean;
    error?: string;
}

// Базы данных слогов для каждой расы
const RACE_SYLLABLES = {
    "elf": {
        prefixes: [
            "Ал", "Аэ", "Ан", "Ам", "Ари", "Ара", "Аль", 
            "Эл", "Эа", "Эн", "Эм", "Эри", "Эру", "Эль",
            "Ил", "Иа", "Ин", "Им", "Ири", "Иси", "Иль", 
            "Ол", "Оа", "Он", "Ом", "Ори", "Оро", "Оль",
            "Ул", "Уа", "Ун", "Ум", "Ури", "Уру",
            "Ла", "Ле", "Ли", "Ло", "Лу", "Лю",
            "Ра", "Ре", "Ри", "Ро", "Ру", "Рю",
            "На", "Не", "Ни", "Но", "Ну", "Нэ",
            "Са", "Се", "Си", "Со", "Су", "Сэ",
            "Та", "Те", "Ти", "То", "Ту", "Тэ",
            "Ка", "Ке", "Ки", "Ко", "Ку", "Кэ",
            "Ма", "Ме", "Ми", "Мо", "Му", "Мэ",
            "Ва", "Ве", "Ви", "Во", "Ву", "Вэ"
        ],
        middles: [
            "ри", "ли", "ни", "си", "ти", "ви", "ди", "ми", 
            "ла", "ра", "на", "са", "та", "ва", "да", "ма",
            "ль", "рль", "нль", "сль", "тль", "вль", "дль",
            "ан", "эн", "ин", "он", "ун", "ян", "ен",
            "ар", "эр", "ир", "ор", "ур", "яр", "ер",
            "ам", "эм", "им", "ом", "ум", "ям", "ем",
            "ат", "эт", "ит", "от", "ут", "ят", "ет",
            "ас", "эс", "ис", "ос", "ус", "яс", "ес"
        ],
        suffixes: [
            "ион", "иэль", "аэль", "риэль", "диэль", "тиэль", 
            "виэль", "ниэль", "сиэль", "лиэль", "миэль", "рион",
            "дион", "тион", "вион", "нион", "сион", "лион",
            "анда", "энда", "инда", "онда", "унда", "анна",
            "энна", "инна", "онна", "унна", "арил", "эрил",
            "ирил", "орил", "урил", "арон", "эрон", "ирон",
            "орон", "урон", "арис", "эрис", "ирис", "орис"
        ],
        femaleSuffixes: [
            "а", "иа", "эа", "иль", "эль", "иль", 
            "ара", "эра", "ира", "ора", "ура", 
            "ана", "эна", "ина", "она", "уна",
            "елла", "илла", "олла", "улла", "алла",
            "енна", "инна", "онна", "унна", "анна",
            "ели", "или", "оли", "ули", "али",
            "естра", "истра", "остра", "устра"
        ],
        maleSuffixes: [
            "он", "ион", "эон", "ан", "эн", "ин", 
            "он", "ун", "ар", "эр", "ир", "ор", 
            "ур", "арон", "эрон", "ирон", "орон",
            "урон", "анор", "энор", "инор", "онор",
            "унор", "атир", "этир", "итир", "отир",
            "утир", "амир", "эмир", "имир", "омир",
            "умир", "адан", "эдан", "идан", "одан"
        ],
        starters: [
            "Ай", "Эй", "Ий", "Ой", "Уй", "Ал", "Эл", 
            "Ил", "Ол", "Ул", "Ар", "Эр", "Ир", "Ор", "Ур"
        ],
        enders: [
            "эль", "иль", "аль", "оль", "уль", "ан", 
            "эн", "ин", "он", "ун", "ар", "эр", "ир", "ор"
        ],
        familyPrefixes: [
            "Гала", "Силь", "Лау", "Аэ", "Аль", "Иль", "Ол", "Эль", "Келеб", "Аран",
            "Лори", "Имлад", "Эред", "Нен", "Таур", "Пелон", "Кирит", "Амон", "Барад", "Карн"
        ],
        familySuffixes: [
            "рим", "дор", "линд", "ронд", "стиль", "винг", "тиль", "мир", "дил", "фин",
            "ион", "иэль", "ронд", "вайн", "бет", "росс", "мар", "нор", "фэйн", "мор"
        ],
        familyMiddles: [
            "а", "э", "и", "о", "у",
            "ад", "эд", "ид", "од", "уд",
            "ан", "эн", "ин", "он", "ун",
            "ар", "эр", "ир", "ор", "ур"
        ]
    },
    "human": {
        prefixes: [
            "Аль", "Эль", "Виль", "Ос", "Тор", "Лео", "Эд", "Вин", "Сиг", "Год",
            "Яро", "Вла", "Ста", "Бо", "Дра", "Рад", "Свя", "Ми", "Бро", "Ка",
            "Рагн", "Бьорн", "Эй", "Халь", "Гун", "Свен", "Ульф", "Ха", "Фрей", "Инг",
            "Ар", "Эр", "Ор", "Бен", "Джон", "Виль", "Том", "Рик", "Ген", "Сам"
        ],
        middles: [
            "ри", "ли", "ни", "си", "ти", "ви", "ди", "ми",
            "бер", "дер", "тер", "вер", "гер", "мер", "нер", "пер",
            "ман", "ван", "дан", "ран", "тан", "фан", "ган", "лан",
            "мон", "нон", "рон", "сон", "тон", "фон", "гон", "хон",
            "кар", "лар", "мар", "нар", "тар", "фар", "гар", "хар"
        ],
        suffixes: [
            "ард", "берт", "вин", "гард", "дел", "ерт", "фрид", "хард",
            "иль", "киль", "линд", "мунд", "нор", "ольф", "рик", "сон",
            "ульф", "вард", "хельм", "цель", "шер", "эрт", "юст", "ярд"
        ],
        femaleSuffixes: [
            "а", "иа", "ела", "ила", "ола", "ула", "ина", "ена",
            "етта", "иетта", "елина", "ильда", "ольда", "ульда",
            "мира", "вира", "лира", "тира", "фара", "гара",
            "линда", "синда", "тинда", "винда", "гринда",
            "белла", "делла", "фелла", "гелла", "телла",
            "анна", "энна", "инна", "онна", "унна"
        ],
        maleSuffixes: [
            "ус", "ис", "ос", "ас", "ес", "ан", "ен", "ин", "он", "ун",
            "ар", "ер", "ир", "ор", "ур", "ард", "ерд", "ирд", "орд", "урд",
            "альд", "ельд", "ильд", "ольд", "ульд", "анд", "енд", "инд", "онд", "унд",
            "ерт", "ирт", "орт", "урт", "арт", "ерт", "орм", "урм", "арм", "ерм"
        ],
        familyPrefixes: [
            "фон", "ван", "де", "ди", "ла", "ле", "мак", "о'", "ап", "фитц",
            "берг", "бург", "гард", "хольм", "стад", "вик", "даль", "таль",
            "ривер", "стоун", "айрон", "голд", "сильвер", "блэк", "уайт", "гри"
        ],
        familySuffixes: [
            "сон", "сен", "ович", "евич", "ов", "ев", "ин", "ын",
            "ский", "цкий", "ской", "цкой", "иль", "оль", "аль", "ель",
            "ман", "нер", "лер", "мер", "вер", "дер", "тер", "бер",
            "ворд", "ланд", "бург", "берг", "хольм", "стад", "даль", "таль"
        ]
    }
};

function generateSurnameFromSyllables(syllables: any): string {
    const { familyPrefixes, familySuffixes, familyMiddles } = syllables;
    
    const hasFamilyPrefixes = familyPrefixes && familyPrefixes.length > 0;
    const hasFamilySuffixes = familySuffixes && familySuffixes.length > 0;
    const hasFamilyMiddles = familyMiddles && familyMiddles.length > 0;
    
    if (!hasFamilyPrefixes || !hasFamilySuffixes) {
        return '';
    }
    
    const schemes = [
        { name: 'prefix + suffix', hasMiddle: false },
        ...(hasFamilyMiddles ? [
            { name: 'prefix + middle + suffix', hasMiddle: true }
        ] : [])
    ];
    
    const selectedScheme = schemes[Math.floor(Math.random() * schemes.length)];
    
    const prefix = familyPrefixes[Math.floor(Math.random() * familyPrefixes.length)];
    const middle = selectedScheme.hasMiddle && hasFamilyMiddles ? 
        familyMiddles[Math.floor(Math.random() * familyMiddles.length)] : '';
    const suffix = familySuffixes[Math.floor(Math.random() * familySuffixes.length)];
    
    const surname = prefix + middle + suffix;
    
    return applyPhoneticRules(surname);
}

function generateNameFromSyllables(syllables: any, gender: string): string {
    const { prefixes, middles, suffixes, femaleSuffixes, maleSuffixes, starters, enders } = syllables;
    
    const hasStarters = starters && starters.length > 0;
    const hasEnders = enders && enders.length > 0;
    const hasMiddles = middles && middles.length > 0;
    
    const schemes = [
        { name: 'prefix + suffix', hasStarter: false, hasMiddle: false, hasEnder: false },
        { name: 'prefix + middle + suffix', hasStarter: false, hasMiddle: true, hasEnder: false },
        ...(hasEnders ? [
            { name: 'prefix + suffix + ender', hasStarter: false, hasMiddle: false, hasEnder: true },
            { name: 'prefix + middle + suffix + ender', hasStarter: false, hasMiddle: true, hasEnder: true }
        ] : []),
        ...(hasStarters ? [
            { name: 'starter + prefix + suffix', hasStarter: true, hasMiddle: false, hasEnder: false },
            { name: 'starter + prefix + middle + suffix', hasStarter: true, hasMiddle: true, hasEnder: false },
            ...(hasEnders ? [
                { name: 'starter + prefix + suffix + ender', hasStarter: true, hasMiddle: false, hasEnder: true },
                { name: 'starter + prefix + middle + suffix + ender', hasStarter: true, hasMiddle: true, hasEnder: true }
            ] : [])
        ] : [])
    ];
    
    const selectedScheme = schemes[Math.floor(Math.random() * schemes.length)];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const middle = selectedScheme.hasMiddle && hasMiddles ? 
        middles[Math.floor(Math.random() * middles.length)] : '';
    const starter = selectedScheme.hasStarter && hasStarters ? 
        starters[Math.floor(Math.random() * starters.length)] : '';
    const ender = selectedScheme.hasEnder && hasEnders ? 
        enders[Math.floor(Math.random() * enders.length)] : '';
    
    let suffix: string = '';
    
    const hasGeneralSuffixes = suffixes && suffixes.length > 0;
    const hasFemaleSuffixes = femaleSuffixes && femaleSuffixes.length > 0;
    const hasMaleSuffixes = maleSuffixes && maleSuffixes.length > 0;
    
    if (gender === 'female') {
        if (hasFemaleSuffixes) {
            suffix = femaleSuffixes[Math.floor(Math.random() * femaleSuffixes.length)];
        } else if (hasGeneralSuffixes) {
            suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        } else {
            suffix = '';
        }
    } else if (gender === 'male') {
        if (hasMaleSuffixes) {
            suffix = maleSuffixes[Math.floor(Math.random() * maleSuffixes.length)];
        } else if (hasGeneralSuffixes) {
            suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        } else {
            suffix = '';
        }
    } else {
        const availableTypes: string[] = [];
        if (hasGeneralSuffixes) availableTypes.push('general');
        if (hasFemaleSuffixes) availableTypes.push('female');
        if (hasMaleSuffixes) availableTypes.push('male');
        
        if (availableTypes.length === 0) {
            suffix = '';
        } else {
            const selectedType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
            switch (selectedType) {
                case 'general':
                    suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
                    break;
                case 'female':
                    suffix = femaleSuffixes[Math.floor(Math.random() * femaleSuffixes.length)];
                    break;
                case 'male':
                    suffix = maleSuffixes[Math.floor(Math.random() * maleSuffixes.length)];
                    break;
                default:
                    suffix = '';
            }
        }
    }
    
    let name = '';
    if (selectedScheme.hasStarter) {
        const fullName = starter + prefix + middle + suffix + ender;
        if (fullName.length > 8 && Math.random() < 0.3) {
            name = starter + "'" + prefix + middle + suffix + ender;
        } else {
            name = fullName;
        }
    } else {
        name = prefix + middle + suffix + ender;
    }
    
    name = applyPhoneticRules(name);
    
    return name;
}

function applyPhoneticRules(name: string): string {
    name = name.replace(/(.)\1{2,}/g, '$1$1');
    name = name.replace(/[бвгджзклмнпрстфхцчшщ]{4,}/g, (match) => {
        return match.substring(0, 3);
    });
    name = name.replace(/[аеёиоуыэюя]{4,}/g, (match) => {
        return match.substring(0, 3);
    });
    name = name.replace(/л{2,}/g, 'л');
    name = name.replace(/р{2,}/g, 'р');
    name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    name = name.replace(/^'+|'+$/g, '');
    
    return name;
}

function generateCyrillicFantasyName(race?: string, characterClass?: string, gender: string = "any"): string {
    let actualGender = gender;
    if (gender === "any") {
        actualGender = Math.random() > 0.5 ? "male" : "female";
    }
    
    const raceKey = race?.toLowerCase() || 'human';
    
    if (raceKey === 'elf') {
        const firstName = generateNameFromSyllables(RACE_SYLLABLES["elf"], actualGender);
        const surname = generateSurnameFromSyllables(RACE_SYLLABLES["elf"]);
        return surname ? `${firstName} ${surname}` : firstName;
    }
    
    if (raceKey === 'human') {
        const firstName = generateNameFromSyllables(RACE_SYLLABLES.human, actualGender);
        const surname = generateSurnameFromSyllables(RACE_SYLLABLES.human);
        return surname ? `${firstName} ${surname}` : firstName;
    }
    
    // Fallback для остальных рас
    return "Неизвестное Имя";
}

export default function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { race, class: characterClass, gender = "any", count = 1 }: NameGeneratorRequest = req.body;
        
        const names: string[] = [];

        for (let i = 0; i < count; i++) {
            const name = generateCyrillicFantasyName(race, characterClass, gender);
            names.push(name);
        }

        const response: NameGeneratorResponse = {
            names,
            success: true
        };

        res.json(response);

    } catch (error) {
        console.error('Advanced name generation error:', error);
        
        const response: NameGeneratorResponse = {
            names: [],
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
        
        res.json(response);
    }
}
