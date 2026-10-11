import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Logo } from "@/components/Logo";
import { ScreenContainer } from "@/components/screen-container";
import { Colors } from "@/constants/theme";
import { sendPhoneOtp, SupabaseAuthError, verifyPhoneOtp } from "@/lib/apongram/supabase-auth";
import { supabaseConfig } from "@/lib/apongram/supabase-config";
import { useLanguage } from "@/lib/apongram/LanguageContext";

const LIGHT = Colors.light;

export default function PhoneAuthScreen() {
  const router = useRouter();
  const { copy, language, toggleLanguage } = useLanguage();
  const bodyFont = language === "bn" ? "HindSiliguri" : "HindSiliguriLatin";
  const mediumFont = language === "bn" ? "HindSiliguriSemiBold" : "HindSiliguriLatinSemiBold";
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const otpRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (!resendIn) return;
    const timer = setInterval(() => setResendIn((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [resendIn]);

  const sendOtp = async () => {
    if (busy || resendIn > 0) return;
    setBusy(true);
    setError("");
    try {
      if (!supabaseConfig.isConfigured) {
        setSent(true);
        setResendIn(30);
        return;
      }
      await sendPhoneOtp(phone);
      setSent(true);
      setOtp("");
      setResendIn(30);
    } catch (cause) {
      setError(cause instanceof SupabaseAuthError ? cause.message : (language === "bn" ? "OTP পাঠানো যায়নি। আবার চেষ্টা করুন।" : "We could not send the OTP. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (!supabaseConfig.isConfigured) {
        if (otp.replace(/\D/g, "").length < 6) throw new Error(language === "bn" ? "৬ সংখ্যার OTP লিখুন।" : "Enter the 6-digit OTP.");
      } else {
        await verifyPhoneOtp(otp, phone);
      }
      setVerified(true);
    } catch (cause) {
      setError(cause instanceof SupabaseAuthError || cause instanceof Error ? cause.message : (language === "bn" ? "OTP যাচাই করা যায়নি।" : "We could not verify the OTP."));
    } finally {
      setBusy(false);
    }
  };

  const otpDigits = otp.replace(/\D/g, "").slice(0, 6);
  const setOtpDigit = (index: number, value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length > 1) {
      const pasted = digits.slice(0, 6);
      setOtp(pasted);
      otpRefs.current[Math.min(pasted.length, 5)]?.focus();
      return;
    }
    const next = otpDigits.split("");
    next[index] = digits;
    const nextOtp = next.join("").slice(0, 6);
    setOtp(nextOtp);
    if (digits && index < 5) otpRefs.current[index + 1]?.focus();
  };
  const handleOtpKeyPress = (index: number, key: string) => {
    if (key !== "Backspace" || otpDigits[index]) return;
    if (index > 0) {
      const next = otpDigits.split("");
      next[index - 1] = "";
      setOtp(next.join(""));
      otpRefs.current[index - 1]?.focus();
    }
  };
  const phoneDigits = phone.replace(/\D/g, "");
  const canSend = phoneDigits.length === 10 || phoneDigits.length === 12;
  const canVerify = otp.replace(/\D/g, "").length === 6;

  return (
    <ScreenContainer safeAreaClassName="bg-ivory" className="bg-ivory">
      <View style={styles.container}>
        <View style={styles.top}>
          <Pressable onPress={() => router.back()} style={styles.back} accessibilityLabel={copy.back}>
            <MaterialIcons name="arrow-back" size={22} color={LIGHT.slate} />
            <Text style={[styles.backText, { fontFamily: mediumFont }]}>{copy.back}</Text>
          </Pressable>
          <Pressable onPress={toggleLanguage} style={styles.language} accessibilityLabel="Switch language">
            <Text style={[styles.languageText, { fontFamily: mediumFont }]}>{language === "bn" ? "বাং · EN" : "EN · বাং"}</Text>
          </Pressable>
        </View>
        <View style={styles.hero}>
          <View style={styles.landscape}><View style={styles.landscapeSun} /><View style={styles.landscapeHillBack} /><View style={styles.landscapeHillFront} /></View>
          <View style={styles.brandRow}><Logo variant="horizontal" width={118} height={36} accessibilityLabel="eKta" /></View>
          <Text style={[styles.tagline, { fontFamily: bodyFont }]}>{language === "bn" ? "একতায় আমরা · your community, connected" : "Your community, connected"}</Text>
          <View style={styles.localPill}><View style={styles.dot} /><Text style={[styles.localText, { fontFamily: bodyFont }]}>{language === "bn" ? "আপনার স্থানীয় প্রতিবেশী নেটওয়ার্ক" : "Your local neighborhood network"}</Text></View>
        </View>
        {verified ? (
          <View style={styles.verified}>
            <MaterialIcons name="check-circle" size={48} color={LIGHT.leafGreen} />
            <Text style={[styles.verifiedTitle, { fontFamily: language === "bn" ? "HindSiliguriSemiBold" : "HindSiliguriLatinSemiBold" }]}>{copy.verifiedMessage}</Text>
            <Pressable onPress={() => router.replace("/")} style={styles.button}><Text style={[styles.buttonText, { fontFamily: mediumFont }]}>{copy.home}</Text></Pressable>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={[styles.label, { fontFamily: mediumFont }]}>{sent ? copy.otpLabel : copy.phoneLabel}</Text>
            {sent ? <View style={styles.otpRow} accessibilityRole="none">
              {Array.from({ length: 6 }, (_, index) => <TextInput
                key={index}
                ref={(ref) => { otpRefs.current[index] = ref; }}
                value={otpDigits[index] ?? ""}
                onChangeText={(value) => setOtpDigit(index, value)}
                onKeyPress={({ nativeEvent }) => handleOtpKeyPress(index, nativeEvent.key)}
                keyboardType="number-pad"
                inputMode="numeric"
                maxLength={6}
                autoFocus={index === 0}
                editable={!busy}
                selectTextOnFocus
                accessibilityLabel={`${copy.otpDigit} ${index + 1}`}
                style={[styles.otpBox, { fontFamily: mediumFont }, otpDigits[index] && styles.otpBoxFilled, index === otpDigits.length && styles.otpBoxActive]}
              />)}
            </View> : <View style={styles.inputWrap}>
              <View style={styles.prefix}><Text style={styles.prefixText}>+91</Text></View>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="number-pad"
                placeholder={copy.phonePlaceholder.replace("+91 ", "")}
                placeholderTextColor="#9A9080"
                style={[styles.input, { fontFamily: bodyFont }]}
                maxLength={12}
                autoFocus
                editable={!busy}
                accessibilityLabel={copy.phoneLabel}
              />
            </View>}
            <Pressable
              onPress={sent ? verifyOtp : sendOtp}
              disabled={busy || (sent ? !canVerify : !canSend) || (!sent && resendIn > 0)}
              style={[styles.button, (busy || (sent ? !canVerify : !canSend) || (!sent && resendIn > 0)) && styles.disabled]}
            >
              <Text style={[styles.buttonText, { fontFamily: mediumFont }]}>{busy ? (language === "bn" ? "অপেক্ষা করুন..." : "Please wait...") : sent ? copy.verify : resendIn ? `${copy.resend} (${resendIn}s)` : copy.sendOtp}</Text>
              <MaterialIcons name="arrow-forward" size={20} color={LIGHT.ivory} />
            </Pressable>
            {sent && <Pressable onPress={() => { setSent(false); setOtp(""); setError(""); }} disabled={busy}><Text style={[styles.resend, { fontFamily: mediumFont }]}>{copy.resend}</Text></Pressable>}
            {error ? <Text style={[styles.error, { fontFamily: bodyFont }]}>{error}</Text> : null}
            {!supabaseConfig.isConfigured && <Text style={[styles.demoNote, { fontFamily: bodyFont }]}>{copy.demoModeText}</Text>}
            <Text style={[styles.disclaimer, { fontFamily: bodyFont }]}>{language === "bn" ? "সাইন ইন করে আপনি আমাদের কমিউনিটি নির্দেশিকা ও প্রতিবেশীর গোপনীয়তা নীতিতে সম্মতি দিচ্ছেন।" : "By signing in, you agree to our community guidelines and neighborhood privacy charter."}</Text>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 22 },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 14 },
  back: { flexDirection: "row", alignItems: "center", gap: 6 },
  backText: { color: LIGHT.slate, fontSize: 12, fontWeight: "700" },
  language: { backgroundColor: LIGHT.paper, borderWidth: 1, borderColor: LIGHT.line, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  languageText: { color: LIGHT.terracotta, fontSize: 11, fontWeight: "800" },
  hero: { alignItems: "center", paddingTop: 70 },
  landscape: { width: "100%", height: 150, borderRadius: 20, backgroundColor: LIGHT.primaryContainer, overflow: "hidden", position: "relative" },
  landscapeSun: { position: "absolute", right: 48, top: 24, width: 40, height: 40, borderRadius: 20, backgroundColor: LIGHT.ochre },
  landscapeHillBack: { position: "absolute", left: -20, right: -20, bottom: -42, height: 94, borderRadius: 90, backgroundColor: LIGHT.leafGreen, transform: [{ scaleX: 1.25 }] },
  landscapeHillFront: { position: "absolute", left: -20, right: -20, bottom: -64, height: 100, borderRadius: 90, backgroundColor: Colors.dark.leafGreen, transform: [{ scaleX: 1.15 }] },
  brandRow: { flexDirection: "row", alignItems: "center", marginTop: 16 },
  tagline: { color: LIGHT.slate, textAlign: "center", lineHeight: 23, fontSize: 15, marginTop: 7 },
  localPill: { borderWidth: 1, borderColor: LIGHT.line, borderRadius: 999, backgroundColor: LIGHT.paper, paddingHorizontal: 13, paddingVertical: 8, marginTop: 22, flexDirection: "row", alignItems: "center", gap: 7 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: LIGHT.leafGreen },
  localText: { color: LIGHT.slate, fontSize: 11 },
  form: { marginTop: "auto", paddingBottom: 24 },
  label: { color: LIGHT.inkNavy, fontWeight: "800", fontSize: 13, marginBottom: 8 },
  inputWrap: { backgroundColor: LIGHT.paper, borderWidth: 1, borderColor: LIGHT.line, borderRadius: 14, height: 54, flexDirection: "row", alignItems: "center", marginBottom: 15 },
  prefix: { height: "100%", justifyContent: "center", paddingHorizontal: 15, borderRightWidth: 1, borderRightColor: LIGHT.line },
  prefixText: { color: LIGHT.inkNavy, fontSize: 15, fontWeight: "700" },
  input: { flex: 1, color: LIGHT.inkNavy, fontSize: 16, paddingHorizontal: 14 },
  otpRow: { flexDirection: "row", gap: 8, marginBottom: 15 },
  otpBox: { width: 46, height: 56, padding: 0, borderWidth: 1.5, borderColor: LIGHT.line, borderRadius: 12, backgroundColor: LIGHT.paper, color: LIGHT.inkNavy, fontSize: 24, fontWeight: "600", textAlign: "center" },
  otpBoxFilled: { borderColor: LIGHT.inkNavy },
  otpBoxActive: { borderWidth: 2, borderColor: LIGHT.terracotta },
  button: { backgroundColor: LIGHT.terracotta, borderRadius: 12, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 9, paddingVertical: 15 },
  disabled: { opacity: 0.42 },
  buttonText: { color: LIGHT.ivory, fontWeight: "800", fontSize: 14 },
  resend: { color: LIGHT.terracotta, textAlign: "center", fontSize: 12, fontWeight: "800", marginTop: 15 },
  error: { color: LIGHT.error, textAlign: "center", lineHeight: 18, fontSize: 11, marginTop: 12 },
  demoNote: { color: LIGHT.slate, backgroundColor: LIGHT.primaryContainer, borderRadius: 10, padding: 9, textAlign: "center", lineHeight: 16, fontSize: 10, marginTop: 12 },
  disclaimer: { color: LIGHT.slate, textAlign: "center", lineHeight: 18, fontSize: 11, marginTop: 18, paddingHorizontal: 8 },
  verified: { alignItems: "center", paddingTop: 52 },
  verifiedTitle: { color: LIGHT.inkNavy, fontSize: 16, fontWeight: "800", textAlign: "center", maxWidth: 250, marginTop: 14 },
});
