import { useEffect, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Colors } from "@/constants/theme";

const C = Colors.light;

export function FeedSkeleton() {
  const [opacity] = useState(() => new Animated.Value(0.42));
  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(opacity, { toValue: 0.9, duration: 750, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0.42, duration: 750, useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [opacity]);
  return <View accessibilityLabel="Loading feed" accessible>
    {[0, 1].map((item) => <Animated.View key={item} style={[styles.card, { opacity }]}>
      <View style={styles.header}><View style={styles.avatar} /><View style={styles.headerCopy}><View style={styles.name} /><View style={styles.meta} /></View><View style={styles.menu} /></View>
      <View style={styles.lineWide} /><View style={styles.line} /><View style={styles.media} /><View style={styles.location} /><View style={styles.tags}><View style={styles.tag} /><View style={styles.tagShort} /></View><View style={styles.actions}><View style={styles.action} /><View style={styles.action} /><View style={styles.actionSmall} /></View>
    </Animated.View>)}
  </View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: C.paper, borderRadius: 22, padding: 15, marginBottom: 16, borderWidth: 1, borderColor: C.line },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: C.line },
  headerCopy: { flex: 1, gap: 7 },
  menu: { width: 24, height: 10, borderRadius: 5, backgroundColor: C.primaryContainer },
  name: { width: "42%", height: 12, borderRadius: 6, backgroundColor: C.line },
  meta: { width: "28%", height: 9, borderRadius: 5, backgroundColor: C.primaryContainer },
  lineWide: { width: "92%", height: 13, borderRadius: 7, backgroundColor: C.primaryContainer, marginTop: 17 },
  line: { width: "68%", height: 13, borderRadius: 7, backgroundColor: C.primaryContainer, marginTop: 8 },
  media: { width: "100%", aspectRatio: 4 / 3, borderRadius: 18, backgroundColor: C.line, marginTop: 13 },
  location: { width: 106, height: 20, borderRadius: 999, backgroundColor: C.primaryContainer, marginTop: 10 },
  tags: { flexDirection: "row", gap: 6, marginTop: 11 },
  tag: { width: 72, height: 22, borderRadius: 999, backgroundColor: C.primaryContainer },
  tagShort: { width: 58, height: 22, borderRadius: 999, backgroundColor: C.primaryContainer },
  actions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 13, paddingVertical: 4, paddingHorizontal: 3, borderRadius: 15, backgroundColor: C.primaryContainer },
  action: { width: "23%", height: 12, borderRadius: 6, backgroundColor: C.primaryContainer },
  actionSmall: { width: "12%", height: 12, borderRadius: 6, backgroundColor: C.primaryContainer },
});
