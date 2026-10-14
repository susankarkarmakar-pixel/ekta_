import { useMemo, useState } from "react";
import { PanResponder, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/theme";

type AccessibleSliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  valueText?: string;
  fontFamily?: string;
  increaseActionLabel?: string;
  decreaseActionLabel?: string;
  onValueChange: (value: number) => void;
};

const accent = Colors.light.terracotta;
const fillColor = Colors.light.leafGreen;

export function AccessibleSlider({
  label,
  value,
  min,
  max,
  step = 1,
  valueText,
  fontFamily,
  increaseActionLabel = "Increase",
  decreaseActionLabel = "Decrease",
  onValueChange,
}: AccessibleSliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const range = Math.max(0, max - min);
  const safeStep = Math.max(0.01, step);
  const safeValue = Math.max(min, Math.min(max, value));
  const progress = range === 0 ? 0 : ((safeValue - min) / range) * 100;

  const updateFromPosition = (x: number) => {
    if (trackWidth <= 0 || range <= 0) return;
    const ratio = Math.max(0, Math.min(1, x / trackWidth));
    const rawValue = min + ratio * range;
    const steppedValue = min + Math.round((rawValue - min) / safeStep) * safeStep;
    const next = Math.max(min, Math.min(max, Number(steppedValue.toFixed(2))));
    onValueChange(next);
  };

  const panResponder = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => range > 0,
      onMoveShouldSetPanResponder: () => range > 0,
      onPanResponderGrant: (event) => updateFromPosition(event.nativeEvent.locationX),
      onPanResponderMove: (event) => updateFromPosition(event.nativeEvent.locationX),
    }),
    // updateFromPosition intentionally reads the latest width and callback through this render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trackWidth, min, max, safeStep, onValueChange],
  );

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <Text style={[styles.label, fontFamily ? { fontFamily } : undefined]}>{label}</Text>
        <Text style={[styles.value, fontFamily ? { fontFamily } : undefined]}>{valueText ?? String(safeValue)}</Text>
      </View>
      <View
        {...panResponder.panHandlers}
        onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
        style={styles.touchArea}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min: Math.round(min), max: Math.round(max), now: Math.round(safeValue) }}
        accessibilityActions={[
          { name: "increment", label: increaseActionLabel },
          { name: "decrement", label: decreaseActionLabel },
        ]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === "increment") onValueChange(Math.min(max, safeValue + safeStep));
          if (event.nativeEvent.actionName === "decrement") onValueChange(Math.max(min, safeValue - safeStep));
        }}
      >
        <View style={styles.rail}>
          <View style={[styles.fill, { width: `${progress}%` }]} />
          <View style={[styles.thumb, { left: `${progress}%` }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8 },
  heading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { color: Colors.light.slate, fontSize: 11, fontWeight: "700" },
  value: { color: Colors.light.inkNavy, fontSize: 11, fontWeight: "800" },
  touchArea: { height: 44, justifyContent: "center" },
  rail: { height: 6, borderRadius: 999, backgroundColor: "#E8E2D7", position: "relative" },
  fill: { height: 6, borderRadius: 999, backgroundColor: fillColor },
  thumb: {
    position: "absolute",
    top: -6,
    width: 18,
    height: 18,
    marginLeft: -9,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: Colors.light.paper,
    backgroundColor: accent,
    shadowColor: Colors.light.inkNavy,
    shadowOpacity: 0.18,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
});
