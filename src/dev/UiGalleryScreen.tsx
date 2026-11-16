// outsource dependencies
import { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import {
    Star,
    Heart,
    Timer,
    Pause,
    Clock,
    Camera,
    Trash2,
    ArrowLeft,
    ArrowRight,
} from "lucide-react-native";

// local dependencies
import { typography } from "../theme";
import { SegmentedControl } from "../ui";
import type { TimerKind } from "../theme";
import { spacing, useTheme, TIMER_KINDS } from "../theme";
import type { RootStackScreenProps } from "../navigation/types";
import {
    Text,
    Icon,
    Chip,
    Card,
    Button,
    Switch,
    Banner,
    Stepper,
    InfoChip,
    TextField,
    TimerPill,
    IconButton,
    TEXT_TONES,
    TIMER_ICONS,
    BUTTON_VARIANTS,
    ICON_BUTTON_VARIANTS,
} from "../ui";

type Props = RootStackScreenProps<"UiGallery">;

const KIND_LABELS: Record<TimerKind, string> = {
    boil: "Boil",
    fry: "Fry",
    stew: "Stew",
    bake: "Bake",
    other: "Other",
};

const TYPOGRAPHY_VARIANTS = Object.keys(typography) as Array<
    keyof typeof typography
>;

const TAGS = ["All", "Breakfast", "Soups", "Mains", "Dinner", "Dessert"];

const THEME_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
    { value: "system", label: "System" },
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
];

function SectionTitle({ title }: { title: string }) {
    const { colors } = useTheme();
    return (
        <View
            style={[
                styles.sectionTitleContainer,
                { borderBottomColor: colors.border },
            ]}
        >
            <Text variant="headline">{title}</Text>
        </View>
    );
}

function Row({ children }: { children: React.ReactNode }) {
    return <View style={styles.row}>{children}</View>;
}

function GalleryText() {
    return (
        <View style={styles.section}>
            <SectionTitle title="Text" />
            <View style={styles.sectionContent}>
                {TYPOGRAPHY_VARIANTS.map((variant) => (
                    <Text key={variant} variant={variant}>
                        {variant}: Slice the beet into strips
                    </Text>
                ))}
                <View style={styles.spacer} />
                <Text variant="body">Default tone (text)</Text>
                {TEXT_TONES.map((tone) => (
                    <Text key={tone} variant="body" tone={tone}>
                        Tone: {tone}
                    </Text>
                ))}
            </View>
        </View>
    );
}

function GalleryIcon() {
    return (
        <View style={styles.section}>
            <SectionTitle title="Icon" />
            <View style={styles.sectionContent}>
                <Row>
                    <Icon icon={Heart} />
                    <Icon icon={Star} />
                    <Icon icon={Timer} />
                    <Icon icon={Camera} tone="primary" />
                    <Icon icon={Trash2} tone="danger" />
                    <Icon icon={Heart} size={32} />
                    <Icon icon={Star} size={16} />
                    <Icon icon={Clock} strokeWidth={1.5} />
                </Row>
            </View>
        </View>
    );
}

function GalleryButton() {
    return (
        <View style={styles.section}>
            <SectionTitle title="Button" />
            <View style={styles.sectionContent}>
                {BUTTON_VARIANTS.map((variant) => (
                    <Button
                        key={variant}
                        label={
                            variant.charAt(0).toUpperCase() + variant.slice(1)
                        }
                        variant={variant}
                        onPress={() => undefined}
                    />
                ))}
                <Button
                    label="With icon (lg)"
                    variant="primary"
                    icon={ArrowRight}
                    onPress={() => undefined}
                />
                <Button
                    label="Soft md with icon"
                    variant="soft"
                    size="md"
                    icon={Camera}
                    onPress={() => undefined}
                />
                <Button
                    label="Disabled"
                    variant="primary"
                    disabled
                    onPress={() => undefined}
                />
            </View>
        </View>
    );
}

function GalleryIconButton() {
    return (
        <View style={styles.section}>
            <SectionTitle title="IconButton" />
            <View style={styles.sectionContent}>
                <Row>
                    {ICON_BUTTON_VARIANTS.map((variant) => (
                        <IconButton
                            key={variant}
                            icon={Heart}
                            accessibilityLabel={variant}
                            variant={variant}
                            onPress={() => undefined}
                        />
                    ))}
                </Row>
                <Row>
                    <IconButton
                        icon={Star}
                        accessibilityLabel="Favorite active"
                        variant="elevated"
                        iconTone="primary"
                        onPress={() => undefined}
                    />
                    <IconButton
                        icon={Timer}
                        accessibilityLabel="Timers with badge"
                        badge={3}
                        onPress={() => undefined}
                    />
                    <IconButton
                        icon={Pause}
                        accessibilityLabel="Pause large"
                        size="lg"
                        onPress={() => undefined}
                    />
                    <IconButton
                        icon={ArrowLeft}
                        accessibilityLabel="Disabled"
                        disabled
                        onPress={() => undefined}
                    />
                </Row>
            </View>
        </View>
    );
}

function GalleryChip() {
    const [selected, setSelected] = useState("All");
    return (
        <View style={styles.section}>
            <SectionTitle title="Chip / InfoChip" />
            <View style={styles.sectionContent}>
                <Row>
                    <Chip label="Unselected" onPress={() => undefined} />
                    <Chip label="Selected" selected onPress={() => undefined} />
                    <Chip
                        label="With icon"
                        icon={Star}
                        onPress={() => undefined}
                    />
                </Row>
                <View style={styles.chipGroup}>
                    {TAGS.map((tag) => (
                        <Chip
                            key={tag}
                            label={tag}
                            selected={selected === tag}
                            onPress={() => setSelected(tag)}
                        />
                    ))}
                </View>
                <Row>
                    <InfoChip icon={Clock} label="45 min" />
                    <InfoChip label="320 kcal" />
                    <InfoChip label="Soups" variant="outline" />
                </Row>
            </View>
        </View>
    );
}

function GalleryTextField() {
    const [v1, setV1] = useState("");
    const [v2, setV2] = useState("Ukrainian borscht");
    const [v3, setV3] = useState("");
    const [v4, setV4] = useState("");
    return (
        <View style={styles.section}>
            <SectionTitle title="TextField" />
            <View style={styles.sectionContent}>
                <View style={styles.textFieldContainer}>
                    <TextField
                        label="Recipe name"
                        placeholder="e.g. borscht"
                        value={v1}
                        onChangeText={setV1}
                    />
                </View>
                <View style={styles.textFieldContainer}>
                    <TextField
                        label="Recipe name"
                        value={v2}
                        onChangeText={setV2}
                    />
                </View>
                <View style={styles.textFieldContainer}>
                    <TextField
                        label="Ingredient"
                        error="Enter an ingredient name"
                        value={v3}
                        onChangeText={setV3}
                    />
                </View>
                <View style={styles.textFieldContainer}>
                    <TextField
                        label="Step"
                        multiline
                        value={v4}
                        onChangeText={setV4}
                    />
                </View>
            </View>
        </View>
    );
}

function GalleryCard() {
    return (
        <View style={styles.section}>
            <SectionTitle title="Card" />
            <View style={styles.sectionContent}>
                <View style={styles.cardContainer}>
                    <Card>
                        <Text variant="headline">Borscht</Text>
                        <Text>Traditional Ukrainian beet soup.</Text>
                    </Card>
                </View>
                <View style={styles.cardContainer}>
                    <Card
                        onPress={() => undefined}
                        accessibilityLabel="Open recipe"
                    >
                        <Text variant="headline">Pressable card</Text>
                        <Text>Tap me.</Text>
                    </Card>
                </View>
            </View>
        </View>
    );
}

function GalleryBanner() {
    return (
        <View style={styles.section}>
            <SectionTitle title="Banner" />
            <View style={styles.sectionContent}>
                <View style={styles.bannerContainer}>
                    <Banner
                        title="Unused ingredients"
                        message="Salt and bay leaf are not tied to any step."
                    />
                </View>
                <View style={styles.bannerContainer}>
                    <Banner message="Warning without title." />
                </View>
                <View style={styles.bannerContainer}>
                    <Banner
                        tone="info"
                        message="Voice control is disabled in settings."
                    />
                </View>
            </View>
        </View>
    );
}

function GallerySwitch() {
    const [v1, setV1] = useState(false);
    const [v2, setV2] = useState(true);
    return (
        <View style={styles.section}>
            <SectionTitle title="Switch" />
            <View style={styles.sectionContent}>
                <Row>
                    <Switch
                        value={v1}
                        onValueChange={setV1}
                        accessibilityLabel="Off switch"
                    />
                    <Switch
                        value={v2}
                        onValueChange={setV2}
                        accessibilityLabel="On switch"
                    />
                    <Switch
                        value={false}
                        disabled
                        onValueChange={() => undefined}
                        accessibilityLabel="Disabled switch"
                    />
                </Row>
                <View style={styles.switchRow}>
                    <Text variant="body">Voice control</Text>
                    <Switch
                        value={v1}
                        onValueChange={setV1}
                        accessibilityLabel="Voice control"
                    />
                </View>
            </View>
        </View>
    );
}

function GallerySegmentedControl() {
    const [theme, setTheme] = useState("system");
    const [lang, setLang] = useState("en");
    const langOptions: ReadonlyArray<{ value: string; label: string }> = [
        { value: "en", label: "English" },
        { value: "uk", label: "Ukrainian" },
    ];
    return (
        <View style={styles.section}>
            <SectionTitle title="SegmentedControl" />
            <View style={styles.sectionContent}>
                <View style={styles.controlContainer}>
                    <SegmentedControl
                        options={THEME_OPTIONS}
                        value={theme}
                        onChange={setTheme}
                        accessibilityLabel="Theme"
                    />
                </View>
                <View style={styles.controlContainer}>
                    <SegmentedControl
                        options={langOptions}
                        value={lang}
                        onChange={setLang}
                        accessibilityLabel="Language"
                    />
                </View>
            </View>
        </View>
    );
}

function GalleryStepper() {
    const [servings, setServings] = useState(4);
    const [atMin, setAtMin] = useState(1);
    const [atMax, setAtMax] = useState(99);
    return (
        <View style={styles.section}>
            <SectionTitle title="Stepper" />
            <View style={styles.sectionContent}>
                <Stepper
                    value={servings}
                    onChange={setServings}
                    formatValue={(v) => `${v} servings`}
                    accessibilityLabel="Servings"
                />
                <Stepper
                    value={atMin}
                    onChange={setAtMin}
                    accessibilityLabel="At minimum"
                />
                <Stepper
                    value={atMax}
                    onChange={setAtMax}
                    accessibilityLabel="At maximum"
                />
            </View>
        </View>
    );
}

function GalleryTimerPill() {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const toggle = (key: string) =>
        setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
    return (
        <View style={styles.section}>
            <SectionTitle title="TimerPill" />
            <View style={styles.sectionContent}>
                <Row>
                    {TIMER_KINDS.map((kind) => (
                        <TimerPill
                            key={kind}
                            kind={kind}
                            timeText="4:10"
                            kindLabel={KIND_LABELS[kind]}
                            expanded={expanded[kind] ?? false}
                            onPress={() => toggle(kind)}
                        />
                    ))}
                </Row>
                <TimerPill
                    kind="fry"
                    timeText="4:10"
                    kindLabel="Fry"
                    label="Fry onion until golden"
                    expanded
                    onPress={() => undefined}
                />
                <TimerPill
                    kind="boil"
                    timeText="1:12:40"
                    kindLabel="Boil"
                    onPress={() => undefined}
                />
                <TimerPill
                    kind="stew"
                    timeText="0:00"
                    kindLabel="Stew"
                    finished
                    expanded
                    onPress={() => undefined}
                />
            </View>
        </View>
    );
}

function GalleryTimerIcons() {
    const { colors } = useTheme();
    return (
        <View style={styles.section}>
            <SectionTitle title="Timer icons" />
            <View style={styles.sectionContent}>
                {TIMER_KINDS.map((kind) => {
                    const IconComponent = TIMER_ICONS[kind];
                    return (
                        <View key={kind} style={styles.timerIconRow}>
                            <IconComponent
                                size={24}
                                color={colors.timer[kind]}
                                strokeWidth={2}
                                accessible={false}
                                importantForAccessibility="no-hide-descendants"
                            />
                            <Text variant="body">
                                {kind} — {KIND_LABELS[kind]}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

export function UiGalleryScreen(_props: Props) {
    const { colors } = useTheme();
    return (
        <ScrollView
            style={[styles.scroll, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.content}
        >
            <GalleryText />
            <GalleryIcon />
            <GalleryButton />
            <GalleryIconButton />
            <GalleryChip />
            <GalleryTextField />
            <GalleryCard />
            <GalleryBanner />
            <GallerySwitch />
            <GallerySegmentedControl />
            <GalleryStepper />
            <GalleryTimerPill />
            <GalleryTimerIcons />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
    },
    content: {
        padding: spacing[16],
        gap: spacing[24],
    },
    section: {
        gap: spacing[8],
    },
    sectionTitleContainer: {
        paddingBottom: spacing[8],
        borderBottomWidth: 1,
    },
    sectionContent: {
        gap: spacing[12],
    },
    row: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        gap: spacing[8],
    },
    spacer: {
        height: spacing[8],
    },
    chipGroup: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing[8],
    },
    textFieldContainer: {
        width: 320,
    },
    cardContainer: {
        width: 320,
    },
    bannerContainer: {
        width: 320,
    },
    controlContainer: {
        width: 320,
    },
    switchRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: 280,
    },
    timerIconRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing[8],
    },
});
