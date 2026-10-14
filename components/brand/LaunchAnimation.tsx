import { useEffect, useRef, useState } from "react";

/* Animated.Value refs are intentionally stable animation handles. */
/* eslint-disable react-hooks/refs */
import { AccessibilityInfo, Animated, Easing, Image, Platform, StyleSheet, Text, View } from "react-native";
import { useLanguage } from "@/lib/apongram/LanguageContext";

type LaunchAnimationProps = {
  onFinished: () => void;
};

const C = {
  background: "#FBF7F0",
  ink: "#1E1B16",
  muted: "#6B6153",
  terra: "#C85A3A",
  green: "#1F6F6B",
};

export function LaunchAnimation({ onFinished }: LaunchAnimationProps) {
  const { language } = useLanguage();
  const brandName = language === "bn" ? "একতা" : "eKta Social";
  const [reducedMotion, setReducedMotion] = useState(false);
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.86)).current;
  const nameOpacity = useRef(new Animated.Value(0)).current;
  const nameY = useRef(new Animated.Value(10)).current;
  const companyOpacity = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active) setReducedMotion(enabled);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const duration = reducedMotion ? 240 : 420;
    const sequence = reducedMotion
      ? Animated.sequence([
          Animated.parallel([
            Animated.timing(logoOpacity, { toValue: 1, duration, useNativeDriver: Platform.OS !== "web" }),
            Animated.timing(nameOpacity, { toValue: 1, duration, useNativeDriver: Platform.OS !== "web" }),
            Animated.timing(companyOpacity, { toValue: 1, duration, useNativeDriver: Platform.OS !== "web" }),
          ]),
          Animated.delay(220),
          Animated.timing(overlayOpacity, { toValue: 0, duration: 260, useNativeDriver: Platform.OS !== "web" }),
        ])
      : Animated.sequence([
          Animated.parallel([
            Animated.timing(logoOpacity, { toValue: 1, duration, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== "web" }),
            Animated.spring(logoScale, { toValue: 1, friction: 8, tension: 55, useNativeDriver: Platform.OS !== "web" }),
          ]),
          Animated.parallel([
            Animated.timing(nameOpacity, { toValue: 1, duration: 360, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== "web" }),
            Animated.timing(nameY, { toValue: 0, duration: 360, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== "web" }),
          ]),
          Animated.timing(companyOpacity, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== "web" }),
          Animated.delay(520),
          Animated.timing(overlayOpacity, { toValue: 0, duration: 420, easing: Easing.inOut(Easing.cubic), useNativeDriver: Platform.OS !== "web" }),
        ]);

    sequence.start(({ finished }) => {
      if (finished) onFinished();
    });
    return () => sequence.stop();
  }, [companyOpacity, logoOpacity, logoScale, nameOpacity, nameY, onFinished, overlayOpacity, reducedMotion]);

  return (
    <Animated.View accessibilityRole="alert" accessibilityLabel={`${brandName}. Sanket Pixel Technologies.`} style={[styles.overlay, { opacity: overlayOpacity }]}>
      <View style={styles.brandLockup}>
        <View style={styles.logoHalo}>
          <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
            <Image source={require("@/assets/images/splash-icon.png")} style={styles.logo} resizeMode="contain" />
          </Animated.View>
          <View style={[styles.dot, styles.dotTerra]} />
          <View style={[styles.dot, styles.dotGreen]} />
        </View>
        <Animated.View style={{ opacity: nameOpacity, transform: [{ translateY: nameY }] }}>
          <Text style={[styles.name, language === "bn" && styles.nameBn]}>{brandName}</Text>
        </Animated.View>
      </View>
      <Animated.Text style={[styles.footer, { opacity: companyOpacity }]}>Sanket Pixel Technologies</Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFill, zIndex: 999, elevation: 999, backgroundColor: C.background, alignItems: "center", justifyContent: "center" },
  brandLockup: { alignItems: "center", justifyContent: "center", marginTop: -30 },
  logoHalo: { width: 142, height: 142, alignItems: "center", justifyContent: "center", position: "relative" },
  logo: { width: 112, height: 112 },
  dot: { position: "absolute", width: 14, height: 14, borderRadius: 7 },
  dotTerra: { top: 11, right: 15, backgroundColor: C.terra },
  dotGreen: { bottom: 15, left: 13, backgroundColor: C.green },
  name: { color: C.ink, fontFamily: "Georgia", fontSize: 31, fontWeight: "700", letterSpacing: -0.5, marginTop: 4 },
  nameBn: { fontFamily: "NotoSerifBengaliBold", letterSpacing: 0, fontSize: 29 },
  footer: { position: "absolute", bottom: 28, color: C.muted, fontSize: 11, fontWeight: "700", letterSpacing: 0.7 },
});
