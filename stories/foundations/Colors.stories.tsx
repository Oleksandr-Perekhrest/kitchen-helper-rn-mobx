// outsource dependencies
import { View, StyleSheet } from "react-native";
import type { Meta, StoryObj } from "@storybook/react-native-web-vite";

// local dependencies
import { Text } from "../../src/ui";
import { radii, useTheme } from "../../src/theme";
import type { TimerKind, ThemeColors } from "../../src/theme";

type SemanticKey = Exclude<keyof ThemeColors, "timer">;

const styles = StyleSheet.create({
    root: { gap: 24 },
    section: { gap: 12 },
    swatches: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
    swatch: { gap: 4 },
    square: { width: 64, height: 64, borderRadius: radii.md, borderWidth: 1 },
});

function Swatch({ name, value }: { name: string; value: string }) {
    const { colors } = useTheme();
    return (
        <View style={styles.swatch}>
            <View
                style={[
                    styles.square,
                    { backgroundColor: value, borderColor: colors.border },
                ]}
            />
            <Text variant="label">{name}</Text>
            <Text variant="caption" tone="textMuted">
                {value}
            </Text>
        </View>
    );
}

function Palette() {
    const { colors } = useTheme();
    const semanticKeys = (Object.keys(colors) as (keyof ThemeColors)[]).filter(
        (k): k is SemanticKey => k !== "timer",
    );
    const timerKeys = Object.keys(colors.timer) as TimerKind[];

    return (
        <View style={styles.root}>
            <View style={styles.section}>
                <Text variant="headline">Semantic</Text>
                <View style={styles.swatches}>
                    {semanticKeys.map((key) => (
                        <Swatch
                            key={key}
                            name={key}
                            value={colors[key] as string}
                        />
                    ))}
                </View>
            </View>
            <View style={styles.section}>
                <Text variant="headline">Timer kinds</Text>
                <View style={styles.swatches}>
                    {timerKeys.map((kind) => (
                        <Swatch
                            key={kind}
                            name={kind}
                            value={colors.timer[kind]}
                        />
                    ))}
                </View>
            </View>
        </View>
    );
}

const meta = {
    title: "Foundations/Colors",
    component: Palette,
} satisfies Meta<typeof Palette>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PaletteStory: Story = {};
PaletteStory.storyName = "Palette";
