import { createClient, type RealtimeChannel } from "@supabase/supabase-js";
import { getSupabaseAccessToken, getSupabaseSession } from "./supabase-auth";
import { supabaseConfig } from "./supabase-config";
import { flushMessageQueue, persistIncomingDirectMessage, type DirectMessage } from "./messages";
import { addInAppNotification } from "./notifications";

type RemoteMessageRow = {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

type RemoteNotificationRow = {
  id: string;
  actor_id: string;
  kind: "message" | "follow" | "comment" | "like";
  body: string;
  route: "/messages/[id]" | "/(tabs)/profile" | "/post/[id]";
  route_param: string | null;
  created_at: string;
};

let client: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (!supabaseConfig.isConfigured) return null;
  client ??= createClient(supabaseConfig.url, supabaseConfig.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    realtime: { params: { eventsPerSecond: 10 } },
  });
  return client;
}

function toMessage(row: RemoteMessageRow, userId: string): DirectMessage {
  return {
    id: row.id,
    senderId: row.sender_id,
    body: row.body,
    createdAt: row.created_at,
    read: row.sender_id === userId || Boolean(row.read_at),
    syncStatus: "synced",
  };
}

export async function subscribeToIncomingMessages(onMessage: (message: DirectMessage) => void): Promise<() => void> {
  const session = await getSupabaseSession();
  const token = await getSupabaseAccessToken();
  const realtime = getClient();
  if (!session?.user.id || !token || !realtime) return () => undefined;
  await realtime.realtime.setAuth(token);
  const channel: RealtimeChannel = realtime
    .channel(`ekta:direct-messages:${session.user.id}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "direct_messages", filter: `recipient_id=eq.${session.user.id}` },
      (payload) => {
        const message = toMessage(payload.new as RemoteMessageRow, session.user.id);
        void persistIncomingDirectMessage(message);
        void addInAppNotification({ kind: "message", actorId: message.senderId, body: "আপনাকে একটি message পাঠিয়েছেন", createdAt: message.createdAt, route: "/messages/[id]", routeParam: message.senderId, id: `notification-message-${message.id}` });
        onMessage(message);
      },
    )
    .subscribe();
  return () => {
    void realtime.removeChannel(channel);
  };
}

export async function connectMessagingRealtime(): Promise<() => void> {
  await flushMessageQueue();
  return subscribeToIncomingMessages(() => undefined);
}

export async function subscribeToUserNotifications(): Promise<() => void> {
  const session = await getSupabaseSession();
  const token = await getSupabaseAccessToken();
  const realtime = getClient();
  if (!session?.user.id || !token || !realtime) return () => undefined;
  await realtime.realtime.setAuth(token);
  const channel = realtime.channel(`ekta:notifications:${session.user.id}`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `recipient_id=eq.${session.user.id}` }, (payload) => {
      const row = payload.new as RemoteNotificationRow;
      void addInAppNotification({ id: `notification-${row.id}`, kind: row.kind, actorId: row.actor_id, body: row.body, createdAt: row.created_at, route: row.route, routeParam: row.route_param ?? undefined });
    })
    .subscribe();
  return () => { void realtime.removeChannel(channel); };
}
