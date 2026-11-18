// outsource dependencies
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { View, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// local dependencies
import { useTheme } from "../theme";
import type { ThemePreference } from "../theme";
import { LANGUAGE_NATIVE_NAMES } from "../i18n";
import { useStores } from "../stores/StoreProvider";
import { Text, Button, Switch, SegmentedControl } from "../ui";
import type { RootStackScreenProps } from "../navigation/types";
import type { LanguagePreference } from "../stores/SettingsStore";

type Props = RootStackScreenProps<"Settings">;

export const SettingsScreen = observer(function SettingsScreenComponent(
    _props: Props,
) {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const { colors, spacing } = useTheme();
    const insets = useSafeAreaInsets();
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
        <ScrollView
            style={[styles.scroll, { backgroundColor: colors.background }]}
            contentContainerStyle={{
                padding: spacing[16],
                paddingBottom: spacing[16] + insets.bottom,
            }}
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
            <View style={styles.section}>
                <View style={styles.voiceRow}>
                    <Text variant="label">{t("settings.voice.label")}</Text>
                    <Switch
                        value={settings.voiceEnabled}
                        onValueChange={(value) =>
                            settings.setVoiceEnabled(value)
                        }
                        accessibilityLabel={t("settings.voice.label")}
                    />
                </View>
                <Text variant="caption" tone="textMuted">
                    {t("settings.voice.description")}
                </Text>
            </View>
            {__DEV__ && (
                <View style={styles.section}>
                    <Button
                        label="UI gallery"
                        variant="neutral"
                        onPress={() => navigation.navigate("UiGallery")}
                    />
                </View>
            )}
        </ScrollView>
    );
});

const styles = StyleSheet.create({
    scroll: { flex: 1 },
    section: { gap: 8, marginTop: 16 },
    voiceRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
});
