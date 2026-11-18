// outsource dependencies
import { it, expect, describe } from "@jest/globals";

// local dependencies
import { createRootStore } from "../../src/stores/RootStore";
import { emptyFormValues } from "../../src/domain/recipeForm";
import { createMemoryStorage } from "../../src/storage/memoryStorage";
import {
    DraftStore,
    parseDraft,
    DRAFT_VERSION,
    DRAFT_STORAGE_KEY,
} from "../../src/stores/DraftStore";

// ─── fixtures ─────────────────────────────────────────────────────────────────

const NOW_FN = () => new Date("2026-11-17T10:00:00.000Z");

function draftValues() {
    return { ...emptyFormValues(), title: "Half-written soup" };
}

function validDraftData() {
    return {
        values: draftValues(),
        stepIndex: 2,
        savedAt: "2026-11-17T10:00:00.000Z",
    };
}

function startStore(storage: ReturnType<typeof createMemoryStorage>) {
    return createRootStore(storage, { deviceLanguages: ["en"], now: NOW_FN });
}

// ─── tests ────────────────────────────────────────────────────────────────────

describe("DraftStore", () => {
    it("save stores values, step index and an ISO timestamp", () => {
        const store = new DraftStore();
        const values = draftValues();
        store.save(values, 1);
        expect(store.draft?.values).toEqual(values);
        expect(store.draft?.stepIndex).toBe(1);
        expect(new Date(store.draft?.savedAt ?? "").toISOString()).toBe(
            store.draft?.savedAt,
        );
    });

    it("clear removes the draft", () => {
        const store = new DraftStore();
        store.save(draftValues(), 0);
        store.clear();
        expect(store.draft).toBeNull();
    });
});

describe("parseDraft", () => {
    it("returns the draft for valid data", () => {
        const data = validDraftData();
        expect(parseDraft(data, DRAFT_VERSION)).toEqual(data);
    });

    it.each([
        ["a wrong version", validDraftData(), DRAFT_VERSION + 1],
        ["null", null, DRAFT_VERSION],
        ["a string", "draft", DRAFT_VERSION],
        [
            "missing stepIndex",
            { values: draftValues(), savedAt: "x" },
            DRAFT_VERSION,
        ],
        [
            "a string stepIndex",
            { ...validDraftData(), stepIndex: "2" },
            DRAFT_VERSION,
        ],
        [
            "a numeric savedAt",
            { ...validDraftData(), savedAt: 1 },
            DRAFT_VERSION,
        ],
        [
            "an invalid values shape",
            {
                ...validDraftData(),
                values: { ...draftValues(), tags: ["snack"] },
            },
            DRAFT_VERSION,
        ],
    ])("returns null for %s", (_name, data, version) => {
        expect(parseDraft(data, version)).toBeNull();
    });
});

describe("draft persistence", () => {
    it("a saved draft survives a restart", () => {
        const storage = createMemoryStorage();
        const first = startStore(storage);
        first.draft.save(draftValues(), 2);
        first.dispose();

        const second = startStore(storage);
        expect(second.draft.draft?.values.title).toBe("Half-written soup");
        expect(second.draft.draft?.stepIndex).toBe(2);
        second.dispose();
    });

    it("a cleared draft stays cleared after a restart", () => {
        const storage = createMemoryStorage();
        const first = startStore(storage);
        first.draft.save(draftValues(), 2);
        first.draft.clear();
        first.dispose();

        const second = startStore(storage);
        expect(second.draft.draft).toBeNull();
        second.dispose();
    });

    it("corrupt stored data gives no draft", () => {
        const storage = createMemoryStorage({
            [DRAFT_STORAGE_KEY]: "{not json",
        });
        const store = startStore(storage);
        expect(store.draft.draft).toBeNull();
        store.dispose();
    });
});
