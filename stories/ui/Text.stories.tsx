// outsource dependencies
import { View, StyleSheet } from "react-native";
import type { Meta, StoryObj } from "@storybook/react-native-web-vite";

// local dependencies
import { Text, TEXT_TONES } from "../../src/ui";
import { radii, useTheme, typography } from "../../src/theme";

const meta = {
    title: "UI/Text",
    component: Text,
    args: {
        children: "Наріж буряк соломкою",
        variant: "body",
        tone: "text",
    },
    argTypes: {
        variant: {
            control: "select",
            options: Object.keys(typography),
        },
        tone: {
            control: "select",
            options: TEXT_TONES,
        },
        children: {
            control: "text",
        },
    },
} satisfies Meta<typeof Text>;

export default meta;

type Story = StoryObj<typeof meta>;

const styles = StyleSheet.create({
    onPrimaryWrapper: { padding: 16, borderRadius: radii.md },
});

export const Default: Story = {};

export const Muted: Story = {
    args: { tone: "textMuted" },
};

export const Primary: Story = {
    args: { tone: "primary" },
};

export const Danger: Story = {
    args: { tone: "danger" },
};

export const OnPrimary: Story = {
    args: { tone: "onPrimary" },
    decorators: [
        (Story) => {
            const { colors } = useTheme();
            return (
                <View
                    style={[
                        styles.onPrimaryWrapper,
                        { backgroundColor: colors.primary },
                    ]}
                >
                    <Story />
                </View>
            );
        },
    ],
};

export const LongText: Story = {
    args: {
        children:
            "Спочатку добре промий буряк під холодною проточною водою, потім очисти від шкірки, наріж тонкою соломкою або натри на крупній тертці, після чого обсмаж на олії разом із цибулею та морквою до повної м'якості, щоб отримати смачну і ароматну основу для справжнього борщу.",
    },
};
