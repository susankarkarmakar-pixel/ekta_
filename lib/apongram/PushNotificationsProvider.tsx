import * as Notifications from "expo-notifications";
import { useEffect, type PropsWithChildren } from "react";
import { useNotificationPreferences } from "./NotificationPreferencesContext";
import { registerForPushNotifications } from "./push-notifications";

export function PushNotificationsProvider({ children }: PropsWithChildren) {
  const { bulletins, replies } = useNotificationPreferences();

  useEffect(() => {
    if (!bulletins && !replies) return;
    registerForPushNotifications().catch(() => undefined);
  }, [bulletins, replies]);

  useEffect(() => {
    const received = Notifications.addNotificationReceivedListener((notification) => {
      console.log("[Push] Notification received", notification.request.identifier);
    });
    const response = Notifications.addNotificationResponseReceivedListener((response) => {
      const route = response.notification.request.content.data?.route;
      if (typeof route === "string") console.log("[Push] Notification route", route);
    });
    return () => {
      received.remove();
      response.remove();
    };
  }, []);

  return children;
}
