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
import type { Profile, ProfileCategory } from "@/lib/apongram/types";

const C = Colors.light;
const BIO_LIMIT = 150;
const CATEGORY_OPTIONS: { value: ProfileCategory; en: string; bn: string }[] = [
  { value: "community", en: "Community", bn: "কমিউনিটি" },
  { value: "creator", en: "Creator", bn: "ক্রিয়েটর" },
  { value: "local-business", en: "Local business", bn: "স্থানীয় ব্যবসা" },
  { value: "volunteer", en: "Volunteer", bn: "স্বেচ্ছাসেবক" },
  { value: "organization", en: "Organization", bn: "সংগঠন" },
];

function normalizeWebsite(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(candidate);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : "";
  } catch {
    return "";
  }
}

function isValidHandle(value: string): boolean {
  return /^[a-z0-9](?:[a-z0-9._]{0,28}[a-z0-9])?$/.test(value);
}

export default function ProfileEditScreen() {
  const router = useRouter();
  const { copy, language } = useLanguage();
  const [profile, setProfile] = useState<Profile>();
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [category, setCategory] = useState<ProfileCategory>();
  const [region, setRegion] = useState("");
  const [saving, setSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "local" | "failed">("idle");
  const [validationError, setValidationError] = useState("");

  const bn = language === "bn";
  const formFont = bn ? "HindSiliguri" : "HindSiliguriLatin";
  const labelFont = bn ? "HindSiliguriSemiBold" : "HindSiliguriLatinSemiBold";
  const canSave = Boolean(name.trim() && handle.trim());

  useEffect(() => {
    getStoredProfile().then((value) => {
      setProfile(value);
      setName(value.name);
      setHandle(value.handle);
      setPronouns(value.pronouns ?? "");
      setBio(value.bio.slice(0, BIO_LIMIT));
      setWebsite(value.website ?? "");
      setCategory(value.category);
      setRegion(value.region);
    });
  }, []);

  const chooseAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.85 });
    if (!result.canceled && result.assets[0] && profile) setProfile({ ...profile, avatarUrl: result.assets[0].uri });
  };

  const save = async () => {
    if (!profile) return;
    const cleanHandle = handle.trim().replace(/^@+/, "").toLowerCase();
    const cleanWebsite = normalizeWebsite(website);
    if (!name.trim() || name.trim().length > 30 || !isValidHandle(cleanHandle)) {
      setValidationError(bn ? "নাম ৩০ অক্ষরের মধ্যে দিন এবং ইউজারনেমে শুধু অক্ষর, সংখ্যা, . বা _ ব্যবহার করুন।" : "Use a name up to 30 characters and a username with only letters, numbers, periods, or underscores.");
      return;
    }
    if (website.trim() && !cleanWebsite) {
      setValidationError(bn ? "একটি বৈধ ওয়েবসাইট লিংক দিন।" : "Enter a valid website link.");
      return;
    }
    setValidationError("");
    setSaving(true);
    setSyncStatus("syncing");
    try {
      const saved = await saveStoredProfile({
        ...profile,
        name: name.trim(),
        handle: cleanHandle,
        pronouns: pronouns.trim().slice(0, 24) || undefined,
        bio: bio.trim().slice(0, BIO_LIMIT),
        website: cleanWebsite || undefined,
        category,
        region: region.trim() || profile.region,
      });
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
      <Pressable onPress={() => void save()} disabled={saving || !canSave} style={[styles.saveButton, (!canSave || saving) && styles.saveButtonDisabled]} accessibilityRole="button" accessibilityLabel={copy.profileSave}>
        <Text style={[styles.save, { fontFamily: labelFont }]}>{saving ? "…" : copy.profileSave}</Text>
      </Pressable>
    </View>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={[styles.intro, { fontFamily: formFont }]}>{bn ? "কমিউনিটিতে আপনার পরিচয় ও প্রোফাইল সাজান।" : "Personalize the public details people see on your profile."}</Text>
      {syncStatus !== "idle" ? <View style={[styles.syncStatus, syncStatus === "synced" && styles.syncSuccess, (syncStatus === "failed" || syncStatus === "local") && styles.syncWarning]}><MaterialIcons name={syncStatus === "synced" ? "cloud-done" : syncStatus === "syncing" ? "sync" : "cloud-off"} size={17} color={syncStatus === "synced" ? C.leafGreen : C.terracotta} /><Text style={[styles.syncText, { fontFamily: formFont }]}>{syncStatus === "syncing" ? copy.profileSyncing : syncStatus === "synced" ? copy.profileSynced : syncStatus === "local" ? copy.profileSavedLocally : copy.profileSyncFailed}</Text></View> : null}
      <View style={styles.avatarCard}><Pressable onPress={() => void chooseAvatar()} style={styles.avatarPicker} accessibilityRole="button" accessibilityLabel={copy.chooseAvatar}><View><Avatar profile={profile} size={94} /><View style={styles.camera}><MaterialIcons name="photo-camera" size={16} color={C.ivory} /></View></View><Text style={[styles.changePhoto, { fontFamily: labelFont }]}>{copy.chooseAvatar}</Text></Pressable></View>
      <View style={styles.formCard}>
        <Text style={[styles.groupTitle, { fontFamily: labelFont }]}>{bn ? "ব্যক্তিগত তথ্য" : "Personal details"}</Text>
        <Field label={copy.profileNameLabel} value={name} onChangeText={(value) => { setName(value); setValidationError(""); }} fontFamily={formFont} required maxLength={30} suffix={`${name.length}/30`} />
        <Field label={copy.profileHandleLabel} value={handle} onChangeText={(value) => { setHandle(value.replace(/\s/g, "").replace(/^@+/, "").toLowerCase()); setValidationError(""); }} fontFamily={formFont} autoCapitalize="none" prefix="@" required maxLength={30} placeholder={bn ? "ইউজারনেম" : "username"} />
        <Field label={bn ? "প্রনাউনস" : "Pronouns"} value={pronouns} onChangeText={setPronouns} fontFamily={formFont} autoCapitalize="none" maxLength={24} placeholder={bn ? "যেমন: she/her" : "e.g. she/her"} />
        <Field label={copy.profileBioLabel} value={bio} onChangeText={(value) => setBio(value.slice(0, BIO_LIMIT))} fontFamily={formFont} multiline maxLength={BIO_LIMIT} suffix={`${bio.length}/${BIO_LIMIT}`} />

        <Text style={[styles.groupTitle, styles.secondGroupTitle, { fontFamily: labelFont }]}>{bn ? "পাবলিক প্রোফাইল" : "Public profile"}</Text>
        <Field label={bn ? "ওয়েবসাইট / লিংক" : "Website / link"} value={website} onChangeText={(value) => { setWebsite(value); setValidationError(""); }} fontFamily={formFont} autoCapitalize="none" keyboardType="url" maxLength={200} placeholder="https://example.com" />
        <View style={styles.field}>
          <Text style={[styles.label, { fontFamily: formFont }]}>{bn ? "প্রোফাইল ক্যাটাগরি" : "Profile category"}</Text>
          <View style={styles.categoryOptions}>
            {CATEGORY_OPTIONS.map((item) => {
              const selected = category === item.value;
              return <Pressable key={item.value} onPress={() => setCategory(selected ? undefined : item.value)} style={[styles.categoryOption, selected && styles.categoryOptionSelected]} accessibilityRole="button" accessibilityState={{ selected }}>
                <Text style={[styles.categoryOptionText, { fontFamily: formFont }, selected && styles.categoryOptionTextSelected]}>{bn ? item.bn : item.en}</Text>
              </Pressable>;
            })}
          </View>
        </View>
        <Field label={copy.profileRegionLabel} value={region} onChangeText={setRegion} fontFamily={formFont} maxLength={80} />
        {validationError ? <View style={styles.errorRow}><MaterialIcons name="error-outline" size={17} color={C.error} /><Text style={[styles.errorText, { fontFamily: formFont }]}>{validationError}</Text></View> : null}
      </View>
      <Text style={[styles.privacyNote, { fontFamily: formFont }]}><MaterialIcons name="info-outline" size={13} color={C.slate} /> {bn ? "এখানে যোগ করা তথ্য আপনার পাবলিক প্রোফাইলে দেখা যাবে।" : "Details added here appear on your public profile."}</Text>
    </ScrollView>
  </View></ScreenContainer>;
}

function Field({ label, value, onChangeText, fontFamily, multiline = false, autoCapitalize = "sentences", prefix, suffix, required = false, placeholder, maxLength, keyboardType = "default" }: { label: string; value: string; onChangeText: (value: string) => void; fontFamily: string; multiline?: boolean; autoCapitalize?: "none" | "sentences"; prefix?: string; suffix?: string; required?: boolean; placeholder?: string; maxLength?: number; keyboardType?: "default" | "url" }) {
  return <View style={styles.field}><View style={styles.labelRow}><Text style={[styles.label, { fontFamily }]}>{label}{required ? " *" : ""}</Text>{suffix ? <Text style={[styles.counter, { fontFamily }]}>{suffix}</Text> : null}</View><View style={[styles.inputWrap, multiline && styles.multilineWrap]}>{prefix ? <Text style={[styles.prefix, { fontFamily }]}>{prefix}</Text> : null}<TextInput value={value} onChangeText={onChangeText} style={[styles.input, { fontFamily }, multiline && styles.multiline]} multiline={multiline} autoCapitalize={autoCapitalize} autoCorrect={false} keyboardType={keyboardType} placeholder={placeholder} placeholderTextColor={C.slate} maxLength={maxLength} /></View></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 18 }, header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 13, paddingBottom: 14 }, iconButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: C.primaryContainer, alignItems: "center", justifyContent: "center" }, title: { color: C.inkNavy, fontSize: 19 }, saveButton: { minHeight: 40, borderRadius: 14, backgroundColor: C.terracotta, paddingHorizontal: 13, alignItems: "center", justifyContent: "center" }, saveButtonDisabled: { opacity: 0.42 }, save: { color: C.ivory, fontSize: 11, fontWeight: "800" }, content: { paddingBottom: 34 }, intro: { color: C.slate, fontSize: 12, lineHeight: 18, marginBottom: 15 }, syncStatus: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: C.primaryContainer, borderRadius: 13, padding: 11, marginBottom: 13 }, syncSuccess: { backgroundColor: "#E2F1E4" }, syncWarning: { backgroundColor: "#FFF0E8" }, syncText: { flex: 1, color: C.slate, fontSize: 11, lineHeight: 16 }, avatarCard: { backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, borderRadius: 22, paddingVertical: 20, marginBottom: 13, alignItems: "center" }, avatarPicker: { alignItems: "center" }, camera: { position: "absolute", right: -2, bottom: 0, width: 31, height: 31, borderRadius: 16, backgroundColor: C.terracotta, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: C.paper }, changePhoto: { color: C.terracotta, fontSize: 12, marginTop: 11 }, formCard: { backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, borderRadius: 22, paddingHorizontal: 15, paddingVertical: 15 }, groupTitle: { color: C.inkNavy, fontSize: 14, fontWeight: "900", marginBottom: 15 }, secondGroupTitle: { marginTop: 5, paddingTop: 16, borderTopWidth: 1, borderTopColor: C.line }, field: { marginBottom: 16 }, labelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }, label: { color: C.inkNavy, fontSize: 12, fontWeight: "800", marginBottom: 7 }, counter: { color: C.slate, fontSize: 10 }, inputWrap: { minHeight: 50, flexDirection: "row", alignItems: "center", backgroundColor: C.ivory, borderWidth: 1, borderColor: C.line, borderRadius: 14, paddingHorizontal: 13 }, multilineWrap: { alignItems: "stretch" }, prefix: { color: C.slate, fontSize: 15 }, input: { flex: 1, color: C.inkNavy, fontSize: 14, minHeight: 48 }, multiline: { minHeight: 88, paddingTop: 13, textAlignVertical: "top" }, categoryOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 2 }, categoryOption: { minHeight: 40, justifyContent: "center", borderRadius: 999, paddingHorizontal: 12, backgroundColor: C.ivory, borderWidth: 1, borderColor: C.line }, categoryOptionSelected: { backgroundColor: C.primaryContainer, borderColor: C.terracotta }, categoryOptionText: { color: C.slate, fontSize: 11, fontWeight: "700" }, categoryOptionTextSelected: { color: C.terracotta, fontWeight: "900" }, errorRow: { flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: "#FFF0E8", borderRadius: 11, padding: 10 }, errorText: { flex: 1, color: C.error, fontSize: 11 }, privacyNote: { color: C.slate, fontSize: 10, lineHeight: 16, textAlign: "center", marginTop: 14 }, loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 }, loadingDot: { width: 46, height: 46, borderRadius: 16, backgroundColor: C.primaryContainer, alignItems: "center", justifyContent: "center" }, muted: { color: C.slate, fontSize: 12 },
});
