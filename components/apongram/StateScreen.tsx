import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/theme";
import { ScreenContainer } from "@/components/screen-container";
import { useLanguage } from "@/lib/apongram/LanguageContext";

type StateVariant = "empty" | "offline" | "error";
type StateScreenProps = { icon: React.ComponentProps<typeof MaterialIcons>["name"]; title: string; body: string; action?: string; onAction?: () => void; banner?: string; variant?: StateVariant };

export function StateScreen({ icon, title, body, action, onAction, banner, variant = "empty" }: StateScreenProps) {
  const { copy, language } = useLanguage();
  const bodyFont = language === "bn" ? "HindSiliguri" : "HindSiliguriLatin";
  const mediumFont = language === "bn" ? "HindSiliguriSemiBold" : "HindSiliguriLatinSemiBold";
  const headingFont = language === "bn" ? "NotoSerifBengaliBold" : "Fraunces";
  const isError = variant === "error";
  const isOffline = variant === "offline";
  const accent = isError ? Colors.light.error : isOffline ? Colors.light.leafGreen : Colors.light.terracotta;
  const iconBackground = isError ? "#FFF0E8" : isOffline ? "#E2F1E4" : Colors.light.primaryContainer;
  return <ScreenContainer safeAreaClassName="bg-background" className="bg-background"><View style={styles.container}>
    {banner ? <View style={[styles.banner, isOffline && styles.offlineBanner]} accessibilityRole="alert"><View style={[styles.bannerDot, { backgroundColor: accent }]} /><Text style={[styles.bannerText, { fontFamily: bodyFont }]}>{banner}</Text></View> : null}
    <View style={styles.content}>
      <View style={[styles.iconCircle, { backgroundColor: iconBackground }]}><View style={[styles.iconRing, { borderColor: accent }]}><MaterialIcons name={icon} size={40} color={accent} /></View></View>
      <Text style={[styles.title, { fontFamily: headingFont }]}>{title}</Text>
      <Text style={[styles.body, { fontFamily: bodyFont }]}>{body}</Text>
      {action ? <Pressable onPress={onAction} style={[styles.button, { backgroundColor: accent }]} accessibilityRole="button" accessibilityLabel={action}><Text style={[styles.buttonText, { fontFamily: mediumFont }]}>{action}</Text><MaterialIcons name="arrow-forward" size={19} color={Colors.light.ivory} /></Pressable> : null}
    </View>
    <View style={styles.footer}><View style={[styles.footerDot, { backgroundColor: accent }]} /><Text style={[styles.footnote, { fontFamily: bodyFont }]}>{copy.demoModeText}</Text></View>
  </View></ScreenContainer>;
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 18, paddingBottom: 22 },
  banner: { flexDirection: "row", gap: 9, padding: 12, borderRadius: 15, backgroundColor: "#FFF0E8", borderWidth: 1, borderColor: "#F3D3C4" },
  offlineBanner: { backgroundColor: "#E2F1E4", borderColor: "#C9E2CE" },
  bannerDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  bannerText: { flex: 1, color: Colors.light.slate, fontSize: 12, lineHeight: 18 },
  content: { flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 48 },
  iconCircle: { width: 112, height: 112, borderRadius: 36, alignItems: "center", justifyContent: "center", transform: [{ rotate: "3deg" }] },
  iconRing: { width: 78, height: 78, borderRadius: 28, borderWidth: 1.5, alignItems: "center", justifyContent: "center", transform: [{ rotate: "-3deg" }] },
  title: { color: Colors.light.inkNavy, fontSize: 24, lineHeight: 33, fontWeight: "700", textAlign: "center", marginTop: 25 },
  body: { color: Colors.light.slate, fontSize: 15, lineHeight: 23, textAlign: "center", marginTop: 9, maxWidth: 310 },
  button: { minWidth: 170, marginTop: 25, minHeight: 52, paddingHorizontal: 20, borderRadius: 17, flexDirection: "row", gap: 9, alignItems: "center", justifyContent: "center", shadowColor: Colors.light.inkNavy, shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  buttonText: { color: Colors.light.ivory, fontSize: 14, fontWeight: "800" },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  footerDot: { width: 6, height: 6, borderRadius: 3 },
  footnote: { color: Colors.light.slate, fontSize: 10, lineHeight: 15, textAlign: "center" },
});
