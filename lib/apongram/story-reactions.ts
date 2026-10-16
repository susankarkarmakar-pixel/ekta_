import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@ekta/story-reactions";

export type StoryReaction = "like" | "love" | "support" | "celebrate";
export type StoryReactionMap = Record<string, StoryReaction>;

export async function getStoryReactions(): Promise<StoryReactionMap> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed as StoryReactionMap : {};
  } catch {
    return {};
  }
}

export async function saveStoryReaction(storyId: string, reaction: StoryReaction | null): Promise<void> {
  const current = await getStoryReactions();
  if (reaction) current[storyId] = reaction;
  else delete current[storyId];
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // The in-memory reaction remains usable when storage is unavailable.
  }
}
