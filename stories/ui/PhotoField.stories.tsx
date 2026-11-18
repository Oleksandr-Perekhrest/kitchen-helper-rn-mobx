// outsource dependencies
import { fn } from "storybook/test";
import { View, StyleSheet } from "react-native";
import type { Meta, StoryObj } from "@storybook/react-native-web-vite";

// local dependencies
import { Button, Banner, PhotoField } from "../../src/ui";

const meta = {
    title: "UI/PhotoField",
    component: PhotoField,
    args: {
        label: "Фото рецепта",
        cameraLabel: "Камера",
        galleryLabel: "Галерея",
        removeLabel: "Видалити фото",
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

export const Empty: Story = {};

export const WithPhoto: Story = {
    args: { photoUri: "https://picsum.photos/seed/recipe/640/480" },
};

export const Busy: Story = {
    args: { busy: true },
};

export const WithNotice: Story = {
    render: function Render(args) {
        return (
            <PhotoField
                {...args}
                notice={
                    <Banner
                        tone="info"
                        message="Фото зберігається лише на цьому пристрої."
                        actions={
                            <Button
                                label="Зрозуміло"
                                variant="secondary"
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
