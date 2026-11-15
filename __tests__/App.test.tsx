// outsource dependencies
import { it, expect, describe } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";

// local dependencies
import App from "../App";

describe("App", () => {
    it("renders the welcome screen heading", async () => {
        await render(<App />);
        expect(screen.getByText("Welcome to React Native")).toBeOnTheScreen();
    });
});
