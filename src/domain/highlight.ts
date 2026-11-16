// local dependencies
import { normalizeSearchText } from "./recipeFilter";

// Plain substring match — Ukrainian case endings may prevent a match; this is accepted.

export type Segment = { text: string; highlighted: boolean };

export function highlightSegments(text: string, terms: string[]): Segment[] {
    if (text === "") return [];

    const validTerms = terms.filter((t) => t.trim() !== "");
    if (validTerms.length === 0) return [{ text, highlighted: false }];

    const normText = normalizeSearchText(text);
    if (normText.length !== text.length) return [{ text, highlighted: false }];

    const normTerms: string[] = [];
    for (const term of validTerms) {
        const norm = normalizeSearchText(term);
        if (norm.length !== term.length) return [{ text, highlighted: false }];
        normTerms.push(norm);
    }

    const matches: Array<{ start: number; end: number }> = [];
    let pos = 0;
    while (pos < normText.length) {
        let bestLen = 0;
        for (const norm of normTerms) {
            if (norm.length > bestLen && normText.startsWith(norm, pos)) {
                bestLen = norm.length;
            }
        }
        if (bestLen > 0) {
            matches.push({ start: pos, end: pos + bestLen });
            pos += bestLen;
        } else {
            pos++;
        }
    }

    if (matches.length === 0) return [{ text, highlighted: false }];

    const segments: Segment[] = [];
    let cursor = 0;
    for (const match of matches) {
        if (cursor < match.start) {
            segments.push({
                text: text.slice(cursor, match.start),
                highlighted: false,
            });
        }
        segments.push({
            text: text.slice(match.start, match.end),
            highlighted: true,
        });
        cursor = match.end;
    }
    if (cursor < text.length) {
        segments.push({ text: text.slice(cursor), highlighted: false });
    }
    return segments;
}
