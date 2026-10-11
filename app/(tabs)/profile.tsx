import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/components/apongram/Avatar";
import { PostCard } from "@/components/apongram/PostCard";
import { Colors } from "@/constants/theme";
import { ScreenContainer } from "@/components/screen-container";
import { currentUser, posts } from "@/lib/apongram/mock-data";
import { getStoredProfile } from "@/lib/apongram/profile-store";
import { useLanguage } from "@/lib/apongram/LanguageContext";
import type { Profile } from "@/lib/apongram/types";

const C = Colors.light;
const COMMUNITY_IMAGE = require("../../assets/images/community-pottery.jpg");
const highlights = [
  { id: "community", labelBn: "কমিউনিটি", labelEn: "Community", icon: "groups" as const },
  { id: "events", labelBn: "ইভেন্ট", labelEn: "Events", icon: "event" as const },
  { id: "places", labelBn: "জায়গা", labelEn: "Places", icon: "place" as const },
];
const albums = [{ id: "community-memories", titleBn: "কমিউনিটির মুহূর্ত", titleEn: "Community moments", count: 4 }];

type ProfileTab = "posts" | "reels" | "albums" | "tagged";

export default function ProfileScreen() {
  const router = useRouter();
  const { language, copy } = useLanguage();
  const [profile, setProfile] = useState<Profile>(currentUser);
  const [selected, setSelected] = useState<ProfileTab>("posts");
  const bodyFont = language === "bn" ? "HindSiliguri" : "HindSiliguriLatin";
  const mediumFont = language === "bn" ? "HindSiliguriSemiBold" : "HindSiliguriLatinSemiBold";
  const headingFont = language === "bn" ? "NotoSerifBengaliBold" : "Fraunces";
  const ownPosts = posts.filter((post) => post.author.id === profile.id);
  const photoPosts = ownPosts.filter((post) => !post.videoUrl);
  const videoPosts = ownPosts.filter((post) => Boolean(post.videoUrl));

  useFocusEffect(useCallback(() => {
    void getStoredProfile().then(setProfile);
  }, []));

  return <ScreenContainer safeAreaClassName="bg-background" className="bg-background"><ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
    <View style={styles.banner}><View style={styles.sun} /><View style={styles.hillBack} /><View style={styles.hillFront} /><View style={styles.bannerTop}><Text style={[styles.bannerKicker, { fontFamily: mediumFont }]}>{language === "bn" ? "আপনার একতার জায়গা" : "YOUR PLACE IN EKTA"}</Text><Pressable onPress={() => router.push("/settings")} accessibilityLabel={copy.editProfile}><MaterialIcons name="settings" size={22} color={C.inkNavy} /></Pressable></View><View style={styles.avatarFrame}><Avatar profile={profile} size={78} /></View></View>
    <View style={styles.profile}><Text style={[styles.name, { fontFamily: headingFont }]}>{profile.name}</Text><Text style={[styles.handle, { fontFamily: bodyFont }]}>@{profile.handle} · {profile.region}</Text><Text style={[styles.bio, { fontFamily: bodyFont }]}>{profile.bio}</Text>
      <View style={styles.stats}><Stat value={String(ownPosts.length)} label={copy.posts} font={mediumFont} bodyFont={bodyFont} /><Stat value={String(profile.followers)} label={copy.followers} font={mediumFont} bodyFont={bodyFont} /><Stat value={String(profile.following)} label={copy.following} font={mediumFont} bodyFont={bodyFont} /></View>
      <Pressable onPress={() => router.push("/profile-edit")} style={styles.edit} accessibilityRole="button" accessibilityLabel={copy.editProfile}><MaterialIcons name="edit" size={16} color={C.terracotta} /><Text style={[styles.editText, { fontFamily: mediumFont }]}>{copy.editProfile}</Text></Pressable>
    </View>
    <View style={styles.highlightSection}><View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { fontFamily: headingFont }]}>{copy.profileHighlights}</Text><Text style={[styles.sectionHint, { fontFamily: bodyFont }]}>{language === "bn" ? "আপনার গল্প" : "Your stories"}</Text></View><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.highlightRail}><Pressable onPress={() => router.push({ pathname: "/(tabs)/create", params: { mode: "story" } })} style={styles.highlightItem} accessibilityLabel={copy.addHighlight}><View style={[styles.highlightCircle, styles.addCircle]}><MaterialIcons name="add" size={25} color={C.terracotta} /></View><Text style={[styles.highlightLabel, { fontFamily: bodyFont }]}>{copy.addHighlight}</Text></Pressable>{highlights.map((item) => <Pressable key={item.id} onPress={() => router.push({ pathname: "/(tabs)/create", params: { mode: "story" } })} style={styles.highlightItem}><View style={styles.highlightCircle}><MaterialIcons name={item.icon} size={23} color={C.leafGreen} /></View><Text style={[styles.highlightLabel, { fontFamily: bodyFont }]}>{language === "bn" ? item.labelBn : item.labelEn}</Text></Pressable>)}</ScrollView></View>
    <View style={styles.tabs}>{(["posts", "reels", "albums", "tagged"] as ProfileTab[]).map((tab) => <Pressable key={tab} onPress={() => setSelected(tab)} style={[styles.tab, selected === tab && styles.activeTab]} accessibilityRole="tab" accessibilityState={{ selected: selected === tab }}><MaterialIcons name={tab === "posts" ? "grid-on" : tab === "reels" ? "movie" : tab === "albums" ? "photo-library" : "person-pin"} size={17} color={selected === tab ? C.terracotta : C.slate} /><Text style={[styles.tabText, { fontFamily: mediumFont }, selected === tab && styles.activeTabText]}>{tab === "posts" ? copy.posts : tab === "reels" ? copy.reels : tab === "albums" ? copy.album : copy.tagged}</Text></Pressable>)}</View>
    {selected === "posts" ? photoPosts.length ? photoPosts.map((post) => <PostCard key={post.id} post={post} copy={copy} onOpen={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })} onLike={() => undefined} onReport={() => router.push({ pathname: "/report", params: { postId: post.id } })} />) : <Empty text={language === "bn" ? "আপনার পোস্টগুলি এখানে দেখা যাবে।" : "Your posts will appear here."} font={bodyFont} /> : null}
    {selected === "reels" ? videoPosts.length ? videoPosts.map((post) => <PostCard key={post.id} post={post} copy={copy} onOpen={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })} onLike={() => undefined} onReport={() => router.push({ pathname: "/report", params: { postId: post.id } })} />) : <Empty text={language === "bn" ? "আপনার রিলগুলি এখানে দেখা যাবে।" : "Your Reels will appear here."} font={bodyFont} /> : null}
    {selected === "albums" ? <View style={styles.albumGrid}>{albums.map((album) => <Pressable key={album.id} style={styles.albumCard} accessibilityRole="button"><Image source={COMMUNITY_IMAGE} style={styles.albumCover} /><View style={styles.albumOverlay}><Text style={[styles.albumCount, { fontFamily: mediumFont }]}>{album.count} {language === "bn" ? "টি আইটেম" : "items"}</Text></View><Text style={[styles.albumTitle, { fontFamily: mediumFont }]}>{language === "bn" ? album.titleBn : album.titleEn}</Text></Pressable>)}</View> : null}
    {selected === "tagged" ? <Empty text={language === "bn" ? "যে পোস্টে আপনাকে ট্যাগ করা হবে, সেগুলি এখানে দেখা যাবে।" : "Posts you’re tagged in will appear here."} font={bodyFont} /> : null}
  </ScrollView></ScreenContainer>;
}

function Stat({ value, label, font, bodyFont }: { value: string; label: string; font: string; bodyFont: string }) { return <View style={styles.stat}><Text style={[styles.statNumber, { fontFamily: font }]}>{value}</Text><Text style={[styles.statLabel, { fontFamily: bodyFont }]}>{label}</Text></View>; }
function Empty({ text, font }: { text: string; font: string }) { return <View style={styles.empty}><Text style={[styles.emptyText, { fontFamily: font }]}>{text}</Text></View>; }

const styles = StyleSheet.create({ container: { paddingHorizontal: 18, paddingBottom: 30 }, banner: { height: 128, marginHorizontal: -18, paddingHorizontal: 18, backgroundColor: C.primaryContainer, overflow: "hidden" }, sun: { position: "absolute", right: 54, top: 18, width: 36, height: 36, borderRadius: 18, backgroundColor: C.ochre }, hillBack: { position: "absolute", left: -30, right: -30, bottom: -30, height: 80, borderRadius: 80, backgroundColor: C.leafGreen, transform: [{ scaleX: 1.2 }] }, hillFront: { position: "absolute", left: -30, right: -30, bottom: -52, height: 86, borderRadius: 80, backgroundColor: Colors.dark.leafGreen, transform: [{ scaleX: 1.15 }] }, bannerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 13 }, bannerKicker: { color: C.inkNavy, fontSize: 10, fontWeight: "800", letterSpacing: 1.1 }, avatarFrame: { position: "absolute", left: 24, bottom: -40, borderRadius: 44, borderWidth: 4, borderColor: C.ivory, shadowColor: C.inkNavy, shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3 }, profile: { alignItems: "flex-start", paddingTop: 52 }, name: { color: C.inkNavy, fontSize: 24, fontWeight: "700" }, handle: { color: C.slate, fontSize: 12, marginTop: 4 }, bio: { color: C.inkNavy, fontSize: 13, lineHeight: 19, marginTop: 11 }, stats: { flexDirection: "row", marginTop: 20, width: "100%", justifyContent: "space-around", borderTopWidth: 1, borderBottomWidth: 1, borderColor: C.line, paddingVertical: 13 }, stat: { alignItems: "center", flex: 1 }, statNumber: { color: C.inkNavy, fontSize: 17, fontWeight: "800" }, statLabel: { color: C.slate, fontSize: 10, marginTop: 3 }, edit: { borderWidth: 1, borderColor: C.terracotta, backgroundColor: C.primaryContainer, borderRadius: 999, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, paddingHorizontal: 15, paddingVertical: 10, marginTop: 14, width: "100%" }, editText: { color: C.terracotta, fontWeight: "800", fontSize: 12 }, highlightSection: { marginTop: 21 }, sectionHeader: { flexDirection: "row", alignItems: "baseline", gap: 8, marginBottom: 11 }, sectionTitle: { color: C.inkNavy, fontSize: 17, fontWeight: "700" }, sectionHint: { color: C.slate, fontSize: 10 }, highlightRail: { gap: 15, paddingRight: 8 }, highlightItem: { width: 72, alignItems: "center" }, highlightCircle: { width: 62, height: 62, borderRadius: 31, backgroundColor: "#E4EFE5", borderWidth: 2, borderColor: C.leafGreen, alignItems: "center", justifyContent: "center" }, addCircle: { backgroundColor: C.primaryContainer, borderColor: C.terracotta, borderStyle: "dashed" }, highlightLabel: { color: C.slate, fontSize: 10, textAlign: "center", marginTop: 6 }, tabs: { flexDirection: "row", borderBottomWidth: 1, borderColor: C.line, marginTop: 22, marginBottom: 14 }, tab: { flex: 1, minHeight: 54, alignItems: "center", justifyContent: "center", gap: 3, borderBottomWidth: 3, borderBottomColor: "transparent" }, activeTab: { borderBottomColor: C.terracotta }, tabText: { color: C.slate, fontSize: 10, fontWeight: "700" }, activeTabText: { color: C.terracotta }, empty: { backgroundColor: C.paper, borderRadius: 20, padding: 22, borderWidth: 1, borderColor: C.line, marginBottom: 12 }, emptyText: { color: C.slate, textAlign: "center", fontSize: 13 }, albumGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 }, albumCard: { width: "48%", backgroundColor: C.paper, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: C.line }, albumCover: { width: "100%", aspectRatio: 1, resizeMode: "cover" }, albumOverlay: { position: "absolute", top: 8, right: 8, backgroundColor: "rgba(20,33,61,0.75)", borderRadius: 12, paddingHorizontal: 7, paddingVertical: 4 }, albumCount: { color: C.ivory, fontSize: 9 }, albumTitle: { color: C.inkNavy, fontSize: 12, padding: 10 } });
