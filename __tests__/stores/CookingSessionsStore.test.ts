// outsource dependencies
import { it, jest, expect, describe } from "@jest/globals";

// local dependencies
import type { CookingSession } from "../../src/domain/cookingSession";
import {
    parseCookingSessions,
    CookingSessionsStore,
    COOKING_SESSIONS_VERSION,
} from "../../src/stores/CookingSessionsStore";

// ─── fixtures ────────────────────────────────────────────────────────────────

const VALID_SESSION: CookingSession = {
    recipeId: "recipe-1",
    stepId: "step-1",
    servings: 2,
    updatedAt: "2026-01-01T12:00:00.000Z",
};

function makeSession(
    recipeId: string,
    stepId: string,
    updatedAt: string,
): CookingSession {
    return { recipeId, stepId, servings: 2, updatedAt };
}

// ─── parseCookingSessions ────────────────────────────────────────────────────

describe("parseCookingSessions", () => {
    it("returns null on version mismatch", () => {
        expect(
            parseCookingSessions([VALID_SESSION], COOKING_SESSIONS_VERSION + 1),
        ).toBeNull();
    });

    it("returns null when data is not an array", () => {
        expect(
            parseCookingSessions({ sessions: [] }, COOKING_SESSIONS_VERSION),
        ).toBeNull();
        expect(parseCookingSessions(null, COOKING_SESSIONS_VERSION)).toBeNull();
    });

    it("drops invalid items and keeps valid ones", () => {
        const warnSpy = jest
            .spyOn(console, "warn")
            .mockImplementation(() => {});
        try {
            const invalid = { recipeId: "r", stepId: "", servings: 0 };
            const result = parseCookingSessions(
                [invalid, VALID_SESSION],
                COOKING_SESSIONS_VERSION,
            );
            expect(result).toHaveLength(1);
            expect(result?.[0]?.recipeId).toBe(VALID_SESSION.recipeId);
            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining("dropped 1"),
            );
        } finally {
            warnSpy.mockRestore();
        }
    });

    it("keeps the entry with the later updatedAt when recipeId is duplicated", () => {
        const older = makeSession("r1", "step-old", "2026-01-01T10:00:00.000Z");
        const newer = makeSession("r1", "step-new", "2026-01-01T11:00:00.000Z");

        const resultOlderFirst = parseCookingSessions(
            [older, newer],
            COOKING_SESSIONS_VERSION,
        );
        expect(resultOlderFirst).toHaveLength(1);
        expect(resultOlderFirst?.[0]?.stepId).toBe("step-new");

        const resultNewerFirst = parseCookingSessions(
            [newer, older],
            COOKING_SESSIONS_VERSION,
        );
        expect(resultNewerFirst).toHaveLength(1);
        expect(resultNewerFirst?.[0]?.stepId).toBe("step-new");
    });
});

// ─── CookingSessionsStore ────────────────────────────────────────────────────

describe("CookingSessionsStore", () => {
    it("save upserts the session with updatedAt from the injected clock", () => {
        const fixedDate = new Date("2026-06-15T09:00:00.000Z");
        const store = new CookingSessionsStore(() => fixedDate);
        store.save("recipe-1", "step-1", 3);
        const session = store.get("recipe-1");
        expect(session?.stepId).toBe("step-1");
        expect(session?.servings).toBe(3);
        expect(session?.updatedAt).toBe("2026-06-15T09:00:00.000Z");
    });

    it("save overwrites an existing session for the same recipeId", () => {
        const store = new CookingSessionsStore(() => new Date());
        store.save("recipe-1", "step-1", 2);
        store.save("recipe-1", "step-2", 2);
        expect(store.get("recipe-1")?.stepId).toBe("step-2");
    });

    it("get returns undefined for an unknown recipeId", () => {
        const store = new CookingSessionsStore(() => new Date());
        expect(store.get("unknown")).toBeUndefined();
    });

    it("remove deletes the session for the given recipeId", () => {
        const store = new CookingSessionsStore(() => new Date());
        store.save("recipe-1", "step-1", 2);
        store.remove("recipe-1");
        expect(store.get("recipe-1")).toBeUndefined();
    });

    it("replaceAll replaces all sessions", () => {
        const store = new CookingSessionsStore(() => new Date());
        store.save("old-recipe", "step-x", 1);
        store.replaceAll([VALID_SESSION]);
        expect(store.get("old-recipe")).toBeUndefined();
        expect(store.get(VALID_SESSION.recipeId)).toBeDefined();
        expect(store.list).toHaveLength(1);
    });

    it("pruneMissingRecipes removes sessions for absent recipe ids", () => {
        const store = new CookingSessionsStore(() => new Date());
        store.replaceAll([
            makeSession("recipe-keep", "s1", "2026-01-01T00:00:00.000Z"),
            makeSession("recipe-prune", "s2", "2026-01-01T00:00:00.000Z"),
        ]);
        store.pruneMissingRecipes(new Set(["recipe-keep"]));
        expect(store.get("recipe-keep")).toBeDefined();
        expect(store.get("recipe-prune")).toBeUndefined();
    });
});
