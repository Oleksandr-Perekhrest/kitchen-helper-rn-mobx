// outsource dependencies
import { z } from "zod";
import { it, expect, describe } from "@jest/globals";

// local dependencies
import { createId } from "../../src/domain/id";

describe("createId", () => {
    it("returns a valid UUID", () => {
        expect(z.uuid().safeParse(createId()).success).toBe(true);
    });

    it("returns a different id on every call", () => {
        expect(createId()).not.toBe(createId());
    });
});
