import AsyncStorage from "@react-native-async-storage/async-storage";
import { commentsByPost, currentUser, demoReels, posts, profiles, topics } from "./mock-data";
import { selectReels } from "./reel-utils";
import { storagePublicUrl, supabaseConfig, supabaseFetch } from "./supabase";
import type { Comment, Post, Profile, VideoCompression, OverlayPosition, OverlaySticker } from "./types";

export const repositoryMode = supabaseConfig.isConfigured ? "supabase" : "demo";
const FEED_CACHE_KEY = "@ekta/feed-cache-v1";

async function readFeedCache(): Promise<Post[]> {
  try {
    const raw = await AsyncStorage.getItem(FEED_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { items?: Post[] };
    return Array.isArray(parsed.items) ? parsed.items : [];
  } catch {
    return [];
  }
}

async function writeFeedCache(items: Post[]): Promise<void> {
  try {
    await AsyncStorage.setItem(FEED_CACHE_KEY, JSON.stringify({ savedAt: new Date().toISOString(), items }));
  } catch {
    // Caching is best effort and must never block the feed.
  }
}

export async function getFeedPage(page = 0, pageSize = 6): Promise<{ items: Post[]; hasMore: boolean; fromCache: boolean }> {
  const from = page * pageSize;
  const to = from + pageSize - 1;
  if (!supabaseConfig.isConfigured) {
    const demoFeed = [...posts.filter((post) => !post.isStory), ...demoReels];
    const items = demoFeed.slice(from, to + 1);
    return { items, hasMore: to + 1 < demoFeed.length, fromCache: false };
  }
  const cachedFeed = await readFeedCache();
  try {
    const rows = await supabaseFetch<Post[]>(`posts?select=*&order=created_at.desc&offset=${from}&limit=${pageSize}`);
    const merged = [...(page === 0 ? [] : cachedFeed), ...rows];
    const unique = [...new Map(merged.map((item) => [item.id, item])).values()];
    await writeFeedCache(unique);
    return { items: rows, hasMore: rows.length === pageSize, fromCache: false };
  } catch {
    const source = cachedFeed.length ? cachedFeed : posts;
    const items = source.slice(from, to + 1);
    return { items, hasMore: to + 1 < source.length, fromCache: true };
  }
}

export async function getFeed(): Promise<Post[]> {
  if (!supabaseConfig.isConfigured) return posts.filter((post) => !post.isStory);
  try {
    const rows = await supabaseFetch<Post[]>("posts?select=*&order=created_at.desc");
    return rows.length ? rows : posts.filter((post) => !post.isStory);
  } catch {
    return posts.filter((post) => !post.isStory);
  }
}

export async function getReels(): Promise<Post[]> {
  const localReels = selectReels([...posts, ...demoReels]);
  if (!supabaseConfig.isConfigured) return localReels;

  try {
    const rows = await supabaseFetch<ReelRow[]>(
      "posts?select=id,body,video_path,is_story,created_at,location,author:profiles(id,name,handle,bio,avatar_path,region)&video_path=not.is.null&is_story=eq.false&order=created_at.desc",
    );
    const remoteReels = rows.map(toReel).filter((reel): reel is Post => Boolean(reel));
    const unique = new Map<string, Post>();
    for (const reel of [...localReels, ...remoteReels]) unique.set(reel.id, reel);
    return selectReels([...unique.values()]);
  } catch {
    return localReels;
  }
}

type ReelRow = {
  id?: string;
  body?: string;
  video_path?: string | null;
  is_story?: boolean | null;
  created_at?: string | null;
  location?: string | null;
  author_id?: string | null;
  author?: {
    id?: string;
    name?: string | null;
    handle?: string | null;
    bio?: string | null;
    avatar_path?: string | null;
    region?: string | null;
  } | null;
};

function toReel(row: ReelRow): Post | null {
  if (!row.id || !row.body || !row.video_path || row.is_story) return null;
  const videoUrl = /^https?:\/\//i.test(row.video_path)
    ? row.video_path
    : storagePublicUrl("community-reels", row.video_path);
  if (!videoUrl) return null;

  const remoteAuthor = row.author;
  const author: Profile = remoteAuthor?.id && remoteAuthor.name && remoteAuthor.handle
    ? {
        id: remoteAuthor.id,
        name: remoteAuthor.name,
        handle: remoteAuthor.handle,
        bio: remoteAuthor.bio ?? "",
        initials: remoteAuthor.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
        avatarColor: "#365C57",
        avatarUrl: remoteAuthor.avatar_path?.startsWith("http") ? remoteAuthor.avatar_path : undefined,
        region: remoteAuthor.region ?? "India",
        followers: 0,
        following: 0,
      }
    : currentUser;

  return {
    id: row.id,
    author,
    body: row.body,
    videoUrl,
    mediaType: "video",
    isStory: false,
    createdAt: row.created_at ?? "recently",
    location: row.location ?? author.region,
    tags: row.body.match(/#[\p{L}\d_]+/gu) ?? [],
    likes: 0,
    comments: 0,
    likedByMe: false,
  };
}

export async function searchCommunity(query: string): Promise<{ people: Profile[]; posts: Post[]; topics: string[] }> {
  const term = query.trim().toLowerCase().replace(/^#/, "");
  if (!term) return { people: profiles.slice(1), posts: posts.slice(0, 2), topics };
  return {
    people: profiles.filter((profile) => `${profile.name} ${profile.handle} ${profile.region}`.toLowerCase().includes(term)),
    posts: posts.filter((post) => `${post.body} ${post.tags.join(" ")}`.toLowerCase().includes(term)),
    topics: topics.filter((topic) => topic.toLowerCase().includes(term)),
  };
}

export async function getPost(id: string): Promise<Post | undefined> {
  return posts.find((post) => post.id === id);
}

export async function getComments(postId: string): Promise<Comment[]> {
  return commentsByPost[postId] ?? [];
}

export async function addComment(postId: string, body: string): Promise<Comment> {
  const comment: Comment = { id: `local-comment-${Date.now()}`, author: currentUser, body, createdAt: "now" };
  (commentsByPost[postId] ??= []).push(comment);
  const post = posts.find((item) => item.id === postId);
  if (post) post.comments += 1;
  return comment;
}

export async function createPost(body: string, imagePath?: string, videoPath?: string, isStory = false, videoOptions?: { start: number; end: number; compression: VideoCompression }, musicOptions?: { trackId: string; musicVolume: number; originalVolume: number }, overlayOptions?: { text?: string; sticker?: OverlaySticker; position: OverlayPosition }): Promise<Post> {
  const post: Post = {
    id: `local-${Date.now()}`,
    author: currentUser,
    body,
    imageUrl: imagePath,
    videoUrl: videoPath,
    mediaType: videoPath ? "video" : imagePath ? "image" : undefined,
    videoStart: videoOptions?.start,
    videoEnd: videoOptions?.end,
    videoCompression: videoOptions?.compression,
    musicTrackId: musicOptions?.trackId,
    musicVolume: musicOptions?.musicVolume,
    originalVolume: musicOptions?.originalVolume,
    overlayText: overlayOptions?.text,
    overlaySticker: overlayOptions?.sticker,
    overlayPosition: overlayOptions?.position,
    isStory,
    storyExpiresAt: isStory ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : undefined,
    createdAt: "now",
    location: currentUser.region,
    tags: body.match(/#[\p{L}\d_]+/gu) ?? [],
    likes: 0,
    comments: 0,
    likedByMe: false,
  };
  posts.unshift(post);

  // A picker URI is local to this device/session, not a durable Supabase Storage URL.
  // Keep demo publishing local until authenticated upload and Storage policies are wired.
  const hasLocalMedia = [imagePath, videoPath].some((path) => path && /^(file:|content:|blob:)/i.test(path));
  if (supabaseConfig.isConfigured && !hasLocalMedia) {
    try {
      await supabaseFetch("posts", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ body, image_path: imagePath ?? null, video_path: videoPath ?? null, video_start: videoOptions?.start ?? null, video_end: videoOptions?.end ?? null, video_compression: videoOptions?.compression ?? null, music_track_id: musicOptions?.trackId ?? null, music_volume: musicOptions?.musicVolume ?? null, original_volume: musicOptions?.originalVolume ?? null, overlay_text: overlayOptions?.text ?? null, overlay_sticker: overlayOptions?.sticker ?? null, overlay_position: overlayOptions?.position ?? null, is_story: isStory }),
      });
    } catch {
      // Keep the preview responsive when live persistence is unavailable.
    }
  }
  return post;
}
