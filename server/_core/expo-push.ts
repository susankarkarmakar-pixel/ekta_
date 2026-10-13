export type ExpoPushMessage = {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  channelId?: string;
};

export type ExpoPushTicket = {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: Record<string, unknown>;
};

const EXPO_PUSH_ENDPOINT = "https://exp.host/--/api/v2/push/send";

export async function sendExpoPushNotifications(messages: ExpoPushMessage[]): Promise<ExpoPushTicket[]> {
  if (!messages.length) return [];
  const response = await fetch(EXPO_PUSH_ENDPOINT, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(messages.map((message) => ({
      to: message.to,
      title: message.title.trim().slice(0, 120),
      body: message.body.trim().slice(0, 500),
      data: message.data,
      channelId: message.channelId ?? "community",
    }))),
  });
  if (!response.ok) throw new Error(`Expo Push Service failed: ${response.status}`);
  const payload = await response.json() as { data?: ExpoPushTicket[] };
  return payload.data ?? [];
}
