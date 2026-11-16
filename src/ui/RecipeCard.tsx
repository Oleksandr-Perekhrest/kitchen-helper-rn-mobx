// outsource dependencies
import type { LucideIcon } from "lucide-react-native";
import { Star, UtensilsCrossed } from "lucide-react-native";
import { View, Image, Pressable, StyleSheet } from "react-native";

// local dependencies
import { Icon } from "./Icon";
import { Text } from "./Text";
import { radii, useTheme } from "../theme";

export type RecipeCardProps = {
    title: string;
    meta: string;
    metaIcon?: LucideIcon;
    photoUri?: string;
    favorite: boolean;
    /** Accessibility text for the favorite badge; included in the card's accessibilityLabel. */
    favoriteLabel: string;
    onPress: () => void;
    accessibilityLabel: string;
};

export function RecipeCard({
    title,
    meta,
    metaIcon,
    photoUri,
    favorite,
    onPress,
    accessibilityLabel,
}: RecipeCardProps) {
    const { colors } = useTheme();

    return (
        <Pressable
            onPress={onPress}
            role="button"
            aria-label={accessibilityLabel}
            style={({ pressed }) => [
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && styles.pressed,
            ]}
        >
            <View
                style={[
                    styles.imageContainer,
                    { backgroundColor: colors.primarySoft },
                ]}
            >
                {photoUri !== undefined && (
                    <Image
                        source={{ uri: photoUri }}
                        style={styles.image}
                        resizeMode="cover"
                        accessible={false}
                    />
                )}
                {photoUri === undefined && (
                    <Icon
                        icon={UtensilsCrossed}
                        size={32}
                        tone="primary"
                        strokeWidth={2}
                    />
                )}
                {favorite && (
                    <View
                        style={[
                            styles.favBadge,
                            { backgroundColor: colors.surface },
                        ]}
                        accessible={false}
                        importantForAccessibility="no-hide-descendants"
                    >
                        <Star
                            size={16}
                            color={colors.primary}
                            fill={colors.primary}
                            strokeWidth={2}
                            accessible={false}
                            importantForAccessibility="no-hide-descendants"
                        />
                    </View>
                )}
            </View>
            <View style={styles.info}>
                <Text variant="buttonSm" numberOfLines={2}>
                    {title}
                </Text>
                <View style={styles.metaRow}>
                    {metaIcon !== undefined && (
                        <Icon
                            icon={metaIcon}
                            size={13}
                            tone="textMuted"
                            strokeWidth={2}
                        />
                    )}
                    <Text variant="caption" tone="textMuted" numberOfLines={1}>
                        {meta}
                    </Text>
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderRadius: radii.lg,
        overflow: "hidden",
    },
    pressed: {
        opacity: 0.85,
    },
    imageContainer: {
        height: 112,
        alignItems: "center",
        justifyContent: "center",
    },
    image: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    favBadge: {
        position: "absolute",
        top: 8,
        right: 8,
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    info: {
        paddingTop: 10,
        paddingHorizontal: 12,
        paddingBottom: 12,
        gap: 4,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
});
