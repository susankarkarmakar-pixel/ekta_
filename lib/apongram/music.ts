import type { AudioSource } from "expo-audio";

export type MusicTrack = {
  id: string;
  title: string;
  artist: string;
  artistBn?: string;
  mood: string;
  source: AudioSource;
};

export const musicTracks: MusicTrack[] = [
  { id: "morning-light", title: "Morning Light", artist: "eKta Social Originals", artistBn: "একতা অরিজিনালস", mood: "Warm · hopeful", source: require("@/assets/audio/morning-light.mp3") },
  { id: "market-walk", title: "Market Walk", artist: "eKta Social Originals", artistBn: "একতা অরিজিনালস", mood: "Bright · lively", source: require("@/assets/audio/market-walk.mp3") },
  { id: "monsoon-calm", title: "Monsoon Calm", artist: "eKta Social Originals", artistBn: "একতা অরিজিনালস", mood: "Gentle · reflective", source: require("@/assets/audio/monsoon-calm.mp3") },
];
