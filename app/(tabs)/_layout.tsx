import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, type ColorValue } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HapticTab } from "@/components/haptic-tab";
import { useLanguage } from "@/lib/apongram/LanguageContext";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { copy } = useLanguage();
  const bottomPadding = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 8);
  const icon = (name: React.ComponentProps<typeof MaterialIcons>["name"]) =>
    function TabIcon({ color, size }: { color: ColorValue; size: number }) {
      return <MaterialIcons name={name} color={color} size={name === "add-circle" ? Math.max(size + 5, 27) : size} />;
    };

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: "#C85A3A",
      tabBarInactiveTintColor: "#9A9080",
      tabBarButton: HapticTab,
      tabBarLabelStyle: { fontSize: 10, fontWeight: "700" },
      tabBarStyle: { paddingTop: 7, paddingBottom: bottomPadding, height: 56 + bottomPadding, backgroundColor: "#FFFFFF", borderTopColor: "#E3DACB", borderTopWidth: 1 },
    }}>
      <Tabs.Screen name="index" options={{ title: copy.home, tabBarIcon: icon("home-filled") }} />
      <Tabs.Screen name="reels" options={{ title: copy.reels, tabBarIcon: icon("movie") }} />
      <Tabs.Screen name="discover" options={{ title: copy.discover, tabBarIcon: icon("search") }} />
      <Tabs.Screen name="create" options={{ title: copy.create, tabBarIcon: icon("add-circle") }} />
      <Tabs.Screen name="alerts" options={{ title: copy.alerts, tabBarIcon: icon("notifications-none") }} />
      <Tabs.Screen name="profile" options={{ title: copy.profile, tabBarIcon: icon("person-outline") }} />
    </Tabs>
  );
}
