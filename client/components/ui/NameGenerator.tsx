import { useState } from "react";
import { Button } from "./button";
import { useCharacter } from "@/store/character";

interface NameGeneratorProps {
    onNameGenerated: (name: string) => void;
    className?: string;
}

interface NameGeneratorResponse {
    names: string[];
    success: boolean;
    error?: string;
}

// Расширенные базы данных имен для D&D
const FIRST_NAMES = [
    // Эльфийские имена (не из Властелина колец)
    "Аларион", "Алтаир", "Аранис", "Ариэль", "Аэлис", "Белегор", "Валар", "Галадриэль",
    "Дориан", "Элара", "Элвин", "Элдарион", "Элениэль", "Элронд", "Элсира", "Элтарион",
    "Фаэлин", "Галадриэль", "Гил-Галад", "Иларион", "Илмариэль", "Келеборн", "Ларион", "Линдал",
    "Лютиен", "Мираэль", "Нариэль", "Орион", "Пеларион", "Риларион", "Сильвана", "Турион",
    
    // Человеческие имена
    "Александр", "Виктор", "Дмитрий", "Сергей", "Андрей", "Николай", "Владимир", "Игорь",
    "Анна", "Елена", "Мария", "Ольга", "Татьяна", "Наталья", "Ирина", "Светлана",
    "Константин", "Михаил", "Алексей", "Максим", "Артем", "Иван", "Роман", "Денис",
    "Екатерина", "Анастасия", "Юлия", "Дарья", "Алина", "Полина", "Ксения", "Валерия",
    
    // Гномьи имена
    "Торин", "Гимли", "Балин", "Двалин", "Фили", "Кили", "Оин", "Глоин",
    "Бомбур", "Бифур", "Бофур", "Дори", "Нори", "Ори", "Двалин", "Балин",
    "Дис", "Торин", "Фрерин", "Трор", "Траин", "Торин", "Дейн", "Гимли",
    
    // Дварфские имена
    "Дурин", "Траин", "Трор", "Торин", "Дейн", "Гимли", "Балин", "Двалин",
    "Бруенор", "Вульфгар", "Торгрим", "Харгрик", "Кордрин", "Мордин", "Торбек", "Даррин",
    "Бруенор", "Вульфгар", "Торгрим", "Харгрик", "Кордрин", "Мордин", "Торбек", "Даррин",
    
    // Халфлингские имена
    "Бильбо", "Фродо", "Сэм", "Пиппин", "Мерри", "Тук", "Брендибак", "Гэмджи",
    "Перри", "Поппи", "Рози", "Руби", "Сэм", "Тоби", "Уиллоу", "Зак",
    "Альберт", "Берти", "Чарли", "Дейзи", "Эдди", "Флора", "Джордж", "Ханна",
    
    // Драконорожденные имена
    "Драко", "Вулкан", "Скай", "Флейм", "Сторм", "Тандер", "Блейз", "Эмбер",
    "Азур", "Кримсон", "Голд", "Сильвер", "Бронз", "Коппер", "Грин", "Блю",
    "Ред", "Блэк", "Уайт", "Грей", "Пурпл", "Оранж", "Пинк", "Йеллоу",
    
    // Тайфлинги
    "Люцифер", "Асмодей", "Бельфегор", "Маммон", "Левиафан", "Сатана", "Астарот", "Бегемот",
    "Абаддон", "Азраэль", "Бельзебуб", "Демогоргон", "Граза'т", "Молох", "Оркус", "Паззузу",
    "Зебулон", "Валак", "Андромалиус", "Гласиа", "Хагус", "Импи", "Каллиопе", "Левкиппа"
];

const LAST_NAMES = [
   
];

const TITLES = [
    "Великий", "Мудрый", "Храбрый", "Сильный", "Быстрый", "Ловкий", "Умный", "Добрый",
    "Злой", "Темный", "Светлый", "Древний", "Молодой", "Старый", "Новый", "Старый",
    "Белый", "Черный", "Красный", "Синий", "Зеленый", "Желтый", "Фиолетовый", "Оранжевый"
];

export default function NameGenerator({ onNameGenerated, className = "" }: NameGeneratorProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const { draft } = useCharacter();

    const generateName = async () => {
        setIsGenerating(true);
        
        try {
            // Получаем данные персонажа для контекста
            const race = draft?.basics?.race;
            const characterClass = draft?.basics?.class;
            
            
            // Сначала пробуем продвинутый генератор
            let response = await fetch('/api/advanced-name-generator', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    race: race,
                    class: characterClass,
                    gender: 'any',
                    count: 1
                })
            });

            // Если продвинутый генератор не работает, используем ИИ
            if (!response.ok) {
                response = await fetch('/api/name-generator', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        race: race,
                        class: characterClass,
                        gender: 'any',
                        style: 'fantasy',
                        count: 1
                    })
                });
            }

            if (!response.ok) {
                throw new Error('Failed to generate name');
            }

            const data: NameGeneratorResponse = await response.json();
            
            if (data.success && data.names.length > 0) {
                onNameGenerated(data.names[0]);
            } else {
                // Fallback к статическим именам
                generateStaticName();
            }
        } catch (error) {
            console.error('Error generating name:', error);
            // Fallback к статическим именам
            generateStaticName();
        } finally {
            setIsGenerating(false);
        }
    };

    const generateStaticName = () => {
        const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
        const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
        const title = Math.random() > 0.7 ? TITLES[Math.floor(Math.random() * TITLES.length)] + " " : "";
        
        const fullName = `${title}${firstName} ${lastName}`;
        onNameGenerated(fullName);
    };

    return (
        <div className={`gap-2 ${className}`}>
            <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={generateName}
                disabled={isGenerating}
                className="text-[8px] text-muted-foreground hover:text-foreground uppercase"
            >
                {isGenerating ? "Генерирую..." : "Предложить имя"}
            </Button>
        </div>
    );
}
