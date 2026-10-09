export type LanguageDirection = "ltr" | "rtl";
export type LanguageRolloutStatus = "available" | "planned";

export type LanguageCatalogEntry = {
  /** BCP 47 language-region tag used for formatting and locale assets. */
  locale: string;
  /** Stable short ID used for language bundles and persistence. */
  code: string;
  englishName: string;
  nativeName: string;
  scheduled: boolean;
  status: LanguageRolloutStatus;
  direction: LanguageDirection;
};

/**
 * First national rollout target: the 22 languages in the Constitution's
 * Eighth Schedule, plus English as a bridge interface language. Bengali and
 * English are the only complete UI bundles today; future entries stay planned
 * until their core flows have reviewed translations.
 */
export const languageCatalog = [
  { code: "as", locale: "as-IN", englishName: "Assamese", nativeName: "অসমীয়া", scheduled: true, status: "planned", direction: "ltr" },
  { code: "bn", locale: "bn-IN", englishName: "Bengali", nativeName: "বাংলা", scheduled: true, status: "available", direction: "ltr" },
  { code: "gu", locale: "gu-IN", englishName: "Gujarati", nativeName: "ગુજરાતી", scheduled: true, status: "planned", direction: "ltr" },
  { code: "hi", locale: "hi-IN", englishName: "Hindi", nativeName: "हिन्दी", scheduled: true, status: "planned", direction: "ltr" },
  { code: "kn", locale: "kn-IN", englishName: "Kannada", nativeName: "ಕನ್ನಡ", scheduled: true, status: "planned", direction: "ltr" },
  { code: "ks", locale: "ks-IN", englishName: "Kashmiri", nativeName: "کٲشُر", scheduled: true, status: "planned", direction: "rtl" },
  { code: "kok", locale: "kok-IN", englishName: "Konkani", nativeName: "कोंकणी", scheduled: true, status: "planned", direction: "ltr" },
  { code: "ml", locale: "ml-IN", englishName: "Malayalam", nativeName: "മലയാളം", scheduled: true, status: "planned", direction: "ltr" },
  { code: "mni", locale: "mni-IN", englishName: "Manipuri (Meitei)", nativeName: "মণিপুরী", scheduled: true, status: "planned", direction: "ltr" },
  { code: "mr", locale: "mr-IN", englishName: "Marathi", nativeName: "मराठी", scheduled: true, status: "planned", direction: "ltr" },
  { code: "ne", locale: "ne-IN", englishName: "Nepali", nativeName: "नेपाली", scheduled: true, status: "planned", direction: "ltr" },
  { code: "or", locale: "or-IN", englishName: "Odia", nativeName: "ଓଡ଼ିଆ", scheduled: true, status: "planned", direction: "ltr" },
  { code: "pa", locale: "pa-IN", englishName: "Punjabi", nativeName: "ਪੰਜਾਬੀ", scheduled: true, status: "planned", direction: "ltr" },
  { code: "sa", locale: "sa-IN", englishName: "Sanskrit", nativeName: "संस्कृतम्", scheduled: true, status: "planned", direction: "ltr" },
  { code: "sd", locale: "sd-IN", englishName: "Sindhi", nativeName: "سنڌي", scheduled: true, status: "planned", direction: "rtl" },
  { code: "ta", locale: "ta-IN", englishName: "Tamil", nativeName: "தமிழ்", scheduled: true, status: "planned", direction: "ltr" },
  { code: "te", locale: "te-IN", englishName: "Telugu", nativeName: "తెలుగు", scheduled: true, status: "planned", direction: "ltr" },
  { code: "ur", locale: "ur-IN", englishName: "Urdu", nativeName: "اردو", scheduled: true, status: "planned", direction: "rtl" },
  { code: "brx", locale: "brx-IN", englishName: "Bodo", nativeName: "बड़ो", scheduled: true, status: "planned", direction: "ltr" },
  { code: "sat", locale: "sat-IN", englishName: "Santali", nativeName: "ᱥᱟᱱᱛᱟᱲᱤ", scheduled: true, status: "planned", direction: "ltr" },
  { code: "mai", locale: "mai-IN", englishName: "Maithili", nativeName: "मैथिली", scheduled: true, status: "planned", direction: "ltr" },
  { code: "doi", locale: "doi-IN", englishName: "Dogri", nativeName: "डोगरी", scheduled: true, status: "planned", direction: "ltr" },
  { code: "en", locale: "en-IN", englishName: "English", nativeName: "English", scheduled: false, status: "available", direction: "ltr" },
] as const satisfies readonly LanguageCatalogEntry[];

export const scheduledLanguageCount = languageCatalog.filter((language) => language.scheduled).length;
export const availableLanguages = languageCatalog.filter((language) => language.status === "available");
export const plannedLanguages = languageCatalog.filter((language) => language.status === "planned");
