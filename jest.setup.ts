// outsource dependencies
import { jest } from "@jest/globals";
import { enableScreens } from "react-native-screens";
import mockSafeAreaContext from "react-native-safe-area-context/jest/mock";

// local dependencies
import { createMemoryStorage as mockCreateMemoryStorage } from "./src/storage/memoryStorage";

jest.mock("react-native-safe-area-context", () => mockSafeAreaContext);
// createMMKV's top-level import of react-native-nitro-modules crashes Jest
// (no native TurboModule); swap the adapter for an in-memory implementation.
jest.mock("./src/storage/mmkvStorage", () => ({
    createMmkvStorage: () => mockCreateMemoryStorage(),
}));

// Disable native screen components so NavigationContainer renders in Jest
enableScreens(false);
