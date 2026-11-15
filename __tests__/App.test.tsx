/**
 * @format
 */

// outsource dependencies
import React from "react";
import ReactTestRenderer from "react-test-renderer";

// local dependencies
import App from "../App";

test("renders correctly", async () => {
    await ReactTestRenderer.act(() => {
        ReactTestRenderer.create(<App />);
    });
});
