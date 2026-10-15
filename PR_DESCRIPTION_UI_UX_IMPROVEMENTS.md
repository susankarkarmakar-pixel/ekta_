# UI/UX improvements: post actions, story viewer, alerts, and Reel review

## Summary

This change completes the next eKta Social UI/UX pass across the feed, story viewer, notifications, and Reel creator flows.

## Context

Recent history on `main` includes the home first-fold refresh (`9893497`, merging `feat/home-first-fold-refresh`) and the earlier feed/story controller split (`90049ea`). This change builds on those foundations without changing the repository or authentication architecture.

## What changed

### PostCard interactions

- Replaced the confusing mixed header actions with one `⋯` options menu.
- Added menu actions for:
  - Hide
  - Share
  - Copy link
  - Report
- Added double-tap-to-like behavior while preserving the explicit like button.
- Kept the comment preview/count action intact.
- Added localized relative timestamps, including Bengali output such as `২ ঘণ্টা আগে`.

### Story viewer

- Changed progress indicators from one segment per person to one segment per story.
- Added story-level sequencing for authors with multiple stories.
- Preserved automatic five-second advancement and now advance through the current author’s stories before moving to the next person.
- Preserved swipe navigation and clarified that the viewer supports side-tap navigation.
- Previous/next controls continue to respect the boundaries of the story rail.

### Alerts and unread state

- Added an unread count badge to the Home notification bell.
- Added an unread badge to the Profile tab in the tab bar.
- Kept the existing Alerts screen, grouped activity rows, and “Mark all read” behavior available through the Home bell.

### Reel creator

- Added a review-before-publish step for Reels.
- The review state summarizes the selected clip range and reminds the user to verify the caption and overlay.
- Added a clear path back to editing before confirmation.
- Existing trim controls, overlay controls, music controls, and publish manifest behavior remain unchanged.

### Code hygiene and scalability

- Reformatted the previously dense JSX/style files into reviewable multi-line structures.
- Converted the Home feed from `ScrollView` plus `.map()` to a virtualized `FlatList` with stable keys, `onEndReached`, and a memoized `PostCard`.
- Removed the unused tRPC/Express/Drizzle/MySQL starter server, database schema, API bridge, and related tests.
- Removed unused starter dependencies and renamed the package from `app-template` to `ekta-social`.
- Simplified the root provider tree and Google OAuth callback to use the Supabase-only flow.

## Validation

- `pnpm check` passes.
- `pnpm test -- --run` passes with 13 tests passing across 5 test files.
- `pnpm lint` passes.
- `git diff --check` passes.

## Files changed

- `app/(tabs)/_layout.tsx`
- `app/(tabs)/create.tsx`
- `app/(tabs)/index.tsx`
- `components/apongram/PostCard.tsx`
- `components/apongram/StoryRail.tsx`
- `lib/apongram/useStoryController.ts`

## QA notes

- Verify double-tap and single-tap timing on iOS, Android, and web; single tap intentionally waits briefly to distinguish it from a double tap.
- Validate the copy-link action against the platform share/copy behavior on native and web targets.
- Confirm badge counts are later wired to a real unread-notification source rather than the current demo count.
- Confirm the story viewer with multiple persisted stories per author once backend story retrieval is enabled.
- Confirm the Reel review step on a narrow mobile viewport with long Bengali captions.

## Reviewer checklist

- [ ] Post menu actions are discoverable and do not conflict with author navigation.
- [ ] Double-tap like does not accidentally open the post detail view.
- [ ] Story progress and auto-advance match the currently displayed story.
- [ ] Notification badges are visually aligned and accessible.
- [ ] Reel review can be dismissed without losing edits.
- [ ] Existing feed, story reply, share, report, and publish flows remain functional.
