import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/components/apongram/Avatar";
import { PostCard } from "@/components/apongram/PostCard";
import { TopicChip } from "@/components/apongram/TopicChip";
import { ScreenContainer } from "@/components/screen-container";
import { getFeed, repositoryMode } from "@/lib/apongram/repository";
import { currentUser, topics } from "@/lib/apongram/mock-data";
import { useLanguage } from "@/lib/apongram/LanguageContext";
import type { Post } from "@/lib/apongram/types";

const C = { card: "#FFFFFF", ink: "#1E1B16", muted: "#6B6153", terra: "#C85A3A", line: "#E3DACB" };

export default function HomeScreen() {
  const router = useRouter();
  const { language, toggleLanguage, copy } = useLanguage();
  const [feed, setFeed] = useState<Post[]>([]);
  const [toast, setToast] = useState("");
  useFocusEffect(useCallback(() => { let active = true; getFeed().then((items) => { if (active) setFeed([...items]); }); return () => { active = false; }; }, []));
  const toggleLike = (id: string) => setFeed((items) => items.map((post) => post.id === id ? { ...post, likedByMe: !post.likedByMe, likes: post.likes + (post.likedByMe ? -1 : 1) } : post));
  const report = () => { setToast(copy.reported); setTimeout(() => setToast(""), 2200); };
  return <ScreenContainer safeAreaClassName="bg-[#FBF7F0]" className="bg-[#FBF7F0]"><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
    <View style={styles.topbar}><View style={styles.brandRow}><View style={styles.logoMark}><MaterialIcons name="diversity-3" size={18} color="#FFF" /></View><View><Text style={styles.wordmark}>Ekta</Text><Text style={styles.eyebrow}>{language === "bn" ? "ভারত · সব অঞ্চল" : "INDIA · ALL REGIONS"}</Text></View></View><View style={styles.topActions}><Pressable onPress={toggleLanguage} style={styles.lang}><Text style={styles.langText}>{language === "bn" ? "EN" : "বাং"}</Text></Pressable><Pressable accessibilityLabel={copy.discover} onPress={() => router.push("/(tabs)/discover")}><MaterialIcons name="search" size={23} color={C.ink} /></Pressable><Pressable accessibilityLabel={copy.alerts} onPress={() => router.push("/(tabs)/alerts")}><MaterialIcons name="notifications-none" size={23} color={C.ink} /></Pressable><Pressable onPress={() => router.push("/(tabs)/profile")}><Avatar profile={currentUser} size={32} /></Pressable></View></View>
    <View style={styles.hero}><Text style={styles.heroTitle}>{copy.goodMorning}</Text><Text style={styles.heroSub}>{copy.feedIntro}</Text></View>
    {repositoryMode === "demo" && <View style={styles.demoBanner}><MaterialIcons name="info-outline" size={17} color={C.terra} /><Text style={styles.demoText}>{copy.demoModeText}</Text></View>}
    <Pressable onPress={() => router.push("/(tabs)/create")} style={({ pressed }) => [styles.composer, pressed && { opacity: 0.82 }]}><Avatar profile={currentUser} size={38} /><Text style={styles.composerText}>{copy.whatHappened}</Text><MaterialIcons name="edit" size={19} color={C.terra} /></Pressable>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.topics}>{topics.map((topic) => <TopicChip key={topic} label={topic} onPress={() => router.push({ pathname: "/(tabs)/discover", params: { q: topic } })} />)}</ScrollView>
    <View style={styles.feedHeader}><Text style={styles.sectionTitle}>{copy.latest}</Text><View style={styles.liveDot} /><Text style={styles.liveText}>{language === "bn" ? "এখন সক্রিয়" : "Active now"}</Text></View>
    {feed.map((post) => <PostCard key={post.id} post={post} copy={copy} onOpen={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })} onLike={() => toggleLike(post.id)} onReport={report} />)}
    {toast ? <View style={styles.toast}><MaterialIcons name="check-circle" size={18} color="#FFF" /><Text style={styles.toastText}>{toast}</Text></View> : null}
  </ScrollView></ScreenContainer>;
}
const styles = StyleSheet.create({ container: { paddingHorizontal: 18, paddingBottom: 32 }, topbar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 10 }, brandRow: { flexDirection: "row", alignItems: "center", gap: 9 }, logoMark: { width: 34, height: 34, borderRadius: 12, backgroundColor: C.terra, alignItems: "center", justifyContent: "center" }, wordmark: { color: C.terra, fontSize: 23, fontFamily: "Georgia", fontWeight: "700", letterSpacing: -0.5 }, eyebrow: { color: C.muted, fontSize: 8, fontWeight: "800", letterSpacing: 1, marginTop: 1 }, topActions: { flexDirection: "row", alignItems: "center", gap: 12 }, lang: { borderWidth: 1, borderColor: C.line, borderRadius: 15, paddingHorizontal: 9, paddingVertical: 6, backgroundColor: C.card }, langText: { color: C.terra, fontSize: 11, fontWeight: "800" }, hero: { paddingTop: 22, paddingBottom: 15 }, heroTitle: { color: C.ink, fontSize: 26, lineHeight: 33, fontFamily: "Georgia", fontWeight: "700" }, heroSub: { color: C.muted, fontSize: 13, lineHeight: 19, marginTop: 5 }, demoBanner: { backgroundColor: "#F3DCD2", borderRadius: 12, padding: 10, flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 11 }, demoText: { color: C.muted, fontSize: 11, lineHeight: 16, flex: 1 }, composer: { backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 16, padding: 12, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 }, composerText: { flex: 1, color: C.muted, fontSize: 13 }, topics: { marginBottom: 15, flexGrow: 0 }, feedHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 11 }, sectionTitle: { color: C.ink, fontSize: 16, fontFamily: "Georgia", fontWeight: "700" }, liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#1F6F6B", marginLeft: 5 }, liveText: { color: C.muted, fontSize: 10, fontWeight: "700" }, toast: { position: "absolute", bottom: 28, left: 18, right: 18, backgroundColor: "#1F6F6B", padding: 13, borderRadius: 14, flexDirection: "row", alignItems: "center", gap: 8 }, toastText: { color: "#FFF", fontWeight: "700", fontSize: 13 } });
