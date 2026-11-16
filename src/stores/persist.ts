// outsource dependencies
import { reaction, runInAction, compareStructural } from "mobx";

// local dependencies
import type { KeyValueStorage } from "../storage/types";

type PersistEnvelope = { version: number; data: unknown };

function isEnvelope(val: unknown): val is PersistEnvelope {
    if (typeof val !== "object" || val === null) return false;
    if (!("version" in val) || !("data" in val)) return false;
    return typeof val.version === "number";
}

/**
 * Synchronously reads and applies persisted data before returning, so store
 * state is ready before the first render (MMKV is a synchronous storage).
 */
export function persist<T>(options: {
    storage: KeyValueStorage;
    key: string;
    version: number;
    snapshot: () => T;
    apply: (data: T) => void;
    parse: (data: unknown, version: number) => T | null;
}): () => void {
    const raw = options.storage.getString(options.key);
    if (raw !== undefined) {
        try {
            const envelope: unknown = JSON.parse(raw);
            if (isEnvelope(envelope)) {
                const parsed = options.parse(envelope.data, envelope.version);
                if (parsed !== null) {
                    runInAction(() => options.apply(parsed));
                }
            }
        } catch {
            // Ignore corrupt stored data; keep store defaults.
        }
    }

    return reaction(
        options.snapshot,
        (data) => {
            options.storage.setString(
                options.key,
                JSON.stringify({ version: options.version, data }),
            );
        },
        { equals: compareStructural, fireImmediately: false },
    );
}
