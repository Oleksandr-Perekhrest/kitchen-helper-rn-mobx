// outsource dependencies
import { it, expect, describe } from "@jest/globals";
import {
    act,
    screen,
    render,
    fireEvent,
    userEvent,
} from "@testing-library/react-native";

// local dependencies
import App from "../../App";

// Cottage Cheese Pancakes: 4 steps, base servings=2, totalMinutes=20
// Step 1 (SY_S1): ingredients cheese/egg/sugar/vanilla, no timer
// Step 3 (SY_S3): ingredient oil + fry timer 8 min
const RECIPE_CARD_LABEL = "Cottage Cheese Pancakes, 2 servings, 20 min";
const STEP_COUNT = 4;

async function openCookingMode(
    user: ReturnType<typeof userEvent.setup>,
): Promise<void> {
    await render(<App />);
    await screen.findByLabelText("Search recipes");
    await user.press(screen.getByRole("button", { name: RECIPE_CARD_LABEL }));
    await user.press(
        await screen.findByRole("button", { name: "Start cooking" }),
    );
    await screen.findByText(`Step 1 of ${STEP_COUNT}`);
}

describe("CookingMode", () => {
    it("navigates steps with Next and Back", async () => {
        const user = userEvent.setup();
        await openCookingMode(user);

        expect(screen.getByText(`Step 1 of ${STEP_COUNT}`)).toBeOnTheScreen();
        expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();

        await user.press(screen.getByRole("button", { name: "Next" }));
        expect(
            await screen.findByText(`Step 2 of ${STEP_COUNT}`),
        ).toBeOnTheScreen();

        await user.press(screen.getByRole("button", { name: "Back" }));
        expect(
            await screen.findByText(`Step 1 of ${STEP_COUNT}`),
        ).toBeOnTheScreen();

        // Navigate to the last step (pressing Next 3 times from step 1)
        await user.press(screen.getByRole("button", { name: "Next" }));
        await user.press(screen.getByRole("button", { name: "Next" }));
        await user.press(screen.getByRole("button", { name: "Next" }));
        expect(
            await screen.findByRole("button", { name: "Done" }),
        ).toBeOnTheScreen();

        await user.press(screen.getByRole("button", { name: "Done" }));
        expect(
            await screen.findByRole("heading", {
                name: "Cottage Cheese Pancakes",
            }),
        ).toBeOnTheScreen();

        await act(async () => {});
    });

    it("closes cooking mode with the close button", async () => {
        const user = userEvent.setup();
        await openCookingMode(user);

        await user.press(
            screen.getByRole("button", { name: "Exit cooking mode" }),
        );
        expect(
            await screen.findByRole("heading", {
                name: "Cottage Cheese Pancakes",
            }),
        ).toBeOnTheScreen();

        await act(async () => {});
    });

    it("shows ingredient chips scaled to the chosen servings", async () => {
        const user = userEvent.setup();
        await render(<App />);
        await screen.findByLabelText("Search recipes");
        await user.press(
            screen.getByRole("button", { name: RECIPE_CARD_LABEL }),
        );

        // Increase servings once: base 2 → 3
        fireEvent(
            await screen.findByLabelText("Servings"),
            "accessibilityAction",
            { nativeEvent: { actionName: "increment" } },
        );

        await user.press(screen.getByRole("button", { name: "Start cooking" }));

        // Step 1 (SY_S1): Full-fat cottage cheese 250 g × (3/2) = 375 g
        expect(
            await screen.findByLabelText("375 g Full-fat cottage cheese"),
        ).toBeOnTheScreen();

        await act(async () => {});
    });

    it("runs the step timer controls", async () => {
        const user = userEvent.setup();
        await openCookingMode(user);

        // Navigate to step 3 (index 2): the fry timer step
        await user.press(screen.getByRole("button", { name: "Next" }));
        await user.press(screen.getByRole("button", { name: "Next" }));
        await screen.findByText("Step 3 of 4");

        // Start the timer
        await user.press(screen.getByRole("button", { name: "Start" }));
        expect(
            await screen.findByRole("button", { name: "Pause" }),
        ).toBeOnTheScreen();
        expect(await screen.findByLabelText(/Fry, running,/)).toBeOnTheScreen();

        // Pause the timer
        await user.press(screen.getByRole("button", { name: "Pause" }));
        expect(
            await screen.findByRole("button", { name: "Resume" }),
        ).toBeOnTheScreen();
        expect(
            await screen.findByRole("button", { name: "Stop and reset" }),
        ).toBeOnTheScreen();

        // Stop and reset the timer
        await user.press(
            screen.getByRole("button", { name: "Stop and reset" }),
        );
        expect(
            await screen.findByRole("button", { name: "Start" }),
        ).toBeOnTheScreen();

        await act(async () => {});
    });
});
