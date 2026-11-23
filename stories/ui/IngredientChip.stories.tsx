// outsource dependencies
import type { Meta, StoryObj } from "@storybook/react-native-web-vite";

// local dependencies
import { IngredientChip } from "../../src/ui";

const meta = {
    title: "UI/IngredientChip",
    component: IngredientChip,
    args: {
        amount: "200 г",
        name: "Борошно",
    },
} satisfies Meta<typeof IngredientChip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithAmount: Story = {};

export const ToTaste: Story = {
    args: { amount: "за смаком", name: "Сіль" },
};

export const NoAmount: Story = {
    args: { amount: "", name: "Сіль" },
};

export const LongName: Story = {
    args: {
        amount: "2 ст. л.",
        name: "Оливкова олія холодного пресування",
    },
};
