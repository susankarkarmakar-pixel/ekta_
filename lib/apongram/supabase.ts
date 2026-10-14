import { Platform } from "react-native";
import { getSupabaseAccessToken } from "./supabase-auth";
import { supabaseConfig } from "./supabase-config";
import type { MediaAssetKind, MediaUpload } from "./types";

export { supabaseConfig } from "./supabase-config";

export async function supabaseFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!supabaseConfig.isConfigured) throw new Error("Supabase is not configured");
  const accessToken = await getSupabaseAccessToken();
  const response = await fetch(`${supabaseConfig.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: supabaseConfig.anonKey,
      Authorization: `Bearer ${accessToken ?? supabaseConfig.anonKey}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) throw new Error(`Supabase request failed: ${response.status}`);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const storagePublicUrl = (bucket: string, path: string) =>
  supabaseConfig.isConfigured ? `${supabaseConfig.url}/storage/v1/object/public/${bucket}/${path}` : undefined;

export async function uploadProfileAvatar(uri: string, userId: string): Promise<string> {
  if (!supabaseConfig.isConfigured) throw new Error("Supabase is not configured");
  const accessToken = await getSupabaseAccessToken();
  if (!accessToken) throw new Error("Supabase session is required to upload an avatar");
  const source = await fetch(uri);
  if (!source.ok) throw new Error("Could not read the selected avatar");
  const blob = await source.blob();
  const extension = blob.type.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
  const path = `${userId}/${Date.now()}.${extension}`;
  const response = await fetch(`${supabaseConfig.url}/storage/v1/object/avatars/${path}`, {
    method: "POST",
    headers: {
      apikey: supabaseConfig.anonKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": blob.type || "image/jpeg",
      "x-upsert": "true",
    },
    body: blob,
  });
  if (!response.ok) throw new Error(`Avatar upload failed (${response.status})`);
  return path;
}

const MEDIA_BUCKET = "community-media";
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const MAX_VIDEO_BYTES = 120 * 1024 * 1024;
const ALLOWED_MEDIA_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime", "video/webm"]);

function inferMediaType(uri: string, kind: MediaAssetKind, contentType: string): string {
  if (ALLOWED_MEDIA_TYPES.has(contentType)) return contentType;
  const extension = uri.split(/[?#]/)[0].split(".").pop()?.toLowerCase();
  const byExtension: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp",
    mp4: "video/mp4", mov: "video/quicktime", webm: "video/webm",
  };
  const inferred = extension ? byExtension[extension] : undefined;
  if (inferred) return inferred;
  throw new Error(`Unsupported ${kind} format`);
}

export async function uploadMedia(uri: string, userId: string, kind: MediaAssetKind): Promise<MediaUpload> {
  if (!supabaseConfig.isConfigured) throw new Error("Supabase is not configured");
  const accessToken = await getSupabaseAccessToken();
  if (!accessToken) throw new Error("Supabase session is required to upload media");
  if (!uri || /^(https?:\/\/|data:)/i.test(uri)) throw new Error("Choose a local media file before uploading");

  const source = await fetch(uri);
  if (!source.ok) throw new Error("Could not read the selected media");
  const blob = await source.blob();
  const mimeType = inferMediaType(uri, kind, blob.type || "");
  const maxBytes = kind === "image" ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  if (blob.size <= 0 || blob.size > maxBytes) {
    throw new Error(`${kind === "image" ? "Image" : "Video"} is larger than the allowed limit`);
  }

  const extension = mimeType.split("/")[1] === "jpeg" ? "jpg" : mimeType.split("/")[1];
  const path = `${userId}/${kind}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
  const response = await fetch(`${supabaseConfig.url}/storage/v1/object/${MEDIA_BUCKET}/${path}`, {
    method: "POST",
    headers: {
      apikey: supabaseConfig.anonKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": mimeType,
      "x-upsert": "false",
    },
    body: blob,
  });
  if (!response.ok) throw new Error(`Media upload failed (${response.status})`);
  return { bucket: MEDIA_BUCKET, path, mimeType, sizeBytes: blob.size };
}

export const isNative = Platform.OS !== "web";
