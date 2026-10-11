import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { sendPhoneOtp, SupabaseAuthError, verifyPhoneOtp } from "@/lib/apongram/supabase-auth";
import { supabaseConfig } from "@/lib/apongram/supabase-config";
import { useLanguage } from "@/lib/apongram/LanguageContext";

export default function PhoneAuthScreen() {
  const router = useRouter();
  const { copy, language, toggleLanguage } = useLanguage();
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
    <ScreenContainer safeAreaClassName="bg-[#FBF7F0]" className="bg-[#FBF7F0]">
      <View style={styles.container}>
        <View style={styles.top}>
          <Pressable onPress={() => router.back()} style={styles.back} accessibilityLabel={copy.back}>
            <MaterialIcons name="arrow-back" size={22} color="#6B6153" />
            <Text style={styles.backText}>{copy.back}</Text>
          </Pressable>
          <Pressable onPress={toggleLanguage} style={styles.language} accessibilityLabel="Switch language">
            <Text style={styles.languageText}>{language === "bn" ? "বাং · EN" : "EN · বাং"}</Text>
          </Pressable>
        </View>
        <View style={styles.hero}>
          <View style={styles.landscape}><View style={styles.landscapeSun} /><View style={styles.landscapeHillBack} /><View style={styles.landscapeHillFront} /></View>
          <View style={styles.brandRow}><Text style={styles.brand}>eKta</Text><View style={styles.brandDots}><View style={styles.terraDot} /><View style={styles.greenDot} /></View></View>
          <Text style={styles.tagline}>{language === "bn" ? "একতায় আমরা · your community, connected" : "Your community, connected"}</Text>
          <View style={styles.localPill}><View style={styles.dot} /><Text style={styles.localText}>{language === "bn" ? "আপনার স্থানীয় প্রতিবেশী নেটওয়ার্ক" : "Your local neighborhood network"}</Text></View>
        </View>
        {verified ? (
          <View style={styles.verified}>
            <MaterialIcons name="check-circle" size={48} color="#1F6F6B" />
            <Text style={styles.verifiedTitle}>{copy.verifiedMessage}</Text>
            <Pressable onPress={() => router.replace("/")} style={styles.button}><Text style={styles.buttonText}>{copy.home}</Text></Pressable>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.label}>{sent ? copy.otpLabel : copy.phoneLabel}</Text>
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
                style={[styles.otpBox, otpDigits[index] && styles.otpBoxFilled, index === otpDigits.length && styles.otpBoxActive]}
              />)}
            </View> : <View style={styles.inputWrap}>
              <View style={styles.prefix}><Text style={styles.prefixText}>+91</Text></View>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="number-pad"
                placeholder={copy.phonePlaceholder.replace("+91 ", "")}
                placeholderTextColor="#9A9080"
                style={styles.input}
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
              <Text style={styles.buttonText}>{busy ? (language === "bn" ? "অপেক্ষা করুন..." : "Please wait...") : sent ? copy.verify : resendIn ? `${copy.resend} (${resendIn}s)` : copy.sendOtp}</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
            </Pressable>
            {sent && <Pressable onPress={() => { setSent(false); setOtp(""); setError(""); }} disabled={busy}><Text style={styles.resend}>{copy.resend}</Text></Pressable>}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {!supabaseConfig.isConfigured && <Text style={styles.demoNote}>{copy.demoModeText}</Text>}
            <Text style={styles.disclaimer}>{language === "bn" ? "সাইন ইন করে আপনি আমাদের কমিউনিটি নির্দেশিকা ও প্রতিবেশীর গোপনীয়তা নীতিতে সম্মতি দিচ্ছেন।" : "By signing in, you agree to our community guidelines and neighborhood privacy charter."}</Text>
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
  backText: { color: "#6B6153", fontSize: 12, fontWeight: "700" },
  language: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E3DACB", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  languageText: { color: "#C85A3A", fontSize: 11, fontWeight: "800" },
  hero: { alignItems: "center", paddingTop: 70 },
  landscape: { width: "100%", height: 150, borderRadius: 20, backgroundColor: "#F3DCCF", overflow: "hidden", position: "relative" },
  landscapeSun: { position: "absolute", right: 48, top: 24, width: 40, height: 40, borderRadius: 20, backgroundColor: "#E0A24A" },
  landscapeHillBack: { position: "absolute", left: -20, right: -20, bottom: -42, height: 94, borderRadius: 90, backgroundColor: "#2E6B4A", transform: [{ scaleX: 1.25 }] },
  landscapeHillFront: { position: "absolute", left: -20, right: -20, bottom: -64, height: 100, borderRadius: 90, backgroundColor: "#1F4D35", transform: [{ scaleX: 1.15 }] },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 16 },
  brand: { color: "#14213D", fontFamily: "Georgia", fontSize: 42, fontWeight: "700" },
  brandDots: { gap: 3, marginTop: 6 },
  terraDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#B4492A", marginLeft: 5 },
  greenDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#2E6B4A" },
  tagline: { color: "#6B6153", textAlign: "center", lineHeight: 23, fontSize: 15, marginTop: 7 },
  localPill: { borderWidth: 1, borderColor: "#E3DACB", borderRadius: 999, backgroundColor: "#FFFFFF", paddingHorizontal: 13, paddingVertical: 8, marginTop: 22, flexDirection: "row", alignItems: "center", gap: 7 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#1F6F6B" },
  localText: { color: "#6B6153", fontSize: 11 },
  form: { marginTop: "auto", paddingBottom: 24 },
  label: { color: "#1E1B16", fontWeight: "800", fontSize: 13, marginBottom: 8 },
  inputWrap: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E3DACB", borderRadius: 14, height: 54, flexDirection: "row", alignItems: "center", marginBottom: 15 },
  prefix: { height: "100%", justifyContent: "center", paddingHorizontal: 15, borderRightWidth: 1, borderRightColor: "#E3DACB" },
  prefixText: { color: "#1E1B16", fontSize: 15, fontWeight: "700" },
  input: { flex: 1, color: "#1E1B16", fontSize: 16, paddingHorizontal: 14 },
  otpRow: { flexDirection: "row", gap: 8, marginBottom: 15 },
  otpBox: { width: 46, height: 56, padding: 0, borderWidth: 1.5, borderColor: "#D8CDB6", borderRadius: 12, backgroundColor: "#FFFDF8", color: "#14213D", fontSize: 24, fontWeight: "600", textAlign: "center" },
  otpBoxFilled: { borderColor: "#14213D" },
  otpBoxActive: { borderWidth: 2, borderColor: "#B4492A" },
  button: { backgroundColor: "#C85A3A", borderRadius: 12, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 9, paddingVertical: 15 },
  disabled: { opacity: 0.42 },
  buttonText: { color: "#FFF", fontWeight: "800", fontSize: 14 },
  resend: { color: "#C85A3A", textAlign: "center", fontSize: 12, fontWeight: "800", marginTop: 15 },
  error: { color: "#B63D2A", textAlign: "center", lineHeight: 18, fontSize: 11, marginTop: 12 },
  demoNote: { color: "#6B6153", backgroundColor: "#F3DCD2", borderRadius: 10, padding: 9, textAlign: "center", lineHeight: 16, fontSize: 10, marginTop: 12 },
  disclaimer: { color: "#6B6153", textAlign: "center", lineHeight: 18, fontSize: 11, marginTop: 18, paddingHorizontal: 8 },
  verified: { alignItems: "center", paddingTop: 52 },
  verifiedTitle: { color: "#1E1B16", fontSize: 16, fontWeight: "800", textAlign: "center", maxWidth: 250, marginTop: 14 },
});
