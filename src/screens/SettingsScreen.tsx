// outsource dependencies
import { observer } from "mobx-react-lite";
import { View, StyleSheet } from "react-native";

// local dependencies
import { useTheme } from "../theme";
import { Text, SegmentedControl } from "../ui";
import type { ThemePreference } from "../theme";
import { useStores } from "../stores/StoreProvider";
import type { RootStackScreenProps } from "../navigation/types";

type Props = RootStackScreenProps<"Settings">;

const THEME_OPTIONS: ReadonlyArray<{ value: ThemePreference; label: string }> =
    [
        { value: "system", label: "System" },
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
    ];

export const SettingsScreen = observer(function SettingsScreenComponent(
    _props: Props,
) {
    const { colors, spacing } = useTheme();
    const { settings } = useStores();
    return (
        <View
            style={[
                styles.container,
                { backgroundColor: colors.background, padding: spacing[16] },
            ]}
        >
            <Text variant="headline">Settings</Text>
            <View style={styles.section}>
                <Text variant="label">Theme</Text>
                <SegmentedControl
                    options={THEME_OPTIONS}
                    value={settings.themePreference}
                    onChange={(value) => settings.setThemePreference(value)}
                    accessibilityLabel="Theme"
                />
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: { flex: 1 },
    section: { gap: 8, marginTop: 16 },
});
