import type { Comment, Post, Profile } from "./types";

export const currentUser: Profile = {
  id: "me", name: "সুস্মিতা দাস", handle: "susmita.d", bio: "Gazole-র মানুষ, local updates আর public service নিয়ে লিখি।", initials: "সু", avatarColor: "#C85C3A", region: "Gazole", followers: 248, following: 126, verified: true,
};

export const profiles: Profile[] = [
  currentUser,
  { id: "p-1", name: "অরিন্দম ঘোষ", handle: "arindam.ghosh", bio: "Panchayat updates, roads & better public services.", initials: "অগ", avatarColor: "#365C57", region: "Gazole", followers: 531, following: 204, verified: true },
  { id: "p-2", name: "মৌসুমী সরকার", handle: "mousumi.reads", bio: "Teacher · বই · আমাদের পাড়ার গল্প", initials: "মস", avatarColor: "#8B5E3C", region: "Malda", followers: 186, following: 92 },
  { id: "p-3", name: "রাকিবুল ইসলাম", handle: "rakibul.n", bio: "স্বচ্ছতা, sport আর young voices-এর পাশে।", initials: "রা", avatarColor: "#5C6B73", region: "Chanchal", followers: 407, following: 175 },
  { id: "p-4", name: "পায়েল মণ্ডল", handle: "payel.cares", bio: "Health camp coordination and community care.", initials: "পা", avatarColor: "#9B4E4E", region: "Gazole", followers: 154, following: 64 },
];

export const posts: Post[] = [
  { id: "post-1", author: profiles[1], body: "আজ সকাল থেকে Gazole bus stand-এর কাছে নতুন জল supply line-এর কাজ শুরু হয়েছে। কাজ চলাকালীন ২ নম্বর lane-এ যান চলাচল ধীর হবে—দয়া করে একটু সময় হাতে রাখুন।", createdAt: "18 min", location: "Gazole bus stand", tags: ["Gazole", "জনসেবা"], likes: 42, comments: 8, likedByMe: false },
  { id: "post-2", author: profiles[2], body: "আমাদের স্কুলের library-তে Bengali বইয়ের shelf নতুন করে সাজানো হচ্ছে। পুরনো কিন্তু ভালো বই থাকলে Saturday-তে নিয়ে আসুন—ছোট পাঠাগার, বড় স্বপ্ন।", createdAt: "1 h", location: "Gazole High School", tags: ["বই", "আমাদেরGazole"], likes: 67, comments: 14, likedByMe: true },
  { id: "post-3", author: profiles[3], body: "North Bengal-এর young volunteers-দের সঙ্গে আজকের clean-up drive-এর ছবিগুলো। ছোট ছোট জায়গা পরিষ্কার রাখলে আমাদের বাজারটাই বদলে যায়।", createdAt: "3 h", location: "Chanchal market", tags: ["স্বেচ্ছাসেবা", "Malda"], likes: 29, comments: 5, likedByMe: false },
];

export const commentsByPost: Record<string, Comment[]> = {
  "post-1": [
    { id: "c-1", author: profiles[4], body: "ধন্যবাদ update দেওয়ার জন্য। সকাল ১০টার পর কি কাজটা বেশি হবে?", createdAt: "11 min" },
    { id: "c-2", author: profiles[0], body: "হ্যাঁ, দুপুরের আগে গেলে ভালো হবে বলে শুনলাম।", createdAt: "6 min" },
  ],
  "post-2": [{ id: "c-3", author: profiles[1], body: "আমার কাছে কিছু গল্পের বই আছে, Saturday-তে নিয়ে আসব।", createdAt: "34 min" }],
};

export const topics = ["#Gazole", "#জনসেবা", "#আমাদেরMalda", "#বই", "#স্বেচ্ছাসেবা"];
