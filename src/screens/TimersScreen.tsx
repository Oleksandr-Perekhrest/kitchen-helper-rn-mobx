// outsource dependencies
import { useTranslation } from "react-i18next";
import { View, StyleSheet } from "react-native";

// local dependencies
import { Text } from "../ui";
import { useTheme } from "../theme";
import type { RootStackScreenProps } from "../navigation/types";

type Props = RootStackScreenProps<"Timers">;

export function TimersScreen(_props: Props) {
    const { t } = useTranslation();
    const { colors, spacing } = useTheme();
    return (
        <View
            style={[
                styles.container,
                { backgroundColor: colors.background, padding: spacing[16] },
            ]}
        >
            <Text variant="headline">{t("timers.title")}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
});
