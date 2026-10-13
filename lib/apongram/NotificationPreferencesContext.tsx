import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

const STORAGE_KEY = "ekta.notification.preferences";

type NotificationPreferences = {
  bulletins: boolean;
  replies: boolean;
};

type NotificationPreferencesContextValue = NotificationPreferences & {
  loading: boolean;
  setBulletins: (enabled: boolean) => Promise<void>;
  setReplies: (enabled: boolean) => Promise<void>;
};

const DEFAULT_PREFERENCES: NotificationPreferences = { bulletins: true, replies: true };
const Context = createContext<NotificationPreferencesContextValue | null>(null);

export function NotificationPreferencesProvider({ children }: PropsWithChildren) {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as Partial<NotificationPreferences>;
            setPreferences({
              bulletins: parsed.bulletins !== false,
              replies: parsed.replies !== false,
            });
          } catch {
            // Use defaults for corrupted local preferences.
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const update = useCallback(async (next: NotificationPreferences) => {
    setPreferences(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const setBulletins = useCallback((enabled: boolean) => update({ ...preferences, bulletins: enabled }), [preferences, update]);
  const setReplies = useCallback((enabled: boolean) => update({ ...preferences, replies: enabled }), [preferences, update]);
  const value = useMemo(() => ({ ...preferences, loading, setBulletins, setReplies }), [preferences, loading, setBulletins, setReplies]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useNotificationPreferences(): NotificationPreferencesContextValue {
  const value = useContext(Context);
  if (!value) throw new Error("useNotificationPreferences must be used inside NotificationPreferencesProvider");
  return value;
}
