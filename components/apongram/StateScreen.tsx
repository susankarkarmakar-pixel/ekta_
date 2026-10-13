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
  return <ScreenContainer safeAreaClassName="bg-ivory" className="bg-ivory"><View style={styles.container}>{banner ? <View style={styles.banner}><View style={styles.bannerDot} /><Text style={[styles.bannerText, { fontFamily: bodyFont }]}>{banner}</Text></View> : null}<View style={styles.content}><View style={styles.iconCircle}><MaterialIcons name={icon} size={43} color={Colors.light.terracotta} /></View><Text style={[styles.title, { fontFamily: headingFont }]}>{title}</Text><Text style={[styles.body, { fontFamily: bodyFont }]}>{body}</Text>{action ? <Pressable onPress={onAction} style={styles.button} accessibilityRole="button"><Text style={[styles.buttonText, { fontFamily: mediumFont }]}>{action}</Text></Pressable> : null}</View><Text style={[styles.footnote, { fontFamily: bodyFont }]}>{copy.demoModeText}</Text></View></ScreenContainer>;
}

const styles = StyleSheet.create({ container: { flex: 1, paddingHorizontal: 24, paddingTop: 18, paddingBottom: 22 }, banner: { flexDirection: "row", gap: 9, padding: 13, borderRadius: 16, backgroundColor: "#EAF3EA", borderWidth: 1, borderColor: "#C9DEC9" }, bannerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.light.leafGreen, marginTop: 6 }, bannerText: { flex: 1, color: Colors.dark.leafGreen, fontSize: 12, lineHeight: 18 }, content: { flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 60 }, iconCircle: { width: 104, height: 104, borderRadius: 52, alignItems: "center", justifyContent: "center", backgroundColor: Colors.light.primaryContainer, borderWidth: 1, borderColor: Colors.light.line }, title: { color: Colors.light.inkNavy, fontSize: 25, lineHeight: 34, fontWeight: "700", textAlign: "center", marginTop: 25 }, body: { color: Colors.light.slate, fontSize: 15, lineHeight: 23, textAlign: "center", marginTop: 8, maxWidth: 310 }, button: { width: "100%", marginTop: 25, minHeight: 54, borderRadius: 27, backgroundColor: Colors.light.terracotta, alignItems: "center", justifyContent: "center", shadowColor: Colors.light.inkNavy, shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 }, buttonText: { color: Colors.light.ivory, fontSize: 15, fontWeight: "800" }, footnote: { color: Colors.light.slate, fontSize: 10, textAlign: "center", lineHeight: 15 },
});
