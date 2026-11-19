// outsource dependencies
import { FileSystem } from "react-native-file-access";
import { it, jest, expect, describe, beforeEach } from "@jest/globals";

// local dependencies
import {
    savePhoto,
    deletePhoto,
    deleteUnreferencedPhotos,
} from "../../src/storage/photos";

jest.mock("react-native-file-access", () => {
    // outsource dependencies
    // react-native-file-access sorts before @jest/globals by line length so the
    // imported jest binding is uninitialized when this hoisted factory runs; use require.
    const { jest: j } = require("@jest/globals");
    return {
        Dirs: { DocumentDir: "/mock/documents" },
        FileSystem: {
            exists: j.fn(() => Promise.resolve(true)),
            mkdir: j.fn(() => Promise.resolve("/mock/documents/photos")),
            cp: j.fn(() => Promise.resolve()),
            unlink: j.fn(() => Promise.resolve()),
            ls: j.fn(() => Promise.resolve([])),
        },
    };
});

const mockExists = jest.mocked(FileSystem.exists);
const mockMkdir = jest.mocked(FileSystem.mkdir);
const mockCp = jest.mocked(FileSystem.cp);
const mockUnlink = jest.mocked(FileSystem.unlink);
const mockLs = jest.mocked(FileSystem.ls);

beforeEach(() => {
    jest.clearAllMocks();
});

// ─── savePhoto ────────────────────────────────────────────────────────────────

describe("savePhoto", () => {
    it("returns a file name ending in .jpg with no path separator", async () => {
        const name = await savePhoto("file:///tmp/input.jpg");
        expect(name).toMatch(/^[^/]+\.jpg$/);
    });

    it("copies the source file with the file:// prefix stripped", async () => {
        await savePhoto("file:///some/path/input.jpg");
        expect(mockCp).toHaveBeenCalledWith(
            "/some/path/input.jpg",
            expect.any(String),
        );
    });

    it("creates the photos directory when it does not exist", async () => {
        mockExists.mockResolvedValueOnce(false);
        await savePhoto("file:///tmp/input.jpg");
        expect(mockMkdir).toHaveBeenCalledTimes(1);
    });
});

// ─── deletePhoto ──────────────────────────────────────────────────────────────

describe("deletePhoto", () => {
    it("does not throw when unlink fails", async () => {
        mockUnlink.mockRejectedValueOnce(new Error("disk error"));
        await expect(deletePhoto("photo.jpg")).resolves.toBeUndefined();
    });

    it("does not call unlink when the file does not exist", async () => {
        mockExists.mockResolvedValueOnce(false);
        await deletePhoto("photo.jpg");
        expect(mockUnlink).not.toHaveBeenCalled();
    });
});

// ─── deleteUnreferencedPhotos ─────────────────────────────────────────────────

describe("deleteUnreferencedPhotos", () => {
    it("deletes only unreferenced files", async () => {
        mockLs.mockResolvedValueOnce(["a.jpg", "b.jpg", "c.jpg"]);
        await deleteUnreferencedPhotos(new Set(["a.jpg"]));
        expect(mockUnlink).toHaveBeenCalledTimes(2);
        expect(mockUnlink).toHaveBeenCalledWith(
            expect.stringContaining("b.jpg"),
        );
        expect(mockUnlink).toHaveBeenCalledWith(
            expect.stringContaining("c.jpg"),
        );
    });

    it("does nothing when the directory does not exist", async () => {
        mockExists.mockResolvedValueOnce(false);
        await deleteUnreferencedPhotos(new Set(["a.jpg"]));
        expect(mockLs).not.toHaveBeenCalled();
        expect(mockUnlink).not.toHaveBeenCalled();
    });

    it("does not throw when listing fails", async () => {
        mockLs.mockRejectedValueOnce(new Error("permission denied"));
        await expect(
            deleteUnreferencedPhotos(new Set()),
        ).resolves.toBeUndefined();
    });
});
