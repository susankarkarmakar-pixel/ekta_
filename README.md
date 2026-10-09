# eKta

Bengali-first hyperlocal civic community app for Malda and North Bengal.

## Product

eKta starts with a small, real community rather than trying to be a national social network on day one. The Phase 1 shell includes a chronological feed, profiles, follow states, likes, comments, search, hashtags, Bengali/English toggle, phone OTP-ready auth and report affordances. Direct messages, video, recommendation algorithms and advanced notifications are intentionally out of scope.

## Supabase

Create a Supabase project and run `supabase/migrations/001_apongram.sql` in the SQL editor. Configure the app with browser-safe values only:

```sh
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-publishable-anon-key
```

Never add a service-role key to Expo, GitHub or the client bundle. Without these values the preview stays in seeded demo mode; the same repository interface switches to Supabase when both values are present.

## Run

```sh
pnpm install
pnpm dev
```

Metro/Web runs on 8081 and the starter API on 3000. The selected GitHub mirror is `susankarkarmakar-pixel/ekta`.


## Preview notes

- The GitHub mirror selected for this work is `susankarkarmakar-pixel/ekta_`; Vercel setup is in [VERCEL.md](./VERCEL.md).
- Without Supabase public credentials, the app uses seeded demo data. Phone OTP is a visual/demo flow and does not send a real SMS.
- Feed image: “Vibrant Terracotta Pots at Local Market Display” by [Muhammad Shamaoon Malik on Pexels](https://www.pexels.com/photo/vibrant-terracotta-pots-at-local-market-display-30026678/). Used under the [Pexels license](https://www.pexels.com/license/).
