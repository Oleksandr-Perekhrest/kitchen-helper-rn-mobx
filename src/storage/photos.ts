// Only the file name is stored in recipes because the iOS app container path
// changes between installs and updates; the full path is reconstructed at runtime.

// outsource dependencies
import { Dirs, FileSystem } from "react-native-file-access";

// local dependencies
import { createId } from "../domain/recipeForm";

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

export function photoFileUri(fileName: string): string {
    return `file://${PHOTOS_DIR}/${fileName}`;
}
