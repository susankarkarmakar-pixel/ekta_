import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/components/apongram/Avatar";
import { PostCard } from "@/components/apongram/PostCard";
import { TopicChip } from "@/components/apongram/TopicChip";
import { Logo } from "@/components/Logo";
import { ScreenContainer } from "@/components/screen-container";
import { Colors } from "@/constants/theme";
import { getFeed, repositoryMode } from "@/lib/apongram/repository";
import { currentUser, profiles, topics } from "@/lib/apongram/mock-data";
import { buildFeedPreferences, rankFeed, type FeedMode } from "@/lib/apongram/feed-ranking";
import { useFeedPreferences } from "@/lib/apongram/FeedPreferencesContext";
import { useLanguage } from "@/lib/apongram/LanguageContext";
import type { Post } from "@/lib/apongram/types";

const C = { ...Colors.light, card: Colors.light.paper, ink: Colors.light.inkNavy, muted: Colors.light.slate, terra: Colors.light.terracotta, line: Colors.light.line, green: Colors.light.leafGreen };

export default function HomeScreen() {
  const router = useRouter();
  const { language, toggleLanguage, copy } = useLanguage();
  const bodyFont = language === "bn" ? "HindSiliguri" : "HindSiliguriLatin";
  const mediumFont = language === "bn" ? "HindSiliguriSemiBold" : "HindSiliguriLatinSemiBold";
  const headingFont = language === "bn" ? "NotoSerifBengaliBold" : "Fraunces";
  const { preferences } = useFeedPreferences();
  const [feed, setFeed] = useState<Post[]>([]);
  const [feedMode, setFeedMode] = useState<FeedMode>("relevant");

  useFocusEffect(useCallback(() => {
    let active = true;
    getFeed().then((items) => {
      if (active) setFeed(rankFeed(items, feedMode, { ...buildFeedPreferences(currentUser), ...preferences }));
    });
    return () => { active = false; };
  }, [feedMode, preferences]));

  const toggleLike = (id: string) => setFeed((items) => items.map((post) => post.id === id
    ? { ...post, likedByMe: !post.likedByMe, likes: post.likes + (post.likedByMe ? -1 : 1) }
    : post));

  return (
      <ScreenContainer safeAreaClassName="bg-background" className="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        <View style={styles.topbar}>
          <View style={styles.brandRow}><Logo variant="horizontal" width={94} height={30} accessibilityLabel="eKta" /></View>
          <View style={styles.topActions}>
            <Pressable onPress={toggleLanguage} style={styles.lang}><Text style={[styles.langText, { fontFamily: mediumFont }]}>{language === "bn" ? "EN" : "বাং"}</Text></Pressable>
            <Pressable onPress={() => router.push("/(tabs)/discover")} accessibilityLabel={copy.discover}><MaterialIcons name="search" size={23} color={C.ink} /></Pressable>
            <Pressable onPress={() => router.push("/(tabs)/alerts")} accessibilityLabel={copy.alerts}><MaterialIcons name="notifications-none" size={23} color={C.ink} /></Pressable>
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
        {feed.map((post) => <PostCard key={post.id} post={post} copy={copy} onOpen={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })} onLike={() => toggleLike(post.id)} onReport={() => router.push({ pathname: "/report", params: { postId: post.id } })} />)}
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
});
