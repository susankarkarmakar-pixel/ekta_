import type { Post } from "./types";

/** Keep video posts for the Reels experience, but never turn ephemeral Stories into Reels. */
export function selectReels(items: readonly Post[]): Post[] {
  return items.filter((item) => Boolean(item.videoUrl) && !item.isStory);
}
