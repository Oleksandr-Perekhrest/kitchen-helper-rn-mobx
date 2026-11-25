// outsource dependencies
import { useRef, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    View,
    Platform,
    Animated,
    StyleSheet,
    AccessibilityInfo,
} from "react-native";

// local dependencies
import { Snackbar } from "../ui/Snackbar";
import { useStores } from "../stores/StoreProvider";
import { useReduceMotion } from "../hooks/useReduceMotion";

const SLIDE_DISTANCE = 16;
const DURATION_MS = 200;

export const SnackbarHost = observer(function SnackbarHostComponent() {
    const { snackbar } = useStores();
    const insets = useSafeAreaInsets();
    const reduceMotion = useReduceMotion();

    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(SLIDE_DISTANCE)).current;

    const current = snackbar.current;
    const currentId = current?.id;
    const currentMessage = current?.message;

    useEffect(() => {
        if (currentId === undefined) return;
        if (currentMessage !== undefined) {
            AccessibilityInfo.announceForAccessibility(currentMessage);
        }
        opacity.setValue(0);
        translateY.setValue(reduceMotion ? 0 : SLIDE_DISTANCE);
        const useNativeDriver = Platform.OS !== "web";
        const animations = [
            Animated.timing(opacity, {
                toValue: 1,
                duration: DURATION_MS,
                useNativeDriver,
            }),
        ];
        if (!reduceMotion) {
            animations.push(
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: DURATION_MS,
                    useNativeDriver,
                }),
            );
        }
        Animated.parallel(animations).start();
    }, [currentId, currentMessage, reduceMotion, opacity, translateY]);

    if (current === null) return null;

    const bottom = snackbar.bottomOffset ?? insets.bottom + 16;

    return (
        <View pointerEvents="box-none" style={[styles.wrapper, { bottom }]}>
            <Animated.View style={{ opacity, transform: [{ translateY }] }}>
                <Snackbar
                    message={current.message}
                    actionLabel={current.actionLabel}
                    onAction={
                        current.actionLabel !== undefined
                            ? () => snackbar.runAction()
                            : undefined
                    }
                />
            </Animated.View>
        </View>
    );
});

const styles = StyleSheet.create({
    wrapper: {
        position: "absolute",
        left: 16,
        right: 16,
    },
});
