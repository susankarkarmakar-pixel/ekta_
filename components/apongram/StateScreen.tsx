import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/theme";
import { ScreenContainer } from "@/components/screen-container";
import { useLanguage } from "@/lib/apongram/LanguageContext";

type StateScreenProps = { icon: React.ComponentProps<typeof MaterialIcons>["name"]; title: string; body: string; action?: string; onAction?: () => void; banner?: string };

export function StateScreen({ icon, title, body, action, onAction, banner }: StateScreenProps) {
  const { copy, language } = useLanguage();
  const bodyFont = language === "bn" ? "HindSiliguri" : "HindSiliguriLatin";
  const mediumFont = language === "bn" ? "HindSiliguriSemiBold" : "HindSiliguriLatinSemiBold";
  const headingFont = language === "bn" ? "NotoSerifBengaliBold" : "Fraunces";
  return <ScreenContainer safeAreaClassName="bg-ivory" className="bg-ivory"><View style={styles.container}>{banner ? <View style={styles.banner}><View style={styles.bannerDot} /><Text style={[styles.bannerText, { fontFamily: bodyFont }]}>{banner}</Text></View> : null}<View style={styles.content}><View style={styles.iconCircle}><MaterialIcons name={icon} size={43} color={Colors.light.terracotta} /></View><Text style={[styles.title, { fontFamily: headingFont }]}>{title}</Text><Text style={[styles.body, { fontFamily: bodyFont }]}>{body}</Text>{action ? <Pressable onPress={onAction} style={styles.button}><Text style={[styles.buttonText, { fontFamily: mediumFont }]}>{action}</Text></Pressable> : null}</View><Text style={[styles.footnote, { fontFamily: bodyFont }]}>{copy.demoModeText}</Text></View></ScreenContainer>;
}

const styles = StyleSheet.create({ container: { flex: 1, paddingHorizontal: 24, paddingTop: 18, paddingBottom: 22 }, banner: { flexDirection: "row", gap: 9, padding: 12, borderRadius: 14, backgroundColor: "#DDEBDD" }, bannerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.light.leafGreen, marginTop: 6 }, bannerText: { flex: 1, color: Colors.dark.leafGreen, fontSize: 12, lineHeight: 18 }, content: { flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 60 }, iconCircle: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center", backgroundColor: Colors.light.primaryContainer }, title: { color: Colors.light.inkNavy, fontSize: 24, lineHeight: 33, fontWeight: "700", textAlign: "center", marginTop: 24 }, body: { color: Colors.light.slate, fontSize: 15, lineHeight: 23, textAlign: "center", marginTop: 8, maxWidth: 310 }, button: { width: "100%", marginTop: 24, minHeight: 52, borderRadius: 26, backgroundColor: Colors.light.terracotta, alignItems: "center", justifyContent: "center" }, buttonText: { color: Colors.light.ivory, fontSize: 15, fontWeight: "800" }, footnote: { color: Colors.light.slate, fontSize: 10, textAlign: "center", lineHeight: 15 },
});
