import { Platform } from "react-native";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabaseConfig = { url, anonKey, isConfigured: Boolean(url && anonKey) };

export async function supabaseFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!supabaseConfig.isConfigured) throw new Error("Supabase is not configured");
  const response = await fetch(`${supabaseConfig.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: supabaseConfig.anonKey,
      Authorization: `Bearer ${supabaseConfig.anonKey}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) throw new Error(`Supabase request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

export const storagePublicUrl = (bucket: string, path: string) =>
  supabaseConfig.isConfigured ? `${supabaseConfig.url}/storage/v1/object/public/${bucket}/${path}` : undefined;

export const isNative = Platform.OS !== "web";
