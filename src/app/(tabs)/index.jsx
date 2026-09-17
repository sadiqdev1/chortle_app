import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import PostCard from "../../components/PostCard";
import {
  CATEGORIES,
  Colors,
  Fonts,
  MOCK_MEMES,
  Radius,
} from "../../constants/theme";
import { useBookmarks } from "../../context/BookmarksContext";
import { useAuth } from "../../hooks/useAuth";
import { usePosts } from "../../hooks/usePosts";

const HEADER_ROW_HEIGHT = 68;
const FEED_TABS_HEIGHT = 46;
const HEADER_HEIGHT = HEADER_ROW_HEIGHT + FEED_TABS_HEIGHT;

function FeedTab({ label, active, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        height: FEED_TABS_HEIGHT,
      }}
    >
      <Text
        style={{
          fontFamily: Fonts.friendly,
          fontSize: 15,
          letterSpacing: 0.2,
          color: active ? Colors.textPrimary : Colors.textMuted,
        }}
      >
        {label}
      </Text>

      {active && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            height: 3,
            width: 54,
            borderRadius: 3,
            backgroundColor: Colors.accent,
          }}
        />
      )}
    </TouchableOpacity>
  );
}

function FilterSheet({
  visible,
  onClose,
  categories,
  selected,
  onSelect,
  onClear,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Dim backdrop */}
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.35)",
          justifyContent: "flex-end",
        }}
      >
        {/* Sheet content — stopPropagation by wrapping in Pressable without onPress */}
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
          {/* Grab handle */}
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

          {/* Header row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 18,
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.friendly,
                fontSize: 20,
                letterSpacing: -0.1,
                color: Colors.textPrimary,
              }}
            >
              Filter
            </Text>

            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: Colors.bgCard,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="close"
                  size={18}
                  color={Colors.textPrimary}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Section label */}
          <Text
            style={{
              fontFamily: Fonts.friendly,
              fontSize: 12,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: Colors.textMuted,
              marginBottom: 12,
            }}
          >
            Categories
          </Text>

          {/* Category grid */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 10,
              marginBottom: 24,
            }}
          >
            {categories.map((c) => {
              const active = selected === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => onSelect(c.id)}
                  activeOpacity={0.7}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: Radius.full,
                    backgroundColor: active
                      ? Colors.accent
                      : Colors.bgCard,
                    borderWidth: 1.5,
                    borderColor: active
                      ? Colors.accent
                      : Colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: Fonts.friendly,
                      fontSize: 14,
                      letterSpacing: 0.2,
                      color: active
                        ? Colors.textInverse
                        : Colors.textSecondary,
                    }}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Actions */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={onClear}
              activeOpacity={0.7}
              style={{
                flex: 1,
                height: 50,
                borderRadius: Radius.lg,
                borderWidth: 1.5,
                borderColor: Colors.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.friendly,
                  fontSize: 15,
                  letterSpacing: 0.2,
                  color: Colors.textPrimary,
                }}
              >
                Clear
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.85}
              style={{
                flex: 2,
                height: 50,
                borderRadius: Radius.lg,
                backgroundColor: Colors.accent,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.friendly,
                  fontSize: 15,
                  letterSpacing: 0.2,
                  color: Colors.textInverse,
                }}
              >
                Apply
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const [activeCategory, setActiveCategory] = useState("all");
  const [activeFeed, setActiveFeed] = useState("for-you");
  const [refreshing, setRefreshing] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const { user } = useAuth();
  const { isBookmarked, toggleBookmark } = useBookmarks();

  const { data: postsData, isLoading, refetch } = usePosts(
    activeCategory !== "all"
      ? {
          tag: activeCategory,
          ...(activeFeed === "following" && { feed: "following" }),
        }
      : activeFeed === "following"
        ? { feed: "following" }
        : {}
  );

  const allPosts = useMemo(() => {
    const raw = postsData?.data ?? postsData ?? [];
    const list = Array.isArray(raw) ? raw : [];
    return list.length > 0 ? list : MOCK_MEMES;
  }, [postsData]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "GOOD MORNING";
    if (hour < 17) return "GOOD AFTERNOON";
    return "GOOD EVENING";
  }, []);

  const hasActiveFilter = activeCategory !== "all";
  const activeCategoryLabel =
    CATEGORIES.find((c) => c.id === activeCategory)?.label ?? "All";

  /* ============================================================
     SCROLL-DRIVEN HEADER
  ============================================================ */

  const hideProgress = useSharedValue(0);
  const lastScrollY = useSharedValue(0);

  const headerOffset = -(HEADER_HEIGHT + insets.top);
  const headerVisibleOffset = 0;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const y = event.contentOffset.y;
      const delta = y - lastScrollY.value;

      if (y <= 8) {
        hideProgress.value = withTiming(0, { duration: 150 });
      } else if (delta > 4 && y > HEADER_HEIGHT) {
        hideProgress.value = withTiming(1, { duration: 200 });
      } else if (delta < -4) {
        hideProgress.value = withTiming(0, { duration: 200 });
      }

      lastScrollY.value = y;
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      hideProgress.value,
      [0, 1],
      [headerVisibleOffset, headerOffset],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      hideProgress.value,
      [0, 0.7, 1],
      [1, 0.6, 0],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await refetch?.();
    } finally {
      setRefreshing(false);
    }
  }

  /* ============================================================
     EMPTY STATE
  ============================================================ */

  const isFollowingEmpty = activeFeed === "following";

  const emptyTitle = isFollowingEmpty
    ? "Your following feed is empty"
    : hasActiveFilter
      ? `Nothing in ${activeCategoryLabel} yet`
      : "Nothing here yet";

  const emptyMessage = isFollowingEmpty
    ? "Follow some creators and their memes will show up here."
    : hasActiveFilter
      ? "Try a different category, or clear the filter."
      : "Be the first to post a meme.";

  /* ============================================================
     FLOATING HEADER
  ============================================================ */

  const Header = (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          paddingTop: insets.top,
          height: HEADER_HEIGHT + insets.top,
          backgroundColor: Colors.bg,
        },
        headerStyle,
      ]}
    >
      {/* Greeting row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          height: HEADER_ROW_HEIGHT,
        }}
      >
        <View>
          <Text
            style={{
              fontFamily: Fonts.medium,
              fontSize: 11,
              letterSpacing: 2,
              color: Colors.textMuted,
              marginBottom: 2,
            }}
          >
            {greeting}
          </Text>

          <View
            style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
          >
            <Text
              style={{
                fontFamily: Fonts.friendly,
                fontSize: 24,
                letterSpacing: -0.2,
                color: Colors.textPrimary,
              }}
            >
              {user?.name?.split(" ")[0] ?? "there"}
            </Text>
            <View
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="sunny-outline"
                size={16}
                color={Colors.accent}
              />
            </View>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={() => router.push("/Notifications")}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            style={{
              width: 40,
              height: 40,
              borderRadius: 13,
              backgroundColor: Colors.bgCard,
              borderWidth: 0.5,
              borderColor: Colors.border,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="notifications-outline"
              size={20}
              color={Colors.textSecondary}
            />
            <View
              style={{
                position: "absolute",
                top: 8,
                right: 9,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: Colors.accent,
                borderWidth: 1.5,
                borderColor: Colors.bgCard,
              }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/search")}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Search"
            style={{
              width: 40,
              height: 40,
              borderRadius: 13,
              backgroundColor: Colors.bgCard,
              borderWidth: 0.5,
              borderColor: Colors.border,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="search-outline"
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/profile")}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Profile"
            style={{
              width: 40,
              height: 40,
              borderRadius: 13,
              backgroundColor: Colors.bgCard,
              borderWidth: 0.5,
              borderColor: Colors.border,
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                style={{ width: 40, height: 40, borderRadius: 13 }}
              />
            ) : (
              <Ionicons
                name="person-outline"
                size={20}
                color={Colors.textSecondary}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Feed tabs + filter button */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          height: FEED_TABS_HEIGHT,
          borderBottomWidth: 1,
          borderBottomColor: Colors.borderLight,
        }}
      >
        <FeedTab
          label="For You"
          active={activeFeed === "for-you"}
          onPress={() => setActiveFeed("for-you")}
        />
        <FeedTab
          label="Following"
          active={activeFeed === "following"}
          onPress={() => setActiveFeed("following")}
        />

        {/* Filter button */}
        <TouchableOpacity
          onPress={() => setFilterOpen(true)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Open filter"
          style={{
            width: 40,
            height: 40,
            marginLeft: 8,
            borderRadius: 13,
            backgroundColor: hasActiveFilter
              ? Colors.accentSoft
              : Colors.bgCard,
            borderWidth: hasActiveFilter ? 1.5 : 0.5,
            borderColor: hasActiveFilter
              ? Colors.accent
              : Colors.border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name="options-outline"
            size={19}
            color={hasActiveFilter ? Colors.accent : Colors.textSecondary}
          />
          {hasActiveFilter && (
            <View
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: Colors.accent,
                borderWidth: 1.5,
                borderColor: Colors.accentSoft,
              }}
            />
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  /* ============================================================
     LIST HEADER
  ============================================================ */

  const ListHeader = (
    <>
      <View style={{ height: HEADER_HEIGHT + insets.top }} />

      {/* Active filter chip (only visible when a category is selected) */}
      {hasActiveFilter ? (
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 20,
            paddingTop: 14,
            paddingBottom: 4,
          }}
        >
          <TouchableOpacity
            onPress={() => setActiveCategory("all")}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: Radius.full,
              backgroundColor: Colors.accentSoft,
              borderWidth: 1.5,
              borderColor: Colors.accentDim,
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.friendly,
                fontSize: 13,
                letterSpacing: 0.2,
                color: Colors.accent,
              }}
            >
              {activeCategoryLabel}
            </Text>
            <Ionicons name="close" size={13} color={Colors.accent} />
          </TouchableOpacity>
        </View>
      ) : null}
    </>
  );

  const EmptyState = (
    <View
      style={{
        alignItems: "center",
        paddingTop: 60,
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
          name={isFollowingEmpty ? "people-outline" : "images-outline"}
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
        {emptyTitle}
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
        {emptyMessage}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      {Header}

      <Animated.FlatList
        data={isLoading ? [] : allPosts}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingHorizontal: 0,
          paddingBottom: 50,
        }}
        ListHeaderComponent={ListHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.accent}
            colors={[Colors.accent]}
            progressViewOffset={HEADER_HEIGHT + insets.top}
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator
              color={Colors.accent}
              style={{ marginTop: 40 }}
            />
          ) : (
            EmptyState
          )
        }
        renderItem={({ item: post }) => (
          <PostCard
            post={post}
            bookmarked={isBookmarked(post.id)}
            onToggleBookmark={() => toggleBookmark(post)}
            onPress={() =>
              router.push({
                pathname: "/PostView",
                params: { id: post.id },
              })
            }
          />
        )}
      />

      <FilterSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        categories={CATEGORIES}
        selected={activeCategory}
        onSelect={(id) => {
          setActiveCategory(id);
          setFilterOpen(false);
        }}
        onClear={() => {
          setActiveCategory("all");
          setFilterOpen(false);
        }}
      />
    </View>
  );
}