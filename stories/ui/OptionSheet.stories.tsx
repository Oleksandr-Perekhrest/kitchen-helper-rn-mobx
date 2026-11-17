// outsource dependencies
import { fn } from "storybook/test";
import { useArgs } from "storybook/preview-api";
import type { Meta, StoryObj } from "@storybook/react-native-web-vite";

// local dependencies
import { OptionSheet } from "../../src/ui";

const UNIT_OPTIONS = [
    { value: "g", label: "g" },
    { value: "kg", label: "kg" },
    { value: "ml", label: "ml" },
    { value: "l", label: "l" },
    { value: "tsp", label: "tsp" },
    { value: "tbsp", label: "tbsp" },
    { value: "cup", label: "cup" },
    { value: "pcs", label: "pcs" },
    { value: "clove", label: "clove" },
    { value: "bunch", label: "bunch" },
    { value: "pinch", label: "pinch" },
    { value: "toTaste", label: "to taste" },
];

const meta = {
    title: "UI/OptionSheet",
    component: OptionSheet,
    args: {
        visible: true,
        title: "Unit",
        options: UNIT_OPTIONS,
        selectedValue: "g",
        onSelect: fn(),
        onClose: fn(),
    },
} satisfies Meta<typeof OptionSheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: function Render(args) {
        const [, updateArgs] = useArgs<typeof args>();
        return (
            <OptionSheet
                {...args}
                onSelect={(value) => {
                    args.onSelect(value);
                    updateArgs({ selectedValue: value });
                }}
                onClose={() => {
                    args.onClose();
                    updateArgs({ visible: false });
                }}
            />
        );
    },
};

export const MiddleSelected: Story = {
    args: { selectedValue: "cup" },
    render: function Render(args) {
        const [, updateArgs] = useArgs<typeof args>();
        return (
            <OptionSheet
                {...args}
                onSelect={(value) => {
                    args.onSelect(value);
                    updateArgs({ selectedValue: value });
                }}
                onClose={() => {
                    args.onClose();
                    updateArgs({ visible: false });
                }}
            />
        );
    },
};

export const ToTasteSelected: Story = {
    args: { selectedValue: "toTaste" },
    render: function Render(args) {
        const [, updateArgs] = useArgs<typeof args>();
        return (
            <OptionSheet
                {...args}
                onSelect={(value) => {
                    args.onSelect(value);
                    updateArgs({ selectedValue: value });
                }}
                onClose={() => {
                    args.onClose();
                    updateArgs({ visible: false });
                }}
            />
        );
    },
};
