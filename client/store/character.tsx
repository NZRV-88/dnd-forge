import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type HpMode = "fixed" | "roll";

export type Basics = {
  name: string;
  race: string;
  class: string;
  background: string;
  backgroundBonuses?: Partial<Record<keyof Abilities, number>>;
  raceBonuses?: Partial<Record<keyof Abilities, number>>;
  alignment: string;
  level: number;
  subclass: string;
  edition: "5e" | string;
  hpMode: HpMode; // способ роста хитов
  hpCurrent?: number; // текущие хиты
};

export type Abilities = {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
};

export type AsiSelection = {
  mode: "asi" | "feat";
  s1?: keyof Abilities; // +1 к характеристике
  s2?: keyof Abilities; // +1 к характеристике (может совпадать с s1 => +2)
  feat?: string;
};

export type CharacterDraft = {
  basics: Basics;
  stats: Abilities;
  asi: Record<number, AsiSelection>;
};

const defaultDraft: CharacterDraft = {
  basics: {
    name: "",
    race: "Человек",
    class: "Воин",
    background: "Академик",
    backgroundBonuses: {},
    raceBonuses: {},
    alignment: "Хаотично-добрый",
    level: 1,
    subclass: "",
    edition: "5e",
    hpMode: "fixed", // по умолчанию фиксированный способ
    hpCurrent: 0,
  },
  stats: { str: 10, dex: 14, con: 12, int: 10, wis: 10, cha: 10 },
  asi: {},
};

const STORAGE_KEY = "dnd-ru-character";

type Ctx = {
  basics: Basics;
  stats: Abilities;
  asi: Record<number, AsiSelection>;
  setBasics: (patch: Partial<Basics>) => void;
  setName: (name: string) => void;
  setHpMode: (mode: HpMode) => void;
  setStat: (key: keyof Abilities, value: number) => void;
  choose: (patch: Partial<Basics>) => void; // alias for setBasics used by pick pages
  setLevel: (level: number) => void;
  setSubclass: (subclass: string) => void;
  setAsiMode: (level: number, mode: AsiSelection["mode"]) => void;
  setAsiStats: (
    level: number,
    s1?: keyof Abilities,
    s2?: keyof Abilities,
  ) => void;
  setAsiFeat: (level: number, feat?: string) => void;
  setBackgroundBonuses: (b: Partial<Record<keyof Abilities, number>>) => void;
  setRaceBonuses: (b: Partial<Record<keyof Abilities, number>>) => void;
  save: () => void;
};

const CharacterContext = createContext<Ctx | null>(null);

export function CharacterProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<CharacterDraft>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as CharacterDraft;
    } catch {}
    return defaultDraft;
  });

  useEffect(() => {
    // Auto-save on change
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {}
  }, [draft]);

  const api: Ctx = useMemo(
    () => ({
      basics: draft.basics,
      stats: draft.stats,
      asi: draft.asi,
      setBasics: (patch) =>
        setDraft((d) => ({ ...d, basics: { ...d.basics, ...patch } })),
      setName: (name) =>
        setDraft((d) => ({ ...d, basics: { ...d.basics, name } })),
      setHpMode: (mode) =>
        setDraft((d) => ({ ...d, basics: { ...d.basics, hpMode: mode } })),
      choose: (patch) =>
        setDraft((d) => ({ ...d, basics: { ...d.basics, ...patch } })),
      setStat: (key, value) =>
        setDraft((d) => ({ ...d, stats: { ...d.stats, [key]: value } })),
      setLevel: (level) =>
        setDraft((d) => ({ ...d, basics: { ...d.basics, level } })),
      setSubclass: (subclass) =>
        setDraft((d) => ({ ...d, basics: { ...d.basics, subclass } })),
      setAsiMode: (level, mode) =>
        setDraft((d) => {
          const prev = d.asi || {};
          const prevLevel = prev[level] || {};
          return { ...d, asi: { ...prev, [level]: { ...prevLevel, mode } } };
        }),
      setAsiStats: (level, s1, s2) =>
        setDraft((d) => {
          const prev = d.asi || {};
          const prevLevel = prev[level] || { mode: "asi" };
          return {
            ...d,
            asi: { ...prev, [level]: { ...prevLevel, mode: "asi", s1, s2 } },
          };
        }),
      setAsiFeat: (level, feat) =>
        setDraft((d) => {
          const prev = d.asi || {};
          const prevLevel = prev[level] || { mode: "feat" };
          return {
            ...d,
            asi: { ...prev, [level]: { ...prevLevel, mode: "feat", feat } },
          };
        }),
          setBackgroundBonuses: (b) =>
        setDraft((d) => ({
          ...d,
          basics: { ...d.basics, backgroundBonuses: { ...(d.basics.backgroundBonuses || {}), ...b } },
        })),
      setRaceBonuses: (b) =>
        setDraft((d) => ({
          ...d,
          basics: { ...d.basics, raceBonuses: { ...(d.basics.raceBonuses || {}), ...b } },
        })),
      save: () => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
        } catch {}
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

export function useCharacter() {
  const ctx = useContext(CharacterContext);
  if (!ctx)
    throw new Error("useCharacter must be used within CharacterProvider");
  return ctx;
}
