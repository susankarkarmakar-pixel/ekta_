# eKta on Vercel

The eKta app is an Expo Router project with a static Expo Web build for live deployment checks. The visual preview works in demo mode; Supabase credentials are optional.

- **GitHub repository:** `susankarkarmakar-pixel/ekta_`
- **Build command:** `pnpm exec expo export --platform web`
- **Output directory:** `dist`
- **Package manager:** pnpm (keep Vercel's detected pnpm setting)
- **Runtime:** static Expo Web output; native builds continue to use Expo.

Import the repository in Vercel and deploy the `main` branch. No service-role key belongs in Vercel or the client bundle. To switch from demo data to Supabase, add only `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` under Project Settings → Environment Variables.
