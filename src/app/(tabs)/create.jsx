import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthInput from "../../components/AuthInput";
import { CATEGORIES, Colors, Fonts, Radius } from "../../constants/theme";
import { useCreatePost } from "../../hooks/usePosts";
import { normalizeError } from "../../utils/helpers";

export default function CreateScreen() {
  const [media, setMedia] = useState(null);
  const [caption, setCaption] = useState("");
  const [tag, setTag] = useState("");
  const [errors, setErrors] = useState({});

  const { mutateAsync: createPost, isPending: publishing } = useCreatePost();

  function validate() {
    const next = {};
    if (!media) next.media = "Add an image or GIF.";
    if (!tag) next.tag = "Pick a tag.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handlePickMedia() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow photo access to post a meme.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
    });
    if (!result.canceled) {
      setMedia(result.assets[0].uri);
      setErrors((e) => ({ ...e, media: undefined }));
    }
  }

  async function handlePublish() {
    if (!validate()) return;
    try {
      const post = await createPost({
        caption: caption.trim(),
        tag,
        mediaUri: media,
      });
      router.replace({
        pathname: "/PostView",
        params: { id: post?.id ?? post?.data?.id },
      });
    } catch (e) {
      Alert.alert("Post failed", normalizeError(e));
    }
  }

  const tags = CATEGORIES.filter((c) => c.id !== "all");

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: Colors.border,
          }}
        >
          <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
            <Text
              style={{
                fontFamily: Fonts.friendly,
                fontSize: 15,
                color: Colors.textSecondary,
              }}
            >
              Cancel
            </Text>
          </TouchableOpacity>

          {/* Title — Fredoka */}
          <Text
            style={{
              fontFamily: Fonts.friendly,
              fontSize: 20,
              letterSpacing: -0.1,
              color: Colors.textPrimary,
            }}
          >
            New Meme
          </Text>

          {/* Post button — Fredoka */}
          <TouchableOpacity
            onPress={handlePublish}
            disabled={publishing}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Publish post"
            style={{
              paddingHorizontal: 18,
              paddingVertical: 8,
              borderRadius: Radius.full,
              backgroundColor: Colors.accent,
              opacity: publishing ? 0.5 : 1,
            }}
          >
            {publishing ? (
              <ActivityIndicator size={14} color={Colors.textInverse} />
            ) : (
              <Text
                style={{
                  fontFamily: Fonts.friendly,
                  fontSize: 14,
                  letterSpacing: 0.2,
                  color: Colors.textInverse,
                }}
              >
                Post
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: 24,
              paddingBottom: 40,
            }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Media picker */}
            <TouchableOpacity
              onPress={handlePickMedia}
              activeOpacity={0.85}
              style={{
                height: 280,
                borderRadius: Radius.xl,
                borderWidth: 1.5,
                borderColor: errors.media ? Colors.error : Colors.border,
                borderStyle: media ? "solid" : "dashed",
                backgroundColor: Colors.bgCard,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 8,
                overflow: "hidden",
              }}
            >
              {media ? (
                <Image
                  source={{ uri: media }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="contain"
                />
              ) : (
                <View style={{ alignItems: "center", gap: 10 }}>
                  <View
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 26,
                      backgroundColor: Colors.accentSoft,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name="image-outline"
                      size={24}
                      color={Colors.accent}
                    />
                  </View>

                  {/* Empty-state heading — Fredoka */}
                  <Text
                    style={{
                      fontFamily: Fonts.friendly,
                      fontSize: 15,
                      color: Colors.textPrimary,
                    }}
                  >
                    Add an image or GIF
                  </Text>

                  {/* Empty-state helper — Inter */}
                  <Text
                    style={{
                      fontFamily: Fonts.regular,
                      fontSize: 13,
                      color: Colors.textMuted,
                    }}
                  >
                    Tap to choose from your library
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {errors.media ? (
              <Text
                style={{
                  fontFamily: Fonts.regular,
                  fontSize: 13,
                  color: Colors.error,
                  marginBottom: 16,
                }}
              >
                {errors.media}
              </Text>
            ) : (
              <View style={{ marginBottom: 16 }} />
            )}

            {media ? (
              <TouchableOpacity
                onPress={handlePickMedia}
                style={{ alignSelf: "flex-start", marginBottom: 20 }}
                hitSlop={8}
              >
                <Text
                  style={{
                    fontFamily: Fonts.friendly,
                    fontSize: 13,
                    color: Colors.accent,
                  }}
                >
                  Change media
                </Text>
              </TouchableOpacity>
            ) : null}

            <AuthInput
              label="Caption"
              value={caption}
              onChangeText={setCaption}
              multiline
              helper="Optional"
              placeholder="Add a caption…"
            />

            {/* Tag section */}
            <Text
              style={{
                fontFamily: Fonts.friendly,
                fontSize: 12,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                color: Colors.textSecondary,
                marginBottom: 12,
                marginTop: 4,
              }}
            >
              Tag
            </Text>

            {errors.tag ? (
              <Text
                style={{
                  fontFamily: Fonts.regular,
                  fontSize: 13,
                  color: Colors.error,
                  marginBottom: 8,
                }}
              >
                {errors.tag}
              </Text>
            ) : null}

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {tags.map((t) => {
                const active = tag === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => {
                      setTag(t.id);
                      setErrors((e) => ({ ...e, tag: undefined }));
                    }}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      borderRadius: Radius.full,
                      borderWidth: 1.5,
                      borderColor: active ? Colors.accent : Colors.border,
                      backgroundColor: active ? Colors.accent : "transparent",
                    }}
                  >
                    {/* Tag pill label — Fredoka, short repeated labels */}
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
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}