// outsource dependencies
import { Check } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { View, Pressable, StyleSheet } from "react-native";

// local dependencies
import { Icon } from "./Icon";
import { Text } from "./Text";
import { useTheme } from "../theme";
import type { TextTone } from "./Text";

export type ChipProps = {
    /** Label text. */
    label: string;
    /** Whether the chip is in the selected/active state. */
    selected?: boolean;
    /** Press handler. */
    onPress: () => void;
    /** Optional leading icon (16 px). When selected and no icon is provided, a Check icon is shown. */
    icon?: LucideIcon;
    /** Whether the chip is disabled. */
    disabled?: boolean;
    /** ARIA role for the pressable. Defaults to "checkbox". */
    role?: "checkbox" | "radio" | "button";
    /** Optional aria-label override. Defaults to label. */
    ariaLabel?: string;
};

export const INFO_CHIP_VARIANTS = ["filled", "outline"] as const;

export type InfoChipVariant = (typeof INFO_CHIP_VARIANTS)[number];

export type InfoChipProps = {
    /** Label text. */
    label: string;
    /** Optional leading icon (14 px). */
    icon?: LucideIcon;
    /** Visual style. Defaults to `"filled"`. */
    variant?: InfoChipVariant;
};

export function Chip({
    label,
    selected = false,
    onPress,
    icon,
    disabled = false,
    role = "checkbox",
    ariaLabel,
}: ChipProps) {
    const { colors } = useTheme();

    const LeadingIcon: LucideIcon | null = icon ?? (selected ? Check : null);
    const tone: TextTone = selected ? "onPrimary" : "text";
    const backgroundColor = selected ? colors.primary : "transparent";
    const borderColor = selected ? "transparent" : colors.borderStrong;

    return (
        <Pressable
            disabled={disabled}
            onPress={onPress}
            role={role}
            aria-label={ariaLabel ?? label}
            aria-checked={role !== "button" ? selected : undefined}
            aria-disabled={disabled}
            style={({ pressed }) => [
                styles.chip,
                { backgroundColor, borderColor },
                pressed && !disabled && styles.pressed,
                disabled && styles.disabled,
            ]}
        >
            {LeadingIcon !== null && (
                <Icon
                    icon={LeadingIcon}
                    size={16}
                    tone={tone}
                    strokeWidth={2}
                />
            )}
            <Text variant="label" tone={tone}>
                {label}
            </Text>
        </Pressable>
    );
}

export function InfoChip({ label, icon, variant = "filled" }: InfoChipProps) {
    const { colors } = useTheme();

    const isFilled = variant === "filled";
    const tone: TextTone = isFilled ? "text" : "textMuted";
    const backgroundColor = isFilled ? colors.surfaceAlt : "transparent";
    const borderColor = isFilled ? "transparent" : colors.border;

    return (
        <View style={[styles.infoChip, { backgroundColor, borderColor }]}>
            {icon !== undefined && (
                <Icon icon={icon} size={14} tone={tone} strokeWidth={2} />
            )}
            <Text variant="caption" tone={tone}>
                {label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    chip: {
        flexDirection: "row",
        alignItems: "center",
        height: 40,
        paddingHorizontal: 14,
        borderRadius: 20,
        gap: 4,
        borderWidth: 1,
    },
    infoChip: {
        flexDirection: "row",
        alignItems: "center",
        height: 30,
        paddingHorizontal: 12,
        borderRadius: 15,
        gap: 6,
        borderWidth: 1,
    },
    pressed: {
        opacity: 0.85,
    },
    disabled: {
        opacity: 0.4,
    },
});
