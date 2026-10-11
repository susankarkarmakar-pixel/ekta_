import AsyncStorage from "@react-native-async-storage/async-storage";

export type StoryHighlight = {
  id: string;
  title: string;
  storyIds: string[];
  createdAt: string;
};

const HIGHLIGHTS_KEY = "@ekta/story-highlights-v1";

export async function getStoryHighlights(): Promise<StoryHighlight[]> {
  try {
    const raw = await AsyncStorage.getItem(HIGHLIGHTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoryHighlight[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveStoryHighlight(title: string, storyIds: string[]): Promise<StoryHighlight> {
  const item: StoryHighlight = { id: `highlight-${Date.now()}`, title: title.trim(), storyIds, createdAt: new Date().toISOString() };
  const items = await getStoryHighlights();
  await AsyncStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify([item, ...items]));
  return item;
}
