import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  Share,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
// import { REACTION_ICONS } from "../assets/reactions";
import { Colors, Fonts, REACTIONS, Radius } from "../constants/theme";
import { useBookmarks } from "../context/BookmarksContext";
import { usePost } from "../hooks/usePosts";

const { width } = Dimensions.get("window");

function ReactionButton({ reaction, count, active, onPress }) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePress() {
    scale.value = withSpring(1.25, { damping: 6, stiffness: 300 }, () => {
      scale.value = withSpring(1, { damping: 8, stiffness: 300 });
    });
    onPress();
  }

  const iconSource = REACTION_ICONS?.[reaction.id];

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={reaction.id}
      style={{ flex: 1, alignItems: "center" }}
    >
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 18,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: active ? Colors.accentSoft : Colors.bgCard,
          borderWidth: 1.5,
          borderColor: active ? Colors.accent : Colors.border,
          marginBottom: 6,
        }}
      >
        <Animated.View style={style}>
          {iconSource ? (
            <Image
              source={iconSource}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          ) : (
            <Text style={{ fontSize: 22 }}>{reaction.emoji}</Text>
          )}
        </Animated.View>
      </View>

      {/* Count — Inter, tabular metadata */}
      <Text
        style={{
          fontFamily: Fonts.semiBold,
          fontSize: 11,
          letterSpacing: 0.3,
          color: active ? Colors.accent : Colors.textMuted,
        }}
      >
        {count}
      </Text>
    </TouchableOpacity>
  );
}

export default function PostViewScreen() {
  const { id } = useLocalSearchParams();
  const { data: postData, isLoading, isError } = usePost(id);
  const post = postData?.data ?? postData;

  const { isBookmarked, toggleBookmark, getReactionState, toggleReaction } =
    useBookmarks();

  async function handleShare() {
    if (!post) return;
    await Share.share({
      message: post.caption
        ? `${post.caption} — check this out`
        : "Check this out",
    });
  }

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  if (isError || !post) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.bg,
          alignItems: "center",
          justifyContent: "center",
          padding: 28,
        }}
      >
        <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
        <Ionicons
          name="alert-circle-outline"
          size={32}
          color={Colors.textMuted}
          style={{ marginBottom: 16 }}
        />

        {/* Error heading — Fredoka */}
        <Text
          style={{
            fontFamily: Fonts.friendly,
            fontSize: 18,
            color: Colors.textPrimary,
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          Meme not found
        </Text>

        {/* Error body — Inter */}
        <Text
          style={{
            fontFamily: Fonts.regular,
            fontSize: 15,
            lineHeight: 22,
            color: Colors.textSecondary,
            textAlign: "center",
            marginBottom: 28,
          }}
        >
          It may have been removed, or the link is out of date.
        </Text>

        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
          {/* Inline action — Fredoka */}
          <Text
            style={{
              fontFamily: Fonts.friendly,
              fontSize: 15,
              letterSpacing: 0.2,
              color: Colors.accent,
            }}
          >
            Go back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const saved = isBookmarked(post.id);
  const { active: myReaction, counts: reactionCounts } = getReactionState(post);
  const commentsCount = post.commentsCount ?? post.comments_count ?? 0;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={{ position: "relative" }}>
          {post.mediaUrl ? (
            <Image
              source={{ uri: post.mediaUrl }}
              style={{ width, height: 380 }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                width,
                height: 260,
                backgroundColor: Colors.bgCard,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="image-outline"
                size={40}
                color={Colors.textMuted}
              />
            </View>
          )}

          <SafeAreaView
            edges={["top"]}
            style={{ position: "absolute", top: 0, left: 0, right: 0 }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 16,
                paddingTop: 8,
              }}
            >
              <TouchableOpacity
                onPress={() => router.back()}
                accessibilityRole="button"
                accessibilityLabel="Back"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 13,
                  backgroundColor: Colors.bg + "CC",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="arrow-back"
                  size={20}
                  color={Colors.textPrimary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShare}
                accessibilityRole="button"
                accessibilityLabel="Share"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 13,
                  backgroundColor: Colors.bg + "CC",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="share-outline"
                  size={20}
                  color={Colors.textPrimary}
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {post.tag ? (
            <View
              style={{
                position: "absolute",
                bottom: 16,
                left: 16,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: Radius.full,
                backgroundColor: Colors.accentSoft,
              }}
            >
              {/* Tag pill — Fredoka */}
              <Text
                style={{
                  fontFamily: Fonts.friendly,
                  fontSize: 12,
                  letterSpacing: 0.6,
                  color: Colors.accent,
                }}
              >
                {post.tag.toUpperCase()}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          {/* Caption — Fredoka, this is the headline of the post */}
          {post.caption ? (
            <Text
              style={{
                fontFamily: Fonts.friendly,
                fontSize: 21,
                lineHeight: 28,
                letterSpacing: -0.1,
                color: Colors.textPrimary,
                marginBottom: 20,
              }}
            >
              {post.caption}
            </Text>
          ) : null}

          {/* Author card */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 14,
              backgroundColor: Colors.bgCard,
              borderRadius: Radius.xl,
              borderWidth: 1,
              borderColor: Colors.border,
              marginBottom: 24,
            }}
          >
            {post.creator?.avatar ? (
              <Image
                source={{ uri: post.creator.avatar }}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  marginRight: 12,
                }}
              />
            ) : (
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  marginRight: 12,
                  backgroundColor: Colors.bg,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={Colors.textMuted}
                />
              </View>
            )}
            <View style={{ flex: 1 }}>
              {/* Author name — Fredoka */}
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: Fonts.friendly,
                  fontSize: 15,
                  letterSpacing: 0.1,
                  color: Colors.textPrimary,
                }}
              >
                {post.creator?.name ?? "Unknown"}
              </Text>

              {/* Timestamp — Inter */}
              <Text
                style={{
                  fontFamily: Fonts.regular,
                  fontSize: 13,
                  color: Colors.textMuted,
                  marginTop: 1,
                }}
              >
                {post.createdAt ?? ""}
              </Text>
            </View>
          </View>

          {/* Reaction bar */}
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}>
            {REACTIONS.map((r) => (
              <ReactionButton
                key={r.id}
                reaction={r}
                count={reactionCounts[r.id] ?? 0}
                active={myReaction === r.id}
                onPress={() => toggleReaction(post, r.id)}
              />
            ))}
          </View>

          {/* Comments / Save row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 14,
              backgroundColor: Colors.bgCard,
              borderRadius: Radius.xl,
              borderWidth: 1,
              borderColor: Colors.border,
              gap: 4,
            }}
          >
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Ionicons
                name="chatbubble-outline"
                size={18}
                color={Colors.textSecondary}
              />
              {/* Comments count — Inter */}
              <Text
                style={{
                  fontFamily: Fonts.regular,
                  fontSize: 13,
                  color: Colors.textSecondary,
                }}
              >
                {commentsCount}{" "}
                {commentsCount === 1 ? "comment" : "comments"}
              </Text>
            </View>

            <View
              style={{
                width: 1,
                height: 24,
                backgroundColor: Colors.border,
              }}
            />

            <TouchableOpacity
              onPress={() => toggleBookmark(post)}
              accessibilityRole="button"
              accessibilityLabel={saved ? "Remove bookmark" : "Save post"}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                paddingVertical: 6,
                borderRadius: Radius.md,
                backgroundColor: saved ? Colors.accentSoft : "transparent",
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name={saved ? "bookmark" : "bookmark-outline"}
                size={18}
                color={saved ? Colors.accent : Colors.textSecondary}
              />
              {/* Save label — Fredoka */}
              <Text
                style={{
                  fontFamily: Fonts.friendly,
                  fontSize: 14,
                  letterSpacing: 0.2,
                  color: saved ? Colors.accent : Colors.textSecondary,
                }}
              >
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}