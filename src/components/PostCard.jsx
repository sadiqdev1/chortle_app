import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Colors, Fonts, REACTIONS, Radius } from "../constants/theme";
import { useBookmarks } from "../context/BookmarksContext";
import { formatRelativeDate } from "../utils/formatDate";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function fmtCount(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n ?? 0);
}

function ReactionBtn({ reaction, count, active, onPress }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePress() {
    scale.value = withSpring(1.35, { damping: 5, stiffness: 300 }, () => {
      scale.value = withSpring(1, { damping: 8, stiffness: 260 });
    });
    onPress();
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={reaction.id}
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderRadius: Radius.full,
        backgroundColor: active ? Colors.accentSoft : Colors.bgCard,
        borderWidth: 1.5,
        borderColor: active ? Colors.accent : Colors.border,
      }}
    >
      <Animated.Text style={[{ fontSize: 16 }, animStyle]}>
        {reaction.emoji}
      </Animated.Text>
      {count > 0 && (
        <Text
          style={{
            fontFamily: Fonts.semiBold,
            fontSize: 11,
            letterSpacing: 0.3,
            color: active ? Colors.accent : Colors.textMuted,
          }}
        >
          {fmtCount(count)}
        </Text>
      )}
    </TouchableOpacity>
  );
}

function PostActionsSheet({ visible, onClose, onAction }) {
  const actions = [
    { id: "save", label: "Save", icon: "bookmark-outline" },
    { id: "share", label: "Share", icon: "share-outline" },
    { id: "copy", label: "Copy link", icon: "link-outline" },
    { id: "hide", label: "Hide this post", icon: "eye-off-outline" },
    {
      id: "report",
      label: "Report",
      icon: "flag-outline",
      destructive: true,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.35)",
          justifyContent: "flex-end",
        }}
      >
        <Pressable
          onPress={() => {}}
          style={{
            backgroundColor: Colors.bg,
            borderTopLeftRadius: Radius.xxl,
            borderTopRightRadius: Radius.xxl,
            paddingTop: 12,
            paddingBottom: 32,
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              alignSelf: "center",
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: Colors.border,
              marginBottom: 16,
            }}
          />

          <Text
            style={{
              fontFamily: Fonts.friendly,
              fontSize: 18,
              letterSpacing: -0.1,
              color: Colors.textPrimary,
              marginBottom: 12,
            }}
          >
            Post options
          </Text>

          {actions.map((a) => (
            <TouchableOpacity
              key={a.id}
              onPress={() => {
                onAction(a.id);
                onClose();
              }}
              activeOpacity={0.6}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: Colors.border,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: Colors.bgCard,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name={a.icon}
                  size={18}
                  color={a.destructive ? Colors.error : Colors.textPrimary}
                />
              </View>
              <Text
                style={{
                  fontFamily: Fonts.friendly,
                  fontSize: 15,
                  color: a.destructive ? Colors.error : Colors.textPrimary,
                }}
              >
                {a.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function CommentsSheet({ visible, onClose, commentsCount }) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={{ flex: 1, backgroundColor: Colors.bg }}>
        <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: Colors.border,
            }}
          >
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: Colors.bgCard,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="arrow-back"
                  size={20}
                  color={Colors.textPrimary}
                />
              </View>
            </TouchableOpacity>

            <Text
              style={{
                fontFamily: Fonts.friendly,
                fontSize: 20,
                color: Colors.textPrimary,
                marginLeft: 14,
              }}
            >
              Comments
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingHorizontal: 32,
            }}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 24,
                  backgroundColor: Colors.bgCard,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Ionicons
                  name="chatbubble-outline"
                  size={30}
                  color={Colors.textMuted}
                />
              </View>

              <Text
                style={{
                  fontFamily: Fonts.friendly,
                  fontSize: 17,
                  color: Colors.textPrimary,
                  marginBottom: 8,
                  textAlign: "center",
                }}
              >
                {commentsCount === 0
                  ? "No comments yet"
                  : `${commentsCount} ${
                      commentsCount === 1 ? "comment" : "comments"
                    }`}
              </Text>

              <Text
                style={{
                  fontFamily: Fonts.regular,
                  fontSize: 15,
                  lineHeight: 22,
                  color: Colors.textSecondary,
                  textAlign: "center",
                }}
              >
                Comments will appear here once the thread is wired up.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

export default function PostCard({
  post,
  bookmarked,
  onToggleBookmark,
  onPress,
}) {
  const { getReactionState, toggleReaction } = useBookmarks();
  const { active: myReaction, counts: reactionCounts } =
    getReactionState(post);

  const [menuOpen, setMenuOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const author = post.creator ?? post.author;
  const commentsCount = post.commentsCount ?? post.comments_count ?? 0;

  async function handleAction(actionId) {
    switch (actionId) {
      case "save":
        onToggleBookmark?.();
        break;

      case "share":
        try {
          await Share.share({
            message: post.caption
              ? `${post.caption}\n\n— via Chortle`
              : "Check this out on Chortle",
          });
        } catch (e) {
          // user dismissed the share sheet
        }
        break;

      case "copy":
        // TODO: wire with expo-clipboard
        break;

      case "hide":
        // TODO: local hide via context
        break;

      case "report":
        // TODO: navigate to a report screen, or fire a report API
        break;

      default:
        break;
    }
  }

  return (
    <>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.93}
        style={{
          width: SCREEN_WIDTH,
          backgroundColor: Colors.bgElevated,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
        }}
      >
        {/* Author row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 14,
            paddingTop: 14,
            paddingBottom: 10,
            gap: 10,
          }}
        >
          {author?.avatar ? (
            <Image
              source={{ uri: author.avatar }}
              style={{ width: 38, height: 38, borderRadius: 19 }}
            />
          ) : (
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: Colors.bgCard,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: Colors.border,
              }}
            >
              <Ionicons name="person" size={18} color={Colors.textMuted} />
            </View>
          )}

          <View style={{ flex: 1 }}>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: Fonts.friendly,
                fontSize: 15,
                color: Colors.textPrimary,
              }}
            >
              {author?.name ?? "Anonymous"}
            </Text>

            <Text
              numberOfLines={1}
              style={{
                fontFamily: Fonts.regular,
                fontSize: 11,
                letterSpacing: 0.4,
                color: Colors.textMuted,
                marginTop: 1,
              }}
            >
              {author?.username ? `${author.username} · ` : ""}
              {formatRelativeDate(post.created_at)}
            </Text>
          </View>

          {post.tag ? (
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: Radius.full,
                backgroundColor: Colors.accentSoft,
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.semiBold,
                  fontSize: 10,
                  letterSpacing: 0.8,
                  color: Colors.accent,
                }}
              >
                {String(post.tag).toUpperCase()}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={() => setMenuOpen(true)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Post options"
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Caption */}
        {post.caption ? (
          <Text
            numberOfLines={3}
            style={{
              fontFamily: Fonts.regular,
              fontSize: 15,
              lineHeight: 22,
              color: Colors.textPrimary,
              paddingHorizontal: 14,
              paddingBottom: 12,
            }}
          >
            {post.caption}
          </Text>
        ) : null}

        {/* Media — full width */}
        {post.mediaUrl ? (
          <Image
            source={{ uri: post.mediaUrl }}
            style={{
              width: "100%",
              height: SCREEN_WIDTH,
              maxHeight: 480,
            }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: "100%",
              height: 200,
              backgroundColor: Colors.bgCard,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="image-outline"
              size={28}
              color={Colors.textMuted}
            />
          </View>
        )}

        {/* Reactions — one row, evenly split */}
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            paddingHorizontal: 14,
            paddingTop: 12,
          }}
        >
          {REACTIONS.map((r) => (
            <ReactionBtn
              key={r.id}
              reaction={r}
              count={reactionCounts[r.id] ?? post.reactions?.[r.id] ?? 0}
              active={myReaction === r.id}
              onPress={() => toggleReaction(post, r.id)}
            />
          ))}
        </View>

        {/* Action bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 8,
            paddingHorizontal: 14,
            paddingTop: 10,
            paddingBottom: 12,
          }}
        >
          <TouchableOpacity
            onPress={() => setCommentsOpen(true)}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              paddingHorizontal: 10,
              paddingVertical: 7,
              borderRadius: Radius.full,
              backgroundColor: Colors.bgCard,
              borderWidth: 1,
              borderColor: Colors.border,
            }}
          >
            <Ionicons
              name="chatbubble-outline"
              size={15}
              color={Colors.textSecondary}
            />
            <Text
              style={{
                fontFamily: Fonts.semiBold,
                fontSize: 12,
                letterSpacing: 0.3,
                color: Colors.textSecondary,
              }}
            >
              {fmtCount(commentsCount)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onToggleBookmark}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{
              width: 34,
              height: 34,
              borderRadius: Radius.md,
              backgroundColor: bookmarked
                ? Colors.accentSoft
                : Colors.bgCard,
              borderWidth: 1,
              borderColor: bookmarked ? Colors.accent : Colors.border,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name={bookmarked ? "bookmark" : "bookmark-outline"}
              size={16}
              color={bookmarked ? Colors.accent : Colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      <PostActionsSheet
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onAction={handleAction}
      />
      <CommentsSheet
        visible={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        commentsCount={commentsCount}
      />
    </>
  );
}