import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useLanguage } from "@/lib/apongram/LanguageContext";

type StateScreenProps = { icon: React.ComponentProps<typeof MaterialIcons>["name"]; title: string; body: string; action?: string; onAction?: () => void; banner?: string };

export function StateScreen({ icon, title, body, action, onAction, banner }: StateScreenProps) {
  const { copy } = useLanguage();
  return <ScreenContainer safeAreaClassName="bg-[#FBF6EC]" className="bg-[#FBF6EC]"><View style={styles.container}>{banner ? <View style={styles.banner}><View style={styles.bannerDot} /><Text style={styles.bannerText}>{banner}</Text></View> : null}<View style={styles.content}><View style={styles.iconCircle}><MaterialIcons name={icon} size={43} color="#B4492A" /></View><Text style={styles.title}>{title}</Text><Text style={styles.body}>{body}</Text>{action ? <Pressable onPress={onAction} style={styles.button}><Text style={styles.buttonText}>{action}</Text></Pressable> : null}</View><Text style={styles.footnote}>{copy.demoModeText}</Text></View></ScreenContainer>;
}

const styles = StyleSheet.create({ container: { flex: 1, paddingHorizontal: 24, paddingTop: 18, paddingBottom: 22 }, banner: { flexDirection: "row", gap: 9, padding: 12, borderRadius: 14, backgroundColor: "#DDEBDD" }, bannerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#2E6B4A", marginTop: 6 }, bannerText: { flex: 1, color: "#1F4D35", fontSize: 12, lineHeight: 18 }, content: { flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 60 }, iconCircle: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center", backgroundColor: "#F3DCCF" }, title: { color: "#14213D", fontFamily: "Georgia", fontSize: 24, lineHeight: 33, fontWeight: "700", textAlign: "center", marginTop: 24 }, body: { color: "#5B6478", fontSize: 15, lineHeight: 23, textAlign: "center", marginTop: 8, maxWidth: 310 }, button: { width: "100%", marginTop: 24, minHeight: 52, borderRadius: 26, backgroundColor: "#B4492A", alignItems: "center", justifyContent: "center" }, buttonText: { color: "#FFF", fontSize: 15, fontWeight: "800" }, footnote: { color: "#9A9080", fontSize: 10, textAlign: "center", lineHeight: 15 },
});
