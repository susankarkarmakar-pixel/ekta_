import { Image, StyleSheet, Text, View } from "react-native";
import type { Profile } from "@/lib/apongram/types";

export function Avatar({ profile, size = 44 }: { profile: Profile; size?: number }) {
  return profile.avatarUrl ? (
    <Image source={{ uri: profile.avatarUrl }} style={{ width: size, height: size, borderRadius: size / 2 }} />
  ) : (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: profile.avatarColor }]}>
      <Text style={[styles.initials, { fontSize: Math.max(12, size * 0.33) }]}>{profile.initials}</Text>
    </View>
  );
}
const styles = StyleSheet.create({ avatar: { alignItems: "center", justifyContent: "center" }, initials: { color: "#FFF9F2", fontWeight: "800" } });
