import AsyncStorage from "@react-native-async-storage/async-storage";
import { currentUser } from "./mock-data";
import type { Profile } from "./types";

const STORAGE_KEY = "@ekta/follow-relationships-v1";
export type Relationship = "none" | "following" | "requested";

type RelationshipMap = Record<string, Relationship>;

async function readRelationships(): Promise<RelationshipMap> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as RelationshipMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function writeRelationships(value: RelationshipMap): Promise<void> {
  try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(value)); } catch { /* local UI state remains usable */ }
}

export async function getRelationship(profileId: string): Promise<Relationship> {
  const map = await readRelationships();
  return map[profileId] ?? "none";
}

export async function setRelationship(profileId: string, relationship: Relationship): Promise<Relationship> {
  const map = await readRelationships();
  if (relationship === "none") delete map[profileId];
  else map[profileId] = relationship;
  await writeRelationships(map);
  return relationship;
}

export async function toggleFollow(profileId: string): Promise<Relationship> {
  const current = await getRelationship(profileId);
  return setRelationship(profileId, current === "following" ? "none" : "following");
}

export async function getProfileWithLocalCounts(profile: Profile): Promise<Profile> {
  const map = await readRelationships();
  const followingCount = Object.values(map).filter((value) => value === "following").length;
  if (profile.id === currentUser.id) return { ...profile, following: profile.following + followingCount };
  return { ...profile, followers: profile.followers + (map[profile.id] === "following" ? 1 : 0) };
}
