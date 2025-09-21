/* Полный file: character.tsx — (оригинальный код + добавлены spells и методы) */
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// Тип для способа расчета хитов
export type HpMode = "fixed" | "roll";

export type Abilities = {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
};

// Основная информация о персонаже
export type Basics = {
  name: string;
  race: string;          // ключ расы (например: "human", "elf")
  subrace?: string;      // ключ подрасы (например: "high-elf", "hill-dwarf")
  class: string;
  background: string;
  backgroundBonuses?: Partial<Record<keyof Abilities, number>>;
  backgroundSkills?: string[];
  raceBonuses?: Partial<Record<keyof Abilities, number>>;
  alignment: string;
  level: number;
  subclass: string;
  edition: "5e" | string;
  hpMode: HpMode;
  hpCurrent?: number;
};

// (предполагается, что Abilities у тебя определён в другом месте и импортируется/описан выше)
export type AsiSelection = {
  mode: "asi" | "feat";
  s1?: keyof Abilities;
  s2?: keyof Abilities;
  feat?: string;
};

// Полный черновик персонажа
export type CharacterDraft = {
  basics: Basics;        // основная информация
  stats: Abilities;      // базовые характеристики
  asi: Record<number, AsiSelection>; // улучшения по уровням
  spells: string[]; // список ключей заклинаний
};

// Значения по умолчанию для нового персонажа
const defaultDraft: CharacterDraft = {
  basics: {
    name: "",
    race: "human",       // раса по умолчанию
    class: "fighter",    // класс по умолчанию
    background: "entertainer", // предыстория по умолчанию
    backgroundBonuses: {},
    backgroundSkills: [],
    raceBonuses: {},
    alignment: "chaotic-good",
    level: 1,
    subclass: "",
    edition: "5e",
    hpMode: "fixed",
    hpCurrent: 0,
  },
  stats: {
    str: 10,
    dex: 14,
    con: 12,
    int: 15,
    wis: 10,
    cha: 8,
  },
  asi: {},
  spells: [], // <- добавлено: по умолчанию пустой список заклинаний
};

// Ключ для localStorage
const STORAGE_KEY = "dnd-ru-character";

// Интерфейс контекста персонажа
type CharacterContextType = {
  // Данные персонажа
  basics: Basics;
  stats: Abilities;
  asi: Record<number, AsiSelection>;

  // 🔹 Список заклинаний (ключи)
  spells: string[];

  // Методы обновления данных
  setBasics: (patch: Partial<Basics>) => void;
  setName: (name: string) => void;
  setHpMode: (mode: HpMode) => void;
  setStat: (key: keyof Abilities, value: number) => void;
  choose: (patch: Partial<Basics>) => void; // псевдоним для setBasics
  setLevel: (level: number) => void;
  setSubclass: (subclass: string) => void;

  // Методы для улучшений характеристик
  setAsiMode: (level: number, mode: AsiSelection["mode"]) => void;
  setAsiStats: (level: number, s1?: keyof Abilities, s2?: keyof Abilities) => void;
  setAsiFeat: (level: number, feat?: string) => void;

  // Методы для бонусов
  setBackgroundBonuses: (bonuses: Partial<Record<keyof Abilities, number>>) => void;
  setBackgroundSkills: (skills: string[]) => void;
  setRaceBonuses: (bonuses: Partial<Record<keyof Abilities, number>>) => void;

  // Новые методы для управления расой
  setRace: (race: string, subrace?: string, bonuses?: Partial<Record<keyof Abilities, number>>) => void;
  setSubrace: (subrace: string, bonuses?: Partial<Record<keyof Abilities, number>>) => void;
  clearRaceBonuses: () => void;

  // Методы для работы с заклинаниями
  addSpell: (key: string) => void;
  removeSpell: (key: string) => void;
  setSpells: (keys: string[]) => void;

  // Сохранение
  save: () => void;
};

// Создание контекста
const CharacterContext = createContext<CharacterContextType | null>(null);

// Провайдер контекста персонажа
export function CharacterProvider({ children }: { children: React.ReactNode }) {
  // Состояние черновика персонажа
  const [draft, setDraft] = useState<CharacterDraft>(() => {
    try {
      // Попытка загрузить из localStorage
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as CharacterDraft;
        // Ensure backwards compatibility of nested objects
        return {
          ...saved,
          basics: {
            ...saved.basics,
            raceBonuses: saved.basics.raceBonuses || {},
            backgroundBonuses: saved.basics.backgroundBonuses || {},
            backgroundSkills: saved.basics.backgroundSkills || [],
          },
          spells: saved.spells || [],
        };
      }
    } catch (error) {
      console.error("Error loading character from localStorage:", error);
    }
    return defaultDraft;
  });

  // Автосохранение при изменении черновика
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch (error) {
      console.error("Error saving character to localStorage:", error);
    }
  }, [draft]);

  // API для работы с персонажем
  const api: CharacterContextType = useMemo(
    () => ({
      // Геттеры
      basics: draft.basics,
      stats: draft.stats,
      asi: draft.asi,
      spells: draft.spells, // <- добавлен геттер для spells

      // Обновление основной информации
      setBasics: (patch) =>
        setDraft((d) => ({
          ...d,
          basics: { ...d.basics, ...patch },
        })),

      // Установка имени
      setName: (name) =>
        setDraft((d) => ({
          ...d,
          basics: { ...d.basics, name },
        })),

      // Установка способа расчета хитов
      setHpMode: (mode) =>
        setDraft((d) => ({
          ...d,
          basics: { ...d.basics, hpMode: mode },
        })),

      // Псевдоним для setBasics (используется в компонентах выбора)
      choose: (patch) =>
        setDraft((d) => ({
          ...d,
          basics: { ...d.basics, ...patch },
        })),

      // Установка значения характеристики
      setStat: (key, value) =>
        setDraft((d) => ({
          ...d,
          stats: { ...d.stats, [key]: value },
        })),

      // Установка уровня
      setLevel: (level) =>
        setDraft((d) => ({
          ...d,
          basics: { ...d.basics, level },
        })),

      // Установка подкласса
      setSubclass: (subclass) =>
        setDraft((d) => ({
          ...d,
          basics: { ...d.basics, subclass },
        })),

      // Установка типа улучшения (ASI или черта)
      setAsiMode: (level, mode) =>
        setDraft((d) => {
          const prev = d.asi || {};
          const prevLevel = prev[level] || {};
          return {
            ...d,
            asi: { ...prev, [level]: { ...prevLevel, mode } },
          };
        }),

      // Установка характеристик для улучшения ASI
      setAsiStats: (level, s1, s2) =>
        setDraft((d) => {
          const prev = d.asi || {};
          const prevLevel = prev[level] || { mode: "asi" };
          return {
            ...d,
            asi: { ...prev, [level]: { ...prevLevel, mode: "asi", s1, s2 } },
          };
        }),

      // Установка выбранной черты
      setAsiFeat: (level, feat) =>
        setDraft((d) => {
          const prev = d.asi || {};
          const prevLevel = prev[level] || { mode: "feat" };
          return {
            ...d,
            asi: { ...prev, [level]: { ...prevLevel, mode: "feat", feat } },
          };
        }),

      // Установка бонусов от предыстории
      setBackgroundBonuses: (bonuses) =>
        setDraft((d) => ({
          ...d,
          basics: {
            ...d.basics,
            backgroundBonuses: { ...(d.basics.backgroundBonuses || {}), ...bonuses },
          },
        })),

      // Установка навыков от предыстории
      setBackgroundSkills: (skills) =>
        setDraft((d) => ({
          ...d,
          basics: {
            ...d.basics,
            backgroundSkills: skills,
          },
        })),

      // Установка бонусов от расы (добавляет к существующим)
      setRaceBonuses: (bonuses) =>
        setDraft((d) => ({
          ...d,
          basics: { ...d.basics, raceBonuses: { ...(d.basics.raceBonuses || {}), ...bonuses } },
        })),

      // Установка расы с опциональной подрасой и бонусами
      setRace: (race, subrace, bonuses) =>
        setDraft((d) => ({
          ...d,
          basics: { ...d.basics, race, subrace, raceBonuses: bonuses ? { ...bonuses } : {} },
        })),

      // Установка подрасы с дополнительными бонусами
      setSubrace: (subrace, bonuses) =>
        setDraft((d) => ({
          ...d,
          basics: {
            ...d.basics,
            subrace,
            raceBonuses: bonuses ? { ...(d.basics.raceBonuses || {}), ...bonuses } : d.basics.raceBonuses,
          },
        })),

      // Очистка расовых бонусов
      clearRaceBonuses: () =>
        setDraft((d) => ({
          ...d,
          basics: {
            ...d.basics,
            raceBonuses: {},
          },
        })),

      // 🔹 Методы для работы с заклинаниями
      addSpell: (key) =>
        setDraft((d) => ({
          ...d,
          spells: d.spells && d.spells.includes(key) ? d.spells : [...(d.spells || []), key],
        })),

      removeSpell: (key) =>
        setDraft((d) => ({
          ...d,
          spells: (d.spells || []).filter((s) => s !== key),
        })),

      setSpells: (keys) =>
        setDraft((d) => ({
          ...d,
          spells: [...keys],
        })),

      // Принудительное сохранение
      save: () => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
        } catch (error) {
          console.error("Error saving character:", error);
        }
      },
    }),
    [draft],
  );

  return (
    <CharacterContext.Provider value={api}>
      {children}
    </CharacterContext.Provider>
  );
}

// Хук для использования контекста персонажа
export function useCharacter() {
  const ctx = useContext(CharacterContext);
  if (!ctx) {
    throw new Error("useCharacter must be used within a CharacterProvider");
  }
  return ctx;
}
