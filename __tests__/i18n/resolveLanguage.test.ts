// outsource dependencies
import { it, expect, describe } from "@jest/globals";

// local dependencies
import { resolveLanguage } from "../../src/i18n/resolveLanguage";

describe("resolveLanguage", () => {
    describe("explicit preference", () => {
        it('returns "en" when preference is "en", ignoring device languages', () => {
            expect(resolveLanguage("en", ["uk", "de"])).toBe("en");
        });

        it('returns "uk" when preference is "uk", ignoring device languages', () => {
            expect(resolveLanguage("uk", ["en", "de"])).toBe("uk");
        });

        it('returns "en" when preference is "en" and device languages are empty', () => {
            expect(resolveLanguage("en", [])).toBe("en");
        });

        it('returns "uk" when preference is "uk" and device languages are empty', () => {
            expect(resolveLanguage("uk", [])).toBe("uk");
        });
    });

    describe("system preference", () => {
        it("picks first supported language, skipping unsupported ones", () => {
            expect(resolveLanguage("system", ["de", "uk", "en"])).toBe("uk");
        });

        it("picks english when it comes before ukrainian in device list", () => {
            expect(resolveLanguage("system", ["en", "uk"])).toBe("en");
        });

        it("picks the only supported language when others are unsupported", () => {
            expect(resolveLanguage("system", ["fr", "de", "uk"])).toBe("uk");
        });

        it('falls back to "en" when no device language is supported', () => {
            expect(resolveLanguage("system", ["de", "fr", "es"])).toBe("en");
        });

        it('falls back to "en" when device languages array is empty', () => {
            expect(resolveLanguage("system", [])).toBe("en");
        });
    });

    describe("region and case variants", () => {
        it("matches ukrainian region variant uk-UA", () => {
            expect(resolveLanguage("system", ["uk-UA"])).toBe("uk");
        });

        it("matches upper-case language tag UK", () => {
            expect(resolveLanguage("system", ["UK"])).toBe("uk");
        });

        it("matches english region variant en-GB", () => {
            expect(resolveLanguage("system", ["en-GB"])).toBe("en");
        });

        it("matches upper-case english region variant EN-US", () => {
            expect(resolveLanguage("system", ["EN-US"])).toBe("en");
        });
    });
});
