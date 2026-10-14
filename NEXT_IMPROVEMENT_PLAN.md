# eKta — Next Improvement Plan

**Updated:** 2026-10-14
**Current baseline:** Reels/Stories composer, seeded feed, Bengali/English UI, and Vercel deployment. Email OTP code is merged and the Supabase URL/publishable key are configured in Vercel; a fresh production deployment and custom SMTP delivery still need verification. Durable media publishing/rendering remains incomplete.

## Product goal for the next phase

First make passwordless email sign-in reliable for ordinary users, then move eKta from a convincing creator **preview** to a safe, durable community media workflow. A user should be able to receive and verify an email OTP, remain signed in across sessions, and then create and retrieve durable community media.

## Immediate release gate — Email OTP delivery

**Status:** The app code and Vercel public Supabase variables are in place, and Supabase Email Auth is enabled. The current production site still needs a fresh deployment. Custom SMTP has not yet been verified.

**Work items**

1. Configure a transactional SMTP provider such as Resend with a verified sending domain; keep SMTP credentials in Supabase, never in the client bundle. See the [Supabase SMTP guide](https://supabase.com/docs/guides/auth/auth-smtp).
2. In Supabase Auth, set the **Magic Link or OTP** email template to include `{{ .Token }}` so users receive the six-digit code expected by the app. See [Supabase passwordless email sign-in](https://supabase.com/docs/guides/auth/auth-email-passwordless).
3. Redeploy the merged `main` branch so the static web bundle includes the Vercel environment variables.
4. Align the app's resend cooldown with Supabase's configured per-address limit (default 60 seconds); surface rate-limit errors without implying a code was sent.
5. Test the full flow with an email address that is not on the Supabase project team, including inbox/spam delivery, code verification, page reload, and session refresh.
6. Add automated coverage for OTP request/verification failures, persistence, expired-session refresh, and sign-out.

**Acceptance criteria**

- A non-team user receives a six-digit OTP and can sign in without Google or a password.
- A failed send or invalid code never appears as successful authentication.
- A verified session survives a reload and can refresh safely after expiry.
- SMTP credentials and Supabase service-role/secret keys never enter Vercel's public bundle.

## Priority order

### P0 — Durable media publishing foundation

**Why first:** The current picker URIs are local to the device/session. Music, trim, and overlay settings are stored as metadata or preview state, but the final media file is not rendered or uploaded.

**Work items**

1. Add authenticated Supabase Storage upload for images, videos, and rendered media.
2. Add file-size, MIME-type, and duration limits on both client and server boundaries.
3. Create private/public bucket policy decisions and RLS-safe ownership checks.
4. Replace local `file://`, `content://`, and `blob:` paths with durable storage paths only after a successful upload.
5. Add upload progress, cancel, retry, offline/error, and success states.
6. Add a database migration for durable media fields and ownership metadata.

**Acceptance criteria**

- A signed-in user can publish a Reel or Story and retrieve it after refresh.
- A failed upload never creates a misleading published post.
- Unauthenticated users remain in clearly labelled demo mode.
- No service-role credential reaches the client bundle.
- Storage and database policies prevent users from overwriting another user’s media.

### P0 — Server-side media rendering pipeline

**Why first:** Expo preview controls do not permanently burn music, text, stickers, or trim ranges into the uploaded video.

**Work items**

1. Add a small server-side FFmpeg worker or edge-compatible media job service.
2. Accept source video plus a validated render manifest:
   - trim start/end
   - compression profile
   - music track ID and music volume
   - original audio volume
   - overlay text, sticker, and position
3. Render a final MP4 with H.264/AAC, mobile-safe dimensions, and a maximum duration of 60 seconds.
4. Render image Stories with overlays as final image files.
5. Store render status: `queued`, `processing`, `ready`, `failed`.
6. Publish only after the rendered asset is ready, or clearly show “processing” without claiming completion.

**Acceptance criteria**

- A Reel’s downloaded/played file contains the selected music and overlays.
- Original audio and music volumes match the selected mix values within an agreed tolerance.
- Trimmed output starts and ends within the selected range.
- Render failures are retryable and visible to the creator.
- Unsupported or unsafe media is rejected before expensive processing.

### P1 — Schema and repository alignment

**Work items**

1. Add a migration for `video_start`, `video_end`, `video_compression`, `music_track_id`, `music_volume`, `original_volume`, `overlay_text`, `overlay_sticker`, and `overlay_position`.
2. Add render/storage status and final media URL/path fields.
3. Extend `ReelRow` and repository mapping so remote Reels retain music and overlay metadata.
4. Add story queries that filter expired Stories by `story_expires_at`.
5. Add indexes for non-story Reels, active Stories, creator ownership, and render status.
6. Add runtime validation for remote rows before rendering them in the UI.

**Acceptance criteria**

- A remote Reel round-trips through the repository without losing media metadata.
- Expired Stories do not appear in the Story rail.
- Existing seeded demo data remains compatible with the new nullable fields.

### P1 — Creator UX polish

**Work items**

1. Replace plus/minus volume controls with accessible sliders and numeric labels.
2. Add a scrubber/range UI for trim selection instead of only numeric inputs.
3. Add draggable overlay placement on the preview with safe-area snapping.
4. Add text style choices: color, size, weight, alignment, and readable shadow/background.
5. Add sticker categories and a clear selected-state treatment.
6. Add a final “Review before publishing” step showing duration, audio mix, overlays, privacy, and estimated upload size.
7. Preserve editor state when switching between Reel and Story modes only when it is safe to do so.

**Acceptance criteria**

- All creator controls are usable with one hand and keyboard/accessibility navigation.
- Overlay text remains inside the safe area on portrait and landscape source media.
- The review step never allows publishing without required media.

### P1 — Viewer and Story behavior

**Work items**

1. Add a Story viewer with progress segments, tap left/right navigation, pause-on-hold, and expiry handling.
2. Display a music attribution label and overlay-safe captions in Reel and Story viewers.
3. Add a muted/unmuted preference that is session-safe and respects browser autoplay rules.
4. Add loading placeholders for remote media and a retry state for failed playback.
5. Make share links point to durable post IDs rather than local session state.

**Acceptance criteria**

- Stories automatically advance and stop at expiry.
- Reels pause when leaving the route and only the active item plays.
- Viewer actions work with remote durable URLs, not only bundled demo clips.

### P2 — Trust, moderation, and reliability

**Work items**

1. Add report reasons for media, audio, overlays, and misleading content.
2. Add a lightweight moderation status and takedown path for uploaded media.
3. Add rate limits for publishing and render jobs.
4. Add structured client error logging without collecting private media contents.
5. Add upload/render analytics: success rate, processing duration, retry rate, and playback failures.
6. Add a data-retention policy for abandoned uploads and failed render artifacts.

**Acceptance criteria**

- A user can report an item and receive a clear confirmation.
- Failed jobs do not accumulate indefinitely in storage.
- Operational metrics can identify upload versus rendering versus playback failures.

## Recommended implementation sequence

### Sprint 0 — Email OTP release hardening

- Configure and verify custom SMTP plus the six-digit OTP email template.
- Redeploy the merged authentication changes with the Vercel public variables.
- Adjust resend timing and add auth-flow tests.
- Complete one end-to-end sign-in using a non-team email address.

### Sprint 1 — Upload foundation

- Supabase migration and Storage policies
- Authenticated upload helper
- Upload progress/retry UI
- Repository round-trip for durable media
- Expiry filtering for Stories

### Sprint 2 — Rendering worker

- Render manifest contract
- FFmpeg trim/compression/audio mix
- Text/sticker burn-in
- Render status polling and failure retry
- Publish-after-render behavior

### Sprint 3 — Creator and viewer polish

- Trim scrubber
- Draggable overlays and text styling
- Review-before-publish screen
- Story viewer and progress navigation
- Remote playback/loading states

### Sprint 4 — Trust and release hardening

- Moderation fields and report reasons
- Rate limits and cleanup job
- Accessibility pass
- Mobile/browser device matrix
- End-to-end test pass and deployment checklist

## Testing plan

### Automated

- TypeScript and ESLint on every change
- Auth tests for OTP send/verify, invalid and expired codes, session persistence/refresh, and logout
- Repository tests for local/demo and Supabase paths
- Manifest validation tests for duration, MIME, volume, position, and text length
- FFmpeg fixture tests for duration, audio streams, and overlay presence
- Story expiry and query filtering tests

### Browser and device QA

- Chrome desktop and mobile viewport
- iOS Safari and Android Chrome
- Expo native Android/iOS preview
- Slow network, denied media permissions, cancelled picker, upload retry, and expired session
- Muted autoplay, audio permission, and browser visibility changes

### Release gates

- No client-side service-role secrets
- Custom SMTP delivery works for non-team users; the OTP template includes `{{ .Token }}` and the production bundle is current
- No local URI presented as durable public media
- Rendered asset plays after a fresh session
- Story expires correctly
- Vercel export succeeds
- GitHub `main` and Vercel deployment are synchronized

## Explicitly defer

- Direct messages
- Algorithmic recommendations
- Full music marketplace/licensing system
- Long-form video
- Multi-track audio timelines
- Advanced AR effects
- Broad notification infrastructure

## Immediate next ticket

**Close the email OTP release gate first.** Configure and verify custom SMTP, confirm the six-digit template, redeploy `main`, align resend timing, and test sign-in with a non-team email. After this gate passes, continue with the authenticated upload and render-manifest foundation: Supabase Storage policies, `uploadMedia()`, the render manifest, and a publish state machine. Do not add more visual effects until a Reel can be durably uploaded and retrieved after a fresh session.
