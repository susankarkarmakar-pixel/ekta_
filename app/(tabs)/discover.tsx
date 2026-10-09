import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Avatar } from "@/components/apongram/Avatar";
import { PostCard } from "@/components/apongram/PostCard";
import { ScreenContainer } from "@/components/screen-container";
import { searchCommunity } from "@/lib/apongram/repository";
import { topics } from "@/lib/apongram/mock-data";
import { useLanguage } from "@/lib/apongram/LanguageContext";
import type { Post, Profile } from "@/lib/apongram/types";

export default function DiscoverScreen() {
  const router = useRouter(); const params = useLocalSearchParams<{ q?: string }>(); const { copy } = useLanguage();
  const [query, setQuery] = useState(typeof params.q === "string" ? params.q : ""); const [people, setPeople] = useState<Profile[]>([]); const [results, setResults] = useState<Post[]>([]); const [topicResults, setTopicResults] = useState<string[]>(topics);
  useEffect(() => { searchCommunity(query).then((data) => { setPeople(data.people); setResults(data.posts); setTopicResults(data.topics); }); }, [query]);
  return <ScreenContainer safeAreaClassName="bg-[#F7F1E8]" className="bg-[#F7F1E8]"><ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
    <View style={styles.heading}><View><Text style={styles.kicker}>DISCOVER · খোঁজ</Text><Text style={styles.title}>{copy.discover}</Text></View><Pressable onPress={() => router.push("/create")} style={styles.create}><MaterialIcons name="edit" size={17} color="#FFF" /><Text style={styles.createText}>{copy.create}</Text></Pressable></View>
    <View style={styles.search}><MaterialIcons name="search" size={21} color="#7C817F" /><TextInput value={query} onChangeText={setQuery} placeholder={copy.searchPlaceholder} placeholderTextColor="#A5A7A3" style={styles.input} returnKeyType="search" /></View>
    <Text style={styles.section}>{copy.topics}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>{topicResults.map((topic) => <Pressable key={topic} onPress={() => setQuery(topic)} style={styles.topic}><Text style={styles.topicText}>{topic}</Text></Pressable>)}</ScrollView>
    <Text style={styles.section}>{copy.people}</Text>{people.length ? people.map((person) => <View key={person.id} style={styles.person}><Avatar profile={person} size={44} /><View style={{ flex: 1, marginLeft: 10 }}><Text style={styles.personName}>{person.name}</Text><Text style={styles.personMeta}>@{person.handle} · {person.region}</Text></View><Pressable style={styles.follow}><Text style={styles.followText}>{copy.follow}</Text></Pressable></View>) : <Text style={styles.empty}>{copy.noResults}</Text>}
    <Text style={styles.section}>{copy.posts}</Text>{results.length ? results.map((post) => <PostCard key={post.id} post={post} copy={copy} onOpen={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })} onLike={() => undefined} onReport={() => undefined} />) : <Text style={styles.empty}>{copy.noResults}</Text>}
  </ScrollView></ScreenContainer>;
}
const styles = StyleSheet.create({ container: { paddingHorizontal: 18, paddingBottom: 30 }, heading: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingTop: 14, paddingBottom: 19 }, kicker: { color: "#C85C3A", fontSize: 10, fontWeight: "900", letterSpacing: 1.4 }, title: { color: "#172A35", fontSize: 30, fontWeight: "900", marginTop: 3 }, create: { flexDirection: "row", gap: 5, alignItems: "center", backgroundColor: "#C85C3A", borderRadius: 17, paddingHorizontal: 12, paddingVertical: 9 }, createText: { color: "#FFF", fontWeight: "800", fontSize: 12 }, search: { backgroundColor: "#FFFDF9", borderWidth: 1, borderColor: "#EFE3D6", borderRadius: 17, paddingHorizontal: 13, flexDirection: "row", alignItems: "center", gap: 8, height: 50 }, input: { flex: 1, color: "#172A35", fontSize: 14 }, section: { color: "#172A35", fontSize: 15, fontWeight: "900", marginTop: 23, marginBottom: 11 }, topic: { backgroundColor: "#F2E6D6", borderRadius: 17, paddingHorizontal: 13, paddingVertical: 9, marginRight: 8 }, topicText: { color: "#80553C", fontSize: 12, fontWeight: "800" }, person: { backgroundColor: "#FFFDF9", borderWidth: 1, borderColor: "#EFE3D6", borderRadius: 18, padding: 11, flexDirection: "row", alignItems: "center", marginBottom: 8 }, personName: { color: "#172A35", fontSize: 14, fontWeight: "800" }, personMeta: { color: "#7C817F", fontSize: 11, marginTop: 3 }, follow: { borderWidth: 1, borderColor: "#C85C3A", borderRadius: 14, paddingHorizontal: 10, paddingVertical: 7 }, followText: { color: "#C85C3A", fontSize: 11, fontWeight: "800" }, empty: { color: "#7C817F", paddingVertical: 12, fontSize: 13 } });
