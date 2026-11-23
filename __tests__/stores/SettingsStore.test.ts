// outsource dependencies
import { it, expect, describe } from "@jest/globals";

// local dependencies
import { parseSettings } from "../../src/stores/SettingsStore";

describe("parseSettings", () => {
    describe("valid input", () => {
        it("returns a full valid v1 object unchanged", () => {
            const data = {
                themePreference: "dark",
                language: "uk",
                voiceEnabled: false,
                timerSoundEnabled: false,
            };
            expect(parseSettings(data, 1)).toEqual({
                themePreference: "dark",
                language: "uk",
                voiceEnabled: false,
                timerSoundEnabled: false,
            });
        });

        it("accepts all valid themePreference values", () => {
            expect(
                parseSettings(
                    {
                        themePreference: "light",
                        language: "en",
                        voiceEnabled: true,
                        timerSoundEnabled: true,
                    },
                    1,
                ),
            ).toEqual({
                themePreference: "light",
                language: "en",
                voiceEnabled: true,
                timerSoundEnabled: true,
            });
            expect(
                parseSettings(
                    {
                        themePreference: "system",
                        language: "system",
                        voiceEnabled: false,
                        timerSoundEnabled: false,
                    },
                    1,
                ),
            ).toEqual({
                themePreference: "system",
                language: "system",
                voiceEnabled: false,
                timerSoundEnabled: false,
            });
        });
    });

    describe("invalid version", () => {
        it("returns null for version 0", () => {
            expect(
                parseSettings(
                    {
                        themePreference: "dark",
                        language: "uk",
                        voiceEnabled: true,
                    },
                    0,
                ),
            ).toBeNull();
        });

        it("returns null for version 2", () => {
            expect(
                parseSettings(
                    {
                        themePreference: "dark",
                        language: "uk",
                        voiceEnabled: true,
                    },
                    2,
                ),
            ).toBeNull();
        });
    });

    describe("non-object data", () => {
        it("returns null for null data", () => {
            expect(parseSettings(null, 1)).toBeNull();
        });

        it("returns null for array data", () => {
            expect(parseSettings([], 1)).toBeNull();
        });

        it("returns null for string data", () => {
            expect(parseSettings("settings", 1)).toBeNull();
        });

        it("returns null for number data", () => {
            expect(parseSettings(42, 1)).toBeNull();
        });
    });

    describe("per-field fallback", () => {
        it("falls back themePreference to system while keeping other valid fields", () => {
            const data = {
                themePreference: "invalid-theme",
                language: "uk",
                voiceEnabled: false,
                timerSoundEnabled: false,
            };
            const result = parseSettings(data, 1);
            expect(result).toEqual({
                themePreference: "system",
                language: "uk",
                voiceEnabled: false,
                timerSoundEnabled: false,
            });
        });

        it("falls back language to system while keeping other valid fields", () => {
            const data = {
                themePreference: "dark",
                language: "fr",
                voiceEnabled: true,
                timerSoundEnabled: true,
            };
            const result = parseSettings(data, 1);
            expect(result).toEqual({
                themePreference: "dark",
                language: "system",
                voiceEnabled: true,
                timerSoundEnabled: true,
            });
        });

        it("falls back voiceEnabled to true while keeping other valid fields", () => {
            const data = {
                themePreference: "light",
                language: "en",
                voiceEnabled: "yes",
                timerSoundEnabled: true,
            };
            const result = parseSettings(data, 1);
            expect(result).toEqual({
                themePreference: "light",
                language: "en",
                voiceEnabled: true,
                timerSoundEnabled: true,
            });
        });

        it("falls back timerSoundEnabled to true while keeping other valid fields", () => {
            const data = {
                themePreference: "light",
                language: "en",
                voiceEnabled: true,
                timerSoundEnabled: "yes",
            };
            const result = parseSettings(data, 1);
            expect(result).toEqual({
                themePreference: "light",
                language: "en",
                voiceEnabled: true,
                timerSoundEnabled: true,
            });
        });

        it("falls back all invalid fields to defaults for empty object", () => {
            const result = parseSettings({}, 1);
            expect(result).toEqual({
                themePreference: "system",
                language: "system",
                voiceEnabled: true,
                timerSoundEnabled: true,
            });
        });
    });
});
