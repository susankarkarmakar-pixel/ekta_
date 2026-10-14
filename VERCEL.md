# eKta on Vercel

The app is an Expo Router project using Expo's static web output. The repository includes an explicit Vercel build configuration so it does not depend on framework auto-detection.

- **GitHub repository:** `susankarkarmakar-pixel/ekta_`
- **Build command:** `pnpm exec expo export --platform web`
- **Output directory:** `dist`
- **Framework preset:** Other (`framework: null` in `vercel.json`)
- **Routes:** clean URLs with an SPA fallback for refresh/deep links
- **Package manager:** pnpm

Deploy the `main` branch from the repository root. The same build command can be checked locally. Email OTP is the real sign-in flow when the Supabase public URL and publishable key are configured. If Supabase is not configured, the app displays a setup error rather than treating a demo code as successful authentication.

Do not add Supabase service-role credentials to the client bundle. If a live backend is configured, only publishable client values belong in Expo/Vercel settings.

## Live email OTP configuration

Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` to Vercel's Production and Preview environments before building. These values are embedded in the static web bundle, so create a fresh deployment after adding or changing them. Enable Email in Supabase Auth; configure custom SMTP for reliable delivery to users outside the Supabase project's test recipients.

### After changing auth settings

1. Redeploy the latest `main` commit and wait for the Vercel deployment to reach **Ready**.
2. Test an OTP sign-in with an email address that is not on the Supabase project team.
3. Confirm the message contains the six-digit `{{ .Token }}` code and that the user remains signed in after reloading the app.
4. If no message arrives, check Supabase Auth logs first, then the SMTP provider's delivery or suppression logs.

## Git author for deployments

Vercel must be able to associate each pushed commit with this GitHub account. If the author-email check fails, configure this repository (not your whole machine) with the valid GitHub noreply address and push a new commit:

```sh
git config user.name "susankarkarmakar-pixel"
git config user.email "268526492+susankarkarmakar-pixel@users.noreply.github.com"
```
