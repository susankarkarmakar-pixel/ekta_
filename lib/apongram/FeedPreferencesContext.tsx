import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import {
  DEFAULT_FEED_PREFERENCES,
  loadFeedPreferences,
  saveFeedPreferences,
  type FeedPreferences,
} from "./feed-preferences";

type FeedPreferencesContextValue = {
  preferences: FeedPreferences;
  loading: boolean;
  setRegion: (region: string) => Promise<void>;
  toggleTopic: (topic: string) => Promise<void>;
  resetPreferences: () => Promise<void>;
};

const FeedPreferencesContext = createContext<FeedPreferencesContextValue | null>(null);

export function FeedPreferencesProvider({ children }: PropsWithChildren) {
  const [preferences, setPreferences] = useState(DEFAULT_FEED_PREFERENCES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeedPreferences().then((stored) => {
      setPreferences(stored);
      setLoading(false);
    });
  }, []);

  const persist = useCallback(async (next: FeedPreferences) => {
    setPreferences(next);
    try {
      await saveFeedPreferences(next);
    } catch {
      // Keep the UI responsive; the next app launch will fall back to defaults.
    }
  }, []);

  const setRegion = useCallback(async (region: string) => {
    await persist({ ...preferences, region });
  }, [persist, preferences]);

  const toggleTopic = useCallback(async (topic: string) => {
    const selected = preferences.preferredTopics.includes(topic);
    await persist({
      ...preferences,
      preferredTopics: selected
        ? preferences.preferredTopics.filter((item) => item !== topic)
        : [...preferences.preferredTopics, topic],
    });
  }, [persist, preferences]);

  const resetPreferences = useCallback(async () => {
    await persist(DEFAULT_FEED_PREFERENCES);
  }, [persist]);

  const value = useMemo(() => ({ preferences, loading, setRegion, toggleTopic, resetPreferences }), [preferences, loading, setRegion, toggleTopic, resetPreferences]);
  return <FeedPreferencesContext.Provider value={value}>{children}</FeedPreferencesContext.Provider>;
}

export function useFeedPreferences(): FeedPreferencesContextValue {
  const value = useContext(FeedPreferencesContext);
  if (!value) throw new Error("useFeedPreferences must be used inside FeedPreferencesProvider");
  return value;
}
