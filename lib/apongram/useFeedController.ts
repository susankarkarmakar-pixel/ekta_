import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AppState,
  Platform,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type NativeTouchEvent,
} from "react-native";
import {
  FEED_BACKGROUND_SYNC_INTERVAL_MS,
  getCachedFeedPage,
  getFeedPage,
  repositoryMode,
  syncFeedCache,
} from "./repository";
import { currentUser } from "./mock-data";
import { buildFeedPreferences, rankFeed, type FeedMode } from "./feed-ranking";
import type { Post } from "./types";

type FeedControllerOptions = {
  preferences: { region?: string; preferredTopics?: string[] };
};

export function useFeedController({ preferences }: FeedControllerOptions) {
  const [feed, setFeed] = useState<Post[]>([]);
  const [feedMode, setFeedMode] = useState<FeedMode>("relevant");
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [feedError, setFeedError] = useState(false);
  const [feedOffline, setFeedOffline] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState(false);
  const [hiddenPostIds, setHiddenPostIds] = useState<string[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [webPullDistance, setWebPullDistance] = useState(0);
  const loadingRef = useRef(false);
  const activeVideoRef = useRef<string | null>(null);
  const webPullStartY = useRef<number | null>(null);
  const webPullDistanceRef = useRef(0);
  const scrollOffsetY = useRef(0);
  const cardLayouts = useRef<Record<string, { y: number; height: number }>>({});
  const setActiveVideo = useCallback((id: string | null) => {
    if (activeVideoRef.current === id) return;
    activeVideoRef.current = id;
    setActiveVideoId(id);
  }, []);

  useEffect(() => {
    const firstVideo = feed.find((post) => post.videoUrl);
    if (
      !firstVideo ||
      (activeVideoRef.current &&
        feed.some(
          (post) => post.id === activeVideoRef.current && post.videoUrl,
        ))
    )
      return;
    setActiveVideo(firstVideo.id);
  }, [feed, setActiveVideo]);

  const reloadFeed = useCallback(
    async (showFeedback = false) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setRefreshing(true);
      setFeedError(false);
      let servedCachedFeed = false;
      try {
        const cached = await getCachedFeedPage(0, 3);
        if (cached.items.length) {
          servedCachedFeed = true;
          setFeed(
            rankFeed(cached.items, feedMode, {
              ...buildFeedPreferences(currentUser),
              ...preferences,
            }),
          );
          setPage(0);
          setHasMore(cached.hasMore);
          setFeedOffline(false);
          if (!showFeedback) setRefreshing(false);
        }
        const {
          items,
          hasMore: nextHasMore,
          fromCache,
        } = await getFeedPage(0, 3);
        setFeed(
          rankFeed(items, feedMode, {
            ...buildFeedPreferences(currentUser),
            ...preferences,
          }),
        );
        setPage(0);
        setHasMore(nextHasMore);
        setFeedOffline(fromCache && items.length > 0);
        setFeedError(fromCache && items.length === 0);
        if (showFeedback && !fromCache) {
          setRefreshNotice(true);
          setTimeout(() => setRefreshNotice(false), 2200);
        }
      } catch {
        setFeedError(!servedCachedFeed);
        setFeedOffline(servedCachedFeed);
      } finally {
        loadingRef.current = false;
        setRefreshing(false);
      }
    },
    [feedMode, preferences],
  );

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await getFeedPage(nextPage, 3);
      setFeed((items) => {
        const merged = [...items, ...result.items];
        return rankFeed(
          [...new Map(merged.map((item) => [item.id, item])).values()],
          feedMode,
          { ...buildFeedPreferences(currentUser), ...preferences },
        );
      });
      setPage(nextPage);
      setHasMore(result.hasMore);
      setFeedOffline(result.fromCache);
      setFeedError(result.fromCache && !result.items.length);
    } catch {
      setFeedError(true);
    } finally {
      loadingRef.current = false;
      setLoadingMore(false);
    }
  }, [feedMode, hasMore, page, preferences]);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const findScrollableParent = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return null;
      let node: HTMLElement | null = target;
      while (node && node !== document.body) {
        const style = window.getComputedStyle(node);
        if (
          (style.overflowY === "auto" || style.overflowY === "scroll") &&
          node.scrollHeight > node.clientHeight
        )
          return node;
        node = node.parentElement;
      }
      return null;
    };
    const onDocumentTouchStart = (event: globalThis.TouchEvent) => {
      const touch = event.touches[0];
      const scroller = findScrollableParent(event.target);
      if (
        touch &&
        scroller &&
        scroller.scrollTop <= 0 &&
        scrollOffsetY.current <= 0 &&
        !refreshing
      )
        webPullStartY.current = touch.pageY;
    };
    const onDocumentTouchMove = (event: globalThis.TouchEvent) => {
      const touch = event.touches[0];
      if (!touch || webPullStartY.current === null) return;
      const distance = Math.max(
        0,
        Math.min(96, touch.pageY - webPullStartY.current),
      );
      webPullDistanceRef.current = distance;
      setWebPullDistance(distance);
    };
    const onDocumentTouchEnd = () => {
      if (webPullStartY.current === null) return;
      const shouldRefresh = webPullDistanceRef.current >= 64;
      webPullStartY.current = null;
      webPullDistanceRef.current = 0;
      setWebPullDistance(0);
      if (shouldRefresh) void reloadFeed(true);
    };
    document.addEventListener("touchstart", onDocumentTouchStart, {
      passive: true,
    });
    document.addEventListener("touchmove", onDocumentTouchMove, {
      passive: true,
    });
    document.addEventListener("touchend", onDocumentTouchEnd, {
      passive: true,
    });
    document.addEventListener("touchcancel", onDocumentTouchEnd, {
      passive: true,
    });
    return () => {
      document.removeEventListener("touchstart", onDocumentTouchStart);
      document.removeEventListener("touchmove", onDocumentTouchMove);
      document.removeEventListener("touchend", onDocumentTouchEnd);
      document.removeEventListener("touchcancel", onDocumentTouchEnd);
    };
  }, [refreshing, reloadFeed]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    let disposed = false;
    const syncInBackground = () => {
      if (disposed || loadingRef.current) return;
      void syncFeedCache().catch(() => undefined);
    };
    const stop = () => {
      if (interval) clearInterval(interval);
      interval = null;
    };
    const start = () => {
      stop();
      syncInBackground();
      interval = setInterval(
        syncInBackground,
        FEED_BACKGROUND_SYNC_INTERVAL_MS,
      );
    };
    const subscription = AppState.addEventListener("change", (nextState) =>
      nextState === "active" ? start() : stop(),
    );
    if (AppState.currentState === "active") start();
    return () => {
      disposed = true;
      stop();
      subscription.remove();
    };
  }, []);

  const handleCardLayout = useCallback(
    (postId: string, event: LayoutChangeEvent) => {
      cardLayouts.current[postId] = {
        y: event.nativeEvent.layout.y,
        height: event.nativeEvent.layout.height,
      };
    },
    [],
  );
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } =
        event.nativeEvent;
      scrollOffsetY.current = contentOffset.y;
      const viewportTop = contentOffset.y;
      const viewportBottom = viewportTop + layoutMeasurement.height;
      let bestId: string | null = null;
      let bestVisibility = 0;
      for (const post of feed) {
        if (!post.videoUrl) continue;
        const layout = cardLayouts.current[post.id];
        if (!layout) continue;
        const visibleHeight = Math.max(
          0,
          Math.min(layout.y + layout.height, viewportBottom) -
            Math.max(layout.y, viewportTop),
        );
        const visibility = visibleHeight / layout.height;
        if (visibility > bestVisibility) {
          bestVisibility = visibility;
          bestId = post.id;
        }
      }
      setActiveVideo(bestVisibility >= 0.35 ? bestId : null);
      if (
        contentOffset.y + layoutMeasurement.height >=
        contentSize.height - 520
      )
        void loadMore();
    },
    [feed, loadMore, setActiveVideo],
  );
  const handleWebTouchStart = (
    event: NativeSyntheticEvent<NativeTouchEvent>,
  ) => {
    if (Platform.OS === "web" && scrollOffsetY.current <= 0 && !refreshing)
      webPullStartY.current = event.nativeEvent.pageY;
  };
  const handleWebTouchMove = (
    event: NativeSyntheticEvent<NativeTouchEvent>,
  ) => {
    if (Platform.OS !== "web" || webPullStartY.current === null) return;
    const distance = Math.max(
      0,
      Math.min(96, event.nativeEvent.pageY - webPullStartY.current),
    );
    webPullDistanceRef.current = distance;
    setWebPullDistance(distance);
  };
  const handleWebTouchEnd = () => {
    if (Platform.OS !== "web") return;
    const shouldRefresh = webPullDistanceRef.current >= 64;
    webPullStartY.current = null;
    webPullDistanceRef.current = 0;
    setWebPullDistance(0);
    if (shouldRefresh) void reloadFeed(true);
  };
  const toggleLike = useCallback((id: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFeed((items) =>
      items.map((post) =>
        post.id === id
          ? {
              ...post,
              likedByMe: !post.likedByMe,
              likes: post.likes + (post.likedByMe ? -1 : 1),
            }
          : post,
      ),
    );
  }, []);

  return {
    repositoryMode,
    feed,
    feedMode,
    setFeedMode,
    loadingMore,
    refreshing,
    feedError,
    feedOffline,
    refreshNotice,
    hiddenPostIds,
    setHiddenPostIds,
    hasMore,
    activeVideoId,
    webPullDistance,
    reloadFeed,
    loadMore,
    handleScroll,
    handleWebTouchStart,
    handleWebTouchMove,
    handleWebTouchEnd,
    handleCardLayout,
    toggleLike,
  };
}
