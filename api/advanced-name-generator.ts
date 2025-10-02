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
            "Ал", "Аэ", "Ан", "Ам", "Ана", "Ари", "Ара", "Аль", 
            "Эл", "Эа", "Эн", "Эм", "Эри", "Эру", "Эль",
            "Ил", "Иа", "Ин", "Им", "Ири", "Иси", "Иль", 
            "Ол", "Оа", "Он", "Ом", "Ори", "Оро", "Оль",
            "Ул", "Уа", "Ун", "Ум", "Ури", "Уру",
            "Ла", "Ле", "Ли", "Ло", "Лу",
            "Ра", "Ре", "Ри", "Ро", "Ру",
            "На", "Не", "Ни", "Но", "Ну", "Нэ",
            "Са", "Се", "Си", "Со", "Су", "Сэ",
            "Та", "Те", "Ти", "То", "Ту", "Тэ",
            "Ка", "Ке", "Ки", "Ко", "Ку", "Кэ",
            "Ма", "Ме", "Ми", "Мо", "Му", "Мэ",
            "Ва", "Ве", "Ви", "Во", "Ву", "Вэ",
             "Гала", "Силь", "Лау", "Аэ", "Аль", "Иль", "Ол", "Эль", "Келеб", "Аран",
            "Лори", "Имлад", "Эред", "Нен", "Таур", "Пелон", "Кирит", "Амон", "Барад", "Карн"
        ],
        middles: [
            "ри", "ли", "ни", "си", "ти", "ви", "ди", "ми", 
            "ла", "ра", "на", "са", "та", "ва", "да", "ма",
            "ль", "рль", "нль", "сль", "тль", "вль", "дль",
            "ан", "эн", "ин", "он", "ун", "ян", "ен",
            "ар", "эр", "ир", "ор", "ур", "яр", "ер",
            "ам", "эм", "им", "ом", "ум", "ям", "ем",
            "ат", "эт", "ит", "от", "ут", "ят", "ет",
            "ас", "эс", "ис", "ос", "ус", "яс", "ес",
            "а", "э", "и", "о", "у",
            "ад", "эд", "ид", "од", "уд",
            "ан", "эн", "ин", "он", "ун",
            "ар", "эр", "ир", "ор", "ур"
        ],
        suffixes: [
            "он", "эль", "да", "на", "ил", "ис", "им", "дор", "линд", "ронд", "стиль", "винг", "тиль", "мир", "дил", "фин",
            "вайн", "бет", "росс", "мар", "нор", "фэйн", "мор"
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
            "Ал", "Эл", "Ил", "Ол", "Ул", "Ар", "Эр", "Ир", "Ор", "Ур"
        ],
        enders: [
            "эль", "иль", "аль", "оль", "уль", "ан", 
            "эн", "ин", "он", "ун", "ар", "эр", "ир", "ор"
        ]
    },
    "human": {
        prefixes: [
            "Аль", "Эль", "Виль", "Ос", "Тор", "Лео", "Эд", "Вин", "Сиг", "Год",
            "Яро", "Вла", "Ста", "Бо", "Дра", "Рад", "Свя", "Ми", "Бро", "Ка",
            "Рагн", "Бьорн", "Эй", "Халь", "Гун", "Свен", "Ульф", "Ха", "Фрей", "Инг",
            "Ар", "Эр", "Ор", "Бен", "Джон", "Виль", "Том", "Рик", "Ген", "Сам",
            "фон", "ван", "де", "ди", "ла", "ле", "мак", "о'", "ап", "фитц",
            "берг", "бург", "гард", "хольм", "стад", "вик", "даль", "таль",
            "ривер", "стоун", "айрон", "голд", "сильвер", "блэк", "уайт", "гри"
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
            "ульф", "вард", "хельм", "цель", "шер", "эрт", "ярд",
            "сон", "сен", "ович", "евич", "ов", "ев", "ин", "ын",
            "ский", "цкий", "ской", "цкой", "иль", "оль", "аль", "ель",
            "ман", "нер", "лер", "мер", "вер", "дер", "тер", "бер",
            "ворд", "ланд", "бург", "берг", "хольм", "стад", "даль", "таль"
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
    },
    "dwarf": {
        prefixes: [
            "Тор", "Гор", "Дур", "Бал", "Два", "Гим", "Фун", "Бор", "Нал", "Ор",
            "Гран", "Стен", "Краг", "Флин", "Гро", "Тро", "Дро", "Фро", "Про", "Кро",
            "Мро", "Вро", "Зро", "Рро", "Гром", "Каз", "Хаг", "Ск", "Гун", "Фар",
            "Бр", "Гим", "Грон", "Краг", "Флин", "Каз", "Тор", "Грун", "Харт", "Бар",
            "Галл", "Стрен", "Фельд", "Бро", "Гор", "Дро", "Краг", "Хард", "Ульф", "Копп",
            "Адам", "Деп", "Унд", "Стоун", "Мура", "Рок"
        ],
        middles: [
            "ад", "ин", "ан", "ун", "ен", "он", "ян", "эн", "инн", "анн", "унн",
            "ар", "ур", "ор", "ер", "ир", "яр", "орр", "арр", "урр",
            "ли", "ри", "ни", "ди", "ти", "ви", "ми", "би", "пи", "ки",
            "гар", "дар", "нар", "тар", "вар", "мар", "ргар", "лдар", "ннар",
            "ан", "ен", "ин", "он", "ун", "ар", "ер", "ир", "ор", "ур",
            "гар", "дар", "нар", "тар", "вар", "лин", "рин", "тин", "вин", "мин"
        ],
        suffixes: [
            "ин", "ан", "ун", "ар", "ур", "ор", "ир", "ард", "урд", "орд",
            "грим", "лим", "дим", "тим", "вим", "вин", "ли", "дин", "дар",
            "гаар", "даар", "наар", "таар", "ваар", "маар", "раар", "лаар",
            "ли", "дин", "гар", "рук", "дир", "мар", "рин", "так", "нар", "вал",
            "вил", "рен", "лен", "док", "менд", "хильд", "дис", "рид", "борг", "вига",
            "рун", "дил", "вейг", "дис", "ур", "унд"
        ],
        femaleSuffixes: [
            "а", "иа", "ела", "ила", "ола", "ула", "ина", "ена", "она", "уна",
            "дис", "тис", "вис", "нис", "рис", "лис", "мис", "бис", "пис", "кис",
            "лин", "тин", "вин", "нин", "рин", "линн", "тинн", "винн", "нинн", "ринн"
        ],
        maleSuffixes: [
            "и", "ей", "ай", "ой", "уй", "ейн", "айн", "ойн", "уйн", "ейнн",
            "гар", "дар", "нар", "тар", "вар", "мар", "ргар", "лдар", "ннар", "ттар",
            "сток", "стокк", "локк", "рокк", "бокк", "докк", "токк", "вокк", "мокк"
        ],
    },
    "halfling": {
        prefixes: [
            "Сэм", "Бил", "Фрод", "Мер", "Пер", "Рос", "Дей", "Поп", "Ла", "Ферн",
            "Тео", "Фос", "Бин", "Мар", "Ан", "Гор", "Трот", "Дро", "Вил", "Хоб",
            "Бер", "Чиз", "Хон", "Ап", "Плам", "Грей", "Оат", "Бар", "Пай", "Кейк",
                  "Ячмен", "Пирож", "Сыр", "Мед", "Хлеб", "Прян", "Блин", "Сахар", "Солод", "Вишн",
            "Трав", "Корен", "Лист", "Пол", "Сад", "Очаг", "Дым", "Плет", "Уют", "Тепл"
        ],
        middles: [
            "ви", "ли", "ни", "ри", "ти", "ди", "ми", "би", "пи", "ки",
            "бер", "дер", "тер", "вер", "мер", "нер", "пер", "кер", "лер", "сер",
            "бо", "до", "го", "ло", "мо", "но", "по", "ро", "со", "то",
            "ба", "да", "га", "ла", "ма", "на", "па", "ра", "са", "та",
                        "о", "е", "и", "у", "ю", "ов", "ев", "ив", "ов", "ев",
            "ан", "ен", "ин", "он", "ун", "ар", "ер", "ир", "ор", "ур"
        ],
        suffixes: [
            "виз", "лоу", "тофт", "бёрроу", "григгс", "бэнкс", "брук", "дейл", "филд", "вуд",
            "боттом", "грин", "хилл", "лейк", "марш", "ридж", "спринг", "вейл", "уэлл", "ёрт",
                        "овка", "ушко", "ик", "ок", "енька", "очка", "ушка", "ышко", "це", "ко",
            "пёк", "вар", "сел", "пас", "пёл", "шил", "мол", "сух", "коп"
        ],
        femaleSuffixes: [
            "а", "иа", "белла", "белл", "роуз", "мэй", "джейн", "лин", "линн", "етта",
            "анна", "энна", "инна", "онна", "унна", "елиза", "емили", "еттель", "ильда", "ольга",
            "поппи", "дейзи", "виолет", "айрис", "хейзел", "лавдер", "олив", "руби", "пеarl", "голди"
        ],
        maleSuffixes: [
            "о", "ио", "берт", "альд", "ольф", "ред", "рик", "си", "ти", "ви",
            "бин", "вин", "кин", "лин", "мин", "пин", "рин", "тин", "вин", "зин",
            "эр", "ар", "ор", "ур", "ир", "яр", "юр", "ард", "ерд", "орд"
        ],
    },
    "dragonborn": {
        prefixes: [
            "Ар", "Игн", "Вул", "Глац", "Цим", "Хидр", "Электр", "Терр", "Аэр", "Нокт",
            "Драк", "Скор", "Ксил", "Вор", "Гнэ", "Зхар", "Крикс", "Тарн", "Фанг", "Коготь",
            "Вор", "Кор", "Зор", "Мор", "Нор", "Ракс", "Векс", "Зекс", "Мекс", "Рекс",
                        "Игни", "Глаци", "Фульгу", "Терра", "Акви", "Аэри", "Умбра", "Люмен", "Вулка", "Темпе",
            "Драко", "Скор", "Винг", "Когни", "Фанг", "Хорн", "Тейл", "Брин", "Скайл", "Плаум"
        ],
        middles: [
            "ар", "ур", "ор", "ир", "яр", "юр", "аар", "уур", "оор", "иир",
            "ти", "ри", "ни", "си", "ви", "ди", "ми", "ли", "ки", "пи",
            "гх", "кх", "тх", "зх", "сх", "вх", "дх", "мх", "рх", "лх",
            "ск", "зк", "вк", "дк", "мк", "рк", "лк", "нк", "тк", "пк",
                        "ар", "ур", "ор", "ир", "яр", "ан", "ун", "он", "ин", "ен",
            "ак", "ук", "ок", "ик", "ек", "ас", "ус", "ос", "ис", "ес"
        ],
        suffixes: [
            "арн", "урн", "орн", "ирн", "ярн", "юарн", "уурн", "оорн", "иирн", "аарн",
            "акс", "укс", "окс", "икс", "якс", "юкс", "аакс", "уукс", "оокс", "иикс",
            "ион", "уон", "оон", "иан", "уан", "оан", "ианн", "уанн", "оанн", "ионн",
                        "рикс", "торн", "зарн", "валь", "грах", "скор", "нар", "рот", "зул", "файр",
            "клав", "фанг", "хорн", "скейл", "винг", "тейл", "брин", "савр", "дракс", "вис"
        ],
        femaleSuffixes: [
            "а", "иа", "уа", "оа", "я", "ю", "е", "и", "у", "о",
            "ара", "ура", "ора", "ира", "яра", "юра", "ера", "ира", "ура", "ора",
            "ия", "уя", "оя", "ия", "уя", "оя", "ия", "уя", "оя", "ея"
        ],
        maleSuffixes: [
            "ус", "ос", "ас", "ес", "ис", "юс", "яс", "еус", "иус", "оус",
            "ар", "ор", "ур", "ир", "яр", "юр", "аар", "оор", "уур", "иир",
            "ух", "ох", "ах", "ех", "их", "юх", "ях", "еух", "иух", "оух"
        ],
    },
    "tiefling": {
        prefixes: [
            "Зэр", "Мал", "Нок", "Весп", "Люц", "Сана", "Дамар", "Сераф", "Зар", "Амон",
            "Умбр", "Тенеб", "Нокт", "Скор", "Мор", "Хел", "Эреб", "Стиг", "Ахер", "Флег",
            "Кали", "Неме", "Лилит", "Хекат", "Белладон", "Испе", "Вале", "Эли", "Изол", "Ориан",
                        "Азра", "Малфе", "Нокс", "Скорт", "Круор", "Умбр", "Игни", "Пирро", "Випер", "Стиг",
            "Демо", "Инфер", "Аббад", "Тартар", "Дис", "Ахер", "Флег", "Коши", "Вейл", "Грим"
        ],
        middles: [
            "и", "а", "о", "у", "э", "я", "ю", "е",
            "ри", "ли", "ни", "си", "ти", "ви", "ди", "ми",
            "ар", "ур", "ор", "ир", "яр", "ер", "ор", "ар",
            "кс", "з", "с", "т", "в", "д", "м", "р",
                        "ар", "ур", "ор", "ир", "ер", "ан", "ун", "он", "ин", "ен",
            "ак", "ук", "ок", "ик", "ек", "ас", "ус", "ос", "ис", "ес"
        ],
        suffixes: [
            "иэль", "аэль", "ион", "арон", "орион", "ирион", "урион", "арион",
            "иус", "аус", "орис", "ирис", "арис", "урис", "эрис", "ирис",
                        "карн", "торн", "зорн", "морн", "норн", "вис", "тис", "кис", "мис", "нис",
            "торикс", "морикс", "зорикс", "норикс", "вирикс", "кан", "ман", "нан", "ван", "зан"
        ],
        femaleSuffixes: [
            "а", "иа", "ея", "ия", "оя", "уя", "ела", "ила", "ола", "ула",
            "исса", "есса", "исса", "осса", "усса", "етта", "итта", "отта", "утта",
            "инна", "енна", "анна", "онна", "унна", "ели", "или", "оли", "ули"
        ],
        maleSuffixes: [
            "ус", "ос", "ас", "ес", "ис", "он", "ан", "ен", "ин", "ун",
            "ор", "ар", "ур", "ир", "ер", "орр", "арр", "урр", "ирр", "ерр",
            "ок", "ак", "ек", "ик", "ук", "окс", "акс", "екс", "икс", "укс"
        ],
    },
    "half-orc": {
        prefixes: [
            "Гар", "Гор", "Гур", "Гхор", "Гхур", "Дар", "Дор", "Дур", "Дрог", "Драг",
            "Мог", "Муг", "Мар", "Мор", "Мур", "Шар", "Шор", "Шур", "Шраг", "Штур",
            "Хаг", "Хуг", "Хар", "Хор", "Хур", "Брог", "Браг", "Бур", "Бор", "Бар",
            "Луг", "Лаг", "Лор", "Лур", "Лар", "Снар", "Сног", "Стур", "Скар", "Скор",
            "Ульф", "Урс", "Уг", "Ур", "Ул", "Раз", "Руг", "Рар", "Рор", "Рур",
            "Горд", "Гард", "Гурд", "Гхар", "Гхурд",
            "Гро", "Гул", "Скор", "Гом", "Гло", "Грил", "Гро", "Гром", "Грот", "Гроф",
            "Гхур", "Дак", "Гхун", "Зуг", "Муг", "Руг", "Туг", "Гхор", "Грох", "Гулх",
            "Скорх", "Гомх", "Глох", "Грилх", "Тар", "Хаг", "Краг", "Брог", "Гор", "Дарг",
            "Гхор", "Шар", "Уг", "Луг", "Стуг", "Гхол", "Бург", "Дрог", "Мар", "Нар"
        ],
        middles: [
            "зу", "гу", "ку", "ту", "фу", "за", "га", "ка", "та", "фа",
            "зо", "го", "ко", "то", "фо", "зи", "ги", "ки", "ти", "фи",
            "гх", "кх", "тх", "фх", "зг", "рг", "кг", "тг", "фг", "зг",
            "нк", "нг", "нт", "нф", "нз", "рк", "рг", "рт", "рф", "рз",
            "зу", "гу", "ку", "ту", "фу", "за", "га", "ка", "та", "фа",
            "зо", "го", "ко", "то", "фо", "гх", "кх", "тх", "фх", "зх"
        ],
        suffixes: [
            "з", "г", "к", "т", "ф", "за", "га", "ка", "та", "фа",
            "зо", "го", "ко", "то", "фо", "зи", "ги", "ки", "ти", "фи",
            "гук", "зук", "кук", "тук", "фук", "гар", "зар", "кар", "тар", "фар",
            "гор", "зор", "кор", "тор", "фор",
            "фанг", "зан", "гаш", "кан", "рул", "ток", "дан", "раш", "маш", "алл",
            "нах", "зан", "зул", "фара", "неш", "рог", "баг", "даг", "раг", "шаг",
            "фак", "так", "ваг", "наг", "лаг", "стаг", "хед", "год", "род", "год",
            "зад", "пад", "кад", "мад", "сад", "вад"
        ],
        femaleSuffixes: [
            "га", "за", "ка", "та", "фа", "ги", "зи", "ки", "ти", "фи",
            "ша", "жа", "ча", "ща", "ра", "ши", "жи", "чи", "щи", "ри",
            "на", "ма", "ла", "ра", "ва", "ни", "ми", "ли", "ри", "ви"
        ],
        maleSuffixes: [
            "г", "з", "к", "т", "ф", "гх", "зг", "кг", "тг", "фг",
            "рг", "рк", "рт", "рф", "рз", "нк", "нг", "нт", "нф", "нз",
            "ук", "уг", "ут", "уф", "уз", "ак", "аг", "ат", "аф", "аз",
            "ок", "ог", "от", "оф", "оз"
        ],
    },
    "half-elf": {
        prefixes: [
            "Ал", "Эл", "Ил", "Ар", "Эр", "Аэ", "Эа", "Ла", "Ле", "Ли",
            "Джо", "Виль", "Эд", "Том", "Бен", "Сам", "Рик", "Мар", "Лю", "Жан",
            "Аран", "Эриан", "Илиан", "Ориан", "Уриан", "Каэл", "Реан", "Теан", "Веан", "Сеан",
            "Грин", "Силвер", "Голд", "Блэк", "Уайт", "Ред", "Блу", "Грей", "Браун", "Фэйр",
            "Стоун", "Айрон", "Стил", "Вуд", "Филд", "Хилл", "Ривер", "Лейк", "Си", "Скай",
            "Ара", "Эль", "Ил", "Оро", "Уру", "Ла", "Ле", "Ли", "Ло", "Лу",
            "Сил", "Гал", "Мел", "Пел", "Кел", "Тел", "Вел", "Нел", "Рел", "Селе"
        ],
        middles: [
            "ри", "ли", "ни", "си", "ти", "ви", "ди", "ми", "би", "пи",
            "ан", "ен", "ин", "он", "ун", "ян", "енн", "инн", "онн", "унн",
            "ар", "ер", "ир", "ор", "ур", "яр", "ерр", "ирр", "орр", "урр",
            "дел", "тел", "вел", "нел", "рел", "сел", "кел", "мел", "пел", "фел"
        ],
        suffixes: [
            "ан", "ен", "ин", "он", "ун", "ар", "ер", "ир", "ор", "ур",
            "иль", "аль", "ель", "оль", "уль", "иус", "аус", "еус", "иус", "оус",
                        "филд", "вуд", "ридж", "вейл", "брук", "дейл", "холм", "лейк", "шор", "порт",
            "риэль", "диэль", "тиэль", "виэль", "ниэль", "рон", "дон", "тон", "фон", "вон"
        ],
        femaleSuffixes: [
            "а", "иа", "ея", "ия", "ела", "ила", "ола", "ула", "ина", "ена",
            "етта", "итта", "отта", "утта", "ели", "или", "оли", "ули", "анна", "енна",
            "лин", "линн", "рин", "ринн", "син", "синн", "тин", "тинн", "вин", "винн"
        ],
        maleSuffixes: [
            "ор", "ар", "ур", "ир", "ер", "ан", "ен", "ин", "он", "ун",
            "ард", "ерд", "ирд", "орд", "урд", "альд", "ельд", "ильд", "ольд", "ульд",
            "рик", "дик", "мик", "ник", "тик", "вик", "лик", "сик", "кик", "пик"
        ],
    },
    "gnome": {
        prefixes: [
            "Глим", "Зук", "Тим", "Физ", "Спар", "Гир", "Ког", "Видж", "Гадж", "Спринг",
            "Брил", "Глим", "Спин", "Твинк", "Флип", "Пиб", "Ним", "Зиз", "Диз", "Биз",
            "Элдо", "Фило", "Кип", "Бод", "Стер", "Флин", "Поп", "Зук", "Винк", "Блинк",
                       "Зин", "Блик", "Сверк", "Мерц", "Сиян", "Лун", "Солн", "Зар", "Огн", "Плам",
            "Верт", "Сквор", "Трещ", "Щелк", "Жужж", "Гуд", "Свист", "Шип", "Бряк", "Стук"
        ],
        middles: [
            "и", "а", "о", "у", "э", "я", "ю", "е",
            "бер", "дер", "кер", "лер", "мер", "нер", "пер", "тер",
            "бо", "до", "го", "ло", "мо", "но", "по", "ро",
            "бле", "гле", "кле", "пле", "тле", "вле", "зле", "сле",
                   "о", "е", "и", "у", "ю", "ко", "ло", "мо", "но", "ро",
            "ка", "ла", "ма", "на", "ра", "че", "ше", "ще", "це", "це"
        ],
        suffixes: [
            "л", "р", "н", "т", "с", "з", "к", "п", "в", "м",
            "вик", "лик", "ник", "тик", "вик", "зик", "сик", "рик",
            "гет", "дет", "кет", "лет", "мет", "нет", "пет", "тет",
                        "ка", "ец", "ик", "ун", "ач", "аль", "иль", "арь", "ист", "ер",
            "кий", "ный", "ливый", "чивый", "ячий", "ащий", "ящий", "учий", "ящий", "щий"
        ],
        femaleSuffixes: [
            "а", "иа", "ела", "ила", "ола", "ула", "ина", "ена",
            "етта", "итта", "отта", "утта", "ели", "или", "оли", "ули",
            "лин", "линн", "рин", "ринн", "син", "синн", "тин", "тинн"
        ],
        maleSuffixes: [
            "о", "ио", "бо", "до", "го", "ло", "мо", "но", "по", "ро",
            "бус", "дус", "гус", "лус", "мус", "нус", "пус", "рус",
            "гл", "дл", "кл", "пл", "тл", "вл", "зл", "сл"
        ],
    }
};

function generateSurnameFromSyllables(syllables: any): string {
    const { familyPrefixes, familySuffixes, familyMiddles } = syllables;
    
    // Проверяем наличие всех компонентов для фамилии
    const hasFamilyPrefixes = familyPrefixes && familyPrefixes.length > 0;
    const hasFamilySuffixes = familySuffixes && familySuffixes.length > 0;
    const hasFamilyMiddles = familyMiddles && familyMiddles.length > 0;
    
    console.log('generateSurnameFromSyllables: Проверка компонентов фамилии:', {
        familyPrefixes: familyPrefixes,
        familySuffixes: familySuffixes,
        familyMiddles: familyMiddles,
        hasFamilyPrefixes,
        hasFamilySuffixes,
        hasFamilyMiddles
    });
    
    // Если нет всех компонентов, не генерируем фамилию
    if (!hasFamilyPrefixes || !hasFamilySuffixes || !hasFamilyMiddles) {
        console.log('generateSurnameFromSyllables: Нет всех компонентов, возвращаем пустую строку');
        return '';
    }
    
    // Генерируем фамилию: prefix + middle + suffix
    const prefix = familyPrefixes[Math.floor(Math.random() * familyPrefixes.length)];
    const middle = familyMiddles[Math.floor(Math.random() * familyMiddles.length)];
    const suffix = familySuffixes[Math.floor(Math.random() * familySuffixes.length)];
    
    const surname = prefix + middle + suffix;
    
    console.log('generateSurnameFromSyllables: Сгенерирована фамилия:', surname);
    
    return applyPhoneticRules(surname);
}

function generateNameFromSyllables(syllables: any, gender: string): string {
    const { prefixes, middles, suffixes, femaleSuffixes, maleSuffixes, starters, enders } = syllables;
    
    const hasStarters = starters && starters.length > 0;
    const hasEnders = enders && enders.length > 0;
    const hasMiddles = middles && middles.length > 0;
    
    // Создаем массив всех возможных схем
    const schemes = [
        // Базовые схемы (всегда доступны)
        { name: 'prefix + suffix', hasStarter: false, hasMiddle: false, hasEnder: false },
        { name: 'prefix + middle + suffix', hasStarter: false, hasMiddle: true, hasEnder: false },
        
        // Схемы с enders (если доступны)
        ...(hasEnders ? [
            { name: 'prefix + suffix + ender', hasStarter: false, hasMiddle: false, hasEnder: true },
            { name: 'prefix + middle + suffix + ender', hasStarter: false, hasMiddle: true, hasEnder: true }
        ] : []),
        
        // Схемы с starters (если доступны)
        ...(hasStarters ? [
            { name: 'starter + prefix + suffix', hasStarter: true, hasMiddle: false, hasEnder: false },
            { name: 'starter + prefix + middle + suffix', hasStarter: true, hasMiddle: true, hasEnder: false },
            ...(hasEnders ? [
                { name: 'starter + prefix + suffix + ender', hasStarter: true, hasMiddle: false, hasEnder: true },
                { name: 'starter + prefix + middle + suffix + ender', hasStarter: true, hasMiddle: true, hasEnder: true }
            ] : [])
        ] : [])
    ];
    
    // Выбираем случайную схему
    const selectedScheme = schemes[Math.floor(Math.random() * schemes.length)];
    
    // Генерируем компоненты
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const middle = selectedScheme.hasMiddle && hasMiddles ? 
        middles[Math.floor(Math.random() * middles.length)] : '';
    const starter = selectedScheme.hasStarter && hasStarters ? 
        starters[Math.floor(Math.random() * starters.length)] : '';
    const ender = selectedScheme.hasEnder && hasEnders ? 
        enders[Math.floor(Math.random() * enders.length)] : '';
    
    // Выбираем суффикс в зависимости от пола
    let suffix: string = '';
    
    const hasGeneralSuffixes = suffixes && suffixes.length > 0;
    const hasFemaleSuffixes = femaleSuffixes && femaleSuffixes.length > 0;
    const hasMaleSuffixes = maleSuffixes && maleSuffixes.length > 0;
    
    if (gender === 'female') {
        if (hasFemaleSuffixes) {
            suffix = femaleSuffixes[Math.floor(Math.random() * femaleSuffixes.length)];
        } else if (hasGeneralSuffixes) {
            suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        }
    } else if (gender === 'male') {
        if (hasMaleSuffixes) {
            suffix = maleSuffixes[Math.floor(Math.random() * maleSuffixes.length)];
        } else if (hasGeneralSuffixes) {
            suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        }
    } else {
        // Для "any" выбираем случайно между доступными типами
        const availableTypes: string[] = [];
        if (hasGeneralSuffixes) availableTypes.push('general');
        if (hasFemaleSuffixes) availableTypes.push('female');
        if (hasMaleSuffixes) availableTypes.push('male');
        
        if (availableTypes.length > 0) {
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
            }
        }
    }
    
    // Собираем имя согласно выбранной схеме
    let name = '';
    if (selectedScheme.hasStarter) {
        const fullName = starter + prefix + middle + suffix + ender;
        if (fullName.length > 8 && Math.random() < 0.3) {
            // Добавляем апостроф для длинных имен (30% вероятность)
            name = starter + "'" + prefix + middle + suffix + ender;
        } else {
            name = fullName;
        }
    } else {
        name = prefix + middle + suffix + ender;
    }
    
    return applyPhoneticRules(name);
}

function applyPhoneticRules(name: string): string {
    console.log(`applyPhoneticRules: Исходное имя: "${name}"`);
    
    name = name.replace(/(.)\1{2,}/g, '$1$1');
    name = name.replace(/[бвгджзклмнпрстфхцчшщ]{4,}/g, (match) => {
        return match.substring(0, 3);
    });
    // Убираем неудобные сочетания гласных (более 2 подряд) - НОВОЕ ПРАВИЛО
    // (дублирование удалено - правило есть ниже)
    
    // НОВОЕ ПРАВИЛО: Запрещаем повторение согласных через одну букву (гтг, бкб, днд)
    name = name.replace(/([бвгджзклмнпрстфхцчшщ])[аеёиоуыэюя]([бвгджзклмнпрстфхцчшщ])\1/g, (match, consonant1, vowel, consonant2) => {
        // Заменяем повторяющуюся согласную на другую
        const alternatives = {
            'б': 'в', 'в': 'б', 'г': 'к', 'к': 'г', 'д': 'т', 'т': 'д',
            'з': 'с', 'с': 'з', 'ж': 'ш', 'ш': 'ж', 'л': 'р', 'р': 'л',
            'м': 'н', 'н': 'м', 'п': 'ф', 'ф': 'п', 'х': 'ц', 'ц': 'х'
        };
        const replacement = alternatives[consonant1] || 'л';
        return consonant1 + vowel + replacement;
    });
    
    // НОВОЕ ПРАВИЛО: Убираем 3+ одинаковых согласных подряд (Гиминннм -> Гиминм или Гиминанм)
    name = name.replace(/([бвгджзклмнпрстфхцчшщ])\1{2,}/g, (match, consonant) => {
        // Случайно выбираем: убрать лишние или вставить гласную
        if (Math.random() < 0.5) {
            // Убираем лишние согласные (оставляем максимум 2)
            return consonant + consonant;
        } else {
            // Вставляем гласную между согласными
            const vowels = ['а', 'е', 'и', 'о', 'у', 'э', 'ю', 'я'];
            const randomVowel = vowels[Math.floor(Math.random() * vowels.length)];
            return consonant + randomVowel + consonant;
        }
    });
    
    // НОВОЕ ПРАВИЛО: Смягчаем сочетания типа "энрль", "амрль" - вставляем гласную между согласными
    name = name.replace(/([аеёиоуыэюя])([бвгджзклмнпрстфхцчшщ]{3,})/g, (match, vowel, consonants) => {
        // Если после гласной идет 3+ согласных подряд, вставляем гласную между ними
        const vowels = ['а', 'е', 'и', 'о', 'у', 'э', 'ю', 'я'];
        const randomVowel = vowels[Math.floor(Math.random() * vowels.length)];
        
        // Вставляем гласную после второй согласной
        const firstTwo = consonants.substring(0, 2);
        const rest = consonants.substring(2);
        return vowel + firstTwo + randomVowel + rest;
    });
    
    // НОВОЕ ПРАВИЛО: Запрещаем повторяющиеся пары букв подряд (льль, рррр, нннн)
    name = name.replace(/([а-яё])\1{3,}/g, (match, letter) => {
        // Оставляем максимум 2 одинаковые буквы подряд
        return letter + letter;
    });
    
    // НОВОЕ ПРАВИЛО: Запрещаем 3 гласные подряд (максимум 2)
    name = name.replace(/[аеёиоуыэюя]{3,}/g, (match) => {
        return match.substring(0, 2);
    });
    
    // НОВОЕ ПРАВИЛО: Запрещаем 2 буквы "ю" в имени
    name = name.replace(/ю.*ю/g, (match) => {
        // Заменяем вторую "ю" на случайную гласную
        const vowels = ['а', 'е', 'и', 'о', 'у', 'э', 'я'];
        const randomVowel = vowels[Math.floor(Math.random() * vowels.length)];
        return match.replace(/ю$/, randomVowel);
    });
    
    // НОВОЕ ПРАВИЛО: Повторение гласных может быть только один раз в имени (Гаармаар -> Гаармар)
    const vowelPairs = ['аа', 'ее', 'ии', 'оо', 'уу', 'ээ', 'юю', 'яя', 'ёё'];
    let vowelPairCount = 0;
    let foundPair = '';
    
    // Считаем количество повторяющихся гласных
    for (const pair of vowelPairs) {
        const matches = name.match(new RegExp(pair, 'g'));
        if (matches) {
            vowelPairCount += matches.length;
            if (matches.length > 0) {
                foundPair = pair;
            }
        }
    }
    
    // Если найдено больше одного повторения гласных, убираем лишние
    if (vowelPairCount > 1) {
        // Оставляем только первое вхождение повторяющихся гласных
        const firstPairIndex = name.indexOf(foundPair);
        if (firstPairIndex !== -1) {
            // Заменяем все остальные повторения на одиночные гласные
            name = name.replace(new RegExp(foundPair, 'g'), (match, offset) => {
                return offset === firstPairIndex ? match : match[0];
            });
        }
    }
    
    // НОВОЕ ПРАВИЛО: Мягкий знак может быть только в конце имени (из середины убирать)
    // Проверяем, есть ли мягкий знак в середине имени
    if (name.length > 1 && name.includes('ь')) {
        const lastChar = name[name.length - 1];
        if (lastChar === 'ь') {
            // Если мягкий знак в конце - оставляем
            // Убираем мягкий знак из середины
            name = name.replace(/ь(?!$)/g, '');
        } else {
            // Если мягкий знак не в конце - убираем все мягкие знаки
            name = name.replace(/ь/g, '');
        }
    }
    
    // НОВОЕ ПРАВИЛО: Убираем повторяющиеся пары букв (Уророиннааль -> Уроиннааль)
    const allPairs = ['аа', 'ее', 'ии', 'оо', 'уу', 'ээ', 'юю', 'яя', 'ёё', 'бб', 'вв', 'гг', 'дд', 'жж', 'зз', 'кк', 'лл', 'мм', 'нн', 'пп', 'рр', 'сс', 'тт', 'фф', 'хх', 'цц', 'чч', 'шш', 'щщ'];
    
    for (const pair of allPairs) {
        const regex = new RegExp(pair + '.*' + pair, 'g');
        if (regex.test(name)) {
            // Найдена повторяющаяся пара - оставляем только первое вхождение
            name = name.replace(regex, (match) => {
                const firstIndex = match.indexOf(pair);
                return match.substring(0, firstIndex + 2) + match.substring(firstIndex + 2).replace(new RegExp(pair, 'g'), pair[0]);
            });
        }
    }
    
    // НОВОЕ ПРАВИЛО: После двойной согласной не может быть двойной гласной (и наоборот)
    const consonantPairs = ['бб', 'вв', 'гг', 'дд', 'жж', 'зз', 'кк', 'лл', 'мм', 'нн', 'пп', 'рр', 'сс', 'тт', 'фф', 'хх', 'цц', 'чч', 'шш', 'щщ'];
    const vowelPairsForConsonantRule = ['аа', 'ее', 'ии', 'оо', 'уу', 'ээ', 'юю', 'яя', 'ёё'];
    
    // Проверяем сочетания двойная согласная + двойная гласная
    for (const consonantPair of consonantPairs) {
        for (const vowelPair of vowelPairsForConsonantRule) {
            const pattern = consonantPair + vowelPair;
            if (name.includes(pattern)) {
                // Заменяем двойную гласную на одиночную
                name = name.replace(pattern, consonantPair + vowelPair[0]);
            }
        }
    }
    
    // Проверяем сочетания двойная гласная + двойная согласная
    for (const vowelPair of vowelPairsForConsonantRule) {
        for (const consonantPair of consonantPairs) {
            const pattern = vowelPair + consonantPair;
            if (name.includes(pattern)) {
                // Заменяем двойную согласную на одиночную
                name = name.replace(pattern, vowelPair + consonantPair[0]);
            }
        }
    }
    
    // НОВОЕ ПРАВИЛО: Убираем похожие слоги (Эрурулаон -> Эрулаон)
    // Ищем повторяющиеся слоги (согласная + гласная) и одиночные гласные
    const syllables = name.match(/[бвгджзклмнпрстфхцчшщ][аеёиоуыэюя]/g);
    const singleVowels = name.match(/[аеёиоуыэюя]/g);
    
    // Обрабатываем слоги согласная + гласная
    if (syllables && syllables.length > 1) {
        // Группируем слоги по похожести (одинаковые согласные или гласные)
        const similarGroups = new Map();
        
        for (const syllable of syllables) {
            const consonant = syllable[0];
            const vowel = syllable[1];
            
            // Создаем ключ для похожих слогов (по согласной или по гласной)
            const consonantKey = `consonant_${consonant}`;
            const vowelKey = `vowel_${vowel}`;
            
            if (!similarGroups.has(consonantKey)) {
                similarGroups.set(consonantKey, []);
            }
            if (!similarGroups.has(vowelKey)) {
                similarGroups.set(vowelKey, []);
            }
            
            similarGroups.get(consonantKey).push(syllable);
            similarGroups.get(vowelKey).push(syllable);
        }
        
        // Находим группы с повторяющимися слогами
        for (const [key, group] of similarGroups) {
            if (group.length > 1) {
                // Находим все вхождения повторяющихся слогов
                const uniqueSyllables = [...new Set(group)];
                for (const syllable of uniqueSyllables) {
                    const regex = new RegExp(syllable as string, 'g');
                    const matches = name.match(regex);
                    if (matches && matches.length > 1) {
                        // Оставляем только первое вхождение слога
                        let firstFound = false;
                        name = name.replace(regex, (match) => {
                            if (!firstFound) {
                                firstFound = true;
                                return match;
                            } else {
                                return ''; // Убираем повторяющиеся слоги
                            }
                        });
                    }
                }
            }
        }
    }
    
    // Обрабатываем одиночные гласные (убираем повторяющиеся)
    if (singleVowels && singleVowels.length > 1) {
        const vowelGroups = new Map();
        
        for (const vowel of singleVowels) {
            if (!vowelGroups.has(vowel)) {
                vowelGroups.set(vowel, []);
            }
            vowelGroups.get(vowel).push(vowel);
        }
        
        // Убираем повторяющиеся одиночные гласные
        for (const [vowel, group] of vowelGroups) {
            if (group.length > 1) {
                const regex = new RegExp(vowel, 'g');
                const matches = name.match(regex);
                if (matches && matches.length > 1) {
                    // Оставляем только первое вхождение гласной
                    let firstFound = false;
                    name = name.replace(regex, (match) => {
                        if (!firstFound) {
                            firstFound = true;
                            return match;
                        } else {
                            return ''; // Убираем повторяющиеся гласные
                        }
                    });
                }
            }
        }
    }
    
    // ДОПОЛНИТЕЛЬНОЕ ПРАВИЛО: Убираем повторяющиеся слоги в разных частях имени
    // Ищем слоги длиной 2-3 символа и убираем повторяющиеся
    const allSyllables = name.match(/[бвгджзклмнпрстфхцчшщ][аеёиоуыэюя][бвгджзклмнпрстфхцчшщ]?/g);
    if (allSyllables && allSyllables.length > 1) {
        const syllableCount = new Map();
        
        // Считаем количество каждого слога
        for (const syllable of allSyllables) {
            if (!syllableCount.has(syllable)) {
                syllableCount.set(syllable, 0);
            }
            syllableCount.set(syllable, syllableCount.get(syllable) + 1);
        }
        
        // Убираем повторяющиеся слоги
        for (const [syllable, count] of syllableCount) {
            if (count > 1) {
                const regex = new RegExp(syllable, 'g');
                const matches = name.match(regex);
                if (matches && matches.length > 1) {
                    // Оставляем только первое вхождение слога
                    let firstFound = false;
                    name = name.replace(regex, (match) => {
                        if (!firstFound) {
                            firstFound = true;
                            return match;
                        } else {
                            return ''; // Убираем повторяющиеся слоги
                        }
                    });
                }
            }
        }
    }
    
    // ДОПОЛНИТЕЛЬНОЕ ПРАВИЛО: Убираем повторяющиеся слоги длиной 2 символа
    // Ищем слоги согласная + гласная и убираем повторяющиеся
    const twoCharSyllables = name.match(/[бвгджзклмнпрстфхцчшщ][аеёиоуыэюя]/g);
    if (twoCharSyllables && twoCharSyllables.length > 1) {
        const syllableCount = new Map();
        
        // Считаем количество каждого слога
        for (const syllable of twoCharSyllables) {
            if (!syllableCount.has(syllable)) {
                syllableCount.set(syllable, 0);
            }
            syllableCount.set(syllable, syllableCount.get(syllable) + 1);
        }
        
        // Убираем повторяющиеся слоги
        for (const [syllable, count] of syllableCount) {
            if (count > 1) {
                const regex = new RegExp(syllable, 'g');
                const matches = name.match(regex);
                if (matches && matches.length > 1) {
                    // Оставляем только первое вхождение слога
                    let firstFound = false;
                    name = name.replace(regex, (match) => {
                        if (!firstFound) {
                            firstFound = true;
                            return match;
                        } else {
                            return ''; // Убираем повторяющиеся слоги
                        }
                    });
                }
            }
        }
    }
    
    name = name.replace(/л{2,}/g, 'л');
    name = name.replace(/р{2,}/g, 'р');
    name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    name = name.replace(/^'+|'+$/g, '');
    
    // console.log(`applyPhoneticRules: Финальное имя: "${name}"`);
    return name;
}

export function generateCyrillicFantasyName(race?: string, characterClass?: string, gender: string = "any"): string {
    let actualGender = gender;
    if (gender === "any") {
        actualGender = Math.random() > 0.5 ? "male" : "female";
    }
    
    const raceKey = race || 'human';
    
    // console.log('generateCyrillicFantasyName: Входные параметры:', {
    //     race,
    //     raceKey,
    //     characterClass,
    //     gender,
    //     actualGender
    // });
    
    // console.log('generateCyrillicFantasyName: Доступные расы:', Object.keys(RACE_SYLLABLES));
    
    // Проверяем, есть ли данные для этой расы
    let raceData = RACE_SYLLABLES[raceKey as keyof typeof RACE_SYLLABLES];
    
    // Если не найдено, пробуем kebab-case версию
    if (!raceData && raceKey.includes('-')) {
        const kebabKey = raceKey.replace('-', '');
        raceData = RACE_SYLLABLES[kebabKey as keyof typeof RACE_SYLLABLES];
        // console.log('generateCyrillicFantasyName: Пробуем kebab-case версию:', kebabKey);
    }
    
    // Если не найдено, пробуем camelCase версию
    if (!raceData && raceKey.includes('-')) {
        const camelKey = raceKey.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
        raceData = RACE_SYLLABLES[camelKey as keyof typeof RACE_SYLLABLES];
        // console.log('generateCyrillicFantasyName: Пробуем camelCase версию:', camelKey);
    }
    
    if (raceData) {
        const firstName = generateNameFromSyllables(raceData, actualGender);
        const surname = generateSurnameFromSyllables(raceData);
        
        // console.log('generateCyrillicFantasyName: Результат генерации:', {
        //     race: raceKey,
        //     gender: actualGender,
        //     firstName,
        //     surname,
        //     finalResult: surname ? `${firstName} ${surname}` : firstName
        // });
        
        return surname ? `${firstName} ${surname}` : firstName;
    }
    
    // Fallback для неизвестных рас
    // console.log('generateCyrillicFantasyName: Раса не найдена, возвращаем "Неизвестное Имя"');
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
