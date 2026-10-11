import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Logo } from "@/components/Logo";
import { ScreenContainer } from "@/components/screen-container";
import { Colors } from "@/constants/theme";
import { useLanguage } from "@/lib/apongram/LanguageContext";
import { DEMO_MODE } from "@/lib/apongram/demo-mode";

const WELCOME_KEY = "ekta-welcome-seen";
const LIGHT = Colors.light;
const DARK = Colors.dark;

export default function EntryScreen() {
  const router = useRouter();
  const { language, setLanguage, copy } = useLanguage();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (DEMO_MODE) {
      router.replace("/(tabs)");
      return;
    }
    AsyncStorage.getItem(WELCOME_KEY).then((seen) => {
      if (seen === "true") router.replace("/auth/phone");
      else setChecking(false);
    }).catch(() => setChecking(false));
  }, [router]);

  const start = async () => {
    if (DEMO_MODE) {
      router.replace("/(tabs)");
      return;
    }
    await AsyncStorage.setItem(WELCOME_KEY, "true");
    router.replace("/auth/phone");
  };

  if (checking) return <ScreenContainer safeAreaClassName="bg-ivory" className="bg-ivory"><View style={styles.loading}><MaterialIcons name="diversity-3" size={28} color={LIGHT.terracotta} /></View></ScreenContainer>;

  return (
    <ScreenContainer safeAreaClassName="bg-ivory" className="bg-ivory">
      <View style={styles.container}>
        <View style={styles.brandRow}><Logo variant="horizontal" width={118} height={36} accessibilityLabel="eKta" /></View>
        <View style={styles.landscape}><View style={styles.sun} /><View style={styles.hillBack} /><View style={styles.hillFront} /></View>
        <Text style={[styles.title, { fontFamily: language === "bn" ? "NotoSerifBengaliBold" : "Fraunces" }]}>{copy.welcomeTitle}</Text>
        <Text style={[styles.intro, { fontFamily: language === "bn" ? "HindSiliguri" : "HindSiliguriLatin" }]}>{copy.welcomeIntro}</Text>
        <Text style={[styles.label, { fontFamily: language === "bn" ? "HindSiliguriSemiBold" : "HindSiliguriLatinSemiBold" }]}>{copy.chooseLanguage}</Text>
        <View style={styles.languageRow}>
          {(["bn", "en"] as const).map((item) => <Pressable key={item} onPress={() => setLanguage(item)} accessibilityRole="button" accessibilityLabel={item === "bn" ? "বাংলা" : "English"} style={[styles.languageButton, language === item && styles.languageActive]}><Text style={[styles.languageText, { fontFamily: language === "bn" ? "HindSiliguriSemiBold" : "HindSiliguriLatinSemiBold" }, language === item && styles.languageTextActive]}>{item === "bn" ? "বাংলা" : "English"}</Text></Pressable>)}
        </View>
        <View style={styles.spacer} />
        <View style={styles.note}><View style={styles.noteDot} /><Text style={[styles.noteText, { fontFamily: language === "bn" ? "HindSiliguri" : "HindSiliguriLatin" }]}>{copy.pilotNote}</Text></View>
        <Pressable onPress={start} style={styles.startButton}><Text style={[styles.startText, { fontFamily: language === "bn" ? "HindSiliguriSemiBold" : "HindSiliguriLatinSemiBold" }]}>{copy.start}</Text><MaterialIcons name="arrow-forward" size={20} color={LIGHT.ivory} /></Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 18, paddingBottom: 24 },
  brandRow: { flexDirection: "row", alignItems: "center" },
  landscape: { height: 180, borderRadius: 20, backgroundColor: LIGHT.primaryContainer, overflow: "hidden", position: "relative", marginTop: 28 },
  sun: { position: "absolute", right: 48, top: 25, width: 40, height: 40, borderRadius: 20, backgroundColor: LIGHT.ochre },
  hillBack: { position: "absolute", left: -25, right: -25, bottom: -50, height: 110, borderRadius: 110, backgroundColor: LIGHT.leafGreen, transform: [{ scaleX: 1.2 }] },
  hillFront: { position: "absolute", left: -25, right: -25, bottom: -73, height: 120, borderRadius: 110, backgroundColor: DARK.leafGreen, transform: [{ scaleX: 1.1 }] },
  title: { color: LIGHT.inkNavy, fontSize: 28, lineHeight: 37, fontWeight: "700", marginTop: 27 },
  intro: { color: LIGHT.slate, fontSize: 15, lineHeight: 23, marginTop: 8 },
  label: { color: LIGHT.inkNavy, fontSize: 13, fontWeight: "800", marginTop: 24, marginBottom: 9 },
  languageRow: { flexDirection: "row", gap: 8 },
  languageButton: { flex: 1, borderWidth: 1.5, borderColor: LIGHT.line, backgroundColor: LIGHT.paper, borderRadius: 14, minHeight: 48, alignItems: "center", justifyContent: "center" },
  languageActive: { backgroundColor: LIGHT.inkNavy, borderColor: LIGHT.inkNavy },
  languageText: { color: LIGHT.slate, fontSize: 14, fontWeight: "700" }, languageTextActive: { color: LIGHT.ivory },
  spacer: { flex: 1 },
  note: { flexDirection: "row", gap: 9, padding: 12, backgroundColor: "#DDEBDD", borderRadius: 14, marginBottom: 12 },
  noteDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: LIGHT.leafGreen, marginTop: 6 }, noteText: { flex: 1, color: DARK.leafGreen, fontSize: 12, lineHeight: 18 },
  startButton: { height: 52, borderRadius: 26, backgroundColor: LIGHT.terracotta, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }, startText: { color: LIGHT.ivory, fontSize: 16, fontWeight: "800" },
});
