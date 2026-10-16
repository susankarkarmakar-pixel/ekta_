import AsyncStorage from "@react-native-async-storage/async-storage";
import { currentUser, profiles } from "./mock-data";
import type { Profile } from "./types";

const STORAGE_KEY = "@ekta/messages-v1";

export type DirectMessage = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
  read: boolean;
};

export type MessageThread = {
  id: string;
  participantId: string;
  messages: DirectMessage[];
  updatedAt: string;
};

const seedThreads: MessageThread[] = [
  {
    id: "thread-p-1",
    participantId: "p-1",
    updatedAt: "10 min",
    messages: [
      { id: "dm-1", senderId: "p-1", body: "হাটের রাস্তার কাজ নিয়ে নতুন আপডেট পেয়েছি।", createdAt: "10 min", read: false },
      { id: "dm-2", senderId: currentUser.id, body: "ধন্যবাদ, community-র সঙ্গে শেয়ার করব।", createdAt: "8 min", read: true },
    ],
  },
  {
    id: "thread-p-2",
    participantId: "p-2",
    updatedAt: "গতকাল",
    messages: [
      { id: "dm-3", senderId: "p-2", body: "বই বিনিময়ের আয়োজনটি শনিবার হবে তো?", createdAt: "গতকাল", read: true },
    ],
  },
];

function sanitizeThreads(value: unknown): MessageThread[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is MessageThread => {
    if (!item || typeof item !== "object") return false;
    const thread = item as MessageThread;
    return typeof thread.id === "string" && typeof thread.participantId === "string" && Array.isArray(thread.messages);
  });
}

async function readThreads(): Promise<MessageThread[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return seedThreads;
    return sanitizeThreads(JSON.parse(raw));
  } catch {
    return seedThreads;
  }
}

async function writeThreads(threads: MessageThread[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  } catch {
    // Messaging remains usable in memory when local storage is unavailable.
  }
}

export function getMessageParticipant(id: string): Profile | undefined {
  return profiles.find((profile) => profile.id === id);
}

export async function getMessageThreads(): Promise<MessageThread[]> {
  const threads = await readThreads();
  return [...threads].sort((a, b) => b.messages.length - a.messages.length || b.updatedAt.localeCompare(a.updatedAt));
}

export async function getMessageThread(participantId: string): Promise<MessageThread> {
  const threads = await readThreads();
  return threads.find((thread) => thread.participantId === participantId) ?? {
    id: `thread-${participantId}`,
    participantId,
    messages: [],
    updatedAt: "now",
  };
}

export async function sendDirectMessage(participantId: string, body: string): Promise<DirectMessage> {
  const message: DirectMessage = {
    id: `dm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    senderId: currentUser.id,
    body: body.trim(),
    createdAt: "now",
    read: true,
  };
  const threads = await readThreads();
  const existing = threads.find((thread) => thread.participantId === participantId);
  const nextThread: MessageThread = existing
    ? { ...existing, messages: [...existing.messages, message], updatedAt: "now" }
    : { id: `thread-${participantId}`, participantId, messages: [message], updatedAt: "now" };
  const next = existing
    ? threads.map((thread) => thread.participantId === participantId ? nextThread : thread)
    : [nextThread, ...threads];
  await writeThreads(next);
  return message;
}

export async function markMessageThreadRead(participantId: string): Promise<void> {
  const threads = await readThreads();
  await writeThreads(threads.map((thread) => thread.participantId === participantId
    ? { ...thread, messages: thread.messages.map((message) => message.senderId === participantId ? { ...message, read: true } : message) }
    : thread));
}
