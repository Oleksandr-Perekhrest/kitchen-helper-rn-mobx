// outsource dependencies
import { View, StyleSheet } from "react-native";
import type { Meta, StoryObj } from "@storybook/react-native-web-vite";

// local dependencies
import { Text } from "../../src/ui";
import { typography } from "../../src/theme";
import type { TypographyVariant } from "../../src/theme";

const SAMPLE = "Рецепти / Recipes";

const styles = StyleSheet.create({
    scale: { gap: 24 },
    row: { gap: 4 },
});

function TypographyScale() {
    return (
        <View style={styles.scale}>
            {(Object.keys(typography) as TypographyVariant[]).map((variant) => {
                const token = typography[variant];
                const label = `${variant} · ${token.fontSize}/${token.fontWeight}`;
                return (
                    <View key={variant} style={styles.row}>
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
