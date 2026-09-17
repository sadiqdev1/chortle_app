import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts } from "../constants/theme";
import { useAuth } from "../hooks/useAuth";

function SectionLabel({ children }) {
  return (
    <Text
      style={{
        fontFamily: Fonts.friendly,
        fontSize: 12,
        letterSpacing: 1.2,
        textTransform: "uppercase",
        color: Colors.textMuted,
        marginBottom: 4,
        marginTop: 28,
        paddingHorizontal: 24,
      }}
    >
      {children}
    </Text>
  );
}

function Row({ label, onPress, right, destructive }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
      disabled={!onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
      }}
    >
      <Text
        style={{
          fontFamily: Fonts.friendly,
          fontSize: 15,
          letterSpacing: 0.1,
          color: destructive ? Colors.error : Colors.textPrimary,
        }}
      >
        {label}
      </Text>
      {right ??
        (onPress && (
          <Ionicons
            name="chevron-forward"
            size={18}
            color={Colors.textMuted}
          />
        ))}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const { logout } = useAuth();

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await logout();
      router.replace("/(auth)/Login");
    } finally {
      setSigningOut(false);
    }
  }

  async function handleCheckForUpdates() {
    if (checkingUpdate) return;
    setCheckingUpdate(true);
    setUpdateMessage("");

    try {
      // 🔌 Replace with your real update check.
      // Options:
      // 1. expo-updates: Updates.checkForUpdateAsync() + fetchUpdateAsync()
      // 2. Custom endpoint that returns { latestVersion, downloadUrl }
      // 3. Play Store / App Store deep link
      await new Promise((r) => setTimeout(r, 900));

      // Example successful response:
      setUpdateMessage("You're on the latest version.");
    } catch (e) {
      setUpdateMessage("Couldn't check for updates. Try again later.");
    } finally {
      setCheckingUpdate(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        {/* Nav bar */}
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
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={{ marginRight: 12 }}
          >
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
              letterSpacing: -0.1,
              color: Colors.textPrimary,
            }}
          >
            Settings
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <SectionLabel>Account</SectionLabel>
          <Row
            label="Edit Profile"
            onPress={() => router.push("/EditProfile")}
          />
          <Row
            label="Change Password"
            onPress={() => router.push("/(auth)/ForgotPassword")}
          />

          <SectionLabel>Notifications</SectionLabel>
          <Row
            label="Push Notifications"
            right={
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: Colors.border, true: Colors.accent }}
                thumbColor={Colors.white}
              />
            }
          />
          <Row
            label="Weekly Email Digest"
            right={
              <Switch
                value={emailDigest}
                onValueChange={setEmailDigest}
                trackColor={{ false: Colors.border, true: Colors.accent }}
                thumbColor={Colors.white}
              />
            }
          />

          <SectionLabel>About</SectionLabel>
          <Row label="Privacy Policy" onPress={() => {}} />
          <Row label="Terms of Service" onPress={() => {}} />

          {/* Check for Updates */}
          <Row
            label="Check for Updates"
            onPress={checkingUpdate ? undefined : handleCheckForUpdates}
            right={
              checkingUpdate ? (
                <ActivityIndicator size="small" color={Colors.accent} />
              ) : (
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={Colors.textMuted}
                />
              )
            }
          />

          {/* Update result message (only when there's something to say) */}
          {updateMessage ? (
            <Text
              style={{
                fontFamily: Fonts.regular,
                fontSize: 13,
                lineHeight: 18,
                color: Colors.textMuted,
                paddingHorizontal: 24,
                paddingTop: 10,
              }}
            >
              {updateMessage}
            </Text>
          ) : null}

          <Row
            label="App Version"
            right={
              <Text
                style={{
                  fontFamily: Fonts.regular,
                  fontSize: 13,
                  color: Colors.textMuted,
                }}
              >
                1.0.0
              </Text>
            }
          />

          <SectionLabel>Account Actions</SectionLabel>
          <Row
            label={signingOut ? "Signing out…" : "Sign Out"}
            onPress={signingOut ? undefined : handleSignOut}
          />
          <Row label="Delete Account" onPress={() => {}} destructive />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}