// outsource dependencies
import { Alert } from "react-native";
import { it, jest, expect, describe } from "@jest/globals";
import { act, screen, render, userEvent } from "@testing-library/react-native";

// local dependencies
import App from "../../App";
import { navigationRef } from "../../src/navigation/navigationRef";

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

describe("ContinueCooking", () => {
    it("exit after step 2 shows Continue and Start over; Continue reopens step 2", async () => {
        const user = userEvent.setup();
        await openCookingMode(user);

        await user.press(screen.getByRole("button", { name: "Next" }));
        await screen.findByText("Step 2 of 4");

        await user.press(
            screen.getByRole("button", { name: "Exit cooking mode" }),
        );
        await screen.findByRole("heading", { name: "Cottage Cheese Pancakes" });

        expect(
            screen.getByRole("button", { name: "Continue · step 2" }),
        ).toBeOnTheScreen();
        expect(
            screen.getByRole("button", { name: "Start over" }),
        ).toBeOnTheScreen();

        await user.press(
            screen.getByRole("button", { name: "Continue · step 2" }),
        );
        expect(await screen.findByText("Step 2 of 4")).toBeOnTheScreen();

        await act(async () => {});
    });

    it("Done on the last step clears the session and shows Start cooking", async () => {
        const user = userEvent.setup();
        await openCookingMode(user);

        for (let i = 0; i < STEP_COUNT - 1; i++) {
            await user.press(screen.getByRole("button", { name: "Next" }));
        }
        await screen.findByRole("button", { name: "Done" });

        await user.press(screen.getByRole("button", { name: "Done" }));
        await screen.findByRole("heading", { name: "Cottage Cheese Pancakes" });

        expect(
            screen.getByRole("button", { name: "Start cooking" }),
        ).toBeOnTheScreen();
        expect(screen.queryByRole("button", { name: "Start over" })).toBeNull();

        await act(async () => {});
    });

    it("Start over with no timers opens step 1 without showing an alert", async () => {
        const user = userEvent.setup();
        await openCookingMode(user);

        await user.press(screen.getByRole("button", { name: "Next" }));
        await screen.findByText("Step 2 of 4");

        await user.press(
            screen.getByRole("button", { name: "Exit cooking mode" }),
        );
        await screen.findByRole("heading", { name: "Cottage Cheese Pancakes" });

        const alertSpy = jest.spyOn(Alert, "alert");
        try {
            await user.press(
                screen.getByRole("button", { name: "Start over" }),
            );
            expect(alertSpy).not.toHaveBeenCalled();
            expect(await screen.findByText("Step 1 of 4")).toBeOnTheScreen();
        } finally {
            alertSpy.mockRestore();
        }

        await act(async () => {});
    });

    it("Start over with an active timer shows Alert; confirming removes the timer and opens step 1", async () => {
        const user = userEvent.setup();
        await openCookingMode(user);

        // Navigate to step 3 which has the fry timer
        await user.press(screen.getByRole("button", { name: "Next" }));
        await user.press(screen.getByRole("button", { name: "Next" }));
        await screen.findByText("Step 3 of 4");

        await user.press(screen.getByRole("button", { name: "Start" }));
        await screen.findByRole("button", { name: "Pause" });

        await user.press(
            screen.getByRole("button", { name: "Exit cooking mode" }),
        );
        await screen.findByRole("heading", { name: "Cottage Cheese Pancakes" });

        const alertSpy = jest
            .spyOn(Alert, "alert")
            .mockImplementation(() => {});
        try {
            await user.press(
                screen.getByRole("button", { name: "Start over" }),
            );
            expect(alertSpy).toHaveBeenCalled();

            const alertButtons = alertSpy.mock.calls[0]?.[2];
            const confirmButton = alertButtons?.find(
                (b) => b.style === "destructive",
            );
            if (confirmButton === undefined)
                throw new Error("no destructive alert button");

            await act(async () => {
                confirmButton.onPress?.();
            });

            expect(await screen.findByText("Step 1 of 4")).toBeOnTheScreen();
        } finally {
            alertSpy.mockRestore();
        }

        await act(async () => {});
    });

    it("recipe list card shows cooking badge text and accessible name with step info", async () => {
        const user = userEvent.setup();
        await openCookingMode(user);

        await user.press(screen.getByRole("button", { name: "Next" }));
        await screen.findByText("Step 2 of 4");

        await user.press(
            screen.getByRole("button", { name: "Exit cooking mode" }),
        );
        await screen.findByRole("heading", { name: "Cottage Cheese Pancakes" });

        await act(async () => {
            navigationRef.goBack();
        });
        await screen.findByLabelText("Search recipes");

        // Badge text is inside importantForAccessibility="no-hide-descendants"
        expect(
            await screen.findByText("Cooking · 2/4", {
                includeHiddenElements: true,
            }),
        ).toBeOnTheScreen();
        expect(
            screen.getByRole("button", {
                name: "Cottage Cheese Pancakes, 2 servings, 20 min, cooking, step 2 of 4",
            }),
        ).toBeOnTheScreen();

        await act(async () => {});
    });
});
