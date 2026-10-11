import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
          <View style={styles.logo}><MaterialIcons name="diversity-3" size={30} color="#C85A3A" /></View>
          <Text style={styles.brand}>Ekta</Text>
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
            <View style={styles.inputWrap}>
              {!sent && <View style={styles.prefix}><Text style={styles.prefixText}>+91</Text></View>}
              <TextInput
                value={sent ? otp : phone}
                onChangeText={sent ? setOtp : setPhone}
                keyboardType="number-pad"
                placeholder={sent ? "123456" : copy.phonePlaceholder.replace("+91 ", "")}
                placeholderTextColor="#9A9080"
                style={styles.input}
                maxLength={sent ? 6 : 12}
                autoFocus
                editable={!busy}
              />
            </View>
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
  logo: { width: 74, height: 74, borderRadius: 37, backgroundColor: "#F3DCD2", alignItems: "center", justifyContent: "center" },
  brand: { color: "#C85A3A", fontFamily: "Georgia", fontSize: 54, fontWeight: "700", marginTop: 16 },
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
