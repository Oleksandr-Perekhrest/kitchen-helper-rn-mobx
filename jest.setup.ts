// outsource dependencies
import { jest } from "@jest/globals";
import { enableScreens } from "react-native-screens";
import mockSafeAreaContext from "react-native-safe-area-context/jest/mock";

// local dependencies
import { createMemoryStorage as mockCreateMemoryStorage } from "./src/storage/memoryStorage";

jest.mock("react-native-safe-area-context", () => mockSafeAreaContext);
// react-native-localize has no native module in Jest; use the official mock
jest.mock("react-native-localize", () =>
    jest.requireActual("react-native-localize/mock"),
);
// createMMKV's top-level import of react-native-nitro-modules crashes Jest
// (no native TurboModule); swap the adapter for an in-memory implementation.
jest.mock("./src/storage/mmkvStorage", () => ({
    createMmkvStorage: () => mockCreateMemoryStorage(),
}));
// react-native-image-picker ships TypeScript source with no prebuilt CJS output;
// mock it out so Jest doesn't have to compile it and tests stay fast.
jest.mock("react-native-image-picker", () => ({
    launchCamera: jest.fn(() => Promise.resolve({ didCancel: true })),
    launchImageLibrary: jest.fn(() => Promise.resolve({ didCancel: true })),
}));
// react-native-file-access has no native module in Jest; provide a fixed
// DocumentDir so src/storage/photos.ts can be imported and its module-level
// PHOTOS_DIR constant resolves without crashing.
jest.mock("react-native-file-access", () => ({
    Dirs: { DocumentDir: "/mock/documents" },
    FileSystem: {
        exists: jest.fn(() => Promise.resolve(true)),
        mkdir: jest.fn(() => Promise.resolve("/mock/documents/photos")),
        cp: jest.fn(() => Promise.resolve()),
        unlink: jest.fn(() => Promise.resolve()),
    },
}));

// Disable native screen components so NavigationContainer renders in Jest
enableScreens(false);
