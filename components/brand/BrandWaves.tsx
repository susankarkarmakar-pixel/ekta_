import { Path, Svg } from "react-native-svg";
import { StyleSheet, View } from "react-native";

export function TopBrandWave() {
  return (
    <Svg width="100%" height={190} viewBox="0 0 400 190" preserveAspectRatio="none" style={styles.top}>
      <Path d="M0 0H400V31C343 35 291 34 232 62C159 97 88 152 0 164Z" fill="#F8DAB8" />
      <Path d="M0 0H258C224 20 206 49 163 79C112 115 53 143 0 151Z" fill="#F3BC72" opacity={0.72} />
    </Svg>
  );
}

export function BottomBrandWave() {
  return (
    <Svg width="100%" height={190} viewBox="0 0 400 190" preserveAspectRatio="none" style={styles.bottom}>
      <Path d="M0 190V151C62 135 118 142 174 124C249 99 298 125 400 55V190Z" fill="#E5F0E4" />
      <Path d="M400 190H279C315 165 348 134 400 105Z" fill="#4CB57A" opacity={0.76} />
    </Svg>
  );
}

export function BrandWaves() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <TopBrandWave />
      <BottomBrandWave />
    </View>
  );
}

const styles = StyleSheet.create({
  top: { position: "absolute", top: 0, left: 0, right: 0 },
  bottom: { position: "absolute", bottom: 0, left: 0, right: 0 },
});
