import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/components/apongram/Avatar";
import { ScreenContainer } from "@/components/screen-container";
import { profiles } from "@/lib/apongram/mock-data";
import { useLanguage } from "@/lib/apongram/LanguageContext";

export default function AlertsScreen() {
  const router = useRouter(); const { language, copy } = useLanguage();
  const rows = language === "bn" ? [
    { id: "1", who: profiles[1], text: "আপনার পোস্টে লাইক দিয়েছেন", time: "১২ মিনিট আগে", icon: "favorite" as const, unread: true },
    { id: "2", who: profiles[2], text: "আপনার আলোচনায় মন্তব্য করেছেন", time: "১ ঘণ্টা আগে", icon: "chat-bubble-outline" as const, unread: true },
    { id: "3", who: profiles[3], text: "আপনাকে ফলো করা শুরু করেছেন", time: "৩ ঘণ্টা আগে", icon: "person-add-alt-1" as const, unread: false },
    { id: "4", who: profiles[4], text: "আপনার পোস্টে লাইক দিয়েছেন", time: "গতকাল", icon: "favorite" as const, unread: false },
  ] : [
    { id: "1", who: profiles[1], text: "liked your community update", time: "12 minutes ago", icon: "favorite" as const, unread: true },
    { id: "2", who: profiles[2], text: "commented on your discussion", time: "1 hour ago", icon: "chat-bubble-outline" as const, unread: true },
    { id: "3", who: profiles[3], text: "started following you", time: "3 hours ago", icon: "person-add-alt-1" as const, unread: false },
    { id: "4", who: profiles[4], text: "liked your post", time: "Yesterday", icon: "favorite" as const, unread: false },
  ];
  return <ScreenContainer safeAreaClassName="bg-background" className="bg-background"><ScrollView contentContainerStyle={styles.container}>
    <View style={styles.header}><View><Text style={styles.kicker}>COMMUNITY · ACTIVITY</Text><Text style={styles.title}>{copy.alerts}</Text></View><Pressable onPress={() => router.push("/settings")} accessibilityLabel={language === "bn" ? "সেটিংস" : "Settings"}><MaterialIcons name="settings" size={23} color="#1E1B16" /></Pressable></View>
    <View style={styles.pulse}><View style={styles.pulseIcon}><MaterialIcons name="volunteer-activism" size={21} color="#C85A3A" /></View><View style={{ flex: 1 }}><Text style={styles.pulseTitle}>{copy.communityPulse}</Text><Text style={styles.pulseText}>{copy.pulseText}</Text></View><View style={styles.live}><View style={styles.dot} /><Text style={styles.liveText}>LIVE</Text></View></View>
    <Text style={styles.section}>{language === "bn" ? "সাম্প্রতিক কার্যকলাপ" : "Recent activity"}</Text>
    <View style={styles.list}>{rows.map((item) => <View key={item.id} style={[styles.row, item.unread && styles.unread]}><Avatar profile={item.who} size={43} /><View style={styles.rowText}><Text style={styles.message}><Text style={styles.name}>{item.who.name}</Text> {item.text}</Text><Text style={styles.time}>{item.time}</Text></View><MaterialIcons name={item.icon} size={18} color={item.icon === "favorite" ? "#C85A3A" : "#6B6153"} /></View>)}</View>
  </ScrollView></ScreenContainer>;
}
const styles = StyleSheet.create({ container: { paddingHorizontal: 18, paddingBottom: 30 }, header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingTop: 15, paddingBottom: 22 }, kicker: { color: "#B5482F", fontSize: 10, fontWeight: "800", letterSpacing: 1.2 }, title: { color: "#211A18", fontFamily: "Georgia", fontSize: 29, fontWeight: "700", marginTop: 3 }, pulse: { backgroundColor: "#FFFBFF", borderWidth: 1, borderColor: "#D8C5BF", borderRadius: 20, padding: 15, flexDirection: "row", alignItems: "center", gap: 10, shadowColor: "#6E5148", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 1 }, pulseIcon: { backgroundColor: "#FFDAD1", width: 44, height: 44, borderRadius: 15, alignItems: "center", justifyContent: "center" }, pulseTitle: { color: "#211A18", fontWeight: "800", fontSize: 13 }, pulseText: { color: "#786E69", lineHeight: 17, fontSize: 11, marginTop: 3 }, live: { alignSelf: "flex-start", flexDirection: "row", gap: 4, alignItems: "center" }, dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#2F6B63" }, liveText: { color: "#2F6B63", fontSize: 9, fontWeight: "900" }, section: { color: "#211A18", fontFamily: "Georgia", fontSize: 18, fontWeight: "700", marginTop: 24, marginBottom: 11 }, list: { backgroundColor: "#FFFBFF", borderWidth: 1, borderColor: "#D8C5BF", borderRadius: 20, overflow: "hidden", shadowColor: "#6E5148", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 1 }, row: { flexDirection: "row", alignItems: "center", gap: 11, padding: 14, minHeight: 76, borderBottomWidth: 1, borderBottomColor: "#E8DAD5" }, unread: { backgroundColor: "#FFF4F0", borderLeftWidth: 4, borderLeftColor: "#B5482F" }, rowText: { flex: 1 }, message: { color: "#211A18", fontSize: 12, lineHeight: 18 }, name: { fontWeight: "800" }, time: { color: "#786E69", fontSize: 10, marginTop: 4 } });
