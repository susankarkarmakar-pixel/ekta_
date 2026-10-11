import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/components/apongram/Avatar";
import { Colors } from "@/constants/theme";
import { ScreenContainer } from "@/components/screen-container";
import { profiles } from "@/lib/apongram/mock-data";
import { useLanguage } from "@/lib/apongram/LanguageContext";

type Activity = {
  id: string;
  who: (typeof profiles)[number];
  text: string;
  time: string;
  icon: "favorite" | "chat-bubble-outline" | "person-add-alt-1";
  unread: boolean;
  route: "/post/[id]" | "/(tabs)/profile";
};

export default function AlertsScreen() {
  const router = useRouter();
  const { language, copy } = useLanguage();
  const bodyFont = language === "bn" ? "HindSiliguri" : "HindSiliguriLatin";
  const mediumFont = language === "bn" ? "HindSiliguriSemiBold" : "HindSiliguriLatinSemiBold";
  const headingFont = language === "bn" ? "NotoSerifBengaliBold" : "Fraunces";
  const rows: Activity[] = language === "bn"
    ? [
      { id: "1", who: profiles[1], text: "আপনার পোস্ট পছন্দ করেছেন", time: "১০ মিনিট আগে", icon: "favorite", unread: true, route: "/post/[id]" },
      { id: "2", who: profiles[2], text: "আপনাকে ফলো করেছেন", time: "১ ঘণ্টা আগে", icon: "person-add-alt-1", unread: true, route: "/(tabs)/profile" },
      { id: "3", who: profiles[3], text: "আপনার পোস্টে মন্তব্য করেছেন", time: "গতকাল", icon: "chat-bubble-outline", unread: false, route: "/post/[id]" },
      { id: "4", who: profiles[4], text: "আপনার রিল পছন্দ করেছেন", time: "গতকাল", icon: "favorite", unread: false, route: "/(tabs)/profile" },
    ]
    : [
      { id: "1", who: profiles[1], text: "liked your post", time: "10 minutes ago", icon: "favorite", unread: true, route: "/post/[id]" },
      { id: "2", who: profiles[2], text: "started following you", time: "1 hour ago", icon: "person-add-alt-1", unread: true, route: "/(tabs)/profile" },
      { id: "3", who: profiles[3], text: "commented on your post", time: "Yesterday", icon: "chat-bubble-outline", unread: false, route: "/post/[id]" },
      { id: "4", who: profiles[4], text: "liked your Reel", time: "Yesterday", icon: "favorite", unread: false, route: "/(tabs)/profile" },
    ];
  const [today, earlier] = [rows.filter((item) => item.unread), rows.filter((item) => !item.unread)];
  const [readAll, setReadAll] = useState(false);

  const renderRow = (item: Activity) => (
    <Pressable
      key={item.id}
      onPress={() => item.route === "/post/[id]" ? router.push({ pathname: "/post/[id]", params: { id: "post-1" } }) : router.push("/(tabs)/profile")}
      style={[styles.row, item.unread && !readAll && styles.unread]}
    >
      <View style={styles.avatarWrap}>
        <Avatar profile={item.who} size={44} />
        <View style={[styles.typeBadge, item.icon === "person-add-alt-1" ? styles.followBadge : item.icon === "chat-bubble-outline" ? styles.commentBadge : styles.likeBadge]}>
          <MaterialIcons name={item.icon} size={11} color="#FFF" />
        </View>
      </View>
      <View style={styles.rowCopy}>
        <Text style={[styles.message, { fontFamily: bodyFont }]}><Text style={[styles.name, { fontFamily: mediumFont }]}>{item.who.name}</Text>{" "}{item.text}</Text>
        <Text style={[styles.time, { fontFamily: bodyFont }]}>{item.time}</Text>
      </View>
      {item.unread && !readAll ? <View style={styles.unreadDot} /> : null}
    </Pressable>
  );

  return (
    <ScreenContainer safeAreaClassName="bg-background" className="bg-background">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.back} accessibilityLabel={language === "bn" ? "ফিরে যান" : "Go back"}>
            <MaterialIcons name="arrow-back" size={22} color="#14213D" />
          </Pressable>
          <Text style={[styles.title, { fontFamily: headingFont }]}>{copy.alerts}</Text>
          <Pressable onPress={() => setReadAll(true)} style={styles.markRead}>
            <Text style={[styles.markReadText, { fontFamily: mediumFont }]}>{language === "bn" ? "সব পড়া হয়েছে" : "Mark all read"}</Text>
          </Pressable>
        </View>
        {today.length ? <><Text style={styles.groupLabel}>{language === "bn" ? "আজ" : "Today"}</Text><View style={styles.list}>{today.map(renderRow)}</View></> : null}
        {earlier.length ? <><Text style={styles.groupLabel}>{language === "bn" ? "আগের" : "Earlier"}</Text><View style={styles.list}>{earlier.map(renderRow)}</View></> : null}
        {!rows.length ? <View style={styles.empty}><View style={styles.emptyIcon}><MaterialIcons name="notifications-none" size={42} color="#B4492A" /></View><Text style={styles.emptyTitle}>{language === "bn" ? "কোনো বিজ্ঞপ্তি নেই" : "No notifications yet"}</Text><Text style={styles.emptyText}>{language === "bn" ? "কেউ আপনার পোস্ট পছন্দ করলে, মন্তব্য করলে বা আপনাকে ফলো করলে এখানে জানতে পারবেন।" : "Likes, comments and new followers will show up here."}</Text><Pressable onPress={() => router.push("/(tabs)/create")} style={styles.emptyButton}><Text style={styles.emptyButtonText}>{copy.create}</Text></Pressable></View> : null}
        <Text style={styles.note}>{language === "bn" ? "নমুনা বিজ্ঞপ্তি। শুরুতে শুধু অ্যাপের ভেতরে দেখা যাবে।" : "Demo notifications are shown only inside the app for now."}</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingBottom: 30 },
  header: { flexDirection: "row", alignItems: "center", height: 64, gap: 4 },
  back: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, color: Colors.light.inkNavy, fontSize: 21, fontWeight: "700" },
  markRead: { minHeight: 44, justifyContent: "center", paddingHorizontal: 4 },
  markReadText: { color: Colors.light.leafGreen, fontSize: 11, fontWeight: "800" },
  groupLabel: { color: Colors.light.slate, fontSize: 12, fontWeight: "700", marginTop: 7, marginBottom: 7 },
  list: { backgroundColor: Colors.light.paper, borderWidth: 1, borderColor: Colors.light.line, borderRadius: 16, overflow: "hidden" },
  row: { minHeight: 72, paddingHorizontal: 14, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderBottomColor: Colors.light.line },
  unread: { backgroundColor: Colors.light.primaryContainer },
  avatarWrap: { position: "relative" },
  typeBadge: { position: "absolute", right: -5, bottom: -4, width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: "#FFFDF8", alignItems: "center", justifyContent: "center" },
  likeBadge: { backgroundColor: "#B4492A" },
  followBadge: { backgroundColor: "#2E6B4A" },
  commentBadge: { backgroundColor: "#14213D" },
  rowCopy: { flex: 1 },
  message: { color: Colors.light.inkNavy, fontSize: 13, lineHeight: 19 },
  name: { fontWeight: "800" },
  time: { color: Colors.light.slate, fontSize: 11, marginTop: 3 },
  unreadDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: Colors.light.terracotta },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 16, paddingVertical: 100, textAlign: "center" },
  emptyIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: Colors.light.primaryContainer, alignItems: "center", justifyContent: "center" },
  emptyTitle: { color: Colors.light.inkNavy, fontSize: 23, fontWeight: "700", marginTop: 24 },
  emptyText: { color: Colors.light.slate, fontSize: 14, lineHeight: 22, textAlign: "center", marginTop: 8 },
  emptyButton: { width: "100%", marginTop: 24, borderRadius: 26, backgroundColor: Colors.light.terracotta, alignItems: "center", paddingVertical: 15 },
  emptyButtonText: { color: Colors.light.ivory, fontSize: 14, fontWeight: "800" },
  note: { color: Colors.light.slate, fontSize: 10, lineHeight: 15, textAlign: "center", marginTop: 16 },
});
