// outsource dependencies
import { View, Image, Pressable, StyleSheet } from "react-native";
import { Star, Clock, Users, UtensilsCrossed } from "lucide-react-native";

// local dependencies
import { Icon } from "./Icon";
import { Text } from "./Text";
import { radii, useTheme, typography } from "../theme";

export type RecipeCardProps = {
    title: string;
    duration?: string;
    servings: string;
    photoUri?: string;
    favorite: boolean;
    onPress: () => void;
    accessibilityLabel: string;
};

export function RecipeCard({
    title,
    duration,
    servings,
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
                {duration !== undefined && (
                    <View
                        style={[
                            styles.durationPill,
                            { backgroundColor: colors.surface },
                        ]}
                        accessible={false}
                        importantForAccessibility="no-hide-descendants"
                    >
                        <Icon
                            icon={Clock}
                            size={14}
                            tone="textMuted"
                            strokeWidth={2}
                        />
                        <Text variant="caption" tone="textMuted">
                            {duration}
                        </Text>
                    </View>
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
                <Text
                    variant="buttonSm"
                    numberOfLines={2}
                    ellipsizeMode="tail"
                    style={styles.titleText}
                >
                    {title}
                </Text>
                <View style={styles.metaRow}>
                    <Icon
                        icon={Users}
                        size={13}
                        tone="textMuted"
                        strokeWidth={2}
                    />
                    <Text
                        variant="caption"
                        tone="textMuted"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {servings}
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
    durationPill: {
        position: "absolute",
        bottom: 8,
        left: 8,
        height: 28,
        paddingHorizontal: 8,
        borderRadius: radii.full,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
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
    titleText: {
        minHeight: typography.buttonSm.lineHeight * 2,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
});
