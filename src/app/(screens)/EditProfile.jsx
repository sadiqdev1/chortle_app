import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
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
import {
  UserCircle,
  Camera,
  CaretRight,
  Check,
} from "phosphor-react-native";
import AuthInput from "../../components/AuthInput";
import CountryPickerModal from "../../components/CountryPickerModal";
import { CATEGORIES, Fonts } from "../../constants/theme";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../hooks/useAuth";
import { useUpdateProfile, useCheckUsername } from "../../hooks/useProfile";
import { uploadFile } from "../../services/uploadService";
import { normalizeError } from "../../utils/helpers";

const GENDERS = ["Female", "Male", "Non-binary", "Prefer not to say"];

function getFlagEmoji(code) {
  return code
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(127397 + char.charCodeAt(0))
    );
}

function SectionLabel({ children }) {
  const { colors } = useTheme();
  return (
    <Text
      style={{
        marginTop: 32,
        marginBottom: 14,
        fontFamily: Fonts.friendly,
        fontSize: 12,
        letterSpacing: 1.2,
        textTransform: "uppercase",
        color: colors.textMuted,
      }}
    >
      {children}
    </Text>
  );
}

export default function EditProfileScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { toast } = useToast();

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

  const { mutateAsync: updateProfile, isPending: saving } = useUpdateProfile();
  const { data: usernameCheck } = useCheckUsername(
    username !== user?.username ? username.trim() : "" // only check when changed
  );
  const usernameAvailable = username === user?.username
    ? true
    : usernameCheck?.available ?? null; // null = pending

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
      toast.warn("Allow photo access to change your profile picture.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
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
    // Block save if chosen username is already taken
    if (usernameAvailable === false) {
      toast.error("That username is taken. Choose a different one.");
      return;
    }
    try {
      let avatarUrl = avatar;
      const isLocalUri =
        typeof avatar === "string" &&
        (avatar.startsWith("file://") || avatar.startsWith("content://") || avatar.startsWith("/"));

      if (isLocalUri) {
        avatarUrl = await uploadFile(avatar, "avatar");
      }

      await updateProfile({
        name: name.trim(),
        username: username.trim(),
        bio: bio.trim(),
        ...(avatarUrl ? { avatar: avatarUrl } : {}),
        preferences: JSON.stringify({
          country: country?.code ?? null,
          city: city.trim(),
          gender,
          interests: [...interests],
        }),
      });
      toast.success("Profile updated!");
      router.back();
    } catch (error) {
      if (error?.isNetworkError) {
        toast.offline("No internet. Check your connection.");
        return;
      }
      toast.error(normalizeError(error));
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.bg} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
          {/* Nav bar */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
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
                  color: colors.textSecondary,
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <Text
              style={{
                fontFamily: Fonts.friendly,
                fontSize: 16,
                letterSpacing: -0.1,
                color: colors.textPrimary,
              }}
            >
              Edit Profile
            </Text>

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
                  color: colors.accent,
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
                  <View style={{ width: 92, height: 92, borderRadius: 46, borderWidth: 1.5, borderColor: colors.border, borderStyle: "dashed", alignItems: "center", justifyContent: "center", backgroundColor: colors.bgCard }}>
                    <UserCircle size={36} color={colors.textMuted} weight="duotone" />
                  </View>
                )}
                <View style={{ position: "absolute", bottom: 0, right: 0, width: 30, height: 30, borderRadius: 15, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: colors.bg }}>
                  <Camera size={15} color="#fff" weight="bold" />
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
            {/* Username availability indicator */}
            {username.trim().length >= 3 && username !== user?.username && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: -10, marginBottom: 14, paddingHorizontal: 4 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: usernameAvailable === null ? colors.textMuted : usernameAvailable ? "#2F6B4F" : colors.error }} />
                <Text style={{
                  fontFamily: Fonts.regular,
                  fontSize: 12,
                  color: usernameAvailable === null ? colors.textMuted : usernameAvailable ? "#2F6B4F" : colors.error,
                }}>
                  {usernameAvailable === null ? "Checking…" : usernameAvailable ? "@" + username.trim() + " is available" : "@" + username.trim() + " is taken"}
                </Text>
              </View>
            )}
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
              accessibilityLabel={country ? `Country: ${country.name}` : "Select country"}
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, marginBottom: 24, borderBottomWidth: 1.5, borderBottomColor: country ? colors.accent : colors.border }}
            >
              {country ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ fontSize: 22, marginRight: 12 }}>{getFlagEmoji(country.code)}</Text>
                  <Text style={{ fontFamily: Fonts.regular, fontSize: 15, color: colors.textPrimary }}>{country.name}</Text>
                </View>
              ) : (
                <Text style={{ fontFamily: Fonts.regular, fontSize: 15, color: colors.textMuted }}>Select your country</Text>
              )}
              <CaretRight size={18} color={colors.textMuted} />
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
                    onPress={() => { Haptics.selectionAsync(); setGender(g); }}
                    activeOpacity={0.6}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border }}
                  >
                    <Text style={{ fontFamily: active ? Fonts.friendly : Fonts.regular, fontSize: 15, color: active ? colors.textPrimary : colors.textSecondary }}>
                      {g}
                    </Text>
                    <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: active ? colors.accent : colors.border, alignItems: "center", justifyContent: "center" }}>
                      {active && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent }} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <SectionLabel>Interests</SectionLabel>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {CATEGORIES.filter((c) => c.id !== "all").map((c) => {
                const active = interests.has(c.id);
                return (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => toggleInterest(c.id)}
                    activeOpacity={0.6}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1.5, borderColor: active ? colors.accent : colors.border, backgroundColor: active ? colors.accent : "transparent" }}
                  >
                    <Text style={{ fontFamily: Fonts.friendly, fontSize: 14, letterSpacing: 0.2, color: active ? colors.textInverse : colors.textPrimary }}>
                      {c.label}
                    </Text>
                    {active && <Check size={14} color="#fff" weight="bold" />}
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