import { Image, StyleSheet, Text, View, type ImageSourcePropType, type ImageStyle, type ViewStyle } from "react-native";
import { useLanguage } from "@/lib/apongram/LanguageContext";

type LogoProps = {
  variant?: "mark" | "horizontal";
  dark?: boolean;
  width?: number;
  height?: number;
  accessibilityLabel?: string;
  style?: ViewStyle | ImageStyle;
};

const MARK: ImageSourcePropType = require("../assets/brand/ekta-mark.png");

export function Logo({ variant = "horizontal", dark = false, width, height, accessibilityLabel, style }: LogoProps) {
  const { language } = useLanguage();
  const brandName = language === "bn" ? "একতা" : "eKta Social";
  const isMark = variant === "mark";
  const logoWidth = width ?? (isMark ? 40 : 156);
  const logoHeight = height ?? 40;
  const markSize = isMark ? Math.min(logoWidth, logoHeight) : Math.min(logoHeight * 0.86, logoWidth * 0.28);
  const label = accessibilityLabel ?? brandName;

  if (isMark) {
    return <Image source={MARK} resizeMode="contain" accessible accessibilityLabel={label} style={[styles.mark, { width: markSize, height: markSize }, style as ImageStyle]} />;
  }

  return <View accessible accessibilityLabel={label} style={[styles.row, { width: logoWidth, height: logoHeight }, style as ViewStyle]}>
    <Image source={MARK} resizeMode="contain" accessible={false} style={[styles.mark, { width: markSize, height: markSize }]} />
    <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65} style={[styles.wordmark, { color: dark ? "#FBF6EC" : "#14213D", fontFamily: language === "bn" ? "NotoSerifBengaliBold" : "Fraunces", fontSize: Math.min(20, logoHeight * 0.58) }]}>{brandName}</Text>
  </View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 0 },
  mark: { flexShrink: 0 },
  wordmark: { flexShrink: 1, fontWeight: "800", letterSpacing: -0.35, includeFontPadding: false },
});
