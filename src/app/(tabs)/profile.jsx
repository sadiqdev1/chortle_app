import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
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
import PostCard from "../../components/PostCard";
import { Colors, Fonts, Radius } from "../../constants/theme";
import { useBookmarks } from "../../context/BookmarksContext";
import { useAuth } from "../../hooks/useAuth";
import { usePosts } from "../../hooks/usePosts";

const TABS = ["My Memes", "Saved"];

function TabButton({ label, active, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      style={{ flex: 1, alignItems: "center" }}
    >
      <Text
        style={{
          fontFamily: Fonts.friendly,
          fontSize: 15,
          letterSpacing: 0.2,
          color: active ? Colors.accent : Colors.textMuted,
          marginBottom: 10,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          height: 2,
          width: "100%",
          backgroundColor: active ? Colors.accent : Colors.border,
          borderRadius: 1,
        }}
      />
    </TouchableOpacity>
  );
}

function StatBlock({ value, label }) {
  return (
    <View style={{ alignItems: "center", flex: 1 }}>
      <Text
        style={{
          fontFamily: Fonts.friendly,
          fontSize: 19,
          letterSpacing: 0.1,
          color: Colors.textPrimary,
          marginBottom: 2,
        }}
      >
        {value ?? 0}
      </Text>
      <Text
        style={{
          fontFamily: Fonts.regular,
          fontSize: 13,
          color: Colors.textMuted,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function EmptyTabState({ icon, title, message }) {
  return (
    <View
      style={{ alignItems: "center", paddingTop: 48, paddingHorizontal: 32 }}
    >
      <Ionicons
        name={icon}
        size={28}
        color={Colors.textMuted}
        style={{ marginBottom: 14 }}
      />

      <Text
        style={{
          fontFamily: Fonts.friendly,
          fontSize: 17,
          color: Colors.textPrimary,
          marginBottom: 6,
          textAlign: "center",
        }}
      >
        {title}
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
        {message}
      </Text>
    </View>
  );
}

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [signingOut, setSigningOut] = useState(false);

  const { user, logout } = useAuth();
  const { isBookmarked, toggleBookmark, savedPosts } = useBookmarks();

  const { data: myMemesData, isLoading: memesLoading } = usePosts(
    user?.id ? { creator: user.id } : {}
  );
  const myMemes = myMemesData?.data ?? myMemesData ?? [];

  function openPost(id) {
    router.push({ pathname: "/PostView", params: { id } });
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await logout();
      router.replace("/(auth)/Login");
    } finally {
      setSigningOut(false);
    }
  }

  const listData = activeTab === "Saved" ? savedPosts : myMemes;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <FlatList
          data={listData}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: 24,
            flexGrow: 1,
          }}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              bookmarked={isBookmarked(item.id)}
              onToggleBookmark={() => toggleBookmark(item)}
              onPress={() => openPost(item.id)}
            />
          )}
          ListHeaderComponent={
            <View>
              {/* Top row */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 12,
                  marginBottom: 24,
                }}
              >
                <Text
                  style={{
                    fontFamily: Fonts.friendly,
                    fontSize: 26,
                    letterSpacing: -0.2,
                    color: Colors.textPrimary,
                  }}
                >
                  Profile
                </Text>

                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TouchableOpacity
                    hitSlop={10}
                    onPress={signingOut ? undefined : handleSignOut}
                    disabled={signingOut}
                    accessibilityRole="button"
                    accessibilityLabel="Sign out"
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      backgroundColor: Colors.bgCard,
                      borderWidth: 1,
                      borderColor: Colors.border,
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: signingOut ? 0.5 : 1,
                    }}
                  >
                    <Ionicons
                      name="log-out-outline"
                      size={20}
                      color={Colors.error}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    hitSlop={10}
                    onPress={() => router.push("/Settings")}
                    accessibilityRole="button"
                    accessibilityLabel="Settings"
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      backgroundColor: Colors.bgCard,
                      borderWidth: 1,
                      borderColor: Colors.border,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name="settings-outline"
                      size={20}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Avatar + identity */}
              <View style={{ alignItems: "center", marginBottom: 24 }}>
                {user?.avatar ? (
                  <Image
                    source={{ uri: user.avatar }}
                    style={{
                      width: 84,
                      height: 84,
                      borderRadius: 42,
                      marginBottom: 14,
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: 84,
                      height: 84,
                      borderRadius: 42,
                      marginBottom: 14,
                      backgroundColor: Colors.bgCard,
                      borderWidth: 1,
                      borderColor: Colors.border,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name="person-outline"
                      size={32}
                      color={Colors.textMuted}
                    />
                  </View>
                )}

                <Text
                  style={{
                    fontFamily: Fonts.friendly,
                    fontSize: 20,
                    letterSpacing: -0.1,
                    color: Colors.textPrimary,
                    marginBottom: 2,
                  }}
                >
                  {user?.name ?? "—"}
                </Text>

                <Text
                  style={{
                    fontFamily: Fonts.regular,
                    fontSize: 13,
                    color: Colors.textMuted,
                    marginBottom: 12,
                  }}
                >
                  @{user?.username ?? user?.name?.toLowerCase().replace(/\s+/g, "") ?? "—"}
                </Text>

                {user?.bio ? (
                  <Text
                    style={{
                      fontFamily: Fonts.regular,
                      fontSize: 15,
                      lineHeight: 22,
                      color: Colors.textSecondary,
                      textAlign: "center",
                      paddingHorizontal: 16,
                    }}
                  >
                    {user.bio}
                  </Text>
                ) : null}
              </View>

              {/* Stats row */}
              <View
                style={{
                  flexDirection: "row",
                  paddingVertical: 18,
                  borderTopWidth: 1,
                  borderBottomWidth: 1,
                  borderColor: Colors.border,
                  marginBottom: 20,
                }}
              >
                <StatBlock
                  value={user?.memes_count ?? myMemes.length}
                  label="Memes"
                />
                <StatBlock value={user?.followers_count} label="Followers" />
                <StatBlock value={user?.following_count} label="Following" />
              </View>

              {/* ─── Leaderboard entry ─── */}
              <TouchableOpacity
                onPress={() => router.push("../leaderboard")}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Open leaderboard"
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  padding: 14,
                  borderRadius: Radius.xl,
                  backgroundColor: Colors.accentSoft,
                  borderWidth: 1.5,
                  borderColor: Colors.accentDim,
                  marginBottom: 20,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 14,
                    backgroundColor: Colors.accent,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name="trophy"
                    size={20}
                    color={Colors.textInverse}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: Fonts.friendly,
                      fontSize: 15,
                      letterSpacing: 0.1,
                      color: Colors.textPrimary,
                      marginBottom: 2,
                    }}
                  >
                    Leaderboard
                  </Text>
                  <Text
                    style={{
                      fontFamily: Fonts.regular,
                      fontSize: 13,
                      color: Colors.textSecondary,
                    }}
                  >
                    See the top memes and creators
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>

              {/* Edit Profile button */}
              <TouchableOpacity
                onPress={() => router.push("/EditProfile")}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Edit profile"
                style={{
                  height: 46,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: Colors.border,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 28,
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
                  Edit Profile
                </Text>
              </TouchableOpacity>

              {/* Tabs */}
              <View style={{ flexDirection: "row", marginBottom: 20 }}>
                {TABS.map((tab) => (
                  <TabButton
                    key={tab}
                    label={tab}
                    active={activeTab === tab}
                    onPress={() => setActiveTab(tab)}
                  />
                ))}
              </View>

              {activeTab === "My Memes" && !memesLoading && myMemes.length === 0 && (
                <EmptyTabState
                  icon="images-outline"
                  title="No memes yet"
                  message="Memes you post will show up here."
                />
              )}

              {activeTab === "My Memes" && memesLoading && (
                <ActivityIndicator
                  color={Colors.accent}
                  style={{ marginTop: 32 }}
                />
              )}

              {activeTab === "Saved" && savedPosts.length === 0 && (
                <EmptyTabState
                  icon="bookmark-outline"
                  title="Nothing saved yet"
                  message="Bookmarked memes will show up here."
                />
              )}
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
}