import { createClient, type RealtimeChannel } from "@supabase/supabase-js";
import { getSupabaseAccessToken, getSupabaseSession } from "./supabase-auth";
import { supabaseConfig } from "./supabase-config";
import { flushMessageQueue, persistIncomingDirectMessage, type DirectMessage } from "./messages";

type RemoteMessageRow = {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
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
