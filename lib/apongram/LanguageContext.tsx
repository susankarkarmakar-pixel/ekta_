import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { copy, type Language } from "./types";

const STORAGE_KEY = "apongram-language";
const LanguageContext = createContext<{ language: Language; setLanguage: (language: Language) => void; toggleLanguage: () => void }>({ language: "bn", setLanguage: () => undefined, toggleLanguage: () => undefined });

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguage] = useState<Language>("bn");
  useEffect(() => { AsyncStorage.getItem(STORAGE_KEY).then((value) => { if (value === "bn" || value === "en") setLanguage(value); }).catch(() => undefined); }, []);
  useEffect(() => { AsyncStorage.setItem(STORAGE_KEY, language).catch(() => undefined); }, [language]);
  const value = useMemo(() => ({ language, setLanguage, toggleLanguage: () => setLanguage((current) => current === "bn" ? "en" : "bn") }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const { language, ...actions } = useContext(LanguageContext);
  return { language, copy: copy[language], ...actions };
}
