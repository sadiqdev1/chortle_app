import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
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
import AuthInput from "../components/AuthInput";
import CountryPickerModal from "../components/CountryPickerModal";
import { CATEGORIES, Colors, Fonts, Radius } from "../constants/theme";
import { useAuth } from "../hooks/useAuth";
import { useUpdateProfile } from "../hooks/useProfile";
import { normalizeError } from "../utils/helpers";

const GENDERS = ["Female", "Male", "Non-binary", "Prefer not to say"];

function getFlagEmoji(code) {
  return code
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(127397 + char.charCodeAt(0))
    );
}

function SectionLabel({ children }) {
  return (
    <Text
      style={{
        fontFamily: Fonts.friendly,
        fontSize: 12,
        letterSpacing: 1.2,
        textTransform: "uppercase",
        color: Colors.textMuted,
        marginBottom: 14,
        marginTop: 32,
      }}
    >
      {children}
    </Text>
  );
}

export default function EditProfileScreen() {
  const { user } = useAuth();

  const [avatar, setAvatar] = useState(user?.avatar ?? null);
  const [name, setName] = useState(user?.name ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [country, setCountry] = useState(
    user?.country
      ? { code: user.country, name: user.country_name ?? user.country }
      : null
  );
  const [city, setCity] = useState(user?.city ?? "");
  const [gender, setGender] = useState(user?.gender ?? null);
  const [interests, setInterests] = useState(
    new Set(Array.isArray(user?.interests) ? user.interests : [])
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saveError, setSaveError] = useState("");

  const { mutateAsync: updateProfile, isPending: saving } = useUpdateProfile();

  function toggleInterest(id) {
    Haptics.selectionAsync();
    setInterests((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleChangePhoto() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Permission needed",
        "Allow photo access to change your profile picture."
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setAvatar(result.assets[0].uri);
    }
  }

  async function handleSave() {
    setSaveError("");
    try {
      await updateProfile({
        name: name.trim(),
        username: username.trim(),
        bio: bio.trim(),
        country: country?.code ?? null,
        city: city.trim(),
        gender,
        interests: [...interests],
      });
      router.back();
    } catch (error) {
      setSaveError(normalizeError(error));
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
          {/* Nav bar */}
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
            {/* Cancel — Fredoka */}
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
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
                fontSize: 16,
                letterSpacing: -0.1,
                color: Colors.textPrimary,
              }}
            >
              Edit Profile
            </Text>

            {/* Save — Fredoka */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Save"
            >
              <Text
                style={{
                  fontFamily: Fonts.friendly,
                  fontSize: 15,
                  letterSpacing: 0.2,
                  color: Colors.accent,
                  opacity: saving ? 0.5 : 1,
                }}
              >
                {saving ? "Saving…" : "Save"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 28,
              paddingTop: 28,
              paddingBottom: 40,
            }}
            keyboardShouldPersistTaps="handled"
          >
            {saveError ? (
              <Text
                style={{
                  fontFamily: Fonts.regular,
                  fontSize: 13,
                  color: Colors.error,
                  marginBottom: 16,
                  textAlign: "center",
                }}
              >
                {saveError}
              </Text>
            ) : null}

            {/* Avatar */}
            <View style={{ alignItems: "center", marginBottom: 8 }}>
              <TouchableOpacity
                onPress={handleChangePhoto}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Change profile photo"
              >
                {avatar ? (
                  <Image
                    source={{ uri: avatar }}
                    style={{ width: 92, height: 92, borderRadius: 46 }}
                  />
                ) : (
                  <View
                    style={{
                      width: 92,
                      height: 92,
                      borderRadius: 46,
                      backgroundColor: Colors.bgCard,
                      borderWidth: 1.5,
                      borderColor: Colors.border,
                      borderStyle: "dashed",
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

                {/* Camera badge */}
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: Colors.accent,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 2,
                    borderColor: Colors.bg,
                  }}
                >
                  <Ionicons
                    name="camera-outline"
                    size={15}
                    color={Colors.textInverse}
                  />
                </View>
              </TouchableOpacity>
            </View>

            <SectionLabel>Basics</SectionLabel>
            <AuthInput
              label="Full name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            <AuthInput
              label="Username"
              value={username}
              onChangeText={setUsername}
            />
            <AuthInput
              label="Bio"
              value={bio}
              onChangeText={setBio}
              multiline
            />

            <SectionLabel>Location</SectionLabel>
            <TouchableOpacity
              onPress={() => setPickerOpen(true)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={
                country ? `Country: ${country.name}` : "Select country"
              }
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 14,
                borderBottomWidth: 1.5,
                borderBottomColor: country ? Colors.accent : Colors.border,
                marginBottom: 24,
              }}
            >
              {country ? (
                <View
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <Text style={{ fontSize: 22, marginRight: 12 }}>
                    {getFlagEmoji(country.code)}
                  </Text>
                  {/* Selected country — Inter, it's a value */}
                  <Text
                    style={{
                      fontFamily: Fonts.regular,
                      fontSize: 15,
                      color: Colors.textPrimary,
                    }}
                  >
                    {country.name}
                  </Text>
                </View>
              ) : (
                <Text
                  style={{
                    fontFamily: Fonts.regular,
                    fontSize: 15,
                    color: Colors.textMuted,
                  }}
                >
                  Select your country
                </Text>
              )}
              <Ionicons
                name="chevron-forward"
                size={18}
                color={Colors.textMuted}
              />
            </TouchableOpacity>

            <AuthInput
              label="City"
              value={city}
              onChangeText={setCity}
              helper="Optional"
            />

            <SectionLabel>About you</SectionLabel>
            <View style={{ marginBottom: 8 }}>
              {GENDERS.map((g) => {
                const active = gender === g;
                return (
                  <TouchableOpacity
                    key={g}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setGender(g);
                    }}
                    activeOpacity={0.6}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingVertical: 14,
                      borderBottomWidth: 1,
                      borderBottomColor: Colors.border,
                    }}
                  >
                    {/* Gender option — Fredoka when active, Inter when inactive.
                        Keeping font stable avoids layout shift on selection. */}
                    <Text
                      style={{
                        fontFamily: active ? Fonts.friendly : Fonts.regular,
                        fontSize: 15,
                        color: active
                          ? Colors.textPrimary
                          : Colors.textSecondary,
                      }}
                    >
                      {g}
                    </Text>

                    {/* Radio */}
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: 1.5,
                        borderColor: active ? Colors.accent : Colors.border,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {active && (
                        <View
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: Colors.accent,
                          }}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <SectionLabel>Interests</SectionLabel>
            <View
              style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}
            >
              {CATEGORIES.filter((c) => c.id !== "all").map((c) => {
                const active = interests.has(c.id);
                return (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => toggleInterest(c.id)}
                    activeOpacity={0.6}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: Radius.lg,
                      borderWidth: 1.5,
                      borderColor: active ? Colors.accent : Colors.border,
                      backgroundColor: active
                        ? Colors.accent
                        : "transparent",
                    }}
                  >
                    {/* Interest pill — Fredoka */}
                    <Text
                      style={{
                        fontFamily: Fonts.friendly,
                        fontSize: 14,
                        letterSpacing: 0.2,
                        color: active
                          ? Colors.textInverse
                          : Colors.textPrimary,
                      }}
                    >
                      {c.label}
                    </Text>
                    {active && (
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color={Colors.textInverse}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>

      <CountryPickerModal
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(c) => {
          Haptics.selectionAsync();
          setCountry(c);
        }}
      />
    </View>
  );
}