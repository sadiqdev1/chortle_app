import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PostCard from "../../components/PostCard";
import { CATEGORIES, Colors, Fonts, Radius } from "../../constants/theme";
import { useBookmarks } from "../../context/BookmarksContext";
import { usePosts } from "../../hooks/usePosts";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const { isBookmarked, toggleBookmark } = useBookmarks();

  const isSearching = query.trim().length > 0;
  const { data: searchData, isLoading } = usePosts(
    isSearching ? { search: query.trim() } : {}
  );

  const results = useMemo(() => {
    const raw = searchData?.data ?? searchData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [searchData]);

  function openPost(id) {
    router.push({ pathname: "/PostView", params: { id } });
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={{ paddingHorizontal: 24, paddingTop: 12 }}>
          {/* Title — Fredoka */}
          <Text
            style={{
              fontFamily: Fonts.friendly,
              fontSize: 26,
              letterSpacing: -0.2,
              color: Colors.textPrimary,
              marginBottom: 20,
            }}
          >
            Search
          </Text>

          {/* Search input */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: Colors.bgCard,
              borderRadius: Radius.lg,
              borderWidth: 1.5,
              borderColor: query ? Colors.accent : "transparent",
              paddingHorizontal: 16,
              paddingVertical: 0,
              marginBottom: 8,
            }}
          >
            <Ionicons
              name="search-outline"
              size={18}
              color={Colors.textMuted}
              style={{ marginRight: 10 }}
            />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search memes, creators, tags"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              style={{
                fontFamily: Fonts.regular,
                fontSize: 15,
                flex: 1,
                color: Colors.textPrimary,
                paddingVertical: 14,
              }}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery("")} hitSlop={10}>
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {isSearching ? (
          isLoading ? (
            <ActivityIndicator
              color={Colors.accent}
              style={{ marginTop: 40 }}
            />
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={{
                paddingHorizontal: 24,
                paddingTop: 8,
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
                /* Result count — Inter, metadata */
                <Text
                  style={{
                    fontFamily: Fonts.regular,
                    fontSize: 13,
                    color: Colors.textMuted,
                    marginBottom: 4,
                  }}
                >
                  {results.length}{" "}
                  {results.length === 1 ? "result" : "results"} for "
                  {query.trim()}"
                </Text>
              }
              ListEmptyComponent={
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingTop: 60,
                  }}
                >
                  <Ionicons
                    name="search-outline"
                    size={30}
                    color={Colors.textMuted}
                    style={{ marginBottom: 16 }}
                  />

                  {/* Empty heading — Fredoka */}
                  <Text
                    style={{
                      fontFamily: Fonts.friendly,
                      fontSize: 17,
                      color: Colors.textPrimary,
                      marginBottom: 8,
                    }}
                  >
                    No results for "{query.trim()}"
                  </Text>

                  {/* Empty body — Inter */}
                  <Text
                    style={{
                      fontFamily: Fonts.regular,
                      fontSize: 15,
                      lineHeight: 22,
                      color: Colors.textSecondary,
                      textAlign: "center",
                      paddingHorizontal: 32,
                    }}
                  >
                    Try a different tag or creator.
                  </Text>
                </View>
              }
            />
          )
        ) : (
          <View style={{ paddingHorizontal: 24, paddingTop: 28 }}>
            {/* Section label — Fredoka */}
            <Text
              style={{
                fontFamily: Fonts.friendly,
                fontSize: 12,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                color: Colors.textSecondary,
                marginBottom: 18,
              }}
            >
              Browse Tags
            </Text>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setQuery(`#${c.label}`)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Browse ${c.label}`}
                  style={{
                    borderWidth: 1.5,
                    borderColor: Colors.border,
                    borderRadius: Radius.full,
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                  }}
                >
                  {/* Tag label — Fredoka */}
                  <Text
                    style={{
                      fontFamily: Fonts.friendly,
                      fontSize: 14,
                      letterSpacing: 0.2,
                      color: Colors.textPrimary,
                    }}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}