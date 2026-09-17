import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts, Radius } from "../../constants/theme";

// ── Notification types and their visual treatment ───────────────────────────
const NOTIFICATION_STYLES = {
  reaction: {
    icon: "heart",
    color: "#E5484D",
    bg: "#FFE8E8",
    verb: "reacted to your meme",
  },
  comment: {
    icon: "chatbubble",
    color: "#3D1B83",
    bg: "#EDE7FA",
    verb: "commented on your meme",
  },
  follow: {
    icon: "person-add",
    color: "#2F6B4F",
    bg: "#E3F0E8",
    verb: "started following you",
  },
  mention: {
    icon: "at",
    color: "#8A6D1B",
    bg: "#FBF1D4",
    verb: "mentioned you in a comment",
  },
  bookmark: {
    icon: "bookmark",
    color: "#3D1B83",
    bg: "#EDE7FA",
    verb: "saved your meme",
  },
};

// Fallback mock data so the screen renders without a backend wired up
const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    type: "reaction",
    read: false,
    createdAt: "2m",
    user: { name: "Aisha Bello", username: "@aisha", avatar: null },
    postThumbnail: null,
  },
  {
    id: "2",
    type: "follow",
    read: false,
    createdAt: "12m",
    user: { name: "Tunde Okafor", username: "@tunde", avatar: null },
  },
  {
    id: "3",
    type: "comment",
    read: false,
    createdAt: "1h",
    user: { name: "Chidi Nwosu", username: "@chidi", avatar: null },
    preview: "This is exactly how I feel on Mondays 😂",
    postThumbnail: null,
  },
  {
    id: "4",
    type: "reaction",
    read: true,
    createdAt: "3h",
    user: { name: "Fatima Yusuf", username: "@fatima", avatar: null },
    postThumbnail: null,
  },
  {
    id: "5",
    type: "mention",
    read: true,
    createdAt: "1d",
    user: { name: "Emeka Obi", username: "@emeka", avatar: null },
    preview: "@you should see this one",
    postThumbnail: null,
  },
];

// ── Single notification row ─────────────────────────────────────────────────
function NotificationRow({ item, onPress }) {
  const style = NOTIFICATION_STYLES[item.type] ?? NOTIFICATION_STYLES.reaction;
  const unread = !item.read;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${item.user.name} ${style.verb}`}
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        paddingHorizontal: 20,
        paddingVertical: 14,
        backgroundColor: unread ? Colors.accentSoft + "55" : "transparent",
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        gap: 12,
      }}
    >
      {/* Avatar + type badge */}
      <View style={{ position: "relative" }}>
        {item.user?.avatar ? (
          <Image
            source={{ uri: item.user.avatar }}
            style={{ width: 44, height: 44, borderRadius: 22 }}
          />
        ) : (
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: Colors.bgCard,
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

        {/* Type badge — small circle with the action icon */}
        <View
          style={{
            position: "absolute",
            bottom: -2,
            right: -2,
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: style.bg,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor: Colors.bg,
          }}
        >
          <Ionicons name={style.icon} size={11} color={style.color} />
        </View>
      </View>

      {/* Body */}
      <View style={{ flex: 1 }}>
        {/* Name + action — Fredoka, brand voice */}
        <Text
          numberOfLines={2}
          style={{
            fontFamily: Fonts.friendly,
            fontSize: 15,
            lineHeight: 20,
            letterSpacing: 0.1,
            color: Colors.textPrimary,
          }}
        >
          {item.user?.name ?? "Someone"}{" "}
          <Text
            style={{
              fontFamily: Fonts.regular,
              fontSize: 15,
              color: Colors.textSecondary,
            }}
          >
            {style.verb}
          </Text>
        </Text>

        {/* Preview text (comment / mention) — Inter */}
        {item.preview ? (
          <Text
            numberOfLines={2}
            style={{
              fontFamily: Fonts.regular,
              fontSize: 13,
              lineHeight: 18,
              color: Colors.textSecondary,
              marginTop: 4,
            }}
          >
            {item.preview}
          </Text>
        ) : null}

        {/* Timestamp — Inter, muted metadata */}
        <Text
          style={{
            fontFamily: Fonts.regular,
            fontSize: 11,
            letterSpacing: 0.3,
            color: Colors.textMuted,
            marginTop: 4,
          }}
        >
          {item.createdAt}
        </Text>
      </View>

      {/* Post thumbnail (reaction / comment) */}
      {item.postThumbnail ? (
        <Image
          source={{ uri: item.postThumbnail }}
          style={{ width: 44, height: 44, borderRadius: Radius.md }}
        />
      ) : null}

      {/* Unread dot */}
      {unread ? (
        <View
          style={{
            position: "absolute",
            top: 18,
            right: 12,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: Colors.accent,
          }}
        />
      ) : null}
    </TouchableOpacity>
  );
}

// ── Screen ──────────────────────────────────────────────────────────────────
export default function NotificationsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "unread"

  // 🔌 Replace with: const { data, isLoading, refetch } = useNotifications();
  const isLoading = false;
  const notifications = MOCK_NOTIFICATIONS;

  const filtered = useMemo(() => {
    if (activeTab === "unread") {
      return notifications.filter((n) => !n.read);
    }
    return notifications;
  }, [notifications, activeTab]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  async function handleRefresh() {
    setRefreshing(true);
    // 🔌 Replace with: await refetch();
    setTimeout(() => setRefreshing(false), 600);
  }

  function handlePress(item) {
    if (item.type === "follow") {
      router.push({
        pathname: "/Profile",
        params: { username: item.user?.username?.replace("@", "") },
      });
      return;
    }
    // reaction / comment / mention / bookmark → open the post
    if (item.postId) {
      router.push({ pathname: "/PostView", params: { id: item.postId } });
    }
  }

  function handleMarkAllRead() {
    // 🔌 Replace with: await markAllNotificationsRead();
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 16,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {/* Title — Fredoka */}
            <Text
              style={{
                fontFamily: Fonts.friendly,
                fontSize: 26,
                letterSpacing: -0.2,
                color: Colors.textPrimary,
              }}
            >
              Notifications
            </Text>

            {/* Unread count pill */}
            {unreadCount > 0 ? (
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: Radius.full,
                  backgroundColor: Colors.accent,
                  minWidth: 22,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: Fonts.semiBold,
                    fontSize: 11,
                    letterSpacing: 0.3,
                    color: Colors.textInverse,
                  }}
                >
                  {unreadCount}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Mark all read — Fredoka inline action */}
          {unreadCount > 0 ? (
            <TouchableOpacity
              onPress={handleMarkAllRead}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Mark all as read"
            >
              <Text
                style={{
                  fontFamily: Fonts.friendly,
                  fontSize: 13,
                  letterSpacing: 0.2,
                  color: Colors.accent,
                }}
              >
                Mark all read
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Tabs: All / Unread */}
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 20,
            gap: 8,
            marginBottom: 12,
          }}
        >
          {[
            { id: "all", label: "All" },
            { id: "unread", label: "Unread" },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: Radius.full,
                  backgroundColor: active ? Colors.accent : Colors.bgCard,
                  borderWidth: 1.5,
                  borderColor: active ? Colors.accent : Colors.border,
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
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* List */}
        {isLoading ? (
          <ActivityIndicator
            color={Colors.accent}
            style={{ marginTop: 60 }}
          />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.id)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 60, flexGrow: 1 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={Colors.accent}
                colors={[Colors.accent]}
              />
            }
            renderItem={({ item }) => (
              <NotificationRow item={item} onPress={() => handlePress(item)} />
            )}
            ListEmptyComponent={
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingTop: 80,
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
                    name="notifications-outline"
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
                  {activeTab === "unread"
                    ? "You're all caught up"
                    : "No notifications yet"}
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
                  {activeTab === "unread"
                    ? "New reactions, comments, and follows will show up here."
                    : "When people react to your memes or follow you, you'll see it here."}
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}