import { MaterialIcons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Avatar } from "./Avatar";
import type { Post } from "@/lib/apongram/types";

const INK = "#1E1B16";
const MUTED = "#6B6153";
const TERRACOTTA = "#C85A3A";
const COMMUNITY_IMAGE = require("@/assets/images/community-pottery.jpg");

type CardCopy = { comments: string; likes: string; report: string; reported: string };
export function PostCard({ post, copy, onOpen, onLike, onReport }: { post: Post; copy: CardCopy; onOpen: () => void; onLike: () => void; onReport: () => void }) {
  return <View style={styles.card}>
    <View style={styles.header}><Avatar profile={post.author} size={42} /><View style={styles.author}><View style={styles.nameRow}><Text style={styles.name}>{post.author.name}</Text>{post.author.verified && <MaterialIcons name="verified" size={15} color={TERRACOTTA} />}</View><Text style={styles.meta}>@{post.author.handle} · {post.createdAt}</Text></View><Pressable onPress={onReport} hitSlop={10} accessibilityLabel={copy.report}><MaterialIcons name="more-horiz" size={22} color={MUTED} /></Pressable></View>
    <Pressable onPress={onOpen}><Text style={styles.body}>{post.body}</Text>{post.imageUrl && <View style={styles.photoWrap}><Image source={post.imageUrl === "community-pottery" ? COMMUNITY_IMAGE : { uri: post.imageUrl }} style={styles.photo} resizeMode="cover" /><View style={styles.photoCaption}><MaterialIcons name="place" size={13} color="#FFF" /><Text style={styles.photoCaptionText}>{post.location}</Text></View></View>}<View style={styles.location}><MaterialIcons name="place" size={13} color={TERRACOTTA} /><Text style={styles.locationText}>{post.location}</Text></View></Pressable>
    <View style={styles.tags}>{post.tags.map((tag) => <Text key={tag} style={styles.tag}>#{tag}</Text>)}</View>
    <View style={styles.divider} /><View style={styles.actions}>
      <Pressable onPress={onLike} style={styles.action}><MaterialIcons name={post.likedByMe ? "favorite" : "favorite-border"} size={20} color={post.likedByMe ? TERRACOTTA : MUTED} /><Text style={[styles.actionText, post.likedByMe && styles.activeText]}>{post.likes} {copy.likes}</Text></Pressable>
      <Pressable onPress={onOpen} style={styles.action}><MaterialIcons name="chat-bubble-outline" size={19} color={MUTED} /><Text style={styles.actionText}>{post.comments} {copy.comments}</Text></Pressable>
      <Pressable onPress={onReport} style={styles.action}><MaterialIcons name="share" size={18} color={MUTED} /></Pressable>
    </View>
  </View>;
}
const styles = StyleSheet.create({ card: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginBottom: 13, borderWidth: 1, borderColor: "#E3DACB" }, header: { flexDirection: "row", alignItems: "center" }, author: { flex: 1, marginLeft: 10 }, nameRow: { flexDirection: "row", alignItems: "center", gap: 4 }, name: { color: INK, fontWeight: "800", fontSize: 14 }, meta: { color: MUTED, fontSize: 11, marginTop: 3 }, body: { color: INK, fontSize: 15, lineHeight: 23, marginTop: 14 }, photoWrap: { height: 172, borderRadius: 12, overflow: "hidden", marginTop: 12, position: "relative" }, photo: { width: "100%", height: "100%" }, photoCaption: { position: "absolute", left: 10, bottom: 9, flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(30,27,22,0.6)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 }, photoCaptionText: { color: "#FFF", fontSize: 10, fontWeight: "700" }, location: { flexDirection: "row", alignItems: "center", marginTop: 12, gap: 3 }, locationText: { color: TERRACOTTA, fontSize: 11, fontWeight: "700" }, tags: { flexDirection: "row", flexWrap: "wrap", marginTop: 10, gap: 6 }, tag: { color: "#1F6F6B", fontSize: 12, fontWeight: "700" }, divider: { height: 1, backgroundColor: "#E3DACB", marginVertical: 13 }, actions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, action: { flexDirection: "row", alignItems: "center", gap: 5 }, actionText: { color: MUTED, fontSize: 11, fontWeight: "600" }, activeText: { color: TERRACOTTA } });
