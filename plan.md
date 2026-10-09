# eKta — বাস্তবায়ন পরিকল্পনা

## পণ্যের দিকনির্দেশ

eKta হলো Malda/North Bengal-এর civic ও public-service community-র জন্য Bengali-first social network। এটি India-wide Twitter clone নয়; প্রথম দিনে একটি বাস্তব seed network-কে useful, পরিচিত এবং নিরাপদ অনুভব করানোই লক্ষ্য। Phase 1-এ ছোট, chronological এবং community-led experience থাকবে।

## বাস্তবায়ন পদ্ধতি

- **মোবাইল runtime:** Manus-এর fixed Expo Router + React Native + TypeScript + NativeWind starter; portrait-first, one-handed interactions, Expo Web preview-সহ।
- **ডেটা boundary:** `lib/apongram/repository.ts` একটি একক repository interface দেবে। Supabase environment variables থাকলে Supabase REST/SDK path ব্যবহার করবে; variables না থাকলে একই interface seeded demo data-তে fallback করবে, যাতে Preview অচল না হয়।
- **Supabase:** `EXPO_PUBLIC_SUPABASE_URL` এবং `EXPO_PUBLIC_SUPABASE_ANON_KEY` protected runtime values হিসেবে ব্যবহার হবে। SQL migration-এ profiles, posts, follows, likes, comments, hashtags এবং reports-এর schema ও Row Level Security policy থাকবে। Phone OTP flow Supabase Auth-এর জন্য প্রস্তুত থাকবে।
- **GitHub:** Manus-managed mobile project-এর canonical repository platform-managed থাকবে; selected GitHub repository `susankarkarmakar-pixel/ekta`-তে application source, Supabase migration ও README-এর একটি explicit mirror push করা হবে। এতে GitHub-এ code file থাকবে, কিন্তু managed Expo preview/build-এর source of truth অক্ষুণ্ণ থাকবে।
- **Scope discipline:** DM, video, algorithmic recommendation ও advanced notifications Phase 1-এ থাকবে না। Moderation/report affordance, privacy cues এবং clear demo states থাকবে।

## স্ক্রিন ও আচরণ

1. **Home / Feed:** chronological civic feed, post composer, Bengali/English toggle, search affordance, like/comment/follow actions।
2. **Discover:** users, posts ও hashtag search; tappable topic chips।
3. **Create:** text post এবং সর্বোচ্চ একটি image attachment-এর demo-ready composer; image picker hook Supabase Storage boundary-র জন্য প্রস্তুত।
4. **Notifications:** basic activity placeholder/empty state; advanced notification system নয়।
5. **Profile:** current user ও community member profile, avatar, bio, follower/following count এবং follow/unfollow state।
6. **OTP sign-in:** phone number entry, OTP verification, retry ও error-state UI; real Supabase Auth hook প্রস্তুত থাকবে।
7. **Post detail:** visible likes/comments, threaded-on-post comment entry, report action এবং community-safety copy।

## Design system

- **Design Movement:** *Bengal civic editorial* — পাড়ার noticeboard, hand-painted sign এবং contemporary mobile editorial UI-এর সংমিশ্রণ।
- **Core Principles:** (১) মানুষের আগে locality, (২) শান্ত কিন্তু প্রাণবন্ত civic utility, (৩) বড় touch target ও one-handed clarity, (৪) public conversation-এ trust ও consent।
- **Color Philosophy:** কাগজের মতো warm ivory background, ink navy typography, পাকা কাঁঠাল/terracotta accent এবং ধানপাতা green status color। Ownable signature brand color হলো **Mati Terracotta `#C85C3A`**—স্থানীয় মাটি, কাজের urgency এবং মানবিক warmth বোঝায়।
- **Layout Paradigm:** centered dashboard নয়; feed একটি editorial vertical river। Section header, topic rail এবং bottom navigation-এর মধ্যে asymmetric offsets থাকবে, যেন community noticeboard-এর layered rhythm তৈরি হয়।
- **Signature Elements:** terracotta “Mati” action pill; ছোট seed-leaf status marker; editorial date/location eyebrow (যেমন “GAZOLE · আজ”)।
- **Interaction Philosophy:** swipe নয়, স্পষ্ট tap এবং progressive disclosure। Like/follow instant optimistic feedback দেবে; report destructive নয়, controlled sheet/confirmation দিয়ে হবে।
- **Animation:** 160–220ms ease-out card entrance, like icon-এর ছোট scale pulse, composer expand হওয়ার সময় soft height interpolation; decorative motion সীমিত ও calm থাকবে।
- **Typography:** headings-এ system `Georgia`-সদৃশ editorial serif fallback, body-তে `Inter`/system sans fallback। Bengali glyph-এর জন্য platform system font ব্যবহার হবে; hierarchy: 30/36 display, 20/26 section, 15/22 body, 12/16 metadata।
- **Brand Essence:** “নিজের এলাকার খবর, কাজ আর কথার জন্য Bengali-first community network।” Personality: **আত্মীয়, কার্যকর, বিশ্বস্ত**।
- **Brand Voice:** headline ছোট এবং স্থানীয়; CTA সরাসরি কিন্তু উষ্ণ। উদাহরণ: “আজ Gazole-এ কী ঘটছে?” এবং “আপনার এলাকার খবরটি শেয়ার করুন।”
- **Wordmark & Logo:** `eKta` wordmark-এর পাশে দুইটি offset terracotta/green leaf-dot, যা “নিজের গ্রাম/নিজের মানুষ” বোঝায়। Native icon-এ একটিমাত্র abstract leaf + conversation notch থাকবে, baked-in rounded corner ছাড়া।

## Project structure

```text
app/
  (tabs)/_layout.tsx        # Home, Discover, Create, Alerts, Profile tabs
  (tabs)/index.tsx           # Feed and composer
  (tabs)/discover.tsx        # Search, users, topics
  (tabs)/create.tsx          # New post flow
  (tabs)/alerts.tsx          # Basic alerts/empty state
  (tabs)/profile.tsx         # Current profile
  post/[id].tsx              # Post detail, comments, report
  auth/phone.tsx             # Phone + OTP flow
components/
  apongram/                  # Brand header, avatar, post card, topic chips, sheets
lib/apongram/
  types.ts                   # Domain types and translations
  mock-data.ts               # Realistic Bengali civic seed content
  repository.ts              # Supabase-or-demo repository interface
  supabase.ts                # Browser-safe client and env detection
supabase/
  migrations/001_apongram.sql # Schema, indexes, RLS, storage notes
assets/images/               # Native launcher/splash/favicon identity
plan.md                      # This plan and design decisions
TODO.md                      # Outcome-based acceptance clauses
```

## Serving and dependencies

Metro/Web listens on the fixed 8081 port and the starter API on 3000. The Supabase client is browser-safe and never receives a service-role key; only URL + anon key are public runtime values. Database and storage writes are gated by Supabase Auth/RLS in production. Preview remains useful in demo mode when protected values are not yet present. The app will use the existing React Native/NativeWind dependencies and add only the smallest required Supabase client dependency.
