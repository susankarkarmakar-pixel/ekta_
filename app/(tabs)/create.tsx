import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Avatar } from "@/components/apongram/Avatar";
import { ScreenContainer } from "@/components/screen-container";
import { createPost } from "@/lib/apongram/repository";
import { currentUser } from "@/lib/apongram/mock-data";
import { useLanguage } from "@/lib/apongram/LanguageContext";

export default function CreateScreen() {
  const router = useRouter(); const { copy, language } = useLanguage();
  const [body, setBody] = useState(""); const [hasPhoto, setHasPhoto] = useState(false); const [saved, setSaved] = useState(false);
  const submit = async () => { if (!body.trim()) return; await createPost(body.trim(), hasPhoto ? "community-pottery" : undefined); setSaved(true); setTimeout(() => router.replace("/(tabs)"), 450); };
  return <ScreenContainer safeAreaClassName="bg-[#FBF7F0]" className="bg-[#FBF7F0]"><View style={styles.container}>
    <View style={styles.header}><Pressable onPress={() => router.back()} accessibilityLabel={copy.back}><MaterialIcons name="close" size={24} color="#1E1B16" /></Pressable><Text style={styles.title}>{copy.create}</Text><Pressable onPress={submit} disabled={!body.trim()} style={[styles.postButton, !body.trim() && styles.disabled]}><Text style={styles.postButtonText}>{copy.save}</Text></Pressable></View>
    <View style={styles.author}><Avatar profile={currentUser} size={42} /><View><Text style={styles.name}>{currentUser.name}</Text><Text style={styles.meta}>{language === "bn" ? "ভারত · সবার জন্য" : "India · public community"}</Text></View></View>
    <TextInput multiline value={body} onChangeText={setBody} placeholder={copy.postPlaceholder} placeholderTextColor="#9A9080" style={styles.editor} maxLength={280} textAlignVertical="top" />
    <View style={styles.counter}><Text style={styles.note}>{copy.publicNote}</Text><Text style={styles.count}>{body.length}/280</Text></View>
    <Pressable onPress={() => setHasPhoto((value) => !value)} style={styles.photoButton}><MaterialIcons name={hasPhoto ? "check-circle" : "add-a-photo"} size={22} color="#C85A3A" /><Text style={styles.photoText}>{hasPhoto ? copy.removePhoto : copy.addPhoto}</Text><Text style={styles.photoLimit}>{hasPhoto ? "1 / 1" : "1 max"}</Text></Pressable>
    {saved && <View style={styles.success}><MaterialIcons name="check-circle" size={20} color="#1F6F6B" /><Text style={styles.successText}>{copy.share} ✓</Text></View>}
  </View></ScreenContainer>;
}
const styles = StyleSheet.create({ container: { flex: 1, paddingHorizontal: 18 }, header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 15, paddingBottom: 26 }, title: { color: "#1E1B16", fontSize: 18, fontFamily: "Georgia", fontWeight: "700" }, postButton: { backgroundColor: "#C85A3A", borderRadius: 999, paddingHorizontal: 16, paddingVertical: 9 }, disabled: { opacity: 0.42 }, postButtonText: { color: "#FFF", fontSize: 12, fontWeight: "800" }, author: { flexDirection: "row", alignItems: "center", gap: 10 }, name: { color: "#1E1B16", fontWeight: "800", fontSize: 14 }, meta: { color: "#6B6153", fontSize: 11, marginTop: 3 }, editor: { color: "#1E1B16", fontSize: 17, lineHeight: 27, minHeight: 220, paddingTop: 22 }, counter: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#E3DACB", paddingTop: 13 }, note: { color: "#6B6153", fontSize: 11, flex: 1, lineHeight: 16 }, count: { color: "#9A9080", fontSize: 11 }, photoButton: { marginTop: 24, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E3DACB", borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center", gap: 9 }, photoText: { color: "#C85A3A", fontSize: 13, fontWeight: "800", flex: 1 }, photoLimit: { color: "#9A9080", fontSize: 11 }, success: { backgroundColor: "#E3EEEA", padding: 14, borderRadius: 14, flexDirection: "row", gap: 8, marginTop: 18 }, successText: { color: "#1F6F6B", fontWeight: "800" } });
