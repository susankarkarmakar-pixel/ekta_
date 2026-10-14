# eKta Social — Launch Animation পরিকল্পনা

**তারিখ:** ১৪ অক্টোবর ২০২৬  
**লক্ষ্য:** App খোলার সময় Instagram/Facebook-এর মতো polished brand opening দেখানো, তারপর স্বাভাবিকভাবে eKta Social news feed-এ প্রবেশ করানো।

## ১. প্রস্তাবিত opening experience

ব্যবহারকারী app খুললে মোটামুটি ২.২–২.৮ সেকেন্ডের একটি শান্ত, premium animation দেখবে:

1. **Native splash — ০–০.৬ সেকেন্ড**
   - warm ivory background
   - একতা leaf/conversation logo
   - app দ্রুত boot হওয়ার সময় static fallback
2. **Brand reveal — ০.৬–১.৬ সেকেন্ড**
   - logo ছোট থেকে স্বাভাবিক scale-এ আসবে
   - opacity 0 থেকে 100%
   - দুইটি terracotta/green leaf-dot হালকা offset motion করবে
3. **Brand name — ১.৩–২.০ সেকেন্ড**
   - `eKta Social` serif wordmark fade/slide-in
   - Bengali-first community identity বজায় থাকবে
4. **Company signature — ১.৭–২.৩ সেকেন্ড**
   - নিচে ছোট করে দেখা যাবে:
   - `Band Sanket Pixel Technologies`
5. **Feed handoff — ২.১–২.৮ সেকেন্ড**
   - launch layer ধীরে fade-out হবে
   - Home feed সামান্য fade/translate-up করে দৃশ্যমান হবে
   - feed loading থাকলে animation শেষ হওয়ার পরও blank screen নয়; skeleton/loading state থাকবে

## ২. Visual direction

### Background

- Primary: warm ivory `#FBF7F0` বা বর্তমান app background
- খুব হালকা radial/vertical gradient ব্যবহার করা যেতে পারে
- pure white বা black ব্যবহার না করাই ভালো, যাতে app-এর Bengal civic editorial identity অক্ষুণ্ণ থাকে

### Logo

বর্তমান app-এর logo asset ও Home header-এর `diversity-3` mark-এর সঙ্গে মিল রেখে একটি নির্দিষ্ট launch lockup তৈরি করা উচিত:

- terracotta primary mark: `#C85A3A`
- green secondary accent: `#1F6F6B`
- ink text: `#1E1B16`
- transparent background logo asset
- logo-র চারপাশে পর্যাপ্ত clear space
- native splash এবং animated layer-এ একই logo ব্যবহার

### Typography

- `eKta Social`: editorial serif/Georgia-style heading
- `Band Sanket Pixel Technologies`: ছোট, clean sans-serif uppercase বা title case
- Company line যেন logo/name-এর চেয়ে visually subdued থাকে
- English locale-এ brand name `eKta Social`; Bengali locale-এ `একতা` দেখাতে হবে

## ৩. Technical architecture

বর্তমান app-এ `app/_layout.tsx` এবং `expo-splash-screen` plugin আছে। সবচেয়ে নিরাপদ implementation হবে:

### Layer A — Native splash

`app.config.ts`-এর বর্তমান `expo-splash-screen` configuration-এ:

- warm ivory background সেট করা
- dedicated eKta Social launch logo ব্যবহার করা
- `imageWidth` device অনুযায়ী readable রাখা
- dark mode-এর জন্য আলাদা dark background রাখা

Native splash-এ full animation বা company text জোর করে বসানো উচিত নয়। iOS/Android native splash platform-controlled এবং সেখানে animation behaviour সীমিত। Native splash-এর কাজ হবে boot-এর সময় blank/white flash আটকানো।

### Layer B — In-app LaunchAnimation

নতুন component:

```text
components/brand/LaunchAnimation.tsx
```

এটি root layout-এর ভিতরে Stack-এর উপরে absolute overlay হিসেবে থাকবে। Component-এর দায়িত্ব:

- logo, `eKta Social`, company signature render করা
- Reanimated দিয়ে opacity, scale, translateY পরিচালনা করা
- minimum display time রাখা
- `onFinished()` callback দেওয়া
- reduced-motion preference থাকলে দ্রুত/simple fade ব্যবহার করা
- animation চলাকালে নিচের feed-কে interaction থেকে আটকানো

Root integration:

```text
app/_layout.tsx
```

প্রস্তাবিত flow:

```text
RootLayout
  ├─ providers
  ├─ Stack / Home feed
  └─ LaunchAnimation overlay
```

Root providers mount হওয়ার পর animation শুরু হবে। Home feed-এর data fetch animation-এর সঙ্গে parallel-এ চলবে, যাতে animation শেষ হলেই feed ready থাকার সম্ভাবনা বেশি থাকে।

## ৪. Timing ও animation specification

| ধাপ | সময় | Animation |
|---|---:|---|
| Initial logo | 0–350ms | opacity 0→1, scale 0.88→1 |
| Accent dots | 180–650ms | staggered translate/scale |
| `eKta Social` | 500–950ms | opacity + translateY 8→0 |
| Company line | 850–1,250ms | opacity 0→1 |
| Hold | 1,250–1,850ms | স্থির brand frame |
| Exit | 1,850–2,400ms | overlay opacity 1→0, feed opacity 0→1 |

### Motion rules

- easing: ease-out / gentle cubic-bezier
- bounce বা অতিরিক্ত spring ব্যবহার নয়
- total duration সাধারণত ২.৪ সেকেন্ডের মধ্যে
- app background-এ ফেরার পর প্রতিবার animation দেখানো নয়; cold launch-এ full animation, warm resume-এ short fade
- debug/development mode-এ optional skip রাখা যেতে পারে

## ৫. App launch state machine

```text
BOOT
  ↓
NATIVE_SPLASH
  ↓
APP_READY + FEED_LOADING
  ↓
BRAND_REVEAL
  ↓
FEED_HANDOFF
  ↓
READY
```

Recommended state fields:

- `isLaunchVisible`
- `hasCompletedInitialLaunch`
- `isFeedReady` — animation unnecessarily আটকে রাখার জন্য নয়; শুধু handoff timing সামঞ্জস্যে ব্যবহার
- `reducedMotion`
- `isReturningFromBackground`

### Important behaviour

- Network/API slow হলে animation-এর পরে Home-এর existing loading/empty state দেখাবে
- কোনো error হলে brand animation app-কে আটকে রাখবে না
- navigation, deep link বা authenticated route থাকলেও launch overlay একবারের বেশি দেখাবে না
- app background থেকে foreground-এ এলে full launch animation পুনরায় চালানো হবে না

## ৬. Accessibility ও performance

### Accessibility

- Reduce Motion enabled থাকলে:
  - logo scale animation বাদ
  - simple 350–500ms fade
  - company signature দৃশ্যমান থাকবে
- screen reader-এর জন্য launch label:
  - `eKta Social. Band Sanket Pixel Technologies.`
- text contrast WCAG অনুযায়ী রাখা
- launch overlay touch events block করবে, কিন্তু অপ্রয়োজনীয় focus trap তৈরি করবে না

### Performance

- logo asset ছোট compressed PNG/WebP বা vector-compatible asset হওয়া উচিত
- launch screen-এ network image ব্যবহার করা যাবে না
- animation JS thread-এ নয়; Reanimated UI thread ব্যবহার করা ভালো
- launch-এর সময় heavy data transformation, audio preload বা video preload শুরু করা যাবে না
- feed request এবং auth session restore background-এ parallel-এ চলবে

## ৭. Asset plan

নতুন/পরিষ্কার asset set:

```text
assets/images/
  ekta-social-launch.png
  ekta-social-launch-dark.png
  ekta-social-mark.png
```

### Asset requirements

- 1x/2x/3x density-friendly
- transparent logo version
- light/dark background test
- Android adaptive icon-এর সঙ্গে visual mismatch না থাকা
- company text asset-এর মধ্যে baked-in না করে React Native Text হিসেবে render করা ভালো, যাতে sharpness ও accessibility বজায় থাকে

## ৮. Implementation sequence

### Step 1 — Branding lockup

- `eKta Social` wordmark final করা
- `Band Sanket Pixel Technologies` spelling/capitalization confirm করা
- launch logo asset তৈরি/যোগ করা
- light/dark background preview করা

### Step 2 — Native splash alignment

- `app.config.ts`-এ splash logo/background update
- iOS ও Android static splash inspect
- web-এর জন্য native splash-এর fallback CSS/initial background নিশ্চিত করা

### Step 3 — In-app animation component

- `components/brand/LaunchAnimation.tsx` তৈরি
- Reanimated sequence যোগ করা
- reduced-motion fallback যোগ করা
- `onFinished` callback যোগ করা

### Step 4 — Root integration

- `app/_layout.tsx`-এ overlay যোগ করা
- Stack/providers-এর ওপর সঠিক z-order নিশ্চিত করা
- Home feed-এর প্রথম render block না করা
- deep link/auth route-এ launch overlay-এর behaviour test করা

### Step 5 — QA ও polish

- cold launch
- warm resume
- slow network
- no network
- Bengali এবং English UI
- light/dark mode
- Android ছোট screen
- iPhone safe area/notch
- web refresh ও Vercel static export
- reduced motion/accessibility

## ৯. Acceptance criteria

Feature complete ধরা হবে যখন:

- App খোলার সময় প্রথমে blank/white flash দেখা যাবে না
- `eKta Social` logo/name স্পষ্টভাবে দেখা যাবে
- নিচে `Band Sanket Pixel Technologies` দেখা যাবে
- animation শেষে Home news feed স্বাভাবিকভাবে দেখা যাবে
- feed loading হলেও app stuck মনে হবে না
- launch animation ৩ সেকেন্ডের বেশি হবে না
- app background থেকে ফিরে এলে বিরক্তিকর full animation পুনরায় চলবে না
- reduced-motion user-এর জন্য simple fade fallback থাকবে
- web export এবং native Expo build—দুই জায়গাতেই layout ভাঙবে না
- logo ও company signature screen-এর safe area-এর মধ্যে থাকবে

## ১০. Recommended first implementation ticket

**Ticket:** `Add eKta Social branded launch animation before Home feed`

**Files likely to change:**

```text
app/_layout.tsx
app.config.ts
components/brand/LaunchAnimation.tsx
assets/images/ekta-social-launch.png
assets/images/ekta-social-mark.png
```

**Do not change in the first ticket:**

- feed ranking বা repository behaviour
- auth flow
- Reels playback
- upload/render pipeline
- remote logo loading

এতে launch experience আলাদা, predictable এবং low-risk থাকবে; পরে চাইলে onboarding বা first-run tutorial আলাদা feature হিসেবে যোগ করা যাবে।
