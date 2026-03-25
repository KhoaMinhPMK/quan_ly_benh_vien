import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import vi, { type Translations } from './vi';
import en from './en';

type Lang = 'vi' | 'en';

const locales: Record<Lang, Translations> = { vi, en };

interface LangCtx {
  lang: Lang;
  t: Translations;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
}

const LanguageContext = createContext<LangCtx>({
  lang: 'vi',
  t: vi,
  setLang: () => {},
  toggleLang: () => {},
});

const STORAGE_KEY = 'medboard_lang';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored === 'en' || stored === 'vi') ? stored : 'vi';
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'vi' ? 'en' : 'vi');
  }, [lang, setLang]);

  return (
    <LanguageContext.Provider value={{ lang, t: locales[lang], setLang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}

export default LanguageContext;
