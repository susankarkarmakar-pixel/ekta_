import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/components/apongram/Avatar";
import { PostCard } from "@/components/apongram/PostCard";
import { TopicChip } from "@/components/apongram/TopicChip";
import { ScreenContainer } from "@/components/screen-container";
import { getFeed, repositoryMode } from "@/lib/apongram/repository";
import { topics } from "@/lib/apongram/mock-data";
import { useLanguage } from "@/lib/apongram/LanguageContext";
import type { Post } from "@/lib/apongram/types";

const C = { bg: "#F7F1E8", card: "#FFFDF9", ink: "#172A35", muted: "#7C817F", terra: "#C85C3A", green: "#365C57", line: "#EFE3D6" };

export default function HomeScreen() {
  const router = useRouter();
  const { language, toggleLanguage, copy } = useLanguage();
  const [feed, setFeed] = useState<Post[]>([]);
  const [toast, setToast] = useState("");
  useEffect(() => { getFeed().then(setFeed); }, []);
  const toggleLike = (id: string) => setFeed((items) => items.map((post) => post.id === id ? { ...post, likedByMe: !post.likedByMe, likes: post.likes + (post.likedByMe ? -1 : 1) } : post));
  const report = () => { setToast(copy.reported); setTimeout(() => setToast(""), 2200); };
  return <ScreenContainer safeAreaClassName="bg-[#F7F1E8]" className="bg-[#F7F1E8]">
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <View style={styles.topbar}><View style={styles.brandRow}><View style={styles.logoMark}><View style={styles.logoLeaf} /><View style={styles.logoDot} /></View><View><Text style={styles.wordmark}>eKta</Text><Text style={styles.eyebrow}>GAZOLE · NORTH BENGAL</Text></View></View><View style={styles.topActions}><Pressable onPress={toggleLanguage} style={styles.lang}><Text style={styles.langText}>{language === "bn" ? "EN" : "বাং"}</Text></Pressable><Pressable onPress={() => router.push("/profile")}><Avatar profile={feed[0]?.author ?? { id: "me", name: "", handle: "", bio: "", initials: "সু", avatarColor: C.terra, region: "", followers: 0, following: 0 }} size={34} /></Pressable></View></View>
      <View style={styles.hero}><Text style={styles.heroTitle}>{copy.goodMorning}</Text><Text style={styles.heroSub}>{copy.feedIntro}</Text></View>
      {repositoryMode === "demo" && <View style={styles.demoBanner}><MaterialIcons name="science" size={18} color={C.terra} /><View style={{ flex: 1 }}><Text style={styles.demoTitle}>{copy.demoMode}</Text><Text style={styles.demoText}>{copy.demoModeText}</Text></View></View>}
      <Pressable onPress={() => router.push("/create")} style={({ pressed }) => [styles.composer, pressed && { opacity: 0.82 }]}><Avatar profile={feed[1]?.author ?? { id: "me", name: "", handle: "", bio: "", initials: "সু", avatarColor: C.terra, region: "", followers: 0, following: 0 }} size={38} /><Text style={styles.composerText}>{copy.whatHappened}</Text><MaterialIcons name="add-a-photo" size={20} color={C.terra} /></Pressable>
      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{copy.popularTopics}</Text><Pressable onPress={() => router.push("/discover")}><Text style={styles.seeAll}>{copy.discover} →</Text></Pressable></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>{topics.map((topic) => <TopicChip key={topic} label={topic} onPress={() => router.push({ pathname: "/discover", params: { q: topic } })} />)}</ScrollView>
      <View style={styles.feedHeader}><Text style={styles.sectionTitle}>{copy.latest}</Text><View style={styles.liveDot} /><Text style={styles.liveText}>{language === "bn" ? "এখন live" : "Live now"}</Text></View>
      {feed.map((post) => <PostCard key={post.id} post={post} copy={copy} onOpen={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })} onLike={() => toggleLike(post.id)} onReport={report} />)}
      {toast ? <View style={styles.toast}><MaterialIcons name="check-circle" size={18} color="#FFF" /><Text style={styles.toastText}>{toast}</Text></View> : null}
    </ScrollView>
  </ScreenContainer>;
}
const styles = StyleSheet.create({ container: { paddingHorizontal: 18, paddingBottom: 32 }, topbar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 10 }, brandRow: { flexDirection: "row", alignItems: "center", gap: 9 }, logoMark: { width: 31, height: 31, borderRadius: 11, backgroundColor: C.terra, alignItems: "center", justifyContent: "center", position: "relative" }, logoLeaf: { width: 12, height: 18, borderRadius: 12, backgroundColor: "#F8D3A9", transform: [{ rotate: "-32deg" }] }, logoDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#365C57", position: "absolute", bottom: 6, right: 6 }, wordmark: { color: C.ink, fontSize: 20, fontWeight: "900", letterSpacing: -0.5 }, eyebrow: { color: C.terra, fontSize: 8, fontWeight: "800", letterSpacing: 1.1, marginTop: 1 }, topActions: { flexDirection: "row", alignItems: "center", gap: 13 }, lang: { borderWidth: 1, borderColor: C.line, borderRadius: 15, paddingHorizontal: 9, paddingVertical: 6, backgroundColor: C.card }, langText: { color: C.green, fontSize: 11, fontWeight: "800" }, hero: { paddingVertical: 24 }, heroTitle: { color: C.ink, fontSize: 28, lineHeight: 34, fontWeight: "900", letterSpacing: -0.6 }, heroSub: { color: C.muted, fontSize: 14, lineHeight: 21, marginTop: 7, maxWidth: 310 }, demoBanner: { backgroundColor: "#FBE8D7", borderRadius: 16, padding: 12, flexDirection: "row", gap: 10, alignItems: "flex-start", marginBottom: 13 }, demoTitle: { color: C.terra, fontSize: 12, fontWeight: "900" }, demoText: { color: "#875E4B", fontSize: 11, lineHeight: 16, marginTop: 2 }, composer: { backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 18, padding: 12, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 24 }, composerText: { flex: 1, color: C.muted, fontSize: 13 }, sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 11 }, sectionTitle: { color: C.ink, fontSize: 16, fontWeight: "900" }, seeAll: { color: C.terra, fontSize: 12, fontWeight: "800" }, feedHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 11 }, liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#6E9A72", marginLeft: 4 }, liveText: { color: "#6E9A72", fontSize: 11, fontWeight: "800" }, toast: { position: "absolute", bottom: 28, left: 18, right: 18, backgroundColor: C.green, padding: 13, borderRadius: 14, flexDirection: "row", alignItems: "center", gap: 8 }, toastText: { color: "#FFF", fontWeight: "700", fontSize: 13 } });
