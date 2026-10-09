# eKta on Vercel

The eKta app is an Expo Router project with a static Expo Web build for live deployment checks. The visual preview works in demo mode; Supabase credentials are optional.

- **GitHub repository:** `susankarkarmakar-pixel/ekta_`
- **Build command:** `pnpm exec expo export --platform web`
- **Output directory:** `dist`
- **Package manager:** pnpm (keep Vercel's detected pnpm setting)
- **Runtime:** static Expo Web output; native builds continue to use Expo.

Import the repository in Vercel and deploy the `main` branch. No service-role key belongs in Vercel or the client bundle. To switch from demo data to Supabase, add only `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` under Project Settings → Environment Variables.

## Git author for deployments

Vercel must be able to associate each pushed commit with this GitHub account. If the author-email check fails, configure this repository (not your whole machine) with the valid GitHub noreply address and push a new commit:

```sh
git config user.name "susankarkarmakar-pixel"
git config user.email "268526492+susankarkarmakar-pixel@users.noreply.github.com"
```
