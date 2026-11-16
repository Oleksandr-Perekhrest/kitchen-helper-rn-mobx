// outsource dependencies
import { View, StyleSheet } from "react-native";
import type { Meta, StoryObj } from "@storybook/react-native-web-vite";

// local dependencies
import { Text } from "../../src/ui";
import { radii, spacing, useTheme } from "../../src/theme";

const styles = StyleSheet.create({
    root: { gap: 12 },
    row: { flexDirection: "row", alignItems: "center", gap: 12 },
    swatches: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
    radiusSwatch: { gap: 6, alignItems: "center" },
    radiusSquare: { width: 72, height: 72 },
});

function SpacingScale() {
    const { colors } = useTheme();
    const spacingEntries = Object.entries(spacing) as [string, number][];
    return (
        <View style={styles.root}>
            {spacingEntries.map(([key, value]) => (
                <View key={key} style={styles.row}>
                    <Text variant="caption">{`spacing ${key}`}</Text>
                    <View
                        style={{
                            height: value,
                            width: value,
                            backgroundColor: colors.primary,
                        }}
                    />
                </View>
            ))}
        </View>
    );
}

function RadiiScale() {
    const { colors } = useTheme();
    const radiiKeys = Object.keys(radii) as (keyof typeof radii)[];
    return (
        <View style={styles.swatches}>
            {radiiKeys.map((key) => {
                const value = radii[key];
                return (
                    <View key={key} style={styles.radiusSwatch}>
                        <View
                            style={[
                                styles.radiusSquare,
                                {
                                    backgroundColor: colors.primarySoft,
                                    borderRadius: value,
                                },
                            ]}
                        />
                        <Text variant="caption">{`${key} · ${value}`}</Text>
                    </View>
                );
            })}
        </View>
    );
}

const meta = {
    title: "Foundations/Spacing and radii",
    component: SpacingScale,
} satisfies Meta<typeof SpacingScale>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Spacing: Story = {};

export const Radii: Story = { render: () => <RadiiScale /> };
