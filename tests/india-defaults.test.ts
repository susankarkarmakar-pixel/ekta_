import { describe, expect, it } from "vitest";
import { currentUser, posts } from "../lib/apongram/mock-data";

describe("India-wide demo defaults", () => {
  it("starts with a nationwide profile region", () => {
    expect(currentUser.region).toBe("India");
  });

  it("shows sample posts from multiple Indian states", () => {
    const locations = new Set(posts.map((post) => post.location));
    expect(locations.size).toBeGreaterThan(1);
    expect([...locations].join(" ")).toContain("Rajasthan");
    expect([...locations].join(" ")).toContain("Karnataka");
    expect([...locations].join(" ")).toContain("Telangana");
  });
});
