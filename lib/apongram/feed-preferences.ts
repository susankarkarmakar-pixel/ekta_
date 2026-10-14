import AsyncStorage from "@react-native-async-storage/async-storage";

export const FEED_PREFERENCES_KEY = "ekta.feed.preferences";

export const FEED_REGIONS = [
  { value: "Gazole, Malda", bn: "গাজোল, মালদা", en: "Gazole, Malda" },
  { value: "Malda, West Bengal", bn: "মালদা, পশ্চিমবঙ্গ", en: "Malda, West Bengal" },
  { value: "Kaliachak, Malda", bn: "কালিয়াচক, মালদা", en: "Kaliachak, Malda" },
  { value: "Chanchal, Malda", bn: "চাঁচল, মালদা", en: "Chanchal, Malda" },
  { value: "India", bn: "ভারত · সব অঞ্চল", en: "India · all regions" },
] as const;

export const FEED_TOPIC_OPTIONS = [
  { value: "Public service", bn: "জনপরিষেবা", en: "Public service" },
  { value: "Community", bn: "কমিউনিটি", en: "Community" },
  { value: "Local update", bn: "এলাকার খবর", en: "Local updates" },
  { value: "Volunteering", bn: "স্বেচ্ছাসেবা", en: "Volunteering" },
  { value: "Books", bn: "বই ও শিক্ষা", en: "Books & learning" },
  { value: "Health", bn: "স্বাস্থ্য", en: "Health" },
] as const;

export type FeedPreferences = {
  region: string;
  preferredTopics: string[];
};

export const DEFAULT_FEED_PREFERENCES: FeedPreferences = {
  region: "Gazole, Malda",
  preferredTopics: FEED_TOPIC_OPTIONS.map((topic) => topic.value),
};

function sanitizePreferences(input: Partial<FeedPreferences> | null | undefined): FeedPreferences {
  const allowedTopics: Set<string> = new Set(FEED_TOPIC_OPTIONS.map((topic) => topic.value));
  const region = FEED_REGIONS.some((item) => item.value === input?.region) ? input?.region! : DEFAULT_FEED_PREFERENCES.region;
  const preferredTopics = Array.isArray(input?.preferredTopics)
    ? input!.preferredTopics.filter((topic): topic is string => typeof topic === "string" && allowedTopics.has(topic))
    : DEFAULT_FEED_PREFERENCES.preferredTopics;
  return { region, preferredTopics: [...new Set(preferredTopics)] };
}

export async function loadFeedPreferences(): Promise<FeedPreferences> {
  try {
    const raw = await AsyncStorage.getItem(FEED_PREFERENCES_KEY);
    return sanitizePreferences(raw ? JSON.parse(raw) as Partial<FeedPreferences> : null);
  } catch {
    return DEFAULT_FEED_PREFERENCES;
  }
}

export async function saveFeedPreferences(preferences: FeedPreferences): Promise<FeedPreferences> {
  const safe = sanitizePreferences(preferences);
  await AsyncStorage.setItem(FEED_PREFERENCES_KEY, JSON.stringify(safe));
  return safe;
}

export async function clearFeedPreferences(): Promise<void> {
  await AsyncStorage.removeItem(FEED_PREFERENCES_KEY);
}
