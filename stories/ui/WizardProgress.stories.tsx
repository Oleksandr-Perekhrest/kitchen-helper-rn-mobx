// outsource dependencies
import { fn } from "storybook/test";
import { useArgs } from "storybook/preview-api";
import type { Meta, StoryObj } from "@storybook/react-native-web-vite";

// local dependencies
import { WizardProgress } from "../../src/ui";

const UA_STEPS = [
    { key: "basics", label: "Основне" },
    { key: "ingredients", label: "Продукти" },
    { key: "steps", label: "Кроки" },
    { key: "review", label: "Перевірка" },
];

const meta = {
    title: "UI/WizardProgress",
    component: WizardProgress,
    args: {
        steps: UA_STEPS,
        currentIndex: 1,
        counterLabel: "2 з 4",
        onStepPress: fn(),
    },
} satisfies Meta<typeof WizardProgress>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Editing: Story = {
    args: {
        isStepPressable: () => true,
    },
    render: function Render(args) {
        const [, updateArgs] = useArgs<typeof args>();
        return (
            <WizardProgress
                {...args}
                onStepPress={(index) => {
                    args.onStepPress?.(index);
                    updateArgs({
                        currentIndex: index,
                        counterLabel: `${index + 1} з ${args.steps.length}`,
                    });
                }}
            />
        );
    },
};

export const English: Story = {
    args: {
        steps: [
            { key: "basics", label: "Basics" },
            { key: "ingredients", label: "Ingredients" },
            { key: "steps", label: "Steps" },
            { key: "review", label: "Review" },
        ],
        counterLabel: "2 of 4",
    },
};
