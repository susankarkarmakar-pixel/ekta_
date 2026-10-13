/* eslint-disable @typescript-eslint/no-require-imports -- Expo font assets require static Metro imports. */
import "@/global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { WebView } from "react-native-webview";
import "@/lib/_core/nativewind-pressable";
import { ThemeProvider } from "@/lib/theme-provider";
import { LanguageProvider } from "@/lib/apongram/LanguageContext";
import { FeedPreferencesProvider } from "@/lib/apongram/FeedPreferencesContext";
import { NotificationPreferencesProvider } from "@/lib/apongram/NotificationPreferencesContext";
import { PushNotificationsProvider } from "@/lib/apongram/PushNotificationsProvider";
import { SafeAreaFrameContext, SafeAreaInsetsContext, SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import type { EdgeInsets, Metrics, Rect } from "react-native-safe-area-context";
import { trpc, createTRPCClient } from "@/lib/trpc";
import { initManusRuntime, subscribeSafeAreaInsets } from "@/lib/_core/manus-runtime";

void SplashScreen.preventAutoHideAsync();

const DEFAULT_WEB_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };
const DEFAULT_WEB_FRAME: Rect = { x: 0, y: 0, width: 0, height: 0 };
export const unstable_settings = { anchor: "(tabs)" };

export default function RootLayout() {
  const initialInsets = initialWindowMetrics?.insets ?? DEFAULT_WEB_INSETS; const initialFrame = initialWindowMetrics?.frame ?? DEFAULT_WEB_FRAME;
  const [insets, setInsets] = useState<EdgeInsets>(initialInsets); const [frame, setFrame] = useState<Rect>(initialFrame);
  const [fontsLoaded] = useFonts({
    Fraunces: require("../assets/fonts/fraunces-latin-700-normal.woff2"),
    NotoSerifBengali: require("../assets/fonts/noto-serif-bengali-bengali-500-normal.woff2"),
    NotoSerifBengaliBold: require("../assets/fonts/noto-serif-bengali-bengali-700-normal.woff2"),
    HindSiliguri: require("../assets/fonts/hind-siliguri-bengali-400-normal.woff2"),
    HindSiliguriMedium: require("../assets/fonts/hind-siliguri-bengali-500-normal.woff2"),
    HindSiliguriSemiBold: require("../assets/fonts/hind-siliguri-bengali-600-normal.woff2"),
    HindSiliguriLatin: require("../assets/fonts/hind-siliguri-latin-400-normal.woff2"),
    HindSiliguriLatinMedium: require("../assets/fonts/hind-siliguri-latin-500-normal.woff2"),
    HindSiliguriLatinSemiBold: require("../assets/fonts/hind-siliguri-latin-600-normal.woff2"),
  });
  useEffect(() => { if (fontsLoaded) void SplashScreen.hideAsync(); }, [fontsLoaded]);
  useEffect(() => { initManusRuntime(); }, []);
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const preventMediaActions = (event: Event) => event.preventDefault();
    document.addEventListener("contextmenu", preventMediaActions);
    document.addEventListener("dragstart", preventMediaActions);
    return () => {
      document.removeEventListener("contextmenu", preventMediaActions);
      document.removeEventListener("dragstart", preventMediaActions);
    };
  }, []);
  const handleSafeAreaUpdate = useCallback((metrics: Metrics) => { setInsets(metrics.insets); setFrame(metrics.frame); }, []);
  useEffect(() => { if (Platform.OS !== "web") return; const unsubscribe = subscribeSafeAreaInsets(handleSafeAreaUpdate); return () => unsubscribe(); }, [handleSafeAreaUpdate]);
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } } }));
  const [trpcClient] = useState(() => createTRPCClient());
  const providerInitialMetrics = useMemo(() => { const metrics = initialWindowMetrics ?? { insets: initialInsets, frame: initialFrame }; return { ...metrics, insets: { ...metrics.insets, top: Math.max(metrics.insets.top, 16), bottom: Math.max(metrics.insets.bottom, 12) } }; }, [initialInsets, initialFrame]);
  const liveWebViewUrl = Constants.expoConfig?.extra?.liveWebViewUrl as string | undefined;
  if (Platform.OS === "android" && liveWebViewUrl) {
    return <WebView source={{ uri: liveWebViewUrl }} originWhitelist={["https://*"]} javaScriptEnabled domStorageEnabled startInLoadingState pullToRefreshEnabled setSupportMultipleWindows={false} />;
  }
  const content = <GestureHandlerRootView style={{ flex: 1 }}><trpc.Provider client={trpcClient} queryClient={queryClient}><QueryClientProvider client={queryClient}><LanguageProvider><FeedPreferencesProvider><NotificationPreferencesProvider><PushNotificationsProvider><Stack screenOptions={{ headerShown: false }}><Stack.Screen name="index" /><Stack.Screen name="(tabs)" /><Stack.Screen name="post/[id]" /><Stack.Screen name="report" options={{ presentation: "modal" }} /><Stack.Screen name="settings" /><Stack.Screen name="language" /><Stack.Screen name="profile-edit" /><Stack.Screen name="auth/phone" /><Stack.Screen name="auth/login" /><Stack.Screen name="oauth/callback" /></Stack><StatusBar style="dark" /></PushNotificationsProvider></NotificationPreferencesProvider></FeedPreferencesProvider></LanguageProvider></QueryClientProvider></trpc.Provider></GestureHandlerRootView>;
  if (!fontsLoaded) return null;
  if (Platform.OS === "web") return <ThemeProvider><SafeAreaProvider initialMetrics={providerInitialMetrics}><SafeAreaFrameContext.Provider value={frame}><SafeAreaInsetsContext.Provider value={insets}>{content}</SafeAreaInsetsContext.Provider></SafeAreaFrameContext.Provider></SafeAreaProvider></ThemeProvider>;
  return <ThemeProvider><SafeAreaProvider initialMetrics={providerInitialMetrics}>{content}</SafeAreaProvider></ThemeProvider>;
}
