import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, type LayoutChangeEvent, type NativeScrollEvent, type NativeSyntheticEvent, type NativeTouchEvent } from "react-native";
import { Avatar } from "@/components/apongram/Avatar";
import { PostCard } from "@/components/apongram/PostCard";
import { TopicChip } from "@/components/apongram/TopicChip";
import { Logo } from "@/components/Logo";
import { ScreenContainer } from "@/components/screen-container";
import { Colors } from "@/constants/theme";
import { getFeedPage, repositoryMode } from "@/lib/apongram/repository";
import { currentUser, profiles, topics } from "@/lib/apongram/mock-data";
import { buildFeedPreferences, rankFeed, type FeedMode } from "@/lib/apongram/feed-ranking";
import { useFeedPreferences } from "@/lib/apongram/FeedPreferencesContext";
import { useLanguage } from "@/lib/apongram/LanguageContext";
import type { Post } from "@/lib/apongram/types";

const C = { ...Colors.light, card: Colors.light.paper, ink: Colors.light.inkNavy, muted: Colors.light.slate, terra: Colors.light.terracotta, line: Colors.light.line, green: Colors.light.leafGreen };

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
      <View style={styles.skeletonHeader}><View style={styles.skeletonAvatar} /><View style={styles.skeletonHeaderCopy}><View style={styles.skeletonName} /><View style={styles.skeletonMeta} /></View></View>
      <View style={styles.skeletonLineWide} /><View style={styles.skeletonLine} /><View style={styles.skeletonMedia} /><View style={styles.skeletonActions}><View style={styles.skeletonAction} /><View style={styles.skeletonAction} /><View style={styles.skeletonActionSmall} /></View>
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
  const [hasMore, setHasMore] = useState(true);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [webPullDistance, setWebPullDistance] = useState(0);
  const loadingRef = useRef(false);
  const activeVideoRef = useRef<string | null>(null);
  const webPullStartY = useRef<number | null>(null);
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

  const reloadFeed = useCallback(async () => {
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
    } catch {
      setFeedError(true);
    } finally {
      loadingRef.current = false;
      setRefreshing(false);
    }
  }, [feedMode, preferences]);

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
    setWebPullDistance(distance);
  };
  const handleWebTouchEnd = () => {
    if (Platform.OS !== "web") return;
    const shouldRefresh = webPullDistance >= 64;
    webPullStartY.current = null;
    setWebPullDistance(0);
    if (shouldRefresh) void reloadFeed();
  };

  const toggleLike = (id: string) => setFeed((items) => items.map((post) => post.id === id
    ? { ...post, likedByMe: !post.likedByMe, likes: post.likes + (post.likedByMe ? -1 : 1) }
    : post));

  return (
      <ScreenContainer safeAreaClassName="bg-background" className="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container} onScroll={handleScroll} onTouchStart={handleWebTouchStart} onTouchMove={handleWebTouchMove} onTouchEnd={handleWebTouchEnd} scrollEventThrottle={16} decelerationRate={Platform.OS === "ios" ? 0.985 : "normal"} overScrollMode="never" bounces keyboardShouldPersistTaps="handled" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void reloadFeed()} tintColor={C.terra} colors={[C.terra]} progressBackgroundColor={C.paper} /> }>
        {Platform.OS === "web" && webPullDistance > 0 ? <View style={{ height: Math.min(webPullDistance, 72), alignItems: "center", justifyContent: "center", overflow: "hidden" }}><MaterialIcons name={webPullDistance >= 64 ? "refresh" : "arrow-downward"} size={18} color={C.terra} /><Text style={{ color: C.terra, fontFamily: bodyFont, fontSize: 10, marginTop: 2 }}>{webPullDistance >= 64 ? copy.releaseToRefresh : copy.pullToRefresh}</Text></View> : null}
        <View style={styles.topbar}>
          <View style={styles.brandRow}><Logo variant="horizontal" width={94} height={30} accessibilityLabel="eKta" /></View>
          <View style={styles.topActions}>
            <Pressable onPress={toggleLanguage} style={styles.lang}><Text style={[styles.langText, { fontFamily: mediumFont }]}>{language === "bn" ? "EN" : "বাং"}</Text></Pressable>
            <Pressable onPress={() => router.push("/(tabs)/discover")} accessibilityLabel={copy.discover}><MaterialIcons name="search" size={23} color={C.ink} /></Pressable>
            <Pressable onPress={() => router.push("/(tabs)/alerts")} accessibilityLabel={copy.alerts}><MaterialIcons name="notifications-none" size={23} color={C.ink} /></Pressable>
            {Platform.OS === "web" ? <Pressable onPress={() => void reloadFeed()} accessibilityRole="button" accessibilityLabel={copy.refreshFeed} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}><MaterialIcons name="refresh" size={21} color={C.terra} /></Pressable> : null}
            <Pressable onPress={() => router.push("/(tabs)/profile")}><Avatar profile={currentUser} size={32} /></Pressable>
          </View>
        </View>

        <View style={styles.hero}><Text style={[styles.heroTitle, { fontFamily: headingFont }]}>{copy.goodMorning}</Text><Text style={[styles.heroSub, { fontFamily: bodyFont }]}>{copy.feedIntro}</Text></View>
        {repositoryMode === "demo" && <View style={styles.demoBanner}><MaterialIcons name="info-outline" size={17} color={C.terra} /><Text style={[styles.demoText, { fontFamily: bodyFont }]}>{copy.demoModeText}</Text></View>}
        <Pressable onPress={() => router.push("/(tabs)/create")} style={({ pressed }) => [styles.composer, pressed && { opacity: 0.82 }]}>
          <Avatar profile={currentUser} size={38} /><Text style={[styles.composerText, { fontFamily: bodyFont }]}>{copy.whatHappened}</Text><MaterialIcons name="edit" size={19} color={C.terra} />
        </Pressable>

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
          {[currentUser, ...profiles.slice(1, 5)].map((person, index) => (
            <Pressable key={person.id} onPress={() => router.push("/(tabs)/create")} style={styles.storyItem}>
              <View style={[styles.storyRing, index === 0 && styles.storyRingOwn]}>
                <Avatar profile={person} size={48} />
                {index === 0 && <View style={styles.storyPlus}><MaterialIcons name="add" size={12} color="#FFF" /></View>}
              </View>
              <Text numberOfLines={1} style={[styles.storyName, { fontFamily: bodyFont }]}>{index === 0 ? (language === "bn" ? "আপনার স্টোরি" : "Your story") : person.name.split(" ")[0]}</Text>
            </Pressable>
          ))}
        </ScrollView>

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
        {feedOffline ? <View style={styles.offlineBanner} accessibilityLiveRegion="polite"><MaterialIcons name="cloud-off" size={17} color={C.terra} /><Text style={[styles.offlineText, { fontFamily: bodyFont }]}>{copy.offlineBanner}</Text><Pressable onPress={() => void reloadFeed()} accessibilityRole="button" accessibilityLabel={copy.retry}><Text style={[styles.offlineRetry, { fontFamily: mediumFont }]}>{copy.retry}</Text></Pressable></View> : null}
        {feedError ? <View style={styles.errorCard} accessibilityRole="alert"><View style={styles.errorIcon}><MaterialIcons name="cloud-off" size={24} color={C.terra} /></View><View style={styles.errorCopy}><Text style={[styles.errorTitle, { fontFamily: mediumFont }]}>{copy.feedErrorTitle}</Text><Text style={[styles.errorBody, { fontFamily: bodyFont }]}>{copy.feedErrorBody}</Text></View><Pressable onPress={() => void reloadFeed()} style={styles.retryButton} accessibilityRole="button" accessibilityLabel={copy.retry}><Text style={[styles.retryText, { fontFamily: mediumFont }]}>{copy.retry}</Text></Pressable></View> : null}
        {refreshing && !feed.length ? <FeedSkeleton /> : null}
        {feed.map((post) => <PostCard key={post.id} post={post} copy={copy} isVideoActive={activeVideoId === post.id} onLayout={(event) => handleCardLayout(post.id, event)} onOpen={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })} onLike={() => toggleLike(post.id)} onReport={() => router.push({ pathname: "/report", params: { postId: post.id } })} />)}
        {loadingMore ? <View style={styles.feedFooter}><ActivityIndicator color={C.terra} /><Text style={[styles.footerText, { fontFamily: bodyFont }]}>{language === "bn" ? "আরও আপডেট আসছে..." : "Loading more updates…"}</Text></View> : null}
        {!loadingMore && !hasMore && feed.length ? <Text style={[styles.endText, { fontFamily: bodyFont }]}>{language === "bn" ? "এখানেই আপাতত শেষ।" : "You’re all caught up for now."}</Text> : null}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 18, paddingBottom: 32 },
  topbar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 10, paddingBottom: 4 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  wordmarkWrap: { flexDirection: "row", alignItems: "center", gap: 4 },
  topActions: { flexDirection: "row", alignItems: "center", gap: 12 },
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
  storyRing: { borderWidth: 2, borderColor: C.terra, borderRadius: 33, padding: 2, position: "relative" },
  storyRingOwn: { borderColor: C.green },
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
  feedFooter: { minHeight: 58, alignItems: "center", justifyContent: "center", gap: 6 },
  footerText: { color: C.muted, fontSize: 11 },
  endText: { color: C.muted, fontSize: 11, textAlign: "center", paddingVertical: 18 },
  errorCard: { backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, borderRadius: 18, padding: 13, marginBottom: 14, flexDirection: "row", alignItems: "center", gap: 10 },
  offlineBanner: { backgroundColor: C.primaryContainer, borderWidth: 1, borderColor: C.line, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 9, marginBottom: 12, flexDirection: "row", alignItems: "center", gap: 7 },
  offlineText: { color: C.muted, fontSize: 11, flex: 1 },
  offlineRetry: { color: C.terra, fontSize: 11, fontWeight: "800" },
  errorIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: C.primaryContainer, alignItems: "center", justifyContent: "center" },
  errorCopy: { flex: 1 },
  errorTitle: { color: C.ink, fontSize: 12, fontWeight: "800" },
  errorBody: { color: C.muted, fontSize: 10, lineHeight: 15, marginTop: 2 },
  retryButton: { minHeight: 40, borderRadius: 20, backgroundColor: C.terra, paddingHorizontal: 13, alignItems: "center", justifyContent: "center" },
  retryText: { color: C.ivory, fontSize: 11, fontWeight: "800" },
  skeletonCard: { backgroundColor: C.paper, borderRadius: 20, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.line },
  skeletonHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  skeletonAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: C.line },
  skeletonHeaderCopy: { flex: 1, gap: 7 },
  skeletonName: { width: "42%", height: 12, borderRadius: 6, backgroundColor: C.line },
  skeletonMeta: { width: "28%", height: 9, borderRadius: 5, backgroundColor: C.primaryContainer },
  skeletonLineWide: { width: "92%", height: 13, borderRadius: 7, backgroundColor: C.primaryContainer, marginTop: 17 },
  skeletonLine: { width: "68%", height: 13, borderRadius: 7, backgroundColor: C.primaryContainer, marginTop: 8 },
  skeletonMedia: { width: "100%", aspectRatio: 4 / 3, borderRadius: 16, backgroundColor: C.line, marginTop: 14 },
  skeletonActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.line },
  skeletonAction: { width: "23%", height: 12, borderRadius: 6, backgroundColor: C.primaryContainer },
  skeletonActionSmall: { width: "12%", height: 12, borderRadius: 6, backgroundColor: C.primaryContainer },
});
