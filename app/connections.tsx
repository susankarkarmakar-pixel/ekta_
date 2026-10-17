import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/components/apongram/Avatar";
import { ScreenContainer } from "@/components/screen-container";
import { Colors } from "@/constants/theme";
import { currentUser, profiles } from "@/lib/apongram/mock-data";
import { getRelationship, setRelationship, type Relationship } from "@/lib/apongram/follows";
import { useLanguage } from "@/lib/apongram/LanguageContext";
import type { Profile } from "@/lib/apongram/types";

const C = Colors.light;
type ListTab = "followers" | "following";
const demoConnections: Record<string, Record<ListTab, string[]>> = {
  me: { followers: ["p-1", "p-2", "p-3"], following: ["p-1", "p-2"] },
  "p-1": { followers: ["me", "p-2", "p-3"], following: ["me", "p-4"] },
  "p-2": { followers: ["me", "p-1"], following: ["p-3", "p-4"] },
  "p-3": { followers: ["me", "p-4"], following: ["p-1", "p-2"] },
  "p-4": { followers: ["p-2", "p-3"], following: ["me", "p-1"] },
};

export default function ConnectionsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; tab?: string }>();
  const profileId = typeof params.id === "string" ? params.id : currentUser.id;
  const [tab, setTab] = useState<ListTab>(params.tab === "following" ? "following" : "followers");
  const [relationships, setRelationships] = useState<Record<string, Relationship>>({});
  const { language } = useLanguage();
  const bodyFont = language === "bn" ? "HindSiliguri" : "HindSiliguriLatin";
  const mediumFont = language === "bn" ? "HindSiliguriSemiBold" : "HindSiliguriLatinSemiBold";
  const headingFont = language === "bn" ? "NotoSerifBengaliBold" : "Fraunces";
  const owner = profiles.find((item) => item.id === profileId) ?? currentUser;
  const ids = useMemo(() => demoConnections[profileId]?.[tab] ?? [], [profileId, tab]);
  const list = useMemo(() => ids.map((id) => profiles.find((item) => item.id === id)).filter((item): item is Profile => Boolean(item)), [ids]);

  useFocusEffect(useCallback(() => {
    let active = true;
    void Promise.all(list.map(async (person) => [person.id, await getRelationship(person.id)] as const)).then((saved) => {
      if (active) setRelationships(Object.fromEntries(saved));
    });
    return () => { active = false; };
  }, [list]));

  const updateFollow = async (person: Profile) => {
    const current = relationships[person.id] ?? "none";
    const next: Relationship = current === "following" ? "none" : "following";
    setRelationships((items) => ({ ...items, [person.id]: next }));
    await setRelationship(person.id, next);
  };

  return <ScreenContainer safeAreaClassName="bg-background" className="bg-background"><ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}><View style={styles.header}><Pressable onPress={() => router.back()} style={styles.back} accessibilityLabel={language === "bn" ? "ফিরে যান" : "Go back"}><MaterialIcons name="arrow-back" size={22} color={C.inkNavy} /></Pressable><View style={styles.heading}><Text style={[styles.kicker, { fontFamily: mediumFont }]}>@{owner.handle}</Text><Text style={[styles.title, { fontFamily: headingFont }]}>{language === "bn" ? "সংযোগ" : "Connections"}</Text></View></View><View style={styles.tabs}><Pressable onPress={() => setTab("followers")} style={[styles.tab, tab === "followers" && styles.activeTab]}><Text style={[styles.tabText, { fontFamily: mediumFont }, tab === "followers" && styles.activeTabText]}>{language === "bn" ? "ফলোয়ার" : "Followers"}</Text></Pressable><Pressable onPress={() => setTab("following")} style={[styles.tab, tab === "following" && styles.activeTab]}><Text style={[styles.tabText, { fontFamily: mediumFont }, tab === "following" && styles.activeTabText]}>{language === "bn" ? "ফলোইং" : "Following"}</Text></Pressable></View><Text style={[styles.summary, { fontFamily: bodyFont }]}>{list.length} {tab === "followers" ? (language === "bn" ? "জন ফলোয়ার" : "followers") : (language === "bn" ? "জনকে ফলো করছেন" : "following")}</Text>{list.map((person) => { const following = relationships[person.id] === "following"; return <View key={person.id} style={styles.person}><Pressable onPress={() => router.push({ pathname: "/(tabs)/profile", params: { id: person.id } })} style={styles.personMain}><Avatar profile={person} size={48} /><View style={styles.personCopy}><Text style={[styles.name, { fontFamily: mediumFont }]}>{person.name}</Text><Text style={[styles.handle, { fontFamily: bodyFont }]}>@{person.handle} · {person.region}</Text></View></Pressable>{person.id !== currentUser.id ? <Pressable onPress={() => void updateFollow(person)} style={[styles.action, following && styles.actionFollowing]} accessibilityRole="button" accessibilityState={{ selected: following }}><MaterialIcons name={following ? "check" : "person-add"} size={15} color={following ? C.leafGreen : C.terracotta} /><Text style={[styles.actionText, { fontFamily: mediumFont }, following && styles.actionFollowingText]}>{following ? (language === "bn" ? "ফলো করছেন" : "Following") : (language === "bn" ? "ফলো" : "Follow")}</Text></Pressable> : null}</View>; })}{!list.length ? <View style={styles.empty}><MaterialIcons name="people-outline" size={32} color={C.terracotta} /><Text style={[styles.emptyTitle, { fontFamily: headingFont }]}>{language === "bn" ? "এখনও কোনো তালিকা নেই" : "No connections yet"}</Text><Text style={[styles.emptyText, { fontFamily: bodyFont }]}>{language === "bn" ? "Follow করলে আপনার community connections এখানে দেখা যাবে।" : "Your community connections will appear here as you follow people."}</Text></View> : null}</ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ container: { paddingHorizontal: 16, paddingBottom: 32 }, header: { height: 78, flexDirection: "row", alignItems: "center", gap: 8 }, back: { width: 44, height: 44, alignItems: "center", justifyContent: "center" }, heading: { flex: 1 }, kicker: { color: C.slate, fontSize: 11 }, title: { color: C.inkNavy, fontSize: 25, marginTop: 1 }, tabs: { flexDirection: "row", backgroundColor: C.paper, borderRadius: 16, padding: 4, borderWidth: 1, borderColor: C.line }, tab: { flex: 1, minHeight: 42, alignItems: "center", justifyContent: "center", borderRadius: 12 }, activeTab: { backgroundColor: C.primaryContainer }, tabText: { color: C.slate, fontSize: 12 }, activeTabText: { color: C.terracotta, fontWeight: "800" }, summary: { color: C.slate, fontSize: 12, marginTop: 20, marginBottom: 9 }, person: { backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, borderRadius: 18, padding: 12, marginBottom: 9, flexDirection: "row", alignItems: "center", gap: 10 }, personMain: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 }, personCopy: { flex: 1 }, name: { color: C.inkNavy, fontSize: 14 }, handle: { color: C.slate, fontSize: 11, marginTop: 3 }, action: { minHeight: 40, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, borderWidth: 1, borderColor: C.terracotta, borderRadius: 999, paddingHorizontal: 12 }, actionFollowing: { backgroundColor: "#E4EFE5", borderColor: "#9CC1A3" }, actionText: { color: C.terracotta, fontSize: 11, fontWeight: "800" }, actionFollowingText: { color: C.leafGreen }, empty: { alignItems: "center", paddingVertical: 90, paddingHorizontal: 28 }, emptyTitle: { color: C.inkNavy, fontSize: 21, marginTop: 15 }, emptyText: { color: C.slate, fontSize: 13, lineHeight: 20, textAlign: "center", marginTop: 7 }, });
