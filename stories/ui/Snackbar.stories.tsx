// outsource dependencies
import { fn } from "storybook/test";
import { View, StyleSheet } from "react-native";
import type { Meta, StoryObj } from "@storybook/react-native-web-vite";

// local dependencies
import { Snackbar } from "../../src/ui/Snackbar";

const meta = {
    title: "UI/Snackbar",
    component: Snackbar,
    args: {
        message: "Таймер готовий",
        actionLabel: "Скасувати",
        onAction: fn(),
    },
    render: function Render(args) {
        return (
            <View style={styles.container}>
                <Snackbar {...args} />
            </View>
        );
    },
} satisfies Meta<typeof Snackbar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithAction: Story = {};

export const WithoutAction: Story = {
    args: {
        actionLabel: undefined,
        onAction: undefined,
    },
};

export const LongMessage: Story = {
    args: {
        message:
            "Варіння 20:00 готове — вода може википіти, подивіться на плиту та скиньте таймер.",
    },
};

const styles = StyleSheet.create({
    container: {
        width: 360,
    },
});
