# eKta on Vercel

The eKta mobile app includes an Expo Web build for live deployment checks.

- **Build command:** `pnpm exec expo export --platform web`
- **Output directory:** `dist`
- **Repository:** `susankarkarmakar-pixel/ekta`
- **Runtime:** static Expo Web output; the native mobile app continues to use Expo Go/builds.

In Vercel, import the GitHub repository and keep the detected package manager as pnpm. No service-role key belongs in Vercel or the client bundle. If Supabase live mode is needed, add only the publishable `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` values in Vercel Project Settings → Environment Variables.
