import AsyncStorage from "@react-native-async-storage/async-storage";

export const FEED_PREFERENCES_KEY = "ekta.feed.preferences";

export const FEED_REGIONS = [
  { value: "India", bn: "ভারত · সব অঞ্চল", en: "India · all regions" },
  { value: "Jaipur, Rajasthan", bn: "জয়পুর, রাজস্থান", en: "Jaipur, Rajasthan" },
  { value: "Mysuru, Karnataka", bn: "মাইসুরু, কর্ণাটক", en: "Mysuru, Karnataka" },
  { value: "Hyderabad, Telangana", bn: "হায়দরাবাদ, তেলেঙ্গানা", en: "Hyderabad, Telangana" },
  { value: "Guwahati, Assam", bn: "গুয়াহাটি, অসম", en: "Guwahati, Assam" },
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
  region: "India",
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
