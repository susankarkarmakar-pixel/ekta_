import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useLanguage } from "@/lib/apongram/LanguageContext";

type Reason = "spam" | "abuse" | "safety";

export default function ReportScreen() {
  const router = useRouter();
  const { copy } = useLanguage();
  const [reason, setReason] = useState<Reason | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const options: { id: Reason; label: string; icon: "flag" | "block" | "warning" }[] = [
    { id: "spam", label: copy.reportSpam, icon: "flag" },
    { id: "abuse", label: copy.reportAbuse, icon: "block" },
    { id: "safety", label: copy.reportSafety, icon: "warning" },
  ];
  if (submitted) return <ScreenContainer safeAreaClassName="bg-[#FBF6EC]" className="bg-[#FBF6EC]"><View style={styles.success}><MaterialIcons name="check-circle" size={52} color="#2E6B4A" /><Text style={styles.successTitle}>{copy.reportThanks}</Text><Pressable onPress={() => router.back()} style={styles.submit}><Text style={styles.submitText}>{copy.back}</Text></Pressable></View></ScreenContainer>;
  return <ScreenContainer safeAreaClassName="bg-[#FBF6EC]" className="bg-[#FBF6EC]"><View style={styles.container}><View style={styles.header}><Pressable onPress={() => router.back()} style={styles.iconButton} accessibilityLabel={copy.back}><MaterialIcons name="close" size={23} color="#14213D" /></Pressable><Text style={styles.title}>{copy.reportTitle}</Text><View style={styles.headerSpace} /></View><Text style={styles.body}>{copy.reportBody}</Text><View style={styles.options}>{options.map((item) => <Pressable key={item.id} onPress={() => setReason(item.id)} style={[styles.option, reason === item.id && styles.optionActive]}><View style={[styles.optionIcon, reason === item.id && styles.optionIconActive]}><MaterialIcons name={item.icon} size={20} color={reason === item.id ? "#FFF" : "#B4492A"} /></View><Text style={[styles.optionText, reason === item.id && styles.optionTextActive]}>{item.label}</Text><MaterialIcons name={reason === item.id ? "radio-button-checked" : "radio-button-unchecked"} size={22} color={reason === item.id ? "#B4492A" : "#9A9080"} /></Pressable>)}</View><View style={styles.spacer} /><Pressable disabled={!reason} onPress={() => setSubmitted(true)} style={[styles.submit, !reason && styles.disabled]}><Text style={styles.submitText}>{copy.reportSubmit}</Text></Pressable></View></ScreenContainer>;
}

const styles = StyleSheet.create({ container: { flex: 1, paddingHorizontal: 18 }, header: { height: 64, flexDirection: "row", alignItems: "center" }, iconButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" }, headerSpace: { width: 44 }, title: { flex: 1, color: "#14213D", fontFamily: "Georgia", fontSize: 20, fontWeight: "700", textAlign: "center" }, body: { color: "#5B6478", fontSize: 15, lineHeight: 22, marginTop: 22, marginBottom: 17 }, options: { gap: 9 }, option: { minHeight: 64, borderWidth: 1, borderColor: "#D8CDB6", borderRadius: 16, backgroundColor: "#FFFDF8", paddingHorizontal: 13, flexDirection: "row", alignItems: "center", gap: 11 }, optionActive: { borderColor: "#B4492A", backgroundColor: "#FDF3EC" }, optionIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: "#F3DCCF", alignItems: "center", justifyContent: "center" }, optionIconActive: { backgroundColor: "#B4492A" }, optionText: { flex: 1, color: "#14213D", fontSize: 13, fontWeight: "700" }, optionTextActive: { color: "#8F3820" }, spacer: { flex: 1 }, submit: { minHeight: 52, borderRadius: 26, backgroundColor: "#B4492A", alignItems: "center", justifyContent: "center", marginBottom: 20 }, disabled: { opacity: 0.4 }, submitText: { color: "#FFF", fontSize: 14, fontWeight: "800" }, success: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28 }, successTitle: { color: "#14213D", fontFamily: "Georgia", fontSize: 23, fontWeight: "700", textAlign: "center", marginTop: 16, marginBottom: 26 },
});
