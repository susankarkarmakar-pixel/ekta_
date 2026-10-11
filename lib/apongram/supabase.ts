import { Platform } from "react-native";
import { getSupabaseAccessToken } from "./supabase-auth";
import { supabaseConfig } from "./supabase-config";

export { supabaseConfig } from "./supabase-config";

export async function supabaseFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!supabaseConfig.isConfigured) throw new Error("Supabase is not configured");
  const accessToken = await getSupabaseAccessToken();
  const response = await fetch(`${supabaseConfig.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: supabaseConfig.anonKey,
      Authorization: `Bearer ${accessToken ?? supabaseConfig.anonKey}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) throw new Error(`Supabase request failed: ${response.status}`);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const storagePublicUrl = (bucket: string, path: string) =>
  supabaseConfig.isConfigured ? `${supabaseConfig.url}/storage/v1/object/public/${bucket}/${path}` : undefined;

export async function uploadProfileAvatar(uri: string, userId: string): Promise<string> {
  if (!supabaseConfig.isConfigured) throw new Error("Supabase is not configured");
  const accessToken = await getSupabaseAccessToken();
  if (!accessToken) throw new Error("Supabase session is required to upload an avatar");
  const source = await fetch(uri);
  if (!source.ok) throw new Error("Could not read the selected avatar");
  const blob = await source.blob();
  const extension = blob.type.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
  const path = `${userId}/${Date.now()}.${extension}`;
  const response = await fetch(`${supabaseConfig.url}/storage/v1/object/avatars/${path}`, {
    method: "POST",
    headers: {
      apikey: supabaseConfig.anonKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": blob.type || "image/jpeg",
      "x-upsert": "true",
    },
    body: blob,
  });
  if (!response.ok) throw new Error(`Avatar upload failed (${response.status})`);
  return path;
}

export const isNative = Platform.OS !== "web";
