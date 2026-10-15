import { describe, expect, it } from "vitest";
import { isValidEmailAddress } from "../lib/apongram/email-validation";

describe("isValidEmailAddress", () => {
  it("accepts common email addresses and surrounding whitespace", () => {
    expect(isValidEmailAddress("susan@example.in")).toBe(true);
    expect(isValidEmailAddress("  first.last+community@mail.example.org  ")).toBe(true);
  });

  it("rejects incomplete addresses and whitespace inside an address", () => {
    for (const value of ["", "susan", "@example.in", "susan@", "susan@example", "first last@example.in"]) {
      expect(isValidEmailAddress(value)).toBe(false);
    }
  });
});
