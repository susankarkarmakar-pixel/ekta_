# eKta — Made in India, for communities across India

**eKta is being built in India for people across India.** It is a multilingual, neighborhood-first social network for useful local updates, community connections, and civic participation. The preview starts with a nationwide India feed and sample members from multiple states instead of centering on one city or region.

## Product direction

Members should be able to read and contribute in the language they are most comfortable using. Bengali and English are the complete interface languages today. English is the fallback on a fresh install, while each member can select Bengali and keep that preference. The other 21 languages in the Constitution's Eighth Schedule are staged for gradual, locally reviewed rollout [1]. That first rollout set is not a claim that the schedule includes every language or mother tongue spoken in India.

The target set is Assamese, Bengali, Gujarati, Hindi, Kannada, Kashmiri, Konkani, Malayalam, Manipuri (Meitei), Marathi, Nepali, Odia, Punjabi, Sanskrit, Sindhi, Tamil, Telugu, Urdu, Bodo, Santali, Maithili, and Dogri. English remains available as a bridge interface language.

## Localization and regional rollout

Language metadata lives in `lib/apongram/languages.ts`. It records locale tags, language IDs, native and English names, rollout state, scheduled-language membership, and text direction. Shared interface copy is centralized in `lib/apongram/types.ts`. A locale is shown as available only when its essential screens and error messages have a reviewed translation. Planned locales remain visible as coming later in Settings.

For each rollout, translate interface and community-safety copy, have native speakers review wording, test long strings on small screens, verify search in that script, and check date/number formats. Urdu, Sindhi, and Kashmiri need right-to-left layout and script review before activation. More languages and scripts can be added beyond the first scheduled-language rollout as the community grows.

## Current preview and production work

The demo feed contains sample posts from multiple Indian cities. Settings currently shows `India · all regions`; it is a display-only nationwide preference, not live state/district/neighborhood filtering. The preview uses seeded demo data when live backend credentials are absent. Phone OTP is a demo flow and does not send real SMS. Production authentication, region selection, moderation operations, and live data policies must be completed before public launch.

Do not add Supabase service-role credentials to the app, GitHub, or a client bundle. Only publishable client credentials belong in Expo/Vercel configuration. Without live credentials the seeded preview remains available.

## Run locally

```sh
pnpm install
pnpm dev
```

For the static web export used by Vercel:

```sh
pnpm exec expo export --platform web
```

The export is written to `dist`. Vercel build settings and repository-local Git author guidance are in [VERCEL.md](./VERCEL.md). The GitHub repository is [`susankarkarmakar-pixel/ekta_`](https://github.com/susankarkarmakar-pixel/ekta_).

## Visual asset

The feed pottery image is “Vibrant Terracotta Pots at Local Market Display” by [Muhammad Shamaoon Malik on Pexels](https://www.pexels.com/photo/vibrant-terracotta-pots-at-local-market-display-30026678/), used under the [Pexels license](https://www.pexels.com/license/).

## References

[1]: https://www.mha.gov.in/sites/default/files/Eighth_Schedule.pdf "Ministry of Home Affairs, Government of India — Constitutional provisions relating to the Eighth Schedule"
