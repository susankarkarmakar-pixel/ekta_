export const supabaseConfig = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
  isConfigured: Boolean(process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY),
};
