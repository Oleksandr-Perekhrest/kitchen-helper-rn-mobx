// outsource dependencies
import { View, StyleSheet } from "react-native";
import type { LucideIcon } from "lucide-react-native";

// local dependencies
import { Icon } from "./Icon";
import { Text } from "./Text";
import { Button } from "./Button";
import { useTheme } from "../theme";

export type EmptyStateProps = {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
};

export function EmptyState({
    icon,
    title,
    description,
    actionLabel,
    onAction,
}: EmptyStateProps) {
    const { colors } = useTheme();

    return (
        <View style={styles.container} importantForAccessibility="no">
            <View
                style={[
                    styles.iconCircle,
                    { backgroundColor: colors.primarySoft },
                ]}
            >
                <Icon icon={icon} size={28} tone="primary" />
            </View>
            <Text
                variant="headline"
                style={[styles.title, { color: colors.text }]}
            >
                {title}
            </Text>
            <Text variant="body" tone="textMuted" style={styles.description}>
                {description}
            </Text>
            {actionLabel !== undefined && onAction !== undefined && (
                <Button
                    label={actionLabel}
                    onPress={onAction}
                    variant="secondary"
                    style={styles.action}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        paddingHorizontal: 32,
        paddingTop: 48,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        marginTop: 16,
        textAlign: "center",
    },
    description: {
        marginTop: 8,
        textAlign: "center",
    },
    action: {
        marginTop: 24,
    },
});
