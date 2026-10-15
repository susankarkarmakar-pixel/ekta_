# eKta Social (একতা)

**A social network built in India, for India.**
Short posts, photos, Reels and conversations in the languages people actually speak, starting with one block and growing to the whole country.

> **Status: Pilot / pre-alpha.** eKta Social is being tested with a small group of residents of **Gazole Block, Malda District, West Bengal**. Features, data and policies will change. Do not treat the current build as production software.

---

## Table of contents

1. [What is eKta Social?](#what-is-ekta-social)
2. [Why India needs its own platform](#why-india-needs-its-own-platform)
3. [How we are rolling out](#how-we-are-rolling-out)
4. [Features](#features)
5. [Design principles](#design-principles)
6. [Languages](#languages)
7. [Tech stack](#tech-stack)
8. [Architecture](#architecture)
9. [Project structure](#project-structure)
10. [Getting started](#getting-started)
11. [Configuration](#configuration)
12. [Scripts](#scripts)
13. [Demo mode vs live mode](#demo-mode-vs-live-mode)
14. [Database and scaling plan](#database-and-scaling-plan)
15. [Safety, moderation and privacy](#safety-moderation-and-privacy)
16. [Security](#security)
17. [Roadmap](#roadmap)
18. [Known limitations](#known-limitations)
19. [Contributing](#contributing)
20. [Credits](#credits)
21. [License](#license)
22. [বাংলা সারসংক্ষেপ](#বাংলা-সারসংক্ষেপ)

---

## What is eKta Social?

eKta Social is a social platform in the spirit of Instagram and X (Twitter): you follow people, post short updates and photos, watch short videos (Reels), like, comment and search by hashtag. It is designed **from the start for Indian users**: Indian languages first, low-bandwidth and mid-range Android phones first, email OTP sign-in, and local community at the centre.

The English brand is **eKta Social**; its Bengali name is **একতা**, meaning **unity**.

## Why India needs its own platform

- **Language.** Most of India does not primarily use English online. A platform should treat Bengali, Hindi, Tamil, Urdu and the other scheduled languages as first-class, not as translations.
- **Local first.** People care most about what happens in their own village, block and district. A national feed should be built on top of strong local communities, not replace them.
- **Devices and data.** Many users are on budget Android phones and limited data plans. Performance and small media sizes matter.
- **Trust and safety.** Moderation, grievance handling and data protection need to follow Indian law and Indian social context.
- **Data ownership.** Indian users' data should be handled under Indian rules, with clear consent and no hidden profiling.

## How we are rolling out

eKta Social is deliberately starting small and growing in stages. The product is **India-wide in intent**; the pilot is local so that we can learn before we scale.

| Stage | Audience | Goal |
|------|----------|------|
| **Pilot** | A small group of residents of Gazole Block, Malda (West Bengal) | Test sign-in, posting, feed, Reels and moderation with real people. Fix what breaks. |
| **Local expansion** | More blocks and towns in Malda and North Bengal | Prove that local communities stay active. Measure database and media cost. |
| **State level** | West Bengal | Scale the database, storage and moderation team. |
| **National** | All of India | More languages, more regions, larger infrastructure. |

The codebase, language system and data model are already written for the national case, so scaling up is a matter of capacity and operations, not a rewrite.

## Features

| Area | Feature | Status |
|------|---------|--------|
| Feed | Chronological feed (no algorithmic ranking in Phase 1) | Demo ready |
| Posts | Text posts with up to one image, hashtags | Demo ready |
| Social graph | Follow / unfollow, follower counts, profiles | Demo ready |
| Engagement | Likes, comments, post detail view | Demo ready |
| Discovery | Search across people, posts and hashtags | Demo ready |
| Reels | Vertical full-screen video feed, muted autoplay, tap to pause, sound toggle | Demo ready (sample clips) |
| Reel creation | Gallery or camera video up to 60 seconds, caption, hashtags, preview | Demo ready (session only) |
| Sign-in | Email OTP and Google OAuth (no password) | Existing Supabase flows; live sign-in requires provider configuration |
| Safety | Report posts, confirmation flow | UI ready |
| Languages | Bengali and English complete | Available |
| Notifications | Basic placeholder | Planned |
| Profile avatar storage | Authenticated upload to `avatars` with user-scoped RLS | Available |
| Durable video storage | Authenticated upload and public URLs | Planned |
| Direct messages, recommendations | Deliberately **not** in Phase 1 | Later |

"Demo ready" means it works in the app with seeded data. It does not yet mean it is live for all users.

## Design principles

1. **Locality first.** The community around you matters more than a global leaderboard.
2. **Chronological, not manipulative.** No engagement-maximising algorithm in the first phase. You see what the people you follow posted.
3. **Calm and trustworthy.** Warm, practical design with large touch targets and one-handed use.
4. **Consent and safety.** Reporting, moderation and clear community rules are part of the product, not an afterthought.
5. **Small data, big reach.** Compressed media, light screens, and graceful behaviour on slow networks.
6. **Honest labels.** Sample content is labelled as sample content.

The visual direction is *Bengal civic editorial*: warm ivory backgrounds, ink-navy text, terracotta ("Mati Terracotta") and green accents, with serif headings and system fonts that render Bengali correctly.

## Languages

- **Bengali** and **English** are complete interface languages. English is the fallback on a fresh install.
- The remaining Eighth Schedule languages of the Constitution of India are planned for **gradual, locally reviewed rollout**. A language is switched on only after native-speaker review.
- **Urdu, Sindhi and Kashmiri** need right-to-left layout and script review before activation.
- Language metadata lives in `lib/apongram/languages.ts`. Shared UI strings live in `lib/apongram/types.ts`.

## Tech stack

| Layer | Technology |
|-------|------------|
| App | [Expo](https://expo.dev) (React Native) with Expo Router |
| Language | TypeScript |
| Styling | NativeWind (Tailwind CSS for React Native) |
| Platforms | Android, iOS, Web (Expo web export) |
| Backend | [Supabase](https://supabase.com): Postgres, Auth (Email OTP and Google OAuth), Row Level Security, Storage |
| Hosting (web) | Vercel (static export to `dist`) |
| Video | `expo-video`, `expo-image-picker` |
| Package manager | pnpm |
| Tests and checks | Vitest, ESLint, `tsc --noEmit` |

## Architecture

All data access goes through a single boundary: **`lib/apongram/repository.ts`**.

```
 UI screens (app/, components/)
          |
          v
  lib/apongram/repository.ts
     |                     |
     v                     v
 Supabase client       Seeded demo data
 (when env vars set)   (when env vars missing)
```

- With Supabase credentials, the repository reads and writes to Supabase.
- Without them, it falls back to seeded demo data so the preview always works.
- The client only ever receives the Supabase **URL and anon (publishable) key**. A service-role key must never be placed in the app, the web bundle or Vercel public variables.
- Access to data in production is enforced by **Row Level Security** policies in the database, not by app code alone.

## Project structure

```
app/                      Screens and routes (Home, Reels, Discover, Create, Alerts, Profile, post detail, email/Google auth)
components/apongram/      Shared UI: headers, cards, chips, Reel components
lib/apongram/             Types, languages, mock data, repository, Supabase client
hooks/                    Reusable React hooks
constants/                App constants and theme values
assets/                   Images and demo videos
supabase/migrations/      Database schema, indexes, RLS policies, storage notes
scripts/                  Helper scripts
tests/                    Automated tests
public/                   Static files for the web build
plan.md                   Implementation plan
TODO.md                   Acceptance criteria
VERCEL.md                 Web deployment notes
```

## Getting started

### Prerequisites

- Node.js (current LTS)
- [pnpm](https://pnpm.io) (`corepack enable` or `npm i -g pnpm`)
- For phones: the Expo Go app, or Android Studio / Xcode for emulators
- Optional: a [Supabase](https://supabase.com) project for live mode

### Install and run

```bash
git clone https://github.com/susankarkarmakar-pixel/ekta_.git
cd ekta_
pnpm install
pnpm dev:metro        # starts Expo web on http://localhost:8081
```

Open `http://localhost:8081` in a browser, or scan the QR code in Expo Go on your phone.

The normal app launch shows the eKta splash and email/Google sign-in. Live authentication requires the Supabase settings below; when those are absent, the app shows a setup message and does not pretend that sign-in succeeded. The repository has seeded community data for local preview builds; to enter those screens without auth during development only, temporarily enable `DEMO_MODE` in `lib/apongram/demo-mode.ts` and never ship that preview setting.

### Run on a device or emulator

```bash
pnpm android
pnpm ios
```

## Configuration

Create a `.env` file in the project root (never commit it):

```bash
EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR-PUBLISHABLE-ANON-KEY
```

Rules:

- Only **publishable** client values go here.
- **Never** add a service-role key to `.env`, to Expo config, or to Vercel public settings.
- Use separate Supabase projects for development and production.

### Database setup

1. Create a Supabase project.
2. Apply the SQL files in `supabase/migrations/` in order (Supabase CLI or the SQL editor).
   The profile editor's pronouns, website and category fields need `005_profile_public_fields.sql` applied before those fields can sync remotely; local editing still works without it.
3. Enable **Email OTP** under Authentication and configure email delivery (including SMTP for production-quality delivery).
4. To use Google sign-in, enable the **Google** provider and add its OAuth client ID and secret in Supabase; register Supabase's OAuth callback URI with Google, and allow the app callback created by `Linking.createURL("oauth/callback")` in Supabase's redirect URL settings.
5. Create Storage buckets as described in the migration notes (profile photos, post images, Reels).
6. Confirm Row Level Security is enabled on every table before inviting users.

## Scripts

| Command | What it does |
|---------|--------------|
| `pnpm dev:metro` | Start the Expo app and web preview on port 8081 |
| `pnpm android` / `pnpm ios` | Start on an emulator or device |
| `pnpm check` | TypeScript type check |
| `pnpm lint` | Lint with Expo ESLint config |
| `pnpm test` | Run Vitest tests |
| `pnpm format` | Format with Prettier |

## Demo mode vs live mode

| | Demo mode | Live mode |
|---|-----------|-----------|
| Needs Supabase keys | No | Yes |
| Data | Seeded sample members and posts | Real database |
| Sign-in | Not simulated; configure Supabase to authenticate | Email OTP and Google OAuth via Supabase |
| Reels | Short licensed sample clips | Stored videos (once upload is built) |
| Uploaded video | Lives only in the current session | Durable (planned) |
| Settings > Region | Display only | Display only until region logic is built |

## Database and scaling plan

The pilot has a small number of users, so the database is small by design. The schema is built so it can grow.

**Core tables:** profiles, posts, follows, likes, comments, hashtags, reports (with `video_path` and story flag for media).

**Growth plan:**

1. **Pilot (Gazole Block).** Single Supabase project, free or small paid tier. Measure storage, bandwidth, OTP cost and query load per active user.
2. **Local expansion.** Add indexes on feed queries (`created_at`, `author_id`), switch the feed to cursor pagination, add full-text and trigram search for Indian-language text.
3. **State and national.** Move media to a CDN, add read replicas and connection pooling, partition large tables (posts, likes, comments) by time, and add background jobs for counters and notifications.
4. **Regional data.** Add region and locality fields so feeds can be local, district, state or national. The Settings region option is already in the UI and will be connected when this is built.

Principle: **measure first, scale second.** Capacity is added only when pilot numbers show it is needed.

## Safety, moderation and privacy

eKta Social is intended for the Indian public, so it must follow Indian law and Indian norms of safety.

- **Reporting.** Every post can be reported. Reports go to a moderation queue.
- **Moderation.** Before any public launch beyond the pilot, a moderator role, action log, block and mute tools, and rate limits must exist.
- **Community rules.** Clear Terms of Use, Community Guidelines and a Privacy Policy are required before wider release.
- **Grievance redressal.** A named grievance officer and contact process will be published, as expected under the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021.
- **Data protection.** The platform is being designed with the Digital Personal Data Protection Act, 2023 in mind: consent, purpose limitation, data minimisation, account deletion and data export.
- **Sensitive identifiers.** eKta Social does **not** collect Aadhaar numbers or other government ID numbers.
- **Email addresses** are used for one-time-code sign-in and are not displayed as public profile data.
- **Minors.** Age-appropriate rules and parental-consent handling must be defined before any open launch.
- **No hidden profiling.** Phase 1 has no recommendation algorithm and no ad targeting.

> This section describes intent and design direction. It is not legal advice. Have the policies reviewed by a qualified Indian lawyer before public launch.

## Security

- Only publishable client credentials belong in Expo or Vercel configuration.
- Service-role keys stay on trusted servers only and never in the repository.
- Production writes are protected by Supabase Auth and Row Level Security.
- Test every RLS policy with at least two different test users before inviting real users.
- Rate-limit email OTP requests, OAuth initiation and posting to prevent abuse and unexpected provider costs.

To report a vulnerability, open a private security advisory on this repository instead of a public issue.

## Roadmap

- [x] Expo app shell, Bengali/English interface, navigation
- [x] Chronological feed, composer, search, profiles, follow, like, comment
- [x] Reels viewing and creation (demo)
- [x] Supabase schema, RLS definitions and repository boundary
- [ ] Live email OTP and Google sign-in verification against configured providers
- [ ] Live Supabase data for feed, posts, follows and comments
- [ ] Durable image and video upload with Supabase Storage
- [ ] Feed pagination, pull to refresh, offline-friendly behaviour
- [ ] Real notifications (in-app first, push later)
- [ ] Moderation tools: queue, block, mute, rate limits, moderator role
- [ ] Terms, Privacy Policy, Community Guidelines, account deletion and export
- [ ] Closed pilot with Gazole Block residents
- [ ] Android release (internal testing, then closed track)
- [ ] More Indian languages, with native-speaker review
- [ ] Regional feeds (block, district, state, national)
- [ ] Direct messages and recommendations (after the pilot proves the basics)

## Known limitations

- Most data is **demo data** until Supabase is configured.
- Live email OTP and Google sign-in are unavailable until `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, email delivery, and (for Google) the Supabase Google provider/redirect settings are configured. The app does not fake a successful login when these settings are missing.
- The sign-in screen links to short pilot summaries for Community Guidelines and the Privacy Charter; complete legal policy documents are still a pre-launch requirement.
- In live mode, original user videos are uploaded to the public `community-media` bucket; the 9:16 editor/player frame is a centered presentation crop, not a re-encoded file.
- Hidden player controls remove an easy save action, but public video URLs can still be copied or screen-recorded. This is not DRM or download-proof storage.
- Notifications are a placeholder.
- Only Bengali and English are available.
- The Settings region option is display-only.
- Production moderation operations and live data policies are not complete.

## Contributing

eKta Social is in an early pilot and the maintainer is currently the main contributor. Issues and suggestions are welcome, especially:

- Bengali and other Indian-language corrections
- Accessibility and low-bandwidth improvements
- Bug reports from real Android devices

Before opening a pull request, run:

```bash
pnpm check && pnpm lint && pnpm test
```

Please do not include secrets, personal data or real user content in issues or pull requests.

## Credits

- Built by **Susankar** (GitHub: [susankarkarmakar-pixel](https://github.com/susankarkarmakar-pixel)), Gazole, Malda, West Bengal.
- Demo Reels use licensed stock footage from [Pexels](https://www.pexels.com). Creator credits and licence details are kept alongside the demo assets and are labelled as sample material in the app.
- Built with Expo, React Native, NativeWind and Supabase.

## License

License to be decided. Until a licence file is added, all rights are reserved by the author.

---

## বাংলা সারসংক্ষেপ

**eKta Social (একতা)** হলো ভারতের মানুষের জন্য, ভারতেই তৈরি একটি সোশ্যাল প্ল্যাটফর্ম, ইনস্টাগ্রাম ও টুইটারের (X) মতো ধাঁচে। এখানে পোস্ট, ছবি, রিলস, লাইক, কমেন্ট, ফলো ও হ্যাশট্যাগ সার্চ আছে।

- **লক্ষ্য:** সারা ভারতের জন্য একটি প্ল্যাটফর্ম, ভারতীয় ভাষা সবার আগে।
- **এখন কোথায়:** পরীক্ষামূলক (pilot) পর্যায়ে, মালদা জেলার **গাজোল ব্লকের** অল্প কিছু মানুষকে নিয়ে পরীক্ষা চলছে।
- **ভাষা:** বাংলা ও ইংরেজি সম্পূর্ণ। ভারতের সংবিধানের অষ্টম তফসিলের বাকি ভাষাগুলো ধাপে ধাপে, স্থানীয়ভাবে যাচাই করে যোগ হবে।
- **ডেটাবেস:** শুরুতে ছোট, পরীক্ষার ফল দেখে ধাপে ধাপে বড় করা হবে (গাজোল, মালদা, পশ্চিমবঙ্গ, তারপর সারা ভারত)।
- **নিরাপত্তা:** রিপোর্ট ও মডারেশন ব্যবস্থা, ডেটা সুরক্ষা আইন (DPDP Act, 2023) মাথায় রেখে নকশা। আধার নম্বর সংগ্রহ করা হয় না।
- **চালানোর জন্য:** `pnpm install` তারপর `pnpm dev:metro`। স্বাভাবিক launch-এ sign-in আসে; live auth-এর জন্য Supabase URL/publishable key এবং সংশ্লিষ্ট provider configure করতে হবে। key না থাকলে sign-in সফল বলে দেখানো হয় না।

## Supabase Email OTP, Google OAuth and push notifications

The auth screen uses passwordless **Email OTP** rather than SMS, so it does not require a paid SMS provider. The project URL and publishable key are read from `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`; local development can use the ignored `.env.local` file. The app verifies the code with `type: "email"` and persists the returned session in SecureStore/localStorage.

The Supabase built-in SMTP service is suitable for testing only: it currently delivers only to pre-authorized project team addresses and is limited to about 2 emails per hour. For public users, configure a free/low-cost custom SMTP provider such as Resend, Brevo, ZeptoMail, or SES; no service-role key belongs in the mobile app.

Google sign-in uses Supabase's configured Google provider. Add the Google OAuth client credentials in Supabase, register the Supabase OAuth callback URI in the Google provider, and add the app redirect returned by `Linking.createURL("oauth/callback")` to Supabase's redirect allow-list. The public app bundle only needs the Supabase project URL and publishable/anon key; Google client secrets stay in Supabase configuration.

The app also registers Expo Push Tokens on physical iOS/Android devices when permission is granted. Tokens are stored in `public.push_tokens` using `supabase/migrations/002_push_notifications.sql`, and the client-side Supabase repository handles token registration. Native delivery requires an Expo/EAS project ID and a development/production build; web preview and simulators skip native token registration.
