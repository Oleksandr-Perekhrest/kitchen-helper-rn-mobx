// outsource dependencies
import { fn } from "storybook/test";
import { View, StyleSheet } from "react-native";
import { Camera, Trash2, ArrowRight } from "lucide-react-native";
import type { Meta, StoryObj } from "@storybook/react-native-web-vite";

// local dependencies
import { Button, BUTTON_VARIANTS } from "../../src/ui";

const meta = {
    title: "UI/Button",
    component: Button,
    args: {
        label: "Зберегти рецепт",
        variant: "primary",
        size: "lg",
        onPress: fn(),
    },
    argTypes: {
        variant: {
            control: "select",
            options: BUTTON_VARIANTS,
        },
        size: {
            control: "select",
            options: ["lg", "md"],
        },
        icon: { control: false },
    },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
    args: { label: "Назад", variant: "secondary" },
};

export const Soft: Story = {
    args: { label: "Камера", variant: "soft", size: "md", icon: Camera },
};

export const Neutral: Story = {
    args: { label: "+1 хв", variant: "neutral", size: "md" },
};

export const Danger: Story = {
    args: { label: "Видалити", variant: "danger", size: "md", icon: Trash2 },
};

export const DangerText: Story = {
    args: {
        label: "Видалити рецепт",
        variant: "dangerText",
        size: "md",
        icon: Trash2,
    },
};

export const WithIcon: Story = {
    args: { label: "Далі", variant: "primary", size: "lg", icon: ArrowRight },
};

export const IconEnd: Story = {
    args: {
        label: "Далі",
        variant: "primary",
        size: "lg",
        icon: ArrowRight,
        iconPosition: "end",
    },
};

export const Disabled: Story = {
    args: { disabled: true },
};

const styles = StyleSheet.create({
    longLabelContainer: { width: 280 },
});

export const LongLabel: Story = {
    args: { label: "Повернути демо-рецепти до початкового стану" },
    decorators: [
        (Story) => (
            <View style={styles.longLabelContainer}>
                <Story />
            </View>
        ),
    ],
};
