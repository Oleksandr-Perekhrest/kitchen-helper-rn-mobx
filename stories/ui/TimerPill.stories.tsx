// outsource dependencies
import { fn } from "storybook/test";
import { View, StyleSheet } from "react-native";
import { useArgs } from "storybook/preview-api";
import type { Meta, StoryObj } from "@storybook/react-native-web-vite";

// local dependencies
import { TIMER_KINDS } from "../../src/theme";
import { Text, TimerPill } from "../../src/ui";
import type { TimerKind } from "../../src/theme";

const meta = {
    title: "UI/TimerPill",
    component: TimerPill,
    args: {
        kind: "fry",
        timeText: "4:10",
        kindLabel: "Смажити",
        onPress: fn(),
    },
    argTypes: {
        kind: {
            control: "select",
            options: TIMER_KINDS,
        },
    },
} satisfies Meta<typeof TimerPill>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: function Render(args) {
        const [, updateArgs] = useArgs<typeof args>();
        return (
            <TimerPill
                {...args}
                onPress={() => {
                    args.onPress();
                    updateArgs({ expanded: !args.expanded });
                }}
            />
        );
    },
};

export const Expanded: Story = {
    args: {
        label: "Смажити цибулю до золотистого",
        expanded: true,
    },
};

export const Finished: Story = {
    args: {
        timeText: "0:00",
        finished: false,
        expanded: true,
    },
};

export const Long: Story = {
    args: {
        kind: "boil",
        kindLabel: "Варити",
        timeText: "1:12:40",
    },
};

const KIND_LABELS: Record<TimerKind, string> = {
    boil: "Варити",
    fry: "Смажити",
    stew: "Тушкувати",
    bake: "Запікати",
    other: "Інше",
};

export const AllKinds: Story = {
    render: function Render(args) {
        return (
            <View style={styles.row}>
                {TIMER_KINDS.map((kind) => (
                    <TimerPill
                        key={kind}
                        {...args}
                        kind={kind}
                        kindLabel={KIND_LABELS[kind]}
                    />
                ))}
            </View>
        );
    },
};

const BODY_PARAGRAPH =
    "Наріжте цибулю дрібними кубиками та розігрійте сковороду на середньому вогні. Додайте олію, дочекайтеся, поки вона почне мерехтіти, і висипте цибулю. Помішуйте час від часу, щоб вона рівномірно підрум’янилася, і стежте, щоб не підгоріла по краях. Коли колір стане золотистим і з’явиться характерний солодкуватий аромат, зменшіть вогонь і готуйте ще дві хвилини, продовжуючи перемішувати лопаткою. Паралельно підготуйте решту інгредієнтів: натріть моркву, подрібніть часник і відміряйте необхідну кількість спецій.";

export const OverContent: Story = {
    render: function Render(args) {
        return (
            <View style={styles.overStack}>
                <Text variant="body" style={styles.bodyText}>
                    {BODY_PARAGRAPH}
                </Text>
                <View style={styles.floatCollapsed}>
                    <TimerPill
                        {...args}
                        kind="fry"
                        kindLabel="Смажити"
                        timeText="4:10"
                        expanded={false}
                        finished={false}
                    />
                </View>
                <View style={styles.floatExpanded}>
                    <TimerPill
                        {...args}
                        kind="boil"
                        kindLabel="Варити"
                        timeText="0:00"
                        label="Варити макарони al dente"
                        expanded
                        finished
                    />
                </View>
            </View>
        );
    },
};

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    overStack: {
        position: "relative",
        padding: 16,
        minHeight: 360,
    },
    bodyText: {
        lineHeight: 22,
    },
    floatCollapsed: {
        position: "absolute",
        top: 24,
        right: 16,
    },
    floatExpanded: {
        position: "absolute",
        bottom: 24,
        left: 16,
    },
});
