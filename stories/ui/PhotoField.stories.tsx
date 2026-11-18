// outsource dependencies
import { fn } from "storybook/test";
import { useTranslation } from "react-i18next";
import { View, StyleSheet } from "react-native";
import type { Meta, StoryObj } from "@storybook/react-native-web-vite";

// local dependencies
import { Button, Banner, PhotoField } from "../../src/ui";

const meta = {
    title: "UI/PhotoField",
    component: PhotoField,
    args: {
        label: "Dish photo",
        cameraLabel: "Camera",
        galleryLabel: "Gallery",
        removeLabel: "Remove photo",
        onCamera: fn(),
        onGallery: fn(),
        onRemove: fn(),
    },
    decorators: [
        (Story) => (
            <View style={styles.wrapper}>
                <Story />
            </View>
        ),
    ],
} satisfies Meta<typeof PhotoField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
    render: function Render(args) {
        const { t } = useTranslation();
        return (
            <PhotoField
                {...args}
                label={t("recipeForm.photo.label")}
                cameraLabel={t("recipeForm.photo.camera")}
                galleryLabel={t("recipeForm.photo.gallery")}
                removeLabel={t("recipeForm.photo.remove")}
            />
        );
    },
};

export const WithPhoto: Story = {
    render: function Render(args) {
        const { t } = useTranslation();
        return (
            <PhotoField
                {...args}
                label={t("recipeForm.photo.label")}
                photoUri="https://picsum.photos/seed/recipe/640/480"
                cameraLabel={t("recipeForm.photo.camera")}
                galleryLabel={t("recipeForm.photo.gallery")}
                removeLabel={t("recipeForm.photo.remove")}
            />
        );
    },
};

export const Busy: Story = {
    render: function Render(args) {
        const { t } = useTranslation();
        return (
            <PhotoField
                {...args}
                label={t("recipeForm.photo.label")}
                busy
                cameraLabel={t("recipeForm.photo.camera")}
                galleryLabel={t("recipeForm.photo.gallery")}
                removeLabel={t("recipeForm.photo.remove")}
            />
        );
    },
};

export const WithNotice: Story = {
    render: function Render(args) {
        const { t } = useTranslation();
        return (
            <PhotoField
                {...args}
                label={t("recipeForm.photo.label")}
                cameraLabel={t("recipeForm.photo.camera")}
                galleryLabel={t("recipeForm.photo.gallery")}
                removeLabel={t("recipeForm.photo.remove")}
                notice={
                    <Banner
                        tone="warning"
                        message={t("recipeForm.photo.errors.permission")}
                        actions={
                            <Button
                                label={t("recipeForm.photo.openSettings")}
                                variant="secondary"
                                size="md"
                                onPress={() => {}}
                            />
                        }
                    />
                }
            />
        );
    },
};

const styles = StyleSheet.create({
    wrapper: {
        width: 320,
    },
});
