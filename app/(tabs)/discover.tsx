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

const TRENDING_TOPICS = [
  { tag: "#CommunityUpdates", count: "2.4K", color: "#DDEBDD" },
  { tag: "#PublicService", count: "1.8K", color: "#FFE7B8" },
  { tag: "#LocalMarket", count: "1.2K", color: "#FFDAD1" },
  { tag: "#Volunteering", count: "980", color: "#E6E0F2" },
];

export default function DiscoverScreen() {
  const router = useRouter(); const params = useLocalSearchParams<{ q?: string }>(); const { copy, language } = useLanguage();
  const [query, setQuery] = useState(typeof params.q === "string" ? params.q : ""); const [people, setPeople] = useState<Profile[]>([]); const [results, setResults] = useState<Post[]>([]); const [topicResults, setTopicResults] = useState<string[]>(topics); const [following, setFollowing] = useState<Record<string, boolean>>({});
  useEffect(() => { searchCommunity(query).then((data) => { setPeople(data.people); setResults(data.posts); setTopicResults(data.topics); }); }, [query]);
  const toggleLike = (id: string) => setResults((items) => items.map((post) => post.id === id ? { ...post, likedByMe: !post.likedByMe, likes: post.likes + (post.likedByMe ? -1 : 1) } : post));
  return <ScreenContainer safeAreaClassName="bg-background" className="bg-background"><ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
    <View style={styles.heading}><View style={discoverStyles.headingCopy}><Text style={styles.kicker}>DISCOVER · {language === "bn" ? "খোঁজ" : "EXPLORE"}</Text><Text style={styles.title}>{copy.discover}</Text><Text style={discoverStyles.intro}>{copy.exploreIntro}</Text></View><Pressable onPress={() => router.push("/create")} style={styles.create}><MaterialIcons name="edit" size={16} color="#FFF" /><Text style={styles.createText}>{copy.create}</Text></Pressable></View>
    <View style={styles.search}><MaterialIcons name="search" size={21} color="#6B6153" /><TextInput value={query} onChangeText={setQuery} placeholder={copy.searchPlaceholder} placeholderTextColor="#9A9080" style={styles.input} returnKeyType="search" />{query ? <Pressable onPress={() => setQuery("")} style={discoverStyles.clearSearch} accessibilityRole="button" accessibilityLabel={copy.clearSearch}><MaterialIcons name="close" size={18} color="#6B6153" /></Pressable> : null}</View>
    {!query ? <View><View style={discoverStyles.sectionHeading}><Text style={styles.section}>{copy.trendingNow}</Text><View style={discoverStyles.liveBadge}><View style={discoverStyles.liveDot} /><Text style={discoverStyles.liveText}>{language === "bn" ? "এখন" : "NOW"}</Text></View></View><View style={discoverStyles.trendingGrid}>{TRENDING_TOPICS.map((item, index) => <Pressable key={item.tag} onPress={() => setQuery(item.tag)} style={[discoverStyles.trendingCard, { backgroundColor: item.color }]} accessibilityRole="button" accessibilityLabel={`${item.tag} ${item.count}`}><Text style={discoverStyles.rank}>0{index + 1}</Text><Text style={discoverStyles.trendingTag}>{item.tag}</Text><Text style={discoverStyles.trendingCount}>{item.count} {language === "bn" ? "পোস্ট" : "posts"}</Text><MaterialIcons name="arrow-outward" size={17} color="#211A18" style={discoverStyles.trendingArrow} /></Pressable>)}</View></View> : <View><Text style={styles.section}>{copy.topics}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>{topicResults.map((topic) => <Pressable key={topic} onPress={() => setQuery(topic)} style={styles.topic}><Text style={styles.topicText}>{topic}</Text></Pressable>)}</ScrollView></View>}
    <Text style={styles.section}>{copy.people}</Text>{people.length ? people.map((person) => <View key={person.id} style={styles.person}><Avatar profile={person} size={44} /><View style={{ flex: 1, marginLeft: 10 }}><View style={styles.personNameRow}><Text style={styles.personName}>{person.name}</Text><View style={styles.sampleBadge}><View style={styles.sampleDot} /><Text style={styles.sampleText}>{copy.demoLabel}</Text></View></View><Text style={styles.personMeta}>@{person.handle} · {person.region}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={`${copy.follow} ${person.name}`} onPress={() => setFollowing((map) => ({ ...map, [person.id]: !map[person.id] }))} style={[styles.follow, following[person.id] && styles.following]}><Text style={[styles.followText, following[person.id] && styles.followingText]}>{following[person.id] ? copy.followingAction : copy.follow}</Text></Pressable></View>) : <Text style={styles.empty}>{copy.noResults}</Text>}
    <Text style={styles.section}>{copy.posts}</Text>{results.length ? results.map((post) => <PostCard key={post.id} post={post} copy={copy} onOpen={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })} onLike={() => toggleLike(post.id)} onReport={() => router.push({ pathname: "/report", params: { postId: post.id } })} />) : <Text style={styles.empty}>{copy.noResults}</Text>}
  </ScrollView></ScreenContainer>;
}
  const styles = StyleSheet.create({ container: { paddingHorizontal: 18, paddingBottom: 30 }, heading: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingTop: 14, paddingBottom: 19 }, kicker: { color: "#B5482F", fontSize: 10, fontWeight: "800", letterSpacing: 1.2 }, title: { color: "#211A18", fontFamily: "Georgia", fontSize: 30, fontWeight: "700", marginTop: 3 }, create: { flexDirection: "row", gap: 5, alignItems: "center", backgroundColor: "#B5482F", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 11, shadowColor: "#6E5148", shadowOpacity: 0.16, shadowRadius: 7, shadowOffset: { width: 0, height: 3 }, elevation: 2 }, createText: { color: "#FFFFFF", fontWeight: "800", fontSize: 12 }, search: { backgroundColor: "#FFFBFF", borderWidth: 1, borderColor: "#D8C5BF", borderRadius: 18, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 8, height: 54, shadowColor: "#6E5148", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 1 }, input: { flex: 1, color: "#211A18", fontSize: 14 }, section: { color: "#211A18", fontFamily: "Georgia", fontSize: 17, fontWeight: "700", marginTop: 24, marginBottom: 11 }, topic: { backgroundColor: "#FFDAD1", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, marginRight: 8 }, topicText: { color: "#8B2F1C", fontSize: 12, fontWeight: "800" }, person: { backgroundColor: "#FFFBFF", borderWidth: 1, borderColor: "#D8C5BF", borderRadius: 18, padding: 13, flexDirection: "row", alignItems: "center", marginBottom: 9, shadowColor: "#6E5148", shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 }, personNameRow: { flexDirection: "row", alignItems: "center", gap: 6 }, personName: { color: "#211A18", fontSize: 14, fontWeight: "800" }, sampleBadge: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "#DDEBDD", borderRadius: 8, paddingHorizontal: 5, paddingVertical: 3 }, sampleDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#2E6B4A" }, sampleText: { color: "#1F4D35", fontSize: 8, fontWeight: "800" }, personMeta: { color: "#786E69", fontSize: 11, marginTop: 3 }, follow: { minHeight: 40, borderWidth: 1, borderColor: "#B5482F", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9, justifyContent: "center" }, followText: { color: "#B5482F", fontSize: 11, fontWeight: "800" }, following: { backgroundColor: "#FFDAD1" }, followingText: { color: "#8B2F1C" }, empty: { color: "#786E69", paddingVertical: 12, fontSize: 13 } });

const discoverStyles = StyleSheet.create({
  headingCopy: { flex: 1, marginRight: 10 },
  intro: { color: "#786E69", fontSize: 12, lineHeight: 18, marginTop: 5, maxWidth: 250 },
  clearSearch: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2 },
  liveBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#EAF3EA", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#2E6B4A" },
  liveText: { color: "#1F4D35", fontSize: 9, fontWeight: "900", letterSpacing: 0.7 },
  trendingGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9, marginBottom: 2 },
  trendingCard: { width: "48.5%", minHeight: 126, borderRadius: 18, padding: 13, position: "relative", overflow: "hidden" },
  rank: { color: "rgba(33,26,24,0.48)", fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  trendingTag: { color: "#211A18", fontSize: 14, lineHeight: 19, fontWeight: "900", marginTop: 17, paddingRight: 9 },
  trendingCount: { color: "#5E514B", fontSize: 10, fontWeight: "700", marginTop: 7 },
  trendingArrow: { position: "absolute", right: 12, bottom: 12 },
});
