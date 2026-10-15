# eKta Social (একতা) on Vercel

The app is an Expo Router project using Expo's static web output. The repository includes an explicit Vercel build configuration so it does not depend on framework auto-detection.

- **GitHub repository:** `susankarkarmakar-pixel/ekta_`
- **Build command:** `pnpm exec expo export --platform web`
- **Output directory:** `dist`
- **Framework preset:** Other (`framework: null` in `vercel.json`)
- **Routes:** clean URLs with an SPA fallback for refresh/deep links
- **Package manager:** pnpm

Deploy the `main` branch from the repository root. The same build command can be checked locally. Real email OTP requires `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in the Vercel Preview and Production environments, plus enabled Email Auth and a working SMTP provider in Supabase.

Do not add Supabase service-role credentials to the client bundle. If a live backend is configured, only publishable client values belong in Expo/Vercel settings.

## Live email OTP configuration

Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` to Vercel's Production and Preview environments before building. These values are embedded in the static web bundle, so create a fresh deployment after adding or changing them. Enable Email in Supabase Auth; configure custom SMTP for reliable delivery to users outside the Supabase project's test recipients.

## Email confirmation-link redirects

In Supabase **Authentication → URL Configuration**, set **Site URL** to `https://ekta-pied.vercel.app`. Add these destinations to **Redirect URLs**:

```text
https://ekta-pied.vercel.app/auth/phone
https://*-susankarkarmakar-pixel.vercel.app/**
http://localhost:8081/auth/phone
manus024053646483784://auth/phone
```

The app sends the current web origin as Supabase's `redirect_to` destination, so production links return to the production host and local development links return to the local app. For the Supabase Magic Link/OTP email template, link with `{{ .ConfirmationURL }}`. If a custom template builds its own confirmation URL, use `{{ .RedirectTo }}` rather than hardcoding `{{ .SiteURL }}`; otherwise the template can ignore the per-request destination and keep opening the Site URL. The email link callback then completes sign-in and returns the user to the community feed.

## Git author for deployments

Vercel must be able to associate each pushed commit with this GitHub account. If the author-email check fails, configure this repository (not your whole machine) with the valid GitHub noreply address and push a new commit:

```sh
git config user.name "susankarkarmakar-pixel"
git config user.email "268526492+susankarkarmakar-pixel@users.noreply.github.com"
```
