import { describe, expect, it } from "vitest";
import { buildFeedPreferences, getFeedScore, rankFeed } from "../lib/apongram/feed-ranking";
import { currentUser, posts } from "../lib/apongram/mock-data";

describe("feed ranking", () => {
  it("keeps latest mode chronological", () => {
    const result = rankFeed([...posts].reverse(), "latest");
    expect(result.map((post) => post.id)).toEqual(["post-1", "post-2", "post-3"]);
  });

  it("prioritizes a followed author and preferred topic", () => {
    const preferences = buildFeedPreferences(currentUser, {
      followedAuthorIds: [posts[2].author.id],
      preferredTopics: ["Volunteering"],
    });
    const result = rankFeed(posts, "relevant", preferences);
    expect(result[0]?.id).toBe("post-3");
  });

  it("boosts posts from the selected locality", () => {
    const preferences = buildFeedPreferences(currentUser, { region: "Mysuru" });
    expect(getFeedScore(posts[1], preferences)).toBeGreaterThan(getFeedScore(posts[0], preferences));
  });

  it("does not mutate the source feed", () => {
    const source = [...posts];
    rankFeed(source, "relevant");
    expect(source.map((post) => post.id)).toEqual(posts.map((post) => post.id));
  });
});
