import { MaterialIcons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useState } from "react";
import { Animated, Image, Pressable, Share, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import { Avatar } from "./Avatar";
import { Colors } from "@/constants/theme";
import { useLanguage } from "@/lib/apongram/LanguageContext";
import { createPostShareLinks, createPostShareMessage } from "@/lib/apongram/share-links";
import type { Post } from "@/lib/apongram/types";

const INK = Colors.light.inkNavy;
const MUTED = Colors.light.slate;
const TERRACOTTA = Colors.light.terracotta;
const PAPER = Colors.light.paper;
const LINE = Colors.light.line;
const GREEN = Colors.light.leafGreen;
const COMMUNITY_IMAGE = require("@/assets/images/community-pottery.jpg");
const DEMO_VIDEO_SOURCES: Record<string, number> = {
  "ekta-demo://market": require("../../assets/videos/reel-market.mp4"),
  "ekta-demo://cleanup": require("../../assets/videos/reel-cleanup.mp4"),
  "ekta-demo://planting": require("../../assets/videos/reel-planting.mp4"),
};

type CardCopy = { comments: string; likes: string; share: string; report: string; reported: string; demoLabel: string };
function InlineVideo({ uri, active }: { uri: string | number; active: boolean }) {
  const player = useVideoPlayer(typeof uri === "string" ? DEMO_VIDEO_SOURCES[uri] ?? uri : uri, (instance) => { instance.loop = true; instance.muted = true; });
  useEffect(() => {
    if (active) player.play();
    else player.pause();
    return () => player.pause();
  }, [active, player]);
  return <VideoView player={player} style={styles.photo} contentFit="cover" nativeControls />;
}

export function PostCard({ post, copy, onOpen, onLike, onReport, isVideoActive = true, onLayout }: { post: Post; copy: CardCopy; onOpen: () => void; onLike: () => void; onReport: () => void; isVideoActive?: boolean; onLayout?: (event: LayoutChangeEvent) => void }) {
  const { language } = useLanguage();
  const bodyFont = language === "bn" ? "HindSiliguri" : "HindSiliguriLatin";
  const mediumFont = language === "bn" ? "HindSiliguriSemiBold" : "HindSiliguriLatinSemiBold";
  const [likeScale] = useState(() => new Animated.Value(1));
  const sharePost = async () => {
    const links = createPostShareLinks(post.id);
    const message = createPostShareMessage(post.id, post.body, post.author.handle, post.location);
    try {
      await Share.share({ message, url: links.webUrl }, { dialogTitle: copy.share });
    } catch {
      // Dismissing or cancelling the native share sheet is not an error state.
    }
  };
  const handleLike = () => {
    onLike();
    likeScale.setValue(0.82);
    Animated.spring(likeScale, { toValue: 1, friction: 4, tension: 90, useNativeDriver: true }).start();
  };
  return <View style={styles.card} onLayout={onLayout}>
    <View style={styles.header}><Avatar profile={post.author} size={42} /><View style={styles.author}><View style={styles.nameRow}><Text style={[styles.name, { fontFamily: mediumFont }]}>{post.author.name}</Text>{post.author.verified && <MaterialIcons name="verified" size={15} color={TERRACOTTA} />}</View><Text style={[styles.meta, { fontFamily: bodyFont }]}>@{post.author.handle} · {post.createdAt}</Text></View>{post.isDemo ? <View style={styles.sampleBadge}><View style={styles.sampleDot} /><Text style={[styles.sampleText, { fontFamily: mediumFont }]}>{copy.demoLabel}</Text></View> : null}<Pressable onPress={onReport} hitSlop={10} accessibilityLabel={copy.report}><MaterialIcons name="more-horiz" size={22} color={MUTED} /></Pressable></View>
    <Pressable onPress={onOpen} onLongPress={() => undefined} delayLongPress={9999}><Text selectable={false} style={[styles.body, { fontFamily: bodyFont }]}>{post.body}</Text>{(post.imageUrl || post.videoUrl) && <View style={[styles.photoWrap, post.videoUrl ? styles.videoAspect : styles.imageAspect]}>{post.videoUrl ? <InlineVideo uri={post.videoUrl} active={isVideoActive} /> : <Image source={post.imageUrl === "community-pottery" ? COMMUNITY_IMAGE : { uri: post.imageUrl }} style={styles.photo} resizeMode="cover" />}<View style={styles.photoCaption}><MaterialIcons name={post.videoUrl ? "play-arrow" : "place"} size={13} color={PAPER} /><Text selectable={false} style={[styles.photoCaptionText, { fontFamily: mediumFont }]}>{post.videoUrl ? "Reel" : post.location}</Text></View></View>}<View style={styles.location}><MaterialIcons name="place" size={13} color={TERRACOTTA} /><Text selectable={false} style={[styles.locationText, { fontFamily: mediumFont }]}>{post.location}</Text></View></Pressable>
    <View style={styles.tags}>{post.tags.map((tag) => <View key={tag} style={styles.tagPill}><Text style={[styles.tag, { fontFamily: mediumFont }]}>#{tag}</Text></View>)}</View>
    <View style={styles.divider} /><View style={styles.actions}><Pressable onPress={handleLike} style={styles.action} hitSlop={4} accessibilityRole="button" accessibilityLabel={`${post.likes} ${copy.likes}`}><Animated.View style={{ transform: [{ scale: likeScale }] }}><MaterialIcons name={post.likedByMe ? "favorite" : "favorite-border"} size={20} color={post.likedByMe ? TERRACOTTA : MUTED} /></Animated.View><Text style={[styles.actionText, { fontFamily: mediumFont }, post.likedByMe && styles.activeText]}>{post.likes} {copy.likes}</Text></Pressable><Pressable onPress={onOpen} style={styles.action} hitSlop={4} accessibilityRole="button" accessibilityLabel={`${post.comments} ${copy.comments}`}><MaterialIcons name="chat-bubble-outline" size={19} color={MUTED} /><Text style={[styles.actionText, { fontFamily: mediumFont }]}>{post.comments} {copy.comments}</Text></Pressable><Pressable onPress={() => void sharePost()} style={styles.actionIcon} hitSlop={4} accessibilityRole="button" accessibilityLabel={copy.share}><MaterialIcons name="share" size={18} color={MUTED} /></Pressable></View>
  </View>;
}
const styles = StyleSheet.create({ card: { backgroundColor: PAPER, borderRadius: 22, padding: 15, marginBottom: 16, borderWidth: 1, borderColor: LINE, shadowColor: INK, shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 }, header: { flexDirection: "row", alignItems: "center" }, author: { flex: 1, marginLeft: 10 }, nameRow: { flexDirection: "row", alignItems: "center", gap: 4 }, name: { color: INK, fontWeight: "800", fontSize: 14 }, meta: { color: MUTED, fontSize: 11, marginTop: 3 }, sampleBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#DDEBDD", borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, marginRight: 5 }, sampleDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: GREEN }, sampleText: { color: Colors.dark.leafGreen, fontSize: 9, fontWeight: "800" }, body: { color: INK, fontSize: 15, lineHeight: 22, marginTop: 13, letterSpacing: 0.05 }, photoWrap: { borderRadius: 18, overflow: "hidden", marginTop: 13, position: "relative" }, imageAspect: { aspectRatio: 4 / 3 }, videoAspect: { aspectRatio: 9 / 16 }, photo: { width: "100%", height: "100%" }, photoCaption: { position: "absolute", left: 10, bottom: 9, flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(20,33,61,0.72)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 }, photoCaptionText: { color: PAPER, fontSize: 10, fontWeight: "700" }, location: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", marginTop: 10, gap: 4, backgroundColor: Colors.light.primaryContainer, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 }, locationText: { color: TERRACOTTA, fontSize: 10, fontWeight: "800" }, tags: { flexDirection: "row", flexWrap: "wrap", marginTop: 11, gap: 6 }, tagPill: { backgroundColor: Colors.light.primaryContainer, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }, tag: { color: GREEN, fontSize: 11, fontWeight: "800" }, divider: { height: 1, backgroundColor: LINE, marginVertical: 13 }, actions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: Colors.light.primaryContainer, borderRadius: 15, paddingVertical: 2 }, action: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, borderRadius: 999 }, actionIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" }, actionText: { color: MUTED, fontSize: 11, fontWeight: "700" }, activeText: { color: TERRACOTTA } });
