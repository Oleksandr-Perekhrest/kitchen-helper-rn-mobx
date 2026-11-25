// outsource dependencies
import { View, Pressable, StyleSheet } from "react-native";

// local dependencies
import { Text } from "./Text";
import { radii, useTheme } from "../theme";

export type SnackbarProps = {
    /** Main message shown on the inverse surface. */
    message: string;
    /** Optional action button label. Rendered only when both label and handler are provided. */
    actionLabel?: string;
    /** Called when the user presses the action button. */
    onAction?: () => void;
};

export function Snackbar({ message, actionLabel, onAction }: SnackbarProps) {
    const { colors } = useTheme();

    const showAction = actionLabel !== undefined && onAction !== undefined;

    return (
        <View
            role="alert"
            style={[styles.container, { backgroundColor: colors.text }]}
        >
            <Text
                variant="body"
                style={[styles.message, { color: colors.background }]}
            >
                {message}
            </Text>
            {showAction && (
                <Pressable
                    onPress={onAction}
                    role="button"
                    aria-label={actionLabel}
                    style={({ pressed }) => [
                        styles.action,
                        pressed && styles.actionPressed,
                    ]}
                >
                    <Text
                        variant="body"
                        style={[
                            styles.actionLabel,
                            { color: colors.background },
                        ]}
                    >
                        {actionLabel}
                    </Text>
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: radii.md,
    },
    message: {
        flex: 1,
    },
    action: {
        minHeight: 44,
        minWidth: 44,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 8,
    },
    actionPressed: {
        opacity: 0.7,
    },
    actionLabel: {
        fontWeight: "700",
    },
});
