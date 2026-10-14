import { MaterialIcons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Animated, Modal, Platform, Pressable, RefreshControl, ScrollView, Share, StyleSheet, Text, TextInput, View, type LayoutChangeEvent, type NativeScrollEvent, type NativeSyntheticEvent, type NativeTouchEvent } from "react-native";
import { Avatar } from "@/components/apongram/Avatar";
import { PostCard } from "@/components/apongram/PostCard";
import { TopicChip } from "@/components/apongram/TopicChip";
import { Logo } from "@/components/Logo";
import { ScreenContainer } from "@/components/screen-container";
import { Colors } from "@/constants/theme";
import { getFeedPage, repositoryMode } from "@/lib/apongram/repository";
import { currentUser, demoStories, profiles, topics } from "@/lib/apongram/mock-data";
import { buildFeedPreferences, rankFeed, type FeedMode } from "@/lib/apongram/feed-ranking";
import { useFeedPreferences } from "@/lib/apongram/FeedPreferencesContext";
import { useLanguage } from "@/lib/apongram/LanguageContext";
import { getViewedStoryIds, markStoryViewed } from "@/lib/apongram/story-view-state";
import type { Post } from "@/lib/apongram/types";

const C = { ...Colors.light, card: Colors.light.paper, ink: Colors.light.inkNavy, muted: Colors.light.slate, terra: Colors.light.terracotta, line: Colors.light.line, green: Colors.light.leafGreen };
const STORY_VIDEO_SOURCES: Record<string, number> = { "ekta-demo://market": require("../../assets/videos/reel-market.mp4") };

function StoryVideo({ uri, paused, language }: { uri: string | number; paused: boolean; language: "bn" | "en" }) {
  const player = useVideoPlayer(typeof uri === "string" ? STORY_VIDEO_SOURCES[uri] ?? uri : uri, (instance) => { instance.loop = true; instance.muted = false; instance.timeUpdateEventInterval = 0.25; });
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (paused) player.pause();
    else player.play();
    return () => player.pause();
  }, [paused, player]);
  useEffect(() => {
    const statusSubscription = player.addListener("statusChange", ({ status: nextStatus }) => {
      setStatus(nextStatus === "error" ? "error" : nextStatus === "readyToPlay" ? "ready" : "loading");
    });
    const progressSubscription = player.addListener("timeUpdate", ({ currentTime }) => {
      setProgress(player.duration > 0 ? Math.min(1, currentTime / player.duration) : 0);
    });
    return () => { statusSubscription.remove(); progressSubscription.remove(); };
  }, [player]);
  return <View style={styles.storyVideoFrame}>
    {status === "error" ? <View style={styles.storyVideoFallback}><MaterialIcons name="broken-image" size={35} color={C.ochre} /><Text style={styles.storyVideoFallbackTitle}>{language === "bn" ? "ভিডিও চালানো যাচ্ছে না" : "Video unavailable"}</Text><Text style={styles.storyVideoFallbackText}>{language === "bn" ? "এই story-টি পরে আবার চেষ্টা করুন।" : "Try this story again later."}</Text></View> : <VideoView player={player} style={styles.storyVideo} contentFit="contain" nativeControls={false} />}
    {status === "loading" ? <View style={styles.storyVideoLoading}><ActivityIndicator color={C.ivory} /><Text style={styles.storyVideoLoadingText}>{language === "bn" ? "ভিডিও লোড হচ্ছে…" : "Loading video…"}</Text></View> : null}
    {status === "ready" ? <View style={styles.storyVideoProgress}><View style={[styles.storyVideoProgressFill, { width: `${progress * 100}%` }]} /></View> : null}
  </View>;
}

function FeedSkeleton() {
  const [opacity] = useState(() => new Animated.Value(0.42));
  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(opacity, { toValue: 0.9, duration: 750, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0.42, duration: 750, useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [opacity]);
  return <View accessibilityLabel="Loading feed" accessible>
    {[0, 1].map((item) => <Animated.View key={item} style={[styles.skeletonCard, { opacity }]}>
      <View style={styles.skeletonHeader}><View style={styles.skeletonAvatar} /><View style={styles.skeletonHeaderCopy}><View style={styles.skeletonName} /><View style={styles.skeletonMeta} /></View><View style={styles.skeletonMenu} /></View>
      <View style={styles.skeletonLineWide} /><View style={styles.skeletonLine} /><View style={styles.skeletonMedia} /><View style={styles.skeletonLocation} /><View style={styles.skeletonTags}><View style={styles.skeletonTag} /><View style={styles.skeletonTagShort} /></View><View style={styles.skeletonActions}><View style={styles.skeletonAction} /><View style={styles.skeletonAction} /><View style={styles.skeletonActionSmall} /></View>
    </Animated.View>)}
  </View>;
}

export default function HomeScreen() {
  const router = useRouter();
  const { language, toggleLanguage, copy } = useLanguage();
  const bodyFont = language === "bn" ? "HindSiliguri" : "HindSiliguriLatin";
  const mediumFont = language === "bn" ? "HindSiliguriSemiBold" : "HindSiliguriLatinSemiBold";
  const headingFont = language === "bn" ? "NotoSerifBengaliBold" : "Fraunces";
  const { preferences } = useFeedPreferences();
  const [feed, setFeed] = useState<Post[]>([]);
  const [feedMode, setFeedMode] = useState<FeedMode>("relevant");
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [feedError, setFeedError] = useState(false);
  const [feedOffline, setFeedOffline] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState(false);
  const [hiddenPostIds, setHiddenPostIds] = useState<string[]>([]);
  const [viewedStoryIds, setViewedStoryIds] = useState<string[]>([]);
  const [storyViewerId, setStoryViewerId] = useState<string | null>(null);
  const [storyPaused, setStoryPaused] = useState(false);
  const [storyNow] = useState(() => Date.now());
  const [storyReply, setStoryReply] = useState("");
  const [storyReplySent, setStoryReplySent] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [webPullDistance, setWebPullDistance] = useState(0);
  const loadingRef = useRef(false);
  const activeVideoRef = useRef<string | null>(null);
  const webPullStartY = useRef<number | null>(null);
  const webPullDistanceRef = useRef(0);
  const storyTouchStartX = useRef<number | null>(null);
  const scrollOffsetY = useRef(0);
  const cardLayouts = useRef<Record<string, { y: number; height: number }>>({});

  const setActiveVideo = useCallback((id: string | null) => {
    if (activeVideoRef.current === id) return;
    activeVideoRef.current = id;
    setActiveVideoId(id);
  }, []);

  useEffect(() => {
    const firstVideo = feed.find((post) => post.videoUrl);
    if (!firstVideo || (activeVideoRef.current && feed.some((post) => post.id === activeVideoRef.current && post.videoUrl))) return;
    setActiveVideo(firstVideo.id);
  }, [feed, setActiveVideo]);

  const reloadFeed = useCallback(async (showFeedback = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setRefreshing(true);
    setFeedError(false);
    try {
      const { items, hasMore: nextHasMore, fromCache } = await getFeedPage(0, 3);
      setFeed(rankFeed(items, feedMode, { ...buildFeedPreferences(currentUser), ...preferences }));
      setPage(0);
      setHasMore(nextHasMore);
      setFeedOffline(fromCache && items.length > 0);
      setFeedError(fromCache && items.length === 0);
      if (showFeedback && !fromCache) {
        setRefreshNotice(true);
        setTimeout(() => setRefreshNotice(false), 2200);
      }
    } catch {
      setFeedError(true);
    } finally {
      loadingRef.current = false;
      setRefreshing(false);
    }
  }, [feedMode, preferences]);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const findScrollableParent = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return null;
      let node: HTMLElement | null = target;
      while (node && node !== document.body) {
        const style = window.getComputedStyle(node);
        if ((style.overflowY === "auto" || style.overflowY === "scroll") && node.scrollHeight > node.clientHeight) return node;
        node = node.parentElement;
      }
      return null;
    };
    const onDocumentTouchStart = (event: globalThis.TouchEvent) => {
      const touch = event.touches[0];
      const scroller = findScrollableParent(event.target);
      if (touch && scroller && scroller.scrollTop <= 0 && scrollOffsetY.current <= 0 && !refreshing) webPullStartY.current = touch.pageY;
    };
    const onDocumentTouchMove = (event: globalThis.TouchEvent) => {
      const touch = event.touches[0];
      if (!touch || webPullStartY.current === null) return;
      const distance = Math.max(0, Math.min(96, touch.pageY - webPullStartY.current));
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
    document.addEventListener("touchstart", onDocumentTouchStart, { passive: true });
    document.addEventListener("touchmove", onDocumentTouchMove, { passive: true });
    document.addEventListener("touchend", onDocumentTouchEnd, { passive: true });
    document.addEventListener("touchcancel", onDocumentTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onDocumentTouchStart);
      document.removeEventListener("touchmove", onDocumentTouchMove);
      document.removeEventListener("touchend", onDocumentTouchEnd);
      document.removeEventListener("touchcancel", onDocumentTouchEnd);
    };
  }, [refreshing, reloadFeed]);

  useFocusEffect(useCallback(() => {
    void reloadFeed();
  }, [reloadFeed]));

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await getFeedPage(nextPage, 3);
      setFeed((items) => {
        const merged = [...items, ...result.items];
        return rankFeed([...new Map(merged.map((item) => [item.id, item])).values()], feedMode, { ...buildFeedPreferences(currentUser), ...preferences });
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

  const handleCardLayout = useCallback((postId: string, event: LayoutChangeEvent) => {
    cardLayouts.current[postId] = { y: event.nativeEvent.layout.y, height: event.nativeEvent.layout.height };
  }, []);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    scrollOffsetY.current = contentOffset.y;
    const viewportTop = contentOffset.y;
    const viewportBottom = viewportTop + layoutMeasurement.height;
    let bestId: string | null = null;
    let bestVisibility = 0;
    for (const post of feed) {
      if (!post.videoUrl) continue;
      const layout = cardLayouts.current[post.id];
      if (!layout) continue;
      const visibleHeight = Math.max(0, Math.min(layout.y + layout.height, viewportBottom) - Math.max(layout.y, viewportTop));
      const visibility = visibleHeight / layout.height;
      if (visibility > bestVisibility) {
        bestVisibility = visibility;
        bestId = post.id;
      }
    }
    setActiveVideo(bestVisibility >= 0.35 ? bestId : null);
    if (contentOffset.y + layoutMeasurement.height >= contentSize.height - 520) void loadMore();
  }, [feed, loadMore, setActiveVideo]);

  const handleWebTouchStart = (event: NativeSyntheticEvent<NativeTouchEvent>) => {
    if (Platform.OS === "web" && scrollOffsetY.current <= 0 && !refreshing) webPullStartY.current = event.nativeEvent.pageY;
  };
  const handleWebTouchMove = (event: NativeSyntheticEvent<NativeTouchEvent>) => {
    if (Platform.OS !== "web" || webPullStartY.current === null) return;
    const distance = Math.max(0, Math.min(96, event.nativeEvent.pageY - webPullStartY.current));
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

  const toggleLike = (id: string) => setFeed((items) => items.map((post) => post.id === id
    ? { ...post, likedByMe: !post.likedByMe, likes: post.likes + (post.likedByMe ? -1 : 1) }
    : post));

  const storyPeople = useMemo(() => [currentUser, ...profiles.slice(1, 5)].filter((person) => {
    const authoredStories = demoStories.filter((story) => story.author.id === person.id);
    return !authoredStories.length || authoredStories.some((story) => !story.storyExpiresAt || new Date(story.storyExpiresAt).getTime() > storyNow);
  }), [storyNow]);
  useEffect(() => {
    let mounted = true;
    void getViewedStoryIds().then((ids) => { if (mounted) setViewedStoryIds(ids); });
    return () => { mounted = false; };
  }, []);

  const rememberStoryViewed = (personId: string) => {
    setViewedStoryIds((ids) => ids.includes(personId) ? ids : [...ids, personId]);
    void markStoryViewed(personId);
  };

  const openStory = (personId: string, isOwnStory: boolean) => {
    if (isOwnStory) {
      router.push("/(tabs)/create");
      return;
    }
    rememberStoryViewed(personId);
    setStoryPaused(false);
    setStoryViewerId(personId);
  };
  const storyViewer = storyPeople.find((person) => person.id === storyViewerId);
  const storyPost = storyViewer ? demoStories.find((story) => story.author.id === storyViewer.id && (!story.storyExpiresAt || new Date(story.storyExpiresAt).getTime() > storyNow)) : undefined;
  const storyIndex = storyViewerId ? storyPeople.findIndex((person) => person.id === storyViewerId) : -1;
  const moveStory = (direction: -1 | 1) => {
    if (storyIndex < 0) return;
    const nextIndex = storyIndex + direction;
    if (nextIndex < 0 || nextIndex >= storyPeople.length) return;
    const nextPerson = storyPeople[nextIndex];
    rememberStoryViewed(nextPerson.id);
    setStoryPaused(false);
    setStoryViewerId(nextPerson.id);
  };
  const closeStory = () => { setStoryViewerId(null); setStoryPaused(false); setStoryReply(""); setStoryReplySent(false); };
  const sendStoryReply = () => { if (!storyReply.trim()) return; setStoryReply(""); setStoryReplySent(true); };
  const shareStory = async () => {
    if (!storyViewer) return;
    const message = `${storyPost?.body ?? `A community update from ${storyViewer.region}`}\n@${storyViewer.handle} · ${storyViewer.region}\nhttps://ekta.app/story/${encodeURIComponent(storyViewer.id)}`;
    try { await Share.share({ message }); } catch { /* share sheet dismissed */ }
  };
  const handleStoryTouchStart = (event: NativeSyntheticEvent<NativeTouchEvent>) => { storyTouchStartX.current = event.nativeEvent.pageX; };
  const handleStoryTouchEnd = (event: NativeSyntheticEvent<NativeTouchEvent>) => {
    const startX = storyTouchStartX.current;
    storyTouchStartX.current = null;
    if (startX === null) return;
    const distance = event.nativeEvent.pageX - startX;
    if (Math.abs(distance) < 50) return;
    moveStory(distance < 0 ? 1 : -1);
  };
  useEffect(() => {
    if (!storyViewerId || storyPaused || storyIndex < 0) return;
    const timer = setTimeout(() => {
      const nextIndex = storyIndex + 1;
      if (nextIndex >= storyPeople.length) {
        closeStory();
        return;
      }
      const nextPerson = storyPeople[nextIndex];
      rememberStoryViewed(nextPerson.id);
      setStoryViewerId(nextPerson.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [storyIndex, storyPaused, storyPeople, storyViewerId]);

  return (
      <ScreenContainer safeAreaClassName="bg-background" className="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container} onScroll={handleScroll} onTouchStart={handleWebTouchStart} onTouchMove={handleWebTouchMove} onTouchEnd={handleWebTouchEnd} scrollEventThrottle={16} decelerationRate={Platform.OS === "ios" ? 0.985 : "normal"} overScrollMode="never" bounces keyboardShouldPersistTaps="handled" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void reloadFeed(true)} tintColor={C.terra} colors={[C.terra]} progressBackgroundColor={C.paper} /> }>
        {Platform.OS === "web" && webPullDistance > 0 ? <View style={{ height: Math.min(webPullDistance, 72), alignItems: "center", justifyContent: "center", overflow: "hidden" }}><MaterialIcons name={webPullDistance >= 64 ? "refresh" : "arrow-downward"} size={18} color={C.terra} /><Text style={{ color: C.terra, fontFamily: bodyFont, fontSize: 10, marginTop: 2 }}>{webPullDistance >= 64 ? copy.releaseToRefresh : copy.pullToRefresh}</Text></View> : null}
        <View style={styles.topbar}>
          <View style={styles.brandRow}><Logo variant="horizontal" width={94} height={30} accessibilityLabel="eKta" /></View>
          <View style={styles.topActions}>
            <Pressable onPress={toggleLanguage} style={styles.lang}><Text style={[styles.langText, { fontFamily: mediumFont }]}>{language === "bn" ? "EN" : "বাং"}</Text></Pressable>
            <Pressable onPress={() => router.push("/(tabs)/discover")} accessibilityLabel={copy.discover}><MaterialIcons name="search" size={23} color={C.ink} /></Pressable>
            <Pressable onPress={() => router.push("/(tabs)/alerts")} accessibilityLabel={copy.alerts}><MaterialIcons name="notifications-none" size={23} color={C.ink} /></Pressable>
            <Pressable onPress={() => router.push("/(tabs)/create")} accessibilityRole="button" accessibilityLabel={language === "bn" ? "নতুন পোস্ট তৈরি করুন" : "Create a new post"} style={styles.createIcon}><MaterialIcons name="add" size={23} color={C.terra} /></Pressable>
            {Platform.OS === "web" ? <Pressable onPress={() => void reloadFeed(true)} accessibilityRole="button" accessibilityLabel={copy.refreshFeed} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}><MaterialIcons name="refresh" size={21} color={C.terra} /></Pressable> : null}
            <Pressable onPress={() => router.push("/(tabs)/profile")}><Avatar profile={currentUser} size={32} /></Pressable>
          </View>
        </View>

        <View style={styles.storyHeader}>
          <Text style={[styles.sectionTitle, { fontFamily: headingFont }]}>{language === "bn" ? "স্টোরি" : "Stories"}</Text>
          <Text style={[styles.storyHint, { fontFamily: bodyFont }]}>{language === "bn" ? "২৪ ঘণ্টা" : "24 hours"}</Text>
          <View style={styles.storyHeaderSpacer} />
          <Pressable onPress={() => router.push("/(tabs)/reels")} style={styles.watchReels} accessibilityLabel={copy.reels}>
            <MaterialIcons name="movie" size={15} color={C.terra} />
            <Text style={[styles.watchReelsText, { fontFamily: mediumFont }]}>{copy.reels}</Text>
            <MaterialIcons name="chevron-right" size={15} color={C.terra} />
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storyRail}>
          {storyPeople.map((person, index) => (
            <Pressable key={person.id} onPress={() => openStory(person.id, index === 0)} style={styles.storyItem} accessibilityRole="button" accessibilityLabel={index === 0 ? (language === "bn" ? "আপনার স্টোরি তৈরি করুন" : "Create your story") : `View ${person.name}'s story`}>
              <View style={[styles.storyRing, index === 0 && styles.storyRingOwn, viewedStoryIds.includes(person.id) && styles.storyRingViewed]}>
                <Avatar profile={person} size={48} />
                {index === 0 && <View style={styles.storyPlus}><MaterialIcons name="add" size={12} color="#FFF" /></View>}
              </View>
              <Text numberOfLines={1} style={[styles.storyName, { fontFamily: bodyFont }]}>{index === 0 ? (language === "bn" ? "আপনার স্টোরি" : "Your story") : person.name.split(" ")[0]}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.hero}><Text style={[styles.heroTitle, { fontFamily: headingFont }]}>{copy.goodMorning}</Text><Text style={[styles.heroSub, { fontFamily: bodyFont }]}>{copy.feedIntro}</Text></View>
        {repositoryMode === "demo" && <View style={styles.demoBanner}><MaterialIcons name="info-outline" size={17} color={C.terra} /><Text style={[styles.demoText, { fontFamily: bodyFont }]}>{copy.demoModeText}</Text></View>}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.topics}>
          {topics.map((topic) => <TopicChip key={topic} label={topic} onPress={() => router.push({ pathname: "/(tabs)/discover", params: { q: topic } })} />)}
        </ScrollView>
        <View style={styles.feedHeader}>
          <Text style={[styles.sectionTitle, { fontFamily: headingFont }]}>{language === "bn" ? "আপনার জন্য" : "For you"}</Text>
          <View style={styles.feedModes}>
            <Pressable onPress={() => setFeedMode("relevant")} style={[styles.feedMode, feedMode === "relevant" && styles.feedModeActive]} accessibilityLabel={language === "bn" ? "প্রাসঙ্গিক ফিড" : "Relevant feed"}>
              <Text style={[styles.feedModeText, { fontFamily: mediumFont }, feedMode === "relevant" && styles.feedModeTextActive]}>{language === "bn" ? "প্রাসঙ্গিক" : "For you"}</Text>
            </Pressable>
            <Pressable onPress={() => setFeedMode("latest")} style={[styles.feedMode, feedMode === "latest" && styles.feedModeActive]} accessibilityLabel={copy.latest}>
              <Text style={[styles.feedModeText, { fontFamily: mediumFont }, feedMode === "latest" && styles.feedModeTextActive]}>{copy.latest}</Text>
            </Pressable>
          </View>
        </View>
        {feedOffline ? <View style={styles.offlineBanner} accessibilityLiveRegion="polite"><MaterialIcons name="cloud-off" size={17} color={C.terra} /><Text style={[styles.offlineText, { fontFamily: bodyFont }]}>{copy.offlineBanner}</Text><Pressable onPress={() => void reloadFeed(true)} accessibilityRole="button" accessibilityLabel={copy.retry}><Text style={[styles.offlineRetry, { fontFamily: mediumFont }]}>{copy.retry}</Text></Pressable></View> : null}
        {feedError ? <View style={styles.errorCard} accessibilityRole="alert"><View style={styles.errorIcon}><MaterialIcons name="cloud-off" size={24} color={C.terra} /></View><View style={styles.errorCopy}><Text style={[styles.errorTitle, { fontFamily: mediumFont }]}>{copy.feedErrorTitle}</Text><Text style={[styles.errorBody, { fontFamily: bodyFont }]}>{copy.feedErrorBody}</Text></View><Pressable onPress={() => void reloadFeed(true)} style={styles.retryButton} accessibilityRole="button" accessibilityLabel={copy.retry}><Text style={[styles.retryText, { fontFamily: mediumFont }]}>{copy.retry}</Text></Pressable></View> : null}
        {refreshing && !feed.length ? <FeedSkeleton /> : null}
        {feed.filter((post) => !hiddenPostIds.includes(post.id)).map((post) => <PostCard key={post.id} post={post} copy={copy} isVideoActive={activeVideoId === post.id} onLayout={(event) => handleCardLayout(post.id, event)} onOpen={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })} onAuthor={() => router.push({ pathname: "/(tabs)/profile", params: { id: post.author.id } })} onHide={() => setHiddenPostIds((ids) => [...ids, post.id])} onLike={() => toggleLike(post.id)} onReport={() => router.push({ pathname: "/report", params: { postId: post.id } })} />)}
        {loadingMore ? <View style={styles.feedFooter}><ActivityIndicator color={C.terra} /><Text style={[styles.footerText, { fontFamily: bodyFont }]}>{language === "bn" ? "আরও আপডেট আসছে..." : "Loading more updates…"}</Text></View> : null}
        {!loadingMore && !hasMore && feed.length ? <Text style={[styles.endText, { fontFamily: bodyFont }]}>{language === "bn" ? "এখানেই আপাতত শেষ।" : "You’re all caught up for now."}</Text> : null}
      </ScrollView>
      <Modal visible={Boolean(storyViewer)} animationType="fade" presentationStyle="fullScreen" onRequestClose={closeStory}>
        <View style={styles.storyViewer}>
          <View style={styles.storyProgressRow}>{storyPeople.map((person, index) => <View key={person.id} style={[styles.storyProgressTrack, index === storyIndex && styles.storyProgressCurrent, index < storyIndex && styles.storyProgressSeen]} />)}</View>
          <View style={styles.storyViewerHeader}><Avatar profile={storyViewer ?? currentUser} size={38} /><View style={styles.storyViewerCopy}><Text style={[styles.storyViewerName, { fontFamily: mediumFont }]}>{storyViewer?.name}</Text><Text style={[styles.storyViewerMeta, { fontFamily: bodyFont }]}>{storyPost?.createdAt ?? "now"} · {storyViewer?.region}</Text></View><Pressable onPress={() => setStoryPaused((paused) => !paused)} style={styles.storyClose} accessibilityRole="button" accessibilityLabel={storyPaused ? (language === "bn" ? "স্টোরি চালু করুন" : "Resume story") : (language === "bn" ? "স্টোরি থামান" : "Pause story")}><MaterialIcons name={storyPaused ? "play-arrow" : "pause"} size={23} color="#FFF" /></Pressable><Pressable onPress={closeStory} style={styles.storyClose} accessibilityRole="button" accessibilityLabel={language === "bn" ? "স্টোরি বন্ধ করুন" : "Close story"}><MaterialIcons name="close" size={25} color="#FFF" /></Pressable></View>
          <View style={styles.storyViewerBody} onTouchStart={handleStoryTouchStart} onTouchEnd={handleStoryTouchEnd}><Pressable onPress={() => moveStory(-1)} style={styles.storyNavLeft} disabled={storyIndex <= 0} accessibilityRole="button" accessibilityLabel={language === "bn" ? "আগের স্টোরি" : "Previous story"}><MaterialIcons name="chevron-left" size={38} color={storyIndex <= 0 ? "rgba(255,255,255,0.2)" : "#FFF"} /></Pressable><View style={styles.storyViewerCopyBody}>{storyPost?.videoUrl ? <StoryVideo uri={storyPost.videoUrl} paused={storyPaused} language={language} /> : <MaterialIcons name="auto-stories" size={54} color={C.ochre} />}<Text style={[styles.storyViewerTitle, { fontFamily: headingFont }]}>{storyViewer?.name}</Text><Text style={[styles.storyViewerText, { fontFamily: bodyFont }]}>{storyPost?.body ?? (language === "bn" ? `${storyViewer?.region} থেকে একটি community update` : `A community update from ${storyViewer?.region}`)}</Text><Text style={[styles.storyViewerHint, { fontFamily: bodyFont }]}>{storyPost?.videoUrl ? (storyPaused ? (language === "bn" ? "ভিডিও পজ করা হয়েছে · play চাপুন" : "Video paused · press play") : (language === "bn" ? "ভিডিও চলছে · swipe করে story বদলান" : "Video playing · swipe to change story")) : (storyPaused ? (language === "bn" ? "পজ করা হয়েছে · play চাপুন" : "Paused · press play") : (language === "bn" ? "আগে/পরে যেতে swipe করুন" : "Swipe to navigate"))}</Text></View><Pressable onPress={() => moveStory(1)} style={styles.storyNavRight} disabled={storyIndex >= storyPeople.length - 1} accessibilityRole="button" accessibilityLabel={language === "bn" ? "পরের স্টোরি" : "Next story"}><MaterialIcons name="chevron-right" size={38} color={storyIndex >= storyPeople.length - 1 ? "rgba(255,255,255,0.2)" : "#FFF"} /></Pressable></View>
          <View style={styles.storyActions}><Pressable onPress={() => setStoryReplySent(false)} style={styles.storyAction} accessibilityRole="button" accessibilityLabel={language === "bn" ? "স্টোরিতে উত্তর দিন" : "Reply to story"}><MaterialIcons name="chat-bubble-outline" size={19} color={C.ivory} /><Text style={[styles.storyActionText, { fontFamily: mediumFont }]}>{language === "bn" ? "উত্তর" : "Reply"}</Text></Pressable><Pressable onPress={() => void shareStory()} style={styles.storyAction} accessibilityRole="button" accessibilityLabel={language === "bn" ? "স্টোরি শেয়ার করুন" : "Share story"}><MaterialIcons name="share" size={19} color={C.ivory} /><Text style={[styles.storyActionText, { fontFamily: mediumFont }]}>{language === "bn" ? "শেয়ার" : "Share"}</Text></Pressable><Pressable onPress={() => { closeStory(); router.push({ pathname: "/report", params: { storyId: storyViewer?.id ?? "" } }); }} style={styles.storyAction} accessibilityRole="button" accessibilityLabel={language === "bn" ? "স্টোরি রিপোর্ট করুন" : "Report story"}><MaterialIcons name="flag" size={19} color={C.ivory} /><Text style={[styles.storyActionText, { fontFamily: mediumFont }]}>{language === "bn" ? "রিপোর্ট" : "Report"}</Text></Pressable></View>
          {storyReplySent ? <Text style={[styles.storyReplySent, { fontFamily: bodyFont }]}>{language === "bn" ? "আপনার উত্তর পাঠানো হয়েছে (নমুনা)।" : "Your reply was sent (demo)."}</Text> : <View style={styles.storyReplyRow}><TextInput value={storyReply} onChangeText={setStoryReply} placeholder={language === "bn" ? "উত্তর লিখুন…" : "Reply to this story…"} placeholderTextColor="rgba(255,255,255,0.55)" style={[styles.storyReplyInput, { fontFamily: bodyFont }]} returnKeyType="send" onSubmitEditing={sendStoryReply} /><Pressable onPress={sendStoryReply} disabled={!storyReply.trim()} accessibilityRole="button" accessibilityLabel={language === "bn" ? "উত্তর পাঠান" : "Send reply"}><MaterialIcons name="send" size={20} color={storyReply.trim() ? C.ochre : "rgba(255,255,255,0.35)"} /></Pressable></View>}
        </View>
      </Modal>
      {refreshNotice ? <View style={styles.toast} accessibilityRole="alert"><MaterialIcons name="check-circle" size={18} color="#FFF" /><Text style={[styles.toastText, { fontFamily: mediumFont }]}>{language === "bn" ? "ফিড আপডেট হয়েছে" : "Feed updated"}</Text></View> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 18, paddingBottom: 32 },
  topbar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 10, paddingBottom: 4 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  wordmarkWrap: { flexDirection: "row", alignItems: "center", gap: 4 },
  topActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  createIcon: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: C.primaryContainer, borderWidth: 1, borderColor: C.line },
  lang: { borderWidth: 1, borderColor: C.line, borderRadius: 15, paddingHorizontal: 9, paddingVertical: 6, backgroundColor: C.card },
  langText: { color: C.terra, fontSize: 11, fontWeight: "800" },
  hero: { paddingTop: 22, paddingBottom: 15 },
  heroTitle: { color: C.ink, fontSize: 26, lineHeight: 33, fontFamily: "Georgia", fontWeight: "700" },
  heroSub: { color: C.muted, fontSize: 13, lineHeight: 19, marginTop: 5 },
  demoBanner: { backgroundColor: C.primaryContainer, borderRadius: 16, padding: 12, flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 11, borderWidth: 1, borderColor: C.line },
  demoText: { color: C.muted, fontSize: 11, lineHeight: 16, flex: 1 },
  composer: { backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, borderRadius: 20, padding: 13, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 17, shadowColor: C.ink, shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  composerText: { flex: 1, color: C.muted, fontSize: 13 },
  storyHeader: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 9 },
  storyHint: { color: C.muted, fontSize: 10 },
  storyHeaderSpacer: { flex: 1 },
  watchReels: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, backgroundColor: C.primaryContainer },
  watchReelsText: { color: C.terra, fontSize: 10, fontWeight: "900" },
  storyRail: { marginBottom: 15, flexGrow: 0 },
  storyItem: { width: 68, alignItems: "center", marginRight: 8 },
  storyRing: { borderWidth: 3, borderColor: C.terra, borderRadius: 33, padding: 2, position: "relative" },
  storyRingOwn: { borderColor: C.green },
  storyRingViewed: { borderColor: C.muted, opacity: 0.72 },
  storyPlus: { position: "absolute", right: -1, bottom: -1, width: 17, height: 17, borderRadius: 9, backgroundColor: C.terra, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: C.card },
  storyName: { color: C.muted, fontSize: 10, marginTop: 5, maxWidth: 66, textAlign: "center" },
  topics: { marginBottom: 17, flexGrow: 0 },
  feedHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 13, paddingTop: 2 },
  sectionTitle: { color: C.ink, fontSize: 16, fontFamily: "Georgia", fontWeight: "700" },
  feedModes: { flex: 1, flexDirection: "row", justifyContent: "flex-end", gap: 4 },
  feedMode: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5 },
  feedModeActive: { backgroundColor: C.primaryContainer },
  feedModeText: { color: C.muted, fontSize: 10, fontWeight: "800" },
  feedModeTextActive: { color: C.terra },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.green, marginLeft: 5 },
  liveText: { color: C.muted, fontSize: 10, fontWeight: "700" },
  toast: { position: "absolute", bottom: 28, left: 18, right: 18, backgroundColor: C.green, padding: 13, borderRadius: 14, flexDirection: "row", alignItems: "center", gap: 8 },
  toastText: { color: "#FFF", fontWeight: "700", fontSize: 13 },
  storyViewer: { flex: 1, backgroundColor: C.ink, paddingTop: 54, paddingHorizontal: 18 },
  storyProgressRow: { height: 3, flexDirection: "row", gap: 4 },
  storyProgressTrack: { flex: 1, height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.3)" },
  storyProgressCurrent: { backgroundColor: C.ivory },
  storyProgressSeen: { backgroundColor: "rgba(255,255,255,0.72)" },
  storyViewerHeader: { flexDirection: "row", alignItems: "center", marginTop: 16, gap: 10 },
  storyViewerCopy: { flex: 1 },
  storyViewerName: { color: C.ivory, fontSize: 14, fontWeight: "800" },
  storyViewerMeta: { color: "rgba(255,255,255,0.68)", fontSize: 11, marginTop: 2 },
  storyClose: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  storyViewerBody: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  storyViewerCopyBody: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 18 },
  storyVideo: { width: "100%", height: 250, borderRadius: 20, backgroundColor: "#0B172B", overflow: "hidden" },
  storyVideoFrame: { width: "100%", height: 250, borderRadius: 20, backgroundColor: "#0B172B", overflow: "hidden", position: "relative" },
  storyVideoFallback: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  storyVideoFallbackTitle: { color: C.ivory, fontSize: 15, fontWeight: "800", marginTop: 9, textAlign: "center" },
  storyVideoFallbackText: { color: "rgba(255,255,255,0.68)", fontSize: 11, marginTop: 5, textAlign: "center" },
  storyVideoLoading: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(8,16,29,0.42)", gap: 8 },
  storyVideoLoadingText: { color: C.ivory, fontSize: 11 },
  storyVideoProgress: { position: "absolute", left: 10, right: 10, bottom: 10, height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.32)", overflow: "hidden" },
  storyVideoProgressFill: { height: "100%", backgroundColor: C.ivory },
  storyNavLeft: { width: 54, height: 120, alignItems: "center", justifyContent: "center" },
  storyNavRight: { width: 54, height: 120, alignItems: "center", justifyContent: "center" },
  storyViewerTitle: { color: C.ivory, fontSize: 28, textAlign: "center", marginTop: 22 },
  storyViewerText: { color: "rgba(255,255,255,0.88)", fontSize: 17, lineHeight: 26, textAlign: "center", marginTop: 13 },
  storyViewerHint: { color: "rgba(255,255,255,0.56)", fontSize: 11, marginTop: 34 },
  storyActions: { flexDirection: "row", justifyContent: "space-around", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.18)", paddingTop: 12, marginBottom: 10 },
  storyAction: { minHeight: 40, minWidth: 82, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 20, paddingHorizontal: 10 },
  storyActionText: { color: C.ivory, fontSize: 11 },
  storyReplyRow: { minHeight: 46, borderWidth: 1, borderColor: "rgba(255,255,255,0.28)", borderRadius: 24, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  storyReplyInput: { flex: 1, color: C.ivory, fontSize: 13, minHeight: 42 },
  storyReplySent: { color: C.ochre, textAlign: "center", fontSize: 12, minHeight: 46, paddingTop: 12, marginBottom: 14 },
  feedFooter: { minHeight: 58, alignItems: "center", justifyContent: "center", gap: 6 },
  footerText: { color: C.muted, fontSize: 11 },
  endText: { color: C.muted, fontSize: 11, textAlign: "center", paddingVertical: 18 },
  errorCard: { backgroundColor: C.paper, borderWidth: 1, borderColor: "#E8C7BA", borderRadius: 20, padding: 14, marginBottom: 16, flexDirection: "row", alignItems: "center", gap: 11, shadowColor: C.ink, shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  offlineBanner: { backgroundColor: "#EAF3EA", borderWidth: 1, borderColor: "#C9DEC9", borderRadius: 16, paddingHorizontal: 13, paddingVertical: 10, marginBottom: 14, flexDirection: "row", alignItems: "center", gap: 8 },
  offlineText: { color: Colors.dark.leafGreen, fontSize: 11, lineHeight: 16, flex: 1 },
  offlineRetry: { color: C.terra, fontSize: 11, fontWeight: "900", paddingHorizontal: 8, paddingVertical: 5 },
  errorIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: "#FBE7DF", alignItems: "center", justifyContent: "center" },
  errorCopy: { flex: 1 },
  errorTitle: { color: C.ink, fontSize: 13, fontWeight: "900" },
  errorBody: { color: C.muted, fontSize: 11, lineHeight: 16, marginTop: 3 },
  retryButton: { minHeight: 44, borderRadius: 22, backgroundColor: C.terra, paddingHorizontal: 15, alignItems: "center", justifyContent: "center" },
  retryText: { color: C.ivory, fontSize: 11, fontWeight: "900" },
  skeletonCard: { backgroundColor: C.paper, borderRadius: 22, padding: 15, marginBottom: 16, borderWidth: 1, borderColor: C.line },
  skeletonHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  skeletonAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: C.line },
  skeletonHeaderCopy: { flex: 1, gap: 7 },
  skeletonMenu: { width: 24, height: 10, borderRadius: 5, backgroundColor: C.primaryContainer },
  skeletonName: { width: "42%", height: 12, borderRadius: 6, backgroundColor: C.line },
  skeletonMeta: { width: "28%", height: 9, borderRadius: 5, backgroundColor: C.primaryContainer },
  skeletonLineWide: { width: "92%", height: 13, borderRadius: 7, backgroundColor: C.primaryContainer, marginTop: 17 },
  skeletonLine: { width: "68%", height: 13, borderRadius: 7, backgroundColor: C.primaryContainer, marginTop: 8 },
  skeletonMedia: { width: "100%", aspectRatio: 4 / 3, borderRadius: 18, backgroundColor: C.line, marginTop: 13 },
  skeletonLocation: { width: 106, height: 20, borderRadius: 999, backgroundColor: C.primaryContainer, marginTop: 10 },
  skeletonTags: { flexDirection: "row", gap: 6, marginTop: 11 },
  skeletonTag: { width: 72, height: 22, borderRadius: 999, backgroundColor: C.primaryContainer },
  skeletonTagShort: { width: 58, height: 22, borderRadius: 999, backgroundColor: C.primaryContainer },
  skeletonActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 13, paddingVertical: 4, paddingHorizontal: 3, borderRadius: 15, backgroundColor: C.primaryContainer },
  skeletonAction: { width: "23%", height: 12, borderRadius: 6, backgroundColor: C.primaryContainer },
  skeletonActionSmall: { width: "12%", height: 12, borderRadius: 6, backgroundColor: C.primaryContainer },
});
