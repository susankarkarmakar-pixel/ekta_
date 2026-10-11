import type { Post } from "./types";
import { currentUser, profiles } from "./mock-data";

/** Profile-only preview content. It is intentionally not included in the home feed. */
export const demoProfilePosts: Post[] = [
  {
    id: "demo-profile-market-note",
    author: currentUser,
    body: "নমুনা · আজকের বাজারে ছোট ব্যবসায়ীদের সঙ্গে দেখা হলো। স্থানীয় কাজ আর মানুষের গল্প একসঙ্গে রাখাই eKta-র আনন্দ।",
    createdAt: "আজ",
    location: "Gazole, Malda",
    tags: ["Community", "Local life"],
    likes: 34,
    comments: 6,
    likedByMe: true,
    imageUrl: "community-pottery",
    isDemo: true,
  },
  {
    id: "demo-profile-neighbourhood",
    author: currentUser,
    body: "নমুনা · আমাদের পাড়ার ছোট ছোট উদ্যোগগুলিকে এক জায়গায় নথিবদ্ধ করছি—আপনার গল্পও শেয়ার করুন।",
    createdAt: "গতকাল",
    location: "Gazole, Malda",
    tags: ["Stories", "Neighbourhood"],
    likes: 21,
    comments: 4,
    likedByMe: false,
    isDemo: true,
  },
  {
    id: "demo-profile-reel",
    author: currentUser,
    body: "নমুনা · বাজারের এক সকাল—ধীরে দেখুন, মানুষ আর জায়গার গল্প শুনুন।",
    createdAt: "২ দিন",
    location: "Gazole, Malda",
    tags: ["Reel", "Local market"],
    likes: 48,
    comments: 9,
    likedByMe: false,
    videoUrl: "ekta-demo://market",
    isDemo: true,
  },
];

export const demoTaggedPosts: Post[] = [
  {
    id: "demo-tagged-community",
    author: profiles[1],
    body: "নমুনা · Asha-র সঙ্গে আজকের community update সাজালাম—স্থানীয় খবর ভাগ করে নেওয়া সহজ হোক।",
    createdAt: "১ দিন",
    location: "Jaipur, Rajasthan",
    tags: ["Community", "Tagged"],
    likes: 17,
    comments: 3,
    likedByMe: false,
    imageUrl: "community-pottery",
    isDemo: true,
  },
  {
    id: "demo-tagged-volunteers",
    author: profiles[3],
    body: "নমুনা · পরিচ্ছন্নতা অভিযানের ছোট্ট recap—সবাইকে ধন্যবাদ।",
    createdAt: "৪ দিন",
    location: "Hyderabad, Telangana",
    tags: ["Volunteering", "Tagged"],
    likes: 12,
    comments: 2,
    likedByMe: false,
    isDemo: true,
  },
];
