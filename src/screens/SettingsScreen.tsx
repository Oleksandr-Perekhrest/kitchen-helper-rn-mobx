// outsource dependencies
import { View, StyleSheet } from "react-native";

// local dependencies
import { Text } from "../ui";
import { useTheme } from "../theme";
import type { RootStackScreenProps } from "../navigation/types";

type Props = RootStackScreenProps<"Settings">;

export function SettingsScreen(_props: Props) {
    const { colors, spacing } = useTheme();
    return (
        <View
            style={[
                styles.container,
                { backgroundColor: colors.background, padding: spacing[16] },
            ]}
        >
            <Text variant="headline">Settings</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
});
