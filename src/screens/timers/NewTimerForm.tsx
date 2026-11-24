// outsource dependencies
import { useState } from "react";
import { Play } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View, Keyboard, StyleSheet } from "react-native";

// local dependencies
import { TIMER_KINDS } from "../../theme";
import type { TimerKind } from "../../theme";
import { useStores } from "../../stores/StoreProvider";
import { Chip, Text, Button, TextField, TIMER_ICONS } from "../../ui";

const DURATION_PRESETS = [1, 3, 5, 10, 15, 20] as const;

export function NewTimerForm() {
    const { t } = useTranslation();
    const { timers } = useStores();

    const [minutes, setMinutes] = useState<number>(10);
    const [kind, setKind] = useState<TimerKind>("other");
    const [name, setName] = useState<string>("");

    function handleStart() {
        timers.start({
            kind,
            minutes,
            label: name.trim() || undefined,
        });
        setName("");
        Keyboard.dismiss();
    }

    return (
        <View style={styles.container}>
            <Text variant="headline">{t("timers.new.title")}</Text>

            <View role="radiogroup" aria-label={t("timers.new.durationLabel")}>
                <View style={styles.chipRow}>
                    {DURATION_PRESETS.map((preset) => (
                        <Chip
                            key={preset}
                            role="radio"
                            label={t("timers.new.minutes", { count: preset })}
                            selected={minutes === preset}
                            onPress={() => setMinutes(preset)}
                        />
                    ))}
                </View>
            </View>

            <View role="radiogroup" aria-label={t("timers.new.kindLabel")}>
                <View style={styles.chipRow}>
                    {TIMER_KINDS.map((k) => (
                        <Chip
                            key={k}
                            role="radio"
                            label={t(`timerKinds.${k}`)}
                            icon={TIMER_ICONS[k]}
                            selected={kind === k}
                            onPress={() => setKind(k)}
                        />
                    ))}
                </View>
            </View>

            <TextField
                label={t("timers.new.nameLabel")}
                placeholder={t("timers.new.namePlaceholder")}
                maxLength={40}
                returnKeyType="done"
                value={name}
                onChangeText={setName}
                onSubmitEditing={handleStart}
            />

            <Button
                label={t("timers.new.start", { count: minutes })}
                icon={Play}
                onPress={handleStart}
                style={styles.button}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
    },
    chipRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    button: {
        alignSelf: "stretch",
    },
});
