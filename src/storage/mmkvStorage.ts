// outsource dependencies
import { createMMKV } from "react-native-mmkv";

// local dependencies
import type { KeyValueStorage } from "./types";

export function createMmkvStorage(id = "cookalong"): KeyValueStorage {
    const mmkv = createMMKV({ id });
    return {
        getString: (key) => mmkv.getString(key),
        setString: (key, value) => mmkv.set(key, value),
        remove: (key) => mmkv.remove(key),
    };
}
