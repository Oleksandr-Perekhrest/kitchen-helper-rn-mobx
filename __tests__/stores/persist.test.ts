// outsource dependencies
import { z } from "zod";
import { makeAutoObservable } from "mobx";
import { it, expect, describe } from "@jest/globals";

// local dependencies
import { persist } from "../../src/stores/persist";
import type { KeyValueStorage } from "../../src/storage/types";
import { createMemoryStorage } from "../../src/storage/memoryStorage";

// ─── tiny test store ──────────────────────────────────────────────────────────

class TestStore {
    value = "default";
    constructor() {
        makeAutoObservable(this);
    }
    setValue(v: string) {
        this.value = v;
    }
}

// ─── helpers ──────────────────────────────────────────────────────────────────

const TestDataSchema = z.object({ value: z.string() });

function parseTestData(data: unknown, _version: number) {
    const r = TestDataSchema.safeParse(data);
    return r.success ? r.data : null;
}

function getStoredEnvelope(storage: KeyValueStorage, key: string): unknown {
    const raw = storage.getString(key);
    if (typeof raw !== "string")
        throw new Error(`key "${key}" absent in storage`);
    return JSON.parse(raw);
}

// ─── tests ────────────────────────────────────────────────────────────────────

describe("persist", () => {
    it("missing key: store keeps defaults, nothing written on start", () => {
        const storage = createMemoryStorage();
        const store = new TestStore();
        const dispose = persist({
            storage,
            key: "test",
            version: 1,
            snapshot: () => ({ value: store.value }),
            apply: (d) => store.setValue(d.value),
            parse: parseTestData,
        });
        expect(store.value).toBe("default");
        expect(storage.getString("test")).toBeUndefined();
        dispose();
    });

    it("valid stored envelope is applied before persist() returns", () => {
        const storage = createMemoryStorage({
            test: JSON.stringify({ version: 1, data: { value: "stored" } }),
        });
        const store = new TestStore();
        const dispose = persist({
            storage,
            key: "test",
            version: 1,
            snapshot: () => ({ value: store.value }),
            apply: (d) => store.setValue(d.value),
            parse: parseTestData,
        });
        expect(store.value).toBe("stored");
        dispose();
    });

    it("corrupt JSON: store keeps defaults, no throw", () => {
        const storage = createMemoryStorage({ test: "not{valid}json{{" });
        const store = new TestStore();
        const dispose = persist({
            storage,
            key: "test",
            version: 1,
            snapshot: () => ({ value: store.value }),
            apply: (d) => store.setValue(d.value),
            parse: parseTestData,
        });
        expect(store.value).toBe("default");
        dispose();
    });

    it("non-envelope value: store keeps defaults, no throw", () => {
        // valid JSON but not an envelope object (missing "version" / "data")
        const storage = createMemoryStorage({
            test: JSON.stringify({ other: "nope" }),
        });
        const store = new TestStore();
        const dispose = persist({
            storage,
            key: "test",
            version: 1,
            snapshot: () => ({ value: store.value }),
            apply: (d) => store.setValue(d.value),
            parse: parseTestData,
        });
        expect(store.value).toBe("default");
        dispose();
    });

    it("parse returning null: store keeps defaults", () => {
        const storage = createMemoryStorage({
            test: JSON.stringify({ version: 1, data: { value: "stored" } }),
        });
        const store = new TestStore();
        const dispose = persist({
            storage,
            key: "test",
            version: 1,
            snapshot: () => ({ value: store.value }),
            apply: (d) => store.setValue(d.value),
            parse: () => null,
        });
        expect(store.value).toBe("default");
        dispose();
    });

    it("parse receives the exact stored version number", () => {
        const storage = createMemoryStorage({
            test: JSON.stringify({ version: 42, data: { value: "x" } }),
        });
        const store = new TestStore();
        let capturedVersion = -1;
        const dispose = persist({
            storage,
            key: "test",
            version: 1,
            snapshot: () => ({ value: store.value }),
            apply: (d) => store.setValue(d.value),
            parse: (_data, version) => {
                capturedVersion = version;
                return null;
            },
        });
        expect(capturedVersion).toBe(42);
        dispose();
    });

    it("a change writes { version, data } JSON with the configured version", () => {
        const storage = createMemoryStorage();
        const store = new TestStore();
        const dispose = persist({
            storage,
            key: "test",
            version: 7,
            snapshot: () => ({ value: store.value }),
            apply: (d) => store.setValue(d.value),
            parse: parseTestData,
        });
        store.setValue("changed");
        expect(getStoredEnvelope(storage, "test")).toEqual({
            version: 7,
            data: { value: "changed" },
        });
        dispose();
    });

    it("after disposer is called, further changes are not written", () => {
        const storage = createMemoryStorage();
        const store = new TestStore();
        const dispose = persist({
            storage,
            key: "test",
            version: 1,
            snapshot: () => ({ value: store.value }),
            apply: (d) => store.setValue(d.value),
            parse: parseTestData,
        });
        store.setValue("before-dispose");
        dispose();
        store.setValue("after-dispose");
        expect(getStoredEnvelope(storage, "test")).toEqual({
            version: 1,
            data: { value: "before-dispose" },
        });
    });
});
