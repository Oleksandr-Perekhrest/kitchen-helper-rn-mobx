// outsource dependencies
import { View, StyleSheet } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { Info, TriangleAlert } from "lucide-react-native";

// local dependencies
import { Text } from "./Text";
import { useTheme } from "../theme";

export const BANNER_TONES = ["warning", "info"] as const;

export type BannerTone = (typeof BANNER_TONES)[number];

export type BannerProps = {
    /** Main message text. */
    message: string;
    /** Optional title shown above the message in label variant. */
    title?: string;
    /** Visual tone. Defaults to `"warning"`. */
    tone?: BannerTone;
    /** Override the default leading icon (TriangleAlert for warning, Info for info). */
    icon?: LucideIcon;
};

export function Banner({
    message,
    title,
    tone = "warning",
    icon,
}: BannerProps) {
    const { colors } = useTheme();

    const isWarning = tone === "warning";
    const BannerIcon: LucideIcon = icon ?? (isWarning ? TriangleAlert : Info);

    const backgroundColor = isWarning ? colors.warningSoft : colors.primarySoft;
    const borderColor = isWarning ? colors.warningBorder : colors.primarySoft;
    const iconColor = isWarning ? colors.onWarningSoft : colors.primary;
    const textStyle = isWarning ? { color: colors.onWarningSoft } : undefined;

    return (
        <View
            role={isWarning ? "alert" : "none"}
            style={[styles.container, { backgroundColor, borderColor }]}
        >
            <BannerIcon
                size={20}
                color={iconColor}
                strokeWidth={2}
                accessible={false}
                importantForAccessibility="no-hide-descendants"
            />
            <View style={styles.content}>
                {title !== undefined && (
                    <Text variant="label" style={textStyle}>
                        {title}
                    </Text>
                )}
                <Text variant="body" style={textStyle}>
                    {message}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 16,
        borderWidth: 1,
    },
    content: {
        flex: 1,
        gap: 2,
    },
});
