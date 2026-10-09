# eKta on Vercel

The app is an Expo Router project using Expo's static web output. The repository includes an explicit Vercel build configuration so it does not depend on framework auto-detection.

- **GitHub repository:** `susankarkarmakar-pixel/ekta_`
- **Build command:** `pnpm exec expo export --platform web`
- **Output directory:** `dist`
- **Framework preset:** Other (`framework: null` in `vercel.json`)
- **Routes:** clean URLs with an SPA fallback for refresh/deep links
- **Package manager:** pnpm

Deploy the `main` branch from the repository root. The same build command can be checked locally. Phone OTP is a demo flow; the preview uses seeded data unless browser-safe backend values are configured.

Do not add Supabase service-role credentials to the client bundle. If a live backend is configured, only publishable client values belong in Expo/Vercel settings.

## Git author for deployments

Vercel must be able to associate each pushed commit with this GitHub account. If the author-email check fails, configure this repository (not your whole machine) with the valid GitHub noreply address and push a new commit:

```sh
git config user.name "susankarkarmakar-pixel"
git config user.email "268526492+susankarkarmakar-pixel@users.noreply.github.com"
```
