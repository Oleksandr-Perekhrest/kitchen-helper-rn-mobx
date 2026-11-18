// outsource dependencies
import { useTranslation } from "react-i18next";
import type { Ref, ReactNode, ElementRef } from "react";
import { View, Linking, TextInput, StyleSheet } from "react-native";
import { Controller, useController, useFormContext } from "react-hook-form";

// local dependencies
import { TAGS } from "../../domain/recipe";
import { usePhotoPicker } from "./usePhotoPicker";
import { photoFileUri } from "../../storage/photos";
import { isFormErrorKey } from "../../domain/recipeForm";
import type { PhotoPickerNotice } from "./usePhotoPicker";
import type { RecipeFormValues } from "../../domain/recipeForm";
import { Chip, Text, Banner, Button, TextField, PhotoField } from "../../ui";

type TextInputRef = Ref<ElementRef<typeof TextInput>>;

function noticeNode(
    notice: PhotoPickerNotice | undefined,
    t: ReturnType<typeof useTranslation>["t"],
): ReactNode {
    if (notice === undefined) return undefined;
    if (notice === "permission") {
        return (
            <Banner
                tone="warning"
                message={t("recipeForm.photo.errors.permission")}
                actions={
                    <Button
                        label={t("recipeForm.photo.openSettings")}
                        variant="secondary"
                        size="md"
                        onPress={() => {
                            void Linking.openSettings();
                        }}
                    />
                }
            />
        );
    }
    if (notice === "cameraUnavailable") {
        return (
            <Banner
                tone="warning"
                message={t("recipeForm.photo.errors.cameraUnavailable")}
            />
        );
    }
    return (
        <Banner tone="warning" message={t("recipeForm.photo.errors.generic")} />
    );
}

function PhotoFieldController() {
    const { t } = useTranslation();
    const { control } = useFormContext<RecipeFormValues>();
    const { field } = useController({ name: "photoFile", control });
    const photoUri =
        field.value !== undefined ? photoFileUri(field.value) : undefined;
    const { busy, notice, onCamera, onGallery, onRemove } = usePhotoPicker(
        (v) => field.onChange(v),
    );

    return (
        <PhotoField
            label={t("recipeForm.photo.label")}
            photoUri={photoUri}
            busy={busy}
            cameraLabel={t("recipeForm.photo.camera")}
            galleryLabel={t("recipeForm.photo.gallery")}
            removeLabel={t("recipeForm.photo.remove")}
            onCamera={onCamera}
            onGallery={onGallery}
            onRemove={onRemove}
            notice={noticeNode(notice, t)}
        />
    );
}

export function BasicsStep() {
    const { t } = useTranslation();
    const { control } = useFormContext<RecipeFormValues>();

    return (
        <View style={styles.container}>
            <PhotoFieldController />
            <Controller
                name="title"
                control={control}
                render={({ field, fieldState }) => {
                    const errorMsg = fieldState.error?.message;
                    return (
                        <TextField
                            ref={field.ref as TextInputRef}
                            label={t("recipeForm.fields.title")}
                            value={field.value}
                            onChangeText={field.onChange}
                            onBlur={field.onBlur}
                            returnKeyType="next"
                            error={
                                errorMsg !== undefined &&
                                isFormErrorKey(errorMsg)
                                    ? t(errorMsg)
                                    : undefined
                            }
                        />
                    );
                }}
            />
            <Controller
                name="caloriesPerServing"
                control={control}
                render={({ field, fieldState }) => {
                    const errorMsg = fieldState.error?.message;
                    return (
                        <TextField
                            ref={field.ref as TextInputRef}
                            label={t("recipeForm.fields.caloriesPerServing")}
                            value={field.value}
                            onChangeText={field.onChange}
                            onBlur={field.onBlur}
                            keyboardType="number-pad"
                            placeholder={t("recipeForm.fields.caloriesHint")}
                            error={
                                errorMsg !== undefined &&
                                isFormErrorKey(errorMsg)
                                    ? t(errorMsg)
                                    : undefined
                            }
                        />
                    );
                }}
            />
            <Controller
                name="tags"
                control={control}
                render={({ field, fieldState }) => {
                    const errorMsg = fieldState.error?.message;
                    return (
                        <View>
                            <Text variant="label">
                                {t("recipeForm.fields.tags")}
                            </Text>
                            <View
                                role="group"
                                aria-label={t("recipeForm.fields.tags")}
                                style={styles.tagsWrap}
                            >
                                {TAGS.map((tag) => (
                                    <Chip
                                        key={tag}
                                        label={t(`tags.${tag}`)}
                                        selected={field.value.includes(tag)}
                                        role="checkbox"
                                        onPress={() => {
                                            const current = field.value;
                                            const next = current.includes(tag)
                                                ? current.filter(
                                                      (v) => v !== tag,
                                                  )
                                                : [...current, tag];
                                            field.onChange(next);
                                        }}
                                    />
                                ))}
                            </View>
                            {errorMsg !== undefined &&
                                isFormErrorKey(errorMsg) && (
                                    <Text variant="caption" tone="danger">
                                        {t(errorMsg)}
                                    </Text>
                                )}
                        </View>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 20,
        marginTop: 24,
    },
    tagsWrap: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 6,
    },
});
