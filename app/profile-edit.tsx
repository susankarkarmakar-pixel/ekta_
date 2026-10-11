import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Avatar } from "@/components/apongram/Avatar";
import { ScreenContainer } from "@/components/screen-container";
import { Colors } from "@/constants/theme";
import { getStoredProfile, saveStoredProfile, syncProfileToSupabase } from "@/lib/apongram/profile-store";
import { supabaseConfig } from "@/lib/apongram/supabase";
import { useLanguage } from "@/lib/apongram/LanguageContext";
import type { Profile } from "@/lib/apongram/types";

const C = Colors.light;

export default function ProfileEditScreen() {
  const router = useRouter();
  const { copy, language } = useLanguage();
  const [profile, setProfile] = useState<Profile>();
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const [region, setRegion] = useState("");
  const [saving, setSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "local" | "failed">("idle");

  useEffect(() => {
    getStoredProfile().then((value) => {
      setProfile(value);
      setName(value.name);
      setHandle(value.handle);
      setBio(value.bio);
      setRegion(value.region);
    });
  }, []);

  const chooseAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.85 });
    if (!result.canceled && result.assets[0] && profile) {
      const avatarUrl = result.assets[0].uri;
      setProfile({ ...profile, avatarUrl });
    }
  };

  const save = async () => {
    if (!profile || !name.trim() || !handle.trim()) return;
    setSaving(true);
    setSyncStatus("syncing");
    try {
      const saved = await saveStoredProfile({ ...profile, name: name.trim(), handle: handle.trim().replace(/^@/, ""), bio: bio.trim(), region: region.trim() || profile.region });
      const syncResult = await syncProfileToSupabase(saved);
      setProfile(syncResult.profile);
      setSyncStatus(syncResult.synced ? "synced" : supabaseConfig.isConfigured ? "failed" : "local");
    } catch {
      setSyncStatus("failed");
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <ScreenContainer className="bg-background"><View style={styles.loading}><Text style={styles.muted}>{copy.loadingReels}</Text></View></ScreenContainer>;
  const formFont = language === "bn" ? "HindSiliguri" : "HindSiliguriLatin";
  const labelFont = language === "bn" ? "HindSiliguriSemiBold" : "HindSiliguriLatinSemiBold";
  return <ScreenContainer safeAreaClassName="bg-background" className="bg-background"><View style={styles.container}>
    <View style={styles.header}><Pressable onPress={() => router.back()} accessibilityLabel={copy.back}><MaterialIcons name="arrow-back" size={23} color={C.inkNavy} /></Pressable><Text style={[styles.title, { fontFamily: labelFont }]}>{copy.editProfile}</Text><Pressable onPress={() => void save()} disabled={saving || !name.trim() || !handle.trim()} accessibilityRole="button" accessibilityLabel={copy.profileSave}><Text style={[styles.save, { fontFamily: labelFont }, (saving || !name.trim() || !handle.trim()) && styles.disabled]}>{saving ? "…" : copy.profileSave}</Text></Pressable></View>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {syncStatus !== "idle" ? <Text style={[styles.syncStatus, { fontFamily: formFont }, syncStatus === "synced" && styles.syncSuccess, (syncStatus === "failed" || syncStatus === "local") && styles.syncWarning]}>{syncStatus === "syncing" ? copy.profileSyncing : syncStatus === "synced" ? copy.profileSynced : syncStatus === "local" ? copy.profileSavedLocally : copy.profileSyncFailed}</Text> : null}
      <Pressable onPress={() => void chooseAvatar()} style={styles.avatarPicker} accessibilityRole="button" accessibilityLabel={copy.chooseAvatar}><Avatar profile={profile} size={94} /><View style={styles.camera}><MaterialIcons name="photo-camera" size={17} color={C.ivory} /></View><Text style={[styles.changePhoto, { fontFamily: labelFont }]}>{copy.chooseAvatar}</Text></Pressable>
      <Field label={copy.profileNameLabel} value={name} onChangeText={setName} fontFamily={formFont} />
      <Field label={copy.profileHandleLabel} value={handle} onChangeText={setHandle} fontFamily={formFont} autoCapitalize="none" prefix="@" />
      <Field label={copy.profileBioLabel} value={bio} onChangeText={setBio} fontFamily={formFont} multiline />
      <Field label={copy.profileRegionLabel} value={region} onChangeText={setRegion} fontFamily={formFont} />
    </ScrollView>
  </View></ScreenContainer>;
}

function Field({ label, value, onChangeText, fontFamily, multiline = false, autoCapitalize = "sentences", prefix }: { label: string; value: string; onChangeText: (value: string) => void; fontFamily: string; multiline?: boolean; autoCapitalize?: "none" | "sentences"; prefix?: string }) {
  return <View style={styles.field}><Text style={[styles.label, { fontFamily }]}>{label}</Text><View style={styles.inputWrap}>{prefix ? <Text style={[styles.prefix, { fontFamily }]}>{prefix}</Text> : null}<TextInput value={value} onChangeText={onChangeText} style={[styles.input, { fontFamily }, multiline && styles.multiline]} multiline={multiline} autoCapitalize={autoCapitalize} placeholderTextColor={C.slate} /></View></View>;
}

const styles = StyleSheet.create({ container: { flex: 1, paddingHorizontal: 18 }, header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 13, paddingBottom: 14 }, title: { color: C.inkNavy, fontSize: 18 }, save: { color: C.terracotta, fontSize: 13, fontWeight: "800" }, disabled: { opacity: 0.4 }, content: { paddingBottom: 30 }, loading: { flex: 1, alignItems: "center", justifyContent: "center" }, muted: { color: C.slate }, syncStatus: { backgroundColor: C.primaryContainer, borderRadius: 12, padding: 11, color: C.slate, fontSize: 11, marginBottom: 13 }, syncSuccess: { color: C.leafGreen }, syncWarning: { color: C.terracotta }, avatarPicker: { alignItems: "center", marginBottom: 25 }, camera: { width: 31, height: 31, borderRadius: 16, backgroundColor: C.terracotta, alignItems: "center", justifyContent: "center", marginTop: -27, marginLeft: 63, borderWidth: 3, borderColor: C.ivory }, changePhoto: { color: C.terracotta, fontSize: 12, marginTop: 10 }, field: { marginBottom: 17 }, label: { color: C.inkNavy, fontSize: 12, fontWeight: "800", marginBottom: 7 }, inputWrap: { minHeight: 50, flexDirection: "row", alignItems: "center", backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, borderRadius: 14, paddingHorizontal: 14 }, prefix: { color: C.slate, fontSize: 15 }, input: { flex: 1, color: C.inkNavy, fontSize: 14, minHeight: 48 }, multiline: { minHeight: 88, paddingTop: 13, textAlignVertical: "top" } });
