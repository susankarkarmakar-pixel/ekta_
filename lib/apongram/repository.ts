import { commentsByPost, currentUser, posts, profiles, topics } from "./mock-data";
import { supabaseConfig, supabaseFetch } from "./supabase";
import type { Comment, Post, Profile } from "./types";

export const repositoryMode = supabaseConfig.isConfigured ? "supabase" : "demo";
export async function getFeed(): Promise<Post[]> {
  if (!supabaseConfig.isConfigured) return posts;
  try { const rows = await supabaseFetch<Post[]>("posts?select=*&order=created_at.desc"); return rows.length ? rows : posts; } catch { return posts; }
}
export async function searchCommunity(query: string): Promise<{ people: Profile[]; posts: Post[]; topics: string[] }> {
  const term = query.trim().toLowerCase().replace(/^#/, "");
  if (!term) return { people: profiles.slice(1), posts: posts.slice(0, 2), topics };
  return { people: profiles.filter((profile) => `${profile.name} ${profile.handle} ${profile.region}`.toLowerCase().includes(term)), posts: posts.filter((post) => `${post.body} ${post.tags.join(" ")}`.toLowerCase().includes(term)), topics: topics.filter((topic) => topic.toLowerCase().includes(term)) };
}
export async function getPost(id: string): Promise<Post | undefined> { return posts.find((post) => post.id === id); }
export async function getComments(postId: string): Promise<Comment[]> { return commentsByPost[postId] ?? []; }
export async function addComment(postId: string, body: string): Promise<Comment> {
  const comment: Comment = { id: `local-comment-${Date.now()}`, author: currentUser, body, createdAt: "now" };
  (commentsByPost[postId] ??= []).push(comment);
  const post = posts.find((item) => item.id === postId); if (post) post.comments += 1;
  return comment;
}
export async function createPost(body: string, imagePath?: string, videoPath?: string, isStory = false): Promise<Post> {
  const post: Post = { id: `local-${Date.now()}`, author: currentUser, body, imageUrl: imagePath, videoUrl: videoPath, mediaType: videoPath ? "video" : imagePath ? "image" : undefined, isStory, storyExpiresAt: isStory ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : undefined, createdAt: "now", location: currentUser.region, tags: body.match(/#[\p{L}\d_]+/gu) ?? [], likes: 0, comments: 0, likedByMe: false };
  posts.unshift(post);
  if (supabaseConfig.isConfigured) { try { await supabaseFetch("posts", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ body, image_path: imagePath ?? null, video_path: videoPath ?? null, is_story: isStory }) }); } catch { /* keep the local preview available */ } }
  return post;
}
