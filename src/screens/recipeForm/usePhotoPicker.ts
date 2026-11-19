// outsource dependencies
import { useState } from "react";
import type { ImagePickerResponse } from "react-native-image-picker";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";

// local dependencies
import { savePhoto } from "../../storage/photos";

export type PhotoPickerNotice = "permission" | "cameraUnavailable" | "generic";

export type UsePhotoPickerResult = {
    busy: boolean;
    notice: PhotoPickerNotice | undefined;
    onCamera: () => void;
    onGallery: () => void;
    onRemove: () => void;
};

export function usePhotoPicker(
    onChange: (value: string | undefined) => void,
): UsePhotoPickerResult {
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState<PhotoPickerNotice | undefined>(
        undefined,
    );

    async function handlePick(response: ImagePickerResponse): Promise<void> {
        if (response.didCancel === true) return;

        if (response.errorCode !== undefined) {
            if (response.errorCode === "permission") {
                setNotice("permission");
            } else if (response.errorCode === "camera_unavailable") {
                setNotice("cameraUnavailable");
            } else {
                setNotice("generic");
            }
            return;
        }

        const uri = response.assets?.[0]?.uri;
        if (uri === undefined) {
            setNotice("generic");
            return;
        }

        setBusy(true);
        try {
            const fileName = await savePhoto(uri);
            onChange(fileName);
        } catch {
            setNotice("generic");
        } finally {
            setBusy(false);
        }
    }
    function onCamera(): void {
        setNotice(undefined);
        void launchCamera({
            mediaType: "photo",
            maxWidth: 1600,
            maxHeight: 1600,
            quality: 0.8,
        })
            .then(handlePick)
            .catch(() => setNotice("generic"));
    }

    function onGallery(): void {
        setNotice(undefined);
        void launchImageLibrary({
            mediaType: "photo",
            maxWidth: 1600,
            maxHeight: 1600,
            quality: 0.8,
        })
            .then(handlePick)
            .catch(() => setNotice("generic"));
    }
    // The form never deletes photo files here: the store deletes the old file when
    // the recipe is saved, and unreferenced files will be cleaned up separately.
    function onRemove(): void {
        onChange(undefined);
    }

    return { busy, notice, onCamera, onGallery, onRemove };
}
