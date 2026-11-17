// outsource dependencies
import type { ReactNode } from "react";
import { useRef, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react-native";
import {
    View,
    Animated,
    ScrollView,
    StyleSheet,
    PanResponder,
    useWindowDimensions,
} from "react-native";

// local dependencies
import { Text } from "./Text";
import { useTheme } from "../theme";

export type TopSheetProps = {
    /** Whether the content panel is expanded. */
    open: boolean;
    /** Called when open state should change. */
    onOpenChange: (open: boolean) => void;
    /** Text displayed in the collapsed bar and as the accessible label. */
    barLabel: string;
    /** Content shown inside the scrollable panel. */
    children: ReactNode;
    /** Max panel height as a fraction of the window height. Defaults to 1/3. */
    maxHeightRatio?: number;
};

export function TopSheet({
    open,
    onOpenChange,
    barLabel,
    children,
    maxHeightRatio = 1 / 3,
}: TopSheetProps) {
    const { colors, shadows } = useTheme();
    const { height: windowHeight } = useWindowDimensions();
    const maxHeight = windowHeight * maxHeightRatio;

    // Single animated value pair — both on the JS driver so they compose
    // reliably on Fabric (no cross-driver nesting issues).
    const heightAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    // Measured scroll-content height so the panel fits its content exactly
    // (no empty gap for 3 chips, scrollable for 20 chips).
    const contentHeightRef = useRef(0);

    // Stable refs for PanResponder callbacks (created once on mount).
    const openRef = useRef(open);
    const onOpenChangeRef = useRef(onOpenChange);

    useEffect(() => {
        openRef.current = open;
    }, [open]);

    useEffect(() => {
        onOpenChangeRef.current = onOpenChange;
    }, [onOpenChange]);

    useEffect(() => {
        // Use measured content height when available; fall back to cap so the
        // panel is never empty on first open before onContentSizeChange fires.
        const contentH = contentHeightRef.current;
        const targetH = open
            ? Math.min(contentH > 0 ? contentH : maxHeight, maxHeight)
            : 0;
        Animated.parallel([
            Animated.timing(heightAnim, {
                toValue: targetH,
                duration: 220,
                useNativeDriver: false,
            }),
            Animated.timing(opacityAnim, {
                toValue: open ? 1 : 0,
                duration: 180,
                useNativeDriver: false,
            }),
        ]).start();
    }, [open, maxHeight, heightAnim, opacityAnim]);

    function handleContentSizeChange(_w: number, h: number) {
        contentHeightRef.current = h;
        if (openRef.current) {
            // Adjust height smoothly when chips are added or removed while open.
            Animated.timing(heightAnim, {
                toValue: Math.min(h, maxHeight),
                duration: 150,
                useNativeDriver: false,
            }).start();
        }
    }

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderRelease: (_, gs) => {
                const isTap = Math.abs(gs.dx) < 10 && Math.abs(gs.dy) < 10;
                const isOpen = openRef.current;
                if (isTap) {
                    onOpenChangeRef.current(!isOpen);
                } else if (!isOpen && (gs.dy > 40 || gs.vy > 0.5)) {
                    onOpenChangeRef.current(true);
                } else if (isOpen && (gs.dy < -40 || gs.vy < -0.5)) {
                    onOpenChangeRef.current(false);
                }
            },
        }),
    ).current;

    const ChevronIcon = open ? ChevronUp : ChevronDown;

    return (
        <View style={[styles.container, { boxShadow: shadows.raised }]}>
            <View
                role="button"
                accessible
                aria-expanded={open}
                aria-label={barLabel}
                {...panResponder.panHandlers}
                style={[
                    styles.bar,
                    {
                        backgroundColor: colors.surface,
                        borderBottomColor: colors.border,
                    },
                ]}
            >
                <View style={styles.grabberRow}>
                    <View
                        style={[
                            styles.grabber,
                            { backgroundColor: colors.borderStrong },
                        ]}
                    />
                </View>
                <View style={styles.barRow}>
                    <Text
                        variant="label"
                        numberOfLines={1}
                        style={styles.barLabelText}
                    >
                        {barLabel}
                    </Text>
                    <ChevronIcon
                        size={18}
                        color={colors.textMuted}
                        strokeWidth={2}
                        accessible={false}
                        importantForAccessibility="no-hide-descendants"
                    />
                </View>
            </View>
            {/* Single animated container: height + opacity on the same JS driver. */}
            <Animated.View
                style={[
                    styles.contentWrapper,
                    {
                        height: heightAnim,
                        opacity: opacityAnim,
                        backgroundColor: colors.surface,
                    },
                ]}
            >
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    scrollEnabled={open}
                    style={styles.scroll}
                    contentContainerStyle={styles.contentPadding}
                    onContentSizeChange={handleContentSizeChange}
                >
                    {children}
                </ScrollView>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    bar: {
        paddingTop: 6,
        paddingBottom: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    grabberRow: {
        alignItems: "center",
        marginBottom: 6,
    },
    grabber: {
        width: 32,
        height: 4,
        borderRadius: 2,
    },
    barRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 16,
        minHeight: 28,
    },
    barLabelText: { flex: 1 },
    contentWrapper: {
        overflow: "hidden",
    },
    scroll: {
        flex: 1,
    },
    contentPadding: {
        padding: 16,
    },
});
