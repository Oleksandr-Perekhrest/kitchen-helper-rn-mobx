// outsource dependencies
import { useState } from "react";
import type { Ref, ElementRef } from "react";
import type { TextInputProps } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { View, TextInput, StyleSheet } from "react-native";

// local dependencies
import { Icon } from "./Icon";
import { Text } from "./Text";
import { useTheme, typography } from "../theme";

export type TextFieldProps = Omit<TextInputProps, "style" | "ref"> & {
    /** Label displayed above the input. */
    label?: string;
    /** Error message displayed below the input; makes the input border danger-colored. */
    error?: string;
    /** Additional styles for the outer container. */
    style?: StyleProp<ViewStyle>;
    /** Optional leading icon rendered at 20 px in textMuted tone. */
    icon?: LucideIcon;
    /** React 19: ref forwarded to the underlying TextInput. */
    ref?: Ref<ElementRef<typeof TextInput>>;
};

export function TextField({
    label,
    error,
    style,
    icon,
    ref,
    multiline = false,
    onFocus,
    onBlur,
    ...rest
}: TextFieldProps) {
    const { colors } = useTheme();
    const [focused, setFocused] = useState(false);

    const hasError = error !== undefined && error.length > 0;
    const borderWidth = hasError || focused ? 2 : 1;
    const borderColor = hasError
        ? colors.danger
        : focused
          ? colors.primary
          : colors.borderStrong;
    // Subtract 1px from padding per extra border pixel to keep outer size constant.
    const paddingHorizontal = 13 - borderWidth;

    return (
        <View style={[styles.container, style]}>
            {label !== undefined && <Text variant="label">{label}</Text>}
            <View
                style={[
                    styles.fieldRow,
                    multiline && styles.fieldRowMultiline,
                    {
                        borderWidth,
                        borderColor,
                        paddingHorizontal,
                        backgroundColor: colors.surface,
                    },
                    multiline && { paddingVertical: 11 - borderWidth },
                ]}
            >
                {icon !== undefined && (
                    <Icon
                        icon={icon}
                        size={20}
                        tone="textMuted"
                        strokeWidth={2}
                    />
                )}
                <TextInput
                    ref={ref}
                    multiline={multiline}
                    aria-label={label}
                    accessibilityHint={hasError ? error : undefined}
                    placeholderTextColor={colors.textMuted}
                    onFocus={(e) => {
                        setFocused(true);
                        onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setFocused(false);
                        onBlur?.(e);
                    }}
                    style={[
                        styles.input,
                        multiline && styles.inputMultiline,
                        { color: colors.text },
                    ]}
                    {...rest}
                />
            </View>
            {hasError && (
                <Text variant="caption" tone="danger">
                    {error}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 6,
    },
    fieldRow: {
        flexDirection: "row",
        alignItems: "center",
        minHeight: 48,
        borderRadius: 12,
        gap: 8,
    },
    fieldRowMultiline: {
        alignItems: "flex-start",
        minHeight: 96,
    },
    input: {
        flex: 1,
        outlineWidth: 0,
        outlineStyle: "solid",
        ...typography.body,
    },
    inputMultiline: {
        minHeight: 96,
        textAlignVertical: "top",
    },
});
