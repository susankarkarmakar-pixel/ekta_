# eKta Social (একতা) — কাজের তালিকা

## 1. Bengali-first mobile app shell and navigation
- The app is a portrait-first mobile experience for a focused civic/public-service community in Malda/North Bengal, not a national general-purpose clone.
- The app has usable Home, Discover, Create, Alerts and Profile destinations with clear selected states and one-handed touch targets.
- The interface provides a persistent Bengali/English UI toggle across the app shell, with Bengali as the default.
- The app shows clear loading, empty, success and error states; it does not include direct messages, recommendation algorithms or advanced notifications in Phase 1. The separately scoped Reels feature is included.

## 2. Profiles and community relationships
- A profile contains a name, profile photo/avatar, short bio, follower count and following count.
- A user can view other community members and can follow or unfollow them with visible state feedback.
- Profile and follow data are represented through a repository boundary ready for persistent Supabase data.

## 3. Chronological feed and post creation
- The Home feed is chronological rather than algorithmically ranked and uses realistic civic/hyperlocal seeded content so the first view does not feel empty.
- A user can compose a text post and attach no more than one image to a post.
- Posts support basic hashtag entry and display tappable hashtag/topic chips.
- The create flow includes privacy-conscious copy that public posts are visible to the community.

## 4. Engagement, discovery and moderation
- A post exposes like and comment interactions with visible counts and active/inactive feedback.
- A post detail view supports threaded-on-post comments and a comment entry state.
- Basic search can discover users, posts and hashtags, and tapping a hashtag opens a filtered topic view.
- Users, posts and comments have an accessible report/moderation affordance with a controlled confirmation/success state.

## 5. Passwordless Email OTP and Google authentication
- The app includes email entry/validation, OTP verification, retry and resend cooldown states without requiring a password.
- Google authentication reuses the existing Supabase OAuth flow when its provider is configured; session persistence, logout and authenticated navigation remain intact.
- When Supabase credentials/providers are unavailable, normal app launch shows a clear setup/error state and never simulates production sign-in; seeded demo navigation is an explicit developer-only toggle.

## 6. Supabase data and storage integration
- The app uses `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` as protected runtime configuration; no service-role key is placed in source or the mobile bundle.
- A Supabase migration defines profiles, posts, follows, likes, comments, hashtags and reports, with indexes and Row Level Security policies appropriate for public community content.
- Profile photos upload to the authenticated user's Supabase Storage `avatars` path before the profile row syncs; the single optional post image still has a documented Storage boundary ready for later upload/retrieval.
- The app uses a repository interface that selects Supabase when configured and seeded demo data when it is not.

## 7. GitHub source mirror and delivery readiness
- The complete app source, Supabase migration and setup README are updated in `susankarkarmakar-pixel/ekta_` without committing protected values.
- Native branding files and app configuration preserve the managed Expo identifiers and include the eKta Social (একতা) visual identity.
- The Metro listener on 8081 and API listener on 3000 start successfully, and the TypeScript check passes before delivery.

## 8. Vertical Reels browsing and engagement
- The app exposes a clearly named Reels destination in bottom navigation and a Home entry point, and keeps the selected Reels destination visible.
- The Reels screen presents portrait video clips as one full-height item per page with vertical swipe/paging; only the current visible Reel plays, it loops, and leaving the screen or changing item pauses other players.
- Reels start muted and expose a working sound toggle and tap-to-pause/resume control; readable creator, caption, location, hashtags and media attribution overlays stay legible over video.
- A viewer can like/unlike a Reel with immediate state/count feedback, open a comment composer and see submitted comments/count changes, and invoke the device/browser share action.
- The preview has realistic, locally bundled sample Reels and clear loading/empty states; sample clips are identified as demo/stock footage rather than real community uploads.
- The feed obtains Reels through a repository boundary, includes user-created video posts that are not Stories, and does not relabel Story videos as Reels.

## 9. Video Reel creation and media safety
- The existing Create flow offers a Reel mode separate from ordinary photo posts and Stories; the Reel picker/camera accepts a video only and limits Reel footage to 60 seconds.
- A creator can add an optional caption/hashtags, preview the selected video, replace/remove it, receive localized validation or permission errors, and publish only when a Reel video is selected.
- A successful demo publish appears in the Reels feed for the current app session and returns the creator to Reels; regular posts continue to reject video media.
- Supabase schema supports `video_path` and Story distinction/indexing for Reel queries without placing a service-role key in client code; the demo does not pretend a local device URI is a remotely hosted upload.
- The finished walkthrough demo video is playable as an MP4 and shows the real implemented Reels feed and key viewer/creator interactions.


## 10. Animated eKta splash-to-login opening
- The app opens on a warm cream/ivory background; saffron and green flowing waves appear with a subtle slide/fade, and saffron/gold/green dots enter in staggered motion.
- A hand-drawn illustration of two hands clasping firmly for unity/solidarity draws or fades/scales into view; the Bengali wordmark “একতা” then moves gently upward into view, followed by a tricolor underline and the exact tagline “Your Community, Connected”.
- Three loading dots animate subtly, then the splash transitions smoothly to the login screen; the complete intro targets approximately 2–3 seconds and uses restrained opacity/translation/scale, with no excessive bounce, flashing or distracting movement.
- The illustration and interface are real reusable application assets/components, not the uploaded storyboard displayed as a flat screenshot. Use warm ivory, saffron, white and Indian-tricolor green accents, elegant top/bottom waves and the developer credit “Sanket Pixel Technologies”; include no political leaders, party symbols or unnecessary decoration.
- Reduced-motion preference receives a simple, short fade. Navigating back to login does not replay the complete intro unnecessarily, and the splash overlay never traps the user on a blank/infinite-loading screen.

## 11. Responsive eKta email/Google login and secure auth integration
- The login screen includes the eKta Social/Bengali logo and tagline, a prominent “Continue with Google” action, an “OR” divider, an email-address input with validation, and a prominent “Send OTP” action.
- Email OTP has an OTP-entry/verification state, clear loading/success/error feedback, and a resend-OTP action with an appropriate cooldown. The Google and email flows reuse the existing configured authentication provider/services and keep session persistence, logout and authenticated navigation intact.
- Community-guidelines and privacy-charter links are clear and open useful content; the UI does not represent unpublished pilot policy summaries as complete legal terms.
- The experience works on narrow mobile screens, tablets and desktop web as applicable; scrolling remains keyboard-aware, respects mobile safe areas, provides accessible labels and keyboard navigation, preserves contrast, and renders Bengali with the project’s readable Bengali fonts.
- Missing/incomplete authentication configuration produces an honest setup/error state, never simulated production authentication. No credentials, OTPs, API secrets or service-role keys are hardcoded. Google/email functionality is not claimed as live unless verified against the configured provider.
- Reuse existing framework/design system and animation dependencies; avoid unnecessary dependencies, heavyweight animation assets, layout shifts and needless rerenders. Existing app routes/features must continue to work; login/auth changes do not create a parallel authentication system.
