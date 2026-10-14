import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@ekta/viewed-story-profiles";

function sanitize(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string => typeof item === "string" && item.trim().length > 0))];
}

export async function getViewedStoryIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? sanitize(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

export async function markStoryViewed(id: string): Promise<string[]> {
  const current = await getViewedStoryIds();
  const next = current.includes(id) ? current : [...current, id];
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // The in-memory UI state remains usable if storage is unavailable.
  }
  return next;
}

export async function clearViewedStories(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage cleanup failures; this is a non-critical preference.
  }
}
