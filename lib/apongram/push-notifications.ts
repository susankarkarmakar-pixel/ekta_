import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { supabaseConfig, supabaseFetch } from "./supabase";
import { getSupabaseSession } from "./supabase-auth";

export type PushRegistration = {
  token: string;
  platform: "ios" | "android";
};

export const pushNotificationHandler = Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function getProjectId(): string | undefined {
  return Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
}

export async function registerForPushNotifications(): Promise<PushRegistration | null> {
  if (Platform.OS === "web" || !Constants.isDevice) return null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("community", {
      name: "Community updates",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#B5482F",
    });
  }

  const current = await Notifications.getPermissionsAsync();
  let status = current.status;
  if (status !== "granted") {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  if (status !== "granted") return null;

  const projectId = getProjectId();
  if (!projectId) {
    console.warn("[Push] Expo projectId is not configured; token registration skipped.");
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  const registration: PushRegistration = { token, platform: Platform.OS === "ios" ? "ios" : "android" };

  const session = await getSupabaseSession();
  if (supabaseConfig.isConfigured && session?.user.id) {
    try {
      await supabaseFetch("push_tokens", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({ user_id: session.user.id, token: registration.token, platform: registration.platform, enabled: true }),
      });
    } catch {
      // Device can still receive local notifications; retry persistence on next launch.
      console.warn("[Push] Could not persist device token.");
    }
  }

  return registration;
}

export async function disablePushToken(token: string): Promise<void> {
  if (!supabaseConfig.isConfigured) return;
  try {
    await supabaseFetch(`push_tokens?token=eq.${encodeURIComponent(token)}`, {
      method: "PATCH",
      body: JSON.stringify({ enabled: false }),
    });
  } catch {
    console.warn("[Push] Could not disable device token.");
  }
}
