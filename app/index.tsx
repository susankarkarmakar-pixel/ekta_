import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useLanguage } from "@/lib/apongram/LanguageContext";

const WELCOME_KEY = "ekta-welcome-seen";

export default function EntryScreen() {
  const router = useRouter();
  const { language, setLanguage, copy } = useLanguage();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(WELCOME_KEY).then((seen) => {
      if (seen === "true") router.replace("/auth/phone");
      else setChecking(false);
    }).catch(() => setChecking(false));
  }, [router]);

  const start = async () => {
    await AsyncStorage.setItem(WELCOME_KEY, "true");
    router.replace("/auth/phone");
  };

  if (checking) return <ScreenContainer safeAreaClassName="bg-[#FBF6EC]" className="bg-[#FBF6EC]"><View style={styles.loading}><MaterialIcons name="diversity-3" size={28} color="#B4492A" /></View></ScreenContainer>;

  return (
    <ScreenContainer safeAreaClassName="bg-[#FBF6EC]" className="bg-[#FBF6EC]">
      <View style={styles.container}>
        <View style={styles.brandRow}><Text style={styles.brand}>eKta</Text><View style={styles.dots}><View style={styles.terraDot} /><View style={styles.greenDot} /></View></View>
        <View style={styles.landscape}><View style={styles.sun} /><View style={styles.hillBack} /><View style={styles.hillFront} /></View>
        <Text style={styles.title}>{copy.welcomeTitle}</Text>
        <Text style={styles.intro}>{copy.welcomeIntro}</Text>
        <Text style={styles.label}>{copy.chooseLanguage}</Text>
        <View style={styles.languageRow}>
          {(["bn", "en"] as const).map((item) => <Pressable key={item} onPress={() => setLanguage(item)} accessibilityRole="button" accessibilityLabel={item === "bn" ? "বাংলা" : "English"} style={[styles.languageButton, language === item && styles.languageActive]}><Text style={[styles.languageText, language === item && styles.languageTextActive]}>{item === "bn" ? "বাংলা" : "English"}</Text></Pressable>)}
        </View>
        <View style={styles.spacer} />
        <View style={styles.note}><View style={styles.noteDot} /><Text style={styles.noteText}>{copy.pilotNote}</Text></View>
        <Pressable onPress={start} style={styles.startButton}><Text style={styles.startText}>{copy.start}</Text><MaterialIcons name="arrow-forward" size={20} color="#FFF" /></Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 18, paddingBottom: 24 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  brand: { color: "#14213D", fontFamily: "Georgia", fontSize: 31, fontWeight: "700" },
  dots: { gap: 3, marginTop: 4 }, terraDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#B4492A", marginLeft: 5 }, greenDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#2E6B4A" },
  landscape: { height: 180, borderRadius: 20, backgroundColor: "#F3DCCF", overflow: "hidden", position: "relative", marginTop: 28 },
  sun: { position: "absolute", right: 48, top: 25, width: 40, height: 40, borderRadius: 20, backgroundColor: "#E0A24A" },
  hillBack: { position: "absolute", left: -25, right: -25, bottom: -50, height: 110, borderRadius: 110, backgroundColor: "#2E6B4A", transform: [{ scaleX: 1.2 }] },
  hillFront: { position: "absolute", left: -25, right: -25, bottom: -73, height: 120, borderRadius: 110, backgroundColor: "#1F4D35", transform: [{ scaleX: 1.1 }] },
  title: { color: "#14213D", fontFamily: "Georgia", fontSize: 28, lineHeight: 37, fontWeight: "700", marginTop: 27 },
  intro: { color: "#5B6478", fontSize: 15, lineHeight: 23, marginTop: 8 },
  label: { color: "#14213D", fontSize: 13, fontWeight: "800", marginTop: 24, marginBottom: 9 },
  languageRow: { flexDirection: "row", gap: 8 },
  languageButton: { flex: 1, borderWidth: 1.5, borderColor: "#D8CDB6", backgroundColor: "#FFFDF8", borderRadius: 14, minHeight: 48, alignItems: "center", justifyContent: "center" },
  languageActive: { backgroundColor: "#14213D", borderColor: "#14213D" },
  languageText: { color: "#5B6478", fontSize: 14, fontWeight: "700" }, languageTextActive: { color: "#FBF6EC" },
  spacer: { flex: 1 },
  note: { flexDirection: "row", gap: 9, padding: 12, backgroundColor: "#DDEBDD", borderRadius: 14, marginBottom: 12 },
  noteDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#2E6B4A", marginTop: 6 }, noteText: { flex: 1, color: "#1F4D35", fontSize: 12, lineHeight: 18 },
  startButton: { height: 52, borderRadius: 26, backgroundColor: "#B4492A", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }, startText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
});
