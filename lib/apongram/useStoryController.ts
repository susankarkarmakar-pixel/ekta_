import { useCallback, useEffect, useMemo, useState } from "react";
import { Share } from "react-native";
import { currentUser, demoStories, profiles } from "./mock-data";
import { getViewedStoryIds, markStoryViewed } from "./story-view-state";
import type { Post, Profile } from "./types";

type StoryControllerOptions = { onCreateStory: () => void };

export function useStoryController({ onCreateStory }: StoryControllerOptions) {
  const [viewedIds, setViewedIds] = useState<string[]>([]);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [reply, setReply] = useState("");
  const [replySent, setReplySent] = useState(false);
  const [storyNow] = useState(() => Date.now());
  const people = useMemo(() => [currentUser, ...profiles.slice(1, 5)].filter((person) => {
    const authoredStories = demoStories.filter((story) => story.author.id === person.id);
    return !authoredStories.length || authoredStories.some((story) => !story.storyExpiresAt || new Date(story.storyExpiresAt).getTime() > storyNow);
  }), [storyNow]);

  useEffect(() => {
    let mounted = true;
    void getViewedStoryIds().then((ids) => { if (mounted) setViewedIds(ids); });
    return () => { mounted = false; };
  }, []);

  const rememberViewed = useCallback((personId: string) => {
    setViewedIds((ids) => ids.includes(personId) ? ids : [...ids, personId]);
    void markStoryViewed(personId);
  }, []);
  const open = useCallback((personId: string, own: boolean) => {
    if (own) { onCreateStory(); return; }
    rememberViewed(personId);
    setPaused(false);
    setReply("");
    setReplySent(false);
    setViewerId(personId);
  }, [onCreateStory, rememberViewed]);
  const close = useCallback(() => { setViewerId(null); setPaused(false); setReply(""); setReplySent(false); }, []);
  const viewer = people.find((person) => person.id === viewerId);
  const post = viewer ? demoStories.find((item) => item.author.id === viewer.id && (!item.storyExpiresAt || new Date(item.storyExpiresAt).getTime() > storyNow)) : undefined;
  const index = viewerId ? people.findIndex((person) => person.id === viewerId) : -1;
  const move = useCallback((direction: -1 | 1) => {
    if (index < 0) return;
    const next = people[index + direction];
    if (!next) return;
    rememberViewed(next.id);
    setPaused(false);
    setViewerId(next.id);
  }, [index, people, rememberViewed]);
  const sendReply = useCallback(() => { if (!reply.trim()) return; setReply(""); setReplySent(true); }, [reply]);
  const share = useCallback(async () => {
    if (!viewer) return;
    const message = `${post?.body ?? `A community update from ${viewer.region}`}\n@${viewer.handle} · ${viewer.region}\nhttps://ekta.app/story/${encodeURIComponent(viewer.id)}`;
    try { await Share.share({ message }); } catch { /* share sheet dismissed */ }
  }, [post, viewer]);
  useEffect(() => {
    if (!viewerId || paused || index < 0) return;
    const timer = setTimeout(() => {
      const next = people[index + 1];
      if (!next) { close(); return; }
      rememberViewed(next.id);
      setViewerId(next.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [close, index, paused, people, rememberViewed, viewerId]);

  return { people, viewedIds, viewer, post, index, open: Boolean(viewerId), onOpen: open, paused, reply, replySent, setPaused: () => setPaused((value) => !value), setReply, sendReply, share, close, move } satisfies {
    people: Profile[]; viewedIds: string[]; viewer?: Profile; post?: Post; index: number; open: boolean; onOpen: (personId: string, own: boolean) => void; paused: boolean; reply: string; replySent: boolean; setPaused: () => void; setReply: (value: string) => void; sendReply: () => void; share: () => Promise<void>; close: () => void; move: (direction: -1 | 1) => void;
  };
}
