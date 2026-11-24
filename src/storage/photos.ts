// Only the file name is stored in recipes because the iOS app container path
// changes between installs and updates; the full path is reconstructed at runtime.

// outsource dependencies
import { Dirs, FileSystem } from "react-native-file-access";

// local dependencies
import { createId } from "../domain/id";

const PHOTOS_DIR = `${Dirs.DocumentDir}/photos`;

function toPath(uri: string): string {
    return uri.startsWith("file://") ? uri.slice("file://".length) : uri;
}

export async function savePhoto(sourceUri: string): Promise<string> {
    const dirExists = await FileSystem.exists(PHOTOS_DIR);
    if (!dirExists) {
        await FileSystem.mkdir(PHOTOS_DIR);
    }
    const fileName = `${createId()}.jpg`;
    await FileSystem.cp(toPath(sourceUri), `${PHOTOS_DIR}/${fileName}`);
    return fileName;
}

export async function deletePhoto(fileName: string): Promise<void> {
    const path = `${PHOTOS_DIR}/${fileName}`;
    try {
        if (await FileSystem.exists(path)) {
            await FileSystem.unlink(path);
        }
    } catch (err) {
        console.warn("[photos] deletePhoto failed:", err);
    }
}

// Files become unreferenced when a form with a newly picked photo is discarded
// or the app is killed before saving; deleting at startup is safe because no form is open yet.
export async function deleteUnreferencedPhotos(
    referenced: ReadonlySet<string>,
): Promise<void> {
    try {
        const dirExists = await FileSystem.exists(PHOTOS_DIR);
        if (!dirExists) return;
        const files = await FileSystem.ls(PHOTOS_DIR);
        for (const file of files) {
            if (!referenced.has(file)) {
                await deletePhoto(file);
            }
        }
    } catch (err) {
        console.warn("[photos] deleteUnreferencedPhotos failed:", err);
    }
}

export function photoFileUri(fileName: string): string {
    return `file://${PHOTOS_DIR}/${fileName}`;
}
