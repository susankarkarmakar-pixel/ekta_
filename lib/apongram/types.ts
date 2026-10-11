export type Language = "bn" | "en";

export type Profile = {
  id: string;
  name: string;
  handle: string;
  bio: string;
  initials: string;
  avatarColor: string;
  avatarUrl?: string;
  region: string;
  followers: number;
  following: number;
  verified?: boolean;
};

export type VideoCompression = "high" | "balanced" | "dataSaver";
export type OverlaySticker = "sparkles" | "favorite" | "location-on" | "wb-sunny" | "local-florist";
export type OverlayPosition = "top" | "center" | "bottom";

export type Post = {
  id: string;
  author: Profile;
  body: string;
  imageUrl?: string;
  videoUrl?: string | number;
  mediaType?: "image" | "video";
  videoStart?: number;
  videoEnd?: number;
  videoCompression?: VideoCompression;
  musicTrackId?: string;
  musicVolume?: number;
  originalVolume?: number;
  overlayText?: string;
  overlaySticker?: OverlaySticker;
  overlayPosition?: OverlayPosition;
  isStory?: boolean;
  isDemo?: boolean;
  storyExpiresAt?: string;
  createdAt: string;
  location: string;
  tags: string[];
  likes: number;
  comments: number;
  likedByMe: boolean;
};

export type Comment = { id: string; author: Profile; body: string; createdAt: string };

export const copy = {
  bn: {
    home: "ফিড", discover: "খুঁজুন", create: "পোস্ট", alerts: "বার্তা", profile: "প্রোফাইল",
    goodMorning: "আপনার এলাকার খবর", feedIntro: "যাঁদের আপনি চেনেন, তাঁদের কাছ থেকে আজকের আপডেট।",
    whatHappened: "আজ আপনার এলাকায় কী ঘটছে?", photo: "ছবি", share: "শেয়ার করুন", latest: "সাম্প্রতিক",
    following: "ফলো করছেন", followers: "ফলোয়ার", popularTopics: "চলতি বিষয়", comments: "মন্তব্য",
    comment: "মন্তব্য করুন", likes: "লাইক", follow: "ফলো", followingAction: "ফলো করছেন",
    searchPlaceholder: "মানুষ, পোস্ট বা #বিষয় খুঁজুন", people: "মানুষ", posts: "পোস্ট", topics: "বিষয়",
    save: "পোস্ট করুন", postPlaceholder: "আপনার এলাকার খবরটি শেয়ার করুন...", publicNote: "এই পোস্টটি আপনার community-র সবাই দেখতে পারবেন।",
    addPhoto: "একটি ছবি যোগ করুন", removePhoto: "ছবি সরান", noAlerts: "এখনও নতুন বার্তা নেই",
    alertsIntro: "আপনার community-র activity এখানে দেখা যাবে।", communityPulse: "Community pulse",
    pulseText: "আজ এই feed-এ ভারতের নানা এলাকার মানুষ সক্রিয়।", editProfile: "প্রোফাইল সাজান",
    signIn: "ফোন নম্বর দিয়ে sign in", signInIntro: "Password নয়—ফোনে OTP দিয়ে নিরাপদে ঢুকুন।",
    members: "community-র মানুষ", report: "Report করুন", reported: "Report নেওয়া হয়েছে",
    replyPlaceholder: "আপনার মন্তব্য লিখুন...", send: "পাঠান", noResults: "কোনও ফল পাওয়া যায়নি",
    demoMode: "Demo mode", demoModeText: "Supabase key যোগ হলে এই feed live data-তে বদলে যাবে।",
    otpTitle: "ফোন দিয়ে যোগ দিন", phoneLabel: "ফোন নম্বর", phonePlaceholder: "+91 98765 43210",
    sendOtp: "OTP পাঠান", otpLabel: "৬ সংখ্যার OTP", verify: "যাচাই করুন", resend: "আবার পাঠান",
    verifiedMessage: "আপনি এখন eKta-এর community-তে আছেন।", back: "ফিরে যান",
    reels: "রিলস", createReel: "রিল তৈরি", localReel: "স্থানীয় গল্প", demoFootage: "ডেমো ফুটেজ",
    loadingReels: "রিলস লোড হচ্ছে...", noReelsYet: "এখনও কোনও রিল নেই",
    beFirstReel: "আপনার এলাকার প্রথম ছোট ভিডিও গল্পটি শেয়ার করুন।",
    playVideo: "ভিডিও চালান", pauseVideo: "ভিডিও থামান", likeVideo: "রিল লাইক করুন", shareReel: "শেয়ার",
    turnSoundOn: "শব্দ চালু করুন", turnSoundOff: "শব্দ বন্ধ করুন", noReelComments: "এখনও মন্তব্য নেই। প্রথম কথা বলুন।",
    closeComments: "মন্তব্য বন্ধ করুন", publishReel: "রিল প্রকাশ করুন",
    reelNeedsVideo: "প্রকাশের আগে ৬০ সেকেন্ডের মধ্যে একটি ভিডিও বাছুন।", reelPublished: "রিল প্রকাশিত হয়েছে",
    welcomeTitle: "আপনার পাড়া, আপনার একতা", welcomeIntro: "নিজের এলাকার খবর, কাজ আর কথার জন্য একটি নিরাপদ কমিউনিটি।", chooseLanguage: "ভাষা বেছে নিন", start: "শুরু করুন", pilotNote: "গাজোল ব্লকের পরীক্ষামূলক সংস্করণ।",
    loginTitle: "OTP দিয়ে ঢুকুন", loginSent: "৬ সংখ্যার কোড আপনার ফোনে পাঠানো হয়েছে।", changeNumber: "নম্বর বদলান", privacyNote: "আপনার ফোন নম্বর শুধু ঢোকার জন্য ব্যবহার হয়।",
    notificationsToday: "আজ", notificationsEarlier: "আগের", markAllRead: "সব পড়া হয়েছে", noNotifications: "কোনো বিজ্ঞপ্তি নেই", noNotificationsBody: "কেউ আপনার পোস্ট পছন্দ করলে, মন্তব্য করলে বা আপনাকে ফলো করলে এখানে জানতে পারবেন।",
    languageTitle: "ভাষা", languageAvailable: "এখন বাংলা ও ইংরেজি চালু", languagePlanned: "ধাপে ধাপে অনুবাদ ও যাচাই হচ্ছে", languageSave: "ভাষা বদলান",
    reportTitle: "পোস্ট রিপোর্ট করুন", reportBody: "এই পোস্টটি কেন রিপোর্ট করছেন?", reportSpam: "স্প্যাম বা বিভ্রান্তিকর", reportAbuse: "হয়রানি বা ঘৃণা", reportSafety: "নিরাপত্তার সমস্যা", reportSubmit: "রিপোর্ট পাঠান", reportThanks: "রিপোর্ট নেওয়া হয়েছে।",
    offlineTitle: "ইন্টারনেট নেই", offlineBody: "ইন্টারনেট ফিরলে লাইক ও মন্তব্য আবার চালু হবে।", offlineBanner: "অফলাইন মোড · নতুন কাজ পরে পাঠানো হবে", feedEmptyTitle: "আপনার ফিড এখনও ফাঁকা", feedEmptyBody: "আপনার এলাকার মানুষকে ফলো করুন বা প্রথম পোস্টটি লিখুন।", otpErrorTitle: "কোডটি মেলেনি", otpErrorBody: "৬ সংখ্যার কোডটি আবার দেখে চেষ্টা করুন।", retry: "আবার চেষ্টা করুন",
  },
  en: {
    home: "Feed", discover: "Discover", create: "Post", alerts: "Alerts", profile: "Profile",
    goodMorning: "Your local feed", feedIntro: "Fresh updates from people and places you already know.",
    whatHappened: "What’s happening in your area?", photo: "Photo", share: "Share", latest: "Latest",
    following: "Following", followers: "followers", popularTopics: "Topics people are talking about", comments: "comments",
    comment: "Comment", likes: "likes", follow: "Follow", followingAction: "Following",
    searchPlaceholder: "Search people, posts or #topics", people: "People", posts: "Posts", topics: "Topics",
    save: "Post", postPlaceholder: "Share something useful from your area...", publicNote: "This post will be visible to your community.",
    addPhoto: "Add one photo", removePhoto: "Remove photo", noAlerts: "No new alerts yet",
    alertsIntro: "Your community activity will show up here.", communityPulse: "Community pulse",
    pulseText: "People across India are active in this feed today.", editProfile: "Edit profile",
    signIn: "Sign in with phone", signInIntro: "No password to remember—use a one-time code.",
    members: "people in your community", report: "Report", reported: "Report received",
    replyPlaceholder: "Add a thoughtful comment...", send: "Send", noResults: "No results found",
    demoMode: "Demo mode", demoModeText: "Add Supabase keys to switch this feed to live data.",
    otpTitle: "Join with your phone", phoneLabel: "Phone number", phonePlaceholder: "+91 98765 43210",
    sendOtp: "Send OTP", otpLabel: "6-digit OTP", verify: "Verify", resend: "Resend",
    verifiedMessage: "You’re now part of the eKta community.", back: "Go back",
    reels: "Reels", createReel: "Create Reel", localReel: "Community", demoFootage: "Demo footage",
    loadingReels: "Loading Reels…", noReelsYet: "No Reels yet",
    beFirstReel: "Share the first short video story from your community.",
    playVideo: "Play video", pauseVideo: "Pause video", likeVideo: "Like Reel", shareReel: "Share",
    turnSoundOn: "Turn sound on", turnSoundOff: "Turn sound off", noReelComments: "No comments yet. Start the conversation.",
    closeComments: "Close comments", publishReel: "Publish Reel",
    reelNeedsVideo: "Choose a video up to 60 seconds before publishing.", reelPublished: "Your Reel is published",
    welcomeTitle: "Your neighbourhood, connected", welcomeIntro: "A calm, trusted community for local news, work and conversation.", chooseLanguage: "Choose your language", start: "Get started", pilotNote: "Pilot version for Gazole Block.",
    loginTitle: "Sign in with OTP", loginSent: "A 6-digit code was sent to your phone.", changeNumber: "Change number", privacyNote: "Your phone number is used only to sign in.",
    notificationsToday: "Today", notificationsEarlier: "Earlier", markAllRead: "Mark all read", noNotifications: "No notifications yet", noNotificationsBody: "Likes, comments and new followers will show up here.",
    languageTitle: "Language", languageAvailable: "Bengali and English are available", languagePlanned: "Translations are being reviewed in phases", languageSave: "Change language",
    reportTitle: "Report this post", reportBody: "Why are you reporting this post?", reportSpam: "Spam or misleading", reportAbuse: "Harassment or hate", reportSafety: "Safety concern", reportSubmit: "Submit report", reportThanks: "Your report was received.",
    offlineTitle: "You’re offline", offlineBody: "Likes and comments will resume when internet returns.", offlineBanner: "Offline mode · new actions will wait", feedEmptyTitle: "Your feed is still quiet", feedEmptyBody: "Follow people nearby or write the first post.", otpErrorTitle: "That code didn’t match", otpErrorBody: "Check the 6-digit code and try again.", retry: "Try again",
  },
} as const;

export type Copy = (typeof copy)[Language];
