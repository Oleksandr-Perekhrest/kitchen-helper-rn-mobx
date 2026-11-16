// outsource dependencies
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { View, StyleSheet } from "react-native";

// local dependencies
import { useTheme } from "../theme";
import { Text, SegmentedControl } from "../ui";
import type { ThemePreference } from "../theme";
import { LANGUAGE_NATIVE_NAMES } from "../i18n";
import { useStores } from "../stores/StoreProvider";
import type { RootStackScreenProps } from "../navigation/types";
import type { LanguagePreference } from "../stores/SettingsStore";

type Props = RootStackScreenProps<"Settings">;

export const SettingsScreen = observer(function SettingsScreenComponent(
    _props: Props,
) {
    const { t } = useTranslation();
    const { colors, spacing } = useTheme();
    const { settings } = useStores();

    const themeOptions: ReadonlyArray<{
        value: ThemePreference;
        label: string;
    }> = [
        { value: "system", label: t("settings.theme.system") },
        { value: "light", label: t("settings.theme.light") },
        { value: "dark", label: t("settings.theme.dark") },
    ];

    const languageOptions: ReadonlyArray<{
        value: LanguagePreference;
        label: string;
    }> = [
        { value: "system", label: t("settings.language.system") },
        { value: "en", label: LANGUAGE_NATIVE_NAMES.en },
        { value: "uk", label: LANGUAGE_NATIVE_NAMES.uk },
    ];

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: colors.background, padding: spacing[16] },
            ]}
        >
            <Text variant="headline">{t("settings.title")}</Text>
            <View style={styles.section}>
                <Text variant="label">{t("settings.theme.label")}</Text>
                <SegmentedControl
                    options={themeOptions}
                    value={settings.themePreference}
                    onChange={(value) => settings.setThemePreference(value)}
                    accessibilityLabel={t("settings.theme.label")}
                />
            </View>
            <View style={styles.section}>
                <Text variant="label">{t("settings.language.label")}</Text>
                <SegmentedControl
                    options={languageOptions}
                    value={settings.language}
                    onChange={(value) => settings.setLanguage(value)}
                    accessibilityLabel={t("settings.language.label")}
                />
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: { flex: 1 },
    section: { gap: 8, marginTop: 16 },
});
