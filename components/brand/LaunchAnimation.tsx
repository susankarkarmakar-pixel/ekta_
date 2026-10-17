import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Platform, StyleSheet, View, useWindowDimensions } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useLanguage } from "@/lib/apongram/LanguageContext";

/* Animated.Value refs are intentionally stable animation handles. */
/* eslint-disable react-hooks/refs */

type LaunchAnimationProps = {
  onFinished: () => void;
};

const C = {
  background: "#FFFCF4",
  ink: "#1E1B16",
  muted: "#6B6153",
  saffron: "#E97839",
  gold: "#E7AE3F",
  green: "#27824D",
};

function SplashWaves({ width, height, topOpacity, bottomOpacity, topY, bottomY }: {
  width: number;
  height: number;
  topOpacity: Animated.Value;
  bottomOpacity: Animated.Value;
  topY: Animated.Value;
  bottomY: Animated.Value;
}) {
  const w = Math.max(width, 1);
  const h = Math.max(height, 1);
  return (
    <>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: topOpacity, transform: [{ translateY: topY }] }]}>
        <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
          <Path d={`M0 0 H${w * 0.48} C${w * 0.38} ${h * 0.1}, ${w * 0.15} ${h * 0.12}, 0 ${h * 0.27} Z`} fill="#F6B66D" />
          <Path d={`M0 ${h * 0.06} C${w * 0.18} ${h * 0.17}, ${w * 0.3} ${h * 0.12}, ${w * 0.47} 0 H${w * 0.7} C${w * 0.53} ${h * 0.12}, ${w * 0.25} ${h * 0.19}, 0 ${h * 0.34} Z`} fill="#FBE6C6" />
        </Svg>
      </Animated.View>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: bottomOpacity, transform: [{ translateY: bottomY }] }]}>
        <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
          <Path d={`M0 ${h * 0.9} C${w * 0.18} ${h * 0.87}, ${w * 0.37} ${h * 0.93}, ${w * 0.57} ${h * 0.86} C${w * 0.78} ${h * 0.8}, ${w * 0.9} ${h * 0.74}, ${w} ${h * 0.7} V${h} H0 Z`} fill="#E5EFDB" />
          <Path d={`M0 ${h * 0.96} C${w * 0.2} ${h * 0.9}, ${w * 0.42} ${h * 0.98}, ${w * 0.63} ${h * 0.9} C${w * 0.82} ${h * 0.84}, ${w * 0.93} ${h * 0.79}, ${w} ${h * 0.76} V${h} H0 Z`} fill="#B7D9AA" />
          <Path d={`M0 ${h} C${w * 0.22} ${h * 0.95}, ${w * 0.42} ${h * 1.01}, ${w * 0.65} ${h * 0.95} C${w * 0.82} ${h * 0.9}, ${w * 0.93} ${h * 0.84}, ${w} ${h * 0.82} V${h} Z`} fill="#58A963" />
        </Svg>
      </Animated.View>
    </>
  );
}

export function LaunchAnimation({ onFinished }: LaunchAnimationProps) {
  const { width, height } = useWindowDimensions();
  const { language } = useLanguage();
  const brandName = language === "bn" ? "একতা" : "eKta Social";
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  const topWaveOpacity = useRef(new Animated.Value(0)).current;
  const bottomWaveOpacity = useRef(new Animated.Value(0)).current;
  const topWaveY = useRef(new Animated.Value(-18)).current;
  const bottomWaveY = useRef(new Animated.Value(18)).current;
  const accentOpacity = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;
  const accentScale = useRef([new Animated.Value(0.65), new Animated.Value(0.65), new Animated.Value(0.65)]).current;
  const artOpacity = useRef(new Animated.Value(0)).current;
  const artScale = useRef(new Animated.Value(0.82)).current;
  const nameOpacity = useRef(new Animated.Value(0)).current;
  const nameY = useRef(new Animated.Value(12)).current;
  const underlineOpacity = useRef(new Animated.Value(0)).current;
  const underlineScale = useRef(new Animated.Value(0.72)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineY = useRef(new Animated.Value(7)).current;
  const loaderOpacity = useRef(new Animated.Value(0)).current;
  const loaderPulse = useRef([new Animated.Value(0.55), new Animated.Value(0.55), new Animated.Value(0.55)]).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  const overlayY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active) setReducedMotion(enabled);
    }).catch(() => {
      if (active) setReducedMotion(false);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (reducedMotion === null) return;
    const nativeDriver = Platform.OS !== "web";
    const timing = (value: Animated.Value, toValue: number, duration: number, easing = Easing.out(Easing.cubic)) =>
      Animated.timing(value, { toValue, duration, easing, useNativeDriver: nativeDriver });

    if (reducedMotion) {
      topWaveY.setValue(0);
      bottomWaveY.setValue(0);
      artScale.setValue(1);
      nameY.setValue(0);
      underlineScale.setValue(1);
      taglineY.setValue(0);
      loaderPulse.forEach((value) => value.setValue(0.75));
      accentScale.forEach((value) => value.setValue(1));
    }

    const revealAccents = Animated.stagger(65, accentOpacity.map((opacity, index) => Animated.parallel([
      timing(opacity, 1, 130),
      timing(accentScale[index], 1, 160, Easing.out(Easing.back(1.2))),
    ])));
    const revealLoader = Animated.parallel([
      timing(loaderOpacity, 1, 160),
      Animated.stagger(70, loaderPulse.map((value) => Animated.sequence([
        timing(value, 1, 115, Easing.out(Easing.cubic)),
        timing(value, 0.55, 125, Easing.inOut(Easing.cubic)),
      ]))),
    ]);

    const sequence = reducedMotion
      ? Animated.sequence([
          Animated.parallel([
            timing(backgroundOpacity, 1, 160),
            timing(topWaveOpacity, 1, 180),
            timing(bottomWaveOpacity, 1, 180),
            ...accentOpacity.map((value) => timing(value, 1, 180)),
            timing(artOpacity, 1, 200),
            timing(nameOpacity, 1, 200),
            timing(underlineOpacity, 1, 200),
            timing(taglineOpacity, 1, 200),
            timing(loaderOpacity, 1, 160),
          ]),
          Animated.delay(180),
          Animated.parallel([
            timing(overlayOpacity, 0, 220),
            timing(backgroundOpacity, 0, 220),
            timing(topWaveOpacity, 0, 220),
            timing(bottomWaveOpacity, 0, 220),
          ]),
        ])
      : Animated.sequence([
          timing(backgroundOpacity, 1, 180),
          Animated.parallel([
            timing(topWaveOpacity, 1, 240),
            timing(bottomWaveOpacity, 1, 250),
            timing(topWaveY, 0, 240),
            timing(bottomWaveY, 0, 250),
          ]),
          revealAccents,
          Animated.parallel([
            timing(artOpacity, 1, 350),
            Animated.spring(artScale, { toValue: 1, friction: 8, tension: 48, useNativeDriver: nativeDriver }),
          ]),
          Animated.parallel([
            timing(nameOpacity, 1, 280),
            timing(nameY, 0, 280),
          ]),
          Animated.parallel([
            timing(underlineOpacity, 1, 230),
            timing(underlineScale, 1, 250),
            timing(taglineOpacity, 1, 260),
            timing(taglineY, 0, 260),
          ]),
          revealLoader,
          Animated.delay(260),
          Animated.parallel([
            timing(overlayOpacity, 0, 340, Easing.inOut(Easing.cubic)),
            timing(overlayY, -14, 340),
            timing(backgroundOpacity, 0, 340),
            timing(topWaveOpacity, 0, 340),
            timing(bottomWaveOpacity, 0, 340),
          ]),
        ]);

    sequence.start(({ finished }) => {
      if (finished) onFinished();
    });
    return () => sequence.stop();
  }, [accentOpacity, accentScale, artOpacity, artScale, backgroundOpacity, bottomWaveOpacity, bottomWaveY, loaderOpacity, loaderPulse, nameOpacity, nameY, onFinished, overlayOpacity, overlayY, reducedMotion, taglineOpacity, taglineY, topWaveOpacity, topWaveY, underlineOpacity, underlineScale]);

  return (
    <View style={styles.host}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: C.background, opacity: backgroundOpacity }]} />
      <SplashWaves width={width} height={height} topOpacity={topWaveOpacity} bottomOpacity={bottomWaveOpacity} topY={topWaveY} bottomY={bottomWaveY} />
      <Animated.View accessibilityRole="alert" accessibilityLabel={`${brandName}. Your Community, Connected.`} accessibilityViewIsModal style={[styles.contentLayer, { opacity: overlayOpacity, transform: [{ translateY: overlayY }] }]}>
        <Animated.View style={[styles.artwork, { opacity: artOpacity, transform: [{ scale: artScale }] }]}>
          <Animated.View style={[styles.accentDot, styles.accentDotOrange, { opacity: accentOpacity[0], transform: [{ scale: accentScale[0] }] }]} />
          <Animated.View style={[styles.accentDot, styles.accentDotGold, { opacity: accentOpacity[1], transform: [{ scale: accentScale[1] }] }]} />
          <Animated.View style={[styles.accentDot, styles.accentDotGreen, { opacity: accentOpacity[2], transform: [{ scale: accentScale[2] }] }]} />
          <View style={[styles.sleeve, styles.sleeveOrange]} />
          <View style={[styles.sleeve, styles.sleeveGreen]} />
          <View style={styles.handshakeWrap}>
            <MaterialIcons name="handshake" size={Math.min(146, width * 0.38)} color={C.ink} />
          </View>
        </Animated.View>
        <Animated.Text style={[styles.name, language === "bn" && styles.nameBn, { opacity: nameOpacity, transform: [{ translateY: nameY }] }]}>
          {brandName}
        </Animated.Text>
        <Animated.View style={[styles.tricolorRule, { opacity: underlineOpacity, transform: [{ scaleX: underlineScale }] }]}>
          <View style={[styles.ruleSegment, styles.ruleSaffron]} />
          <View style={styles.ruleDot} />
          <View style={[styles.ruleSegment, styles.ruleGreen]} />
        </Animated.View>
        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity, transform: [{ translateY: taglineY }] }]}>Your Community, Connected</Animated.Text>
        <Animated.View style={[styles.loader, { opacity: loaderOpacity }]}>
          {loaderPulse.map((value, index) => (
            <Animated.View key={index} style={[styles.loaderDot, { backgroundColor: index === 0 ? C.saffron : index === 1 ? C.gold : C.green, opacity: value, transform: [{ scale: value }] }]} />
          ))}
        </Animated.View>
      </Animated.View>
      <Animated.Text style={[styles.footer, { opacity: nameOpacity }]}>Sanket Pixel Technologies</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  host: { ...StyleSheet.absoluteFill, zIndex: 999, elevation: 999, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  contentLayer: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 },
  artwork: { width: 250, height: 205, alignItems: "center", justifyContent: "center", position: "relative" },
  accentDot: { position: "absolute", width: 13, height: 13, borderRadius: 7 },
  accentDotOrange: { left: 45, top: 45, backgroundColor: C.saffron },
  accentDotGold: { top: 13, backgroundColor: C.gold },
  accentDotGreen: { right: 45, top: 45, backgroundColor: C.green },
  sleeve: { position: "absolute", bottom: 14, width: 104, height: 32, borderRadius: 10 },
  sleeveOrange: { left: -2, backgroundColor: C.saffron, transform: [{ rotate: "-31deg" }] },
  sleeveGreen: { right: -2, backgroundColor: C.green, transform: [{ rotate: "31deg" }] },
  handshakeWrap: { width: 158, height: 120, alignItems: "center", justifyContent: "center", borderRadius: 48, backgroundColor: "rgba(255,252,244,0.88)", transform: [{ rotate: "-2deg" }] },
  name: { color: C.ink, fontFamily: "Fraunces", fontSize: 34, fontWeight: "700", letterSpacing: -0.5, marginTop: -2 },
  nameBn: { fontFamily: "NotoSerifBengaliBold", letterSpacing: 0, fontSize: 32 },
  tricolorRule: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 },
  ruleSegment: { width: 42, height: 5, borderRadius: 3 },
  ruleSaffron: { backgroundColor: C.saffron },
  ruleDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.gold },
  ruleGreen: { backgroundColor: C.green },
  tagline: { color: "#676A72", fontSize: 15, letterSpacing: 0.1, marginTop: 9 },
  loader: { height: 26, marginTop: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9 },
  loaderDot: { width: 8, height: 8, borderRadius: 4 },
  footer: { position: "absolute", bottom: 28, color: C.muted, fontSize: 11, fontWeight: "700", letterSpacing: 0.7 },
});
