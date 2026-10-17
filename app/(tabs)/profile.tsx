import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Image, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Avatar } from "@/components/apongram/Avatar";
import { PostCard } from "@/components/apongram/PostCard";
import { Colors } from "@/constants/theme";
import { ScreenContainer } from "@/components/screen-container";
import { currentUser, demoStories, posts, profiles } from "@/lib/apongram/mock-data";
import { getStoredProfile } from "@/lib/apongram/profile-store";
import { getProfileWithLocalCounts, getRelationship, setRelationship, type Relationship } from "@/lib/apongram/follows";
import { getStoryHighlights, saveStoryHighlight, type StoryHighlight } from "@/lib/apongram/story-highlights";
import { demoProfileAlbums, type ProfileAlbum } from "@/lib/apongram/profile-albums";
import { demoProfilePosts, demoTaggedPosts } from "@/lib/apongram/profile-demo-data";
import { useLanguage } from "@/lib/apongram/LanguageContext";
import type { Post, Profile, ProfileCategory } from "@/lib/apongram/types";

const C = Colors.light;
const COMMUNITY_IMAGE = require("../../assets/images/community-pottery.jpg");
type ProfileTab = "posts" | "reels" | "albums" | "tagged";

export default function ProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const viewedId = typeof params.id === "string" ? params.id : currentUser.id;
  const { language, copy } = useLanguage();
  const [profile, setProfile] = useState<Profile>(profiles.find((item) => item.id === viewedId) ?? currentUser);
  const [relationship, setRelationshipState] = useState<Relationship>("none");
  const [selected, setSelected] = useState<ProfileTab>("posts");
  const [highlights, setHighlights] = useState<StoryHighlight[]>([]);
  const [highlightModal, setHighlightModal] = useState(false);
  const [highlightTitle, setHighlightTitle] = useState("");
  const [viewer, setViewer] = useState<StoryHighlight>();
  const [albumViewer, setAlbumViewer] = useState<ProfileAlbum>();
  const [now] = useState(() => Date.now());
  const bodyFont = language === "bn" ? "HindSiliguri" : "HindSiliguriLatin";
  const mediumFont = language === "bn" ? "HindSiliguriSemiBold" : "HindSiliguriLatinSemiBold";
  const headingFont = language === "bn" ? "NotoSerifBengaliBold" : "Fraunces";
  const ownPosts = [...posts, ...demoProfilePosts].filter((post) => post.author.id === profile.id);
  const profilePosts = ownPosts.filter((post) => !post.isStory);
  const storyPosts = [...demoStories.filter((post) => post.author.id === profile.id), ...ownPosts.filter((post) => post.isStory)].filter((post) => !post.storyExpiresAt || new Date(post.storyExpiresAt).getTime() > now);
  const photoPosts = profilePosts.filter((post) => !post.videoUrl);
  const videoPosts = profilePosts.filter((post) => Boolean(post.videoUrl));

  useFocusEffect(useCallback(() => {
    let active = true;
    const baseProfile = viewedId === currentUser.id ? getStoredProfile() : Promise.resolve(profiles.find((item) => item.id === viewedId) ?? currentUser);
    void Promise.all([baseProfile, getStoryHighlights(), getRelationship(viewedId)]).then(async ([stored, items, savedRelationship]) => {
      const withCounts = await getProfileWithLocalCounts(stored);
      if (!active) return;
      setProfile(withCounts);
      setHighlights(viewedId === currentUser.id ? items : []);
      setRelationshipState(savedRelationship);
    });
    return () => { active = false; };
  }, [viewedId]));

  const isOwnProfile = profile.id === currentUser.id;
  const reloadRelationship = async (next: Relationship) => {
    setRelationshipState(next);
    await setRelationship(profile.id, next);
    setProfile(await getProfileWithLocalCounts(profile));
  };
  const handleFollow = () => { void reloadRelationship(relationship === "following" ? "none" : "following"); };
  const sendRequest = () => { void reloadRelationship(relationship === "requested" ? "none" : "requested"); };

  const createHighlight = async () => {
    if (!highlightTitle.trim() || !storyPosts.length) return;
    const item = await saveStoryHighlight(highlightTitle, storyPosts.map((post) => post.id));
    setHighlights((items) => [item, ...items]);
    setHighlightTitle("");
    setHighlightModal(false);
  };
  const viewerStories = viewer?.storyIds.map((id) => [...demoStories, ...posts].find((post) => post.id === id)).filter((post): post is Post => Boolean(post)) ?? [];

  return <ScreenContainer safeAreaClassName="bg-background" className="bg-background"><ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
    <View style={styles.banner}><View style={styles.sun} /><View style={styles.hillBack} /><View style={styles.hillFront} /><View style={styles.bannerTop}><Text style={[styles.bannerKicker, { fontFamily: mediumFont }]}>{language === "bn" ? "আপনার একতার জায়গা" : "YOUR PLACE IN eKta Social"}</Text><Pressable onPress={() => router.push("/settings")} accessibilityLabel={copy.editProfile}><MaterialIcons name="settings" size={22} color={C.inkNavy} /></Pressable></View><View style={styles.avatarFrame}><Avatar profile={profile} size={78} /></View></View>
    <View style={styles.profile}><Text style={[styles.name, { fontFamily: headingFont }]}>{profile.name}</Text><Text style={[styles.handle, { fontFamily: bodyFont }]}>@{profile.handle} · {profile.region}</Text>
      {profile.pronouns ? <Text style={[profileExtraStyles.pronouns, { fontFamily: bodyFont }]}>{profile.pronouns}</Text> : null}
      {profile.category ? <View style={profileExtraStyles.category}><MaterialIcons name="sell" size={13} color={C.terracotta} /><Text style={[profileExtraStyles.categoryText, { fontFamily: mediumFont }]}>{categoryLabel(profile.category, language === "bn")}</Text></View> : null}
      <Text style={[styles.bio, { fontFamily: bodyFont }]}>{profile.bio}</Text>
      {profile.website ? <Pressable onPress={() => void Linking.openURL(profile.website!.startsWith("http") ? profile.website! : `https://${profile.website}`)} style={profileExtraStyles.website} accessibilityRole="link"><MaterialIcons name="link" size={15} color={C.terracotta} /><Text numberOfLines={1} style={[profileExtraStyles.websiteText, { fontFamily: mediumFont }]}>{profile.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}</Text></Pressable> : null}
      <View style={styles.stats}><Stat value={String(profilePosts.length)} label={copy.posts} font={mediumFont} bodyFont={bodyFont} /><Stat value={String(profile.followers)} label={copy.followers} font={mediumFont} bodyFont={bodyFont} onPress={() => router.push({ pathname: "/connections" as never, params: { id: profile.id, tab: "followers" } })} /><Stat value={String(profile.following)} label={copy.following} font={mediumFont} bodyFont={bodyFont} onPress={() => router.push({ pathname: "/connections" as never, params: { id: profile.id, tab: "following" } })} /></View>
      {isOwnProfile ? <Pressable onPress={() => router.push("/profile-edit")} style={styles.edit} accessibilityRole="button" accessibilityLabel={copy.editProfile}><MaterialIcons name="edit" size={16} color={C.terracotta} /><Text style={[styles.editText, { fontFamily: mediumFont }]}>{copy.editProfile}</Text></Pressable> : <View style={styles.profileActions}><Pressable onPress={() => router.push({ pathname: "/messages/[id]" as never, params: { id: profile.id } })} style={styles.requestButton} accessibilityRole="button" accessibilityLabel={language === "bn" ? "বার্তা পাঠান" : "Message"}><MaterialIcons name="chat-bubble-outline" size={16} color={C.terracotta} /><Text style={[styles.requestText, { fontFamily: mediumFont }]}>{language === "bn" ? "বার্তা" : "Message"}</Text></Pressable><Pressable onPress={handleFollow} style={[styles.followButton, relationship === "following" && styles.followingButton]} accessibilityRole="button" accessibilityState={{ selected: relationship === "following" }}><MaterialIcons name={relationship === "following" ? "check" : "person-add"} size={16} color={relationship === "following" ? C.leafGreen : C.ivory} /><Text style={[styles.followText, { fontFamily: mediumFont }, relationship === "following" && styles.followingText]}>{relationship === "following" ? (language === "bn" ? "আনফলো" : "Unfollow") : (language === "bn" ? "ফলো করুন" : "Follow")}</Text></Pressable><Pressable onPress={sendRequest} style={[styles.requestButton, relationship === "requested" && styles.requestedButton]} accessibilityRole="button" accessibilityState={{ selected: relationship === "requested" }}><MaterialIcons name={relationship === "requested" ? "schedule" : "person-add-alt-1"} size={16} color={C.terracotta} /><Text style={[styles.requestText, { fontFamily: mediumFont }]}>{relationship === "requested" ? (language === "bn" ? "রিকোয়েস্ট বাতিল" : "Cancel request") : (language === "bn" ? "রিকোয়েস্ট পাঠান" : "Request" )}</Text></Pressable></View>}
    </View>
    <View style={styles.highlightSection}><View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { fontFamily: headingFont }]}>{copy.profileHighlights}</Text><Text style={[styles.sectionHint, { fontFamily: bodyFont }]}>{language === "bn" ? "আপনার গল্প" : "Your stories"}</Text></View><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.highlightRail}><Pressable onPress={() => setHighlightModal(true)} style={styles.highlightItem} accessibilityLabel={copy.addHighlight}><View style={[styles.highlightCircle, styles.addCircle]}><MaterialIcons name="add" size={25} color={C.terracotta} /></View><Text style={[styles.highlightLabel, { fontFamily: bodyFont }]}>{copy.addHighlight}</Text></Pressable>{highlights.map((item) => <Pressable key={item.id} onPress={() => setViewer(item)} style={styles.highlightItem}><View style={styles.highlightCircle}><MaterialIcons name="collections-bookmark" size={23} color={C.leafGreen} /></View><Text numberOfLines={1} style={[styles.highlightLabel, { fontFamily: bodyFont }]}>{item.title}</Text></Pressable>)}</ScrollView></View>
    <View style={styles.tabs}>{(["posts", "reels", "albums", "tagged"] as ProfileTab[]).map((tab) => <Pressable key={tab} onPress={() => setSelected(tab)} style={[styles.tab, selected === tab && styles.activeTab]} accessibilityRole="tab" accessibilityState={{ selected: selected === tab }}><MaterialIcons name={tab === "posts" ? "grid-on" : tab === "reels" ? "movie" : tab === "albums" ? "photo-library" : "person-pin"} size={17} color={selected === tab ? C.terracotta : C.slate} /><Text style={[styles.tabText, { fontFamily: mediumFont }, selected === tab && styles.activeTabText]}>{tab === "posts" ? copy.posts : tab === "reels" ? copy.reels : tab === "albums" ? copy.album : copy.tagged}</Text></Pressable>)}</View>
    {selected === "posts" ? photoPosts.length ? photoPosts.map((post) => <PostCard key={post.id} post={post} copy={copy} onOpen={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })} onLike={() => undefined} onReport={() => router.push({ pathname: "/report", params: { postId: post.id } })} />) : <Empty text={language === "bn" ? "আপনার পোস্টগুলি এখানে দেখা যাবে।" : "Your posts will appear here."} font={bodyFont} /> : null}
    {selected === "reels" ? videoPosts.length ? videoPosts.map((post) => <PostCard key={post.id} post={post} copy={copy} onOpen={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })} onLike={() => undefined} onReport={() => router.push({ pathname: "/report", params: { postId: post.id } })} />) : <Empty text={language === "bn" ? "আপনার রিলগুলি এখানে দেখা যাবে।" : "Your Reels will appear here."} font={bodyFont} /> : null}
    {selected === "albums" ? <View style={styles.albumGrid}>{demoProfileAlbums.map((album) => <Pressable key={album.id} onPress={() => setAlbumViewer(album)} style={styles.albumCard} accessibilityRole="button" accessibilityLabel={language === "bn" ? album.titleBn : album.titleEn}><Image source={COMMUNITY_IMAGE} style={styles.albumCover} /><View style={styles.albumOverlay}><Text style={[styles.albumCount, { fontFamily: mediumFont }]}>{album.items.length} {language === "bn" ? "টি নমুনা" : "sample items"}</Text></View><Text style={[styles.albumTitle, { fontFamily: mediumFont }]}>{language === "bn" ? album.titleBn : album.titleEn}</Text></Pressable>)}</View> : null}
    {selected === "tagged" ? <TaggedGrid posts={demoTaggedPosts} language={language} mediumFont={mediumFont} onOpen={(post) => router.push({ pathname: "/post/[id]", params: { id: post.id } })} /> : null}
  </ScrollView>
  <Modal visible={highlightModal} transparent animationType="slide" onRequestClose={() => setHighlightModal(false)}><View style={styles.modalBackdrop}><View style={styles.sheet}><View style={styles.sheetHeader}><Text style={[styles.sheetTitle, { fontFamily: headingFont }]}>{copy.highlightCreateTitle}</Text><Pressable onPress={() => setHighlightModal(false)} accessibilityLabel={copy.highlightClose}><MaterialIcons name="close" size={22} color={C.slate} /></Pressable></View><TextInput value={highlightTitle} onChangeText={setHighlightTitle} placeholder={copy.highlightNamePlaceholder} placeholderTextColor={C.slate} style={[styles.highlightInput, { fontFamily: bodyFont }]} autoFocus /><Text style={[styles.sheetNote, { fontFamily: bodyFont }]}>{storyPosts.length ? `${storyPosts.length} ${language === "bn" ? "টি সক্রিয় স্টোরি এই হাইলাইটে যোগ হবে।" : "active stories will be added to this highlight."}` : copy.highlightNoStories}</Text>{!storyPosts.length ? <Pressable onPress={() => { setHighlightModal(false); router.push({ pathname: "/(tabs)/create", params: { mode: "story" } }); }} style={styles.addStoryButton}><MaterialIcons name="add-circle-outline" size={18} color={C.terracotta} /><Text style={[styles.addStoryText, { fontFamily: mediumFont }]}>{copy.highlightAddStory}</Text></Pressable> : null}<Pressable onPress={() => void createHighlight()} disabled={!highlightTitle.trim() || !storyPosts.length} style={[styles.createHighlightButton, (!highlightTitle.trim() || !storyPosts.length) && styles.disabledButton]}><Text style={[styles.createHighlightText, { fontFamily: mediumFont }]}>{copy.highlightCreate}</Text></Pressable></View></View></Modal>
  <Modal visible={Boolean(viewer)} animationType="fade" onRequestClose={() => setViewer(undefined)}><View style={styles.storyViewer}>{viewerStories.length ? <StorySlide post={viewerStories[0]} profile={profile} bodyFont={bodyFont} mediumFont={mediumFont} /> : <View style={styles.viewerEmpty}><MaterialIcons name="collections-bookmark" size={42} color={C.ochre} /><Text style={[styles.viewerEmptyText, { fontFamily: bodyFont }]}>{copy.highlightEmpty}</Text></View>}<Pressable onPress={() => setViewer(undefined)} style={styles.viewerClose} accessibilityLabel={copy.highlightClose}><MaterialIcons name="close" size={24} color={C.ivory} /></Pressable><Text style={[styles.viewerTitle, { fontFamily: mediumFont }]}>{viewer?.title}</Text></View></Modal>
  <Modal visible={Boolean(albumViewer)} animationType="slide" onRequestClose={() => setAlbumViewer(undefined)}><View style={albumStyles.albumViewer}><View style={albumStyles.albumViewerHeader}><View><Text style={[albumStyles.albumViewerTitle, { fontFamily: headingFont }]}>{albumViewer ? (language === "bn" ? albumViewer.titleBn : albumViewer.titleEn) : null}</Text><Text style={[albumStyles.albumViewerMeta, { fontFamily: bodyFont }]}>{albumViewer?.items.length} {language === "bn" ? "টি নমুনা ছবি" : "sample photos"}</Text></View><Pressable onPress={() => setAlbumViewer(undefined)} accessibilityLabel={copy.highlightClose} style={albumStyles.albumClose}><MaterialIcons name="close" size={23} color={C.inkNavy} /></Pressable></View><ScrollView contentContainerStyle={albumStyles.albumMediaGrid}>{albumViewer?.items.map((item) => <View key={item.id} style={albumStyles.albumMediaItem}><Image source={COMMUNITY_IMAGE} style={albumStyles.albumMediaImage} /><View style={albumStyles.albumSample}><Text style={[albumStyles.albumSampleText, { fontFamily: mediumFont }]}>{copy.demoLabel}</Text></View><Text style={[albumStyles.albumCaption, { fontFamily: bodyFont }]} numberOfLines={2}>{item.caption}</Text></View>)}</ScrollView></View></Modal>
  </ScreenContainer>;
}

function Stat({ value, label, font, bodyFont, onPress }: { value: string; label: string; font: string; bodyFont: string; onPress?: () => void }) { return <Pressable disabled={!onPress} onPress={onPress} style={styles.stat} accessibilityRole={onPress ? "button" : undefined}><Text style={[styles.statNumber, { fontFamily: font }]}>{value}</Text><Text style={[styles.statLabel, { fontFamily: bodyFont }]}>{label}</Text></Pressable>; }
function Empty({ text, font }: { text: string; font: string }) { return <View style={styles.empty}><Text style={[styles.emptyText, { fontFamily: font }]}>{text}</Text></View>; }
function categoryLabel(category: ProfileCategory, bn: boolean) {
  const labels: Record<ProfileCategory, [string, string]> = {
    community: ["Community", "কমিউনিটি"],
    creator: ["Creator", "ক্রিয়েটর"],
    "local-business": ["Local business", "স্থানীয় ব্যবসা"],
    volunteer: ["Volunteer", "স্বেচ্ছাসেবক"],
    organization: ["Organization", "সংগঠন"],
  };
  return labels[category][bn ? 1 : 0];
}
function TaggedGrid({ posts: taggedPosts, language, mediumFont, onOpen }: { posts: Post[]; language: "bn" | "en"; mediumFont: string; onOpen: (post: Post) => void }) {
  return <View style={taggedStyles.grid}>{taggedPosts.map((post) => <Pressable key={post.id} onPress={() => onOpen(post)} style={({ pressed }) => [taggedStyles.tile, pressed && taggedStyles.tilePressed]} accessibilityRole="button" accessibilityLabel={language === "bn" ? `নমুনা ট্যাগ করা পোস্ট, ${post.likes} লাইক` : `Sample tagged post, ${post.likes} likes`}>
    {post.imageUrl ? <Image source={post.imageUrl === "community-pottery" ? COMMUNITY_IMAGE : { uri: post.imageUrl }} style={taggedStyles.image} resizeMode="cover" /> : <View style={taggedStyles.colourTile}><MaterialIcons name={post.videoUrl ? "movie" : "auto-awesome"} size={28} color={C.ochre} /></View>}
    <View style={taggedStyles.scrim} />
    <View style={taggedStyles.sampleBadge}><View style={taggedStyles.sampleDot} /><Text style={[taggedStyles.sampleText, { fontFamily: mediumFont }]}>{language === "bn" ? "নমুনা" : "Sample"}</Text></View>
    <View style={taggedStyles.tileMeta}>{post.videoUrl ? <MaterialIcons name="play-arrow" size={15} color={C.ivory} /> : null}<MaterialIcons name="favorite" size={13} color={C.ivory} /><Text style={[taggedStyles.likes, { fontFamily: mediumFont }]}>{post.likes}</Text></View>
  </Pressable>)}</View>;
}
function StorySlide({ post, profile, bodyFont, mediumFont }: { post: Post; profile: Profile; bodyFont: string; mediumFont: string }) { return <View style={styles.storySlide}>{post.imageUrl ? <Image source={post.imageUrl === "community-pottery" ? COMMUNITY_IMAGE : { uri: post.imageUrl }} style={styles.storyImage} resizeMode="cover" /> : <View style={styles.storyColour}><MaterialIcons name={post.videoUrl ? "movie" : "auto-awesome"} size={46} color={C.ochre} /></View>}<View style={styles.storyShade} /><View style={styles.storyHeaderOverlay}><Avatar profile={profile} size={36} /><View><Text style={[styles.storyAuthor, { fontFamily: mediumFont }]}>{profile.name}</Text><Text style={[styles.storyTime, { fontFamily: bodyFont }]}>{post.createdAt}</Text></View></View><Text style={[styles.storyBody, { fontFamily: bodyFont }]}>{post.body}</Text></View>; }

const styles = StyleSheet.create({ container: { paddingHorizontal: 18, paddingBottom: 30 }, banner: { height: 128, marginHorizontal: -18, paddingHorizontal: 18, backgroundColor: C.primaryContainer, overflow: "hidden" }, sun: { position: "absolute", right: 54, top: 18, width: 36, height: 36, borderRadius: 18, backgroundColor: C.ochre }, hillBack: { position: "absolute", left: -30, right: -30, bottom: -30, height: 80, borderRadius: 80, backgroundColor: C.leafGreen, transform: [{ scaleX: 1.2 }] }, hillFront: { position: "absolute", left: -30, right: -30, bottom: -52, height: 86, borderRadius: 80, backgroundColor: Colors.dark.leafGreen, transform: [{ scaleX: 1.15 }] }, bannerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 13 }, bannerKicker: { color: C.inkNavy, fontSize: 10, fontWeight: "800", letterSpacing: 1.1 }, avatarFrame: { position: "absolute", left: 24, bottom: -40, borderRadius: 44, borderWidth: 4, borderColor: C.ivory, shadowColor: C.inkNavy, shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3 }, profile: { alignItems: "flex-start", paddingTop: 52 }, name: { color: C.inkNavy, fontSize: 24, fontWeight: "700" }, handle: { color: C.slate, fontSize: 12, marginTop: 4 }, bio: { color: C.inkNavy, fontSize: 13, lineHeight: 19, marginTop: 11 }, stats: { flexDirection: "row", marginTop: 20, width: "100%", justifyContent: "space-around", borderTopWidth: 1, borderBottomWidth: 1, borderColor: C.line, paddingVertical: 13 }, stat: { alignItems: "center", flex: 1 }, statNumber: { color: C.inkNavy, fontSize: 17, fontWeight: "800" }, statLabel: { color: C.slate, fontSize: 10, marginTop: 3 }, edit: { borderWidth: 1, borderColor: C.terracotta, backgroundColor: C.primaryContainer, borderRadius: 999, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, paddingHorizontal: 15, paddingVertical: 10, marginTop: 14, width: "100%" }, editText: { color: C.terracotta, fontWeight: "800", fontSize: 12 }, profileActions: { flexDirection: "row", gap: 9, marginTop: 14 }, followButton: { flex: 1, minHeight: 44, borderRadius: 14, backgroundColor: C.terracotta, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: 10 }, followingButton: { backgroundColor: C.primaryContainer, borderWidth: 1, borderColor: C.leafGreen }, followText: { color: C.ivory, fontSize: 11, fontWeight: "800" }, followingText: { color: C.leafGreen }, requestButton: { flex: 1, minHeight: 44, borderRadius: 14, backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: 9 }, requestedButton: { backgroundColor: "#EAF3EA", borderColor: "#C9DEC9" }, requestText: { color: C.terracotta, fontSize: 10, fontWeight: "800" }, highlightSection: { marginTop: 21 }, sectionHeader: { flexDirection: "row", alignItems: "baseline", gap: 8, marginBottom: 11 }, sectionTitle: { color: C.inkNavy, fontSize: 17, fontWeight: "700" }, sectionHint: { color: C.slate, fontSize: 10 }, highlightRail: { gap: 15, paddingRight: 8 }, highlightItem: { width: 72, alignItems: "center" }, highlightCircle: { width: 62, height: 62, borderRadius: 31, backgroundColor: "#E4EFE5", borderWidth: 2, borderColor: C.leafGreen, alignItems: "center", justifyContent: "center" }, addCircle: { backgroundColor: C.primaryContainer, borderColor: C.terracotta, borderStyle: "dashed" }, highlightLabel: { color: C.slate, fontSize: 10, textAlign: "center", marginTop: 6 }, tabs: { flexDirection: "row", borderBottomWidth: 1, borderColor: C.line, marginTop: 22, marginBottom: 14 }, tab: { flex: 1, minHeight: 54, alignItems: "center", justifyContent: "center", gap: 3, borderBottomWidth: 3, borderBottomColor: "transparent" }, activeTab: { borderBottomColor: C.terracotta }, tabText: { color: C.slate, fontSize: 10, fontWeight: "700" }, activeTabText: { color: C.terracotta }, empty: { backgroundColor: C.paper, borderRadius: 20, padding: 22, borderWidth: 1, borderColor: C.line, marginBottom: 12 }, emptyText: { color: C.slate, textAlign: "center", fontSize: 13 }, albumGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 }, albumCard: { width: "48%", backgroundColor: C.paper, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: C.line }, albumCover: { width: "100%", aspectRatio: 1, resizeMode: "cover" }, albumOverlay: { position: "absolute", top: 8, right: 8, backgroundColor: "rgba(20,33,61,0.75)", borderRadius: 12, paddingHorizontal: 7, paddingVertical: 4 }, albumCount: { color: C.ivory, fontSize: 9 }, albumTitle: { color: C.inkNavy, fontSize: 12, padding: 10 }, modalBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(20,33,61,0.42)" }, sheet: { backgroundColor: C.ivory, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 30 }, sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, sheetTitle: { color: C.inkNavy, fontSize: 21 }, highlightInput: { backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, borderRadius: 13, color: C.inkNavy, minHeight: 50, paddingHorizontal: 14, marginTop: 18, fontSize: 14 }, sheetNote: { color: C.slate, fontSize: 12, lineHeight: 18, marginTop: 11 }, addStoryButton: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 13, minHeight: 44 }, addStoryText: { color: C.terracotta, fontSize: 13 }, createHighlightButton: { minHeight: 48, borderRadius: 14, backgroundColor: C.terracotta, alignItems: "center", justifyContent: "center", marginTop: 18 }, disabledButton: { opacity: 0.4 }, createHighlightText: { color: C.ivory, fontSize: 13 }, storyViewer: { flex: 1, backgroundColor: C.inkNavy, justifyContent: "center" }, storySlide: { flex: 1, position: "relative" }, storyImage: { width: "100%", height: "100%" }, storyColour: { flex: 1, backgroundColor: C.leafGreen, alignItems: "center", justifyContent: "center" }, storyShade: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(20,33,61,0.26)" }, storyHeaderOverlay: { position: "absolute", top: 56, left: 18, right: 18, flexDirection: "row", alignItems: "center", gap: 9 }, storyAuthor: { color: C.ivory, fontSize: 13 }, storyTime: { color: "rgba(251,246,236,0.74)", fontSize: 10, marginTop: 2 }, storyBody: { position: "absolute", left: 24, right: 24, bottom: 100, color: C.ivory, fontSize: 20, lineHeight: 29, textAlign: "center" }, viewerClose: { position: "absolute", top: 50, right: 16, width: 44, height: 44, alignItems: "center", justifyContent: "center" }, viewerTitle: { position: "absolute", bottom: 40, left: 20, color: C.ivory, fontSize: 12 }, viewerEmpty: { alignItems: "center", justifyContent: "center", padding: 30 }, viewerEmptyText: { color: C.ivory, fontSize: 14, textAlign: "center", marginTop: 14 } });

const profileExtraStyles = StyleSheet.create({
  pronouns: { color: C.slate, fontSize: 11, marginTop: 5 },
  category: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: C.primaryContainer, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5, marginTop: 8 },
  categoryText: { color: C.terracotta, fontSize: 10, fontWeight: "800" },
  website: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 8, minHeight: 28, maxWidth: "100%" },
  websiteText: { color: C.terracotta, fontSize: 12, fontWeight: "800", textDecorationLine: "underline", flexShrink: 1 },
});

const taggedStyles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  tile: { width: "32.2%", aspectRatio: 1, borderRadius: 10, overflow: "hidden", backgroundColor: C.leafGreen, position: "relative", minHeight: 44 },
  tilePressed: { opacity: 0.76, transform: [{ scale: 0.98 }] },
  image: { width: "100%", height: "100%" },
  colourTile: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C.leafGreen },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(20,33,61,0.12)" },
  sampleBadge: { position: "absolute", top: 6, left: 6, flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(20,33,61,0.78)", borderRadius: 10, paddingHorizontal: 6, paddingVertical: 3 },
  sampleDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.ochre },
  sampleText: { color: C.ivory, fontSize: 8, fontWeight: "800" },
  tileMeta: { position: "absolute", right: 7, bottom: 7, flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(20,33,61,0.72)", borderRadius: 10, paddingHorizontal: 6, paddingVertical: 3 },
  likes: { color: C.ivory, fontSize: 9, fontWeight: "800" },
});

const albumStyles = StyleSheet.create({
  albumViewer: { flex: 1, backgroundColor: C.ivory, paddingTop: 58 },
  albumViewerHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: C.line },
  albumViewerTitle: { color: C.inkNavy, fontSize: 22, fontWeight: "700" },
  albumViewerMeta: { color: C.slate, fontSize: 12, marginTop: 2 },
  albumClose: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: C.paper, borderWidth: 1, borderColor: C.line },
  albumMediaGrid: { flexDirection: "row", flexWrap: "wrap", padding: 6, gap: 6 },
  albumMediaItem: { width: "31.8%", marginBottom: 8 },
  albumMediaImage: { width: "100%", aspectRatio: 1, borderRadius: 8 },
  albumSample: { position: "absolute", top: 6, left: 6, backgroundColor: "rgba(20,33,61,0.78)", borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2 },
  albumSampleText: { color: C.ivory, fontSize: 8, fontWeight: "800" },
  albumCaption: { color: C.slate, fontSize: 10, lineHeight: 13, marginTop: 4 },
});
