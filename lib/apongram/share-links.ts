import * as Linking from "expo-linking";

const WEB_SHARE_BASE_URL = "https://ekta.app";

export function createPostShareLinks(postId: string) {
  const encodedId = encodeURIComponent(postId);
  const webUrl = `${WEB_SHARE_BASE_URL}/post/${encodedId}`;
  const appUrl = Linking.createURL(`post/${encodedId}`);
  return { webUrl, appUrl };
}

export function createPostShareMessage(postId: string, body: string, handle: string, location: string) {
  const { webUrl, appUrl } = createPostShareLinks(postId);
  return `${body}\n@${handle} · ${location}\n${webUrl}\nOpen in eKta: ${appUrl}`;
}
