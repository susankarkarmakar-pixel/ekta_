# eKta — কাজের তালিকা

## 1. Bengali-first mobile app shell and navigation
- The app is a portrait-first mobile experience for a focused civic/public-service community in Malda/North Bengal, not a national general-purpose clone.
- The app has usable Home, Discover, Create, Alerts and Profile destinations with clear selected states and one-handed touch targets.
- The interface provides a persistent Bengali/English UI toggle across the app shell, with Bengali as the default.
- The app shows clear loading, empty, success and error states and does not include direct messages, video, recommendation algorithms or advanced notifications in Phase 1.

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

## 5. Phone OTP authentication flow
- The app includes phone-number entry and OTP verification screens suitable for Supabase Auth.
- The flow includes verification, retry and clear error states without requiring a password.
- When Supabase credentials are unavailable, the app remains usable in seeded demo mode rather than crashing.

## 6. Supabase data and storage integration
- The app uses `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` as protected runtime configuration; no service-role key is placed in source or the mobile bundle.
- A Supabase migration defines profiles, posts, follows, likes, comments, hashtags and reports, with indexes and Row Level Security policies appropriate for public community content.
- Profile photos and the single optional post image have a documented Supabase Storage boundary ready for secure upload/retrieval.
- The app uses a repository interface that selects Supabase when configured and seeded demo data when it is not.

## 7. GitHub source mirror and delivery readiness
- The complete app source, Supabase migration and setup README are mirrored to `susankarkarmakar-pixel/ekta` without committing protected values.
- Native branding files and app configuration preserve the managed Expo identifiers and include the eKta visual identity.
- The Metro listener on 8081 and API listener on 3000 start successfully, and the TypeScript check passes before delivery.
