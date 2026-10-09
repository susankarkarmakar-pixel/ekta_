import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Avatar } from "./Avatar";
import type { Post } from "@/lib/apongram/types";

const INK = "#172A35";
const MUTED = "#7C817F";
const TERRACOTTA = "#C85C3A";

export function PostCard({ post, copy, onOpen, onLike, onReport }: { post: Post; copy: { comments: string; likes: string; report: string; reported: string }; onOpen: () => void; onLike: () => void; onReport: () => void }) {
  return <View style={styles.card}>
    <View style={styles.header}><Avatar profile={post.author} size={42} /><View style={styles.author}><View style={styles.nameRow}><Text style={styles.name}>{post.author.name}</Text>{post.author.verified && <MaterialIcons name="verified" size={15} color={TERRACOTTA} />}</View><Text style={styles.meta}>@{post.author.handle} · {post.createdAt}</Text></View><Pressable onPress={onReport} hitSlop={10}><MaterialIcons name="more-horiz" size={22} color={MUTED} /></Pressable></View>
    <Pressable onPress={onOpen}><Text style={styles.body}>{post.body}</Text><View style={styles.location}><MaterialIcons name="place" size={13} color={TERRACOTTA} /><Text style={styles.locationText}>{post.location}</Text></View></Pressable>
    <View style={styles.tags}>{post.tags.map((tag) => <Text key={tag} style={styles.tag}>#{tag}</Text>)}</View>
    <View style={styles.divider} /><View style={styles.actions}>
      <Pressable onPress={onLike} style={styles.action}><MaterialIcons name={post.likedByMe ? "favorite" : "favorite-border"} size={20} color={post.likedByMe ? TERRACOTTA : MUTED} /><Text style={[styles.actionText, post.likedByMe && styles.activeText]}>{post.likes} {copy.likes}</Text></Pressable>
      <Pressable onPress={onOpen} style={styles.action}><MaterialIcons name="chat-bubble-outline" size={19} color={MUTED} /><Text style={styles.actionText}>{post.comments} {copy.comments}</Text></Pressable>
      <Pressable onPress={onReport} style={styles.action}><MaterialIcons name="flag" size={18} color={MUTED} /><Text style={styles.actionText}>{copy.report}</Text></Pressable>
    </View>
  </View>;
}
const styles = StyleSheet.create({ card: { backgroundColor: "#FFFDF9", borderRadius: 22, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: "#EFE3D6", shadowColor: "#543B2B", shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 2 }, header: { flexDirection: "row", alignItems: "center" }, author: { flex: 1, marginLeft: 10 }, nameRow: { flexDirection: "row", alignItems: "center", gap: 4 }, name: { color: INK, fontWeight: "800", fontSize: 14 }, meta: { color: MUTED, fontSize: 11, marginTop: 3 }, body: { color: INK, fontSize: 15, lineHeight: 23, marginTop: 14 }, location: { flexDirection: "row", alignItems: "center", marginTop: 12, gap: 3 }, locationText: { color: TERRACOTTA, fontSize: 11, fontWeight: "700" }, tags: { flexDirection: "row", flexWrap: "wrap", marginTop: 10, gap: 6 }, tag: { color: "#42706A", fontSize: 12, fontWeight: "700" }, divider: { height: 1, backgroundColor: "#F1E8DE", marginVertical: 13 }, actions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, action: { flexDirection: "row", alignItems: "center", gap: 5 }, actionText: { color: MUTED, fontSize: 11, fontWeight: "600" }, activeText: { color: TERRACOTTA } });
