// outsource dependencies
import { fn } from "storybook/test";
import { useArgs } from "storybook/preview-api";
import type { Meta, StoryObj } from "@storybook/react-native-web-vite";

// local dependencies
import { Stepper } from "../../src/ui";

const meta = {
    title: "UI/Stepper",
    component: Stepper,
    args: {
        value: 4,
        onChange: fn(),
        accessibilityLabel: "Порції",
    },
} satisfies Meta<typeof Stepper>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Servings: Story = {
    args: { formatValue: (v: number) => `${v} порц.` },
    render: function Render(args) {
        const [, updateArgs] = useArgs<typeof args>();
        return (
            <Stepper
                {...args}
                onChange={(v) => {
                    args.onChange(v);
                    updateArgs({ value: v });
                }}
            />
        );
    },
};

export const AtMin: Story = {
    args: { value: 1 },
    render: function Render(args) {
        const [, updateArgs] = useArgs<typeof args>();
        return (
            <Stepper
                {...args}
                onChange={(v) => {
                    args.onChange(v);
                    updateArgs({ value: v });
                }}
            />
        );
    },
};

export const AtMax: Story = {
    args: { value: 99 },
    render: function Render(args) {
        const [, updateArgs] = useArgs<typeof args>();
        return (
            <Stepper
                {...args}
                onChange={(v) => {
                    args.onChange(v);
                    updateArgs({ value: v });
                }}
            />
        );
    },
};
