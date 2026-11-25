// outsource dependencies
import { fn } from "storybook/test";
import { useArgs } from "storybook/preview-api";
import type { Meta, StoryObj } from "@storybook/react-native-web-vite";

// local dependencies
import { TIMER_KINDS } from "../../src/theme";
import { TimerKindPicker } from "../../src/ui";
import type { TimerKindPickerProps } from "../../src/ui";

const meta = {
    title: "UI/TimerKindPicker",
    component: TimerKindPicker,
    args: {
        value: "other",
        accessibilityLabel: "Timer type",
        onChange: fn(),
    },
    argTypes: {
        value: { control: "select", options: TIMER_KINDS },
    },
} satisfies Meta<TimerKindPickerProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
    render: function Render(args) {
        const [, updateArgs] = useArgs<typeof args>();
        return (
            <TimerKindPicker
                {...args}
                onChange={(kind) => {
                    args.onChange(kind);
                    updateArgs({ value: kind });
                }}
            />
        );
    },
};
