import type { Comment, Post, Profile } from "./types";

export const currentUser: Profile = {
  id: "me",
  name: "Asha Verma",
  handle: "asha.verma",
  bio: "Sharing useful community updates from across India.",
  initials: "AV",
  avatarColor: "#C85C3A",
  region: "Gazole, Malda",
  followers: 248,
  following: 126,
  verified: true,
};

export const profiles: Profile[] = [
  currentUser,
  { id: "p-1", name: "Aarav Sharma", handle: "aarav.gazole", bio: "Local roads, public services and community news.", initials: "AS", avatarColor: "#365C57", region: "Gazole, Malda", followers: 531, following: 204, verified: true },
  { id: "p-2", name: "Ananya Rao", handle: "ananya.malda", bio: "Teacher · books · neighborhood stories.", initials: "AR", avatarColor: "#8B5E3C", region: "Malda, West Bengal", followers: 186, following: 92 },
  { id: "p-3", name: "Irfan Khan", handle: "irfan.kaliachak", bio: "Community clean-ups and youth volunteering.", initials: "IK", avatarColor: "#5C6B73", region: "Kaliachak, Malda", followers: 407, following: 175 },
  { id: "p-4", name: "Meera Das", handle: "meera.chanchal", bio: "Health camps and community care.", initials: "MD", avatarColor: "#9B4E4E", region: "Chanchal, Malda", followers: 154, following: 64 },
];

export const posts: Post[] = [
  { id: "post-1", author: profiles[1], body: "শনিবার গাজোল হাট বসবে সকাল থেকে। রাস্তার কাজ চলবে, তাই বাজারে আসার সময় একটু বাড়তি সময় হাতে রাখুন।", createdAt: "18 min", location: "Gazole, Malda", tags: ["Public service", "হাটের দিন"], likes: 42, comments: 8, likedByMe: false },
  { id: "post-2", author: profiles[2], body: "মালদার নদীর ঘাটে এই সপ্তাহান্তে বই বিনিময়ের ছোট আয়োজন হচ্ছে। পড়ে শেষ করা বই নিয়ে আসুন, অন্যের গল্প বাড়িতে নিয়ে যান।", createdAt: "1 h", location: "Malda, West Bengal", tags: ["Books", "Community"], likes: 67, comments: 14, likedByMe: true, imageUrl: "community-pottery" },
  { id: "post-3", author: profiles[3], body: "গাজোল কলেজের সামনে রবিবার সকালে পরিচ্ছন্নতা অভিযান হবে। এক ঘণ্টা সময় দিতে পারলে আমাদের সঙ্গে যোগ দিন।", createdAt: "3 h", location: "Gazole, Malda", tags: ["Volunteering", "Local update"], likes: 29, comments: 5, likedByMe: false },
];

export const demoStories: Post[] = [
  { id: "demo-story-market", author: currentUser, body: "নমুনা · আজকের বাজার থেকে community-র জন্য ছোট্ট আপডেট।", createdAt: "2 h", location: "Gazole, Malda", tags: ["Story"], likes: 0, comments: 0, likedByMe: false, imageUrl: "community-pottery", isStory: true, isDemo: true, storyExpiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString() },
  { id: "demo-story-community", author: currentUser, body: "নমুনা · আগামী সপ্তাহের community meet-up-এর কথা মনে রাখুন।", createdAt: "5 h", location: "Gazole, Malda", tags: ["Story"], likes: 0, comments: 0, likedByMe: false, videoUrl: "ekta-demo://market", mediaType: "video", isStory: true, isDemo: true, storyExpiresAt: new Date(Date.now() + 19 * 60 * 60 * 1000).toISOString() },
];

export const demoStoryHighlights = [
  { id: "demo-highlight-community", title: "Community", storyIds: ["demo-story-market", "demo-story-community"], createdAt: "demo" },
];

const demoCreator: Profile = {
  id: "ekta-demo",
  name: "Community Demo",
  handle: "community.demo",
  bio: "Sample community clips for preview only.",
  initials: "CD",
  avatarColor: "#1F6F6B",
  region: "Gazole, Malda",
  followers: 0,
  following: 0,
};

export const demoReels: Post[] = [
  {
    id: "demo-reel-market",
    author: demoCreator,
    body: "A market morning is best shared slowly. #LocalMarket #Community",
    videoUrl: "ekta-demo://market",
    mediaType: "video",
    isDemo: true,
    createdAt: "demo",
    location: "Gazole, Malda",
    tags: ["LocalMarket", "Community"],
    likes: 184,
    comments: 12,
    likedByMe: false,
  },
  {
    id: "demo-reel-cleanup",
    author: demoCreator,
    body: "Small hands, one cleaner neighbourhood. #Community #CleanUp",
    videoUrl: "ekta-demo://cleanup",
    mediaType: "video",
    isDemo: true,
    createdAt: "demo",
    location: "Malda, West Bengal",
    tags: ["Community", "CleanUp"],
    likes: 96,
    comments: 8,
    likedByMe: false,
  },
  {
    id: "demo-reel-green",
    author: demoCreator,
    body: "A few new saplings can change a lane. #GreenNeighbourhood #Together",
    videoUrl: "ekta-demo://planting",
    mediaType: "video",
    isDemo: true,
    createdAt: "demo",
    location: "Malda, West Bengal",
    tags: ["GreenNeighbourhood", "Together"],
    likes: 73,
    comments: 5,
    likedByMe: false,
  },
];

export const commentsByPost: Record<string, Comment[]> = {
  "post-1": [
    { id: "c-1", author: profiles[4], body: "Thanks for sharing this. Do you know how long the diversion is expected to last?", createdAt: "11 min" },
    { id: "c-2", author: profiles[0], body: "The notice says the work should be completed by this evening.", createdAt: "6 min" },
  ],
  "post-2": [{ id: "c-3", author: profiles[1], body: "I have a few storybooks to donate. I will bring them on Saturday.", createdAt: "34 min" }],
};

export const topics = ["#India", "#CommunityUpdates", "#PublicService", "#Books", "#Volunteering"];
export const topicLabels: Record<string, { bn: string; en: string }> = {
  "#India": { bn: "#ভারত", en: "#India" },
  "#CommunityUpdates": { bn: "#কমিউনিটি_খবর", en: "#CommunityUpdates" },
  "#PublicService": { bn: "#জনপরিষেবা", en: "#PublicService" },
  "#Books": { bn: "#বই", en: "#Books" },
  "#Volunteering": { bn: "#স্বেচ্ছাসেবা", en: "#Volunteering" },
};
