import AsyncStorage from "@react-native-async-storage/async-storage";
import { currentUser } from "./mock-data";
import type { Profile } from "./types";

const PROFILE_KEY = "@ekta/profile-v1";

export async function getStoredProfile(): Promise<Profile> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    if (!raw) return currentUser;
    const stored = JSON.parse(raw) as Partial<Profile>;
    Object.assign(currentUser, stored);
  } catch {
    // Use the demo profile when storage is unavailable.
  }
  return currentUser;
}

export async function saveStoredProfile(updates: Partial<Profile>): Promise<Profile> {
  Object.assign(currentUser, updates);
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(currentUser));
  return currentUser;
}
