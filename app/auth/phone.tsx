import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Logo } from "@/components/Logo";
import { ScreenContainer } from "@/components/screen-container";
import { Colors } from "@/constants/theme";
import { completeSupabaseRedirect, getGoogleOAuthUrl, getSupabaseSession, sendEmailOtp, SupabaseAuthError, verifyEmailOtp } from "@/lib/apongram/supabase-auth";
import { supabaseConfig } from "@/lib/apongram/supabase-config";
import { getStoredProfile, syncProfileToSupabase } from "@/lib/apongram/profile-store";
import { useLanguage } from "@/lib/apongram/LanguageContext";

const LIGHT = Colors.light;

function getEmailAuthRedirectUrl(): string {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return new URL("/auth/phone", window.location.origin).toString();
  }
  return Linking.createURL("auth/phone");
}

function AuthBackdrop({ width, height }: { width: number; height: number }) {
  const w = Math.max(width, 1);
  const h = Math.max(height, 1);
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={StyleSheet.absoluteFill} pointerEvents="none">
      <Path d={`M0 0 H${w * 0.48} C${w * 0.38} ${h * 0.1}, ${w * 0.15} ${h * 0.12}, 0 ${h * 0.27} Z`} fill="#F6B66D" />
      <Path d={`M0 ${h * 0.06} C${w * 0.18} ${h * 0.17}, ${w * 0.3} ${h * 0.12}, ${w * 0.47} 0 H${w * 0.7} C${w * 0.53} ${h * 0.12}, ${w * 0.25} ${h * 0.19}, 0 ${h * 0.34} Z`} fill="#FBE6C6" />
      <Path d={`M0 ${h * 0.9} C${w * 0.18} ${h * 0.87}, ${w * 0.37} ${h * 0.93}, ${w * 0.57} ${h * 0.86} C${w * 0.78} ${h * 0.8}, ${w * 0.9} ${h * 0.74}, ${w} ${h * 0.7} V${h} H0 Z`} fill="#E5EFDB" />
      <Path d={`M0 ${h * 0.96} C${w * 0.2} ${h * 0.9}, ${w * 0.42} ${h * 0.98}, ${w * 0.63} ${h * 0.9} C${w * 0.82} ${h * 0.84}, ${w * 0.93} ${h * 0.79}, ${w} ${h * 0.76} V${h} H0 Z`} fill="#B7D9AA" />
      <Path d={`M0 ${h} C${w * 0.22} ${h * 0.95}, ${w * 0.42} ${h * 1.01}, ${w * 0.65} ${h * 0.95} C${w * 0.82} ${h * 0.9}, ${w * 0.93} ${h * 0.84}, ${w} ${h * 0.82} V${h} Z`} fill="#58A963" />
    </Svg>
  );
}

function HandshakeArtwork({ compact }: { compact: boolean }) {
  return (
    <View style={[styles.artwork, compact && styles.artworkCompact]} accessible={false}>
      <View style={[styles.ray, styles.rayOrange]} />
      <View style={[styles.ray, styles.rayOchre]} />
      <View style={[styles.ray, styles.rayGreen]} />
      <View style={[styles.sleeve, styles.sleeveOrange]} />
      <View style={[styles.sleeve, styles.sleeveGreen]} />
      <View style={styles.handshakeIconWrap}>
        <MaterialIcons name="handshake" size={compact ? 108 : 132} color="#17231E" />
      </View>
    </View>
  );
}

export default function PhoneAuthScreen() {
  const router = useRouter();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { copy, language, toggleLanguage } = useLanguage();
  const bodyFont = language === "bn" ? "HindSiliguri" : "HindSiliguriLatin";
  const mediumFont = language === "bn" ? "HindSiliguriSemiBold" : "HindSiliguriLatinSemiBold";
  const compact = windowHeight < 760 || windowWidth < 360;
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const otpRefs = useRef<(TextInput | null)[]>([]);
  const handledAuthRedirect = useRef<string | null>(null);

  useEffect(() => {
    getSupabaseSession().then((session) => {
      if (session?.user?.id) router.replace("/(tabs)");
    }).catch(() => undefined);
  }, [router]);

  useEffect(() => {
    const handleAuthRedirect = async (url: string | null) => {
      if (!url || !/(?:access_token|refresh_token|error|error_description|error_code)=/.test(url)) return;
      if (handledAuthRedirect.current === url) return;
      handledAuthRedirect.current = url;
      setBusy(true);
      setError("");
      try {
        await completeSupabaseRedirect(url);
        const profile = await getStoredProfile();
        await syncProfileToSupabase(profile);
        router.replace("/(tabs)");
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : (language === "bn" ? "ইমেইল লিংক দিয়ে সাইন ইন সম্পূর্ণ করা যায়নি।" : "Email-link sign-in could not be completed."));
      } finally {
        setBusy(false);
      }
    };

    let subscription: ReturnType<typeof Linking.addEventListener> | undefined;
    if (Platform.OS === "web" && typeof window !== "undefined") {
      void handleAuthRedirect(window.location.href);
    } else {
      void Linking.getInitialURL().then(handleAuthRedirect).catch(() => undefined);
      subscription = Linking.addEventListener("url", ({ url }) => void handleAuthRedirect(url));
    }
    return () => subscription?.remove();
  }, [language, router]);

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
        setError(language === "bn" ? "বাস্তব ইমেইল OTP চালাতে Supabase URL ও publishable key configure করুন।" : "Email OTP is unavailable until the Supabase URL and publishable key are configured.");
        return;
      }
      await sendEmailOtp(email, getEmailAuthRedirectUrl());
      setSent(true);
      setOtp("");
      setResendIn(30);
    } catch (cause) {
      setError(cause instanceof SupabaseAuthError ? cause.message : (language === "bn" ? "OTP পাঠানো যায়নি। আবার চেষ্টা করুন।" : "We could not send the OTP. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const resendOtp = async () => {
    if (busy || resendIn > 0) return;
    setBusy(true);
    setError("");
    try {
      if (supabaseConfig.isConfigured) await sendEmailOtp(email, getEmailAuthRedirectUrl());
      setOtp("");
      setResendIn(30);
    } catch (cause) {
      setError(cause instanceof SupabaseAuthError ? cause.message : (language === "bn" ? "OTP পাঠানো যায়নি। আবার চেষ্টা করুন।" : "We could not send the OTP. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const signInWithGoogle = async () => {
    if (busy || !supabaseConfig.isConfigured) {
      if (!supabaseConfig.isConfigured) setError(language === "bn" ? "Google login চালুর আগে Supabase configure করুন।" : "Configure Supabase before using Google login.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const redirectTo = Linking.createURL("oauth/callback");
      const result = await WebBrowser.openAuthSessionAsync(getGoogleOAuthUrl(redirectTo), redirectTo);
      if (result.type !== "success" || !result.url) return;
      await completeSupabaseRedirect(result.url);
      const profile = await getStoredProfile();
      await syncProfileToSupabase(profile);
      router.replace("/(tabs)");
    } catch (cause) {
      setError(cause instanceof SupabaseAuthError ? cause.message : (language === "bn" ? "Google login সম্পূর্ণ করা যায়নি।" : "Google sign-in could not be completed."));
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (!supabaseConfig.isConfigured) throw new SupabaseAuthError(language === "bn" ? "বাস্তব ইমেইল OTP চালাতে Supabase URL ও publishable key configure করুন।" : "Email OTP is unavailable until the Supabase URL and publishable key are configured.");
      await verifyEmailOtp(otp, email);
      const profile = await getStoredProfile();
      await syncProfileToSupabase(profile);
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
  const canSend = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canVerify = otp.replace(/\D/g, "").length === 6;
  const pageMaxWidth = Math.min(Math.max(windowWidth - 36, 280), 520);

  return (
    <ScreenContainer safeAreaClassName="bg-ivory" className="bg-ivory">
      <View style={styles.root}>
        <AuthBackdrop width={windowWidth} height={windowHeight} />
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[styles.scrollContent, { minHeight: Math.max(windowHeight - 28, 600) }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.page, { width: pageMaxWidth }]}>
              <View style={styles.top}>
                <Pressable onPress={() => router.back()} style={styles.back} accessibilityRole="button" accessibilityLabel={copy.back}>
                  <MaterialIcons name="arrow-back" size={20} color={LIGHT.inkNavy} />
                  <Text style={[styles.backText, { fontFamily: mediumFont }]}>{copy.back}</Text>
                </Pressable>
                <Pressable onPress={toggleLanguage} style={styles.language} accessibilityRole="button" accessibilityLabel="Switch language">
                  <Text style={[styles.languageText, { fontFamily: mediumFont }]}>{language === "bn" ? "বাং · EN" : "EN · বাং"}</Text>
                </Pressable>
              </View>

              <View style={[styles.hero, compact && styles.heroCompact]}>
                <HandshakeArtwork compact={compact} />
                <View style={styles.brandRow}>
                  <Logo variant="horizontal" width={language === "bn" ? 190 : 220} height={46} />
                </View>
                <Text style={[styles.tagline, { fontFamily: bodyFont }]}>
                  {language === "bn" ? "আপনার কমিউনিটি, একসঙ্গে" : "Your Community, Connected"}
                </Text>
              </View>

              {!sent && !verified ? (
                <>
                  <Pressable
                    onPress={signInWithGoogle}
                    disabled={busy}
                    style={({ pressed }) => [styles.googleButton, busy && styles.disabled, pressed && styles.pressed]}
                    accessibilityRole="button"
                    accessibilityLabel={language === "bn" ? "Google দিয়ে চালিয়ে যান" : "Continue with Google"}
                  >
                    <MaterialCommunityIcons name="google" size={25} color="#4285F4" />
                    <Text style={[styles.googleButtonLabel, { fontFamily: mediumFont }]}>{language === "bn" ? "Google দিয়ে চালিয়ে যান" : "Continue with Google"}</Text>
                  </Pressable>
                  <View style={styles.separator}>
                    <View style={styles.separatorLine} />
                    <Text style={[styles.separatorText, { fontFamily: bodyFont }]}>{language === "bn" ? "অথবা" : "OR"}</Text>
                    <View style={styles.separatorLine} />
                  </View>
                </>
              ) : null}

              {verified ? (
                <View style={styles.verified}>
                  <View style={styles.successIcon}><MaterialIcons name="check" size={28} color="#FFF" /></View>
                  <Text style={[styles.verifiedTitle, { fontFamily: mediumFont }]}>{copy.verifiedMessage}</Text>
                  <Pressable onPress={() => router.replace("/")} style={styles.button} accessibilityRole="button">
                    <Text style={[styles.buttonText, { fontFamily: mediumFont }]}>{copy.home}</Text>
                    <MaterialIcons name="arrow-forward" size={21} color="#FFF" />
                  </Pressable>
                </View>
              ) : (
                <View style={styles.form}>
                  <Text style={[styles.label, { fontFamily: mediumFont }]}>{sent ? copy.otpLabel : (language === "bn" ? "ইমেইল ঠিকানা" : "Email address")}</Text>
                  {sent ? (
                    <>
                      <Text style={[styles.otpHint, { fontFamily: bodyFont }]}>
                        {language === "bn" ? `${email} ঠিকানায় পাঠানো ৬ সংখ্যার কোড লিখুন।` : `Enter the 6-digit code sent to ${email}.`}
                      </Text>
                      <View style={styles.otpRow} accessibilityRole="none">
                        {Array.from({ length: 6 }, (_, index) => (
                          <TextInput
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
                          />
                        ))}
                      </View>
                    </>
                  ) : (
                    <View style={styles.inputWrap}>
                      <MaterialIcons name="mail-outline" size={22} color="#8B8A86" style={styles.mailIcon} />
                      <TextInput
                        value={email}
                        onChangeText={setEmail}
                        onSubmitEditing={() => { if (canSend) void sendOtp(); }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        textContentType="emailAddress"
                        returnKeyType="send"
                        placeholder="you@example.com"
                        placeholderTextColor="#9A9A96"
                        style={[styles.input, { fontFamily: bodyFont }]}
                        maxLength={120}
                        editable={!busy}
                        accessibilityLabel={language === "bn" ? "ইমেইল ঠিকানা" : "Email address"}
                      />
                    </View>
                  )}

                  <Pressable
                    onPress={sent ? verifyOtp : sendOtp}
                    disabled={busy || (sent ? !canVerify : !canSend) || (!sent && resendIn > 0)}
                    style={({ pressed }) => [styles.button, (busy || (sent ? !canVerify : !canSend) || (!sent && resendIn > 0)) && styles.disabled, pressed && styles.pressed]}
                    accessibilityRole="button"
                    accessibilityLabel={sent ? copy.verify : copy.sendOtp}
                  >
                    <Text style={[styles.buttonText, { fontFamily: mediumFont }]}>
                      {busy ? (language === "bn" ? "অপেক্ষা করুন…" : "Please wait…") : sent ? copy.verify : resendIn ? `${copy.resend} (${resendIn}s)` : copy.sendOtp}
                    </Text>
                    <MaterialIcons name="arrow-forward" size={22} color="#FFF" />
                  </Pressable>

                  {sent ? (
                    <View style={styles.resendActions}>
                      <Pressable onPress={() => void resendOtp()} disabled={busy || resendIn > 0} accessibilityRole="button">
                        <Text style={[styles.resend, { fontFamily: mediumFont }, (busy || resendIn > 0) && styles.resendDisabled]}>{resendIn > 0 ? `${copy.resend} (${resendIn}s)` : copy.resend}</Text>
                      </Pressable>
                      <Pressable onPress={() => { setSent(false); setOtp(""); setError(""); }} disabled={busy} accessibilityRole="button">
                        <Text style={[styles.resend, { fontFamily: mediumFont }, busy && styles.resendDisabled]}>{language === "bn" ? "ইমেইল পরিবর্তন করুন" : "Change email"}</Text>
                      </Pressable>
                    </View>
                  ) : null}

                  {error ? <Text accessibilityRole="alert" style={[styles.error, { fontFamily: bodyFont }]}>{error}</Text> : null}
                  {!supabaseConfig.isConfigured ? <Text style={[styles.demoNote, { fontFamily: bodyFont }]}>{copy.demoModeText}</Text> : null}
                  <Text style={[styles.disclaimer, { fontFamily: bodyFont }]}>
                    {language === "bn" ? (
                      <>সাইন ইন করে আপনি আমাদের <Text style={styles.disclaimerEmphasis}>কমিউনিটি নির্দেশিকা</Text> ও <Text style={styles.disclaimerEmphasis}>প্রতিবেশীর গোপনীয়তা নীতি</Text>-তে সম্মতি দিচ্ছেন।</>
                    ) : (
                      <>By signing in, you agree to our <Text style={styles.disclaimerEmphasis}>Community Guidelines</Text> and <Text style={styles.disclaimerEmphasis}>Neighborhood Privacy Charter</Text>.</>
                    )}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFCF4", overflow: "hidden" },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 18, paddingTop: 6, paddingBottom: 26 },
  page: { flexGrow: 1, alignSelf: "center", justifyContent: "center" },
  top: { minHeight: 42, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 2 },
  back: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 42, paddingRight: 10 },
  backText: { color: LIGHT.inkNavy, fontSize: 12, fontWeight: "700" },
  language: { minHeight: 38, justifyContent: "center", backgroundColor: "rgba(255,255,255,0.74)", borderWidth: 1, borderColor: "#EAE1D3", borderRadius: 999, paddingHorizontal: 13, paddingVertical: 7 },
  languageText: { color: LIGHT.terracotta, fontSize: 11, fontWeight: "800" },
  hero: { alignItems: "center", paddingTop: 1, marginBottom: 19 },
  heroCompact: { marginBottom: 13 },
  artwork: { width: 260, height: 184, alignItems: "center", justifyContent: "center", position: "relative" },
  artworkCompact: { width: 226, height: 148 },
  ray: { position: "absolute", width: 12, height: 46, top: 5, borderRadius: 6 },
  rayOrange: { left: 57, top: 27, height: 38, backgroundColor: "#E86E32", transform: [{ rotate: "-43deg" }] },
  rayOchre: { left: 124, top: 4, height: 45, backgroundColor: "#E7AE3F", transform: [{ rotate: "-4deg" }] },
  rayGreen: { right: 55, top: 27, height: 38, backgroundColor: "#2E8B57", transform: [{ rotate: "43deg" }] },
  sleeve: { position: "absolute", bottom: 11, width: 104, height: 34, borderRadius: 10 },
  sleeveOrange: { left: 5, backgroundColor: "#E77B39", transform: [{ rotate: "-30deg" }] },
  sleeveGreen: { right: 5, backgroundColor: "#2D8A50", transform: [{ rotate: "30deg" }] },
  handshakeIconWrap: { width: 154, height: 118, borderRadius: 48, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,252,244,0.92)", transform: [{ rotate: "-2deg" }] },
  brandRow: { alignItems: "center", justifyContent: "center", marginTop: -5 },
  tagline: { color: "#676A72", textAlign: "center", lineHeight: 25, fontSize: 15, marginTop: 4, letterSpacing: 0.15 },
  googleButton: { minHeight: 58, backgroundColor: "rgba(255,255,255,0.92)", borderWidth: 1, borderColor: "#E5DED1", borderRadius: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 14, paddingHorizontal: 18, marginTop: 1, shadowColor: "#5C4E40", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  googleButtonLabel: { color: "#172238", fontSize: 15, fontWeight: "800" },
  separator: { flexDirection: "row", alignItems: "center", gap: 17, marginTop: 19, marginBottom: 18, paddingHorizontal: 6 },
  separatorLine: { flex: 1, height: 1, backgroundColor: "#DED9D0" },
  separatorText: { color: "#73747A", fontSize: 13, fontWeight: "700" },
  form: { paddingBottom: 6 },
  label: { color: "#30394A", fontWeight: "800", fontSize: 14, marginBottom: 9, marginLeft: 2 },
  inputWrap: { backgroundColor: "rgba(255,255,255,0.94)", borderWidth: 1, borderColor: "#E4DED4", borderRadius: 17, minHeight: 58, flexDirection: "row", alignItems: "center", marginBottom: 15, paddingHorizontal: 16 },
  mailIcon: { marginRight: 13 },
  input: { flex: 1, color: LIGHT.inkNavy, fontSize: 16, paddingVertical: 13 },
  otpHint: { color: LIGHT.slate, fontSize: 12, lineHeight: 18, marginTop: -3, marginBottom: 12 },
  otpRow: { flexDirection: "row", gap: 8, marginBottom: 15 },
  otpBox: { flex: 1, minWidth: 0, height: 56, padding: 0, borderWidth: 1.5, borderColor: "#E4DED4", borderRadius: 13, backgroundColor: "rgba(255,255,255,0.94)", color: LIGHT.inkNavy, fontSize: 23, fontWeight: "600", textAlign: "center" },
  otpBoxFilled: { borderColor: LIGHT.inkNavy },
  otpBoxActive: { borderWidth: 2, borderColor: "#D6815B" },
  button: { minHeight: 60, backgroundColor: "#D9825A", borderRadius: 17, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 11, paddingVertical: 14, paddingHorizontal: 18, shadowColor: "#A94E33", shadowOpacity: 0.16, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  disabled: { opacity: 0.48 },
  pressed: { opacity: 0.84 },
  buttonText: { color: "#FFFDF8", fontWeight: "800", fontSize: 16 },
  resendActions: { flexDirection: "row", justifyContent: "center", gap: 24, marginTop: 13 },
  resend: { color: LIGHT.terracotta, textAlign: "center", fontSize: 12, fontWeight: "800", paddingVertical: 5 },
  resendDisabled: { opacity: 0.45 },
  error: { color: LIGHT.error, textAlign: "center", lineHeight: 18, fontSize: 11, marginTop: 11 },
  demoNote: { color: LIGHT.slate, backgroundColor: "rgba(255,255,255,0.7)", borderWidth: 1, borderColor: "#EAE1D3", borderRadius: 12, padding: 10, textAlign: "center", lineHeight: 17, fontSize: 11, marginTop: 12 },
  disclaimer: { color: "#73747A", textAlign: "center", lineHeight: 20, fontSize: 11, marginTop: 20, paddingHorizontal: 8 },
  disclaimerEmphasis: { color: "#354356", fontWeight: "700" },
  verified: { alignItems: "center", paddingTop: 30, gap: 14 },
  successIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: LIGHT.leafGreen, alignItems: "center", justifyContent: "center" },
  verifiedTitle: { color: LIGHT.inkNavy, fontSize: 16, textAlign: "center", maxWidth: 300, marginBottom: 4 },
});
