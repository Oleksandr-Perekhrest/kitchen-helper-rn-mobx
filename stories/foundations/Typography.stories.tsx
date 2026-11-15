// outsource dependencies
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react-native-web-vite";

// local dependencies
import { Text } from "../../src/ui";
import { typography } from "../../src/theme";
import type { TypographyVariant } from "../../src/theme";

const SAMPLE = "Рецепти / Recipes";

const variantOrder: TypographyVariant[] = [
    "display",
    "step",
    "title",
    "headline",
    "timer",
    "body",
    "label",
    "caption",
];

function TypographyScale() {
    return (
        <View style={{ gap: 24 }}>
            {variantOrder.map((variant) => {
                const token = typography[variant];
                const label = `${variant} · ${token.fontSize}/${token.fontWeight}`;
                return (
                    <View key={variant} style={{ gap: 4 }}>
                        <Text variant="caption" tone="textMuted">
                            {label}
                        </Text>
                        <Text variant={variant}>{SAMPLE}</Text>
                    </View>
                );
            })}
        </View>
    );
}

const meta = {
    title: "Foundations/Typography",
    component: TypographyScale,
} satisfies Meta<typeof TypographyScale>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Scale: Story = {};
