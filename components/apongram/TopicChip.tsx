import { Pressable, StyleSheet, Text } from "react-native";

export function TopicChip({ label, onPress }: { label: string; onPress?: () => void }) {
  return <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`#${label}`} style={({ pressed }) => [styles.chip, pressed && styles.pressed]}><Text style={styles.hash}>#</Text><Text style={styles.label}>{label}</Text></Pressable>;
}
const styles = StyleSheet.create({ chip: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FFF8EF", borderWidth: 1, borderColor: "#F0D8C8", borderRadius: 999, paddingHorizontal: 13, paddingVertical: 9, marginRight: 8 }, pressed: { opacity: 0.76, transform: [{ scale: 0.97 }] }, hash: { color: "#B85E41", fontSize: 12, fontWeight: "900" }, label: { color: "#80553C", fontSize: 11, fontWeight: "800" } });
