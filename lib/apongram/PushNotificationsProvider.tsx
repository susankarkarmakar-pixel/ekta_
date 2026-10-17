import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, type PropsWithChildren } from "react";
import { useNotificationPreferences } from "./NotificationPreferencesContext";
import { registerForPushNotifications } from "./push-notifications";
import { addInAppNotification, type NotificationKind } from "./notifications";
import { subscribeToUserNotifications } from "./message-realtime";

export function PushNotificationsProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const { bulletins, replies, messages, followers } = useNotificationPreferences();

  useEffect(() => {
    if (!bulletins && !replies && !messages && !followers) return;
    registerForPushNotifications().catch(() => undefined);
  }, [bulletins, followers, messages, replies]);

  useEffect(() => {
    if (!messages && !followers && !replies && !bulletins) return;
    let active = true;
    let unsubscribe: (() => void) | undefined;
    void subscribeToUserNotifications().then((cleanup) => {
      if (active) unsubscribe = cleanup;
      else cleanup();
    });
    return () => { active = false; unsubscribe?.(); };
  }, [bulletins, followers, messages, replies]);

  useEffect(() => {
    const received = Notifications.addNotificationReceivedListener((notification) => {
      console.log("[Push] Notification received", notification.request.identifier);
      const data = notification.request.content.data as { kind?: NotificationKind; actorId?: string; route?: string; routeParam?: string } | undefined;
      if (data?.kind && data.actorId && (data.route === "/messages/[id]" || data.route === "/(tabs)/profile" || data.route === "/post/[id]")) {
        void addInAppNotification({ kind: data.kind, actorId: data.actorId, body: notification.request.content.body ?? "Community update", createdAt: new Date().toISOString(), route: data.route, routeParam: data.routeParam });
      }
    });
    const response = Notifications.addNotificationResponseReceivedListener((response) => {
      const route = response.notification.request.content.data?.route;
      if (route === "/messages/[id]" && typeof response.notification.request.content.data?.routeParam === "string") router.push({ pathname: "/messages/[id]" as never, params: { id: response.notification.request.content.data.routeParam } });
      else if (route === "/(tabs)/profile" && typeof response.notification.request.content.data?.routeParam === "string") router.push({ pathname: "/(tabs)/profile", params: { id: response.notification.request.content.data.routeParam } });
      else if (route === "/post/[id]" && typeof response.notification.request.content.data?.routeParam === "string") router.push({ pathname: "/post/[id]", params: { id: response.notification.request.content.data.routeParam } });
    });
    return () => {
      received.remove();
      response.remove();
    };
  }, [router]);

  return children;
}
