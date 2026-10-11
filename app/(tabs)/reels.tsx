import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
  type ViewToken,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { Avatar } from "@/components/apongram/Avatar";
import { ScreenContainer } from "@/components/screen-container";
import { Colors } from "@/constants/theme";
import { currentUser } from "@/lib/apongram/mock-data";
import { getReels } from "@/lib/apongram/repository";
import { useLanguage } from "@/lib/apongram/LanguageContext";
import type { Post } from "@/lib/apongram/types";

const COLORS = {
  black: "#080908",
  white: Colors.light.ivory,
  muted: Colors.dark.slate,
  terra: Colors.light.terracotta,
  green: Colors.light.leafGreen,
  line: Colors.light.line,
  paper: Colors.light.paper,
};
const REEL_VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 80 };
const DEMO_VIDEO_SOURCES: Record<string, number> = {
  "ekta-demo://market": require("../../assets/videos/reel-market.mp4"),
  "ekta-demo://cleanup": require("../../assets/videos/reel-cleanup.mp4"),
  "ekta-demo://planting": require("../../assets/videos/reel-planting.mp4"),
};

function resolveVideoSource(source: string | number | null) {
  return typeof source === "string" ? DEMO_VIDEO_SOURCES[source] ?? source : source;
}

type ReelEngagement = { liked: boolean; likes: number };

type ReelCardProps = {
  reel: Post;
  stageWidth: number;
  active: boolean;
  muted: boolean;
  liked: boolean;
  likes: number;
  commentCount: number;
  copy: ReturnType<typeof useLanguage>["copy"];
  onToggleMute: () => void;
  onToggleLike: () => void;
  onOpenComments: () => void;
  onShare: () => void;
};

function ReelCard({
  reel,
  stageWidth,
  active,
  muted,
  liked,
  likes,
  commentCount,
  copy,
  onToggleMute,
  onToggleLike,
  onOpenComments,
  onShare,
}: ReelCardProps) {
  const { language } = useLanguage();
  const bodyFont = language === "bn" ? "HindSiliguri" : "HindSiliguriLatin";
  const mediumFont = language === "bn" ? "HindSiliguriSemiBold" : "HindSiliguriLatinSemiBold";
  const player = useVideoPlayer(resolveVideoSource(reel.videoUrl ?? null), (instance) => {
    instance.loop = true;
    instance.muted = true;
  });
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    // expo-video is an imperative media API; synchronize its player with React state.
    // eslint-disable-next-line react-hooks/immutability
    player.muted = muted || !active;
    if (active && !paused) {
      player.play();
    } else {
      player.pause();
    }
  }, [active, muted, paused, player]);

  const togglePlayback = () => setPaused((value) => !value);
  const caption = reel.body.trim();

  return (
    <View style={styles.reelPage}>
      <View style={[styles.reelStage, { width: stageWidth }]}>
        <VideoView
          player={player}
          style={[StyleSheet.absoluteFill, styles.videoFill]}
          contentFit="cover"
          nativeControls={false}
        />
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={togglePlayback}
          accessibilityRole="button"
          accessibilityLabel={paused ? copy.playVideo : copy.pauseVideo}
        />
        <View pointerEvents="none" style={styles.topShade} />
        <View pointerEvents="none" style={styles.bottomShade} />

        {paused && active ? (
          <View pointerEvents="none" style={styles.playIndicator}>
            <MaterialIcons name="play-arrow" size={42} color={COLORS.white} />
          </View>
        ) : null}

        <View pointerEvents="box-none" style={styles.reelOverlay}>
        <View style={styles.sideActions}>
          <Pressable
            onPress={onToggleLike}
            style={styles.actionButton}
            accessibilityRole="button"
            accessibilityLabel={`${copy.likeVideo} · ${likes}`}
          >
            <MaterialIcons name={liked ? "favorite" : "favorite-border"} size={29} color={liked ? COLORS.terra : COLORS.white} />
            <Text style={[styles.actionLabel, { fontFamily: mediumFont }]}>{formatCount(likes)}</Text>
          </Pressable>
          <Pressable
            onPress={onOpenComments}
            style={styles.actionButton}
            accessibilityRole="button"
            accessibilityLabel={`${copy.comments} · ${commentCount}`}
          >
            <MaterialIcons name="chat-bubble-outline" size={27} color={COLORS.white} />
            <Text style={[styles.actionLabel, { fontFamily: mediumFont }]}>{formatCount(commentCount)}</Text>
          </Pressable>
          <Pressable
            onPress={onShare}
            style={styles.actionButton}
            accessibilityRole="button"
            accessibilityLabel={copy.shareReel}
          >
            <MaterialIcons name="send" size={25} color={COLORS.white} />
            <Text style={[styles.actionLabel, { fontFamily: mediumFont }]}>{copy.shareReel}</Text>
          </Pressable>
          <Pressable
            onPress={onToggleMute}
            style={[styles.actionButton, styles.soundButton]}
            accessibilityRole="button"
            accessibilityLabel={muted ? copy.turnSoundOn : copy.turnSoundOff}
          >
            <MaterialIcons name={muted ? "volume-off" : "volume-up"} size={23} color={COLORS.white} />
          </Pressable>
        </View>

        <View style={styles.creatorInfo}>
          {reel.isDemo ? (
            <View style={styles.demoPill}>
              <MaterialIcons name="movie" size={12} color={COLORS.white} />
              <Text style={[styles.demoPillText, { fontFamily: mediumFont }]}>{copy.demoFootage}</Text>
            </View>
          ) : null}
          <View style={styles.creatorRow}>
            <Avatar profile={reel.author} size={34} />
            <Text numberOfLines={1} style={[styles.creatorName, { fontFamily: mediumFont }]}>@{reel.author.handle}</Text>
            {reel.author.verified ? <MaterialIcons name="verified" size={15} color={Colors.dark.leafGreen} /> : null}
            <View style={styles.followPill}><Text style={[styles.followPillText, { fontFamily: mediumFont }]}>{copy.localReel}</Text></View>
          </View>
          {caption ? <Text numberOfLines={3} style={[styles.caption, { fontFamily: bodyFont }]}>{caption}</Text> : null}
          <View style={styles.locationRow}>
            <MaterialIcons name="place" size={14} color={COLORS.white} />
            <Text numberOfLines={1} style={[styles.locationText, { fontFamily: bodyFont }]}>{reel.location}</Text>
          </View>
          {reel.tags.length ? (
            <Text numberOfLines={1} style={[styles.tags, { fontFamily: mediumFont }]}>{reel.tags.map((tag) => `#${tag.replace(/^#/, "")}`).join("  ")}</Text>
          ) : null}
        </View>
        </View>
      </View>
    </View>
  );
}

function formatCount(count: number) {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 10_000) return `${Math.round(count / 1_000)}K`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
}

export default function ReelsScreen() {
  const router = useRouter();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { copy, language } = useLanguage();
  const bodyFont = language === "bn" ? "HindSiliguri" : "HindSiliguriLatin";
  const mediumFont = language === "bn" ? "HindSiliguriSemiBold" : "HindSiliguriLatinSemiBold";
  const headingFont = language === "bn" ? "NotoSerifBengaliBold" : "Fraunces";
  const [reels, setReels] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [muted, setMuted] = useState(true);
  const [engagement, setEngagement] = useState<Record<string, ReelEngagement>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [commentThreads, setCommentThreads] = useState<Record<string, string[]>>({});
  const [selectedReel, setSelectedReel] = useState<Post | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const stageWidth = Math.min(windowWidth, Math.round((viewportHeight || windowHeight) * 9 / 16));

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      setFocused(true);
      setLoading(true);
      getReels()
        .then((items) => {
          if (mounted) {
            setReels(items);
            setActiveIndex(0);
          }
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
      return () => {
        mounted = false;
        setFocused(false);
      };
    }, []),
  );

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const visible = viewableItems.find((item) => item.isViewable && item.index !== null);
    if (visible?.index !== null && visible?.index !== undefined) setActiveIndex(visible.index);
  }, []);

  const onLayout = (event: LayoutChangeEvent) => {
    setViewportHeight(event.nativeEvent.layout.height);
  };

  const toggleLike = (reel: Post) => {
    setEngagement((current) => {
      const previous = current[reel.id] ?? { liked: reel.likedByMe, likes: reel.likes };
      const liked = !previous.liked;
      return {
        ...current,
        [reel.id]: { liked, likes: Math.max(0, previous.likes + (liked ? 1 : -1)) },
      };
    });
  };

  const shareReel = async (reel: Post) => {
    try {
      await Share.share({ message: `${reel.body}\n@${reel.author.handle} · ${reel.location}` });
    } catch {
      // A dismissed or unavailable share sheet should not interrupt the feed.
    }
  };

  const addComment = () => {
    const body = commentDraft.trim();
    if (!selectedReel || !body) return;
    setCommentThreads((current) => ({
      ...current,
      [selectedReel.id]: [...(current[selectedReel.id] ?? []), body],
    }));
    setCommentCounts((current) => ({
      ...current,
      [selectedReel.id]: (current[selectedReel.id] ?? selectedReel.comments) + 1,
    }));
    setCommentDraft("");
  };

  const openCreator = () => router.push({ pathname: "/(tabs)/create", params: { mode: "reel" } });
  const selectedThread = useMemo(
    () => selectedReel ? commentThreads[selectedReel.id] ?? [] : [],
    [commentThreads, selectedReel],
  );

  return (
    <ScreenContainer safeAreaClassName="bg-black" className="bg-black">
      <View style={styles.screen} onLayout={onLayout}>
      {loading ? (
        <View style={styles.centerState}>
          <MaterialIcons name="movie" size={34} color={COLORS.terra} />
          <Text style={[styles.stateText, { fontFamily: bodyFont }]}>{copy.loadingReels}</Text>
        </View>
      ) : reels.length === 0 ? (
        <View style={styles.centerState}>
          <View style={styles.emptyIcon}><MaterialIcons name="movie-filter" size={30} color={COLORS.terra} /></View>
          <Text style={[styles.emptyTitle, { fontFamily: headingFont }]}>{copy.noReelsYet}</Text>
          <Text style={[styles.emptyText, { fontFamily: bodyFont }]}>{copy.beFirstReel}</Text>
          <Pressable onPress={openCreator} style={styles.emptyButton}>
            <MaterialIcons name="add" size={17} color={COLORS.white} />
            <Text style={[styles.emptyButtonText, { fontFamily: mediumFont }]}>{copy.createReel}</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={reels}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => {
            const state = engagement[item.id] ?? { liked: item.likedByMe, likes: item.likes };
            return (
              <View style={{ height: viewportHeight || undefined, flex: viewportHeight ? undefined : 1 }}>
                <ReelCard
                  reel={item}
                  stageWidth={stageWidth}
                  active={focused && !selectedReel && index === activeIndex}
                  muted={muted}
                  liked={state.liked}
                  likes={state.likes}
                  commentCount={commentCounts[item.id] ?? item.comments}
                  copy={copy}
                  onToggleMute={() => setMuted((value) => !value)}
                  onToggleLike={() => toggleLike(item)}
                  onOpenComments={() => setSelectedReel(item)}
                  onShare={() => void shareReel(item)}
                />
              </View>
            );
          }}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          pagingEnabled
          snapToAlignment="start"
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={REEL_VIEWABILITY_CONFIG}
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          windowSize={3}
          getItemLayout={(_, index) => ({ length: viewportHeight, offset: viewportHeight * index, index })}
        />
      )}

      <View pointerEvents="box-none" style={styles.headerOverlay}>
        <View style={styles.headerRow}>
          <View style={styles.headerTitleWrap}>
            <Text style={[styles.headerTitle, { fontFamily: headingFont }]}>{copy.reels}</Text>
            <View style={styles.headerSubRow}><View style={styles.liveDot} /><Text style={[styles.headerSubtitle, { fontFamily: bodyFont }]}>{copy.reelsIntro}</Text></View>
          </View>
          <Pressable onPress={openCreator} style={styles.createButton} accessibilityRole="button" accessibilityLabel={copy.createReel}>
            <MaterialIcons name="videocam" size={18} color={COLORS.white} />
            <Text style={[styles.createButtonText, { fontFamily: mediumFont }]}>{copy.createReel}</Text>
          </Pressable>
        </View>
      </View>

      <Modal
        visible={Boolean(selectedReel)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedReel(null)}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={() => setSelectedReel(null)} />
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.sheetWrap}>
            <View style={styles.sheet}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeading}>
                <Text style={[styles.sheetTitle, { fontFamily: headingFont }]}>{copy.comments}</Text>
                <Pressable onPress={() => setSelectedReel(null)} accessibilityLabel={copy.closeComments}>
                  <MaterialIcons name="close" size={22} color={Colors.light.inkNavy} />
                </Pressable>
              </View>
              <Text style={[styles.sheetCaption, { fontFamily: bodyFont }]} numberOfLines={2}>{selectedReel?.body}</Text>
              <FlatList
                data={selectedThread}
                keyExtractor={(_, index) => `reel-comment-${selectedReel?.id}-${index}`}
                contentContainerStyle={styles.commentList}
                ListEmptyComponent={<Text style={[styles.noComments, { fontFamily: bodyFont }]}>{copy.noReelComments}</Text>}
                renderItem={({ item }) => (
                  <View style={styles.commentRow}>
                    <Avatar profile={currentUser} size={30} />
                    <View style={styles.commentBubble}>
                      <Text style={[styles.commentAuthor, { fontFamily: mediumFont }]}>@{currentUser.handle}</Text>
                      <Text style={[styles.commentBody, { fontFamily: bodyFont }]}>{item}</Text>
                    </View>
                  </View>
                )}
              />
              <View style={styles.commentComposer}>
                <Avatar profile={currentUser} size={32} />
                <TextInput
                  value={commentDraft}
                  onChangeText={setCommentDraft}
                  placeholder={copy.replyPlaceholder}
                  placeholderTextColor={Colors.light.slate}
                  style={[styles.commentInput, { fontFamily: bodyFont }]}
                  returnKeyType="send"
                  onSubmitEditing={addComment}
                  maxLength={300}
                />
                <Pressable onPress={addComment} disabled={!commentDraft.trim()} style={[styles.sendButton, !commentDraft.trim() && styles.sendDisabled]}>
                  <MaterialIcons name="send" size={18} color={COLORS.white} />
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.black },
  reelPage: { flex: 1, alignItems: "center", backgroundColor: COLORS.black, overflow: "hidden" },
  reelStage: { flex: 1, position: "relative", backgroundColor: COLORS.black, overflow: "hidden" },
  videoFill: { width: "100%", height: "100%" },
  list: { flex: 1 },
  listContent: { flexGrow: 1 },
  topShade: { position: "absolute", top: 0, left: 0, right: 0, height: 170, backgroundColor: "rgba(0,0,0,0.18)" },
  bottomShade: { position: "absolute", bottom: 0, left: 0, right: 0, height: 255, backgroundColor: "rgba(0,0,0,0.62)" },
  reelOverlay: { ...StyleSheet.absoluteFill, justifyContent: "flex-end" },
  sideActions: { position: "absolute", right: 13, bottom: 35, alignItems: "center", gap: 18, zIndex: 4 },
  actionButton: { minWidth: 47, alignItems: "center", justifyContent: "center", gap: 4, padding: 3 },
  actionLabel: { color: COLORS.white, fontSize: 10, fontWeight: "800", textShadowColor: "rgba(0,0,0,0.75)", textShadowRadius: 5, textShadowOffset: { width: 0, height: 1 } },
  soundButton: { marginTop: 1, backgroundColor: "rgba(0,0,0,0.34)", borderRadius: 22, width: 40, height: 40 },
  creatorInfo: { position: "absolute", left: 17, right: 73, bottom: 28, zIndex: 3 },
  demoPill: { alignSelf: "flex-start", marginBottom: 9, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, backgroundColor: "rgba(46,107,74,0.9)", flexDirection: "row", alignItems: "center", gap: 4 },
  demoPillText: { color: COLORS.white, fontSize: 9, fontWeight: "900", letterSpacing: 0.4, textTransform: "uppercase" },
  creatorRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  creatorName: { color: COLORS.white, fontSize: 13, fontWeight: "900", maxWidth: 114, textShadowColor: "rgba(0,0,0,0.8)", textShadowRadius: 4 },
  followPill: { marginLeft: 3, borderWidth: 1, borderColor: "rgba(255,255,255,0.8)", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  followPillText: { color: COLORS.white, fontSize: 9, fontWeight: "800" },
  caption: { color: COLORS.white, fontSize: 13, lineHeight: 19, marginTop: 9, fontWeight: "600", textShadowColor: "rgba(0,0,0,0.75)", textShadowRadius: 4 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 8 },
  locationText: { color: COLORS.white, fontSize: 10, fontWeight: "700", flexShrink: 1 },
  tags: { color: "#F7D8C9", fontSize: 10, fontWeight: "800", marginTop: 5 },
  playIndicator: { position: "absolute", alignSelf: "center", top: "45%", width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(0,0,0,0.42)", alignItems: "center", justifyContent: "center", zIndex: 2 },
  headerOverlay: { ...StyleSheet.absoluteFill, justifyContent: "flex-start", zIndex: 8 },
  headerRow: { paddingHorizontal: 16, paddingTop: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitleWrap: { flex: 1, marginRight: 10 },
  headerTitle: { color: COLORS.white, fontSize: 24, fontWeight: "800", textShadowColor: "rgba(0,0,0,0.65)", textShadowRadius: 6 },
  headerSubRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  headerSubtitle: { color: "rgba(255,255,255,0.94)", fontSize: 10, fontWeight: "700", textShadowColor: "rgba(0,0,0,0.7)", textShadowRadius: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.dark.leafGreen },
  createButton: { backgroundColor: COLORS.terra, flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9, shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 4, elevation: 3 },
  createButtonText: { color: COLORS.white, fontSize: 10, fontWeight: "900" },
  centerState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, backgroundColor: COLORS.black },
  stateText: { color: COLORS.muted, fontSize: 12, marginTop: 10 },
  emptyIcon: { width: 64, height: 64, borderRadius: 21, backgroundColor: Colors.light.primaryContainer, alignItems: "center", justifyContent: "center" },
  emptyTitle: { color: COLORS.white, fontWeight: "700", fontSize: 23, marginTop: 18, textAlign: "center" },
  emptyText: { color: COLORS.muted, fontSize: 13, lineHeight: 19, textAlign: "center", marginTop: 8, maxWidth: 260 },
  emptyButton: { backgroundColor: COLORS.terra, flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 999, paddingHorizontal: 15, paddingVertical: 11, marginTop: 18 },
  emptyButtonText: { color: COLORS.white, fontSize: 12, fontWeight: "900" },
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.55)" },
  sheetWrap: { width: "100%", justifyContent: "flex-end" },
  sheet: { height: "64%", backgroundColor: COLORS.paper, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 17, paddingTop: 10, paddingBottom: Platform.OS === "ios" ? 24 : 14 },
  sheetHandle: { alignSelf: "center", width: 38, height: 4, backgroundColor: COLORS.line, borderRadius: 3, marginBottom: 12 },
  sheetHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sheetTitle: { color: Colors.light.inkNavy, fontSize: 20, fontWeight: "800" },
  sheetCaption: { color: Colors.light.slate, fontSize: 11, lineHeight: 16, marginTop: 7, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.line },
  commentList: { flexGrow: 1, paddingVertical: 8 },
  noComments: { color: Colors.light.slate, textAlign: "center", fontSize: 12, paddingVertical: 26 },
  commentRow: { flexDirection: "row", gap: 8, alignItems: "flex-start", marginBottom: 13 },
  commentBubble: { flex: 1, backgroundColor: Colors.light.paper, borderRadius: 13, padding: 10, borderWidth: 1, borderColor: COLORS.line },
  commentAuthor: { color: Colors.light.inkNavy, fontSize: 10, fontWeight: "900", marginBottom: 3 },
  commentBody: { color: Colors.light.inkNavy, fontSize: 12, lineHeight: 17 },
  commentComposer: { flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.line },
  commentInput: { flex: 1, minHeight: 42, maxHeight: 80, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: COLORS.line, backgroundColor: Colors.light.paper, color: Colors.light.inkNavy, fontSize: 12 },
  sendButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.terra, alignItems: "center", justifyContent: "center" },
  sendDisabled: { opacity: 0.42 },
});
