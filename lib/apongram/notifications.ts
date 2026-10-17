import AsyncStorage from "@react-native-async-storage/async-storage";
import { profiles } from "./mock-data";

const STORAGE_KEY = "@ekta/in-app-notifications-v1";

export type NotificationKind = "message" | "follow" | "comment" | "like";

export type InAppNotification = {
  id: string;
  kind: NotificationKind;
  actorId: string;
  body: string;
  createdAt: string;
  read: boolean;
  route: "/messages/[id]" | "/(tabs)/profile" | "/post/[id]";
  routeParam?: string;
};

const seedNotifications: InAppNotification[] = [
  { id: "notification-message-1", kind: "message", actorId: profiles[1].id, body: "আপনাকে একটি message পাঠিয়েছেন", createdAt: "10 মিনিট আগে", read: false, route: "/messages/[id]", routeParam: profiles[1].id },
  { id: "notification-follow-1", kind: "follow", actorId: profiles[2].id, body: "আপনাকে follow করেছেন", createdAt: "১ ঘণ্টা আগে", read: false, route: "/(tabs)/profile", routeParam: profiles[2].id },
  { id: "notification-comment-1", kind: "comment", actorId: profiles[3].id, body: "আপনার post-এ comment করেছেন", createdAt: "গতকাল", read: true, route: "/post/[id]", routeParam: "post-1" },
];

async function readNotifications(): Promise<InAppNotification[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return seedNotifications;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : seedNotifications;
  } catch {
    return seedNotifications;
  }
}

async function writeNotifications(items: InAppNotification[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 100)));
  } catch {
    // In-app notifications are best effort; push delivery remains independent.
  }
}

export async function getInAppNotifications(): Promise<InAppNotification[]> {
  const items = await readNotifications();
  return [...items].sort((a, b) => Number(b.read) - Number(a.read) || b.id.localeCompare(a.id));
}

export async function addInAppNotification(notification: Omit<InAppNotification, "id" | "read"> & { id?: string }): Promise<InAppNotification> {
  const item: InAppNotification = { ...notification, id: notification.id ?? `notification-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, read: false };
  const current = await readNotifications();
  if (!current.some((existing) => existing.id === item.id)) await writeNotifications([item, ...current]);
  return item;
}

export async function markInAppNotificationRead(id: string): Promise<void> {
  const current = await readNotifications();
  await writeNotifications(current.map((item) => item.id === id ? { ...item, read: true } : item));
}

export async function markAllInAppNotificationsRead(): Promise<void> {
  const current = await readNotifications();
  await writeNotifications(current.map((item) => ({ ...item, read: true })));
}
