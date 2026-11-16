// outsource dependencies
import { createInstance } from "i18next";
import { it, expect, describe } from "@jest/globals";

// local dependencies
import en from "../../src/i18n/locales/en.json";
import uk from "../../src/i18n/locales/uk.json";
import { splitMinutes } from "../../src/domain/duration";
import { formatDuration } from "../../src/i18n/formatDuration";

// ─── i18next helper ───────────────────────────────────────────────────────────

function makeT(lang: "en" | "uk") {
    const instance = createInstance();
    const ukRes: typeof en = uk as typeof en;
    instance.init({
        lng: lang,
        resources: {
            en: { translation: en },
            uk: { translation: ukRes },
        },
        interpolation: { escapeValue: false },
        initAsync: false,
    });
    return instance.t.bind(instance);
}

// ─── splitMinutes ─────────────────────────────────────────────────────────────

describe("splitMinutes", () => {
    it("45 → { hours: 0, minutes: 45 }", () => {
        expect(splitMinutes(45)).toEqual({ hours: 0, minutes: 45 });
    });

    it("60 → { hours: 1, minutes: 0 }", () => {
        expect(splitMinutes(60)).toEqual({ hours: 1, minutes: 0 });
    });

    it("150 → { hours: 2, minutes: 30 }", () => {
        expect(splitMinutes(150)).toEqual({ hours: 2, minutes: 30 });
    });
});

// ─── formatDuration ───────────────────────────────────────────────────────────

describe("formatDuration", () => {
    it('45 minutes only → "45 min" in English', () => {
        expect(formatDuration(makeT("en"), 45)).toBe("45 min");
    });

    it('45 minutes only → "45 хв" in Ukrainian', () => {
        expect(formatDuration(makeT("uk"), 45)).toBe("45 хв");
    });

    it('60 minutes (1 hour, no remainder) → "1 h" in English', () => {
        expect(formatDuration(makeT("en"), 60)).toBe("1 h");
    });

    it('60 minutes (1 hour, no remainder) → "1 год" in Ukrainian', () => {
        expect(formatDuration(makeT("uk"), 60)).toBe("1 год");
    });

    it('150 minutes (2 h 30 min) → "2 h 30 min" in English', () => {
        expect(formatDuration(makeT("en"), 150)).toBe("2 h 30 min");
    });

    it('150 minutes (2 h 30 min) → "2 год 30 хв" in Ukrainian', () => {
        expect(formatDuration(makeT("uk"), 150)).toBe("2 год 30 хв");
    });
});
