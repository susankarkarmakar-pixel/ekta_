import { describe, expect, it } from "vitest";
import { currentUser, posts } from "../lib/apongram/mock-data";

describe("Gazole pilot demo defaults", () => {
  it("starts with the Gazole pilot region", () => {
    expect(currentUser.region).toBe("Gazole, Malda");
  });

  it("shows sample posts from the Gazole and Malda pilot area", () => {
    const locations = new Set(posts.map((post) => post.location));
    expect(locations.size).toBeGreaterThan(1);
    expect([...locations].join(" ")).toContain("Gazole");
    expect([...locations].join(" ")).toContain("Malda");
  });
});
