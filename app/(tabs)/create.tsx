import { MaterialIcons } from "@expo/vector-icons";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useVideoPlayer, VideoView } from "expo-video";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Avatar } from "@/components/apongram/Avatar";
import { ScreenContainer } from "@/components/screen-container";
import { createPost } from "@/lib/apongram/repository";
import { applyImageFilter, type ImageFilter } from "@/lib/apongram/image-filters";
import { currentUser } from "@/lib/apongram/mock-data";
import { useLanguage } from "@/lib/apongram/LanguageContext";

const C = { card: "#FFFFFF", ink: "#1E1B16", muted: "#6B6153", terra: "#C85A3A", line: "#E3DACB", green: "#1F6F6B" };
type PublishMode = "post" | "reel" | "story";
type CaptureSource = "gallery" | "camera";
type MediaType = "image" | "video";

function VideoPreview({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (instance) => { instance.loop = true; instance.muted = true; });
  return <VideoView player={player} style={styles.previewImage} contentFit="cover" nativeControls />;
}

export default function CreateScreen() {
  const router = useRouter();
  const { copy, language } = useLanguage();
  const [mode, setMode] = useState<PublishMode>("post");
  const [body, setBody] = useState("");
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<MediaType | null>(null);
  const [activeFilter, setActiveFilter] = useState<ImageFilter | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const chooseMedia = async (source: CaptureSource) => {
    setError("");
    setBusy(true);
    try {
      const permission = source === "camera" ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setError(language === "bn" ? "মিডিয়া অনুমতি চালু করুন, তারপর আবার চেষ্টা করুন।" : "Media access is needed. Please allow it and try again.");
        return;
      }
      const allowedTypes: ImagePicker.MediaType[] = mode === "reel" ? ["videos"] : mode === "post" ? ["images"] : ["images", "videos"];
      const result = source === "camera"
        ? await ImagePicker.launchCameraAsync({ mediaTypes: allowedTypes, videoMaxDuration: 60, quality: 0.85 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: allowedTypes, videoMaxDuration: 60, allowsMultipleSelection: false, quality: 0.85, allowsEditing: mode !== "reel", aspect: [4, 3] });
      const asset = !result.canceled ? result.assets[0] : undefined;
      if (!asset?.uri) return;
      if (asset.type === "video" && asset.duration && asset.duration > 60_000) {
        setError(language === "bn" ? "রিল বা স্টোরির ভিডিও ৬০ সেকেন্ডের মধ্যে রাখুন।" : "Reels and stories must be 60 seconds or shorter.");
        return;
      }
      setMediaUri(asset.uri);
      setMediaType(asset.type === "video" ? "video" : "image");
      setActiveFilter(null);
    } catch {
      setError(language === "bn" ? "মিডিয়া বাছাই করা যায়নি। আবার চেষ্টা করুন।" : "We could not select that media. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const editImage = async (filter?: ImageFilter) => {
    if (!mediaUri || mediaType !== "image") return;
    setBusy(true);
    setError("");
    try {
      if (filter) {
        setMediaUri(await applyImageFilter(mediaUri, filter));
        setActiveFilter(filter);
      } else {
        const size = await new Promise<{ width: number; height: number }>((resolve, reject) => Image.getSize(mediaUri, (width, height) => resolve({ width, height }), reject));
        const target = 4 / 3;
        const cropWidth = size.width / size.height > target ? Math.round(size.height * target) : size.width;
        const cropHeight = size.width / size.height > target ? size.height : Math.round(size.width / target);
        const result = await manipulateAsync(mediaUri, [{ crop: { originX: Math.round((size.width - cropWidth) / 2), originY: Math.round((size.height - cropHeight) / 2), width: cropWidth, height: cropHeight } }], { compress: 0.85, format: SaveFormat.JPEG });
        setMediaUri(result.uri);
      }
    } catch {
      setError(language === "bn" ? "ছবিটি সম্পাদনা করা যায়নি।" : "The image could not be edited.");
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!body.trim() && !mediaUri) return;
    await createPost(body.trim(), mediaType === "image" ? mediaUri ?? undefined : undefined, mediaType === "video" ? mediaUri ?? undefined : undefined, mode === "story");
    setSaved(true);
    setTimeout(() => router.replace("/(tabs)"), 550);
  };

  const modeLabel = mode === "post" ? (language === "bn" ? "পোস্ট" : "Post") : mode === "reel" ? "Reel" : (language === "bn" ? "স্টোরি" : "Story");
  const helper = mode === "reel" ? (language === "bn" ? "৬০ সেকেন্ডের মধ্যে একটি উল্লম্ব ভিডিও শেয়ার করুন।" : "Share a vertical video up to 60 seconds.") : mode === "story" ? (language === "bn" ? "ছবি বা ভিডিও · ২৪ ঘণ্টা পরে স্টোরি মুছে যাবে।" : "Photo or video · disappears after 24 hours.") : copy.publicNote;

  return <ScreenContainer safeAreaClassName="bg-[#FBF7F0]" className="bg-[#FBF7F0]"><View style={styles.container}>
    <View style={styles.header}><Pressable onPress={() => router.back()} accessibilityLabel={copy.back}><MaterialIcons name="close" size={24} color={C.ink} /></Pressable><Text style={styles.title}>{modeLabel}</Text><Pressable onPress={submit} disabled={busy || (!body.trim() && !mediaUri)} style={[styles.postButton, (busy || (!body.trim() && !mediaUri)) && styles.disabled]}><Text style={styles.postButtonText}>{mode === "story" ? (language === "bn" ? "স্টোরিতে দিন" : "Add story") : copy.save}</Text></Pressable></View>
    <View style={styles.modeBar}>{(["post", "reel", "story"] as PublishMode[]).map((item) => <Pressable key={item} onPress={() => { setMode(item); setMediaUri(null); setMediaType(null); setError(""); }} style={[styles.modeButton, mode === item && styles.modeActive]}><MaterialIcons name={item === "post" ? "edit" : item === "reel" ? "movie" : "auto-stories"} size={16} color={mode === item ? "#FFF" : C.terra} /><Text style={[styles.modeText, mode === item && styles.modeTextActive]}>{item === "post" ? (language === "bn" ? "পোস্ট" : "Post") : item === "reel" ? "Reel" : (language === "bn" ? "স্টোরি" : "Story")}</Text></Pressable>)}</View>
    <View style={styles.author}><Avatar profile={currentUser} size={42} /><View><Text style={styles.name}>{currentUser.name}</Text><Text style={styles.meta}>{mode === "story" ? (language === "bn" ? "আপনার স্টোরি · ২৪ ঘণ্টা" : "Your story · 24 hours") : "India · public community"}</Text></View></View>
    <TextInput multiline value={body} onChangeText={setBody} placeholder={mode === "reel" ? (language === "bn" ? "রিলের ক্যাপশন লিখুন..." : "Write a caption for your reel...") : mode === "story" ? (language === "bn" ? "স্টোরিতে কিছু লিখুন..." : "Add a note to your story...") : copy.postPlaceholder} placeholderTextColor="#9A9080" style={styles.editor} maxLength={280} textAlignVertical="top" />
    <View style={styles.counter}><Text style={styles.note}>{helper}</Text><Text style={styles.count}>{body.length}/280</Text></View>
    {!mediaUri ? <View style={[styles.mediaChooser, busy && styles.disabled]}><Text style={styles.chooserTitle}>{mode === "reel" ? (language === "bn" ? "রিলের ভিডিও যোগ করুন" : "Add a reel video") : mode === "story" ? (language === "bn" ? "স্টোরির ছবি বা ভিডিও যোগ করুন" : "Add a story photo or video") : (language === "bn" ? "পোস্টে একটি ছবি যোগ করুন" : "Add one photo to your post")}</Text><View style={styles.chooserActions}><Pressable onPress={() => chooseMedia("gallery")} disabled={busy} style={styles.mediaAction}><MaterialIcons name="photo-library" size={20} color={C.terra} /><Text style={styles.mediaActionText}>{language === "bn" ? "গ্যালারি" : "Gallery"}</Text></Pressable><Pressable onPress={() => chooseMedia("camera")} disabled={busy} style={styles.mediaAction}><MaterialIcons name={mode === "reel" ? "videocam" : "photo-camera"} size={20} color={C.terra} /><Text style={styles.mediaActionText}>{mode === "reel" ? (language === "bn" ? "ভিডিও তুলুন" : "Record") : (language === "bn" ? "ক্যামেরা" : "Camera")}</Text></Pressable></View></View> : <View style={styles.attachment}><View style={styles.attachmentHeader}><View style={styles.attachmentTitle}><MaterialIcons name={mediaType === "video" ? "movie" : "photo"} size={18} color={C.green} /><Text style={styles.attachmentLabel}>{mediaType === "video" ? (mode === "story" ? "Story video" : "Reel video") : (language === "bn" ? "ছবি সংযুক্ত" : "Image attached")}</Text></View><Pressable onPress={() => { setMediaUri(null); setMediaType(null); }} disabled={busy}><Text style={styles.remove}>{language === "bn" ? "সরান" : "Remove"}</Text></Pressable></View><View style={styles.preview}>{mediaType === "video" ? <VideoPreview uri={mediaUri} /> : <Image source={{ uri: mediaUri }} style={styles.previewImage} resizeMode="cover" />}<View style={styles.previewOverlay}><MaterialIcons name="check-circle" size={18} color="#FFF" /><Text style={styles.previewText}>{mode === "story" ? (language === "bn" ? "২৪ ঘণ্টার স্টোরি" : "24-hour story") : mediaType === "video" ? "Ready to publish" : "Ready to publish"}</Text></View></View>{mediaType === "image" && <View style={styles.editRow}><Pressable onPress={() => editImage()} disabled={busy} style={styles.editButton}><MaterialIcons name="crop" size={16} color={C.terra} /><Text style={styles.editText}>{language === "bn" ? "ক্রপ ৪:৩" : "Crop 4:3"}</Text></Pressable>{(["grayscale", "brightness", "contrast"] as ImageFilter[]).map((filter) => <Pressable key={filter} onPress={() => editImage(filter)} disabled={busy} style={[styles.editButton, activeFilter === filter && styles.filterActive]}><Text style={[styles.editText, activeFilter === filter && styles.filterTextActive]}>{filter === "grayscale" ? "B&W" : filter === "brightness" ? "Bright" : "Contrast"}</Text></Pressable>)}</View>}</View>}
    {error ? <View style={styles.error}><MaterialIcons name="error-outline" size={17} color={C.terra} /><Text style={styles.errorText}>{error}</Text></View> : null}
    {saved && <View style={styles.success}><MaterialIcons name="check-circle" size={20} color={C.green} /><Text style={styles.successText}>{mode === "story" ? (language === "bn" ? "স্টোরিতে যোগ হয়েছে ✓" : "Added to your story ✓") : copy.share}</Text></View>}
  </View></ScreenContainer>;
}

const styles = StyleSheet.create({ container: { flex: 1, paddingHorizontal: 18 }, header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 15, paddingBottom: 16 }, title: { color: C.ink, fontSize: 18, fontFamily: "Georgia", fontWeight: "700" }, postButton: { backgroundColor: C.terra, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 }, disabled: { opacity: 0.42 }, postButtonText: { color: "#FFF", fontSize: 11, fontWeight: "800" }, modeBar: { flexDirection: "row", gap: 7, marginBottom: 18 }, modeButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: "#F0C8B9" }, modeActive: { backgroundColor: C.terra, borderColor: C.terra }, modeText: { color: C.terra, fontSize: 11, fontWeight: "800" }, modeTextActive: { color: "#FFF" }, author: { flexDirection: "row", alignItems: "center", gap: 10 }, name: { color: C.ink, fontWeight: "800", fontSize: 14 }, meta: { color: C.muted, fontSize: 11, marginTop: 3 }, editor: { color: C.ink, fontSize: 17, lineHeight: 27, minHeight: 155, paddingTop: 22 }, counter: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: C.line, paddingTop: 13 }, note: { color: C.muted, fontSize: 11, flex: 1, lineHeight: 16 }, count: { color: "#9A9080", fontSize: 11 }, mediaChooser: { marginTop: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 14, padding: 13 }, chooserTitle: { color: C.ink, fontSize: 13, fontWeight: "800" }, chooserActions: { flexDirection: "row", gap: 9, marginTop: 12 }, mediaAction: { flex: 1, backgroundColor: "#FBF7F0", borderRadius: 11, padding: 13, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 }, mediaActionText: { color: C.terra, fontSize: 12, fontWeight: "800" }, attachment: { marginTop: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 14, padding: 12 }, attachmentHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }, attachmentTitle: { flexDirection: "row", alignItems: "center", gap: 7 }, attachmentLabel: { color: C.green, fontSize: 12, fontWeight: "800" }, remove: { color: C.terra, fontSize: 11, fontWeight: "800" }, preview: { height: 172, borderRadius: 10, overflow: "hidden", position: "relative", backgroundColor: "#201E1B" }, previewImage: { width: "100%", height: "100%" }, previewOverlay: { position: "absolute", left: 9, bottom: 8, backgroundColor: "rgba(30,27,22,0.62)", borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5, flexDirection: "row", alignItems: "center", gap: 5 }, previewText: { color: "#FFF", fontSize: 10, fontWeight: "700" }, editRow: { flexDirection: "row", gap: 5, marginTop: 10 }, editButton: { flex: 1, borderWidth: 1, borderColor: "#F0C8B9", borderRadius: 999, paddingVertical: 7, alignItems: "center", justifyContent: "center" }, editText: { color: C.terra, fontSize: 9, fontWeight: "800" }, filterActive: { backgroundColor: C.terra }, filterTextActive: { color: "#FFF" }, error: { marginTop: 10, padding: 11, backgroundColor: "#FBE9E3", borderRadius: 12, flexDirection: "row", gap: 7 }, errorText: { color: C.terra, flex: 1, fontSize: 10, lineHeight: 15 }, success: { backgroundColor: "#E3EEEA", padding: 14, borderRadius: 14, flexDirection: "row", gap: 8, marginTop: 18 }, successText: { color: C.green, fontWeight: "800" } });
