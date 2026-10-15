# eKta Social (একতা) — বাস্তবায়ন পরিকল্পনা

## পণ্যের দিকনির্দেশ

eKta Social (বাংলা নাম: একতা) হলো Malda/North Bengal-এর civic ও public-service community-র জন্য Bengali-first social network। এটি India-wide Twitter clone নয়; প্রথম দিনে একটি বাস্তব seed network-কে useful, পরিচিত এবং নিরাপদ অনুভব করানোই লক্ষ্য। Phase 1-এ ছোট, chronological এবং community-led experience থাকবে।

## বাস্তবায়ন পদ্ধতি

- **মোবাইল runtime:** Manus-এর fixed Expo Router + React Native + TypeScript + NativeWind starter; portrait-first, one-handed interactions, Expo Web preview-সহ।
- **ডেটা boundary:** `lib/apongram/repository.ts` একটি একক repository interface দেবে। Supabase environment variables থাকলে Supabase REST/SDK path ব্যবহার করবে; variables না থাকলে একই interface seeded demo data-তে fallback করবে, যাতে Preview অচল না হয়।
- **Supabase:** `EXPO_PUBLIC_SUPABASE_URL` এবং `EXPO_PUBLIC_SUPABASE_ANON_KEY` protected runtime values হিসেবে ব্যবহার হবে। SQL migration-এ profiles, posts, follows, likes, comments, hashtags এবং reports-এর schema ও Row Level Security policy থাকবে। Email OTP ও configured Google OAuth Supabase Auth-এর বিদ্যমান flow ব্যবহার করবে।
- **GitHub:** এই কাজের নির্বাচিত repository `susankarkarmakar-pixel/ekta_`-তেই application source, Supabase migration ও README আপডেট হবে; managed Expo identifiers অক্ষুণ্ণ থাকবে।
- **Scope discipline:** DM, algorithmic recommendation ও advanced notifications Phase 1-এ থাকবে না। User-requested Reels workflow-টি এবার Phase 1-এ যোগ হচ্ছে; curated demo content chronological থাকবে। Moderation/report affordance, privacy cues এবং স্পষ্ট demo states বজায় থাকবে।

## স্ক্রিন ও আচরণ

1. **Home / Feed:** chronological civic feed, post composer, Bengali/English toggle, search affordance, like/comment/follow actions।
2. **Discover:** users, posts ও hashtag search; tappable topic chips।
3. **Create:** text post এবং সর্বোচ্চ একটি image attachment-এর demo-ready composer; image picker hook Supabase Storage boundary-র জন্য প্রস্তুত।
4. **Notifications:** basic activity placeholder/empty state; advanced notification system নয়।
5. **Profile:** current user ও community member profile, avatar, bio, follower/following count এবং follow/unfollow state।
6. **Email/Google sign-in:** email entry ও validation, OTP verification, retry/resend cooldown, loading/error/success UI এবং configured Google OAuth; Supabase Auth-এর বিদ্যমান session persistence থাকবে।
7. **Post detail:** visible likes/comments, threaded-on-post comment entry, report action এবং community-safety copy।
8. **Reels:** আলাদা full-bleed, portrait video feed; প্রতি পেজে একটি Reel, উল্লম্ব swipe/paging, শুধু সক্রিয় item-এর autoplay ও loop, প্রথমে muted playback, tap-এ pause/resume, স্পষ্ট sound toggle, like/comment/share actions, creator/caption/location/tag overlay এবং empty/loading state। Bottom navigation ও Home-এর Stories rail—দুই জায়গা থেকেই Reels-এ যাওয়া যাবে।
9. **Reel creation:** gallery বা camera থেকে শুধু video বাছাই/রেকর্ড; সর্বোচ্চ ৬০ সেকেন্ড, optional caption ও hashtags, muted preview, media বদলানো/সরানো, validation/error/success feedback এবং publish-এর পর Reels-এ যাওয়া। Reel ছাড়া caption-only submit হবে না; normal post-এ video type গ্রহণ হবে না।

### Reel implementation and data boundary

- Existing `CreateScreen`-এ post/reel/story mode ও `expo-image-picker` video selection ছিল; নতুন কাজটি সেই অসম্পূর্ণ affordance-কে discoverable, navigable, playable flow-এ সম্পূর্ণ করবে।
- `app/(tabs)/reels.tsx`-এ React Native `FlatList` + `pagingEnabled`; visible viewability callback current index ঠিক করবে। প্রতিটি mounted video player current item হলে play, অন্যথায় pause/mute হবে, এবং tab blur-এ সব playback থামবে। অতিরিক্ত player preloading/recommendation যোগ হবে না।
- `getReels()` repository method seeded sample Reels-কে user-created, non-story video posts-এর সঙ্গে দেবে; sample ordering deterministic থাকবে। Likes/comments demo session-এ optimistic local state হবে; share OS share sheet-এ যাবে।
- তিনটি compact, portrait-friendly Pexels MP4 শুধু sample Reel content এবং walkthrough-এ থাকবে; README-তে creator/source link ও license উল্লেখ থাকবে। এগুলো user/community-upload নয়—UI-তে sample/demo content বলে দেখাতে হবে।
- Composer সর্বোচ্চ ৬০-সেকেন্ড ভিডিও বাছাইয়ের Expo API-ই পুনর্ব্যবহার করবে। বর্তমান preview/demo data boundary-তে নির্বাচিত video URI app session-এর local content; repository-তে raw `file://` URI-কে public hosted media হিসেবে দাবি করা যাবে না। Supabase SQL-এ `video_path` এবং `is_story` field/index যোগ হবে, কিন্তু authenticated Storage upload/public URL lifecycle এই task-এ চালু নয়; production upload-কে আলাদা secure Supabase Auth + Storage policy work হিসেবে স্পষ্টভাবে চিহ্নিত রাখতে হবে।
- নতুন runtime dependency নয়: বিদ্যমান `expo-video`, `expo-image-picker`, React Native `Share`, React Native `Modal` ও navigation ব্যবহার হবে।

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
- **Wordmark & Logo:** English locale-এ `eKta Social`, Bengali locale-এ `একতা` wordmark; পাশে দুইটি offset terracotta/green leaf-dot, যা “নিজের গ্রাম/নিজের মানুষ” বোঝায়। Native icon-এ একটিমাত্র abstract leaf + conversation notch থাকবে, baked-in rounded corner ছাড়া।

## Project structure

```text
app/
  (tabs)/_layout.tsx        # Home, Reels, Discover, Create, Alerts, Profile tabs
  (tabs)/index.tsx           # Feed and composer
  (tabs)/reels.tsx           # Full-screen vertical Reels feed and controls
  (tabs)/discover.tsx        # Search, users, topics
  (tabs)/create.tsx          # New post flow
  (tabs)/alerts.tsx          # Basic alerts/empty state
  (tabs)/profile.tsx         # Current profile
  post/[id].tsx              # Post detail, comments, report
  auth/phone.tsx             # Backward-compatible route path for email OTP + Google OAuth
components/
  apongram/                  # Brand header, avatar, post card, topic chips, Reel card/sheets
lib/apongram/
  types.ts                   # Domain types and translations
  mock-data.ts               # Realistic civic seed content and sample Reels
  repository.ts              # Supabase-or-demo feed and Reel queries
  supabase.ts                # Browser-safe client and env detection
supabase/
  migrations/001_apongram.sql # Schema, indexes, RLS, storage notes
assets/images/               # Native launcher/splash/favicon identity
assets/videos/               # Compressed licensed demo-only sample Reel clips
plan.md                      # This plan and design decisions
TODO.md                      # Outcome-based acceptance clauses
```

## Serving and dependencies

Metro/Web listens on the fixed 8081 port and the starter API on 3000. The Supabase client is browser-safe and never receives a service-role key; only URL + anon key are public runtime values. Database and storage writes are gated by Supabase Auth/RLS in production. The normal app launch shows an honest auth setup state when keys are missing; seeded feed preview is available only through an explicit developer-only `DEMO_MODE` toggle. Reel media selection, local preview and seeded playback are demo-ready; a real user video needs authenticated upload to a policy-protected Storage bucket before the post can be treated as durable/live. The app uses existing React Native/NativeWind dependencies and adds none for this feature.


## নতুন অনুরোধ: eKta animated splash-to-login অভিজ্ঞতা

### বিদ্যমান প্রকল্পের সঙ্গে একীভূতকরণ

- প্রকল্পটি Expo Router, React Native, TypeScript ও NativeWind-ভিত্তিক; নতুন প্রকল্প/আলাদা authentication ব্যবস্থা তৈরি হবে না। বর্তমান root `LaunchAnimation`, `/auth/phone` route, `supabase-auth.ts`, session restore এবং Google OAuth callback-ই সম্প্রসারিত হবে। `/auth/phone`-এর বিদ্যমান route নাম deep link/backward compatibility-র জন্য রাখা হবে, যদিও স্ক্রিনটি email OTP ব্যবহার করে।
- cold launch-এর root overlay-তে প্রায় ২.৩ সেকেন্ডের animated brand reveal চলবে; শেষে বিদ্যমান root routing authenticated ব্যবহারকারীকে tab/feed-এ এবং অন্যদের সরাসরি email login screen-এ পাঠাবে। প্রথমবারের আলাদা welcome/language-selection page আর authentication-এর মাঝখানে আসবে না; login-এর language toggle-এ বাংলা/English বেছে নেওয়া যাবে। Root overlay app-এর lifetime-এ একবার দেখানো হবে, login-এ back/navigation করলে পুনরায় নয়।
- animation-এ React Native-এর বিদ্যমান `Animated`, `AccessibilityInfo`, `react-native-svg` এবং নতুন স্বচ্ছ handshake artwork ব্যবহার হবে। কেবল প্রয়োজনীয় artwork তৈরি হবে; storyboard/screenshot-কে UI হিসেবে embed করা হবে না। নতুন runtime dependency যোগ হবে না।
- generated artwork `assets/brand/handshake-unity-final.png`-এ থাকবে: transparent background, saffron ও green sleeve-সহ ঐক্যের হাত-ধরা illustration; mobile bundle-এর জন্য optimized, কোনো লেখা, রাজনৈতিক চিহ্ন বা background নয়।

### ডিজাইন ও চলাচল

- Bengal civic-editorial style-ই বজায় থাকবে: warm ivory (`#FBF7F0`), সংযত saffron/gold/leaf-green, ink text, বিদ্যমান Hind Siliguri ও Noto Serif Bengali ফন্ট, বড় touch target এবং mobile-first spacing।
- decorative SVG wave top ও bottom edge-এ আস্তে slide/fade করবে; dots stagger হবে; handshake fade/scale-in করবে; “একতা” wordmark হালকা upward reveal, tricolor underline ও `Your Community, Connected` tagline fade-in, তিনটি loader dot অনুক্রমে pulse এবং সবশেষে login-এ মসৃণ fade হবে। অতিরিক্ত bounce/flash নয়; স্বাভাবিক motion মোটামুটি ২–৩ সেকেন্ড, reduced-motion পছন্দে সংক্ষিপ্ত simple fade।
- login-এ একই cream/wave/handshake brand language, Bengali wordmark ও tagline, Google button, OR divider, email/OTP form, error/success state এবং policy-summary modal থাকবে। Keyboard খোলা অবস্থায় form scroll ও safe-area-র মধ্যে থাকবে; tablet/web-এ content width সংযত হবে।

### Authentication ও data boundary

- বিদ্যমান `sendEmailOtp`, `verifyEmailOtp`, `getGoogleOAuthUrl`, `completeGoogleOAuthRedirect`, `getSupabaseSession` এবং profile/session persistence পুনর্ব্যবহার হবে। UI-তে email validation, in-flight state, clear error, OTP verification, resend cooldown ও success confirmation থাকবে; auth backend/config অনুপস্থিত হলে login কখনো success অনুকরণ করবে না।
- Google button বিদ্যমান Supabase Google provider-এ যাবে; Supabase URL ও publishable/anon key ছাড়া backend auth দাবি করা হবে না। Service-role key/secret client bundle বা commit-এ যোগ হবে না। Configuration অনুপস্থিত থাকলে README-তে exact app environment ও provider setup checklist থাকবে।
- Community Guidelines ও Privacy Charter-এর স্পষ্ট link in-app summary খুলবে; README-তে পূর্ণ policy এখনও অসম্পূর্ণ বলে যে সীমাবদ্ধতা আছে তা UI-তেও গোপন/আইনি নিশ্চয়তা হিসেবে উপস্থাপন করা হবে না।
- existing feed, Reels, navigation, logout, session refresh এবং provider callback-এর architecture অক্ষুণ্ণ থাকবে।
