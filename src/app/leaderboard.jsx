import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts, Radius, Shadow } from "../constants/theme";
import { usePosts } from "../hooks/usePosts";

function totalReactions(post) {
  return Object.values(post.reactions ?? {}).reduce((s, n) => s + n, 0);
}

function fmtCount(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

const MEDAL_COLORS = {
  1: "#F5A623",
  2: "#9B9B9B",
  3: "#C47D3E",
};

function RankBadge({ rank }) {
  const isMedal = rank <= 3;
  return (
    <View
      style={{
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isMedal
          ? MEDAL_COLORS[rank] + "22"
          : Colors.bgCard,
      }}
    >
      {isMedal ? (
        <Ionicons
          name="medal-outline"
          size={17}
          color={MEDAL_COLORS[rank]}
        />
      ) : (
        <Text
          style={{
            fontFamily: Fonts.semiBold,
            fontSize: 13,
            color: Colors.textMuted,
          }}
        >
          {rank}
        </Text>
      )}
    </View>
  );
}

function CreatorRow({ rank, creator, total }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        gap: 12,
      }}
    >
      <RankBadge rank={rank} />

      {creator.avatar ? (
        <Image
          source={{ uri: creator.avatar }}
          style={{ width: 42, height: 42, borderRadius: 21 }}
        />
      ) : (
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: Colors.bgCard,
            borderWidth: 1,
            borderColor: Colors.border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name="person-outline"
            size={18}
            color={Colors.textMuted}
          />
        </View>
      )}

      <View style={{ flex: 1 }}>
        {/* Creator name — Fredoka */}
        <Text
          numberOfLines={1}
          style={{
            fontFamily: Fonts.friendly,
            fontSize: 15,
            letterSpacing: 0.1,
            color: Colors.textPrimary,
          }}
        >
          {creator.name}
        </Text>
        {creator.username ? (
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
            {creator.username}
          </Text>
        ) : null}
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: Radius.full,
          backgroundColor: Colors.accentSoft,
        }}
      >
        <Ionicons name="flame-outline" size={13} color={Colors.accent} />
        <Text
          style={{
            fontFamily: Fonts.semiBold,
            fontSize: 11,
            letterSpacing: 0.3,
            color: Colors.accent,
          }}
        >
          {fmtCount(total)}
        </Text>
      </View>
    </View>
  );
}

function TopMemeCard({ rank, post }) {
  const total = totalReactions(post);
  const isMedal = rank <= 3;
  return (
    <TouchableOpacity
      onPress={() =>
        router.push({ pathname: "/PostView", params: { id: post.id } })
      }
      activeOpacity={0.85}
      style={{
        width: 140,
        marginRight: 12,
        borderRadius: Radius.xl,
        backgroundColor: Colors.bgElevated,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: "hidden",
        ...Shadow.card,
      }}
    >
      <View style={{ position: "relative" }}>
        {post.mediaUrl ? (
          <Image
            source={{ uri: post.mediaUrl }}
            style={{ width: "100%", height: 100 }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: "100%",
              height: 100,
              backgroundColor: Colors.bgCard,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="image-outline"
              size={22}
              color={Colors.textMuted}
            />
          </View>
        )}

        <View
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            width: 26,
            height: 26,
            borderRadius: 8,
            backgroundColor: isMedal ? MEDAL_COLORS[rank] : Colors.bg + "EE",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isMedal ? (
            <Ionicons name="medal-outline" size={14} color="#fff" />
          ) : (
            <Text
              style={{
                fontFamily: Fonts.semiBold,
                fontSize: 11,
                color: Colors.textPrimary,
              }}
            >
              {rank}
            </Text>
          )}
        </View>
      </View>

      <View
        style={{
          padding: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
        }}
      >
        <Ionicons name="flame-outline" size={13} color={Colors.accent} />
        <Text
          style={{
            fontFamily: Fonts.semiBold,
            fontSize: 11,
            letterSpacing: 0.3,
            color: Colors.textMuted,
          }}
        >
          {fmtCount(total)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function LeaderboardScreen() {
  const { data: postsData, isLoading } = usePosts();

  const allPosts = useMemo(() => {
    const raw = postsData?.data ?? postsData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [postsData]);

  const topMemes = useMemo(
    () =>
      [...allPosts]
        .sort((a, b) => totalReactions(b) - totalReactions(a))
        .slice(0, 10),
    [allPosts]
  );

  const topCreators = useMemo(() => {
    const byCreator = {};
    allPosts.forEach((post) => {
      const id = post.creator?.id ?? post.creator?.name;
      if (!id) return;
      if (!byCreator[id]) byCreator[id] = { creator: post.creator, total: 0 };
      byCreator[id].total += totalReactions(post);
    });
    return Object.values(byCreator)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [allPosts]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 11,
              backgroundColor: Colors.accentSoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="trophy-outline" size={18} color={Colors.accent} />
          </View>

          {/* Title — Fredoka */}
          <Text
            style={{
              fontFamily: Fonts.friendly,
              fontSize: 26,
              letterSpacing: -0.2,
              color: Colors.textPrimary,
            }}
          >
            Leaderboard
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color={Colors.accent} style={{ marginTop: 60 }} />
        ) : allPosts.length === 0 ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 32,
            }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                backgroundColor: Colors.bgCard,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Ionicons
                name="trophy-outline"
                size={28}
                color={Colors.textMuted}
              />
            </View>

            {/* Empty heading — Fredoka */}
            <Text
              style={{
                fontFamily: Fonts.friendly,
                fontSize: 17,
                color: Colors.textPrimary,
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              Nothing to rank yet
            </Text>

            {/* Empty body — Inter */}
            <Text
              style={{
                fontFamily: Fonts.regular,
                fontSize: 15,
                lineHeight: 22,
                color: Colors.textSecondary,
                textAlign: "center",
              }}
            >
              Once memes start getting reactions, rankings show up here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={[]}
            keyExtractor={() => "x"}
            renderItem={null}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={{ paddingHorizontal: 24, paddingBottom: 40 }}>
                {/* Section heading — Fredoka */}
                <Text
                  style={{
                    fontFamily: Fonts.friendly,
                    fontSize: 17,
                    color: Colors.textPrimary,
                    marginBottom: 14,
                  }}
                >
                  Top Memes
                </Text>
                <FlatList
                  data={topMemes}
                  keyExtractor={(p) => String(p.id)}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ marginBottom: 32 }}
                  renderItem={({ item, index }) => (
                    <TopMemeCard rank={index + 1} post={item} />
                  )}
                />

                {/* Section heading — Fredoka */}
                <Text
                  style={{
                    fontFamily: Fonts.friendly,
                    fontSize: 17,
                    color: Colors.textPrimary,
                    marginBottom: 4,
                  }}
                >
                  Top Creators
                </Text>
                {topCreators.map((entry, index) => (
                  <CreatorRow
                    key={entry.creator?.id ?? entry.creator?.name ?? index}
                    rank={index + 1}
                    creator={entry.creator}
                    total={entry.total}
                  />
                ))}
              </View>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}