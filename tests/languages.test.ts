import { describe, expect, it } from "vitest";
import { availableLanguages, languageCatalog, plannedLanguages, scheduledLanguageCount } from "../lib/apongram/languages";

describe("regional language rollout catalog", () => {
  it("contains exactly the 22 scheduled languages plus English", () => {
    expect(scheduledLanguageCount).toBe(22);
    expect(languageCatalog).toHaveLength(23);
    expect(languageCatalog.filter((language) => language.scheduled)).toHaveLength(22);
  });

  it("keeps only complete Bengali and English bundles available", () => {
    expect(availableLanguages.map((language) => language.code).sort()).toEqual(["bn", "en"]);
    expect(plannedLanguages).toHaveLength(21);
  });

  it("uses unique locale tags and marks planned right-to-left locales", () => {
    const locales = languageCatalog.map((language) => language.locale);
    expect(new Set(locales).size).toBe(locales.length);
    for (const code of ["ks", "sd", "ur"]) {
      const locale = languageCatalog.find((language) => language.code === code);
      expect(locale?.direction).toBe("rtl");
      expect(locale?.status).toBe("planned");
    }
  });
});
