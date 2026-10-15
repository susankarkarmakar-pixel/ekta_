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
  const [storyIndex, setStoryIndex] = useState(0);
  const [storyNow] = useState(() => Date.now());
  const people = useMemo(
    () =>
      [currentUser, ...profiles.slice(1, 5)].filter((person) => {
        const authoredStories = demoStories.filter(
          (story) => story.author.id === person.id,
        );
        return (
          !authoredStories.length ||
          authoredStories.some(
            (story) =>
              !story.storyExpiresAt ||
              new Date(story.storyExpiresAt).getTime() > storyNow,
          )
        );
      }),
    [storyNow],
  );

  useEffect(() => {
    let mounted = true;
    void getViewedStoryIds().then((ids) => {
      if (mounted) setViewedIds(ids);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const rememberViewed = useCallback((personId: string) => {
    setViewedIds((ids) => (ids.includes(personId) ? ids : [...ids, personId]));
    void markStoryViewed(personId);
  }, []);
  const open = useCallback(
    (personId: string, own: boolean) => {
      if (own) {
        onCreateStory();
        return;
      }
      rememberViewed(personId);
      setPaused(false);
      setReply("");
      setReplySent(false);
      setStoryIndex(0);
      setViewerId(personId);
    },
    [onCreateStory, rememberViewed],
  );
  const close = useCallback(() => {
    setViewerId(null);
    setPaused(false);
    setReply("");
    setReplySent(false);
  }, []);
  const viewer = people.find((person) => person.id === viewerId);
  const viewerStories = viewer
    ? demoStories.filter(
        (item) =>
          item.author.id === viewer.id &&
          (!item.storyExpiresAt ||
            new Date(item.storyExpiresAt).getTime() > storyNow),
      )
    : [];
  const post = viewerStories[storyIndex] ?? viewerStories[0];
  const index = viewerId
    ? people.findIndex((person) => person.id === viewerId)
    : -1;
  const storyCount = viewer
    ? Math.max(
        1,
        demoStories.filter(
          (item) =>
            item.author.id === viewer.id &&
            (!item.storyExpiresAt ||
              new Date(item.storyExpiresAt).getTime() > storyNow),
        ).length,
      )
    : 1;
  const move = useCallback(
    (direction: -1 | 1) => {
      if (index < 0) return;
      const currentStories = viewer
        ? demoStories.filter(
            (item) =>
              item.author.id === viewer.id &&
              (!item.storyExpiresAt ||
                new Date(item.storyExpiresAt).getTime() > storyNow),
          )
        : [];
      const nextStoryIndex = storyIndex + direction;
      if (nextStoryIndex >= 0 && nextStoryIndex < currentStories.length) {
        setStoryIndex(nextStoryIndex);
        setPaused(false);
        return;
      }
      const next = people[index + direction];
      if (!next) return;
      rememberViewed(next.id);
      setPaused(false);
      setStoryIndex(0);
      setViewerId(next.id);
    },
    [index, people, rememberViewed, storyIndex, storyNow, viewer],
  );
  const sendReply = useCallback(() => {
    if (!reply.trim()) return;
    setReply("");
    setReplySent(true);
  }, [reply]);
  const share = useCallback(async () => {
    if (!viewer) return;
    const message = `${post?.body ?? `A community update from ${viewer.region}`}\n@${viewer.handle} · ${viewer.region}\nhttps://ekta.app/story/${encodeURIComponent(viewer.id)}`;
    try {
      await Share.share({ message });
    } catch {
      /* share sheet dismissed */
    }
  }, [post, viewer]);
  useEffect(() => {
    if (!viewerId || paused || index < 0) return;
    const timer = setTimeout(() => {
      const currentStories = viewer
        ? demoStories.filter(
            (item) =>
              item.author.id === viewer.id &&
              (!item.storyExpiresAt ||
                new Date(item.storyExpiresAt).getTime() > storyNow),
          )
        : [];
      if (storyIndex < currentStories.length - 1) {
        setStoryIndex((value) => value + 1);
        return;
      }
      const next = people[index + 1];
      if (!next) {
        close();
        return;
      }
      rememberViewed(next.id);
      setStoryIndex(0);
      setViewerId(next.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [
    close,
    index,
    paused,
    people,
    rememberViewed,
    storyIndex,
    storyNow,
    viewer,
    viewerId,
  ]);

  return {
    people,
    viewedIds,
    viewer,
    post,
    index,
    storyIndex,
    storyCount,
    open: Boolean(viewerId),
    onOpen: open,
    paused,
    reply,
    replySent,
    setPaused: () => setPaused((value) => !value),
    setReply,
    sendReply,
    share,
    close,
    move,
  } satisfies {
    people: Profile[];
    viewedIds: string[];
    viewer?: Profile;
    post?: Post;
    index: number;
    storyIndex: number;
    storyCount: number;
    open: boolean;
    onOpen: (personId: string, own: boolean) => void;
    paused: boolean;
    reply: string;
    replySent: boolean;
    setPaused: () => void;
    setReply: (value: string) => void;
    sendReply: () => void;
    share: () => Promise<void>;
    close: () => void;
    move: (direction: -1 | 1) => void;
  };
}
