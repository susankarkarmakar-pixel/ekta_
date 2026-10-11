import AsyncStorage from "@react-native-async-storage/async-storage";
import { currentUser } from "./mock-data";
import { getSupabaseSession } from "./supabase-auth";
import { storagePublicUrl, supabaseConfig, supabaseFetch, uploadProfileAvatar } from "./supabase";
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

export async function syncProfileToSupabase(profile: Profile): Promise<{ profile: Profile; synced: boolean }> {
  if (!supabaseConfig.isConfigured) return { profile, synced: false };
  const session = await getSupabaseSession();
  if (!session?.user.id) return { profile, synced: false };
  try {
    let syncedProfile = profile;
    let avatarPath: string | null = null;
    if (profile.avatarUrl && /^(file:|content:|blob:)/i.test(profile.avatarUrl)) {
      avatarPath = await uploadProfileAvatar(profile.avatarUrl, session.user.id);
      const publicUrl = storagePublicUrl("avatars", avatarPath);
      if (publicUrl) {
        syncedProfile = { ...profile, avatarUrl: publicUrl };
        await saveStoredProfile({ avatarUrl: publicUrl });
      }
    } else if (profile.avatarUrl?.startsWith("http")) {
      avatarPath = profile.avatarUrl;
    }
    await supabaseFetch("profiles", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({
        id: session.user.id,
        name: syncedProfile.name,
        handle: syncedProfile.handle,
        bio: syncedProfile.bio,
        region: syncedProfile.region,
        avatar_path: avatarPath,
      }),
    });
    return { profile: syncedProfile, synced: true };
  } catch {
    return { profile, synced: false };
  }
}
