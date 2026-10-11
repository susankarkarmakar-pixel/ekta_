import type { Post, Profile } from "./types";

export type FeedMode = "relevant" | "latest";

export type FeedPreferences = {
  region?: string;
  followedAuthorIds?: string[];
  preferredTopics?: string[];
};

const DEFAULT_TOPICS = ["public service", "community", "local update", "volunteering", "health", "books"];

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function ageInMinutes(createdAt: string): number {
  const value = normalize(createdAt);
  if (value === "now" || value === "just now") return 0;
  const match = value.match(/(\d+)\s*(min|m|hour|h|day|d|week|w)/);
  if (!match) return 24 * 60;
  const amount = Number(match[1]);
  const unit = match[2];
  if (unit.startsWith("min") || unit === "m") return amount;
  if (unit.startsWith("hour") || unit === "h") return amount * 60;
  if (unit.startsWith("day") || unit === "d") return amount * 24 * 60;
  return amount * 7 * 24 * 60;
}

function locationMatches(post: Post, region?: string): boolean {
  if (!region || normalize(region) === "india") return false;
  const target = normalize(region);
  return normalize(post.location).includes(target) || normalize(post.author.region).includes(target);
}

function topicScore(post: Post, preferredTopics: string[]): number {
  const postTopics = post.tags.map(normalize);
  const body = normalize(post.body);
  return preferredTopics.reduce((score, topic) => {
    const target = normalize(topic).replace(/^#/, "");
    return score + (postTopics.some((tag) => tag.includes(target) || target.includes(tag)) || body.includes(target) ? 8 : 0);
  }, 0);
}

function relevanceScore(post: Post, preferences: FeedPreferences): number {
  const age = ageInMinutes(post.createdAt);
  const freshness = Math.max(0, 34 - age / 90);
  const locality = locationMatches(post, preferences.region) ? 28 : 0;
  const followed = preferences.followedAuthorIds?.includes(post.author.id) ? 22 : 0;
  const topics = topicScore(post, preferences.preferredTopics ?? DEFAULT_TOPICS);
  const engagement = Math.min(16, Math.log1p(post.likes * 2 + post.comments * 4) * 2.2);
  const interaction = post.likedByMe ? 5 : 0;
  return freshness + locality + followed + topics + engagement + interaction;
}

export function rankFeed(items: Post[], mode: FeedMode = "relevant", preferences: FeedPreferences = {}): Post[] {
  if (mode === "latest") {
    return [...items].sort((a, b) => ageInMinutes(a.createdAt) - ageInMinutes(b.createdAt));
  }
  return [...items].sort((a, b) => {
    const difference = relevanceScore(b, preferences) - relevanceScore(a, preferences);
    if (Math.abs(difference) > 0.01) return difference;
    return ageInMinutes(a.createdAt) - ageInMinutes(b.createdAt);
  });
}

export function getFeedScore(post: Post, preferences: FeedPreferences = {}): number {
  return relevanceScore(post, preferences);
}

export function buildFeedPreferences(user: Profile, overrides?: Partial<FeedPreferences>): FeedPreferences {
  return {
    region: user.region,
    followedAuthorIds: overrides?.followedAuthorIds ?? [],
    preferredTopics: overrides?.preferredTopics ?? DEFAULT_TOPICS,
  };
}
