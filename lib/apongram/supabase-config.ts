import Constants from "expo-constants";

const runtime = Constants.expoConfig?.extra as {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
} | undefined;

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? runtime?.supabaseUrl ?? "";
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? runtime?.supabaseAnonKey ?? "";

export const supabaseConfig = {
  url,
  anonKey,
  isConfigured: Boolean(url && anonKey),
};
