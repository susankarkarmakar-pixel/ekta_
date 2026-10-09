# eKta — Made in India, for communities across India

**eKta is being built in India for people across India.** It is a multilingual, neighborhood-first social network for sharing useful local updates, finding people nearby, and taking part in community life. The first working community is in Gazole, Malda, North Bengal; the product is being prepared to expand region by region rather than treating one language or one city as all of India.

## Product direction

Members should be able to read and contribute in the language they are most comfortable using. Local feeds should be discoverable by state, district, and neighborhood, while keeping moderation, privacy, and accessibility consistent across regions. Language expansion will happen one locale at a time with native-speaker review. A language is not marked as available until the essential screens and error states have been translated and checked.

The first national language rollout target is the 22 languages listed in the Constitution's Eighth Schedule [1]. Bengali and English are currently available in the interface. The other scheduled-language locales are staged in the app's language catalog and will be enabled progressively; the schedule is an initial rollout target, not a claim that it covers every language or mother tongue spoken in India.

The scheduled-language target is: Assamese, Bengali, Gujarati, Hindi, Kannada, Kashmiri, Konkani, Malayalam, Manipuri (Meitei), Marathi, Nepali, Odia, Punjabi, Sanskrit, Sindhi, Tamil, Telugu, Urdu, Bodo, Santali, Maithili, and Dogri. English remains available as a bridge interface language.

## Localization approach

Language metadata is kept in `lib/apongram/languages.ts`. It records each locale tag, language ID, English and native names, rollout status, scheduled-language membership, and text direction. UI copy stays in the central copy dictionary in `lib/apongram/types.ts`. Only complete, reviewed bundles should be promoted to `available`; planned languages remain visibly marked as coming later in Settings.

When adding a language, translate the shared interface copy and community-safety text, review the Bengali/English strings for accidental mixed-language phrasing, test long labels and small screens, check search in that script, and verify date/number formatting. Urdu, Sindhi, and Kashmiri need explicit right-to-left layout and script review before activation. Native speakers should review wording and cultural context before a locale goes live.

## Current preview and scope

The current working interface has Bengali and English copy, a chronological feed, profiles, search/topics, follows, likes, comments, notifications, compose, settings, and a language rollout list. The visual preview uses seeded demo data when live backend credentials are absent. Phone OTP is a demo flow and does not send a real SMS. The first location shown in demo data is Gazole; national region selection, production authentication, moderation operations, and live data policies still need product/backend work before a public all-India launch.

Do not add Supabase service-role credentials to the app, GitHub, or a client bundle. Only publishable client credentials belong in Expo/Vercel configuration. Without live credentials the seeded preview remains available.

## Run locally

```sh
pnpm install
pnpm dev
```

For the same static web export used by Vercel:

```sh
pnpm exec expo export --platform web
```

The export is written to `dist`. Vercel build settings and repository-local Git author guidance are in [VERCEL.md](./VERCEL.md). The GitHub repository for this project is [`susankarkarmakar-pixel/ekta_`](https://github.com/susankarkarmakar-pixel/ekta_).

## Visual asset

The feed pottery image is “Vibrant Terracotta Pots at Local Market Display” by [Muhammad Shamaoon Malik on Pexels](https://www.pexels.com/photo/vibrant-terracotta-pots-at-local-market-display-30026678/), used under the [Pexels license](https://www.pexels.com/license/).

## References

[1]: https://www.mha.gov.in/sites/default/files/Eighth_Schedule.pdf "Ministry of Home Affairs, Government of India — Constitutional provisions relating to the Eighth Schedule"
