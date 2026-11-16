// local dependencies
import type { KeyValueStorage } from "./types";

export function createMemoryStorage(
    initial?: Record<string, string>,
): KeyValueStorage {
    const store = new Map<string, string>(
        initial ? Object.entries(initial) : [],
    );
    return {
        getString: (key) => store.get(key),
        setString: (key, value) => store.set(key, value),
        remove: (key) => store.delete(key),
    };
}
