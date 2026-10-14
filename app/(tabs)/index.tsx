import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { ActivityIndicator, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/components/apongram/Avatar";
import { PostCard } from "@/components/apongram/PostCard";
import { StoryRail } from "@/components/apongram/StoryRail";
import { FeedSkeleton } from "@/components/apongram/FeedSkeleton";
import { TopicChip } from "@/components/apongram/TopicChip";
import { Logo } from "@/components/Logo";
import { ScreenContainer } from "@/components/screen-container";
import { Colors } from "@/constants/theme";
import { currentUser, topicLabels, topics } from "@/lib/apongram/mock-data";
import { useFeedPreferences } from "@/lib/apongram/FeedPreferencesContext";
import { useLanguage } from "@/lib/apongram/LanguageContext";
import { useStoryController } from "@/lib/apongram/useStoryController";
import { useFeedController } from "@/lib/apongram/useFeedController";

const C = { ...Colors.light, card: Colors.light.paper, ink: Colors.light.inkNavy, muted: Colors.light.slate, terra: Colors.light.terracotta, line: Colors.light.line, green: Colors.light.leafGreen };
export default function HomeScreen() {
  const router = useRouter();
  const { language, toggleLanguage, copy } = useLanguage();
  const bodyFont = language === "bn" ? "HindSiliguri" : "HindSiliguriLatin";
  const mediumFont = language === "bn" ? "HindSiliguriSemiBold" : "HindSiliguriLatinSemiBold";
  const headingFont = language === "bn" ? "NotoSerifBengaliBold" : "Fraunces";
  const { preferences } = useFeedPreferences();
  const story = useStoryController({ onCreateStory: () => router.push({ pathname: "/(tabs)/create", params: { mode: "story" } }) });
  const { feed, feedMode, setFeedMode, loadingMore, refreshing, feedError, feedOffline, refreshNotice, hiddenPostIds, setHiddenPostIds, hasMore, activeVideoId, webPullDistance, reloadFeed, handleScroll, handleWebTouchStart, handleWebTouchMove, handleWebTouchEnd, handleCardLayout, toggleLike, repositoryMode } = useFeedController({ preferences });
  useFocusEffect(useCallback(() => { void reloadFeed(); }, [reloadFeed]));

  return (
      <ScreenContainer safeAreaClassName="bg-background" className="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.container, Platform.OS === "web" && styles.webContainer]} onScroll={handleScroll} onTouchStart={handleWebTouchStart} onTouchMove={handleWebTouchMove} onTouchEnd={handleWebTouchEnd} scrollEventThrottle={16} decelerationRate={Platform.OS === "ios" ? 0.985 : "normal"} overScrollMode="never" bounces keyboardShouldPersistTaps="handled" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void reloadFeed(true)} tintColor={C.terra} colors={[C.terra]} progressBackgroundColor={C.paper} /> }>
        {Platform.OS === "web" && webPullDistance > 0 ? <View style={{ height: Math.min(webPullDistance, 72), alignItems: "center", justifyContent: "center", overflow: "hidden" }}><MaterialIcons name={webPullDistance >= 64 ? "refresh" : "arrow-downward"} size={18} color={C.terra} /><Text style={{ color: C.terra, fontFamily: bodyFont, fontSize: 10, marginTop: 2 }}>{webPullDistance >= 64 ? copy.releaseToRefresh : copy.pullToRefresh}</Text></View> : null}
        <View style={styles.topbar}>
          <View style={styles.brandRow}><Logo variant="horizontal" width={126} height={30} /></View>
          <View style={styles.topActions}>
            <Pressable onPress={toggleLanguage} style={styles.lang}><Text style={[styles.langText, { fontFamily: mediumFont }]}>{language === "bn" ? "EN" : "বাং"}</Text></Pressable>
            <Pressable onPress={() => router.push("/(tabs)/discover")} accessibilityLabel={copy.discover}><MaterialIcons name="search" size={23} color={C.ink} /></Pressable>
            <Pressable onPress={() => router.push("/(tabs)/alerts")} accessibilityLabel={copy.alerts}><MaterialIcons name="notifications-none" size={23} color={C.ink} /></Pressable>
            <Pressable onPress={() => router.push("/(tabs)/create")} accessibilityRole="button" accessibilityLabel={language === "bn" ? "নতুন পোস্ট তৈরি করুন" : "Create a new post"} style={styles.createIcon}><MaterialIcons name="add" size={23} color={C.terra} /></Pressable>
            {Platform.OS === "web" ? <Pressable onPress={() => void reloadFeed(true)} accessibilityRole="button" accessibilityLabel={copy.refreshFeed} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}><MaterialIcons name="refresh" size={21} color={C.terra} /></Pressable> : null}
            <Pressable onPress={() => router.push("/(tabs)/profile")}><Avatar profile={currentUser} size={32} /></Pressable>
          </View>
        </View>

        <StoryRail people={story.people} viewedIds={story.viewedIds} viewer={story.viewer} post={story.post} index={story.index} open={story.open} paused={story.paused} reply={story.reply} replySent={story.replySent} language={language} bodyFont={bodyFont} mediumFont={mediumFont} headingFont={headingFont} reelsLabel={copy.reels} onOpen={story.onOpen} onClose={story.close} onPause={story.setPaused} onMove={story.move} onReplyChange={story.setReply} onSendReply={story.sendReply} onShare={story.share} onReport={() => { story.close(); router.push({ pathname: "/report", params: { storyId: story.viewer?.id ?? "" } }); }} onWatchReels={() => router.push("/(tabs)/reels")} />
        <View style={heroStyles.card}>
          <View style={heroStyles.copy}>
            <View style={heroStyles.eyebrow}><View style={heroStyles.dot} /><Text style={[heroStyles.eyebrowText, { fontFamily: mediumFont }]}>{language === "bn" ? "আপনার স্থানীয় কমিউনিটি" : "YOUR LOCAL COMMUNITY"}</Text></View>
            <Text style={[styles.heroTitle, heroStyles.title, { fontFamily: headingFont }]}>{copy.goodMorning}</Text>
            <Text style={[styles.heroSub, heroStyles.subtitle, { fontFamily: bodyFont }]}>{copy.feedIntro}</Text>
            <Pressable onPress={() => router.push("/(tabs)/create")} style={heroStyles.action} accessibilityRole="button" accessibilityLabel={language === "bn" ? "স্থানীয় আপডেট শেয়ার করুন" : "Share a local update"}>
              <MaterialIcons name="edit" size={15} color={C.card} />
              <Text style={[heroStyles.actionText, { fontFamily: mediumFont }]}>{language === "bn" ? "আপডেট শেয়ার করুন" : "Share an update"}</Text>
              <MaterialIcons name="arrow-forward" size={15} color={C.card} />
            </Pressable>
          </View>
          <View pointerEvents="none" style={heroStyles.illustration}>
            <View style={heroStyles.sun} />
            <View style={heroStyles.bubble}><MaterialIcons name="forum" size={25} color={C.terra} /></View>
            <View style={heroStyles.people}><MaterialIcons name="groups" size={21} color={C.green} /></View>
          </View>
        </View>
        {repositoryMode === "demo" && __DEV__ && <View style={styles.demoBanner}><MaterialIcons name="info-outline" size={17} color={C.terra} /><Text style={[styles.demoText, { fontFamily: bodyFont }]}>{copy.demoModeText}</Text></View>}

        <View style={feedDecorationStyles.topicHeader}><View><Text style={[feedDecorationStyles.topicTitle, { fontFamily: headingFont }]}>{copy.trendingNow}</Text><Text style={[feedDecorationStyles.topicSubtitle, { fontFamily: bodyFont }]}>{copy.popularTopics}</Text></View><View style={feedDecorationStyles.trendingIcon}><MaterialIcons name="trending-up" size={18} color={C.terra} /></View></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.topics}>
          {topics.map((topic) => <TopicChip key={topic} label={topicLabels[topic]?.[language] ?? topic} onPress={() => router.push({ pathname: "/(tabs)/discover", params: { q: topic } })} />)}
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
      {refreshNotice ? <View style={styles.toast} accessibilityRole="alert"><MaterialIcons name="check-circle" size={18} color="#FFF" /><Text style={[styles.toastText, { fontFamily: mediumFont }]}>{language === "bn" ? "ফিড আপডেট হয়েছে" : "Feed updated"}</Text></View> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 18, paddingBottom: 32 },
  webContainer: { width: "100%", maxWidth: 520, alignSelf: "center" },
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
});

const heroStyles = StyleSheet.create({
  card: { minHeight: 194, backgroundColor: "#E7EFE8", borderRadius: 24, borderWidth: 1, borderColor: "#D3E1D5", padding: 17, marginTop: 4, marginBottom: 16, overflow: "hidden", position: "relative" },
  copy: { width: "78%", position: "relative", zIndex: 1 },
  eyebrow: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 8 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.green },
  eyebrowText: { color: C.green, fontSize: 9, fontWeight: "900", letterSpacing: 0.8 },
  title: { paddingTop: 0, paddingBottom: 0, fontSize: 25, lineHeight: 31 },
  subtitle: { marginTop: 4, maxWidth: 245, fontSize: 12, lineHeight: 17 },
  action: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, minHeight: 42, alignSelf: "flex-start", backgroundColor: C.terra, paddingHorizontal: 13, borderRadius: 999, marginTop: 12 },
  actionText: { color: C.card, fontSize: 11, fontWeight: "900" },
  illustration: { position: "absolute", right: 0, top: 0, bottom: 0, width: 125 },
  sun: { position: "absolute", right: -11, top: -14, width: 91, height: 91, borderRadius: 46, backgroundColor: "#F0C66E", opacity: 0.72 },
  bubble: { position: "absolute", right: 16, top: 70, width: 48, height: 48, borderRadius: 17, backgroundColor: "#FFF8EA", alignItems: "center", justifyContent: "center", transform: [{ rotate: "-8deg" }] },
  people: { position: "absolute", right: 60, bottom: 14, width: 38, height: 38, borderRadius: 14, backgroundColor: "#D4E7D7", alignItems: "center", justifyContent: "center", transform: [{ rotate: "8deg" }] },
});

const feedDecorationStyles = StyleSheet.create({
  topicHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 1, marginBottom: 8 },
  topicTitle: { color: C.ink, fontSize: 15, fontWeight: "800" },
  topicSubtitle: { color: C.muted, fontSize: 10, marginTop: 2 },
  trendingIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.primaryContainer, alignItems: "center", justifyContent: "center" },
});
