// outsource dependencies
import type { ReactNode } from "react";
import { Camera, Images, UtensilsCrossed } from "lucide-react-native";
import { View, Image, StyleSheet, ActivityIndicator } from "react-native";

// local dependencies
import { Icon } from "./Icon";
import { Text } from "./Text";
import { Button } from "./Button";
import { radii, useTheme } from "../theme";

export type PhotoFieldProps = {
    label: string;
    photoUri?: string;
    busy?: boolean;
    cameraLabel: string;
    galleryLabel: string;
    removeLabel: string;
    onCamera: () => void;
    onGallery: () => void;
    onRemove: () => void;
    notice?: ReactNode;
};

export function PhotoField({
    label,
    photoUri,
    busy = false,
    cameraLabel,
    galleryLabel,
    removeLabel,
    onCamera,
    onGallery,
    onRemove,
    notice,
}: PhotoFieldProps) {
    const { colors } = useTheme();

    return (
        <View style={styles.container}>
            <Text variant="label">{label}</Text>
            <View
                style={[
                    styles.preview,
                    { backgroundColor: colors.primarySoft },
                ]}
            >
                {photoUri !== undefined ? (
                    <Image
                        source={{ uri: photoUri }}
                        style={styles.image}
                        resizeMode="cover"
                        accessible={false}
                    />
                ) : (
                    <Icon icon={UtensilsCrossed} size={40} tone="primary" />
                )}
                {busy && (
                    <View style={styles.busyOverlay}>
                        <ActivityIndicator color={colors.primary} />
                    </View>
                )}
            </View>
            <View style={styles.buttonRow}>
                <Button
                    label={cameraLabel}
                    icon={Camera}
                    variant="soft"
                    size="md"
                    disabled={busy}
                    onPress={onCamera}
                    style={styles.buttonFlex}
                />
                <Button
                    label={galleryLabel}
                    icon={Images}
                    variant="soft"
                    size="md"
                    disabled={busy}
                    onPress={onGallery}
                    style={styles.buttonFlex}
                />
            </View>
            {photoUri !== undefined && (
                <Button
                    label={removeLabel}
                    variant="dangerText"
                    size="md"
                    disabled={busy}
                    onPress={onRemove}
                />
            )}
            {notice}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 12,
    },
    preview: {
        aspectRatio: 4 / 3,
        borderRadius: radii.lg,
        overflow: "hidden",
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
    busyOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonRow: {
        flexDirection: "row",
        gap: 8,
    },
    buttonFlex: {
        flex: 1,
    },
});
