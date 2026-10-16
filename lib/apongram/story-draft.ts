import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ImageFilter } from "./image-filters";
import type { OverlayPosition, OverlaySticker, VideoCompression } from "./types";

const STORAGE_KEY = "@ekta/story-draft";

export type StoryDraft = {
  body: string;
  mediaUri: string | null;
  mediaType: "image" | "video" | null;
  activeFilter: ImageFilter | null;
  videoDuration: number;
  trimStart: string;
  trimEnd: string;
  compression: VideoCompression;
  musicTrackId: string | null;
  musicVolume: number;
  originalVolume: number;
  overlayText: string;
  overlaySticker: OverlaySticker | null;
  overlayPosition: OverlayPosition;
  savedAt: string;
};

export async function getStoryDraft(): Promise<StoryDraft | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as StoryDraft : null;
  } catch {
    return null;
  }
}

export async function saveStoryDraft(draft: Omit<StoryDraft, "savedAt">): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...draft, savedAt: new Date().toISOString() }));
  } catch {
    // Draft persistence is best-effort; the editor remains usable in memory.
  }
}

export async function clearStoryDraft(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore cleanup failures.
  }
}
