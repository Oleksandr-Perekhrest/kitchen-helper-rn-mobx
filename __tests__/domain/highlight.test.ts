// outsource dependencies
import { it, expect, describe } from "@jest/globals";

// local dependencies
import { highlightSegments } from "../../src/domain/highlight";

// ─── tests ────────────────────────────────────────────────────────────────────

describe("highlightSegments", () => {
    it("empty text returns empty array", () => {
        expect(highlightSegments("", ["chicken"])).toEqual([]);
    });

    it("no terms returns single plain segment", () => {
        expect(highlightSegments("hello world", [])).toEqual([
            { text: "hello world", highlighted: false },
        ]);
    });

    it("whitespace-only terms are ignored and returns single plain segment", () => {
        expect(highlightSegments("hello", ["", "   "])).toEqual([
            { text: "hello", highlighted: false },
        ]);
    });

    it("no match returns single plain segment", () => {
        const result = highlightSegments("pasta", ["xyz"]);
        expect(result).toEqual([{ text: "pasta", highlighted: false }]);
    });

    it("case-insensitive: term 'chicken' matches 'Chicken' in text", () => {
        const result = highlightSegments("Chicken Soup", ["chicken"]);
        expect(result).toContainEqual({ text: "Chicken", highlighted: true });
    });

    it("match in the middle of a word boundary", () => {
        const result = highlightSegments("pasta carbonara", ["carbon"]);
        expect(result).toContainEqual({ text: "carbon", highlighted: true });
        expect(result).toContainEqual({ text: "pasta ", highlighted: false });
    });

    it("longest term wins over shorter term at the same position", () => {
        // "green onion" (11 chars) should beat "onion" (5 chars) at pos 6
        const result = highlightSegments("green onion soup", [
            "onion",
            "green onion",
        ]);
        expect(result).toContainEqual({
            text: "green onion",
            highlighted: true,
        });
        expect(result).not.toContainEqual({ text: "onion", highlighted: true });
    });

    it("multiple occurrences are all highlighted", () => {
        const result = highlightSegments("onion soup with onion", ["onion"]);
        const highlighted = result.filter((s) => s.highlighted);
        expect(highlighted).toHaveLength(2);
        expect(highlighted[0]).toEqual({ text: "onion", highlighted: true });
        expect(highlighted[1]).toEqual({ text: "onion", highlighted: true });
    });

    it("joined segments always equal the original text", () => {
        const cases = [
            { text: "Green onion and onion soup", terms: ["onion", "green"] },
            { text: "Pasta Carbonara", terms: ["pasta", "carbon"] },
            { text: "simple", terms: ["sim"] },
            { text: "no match here", terms: ["xyz"] },
        ];
        for (const { text, terms } of cases) {
            const result = highlightSegments(text, terms);
            expect(result.map((s) => s.text).join("")).toBe(text);
        }
    });

    it("only the matched portion is highlighted, surrounding text is plain", () => {
        const result = highlightSegments("hello world", ["world"]);
        expect(result).toEqual([
            { text: "hello ", highlighted: false },
            { text: "world", highlighted: true },
        ]);
    });

    it("prefix match: highlighted segment at the start", () => {
        const result = highlightSegments("omelette", ["omel"]);
        expect(result).toEqual([
            { text: "omel", highlighted: true },
            { text: "ette", highlighted: false },
        ]);
    });
});
