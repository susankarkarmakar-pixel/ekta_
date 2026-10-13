import { MaterialIcons } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { Avatar } from "@/components/apongram/Avatar";
import { Colors } from "@/constants/theme";
import { ScreenContainer } from "@/components/screen-container";
import { createPost } from "@/lib/apongram/repository";
import { applyImageFilter, type ImageFilter } from "@/lib/apongram/image-filters";
import { currentUser } from "@/lib/apongram/mock-data";
import { useLanguage } from "@/lib/apongram/LanguageContext";
import type { OverlayPosition, OverlaySticker, VideoCompression } from "@/lib/apongram/types";
import { musicTracks } from "@/lib/apongram/music";

/* Expo Video trim preview uses its imperative currentTime API. */
/* eslint-disable react-hooks/immutability */

const C = { ...Colors.light, card: Colors.light.paper, ink: Colors.light.inkNavy, muted: Colors.light.slate, terra: Colors.light.terracotta, line: Colors.light.line, green: Colors.light.leafGreen };
type PublishMode = "post" | "reel" | "story";
type CaptureSource = "gallery" | "camera";
type MediaType = "image" | "video";

function VideoPreview({ uri, start, end, volume }: { uri: string; start: number; end: number; volume: number }) {
  const player = useVideoPlayer(uri, (instance) => { instance.loop = true; instance.muted = false; });
  useEffect(() => { player.volume = volume; }, [player, volume]);
  useEffect(() => {
    player.currentTime = start;
    player.timeUpdateEventInterval = 0.25;
    const subscription = player.addListener("timeUpdate", ({ currentTime }) => {
      if (currentTime >= end) { player.currentTime = start; player.play(); }
    });
    return () => subscription.remove();
  }, [end, player, start]);
  return <VideoView player={player} style={styles.previewImage} contentFit="cover" nativeControls />;
}

export default function CreateScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const initialMode: PublishMode = params.mode === "reel" ? "reel" : "post";
  return <CreateComposer key={params.mode ?? "default"} initialMode={initialMode} />;
}

function CreateComposer({ initialMode }: { initialMode: PublishMode }) {
  const router = useRouter();
  const { copy, language } = useLanguage();
  const bodyFont = language === "bn" ? "HindSiliguri" : "HindSiliguriLatin";
  const mediumFont = language === "bn" ? "HindSiliguriSemiBold" : "HindSiliguriLatinSemiBold";
  const headingFont = language === "bn" ? "NotoSerifBengaliBold" : "Fraunces";
  const [mode, setMode] = useState<PublishMode>(initialMode);
  const [body, setBody] = useState("");
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<MediaType | null>(null);
  const [activeFilter, setActiveFilter] = useState<ImageFilter | null>(null);
  const [videoDuration, setVideoDuration] = useState(60);
  const [trimStart, setTrimStart] = useState("0");
  const [trimEnd, setTrimEnd] = useState("60");
  const [compression, setCompression] = useState<VideoCompression>("balanced");
  const [musicTrackId, setMusicTrackId] = useState<string | null>(null);
  const [musicVolume, setMusicVolume] = useState(0.7);
  const [originalVolume, setOriginalVolume] = useState(0.25);
  const [overlayText, setOverlayText] = useState("");
  const [overlaySticker, setOverlaySticker] = useState<OverlaySticker | null>(null);
  const [overlayPosition, setOverlayPosition] = useState<OverlayPosition>("center");
  const selectedTrack = musicTracks.find((track) => track.id === musicTrackId);
  const musicPlayer = useAudioPlayer(selectedTrack?.source);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const canPublish = mode === "reel"
    ? mediaType === "video" && Boolean(mediaUri)
    : Boolean(body.trim() || mediaUri);

  useEffect(() => {
    musicPlayer.loop = true;
    musicPlayer.volume = musicVolume;
    if (!selectedTrack) musicPlayer.pause();
  }, [musicPlayer, musicVolume, selectedTrack]);

  const chooseMedia = async (source: CaptureSource) => {
    setError("");
    setBusy(true);
    try {
      const permission = source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
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
      if (mode === "reel" && asset.type !== "video") {
        setError(language === "bn" ? "রিলের জন্য একটি ভিডিও বাছুন।" : "Please choose a video for your Reel.");
        return;
      }
      if (mode === "post" && asset.type === "video") {
        setError(language === "bn" ? "সাধারণ পোস্টে ছবি ব্যবহার করুন। ভিডিওর জন্য Reel বাছুন।" : "Use a photo for a regular post, or switch to Reel for video.");
        return;
      }
      if (asset.type === "video" && asset.duration && asset.duration > 60_000) {
        setError(language === "bn" ? "রিল বা স্টোরির ভিডিও ৬০ সেকেন্ডের মধ্যে রাখুন।" : "Reels and stories must be 60 seconds or shorter.");
        return;
      }
      setMediaUri(asset.uri);
      setMediaType(asset.type === "video" ? "video" : "image");
      setActiveFilter(null);
      setMusicTrackId(null);
      musicPlayer.pause();
      setOverlayText("");
      setOverlaySticker(null);
      if (asset.type === "video") {
        const duration = Math.max(1, Math.min(60, Math.ceil((asset.duration ?? 60_000) / 1000)));
        setVideoDuration(duration); setTrimStart("0"); setTrimEnd(String(duration)); setCompression("balanced");
      }
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
        const size = await new Promise<{ width: number; height: number }>((resolve, reject) =>
          Image.getSize(mediaUri, (width, height) => resolve({ width, height }), reject));
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
    if (mode === "reel" && mediaType !== "video") {
      setError(copy.reelNeedsVideo);
      return;
    }
    if (!body.trim() && !mediaUri) return;
    let videoOptions: { start: number; end: number; compression: VideoCompression } | undefined;
    if (mediaType === "video" && mode === "reel") {
      const start = Number(trimStart); const end = Number(trimEnd);
      if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end > videoDuration || end - start < 1) {
        setError(language === "bn" ? "ট্রিম সময় ঠিক করুন: কমপক্ষে ১ সেকেন্ড এবং সর্বোচ্চ ৬০ সেকেন্ড।" : "Choose a valid trim range between 1 and 60 seconds."); return;
      }
      videoOptions = { start, end, compression };
    }
    setBusy(true);
    try {
      await createPost(
        body.trim(),
        mediaType === "image" ? mediaUri ?? undefined : undefined,
        mediaType === "video" ? mediaUri ?? undefined : undefined,
        mode === "story",
        videoOptions,
        selectedTrack ? { trackId: selectedTrack.id, musicVolume, originalVolume } : undefined,
        (overlayText.trim() || overlaySticker) ? { text: overlayText.trim() || undefined, sticker: overlaySticker ?? undefined, position: overlayPosition } : undefined,
      );
      setSaved(true);
      setTimeout(() => router.replace(mode === "reel" ? "/(tabs)/reels" : "/(tabs)"), 550);
    } catch {
      setError(language === "bn" ? "পোস্ট করা যায়নি। আবার চেষ্টা করুন।" : "We could not publish this. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const modeLabel = mode === "post" ? (language === "bn" ? "পোস্ট" : "Post") : mode === "reel" ? copy.reels : (language === "bn" ? "স্টোরি" : "Story");
  const helper = mode === "reel"
    ? (language === "bn" ? "৬০ সেকেন্ডের মধ্যে উল্লম্ব ভিডিও · শব্দ প্রথমে বন্ধ থাকবে।" : "Vertical video up to 60 seconds · sound starts off.")
    : mode === "story"
      ? (language === "bn" ? "ছবি বা ভিডিও · ২৪ ঘণ্টা পরে স্টোরি মুছে যাবে।" : "Photo or video · disappears after 24 hours.")
      : copy.publicNote;
  const modeDescription = mode === "reel"
    ? (language === "bn" ? "৬০ সেকেন্ডের মধ্যে একটি ছোট ভিডিও গল্প তৈরি করুন।" : "Create a short video story up to 60 seconds.")
    : mode === "story"
      ? (language === "bn" ? "ছবি বা ভিডিও ২৪ ঘণ্টার জন্য শেয়ার করুন।" : "Share a photo or video for 24 hours.")
      : (language === "bn" ? "আপনার এলাকার জন্য লেখা বা একটি ছবি শেয়ার করুন।" : "Share a useful note or photo from your area.");

  return (
    <ScreenContainer safeAreaClassName="bg-background" className="bg-background">
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} accessibilityLabel={copy.back}><MaterialIcons name="close" size={24} color={C.ink} /></Pressable>
          <Text style={[styles.title, { fontFamily: headingFont }]}>{modeLabel}</Text>
          <Pressable onPress={submit} disabled={busy || !canPublish} style={[styles.postButton, (busy || !canPublish) && styles.disabled]} accessibilityRole="button" accessibilityLabel={mode === "reel" ? copy.publishReel : copy.save}>
            <Text style={[styles.postButtonText, { fontFamily: mediumFont }]}>{busy ? (language === "bn" ? "অপেক্ষা করুন…" : "Please wait…") : mode === "reel" ? copy.publishReel : mode === "story" ? (language === "bn" ? "স্টোরিতে দিন" : "Add story") : copy.save}</Text>
          </Pressable>
        </View>

        <View style={styles.modeBar}>
          {(["post", "reel", "story"] as PublishMode[]).map((item) => (
            <Pressable key={item} onPress={() => { setMode(item); setMediaUri(null); setMediaType(null); setMusicTrackId(null); musicPlayer.pause(); setOverlayText(""); setOverlaySticker(null); setError(""); setSaved(false); }} style={[styles.modeButton, mode === item && styles.modeActive]} accessibilityRole="button" accessibilityState={{ selected: mode === item }}>
              <MaterialIcons name={item === "post" ? "edit" : item === "reel" ? "movie" : "auto-stories"} size={16} color={mode === item ? "#FFF" : C.terra} />
              <Text style={[styles.modeText, { fontFamily: mediumFont }, mode === item && styles.modeTextActive]}>{item === "post" ? (language === "bn" ? "পোস্ট" : "Post") : item === "reel" ? copy.reels : (language === "bn" ? "স্টোরি" : "Story")}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.modeHint}><MaterialIcons name={mode === "reel" ? "movie" : mode === "story" ? "auto-stories" : "edit-note"} size={16} color={C.terra} /><Text style={[styles.modeHintText, { fontFamily: bodyFont }]}>{modeDescription}</Text></View>

        <View style={styles.author}>
          <Avatar profile={currentUser} size={42} />
          <View><Text style={[styles.name, { fontFamily: mediumFont }]}>{currentUser.name}</Text><Text style={[styles.meta, { fontFamily: bodyFont }]}>{mode === "story" ? (language === "bn" ? "আপনার স্টোরি · ২৪ ঘণ্টা" : "Your story · 24 hours") : "India · public community"}</Text></View>
        </View>

        <TextInput
          multiline
          value={body}
          onChangeText={setBody}
          placeholder={mode === "reel" ? (language === "bn" ? "রিলের ক্যাপশন লিখুন... #বিষয়" : "Write a caption for your Reel... #topic") : mode === "story" ? (language === "bn" ? "স্টোরিতে কিছু লিখুন..." : "Add a note to your story...") : copy.postPlaceholder}
          placeholderTextColor={C.muted}
          style={[styles.editor, { fontFamily: bodyFont }]}
          maxLength={280}
          textAlignVertical="top"
        />
        <View style={styles.counter}><Text style={[styles.note, { fontFamily: bodyFont }]}>{helper}</Text><Text style={[styles.count, { fontFamily: bodyFont }]}>{body.length}/280</Text></View>

        {!mediaUri ? (
          <View style={[styles.mediaChooser, busy && styles.disabled]}>
            <Text style={[styles.chooserTitle, { fontFamily: mediumFont }]}>{mode === "reel" ? (language === "bn" ? "রিলের ভিডিও যোগ করুন" : "Add a Reel video") : mode === "story" ? (language === "bn" ? "স্টোরির ছবি বা ভিডিও যোগ করুন" : "Add a story photo or video") : (language === "bn" ? "পোস্টে একটি ছবি যোগ করুন" : "Add one photo to your post")}</Text>
            <View style={styles.chooserActions}>
              <Pressable onPress={() => chooseMedia("gallery")} disabled={busy} style={styles.mediaAction} accessibilityRole="button"><MaterialIcons name="photo-library" size={20} color={C.terra} /><Text style={[styles.mediaActionText, { fontFamily: mediumFont }]}>{language === "bn" ? "গ্যালারি" : "Gallery"}</Text></Pressable>
              <Pressable onPress={() => chooseMedia("camera")} disabled={busy} style={styles.mediaAction} accessibilityRole="button"><MaterialIcons name={mode === "reel" ? "videocam" : "photo-camera"} size={20} color={C.terra} /><Text style={[styles.mediaActionText, { fontFamily: mediumFont }]}>{mode === "reel" ? (language === "bn" ? "ভিডিও তুলুন" : "Record") : (language === "bn" ? "ক্যামেরা" : "Camera")}</Text></Pressable>
            </View>
            {mode === "reel" ? <Text style={[styles.videoHint, { fontFamily: bodyFont }]}>{language === "bn" ? "শুধু ভিডিও · সর্বোচ্চ ৬০ সেকেন্ড" : "Video only · 60 seconds max"}</Text> : null}
          </View>
        ) : (
          <View style={styles.attachment}>
            <View style={styles.attachmentHeader}>
              <View style={styles.attachmentTitle}><MaterialIcons name={mediaType === "video" ? "movie" : "photo"} size={18} color={C.green} /><Text style={styles.attachmentLabel}>{mediaType === "video" ? (mode === "story" ? "Story video" : "Reel video") : (language === "bn" ? "ছবি সংযুক্ত" : "Image attached")}</Text></View>
              <Pressable onPress={() => { setMediaUri(null); setMediaType(null); }} disabled={busy}><Text style={styles.remove}>{language === "bn" ? "সরান" : "Remove"}</Text></Pressable>
            </View>
            <View style={styles.preview}>
              {mediaType === "video" ? <VideoPreview uri={mediaUri} start={Math.max(0, Number(trimStart) || 0)} end={Math.max(1, Number(trimEnd) || videoDuration)} volume={originalVolume} /> : <Image source={{ uri: mediaUri }} style={styles.previewImage} resizeMode="cover" />}
              <View style={styles.previewOverlay}><MaterialIcons name="check-circle" size={18} color="#FFF" /><Text style={styles.previewText}>{mode === "story" ? (language === "bn" ? "২৪ ঘণ্টার স্টোরি" : "24-hour Story") : (language === "bn" ? "প্রকাশের জন্য প্রস্তুত" : "Ready to publish")}</Text></View>{(mode === "reel" || mode === "story") && (overlayText.trim() || overlaySticker) ? <View pointerEvents="none" style={[styles.overlayPreview, overlayPosition === "top" ? styles.overlayTop : overlayPosition === "bottom" ? styles.overlayBottom : styles.overlayCenter]}>{overlaySticker ? <MaterialIcons name={overlaySticker as keyof typeof MaterialIcons.glyphMap} size={28} color="#FFF" /> : null}{overlayText.trim() ? <Text style={styles.overlayText}>{overlayText.trim()}</Text> : null}</View> : null}
            </View>
            {mediaType === "video" && mode === "reel" ? <View style={styles.trimPanel}><View style={styles.trimHeader}><Text style={styles.trimTitle}>{language === "bn" ? "রিল সম্পাদনা" : "Edit Reel"}</Text><Text style={styles.trimMeta}>{language === "bn" ? `মোট ${videoDuration} সেকেন্ড` : `Up to ${videoDuration}s`}</Text></View><View style={styles.trimFields}><View style={styles.trimField}><Text style={styles.trimLabel}>{language === "bn" ? "শুরু" : "Start"}</Text><TextInput value={trimStart} onChangeText={setTrimStart} keyboardType="decimal-pad" style={styles.trimInput} /></View><Text style={styles.trimDash}>–</Text><View style={styles.trimField}><Text style={styles.trimLabel}>{language === "bn" ? "শেষ" : "End"}</Text><TextInput value={trimEnd} onChangeText={setTrimEnd} keyboardType="decimal-pad" style={styles.trimInput} /></View><Text style={styles.seconds}>sec</Text></View><Text style={styles.compressionLabel}>{language === "bn" ? "কম্প্রেশন" : "Compression"}</Text><View style={styles.compressionRow}>{(["high", "balanced", "dataSaver"] as VideoCompression[]).map((profile) => <Pressable key={profile} onPress={() => setCompression(profile)} style={[styles.compressionButton, compression === profile && styles.filterActive]}><Text style={[styles.compressionText, compression === profile && styles.filterTextActive]}>{profile === "high" ? "High" : profile === "balanced" ? "Balanced" : "Data saver"}</Text></Pressable>)}</View><Text style={styles.trimNote}>{language === "bn" ? "এই রেঞ্জ ও কম্প্রেশন প্রোফাইল আপলোডে ব্যবহার হবে।" : "This trim range and compression profile will be applied at upload."}</Text></View> : null}
            {(mode === "reel" || mode === "story") ? <View style={styles.musicPanel}><View style={styles.musicHeader}><View><Text style={styles.trimTitle}>{language === "bn" ? "সঙ্গীত যোগ করুন" : "Add music"}</Text><Text style={styles.trimMeta}>{selectedTrack ? selectedTrack.title : (language === "bn" ? "একটি ট্র্যাক বাছুন" : "Choose a track")}</Text></View>{selectedTrack ? <Pressable onPress={() => musicPlayer.playing ? musicPlayer.pause() : musicPlayer.play()} style={styles.musicPlay}><MaterialIcons name={musicPlayer.playing ? "pause" : "play-arrow"} size={17} color="#FFF" /></Pressable> : null}</View><View style={styles.trackList}>{musicTracks.map((track) => <Pressable key={track.id} onPress={() => { setMusicTrackId(track.id); musicPlayer.replace(track.source); musicPlayer.play(); }} style={[styles.trackRow, musicTrackId === track.id && styles.trackSelected]}><MaterialIcons name={musicTrackId === track.id ? "radio-button-checked" : "radio-button-unchecked"} size={17} color={musicTrackId === track.id ? C.green : C.muted} /><View style={styles.trackCopy}><Text style={styles.trackTitle}>{track.title}</Text><Text style={styles.trackMeta}>{track.artist} · {track.mood}</Text></View><MaterialIcons name="play-arrow" size={16} color={C.terra} /></Pressable>)}</View>{selectedTrack ? <View style={styles.mixControls}><View style={styles.mixRow}><Text style={styles.mixLabel}>{language === "bn" ? "মূল ভিডিও" : "Original"}</Text><Pressable onPress={() => setOriginalVolume(Math.max(0, Number((originalVolume - 0.1).toFixed(1))))}><Text style={styles.mixButton}>−</Text></Pressable><Text style={styles.mixValue}>{Math.round(originalVolume * 100)}%</Text><Pressable onPress={() => setOriginalVolume(Math.min(1, Number((originalVolume + 0.1).toFixed(1))))}><Text style={styles.mixButton}>+</Text></Pressable></View><View style={styles.mixRow}><Text style={styles.mixLabel}>{language === "bn" ? "সঙ্গীত" : "Music"}</Text><Pressable onPress={() => { const value = Math.max(0, Number((musicVolume - 0.1).toFixed(1))); setMusicVolume(value); musicPlayer.volume = value; }}><Text style={styles.mixButton}>−</Text></Pressable><Text style={styles.mixValue}>{Math.round(musicVolume * 100)}%</Text><Pressable onPress={() => { const value = Math.min(1, Number((musicVolume + 0.1).toFixed(1))); setMusicVolume(value); musicPlayer.volume = value; }}><Text style={styles.mixButton}>+</Text></Pressable></View></View> : null}<Text style={styles.trimNote}>{language === "bn" ? "সঙ্গীতটি প্রিভিউতে মিশবে এবং প্রকাশের সময় সংরক্ষিত হবে।" : "Music previews in the mix and is saved with your Reel or Story."}</Text></View> : null}
            {(mode === "reel" || mode === "story") ? <View style={styles.overlayPanel}><View style={styles.musicHeader}><View><Text style={styles.trimTitle}>{language === "bn" ? "স্টিকার ও টেক্সট" : "Stickers & text"}</Text><Text style={styles.trimMeta}>{language === "bn" ? "মিডিয়ার উপরে যোগ করুন" : "Layered over your media"}</Text></View><Pressable onPress={() => { setOverlayText(""); setOverlaySticker(null); }}><Text style={styles.remove}>{language === "bn" ? "মুছুন" : "Clear"}</Text></Pressable></View><TextInput value={overlayText} onChangeText={setOverlayText} maxLength={60} placeholder={language === "bn" ? "ছবির উপর লেখা..." : "Add text over your media..."} placeholderTextColor="#9A9080" style={styles.overlayInput} /><View style={styles.stickerRow}>{(["sparkles", "favorite", "location-on", "wb-sunny", "local-florist"] as OverlaySticker[]).map((sticker) => <Pressable key={sticker} onPress={() => setOverlaySticker(overlaySticker === sticker ? null : sticker)} style={[styles.stickerButton, overlaySticker === sticker && styles.filterActive]}><MaterialIcons name={sticker as keyof typeof MaterialIcons.glyphMap} size={20} color={overlaySticker === sticker ? "#FFF" : C.terra} /></Pressable>)}</View><View style={styles.positionRow}><Text style={styles.trimMeta}>{language === "bn" ? "অবস্থান" : "Position"}</Text>{(["top", "center", "bottom"] as OverlayPosition[]).map((position) => <Pressable key={position} onPress={() => setOverlayPosition(position)} style={[styles.positionButton, overlayPosition === position && styles.filterActive]}><Text style={[styles.positionText, overlayPosition === position && styles.filterTextActive]}>{position[0].toUpperCase() + position.slice(1)}</Text></Pressable>)}</View><Text style={styles.trimNote}>{language === "bn" ? "প্রিভিউতে টেনে বসানো যাবে; প্রকাশের সময় এই লেয়ার সংরক্ষিত হবে।" : "Preview the layer above your media; it will be saved with the Reel or Story."}</Text></View> : null}
            {mediaType === "image" ? (
              <View style={styles.editRow}>
                <Pressable onPress={() => editImage()} disabled={busy} style={styles.editButton}><MaterialIcons name="crop" size={16} color={C.terra} /><Text style={styles.editText}>{language === "bn" ? "ক্রপ ৪:৩" : "Crop 4:3"}</Text></Pressable>
                {(["grayscale", "brightness", "contrast"] as ImageFilter[]).map((filter) => (
                  <Pressable key={filter} onPress={() => editImage(filter)} disabled={busy} style={[styles.editButton, activeFilter === filter && styles.filterActive]}>
                    <Text style={[styles.editText, activeFilter === filter && styles.filterTextActive]}>{filter === "grayscale" ? "B&W" : filter === "brightness" ? "Bright" : "Contrast"}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        )}

        {error ? <View style={styles.error} accessibilityRole="alert"><MaterialIcons name="error-outline" size={17} color={C.terra} /><Text style={styles.errorText}>{error}</Text></View> : null}
        {saved ? <View style={styles.success}><MaterialIcons name="check-circle" size={20} color={C.green} /><Text style={styles.successText}>{mode === "reel" ? copy.reelPublished : mode === "story" ? (language === "bn" ? "স্টোরিতে যোগ হয়েছে ✓" : "Added to your Story ✓") : copy.share}</Text></View> : null}
      </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { paddingHorizontal: 16, paddingBottom: 34 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 10, paddingBottom: 12 },
  title: { color: C.ink, fontSize: 20, fontWeight: "700" },
  postButton: { backgroundColor: C.terra, borderRadius: 999, paddingHorizontal: 18, paddingVertical: 11, shadowColor: C.ink, shadowOpacity: 0.16, shadowRadius: 7, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  disabled: { opacity: 0.42 },
  postButtonText: { color: "#FFF", fontSize: 11, fontWeight: "800" },
  modeBar: { flexDirection: "row", gap: 3, marginBottom: 16, padding: 3, borderRadius: 24, backgroundColor: C.primaryContainer },
  modeButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 11, borderRadius: 21, borderWidth: 0, backgroundColor: "transparent" },
  modeActive: { backgroundColor: C.paper },
  modeText: { color: C.muted, fontSize: 12, fontWeight: "800" },
  modeTextActive: { color: C.ink },
  modeHint: { flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: C.primaryContainer, borderRadius: 13, paddingHorizontal: 11, paddingVertical: 9, marginBottom: 14 },
  modeHintText: { flex: 1, color: C.muted, fontSize: 11, lineHeight: 16 },
  author: { flexDirection: "row", alignItems: "center", gap: 10 },
  name: { color: C.ink, fontWeight: "800", fontSize: 14 },
  meta: { color: C.muted, fontSize: 11, marginTop: 3 },
  editor: { color: C.ink, fontSize: 17, lineHeight: 27, minHeight: 155, paddingHorizontal: 15, paddingTop: 22, backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, borderRadius: 20, marginTop: 15 },
  counter: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: C.line, paddingTop: 13 },
  note: { color: C.muted, fontSize: 11, flex: 1, lineHeight: 16 },
  count: { color: "#9A9080", fontSize: 11 },
  mediaChooser: { marginTop: 20, backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, borderRadius: 20, padding: 15, shadowColor: C.ink, shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  chooserTitle: { color: C.ink, fontSize: 13, fontWeight: "800" },
  chooserActions: { flexDirection: "row", gap: 9, marginTop: 12 },
  mediaAction: { flex: 1, backgroundColor: C.primaryContainer, borderRadius: 14, minHeight: 48, padding: 13, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  mediaActionText: { color: C.terra, fontSize: 12, fontWeight: "800" },
  videoHint: { color: C.muted, fontSize: 10, marginTop: 10 },
  attachment: { marginTop: 20, backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, borderRadius: 20, padding: 13, shadowColor: C.ink, shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  attachmentHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  attachmentTitle: { flexDirection: "row", alignItems: "center", gap: 7 },
  attachmentLabel: { color: C.green, fontSize: 12, fontWeight: "800" },
  remove: { color: C.terra, fontSize: 11, fontWeight: "800" },
  preview: { height: 180, borderRadius: 16, overflow: "hidden", position: "relative", backgroundColor: "#201E1B" },
  previewImage: { width: "100%", height: "100%" },
  previewOverlay: { position: "absolute", left: 9, bottom: 8, backgroundColor: "rgba(30,27,22,0.62)", borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5, flexDirection: "row", alignItems: "center", gap: 5 },
  previewText: { color: "#FFF", fontSize: 10, fontWeight: "700" },
  overlayPanel: { marginTop: 12, paddingTop: 11, borderTopWidth: 1, borderTopColor: C.line }, overlayInput: { marginTop: 8, height: 38, borderWidth: 1, borderColor: C.line, borderRadius: 10, paddingHorizontal: 10, color: C.ink, fontSize: 12, backgroundColor: "#FBF7F0" }, stickerRow: { flexDirection: "row", gap: 7, marginTop: 8 }, stickerButton: { width: 34, height: 32, borderWidth: 1, borderColor: "#F0C8B9", borderRadius: 9, alignItems: "center", justifyContent: "center" }, positionRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 9 }, positionButton: { borderWidth: 1, borderColor: "#F0C8B9", borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }, positionText: { color: C.terra, fontSize: 9, fontWeight: "800" }, overlayPreview: { position: "absolute", alignSelf: "center", maxWidth: "88%", backgroundColor: "rgba(30,27,22,0.68)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 7 }, overlayTop: { top: 16 }, overlayCenter: { top: "42%" }, overlayBottom: { bottom: 44 }, overlayText: { color: "#FFF", fontSize: 16, fontWeight: "800", textAlign: "center" }, musicPanel: { marginTop: 12, paddingTop: 11, borderTopWidth: 1, borderTopColor: C.line }, musicHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, musicPlay: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.green, alignItems: "center", justifyContent: "center" }, trackList: { marginTop: 8, gap: 5 }, trackRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 8, borderRadius: 10, backgroundColor: "#FBF7F0" }, trackSelected: { borderWidth: 1, borderColor: "#A7C9C2", backgroundColor: "#EEF6F3" }, trackCopy: { flex: 1 }, trackTitle: { color: C.ink, fontSize: 11, fontWeight: "800" }, trackMeta: { color: C.muted, fontSize: 9, marginTop: 2 }, mixControls: { marginTop: 8, gap: 5 }, mixRow: { flexDirection: "row", alignItems: "center", gap: 8 }, mixLabel: { color: C.muted, fontSize: 10, width: 58 }, mixButton: { color: C.terra, fontSize: 19, fontWeight: "700", width: 22, textAlign: "center" }, mixValue: { color: C.ink, fontSize: 10, fontWeight: "800", width: 38, textAlign: "center" }, trimPanel: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.line }, trimHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, trimTitle: { color: C.ink, fontSize: 12, fontWeight: "800" }, trimMeta: { color: C.muted, fontSize: 10 }, trimFields: { flexDirection: "row", alignItems: "flex-end", gap: 7, marginTop: 9 }, trimField: { flex: 1 }, trimLabel: { color: C.muted, fontSize: 9, marginBottom: 3 }, trimInput: { height: 34, borderWidth: 1, borderColor: C.line, borderRadius: 9, paddingHorizontal: 9, color: C.ink, fontSize: 12, backgroundColor: "#FBF7F0" }, trimDash: { color: C.muted, paddingBottom: 9 }, seconds: { color: C.muted, fontSize: 10, paddingBottom: 9 }, compressionLabel: { color: C.muted, fontSize: 9, marginTop: 10, marginBottom: 6 }, compressionRow: { flexDirection: "row", gap: 5 }, compressionButton: { flex: 1, borderWidth: 1, borderColor: "#F0C8B9", borderRadius: 999, paddingVertical: 7, alignItems: "center" }, compressionText: { color: C.terra, fontSize: 9, fontWeight: "800" }, trimNote: { color: C.muted, fontSize: 9, lineHeight: 13, marginTop: 7 }, editRow: { flexDirection: "row", gap: 5, marginTop: 10 },
  editButton: { flex: 1, borderWidth: 1, borderColor: "#F0C8B9", borderRadius: 999, paddingVertical: 7, alignItems: "center", justifyContent: "center" },
  editText: { color: C.terra, fontSize: 9, fontWeight: "800" },
  filterActive: { backgroundColor: C.terra },
  filterTextActive: { color: "#FFF" },
  error: { marginTop: 10, padding: 12, backgroundColor: "#FFEDEA", borderRadius: 16, borderWidth: 1, borderColor: "#F1B8B0", flexDirection: "row", gap: 7 },
  errorText: { color: C.terra, flex: 1, fontSize: 10, lineHeight: 15 },
  success: { backgroundColor: "#DFF2ED", borderWidth: 1, borderColor: "#A4D7CC", padding: 14, borderRadius: 16, flexDirection: "row", gap: 8, marginTop: 18 },
  successText: { color: C.green, fontWeight: "800" },
});
