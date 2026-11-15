// outsource dependencies
import { fn } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-native-web-vite";
import { X, Star, Heart, Timer, Pause, ArrowLeft } from "lucide-react-native";

// local dependencies
import { IconButton, ICON_BUTTON_VARIANTS } from "../../src/ui";

const meta = {
    title: "UI/IconButton",
    component: IconButton,
    args: {
        icon: ArrowLeft,
        accessibilityLabel: "Back",
        onPress: fn(),
    },
    argTypes: {
        icon: { control: false },
        iconTone: { control: false },
        variant: {
            control: "select",
            options: ICON_BUTTON_VARIANTS,
        },
        size: {
            control: "select",
            options: ["md", "lg"],
        },
        badge: { control: "number" },
    },
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Subtle: Story = {
    args: { icon: ArrowLeft, accessibilityLabel: "Back" },
};

export const Elevated: Story = {
    args: {
        icon: Heart,
        accessibilityLabel: "Favorite",
        variant: "elevated",
    },
};

export const FavoriteActive: Story = {
    args: {
        icon: Star,
        accessibilityLabel: "Favorite",
        variant: "elevated",
        iconTone: "primary",
    },
};

export const Ghost: Story = {
    args: { icon: X, accessibilityLabel: "Remove", variant: "ghost" },
};

export const WithBadge: Story = {
    args: { icon: Timer, accessibilityLabel: "Timers", badge: 3 },
};

export const Large: Story = {
    args: { icon: Pause, accessibilityLabel: "Pause", size: "lg" },
};

export const Disabled: Story = {
    args: { disabled: true },
};
