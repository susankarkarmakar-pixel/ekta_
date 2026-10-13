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
const BIO_LIMIT = 160;

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
  const [validationError, setValidationError] = useState("");

  const bn = language === "bn";
  const formFont = bn ? "HindSiliguri" : "HindSiliguriLatin";
  const labelFont = bn ? "HindSiliguriSemiBold" : "HindSiliguriLatinSemiBold";
  const isValid = Boolean(name.trim() && handle.trim());

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
    if (!result.canceled && result.assets[0] && profile) setProfile({ ...profile, avatarUrl: result.assets[0].uri });
  };

  const save = async () => {
    if (!profile) return;
    if (!name.trim() || !handle.trim()) {
      setValidationError(bn ? "নাম ও ইউজারনেম পূরণ করুন।" : "Add a name and username to continue.");
      return;
    }
    setValidationError("");
    setSaving(true);
    setSyncStatus("syncing");
    try {
      const saved = await saveStoredProfile({ ...profile, name: name.trim(), handle: handle.trim().replace(/^@/, ""), bio: bio.trim().slice(0, BIO_LIMIT), region: region.trim() || profile.region });
      const syncResult = await syncProfileToSupabase(saved);
      setProfile(syncResult.profile);
      setSyncStatus(syncResult.synced ? "synced" : supabaseConfig.isConfigured ? "failed" : "local");
    } catch {
      setSyncStatus("failed");
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <ScreenContainer className="bg-background"><View style={styles.loading}><View style={styles.loadingDot}><MaterialIcons name="person" size={22} color={C.terracotta} /></View><Text style={[styles.muted, { fontFamily: formFont }]}>{bn ? "প্রোফাইল প্রস্তুত হচ্ছে…" : "Preparing your profile…"}</Text></View></ScreenContainer>;

  return <ScreenContainer safeAreaClassName="bg-background" className="bg-background"><View style={styles.container}>
    <View style={styles.header}>
      <Pressable onPress={() => router.back()} style={styles.iconButton} accessibilityRole="button" accessibilityLabel={copy.back}><MaterialIcons name="arrow-back" size={22} color={C.inkNavy} /></Pressable>
      <Text style={[styles.title, { fontFamily: labelFont }]}>{copy.editProfile}</Text>
      <Pressable onPress={() => void save()} disabled={saving || !isValid} style={[styles.saveButton, (!isValid || saving) && styles.saveButtonDisabled]} accessibilityRole="button" accessibilityLabel={copy.profileSave}>
        <Text style={[styles.save, { fontFamily: labelFont }]}>{saving ? "…" : copy.profileSave}</Text>
      </Pressable>
    </View>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={[styles.intro, { fontFamily: formFont }]}>{bn ? "কমিউনিটিতে আপনাকে কীভাবে দেখা যাবে তা ঠিক করুন।" : "Choose how people in your community will see you."}</Text>
      {syncStatus !== "idle" ? <View style={[styles.syncStatus, syncStatus === "synced" && styles.syncSuccess, (syncStatus === "failed" || syncStatus === "local") && styles.syncWarning]}><MaterialIcons name={syncStatus === "synced" ? "cloud-done" : syncStatus === "syncing" ? "sync" : "cloud-off"} size={17} color={syncStatus === "synced" ? C.leafGreen : C.terracotta} /><Text style={[styles.syncText, { fontFamily: formFont }]}>{syncStatus === "syncing" ? copy.profileSyncing : syncStatus === "synced" ? copy.profileSynced : syncStatus === "local" ? copy.profileSavedLocally : copy.profileSyncFailed}</Text></View> : null}
      <View style={styles.avatarCard}><Pressable onPress={() => void chooseAvatar()} style={styles.avatarPicker} accessibilityRole="button" accessibilityLabel={copy.chooseAvatar}><View><Avatar profile={profile} size={94} /><View style={styles.camera}><MaterialIcons name="photo-camera" size={16} color={C.ivory} /></View></View><Text style={[styles.changePhoto, { fontFamily: labelFont }]}>{copy.chooseAvatar}</Text></Pressable></View>
      <View style={styles.formCard}>
        <Field label={copy.profileNameLabel} value={name} onChangeText={(value) => { setName(value); setValidationError(""); }} fontFamily={formFont} required />
        <Field label={copy.profileHandleLabel} value={handle} onChangeText={(value) => { setHandle(value); setValidationError(""); }} fontFamily={formFont} autoCapitalize="none" prefix="@" required />
        <Field label={copy.profileBioLabel} value={bio} onChangeText={(value) => setBio(value.slice(0, BIO_LIMIT))} fontFamily={formFont} multiline suffix={`${bio.length}/${BIO_LIMIT}`} />
        <Field label={copy.profileRegionLabel} value={region} onChangeText={setRegion} fontFamily={formFont} />
        {validationError ? <View style={styles.errorRow}><MaterialIcons name="error-outline" size={17} color={C.error} /><Text style={[styles.errorText, { fontFamily: formFont }]}>{validationError}</Text></View> : null}
      </View>
      <Text style={[styles.privacyNote, { fontFamily: formFont }]}><MaterialIcons name="lock-outline" size={13} color={C.slate} /> {bn ? "আপনার তথ্য এই ডিভাইসে নিরাপদে রাখা হবে।" : "Your profile details stay private to your account."}</Text>
    </ScrollView>
  </View></ScreenContainer>;
}

function Field({ label, value, onChangeText, fontFamily, multiline = false, autoCapitalize = "sentences", prefix, suffix, required = false }: { label: string; value: string; onChangeText: (value: string) => void; fontFamily: string; multiline?: boolean; autoCapitalize?: "none" | "sentences"; prefix?: string; suffix?: string; required?: boolean }) {
  return <View style={styles.field}><View style={styles.labelRow}><Text style={[styles.label, { fontFamily }]}>{label}{required ? " *" : ""}</Text>{suffix ? <Text style={[styles.counter, { fontFamily }]}>{suffix}</Text> : null}</View><View style={[styles.inputWrap, multiline && styles.multilineWrap]}>{prefix ? <Text style={[styles.prefix, { fontFamily }]}>{prefix}</Text> : null}<TextInput value={value} onChangeText={onChangeText} style={[styles.input, { fontFamily }, multiline && styles.multiline]} multiline={multiline} autoCapitalize={autoCapitalize} placeholderTextColor={C.slate} maxLength={multiline ? BIO_LIMIT : undefined} /></View></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 18 }, header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 13, paddingBottom: 14 }, iconButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: C.primaryContainer, alignItems: "center", justifyContent: "center" }, title: { color: C.inkNavy, fontSize: 19 }, saveButton: { minHeight: 40, borderRadius: 14, backgroundColor: C.terracotta, paddingHorizontal: 13, alignItems: "center", justifyContent: "center" }, saveButtonDisabled: { opacity: 0.42 }, save: { color: C.ivory, fontSize: 11, fontWeight: "800" }, content: { paddingBottom: 34 }, intro: { color: C.slate, fontSize: 12, lineHeight: 18, marginBottom: 15 }, syncStatus: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: C.primaryContainer, borderRadius: 13, padding: 11, marginBottom: 13 }, syncSuccess: { backgroundColor: "#E2F1E4" }, syncWarning: { backgroundColor: "#FFF0E8" }, syncText: { flex: 1, color: C.slate, fontSize: 11, lineHeight: 16 }, avatarCard: { backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, borderRadius: 22, paddingVertical: 20, marginBottom: 13, alignItems: "center" }, avatarPicker: { alignItems: "center" }, camera: { position: "absolute", right: -2, bottom: 0, width: 31, height: 31, borderRadius: 16, backgroundColor: C.terracotta, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: C.paper }, changePhoto: { color: C.terracotta, fontSize: 12, marginTop: 11 }, formCard: { backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, borderRadius: 22, paddingHorizontal: 15, paddingVertical: 15 }, field: { marginBottom: 16 }, labelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }, label: { color: C.inkNavy, fontSize: 12, fontWeight: "800" }, counter: { color: C.slate, fontSize: 10 }, inputWrap: { minHeight: 50, flexDirection: "row", alignItems: "center", backgroundColor: C.ivory, borderWidth: 1, borderColor: C.line, borderRadius: 14, paddingHorizontal: 13 }, multilineWrap: { alignItems: "stretch" }, prefix: { color: C.slate, fontSize: 15 }, input: { flex: 1, color: C.inkNavy, fontSize: 14, minHeight: 48 }, multiline: { minHeight: 88, paddingTop: 13, textAlignVertical: "top" }, errorRow: { flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: "#FFF0E8", borderRadius: 11, padding: 10 }, errorText: { flex: 1, color: C.error, fontSize: 11 }, privacyNote: { color: C.slate, fontSize: 10, lineHeight: 16, textAlign: "center", marginTop: 14 }, loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 }, loadingDot: { width: 46, height: 46, borderRadius: 16, backgroundColor: C.primaryContainer, alignItems: "center", justifyContent: "center" }, muted: { color: C.slate, fontSize: 12 },
});
