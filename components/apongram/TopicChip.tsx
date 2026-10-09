import { Pressable, StyleSheet, Text } from "react-native";

export function TopicChip({ label, onPress }: { label: string; onPress?: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, pressed && styles.pressed]}><Text style={styles.label}>{label}</Text></Pressable>;
}
const styles = StyleSheet.create({ chip: { backgroundColor: "#F3DCD2", borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8 }, pressed: { opacity: 0.7 }, label: { color: "#80553C", fontSize: 12, fontWeight: "700" } });
