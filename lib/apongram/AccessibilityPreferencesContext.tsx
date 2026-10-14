import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

const ACCESSIBILITY_KEY = "ekta.accessibility.large-text";
type AccessibilityPreferences = { largeText: boolean; setLargeText: (value: boolean) => void };
const AccessibilityContext = createContext<AccessibilityPreferences | null>(null);

export function AccessibilityPreferencesProvider({ children }: PropsWithChildren) {
  const [largeText, setLargeTextState] = useState(false);
  useEffect(() => {
    void AsyncStorage.getItem(ACCESSIBILITY_KEY).then((stored) => setLargeTextState(stored === "true"));
  }, []);
  const setLargeText = (value: boolean) => {
    setLargeTextState(value);
    void AsyncStorage.setItem(ACCESSIBILITY_KEY, String(value));
  };
  const value = useMemo(() => ({ largeText, setLargeText }), [largeText]);
  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibilityPreferences() {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error("useAccessibilityPreferences must be used inside AccessibilityPreferencesProvider");
  return context;
}

export const LARGE_TEXT_MAX_MULTIPLIER = 1.3;
