import { Image, StyleSheet, type ImageSourcePropType, type ImageStyle } from "react-native";

type LogoProps = {
  variant?: "mark" | "horizontal";
  dark?: boolean;
  width?: number;
  height?: number;
  accessibilityLabel?: string;
  style?: ImageStyle;
};

const MARK: ImageSourcePropType = require("../assets/brand/ekta-mark.png");
const HORIZONTAL: ImageSourcePropType = require("../assets/brand/ekta-logo-horizontal.png");
const HORIZONTAL_DARK: ImageSourcePropType = require("../assets/brand/ekta-logo-horizontal-on-dark.png");

export function Logo({ variant = "horizontal", dark = false, width, height, accessibilityLabel = "eKta", style }: LogoProps) {
  const isMark = variant === "mark";
  const source = isMark ? MARK : (dark ? HORIZONTAL_DARK : HORIZONTAL);
  const defaultWidth = isMark ? 40 : 128;
  const defaultHeight = isMark ? 40 : 40;
  return <Image source={source} resizeMode="contain" accessible accessibilityLabel={accessibilityLabel} style={[styles.image, { width: width ?? defaultWidth, height: height ?? defaultHeight }, style]} />;
}

const styles = StyleSheet.create({ image: { flexShrink: 0 }, });
