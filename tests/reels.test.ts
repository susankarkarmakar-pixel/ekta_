import { describe, expect, it } from "vitest";
import { selectReels } from "../lib/apongram/reel-utils";
import type { Post, Profile } from "../lib/apongram/types";

const author: Profile = {
  id: "member-1",
  name: "Asha Verma",
  handle: "asha.verma",
  bio: "",
  initials: "AV",
  avatarColor: "#C85A3A",
  region: "India",
  followers: 0,
  following: 0,
};

const post = (overrides: Partial<Post> & Pick<Post, "id">): Post => ({
  author,
  body: "A local update",
  createdAt: "now",
  location: "India",
  tags: [],
  likes: 0,
  comments: 0,
  likedByMe: false,
  ...overrides,
});

describe("selectReels", () => {
  it("includes video posts and excludes image/text posts", () => {
    const video = post({ id: "reel-1", videoUrl: "file:///reel.mp4", mediaType: "video" });
    const image = post({ id: "image-1", imageUrl: "file:///photo.jpg", mediaType: "image" });
    const text = post({ id: "text-1" });

    expect(selectReels([video, image, text])).toEqual([video]);
  });

  it("never lists Story video as a Reel", () => {
    const reel = post({ id: "reel-1", videoUrl: "https://example.test/reel.mp4" });
    const story = post({ id: "story-1", videoUrl: "file:///story.mp4", isStory: true });

    expect(selectReels([story, reel])).toEqual([reel]);
  });
});
