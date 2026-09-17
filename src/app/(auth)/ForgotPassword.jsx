import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppButton from "../../components/AppButton";
import AuthInput from "../../components/AuthInput";
import { Colors, Fonts, Typography } from "../../constants/theme";
import { forgotPassword } from "../../services/authService";

import { useAuth } from "../../hooks/useAuth";

export function check() {
  const { loading, isAuthenticated } = useAuth();

  // if (loading) {
  //   return <SplashScreen />;
  // }

  if (isAuthenticated) {
    return true;
  } else {
    return false
  }
}


export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSend() {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return setError("Enter your email address.");
    if (!/^\S+@\S+\.\S+$/.test(trimmed))
      return setError("That doesn't look like a valid email.");

    setError("");
    setSubmitting(true);

    try {
      await forgotPassword(trimmed);
    } catch (e) {
      const status = e?.response?.status;
      // 422 → backend gave a real validation message; anything else
      // stays silent so we don't leak but if the email does not exists inform the user.
      if (status === 422) {
        setError(e.response.data?.message || "Something went wrong. Try again.");
        return;
      }
    } finally {
      setSubmitting(false);
    }

    // Only navigate after the request resolves.
    router.push({
      pathname: "/(auth)/OtpVerification",
      params: { email: trimmed, mode: "reset" },
    });
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 24,
              paddingTop: 8,
              paddingBottom: 24,
            }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Back button */}
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={10}
              style={{ marginBottom: 32 }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: Colors.bgCard,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
              </View>
            </TouchableOpacity>

            <View style={{ flex: 1 }}>

              {/* Heading — Fredoka */}
              <Text
                style={{
                  fontFamily: Fonts.friendly,
                  fontSize: 28,
                  lineHeight: 34,
                  letterSpacing: -0.2,
                  color: Colors.textPrimary,
                  marginBottom: 8,
                }}
              >
                Reset password
              </Text>
              <Text
                style={[
                  Typography.body,
                  {
                    color: Colors.textSecondary,
                    marginBottom: 32,
                    lineHeight: 24,
                  },
                ]}
              >
                Enter your email and we'll send a code to reset it.
              </Text>

              <AuthInput
                label="Email"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setError("");
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                error={error}
                placeholder="Enter your email address"
                leftIcon="mail-outline"
              />

              <AppButton
                label="Send Code"
                onPress={handleSend}
                loading={submitting}
                style={{ marginTop: 8 }}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 25,
              }}
            >
              {check()? null: 
              <><Text style={{ color: Colors.textSecondary, fontSize: 15 }}>
                Remember your password?{" "}
              </Text>
              <TouchableOpacity
                onPress={() => router.replace("/(auth)/Login")}
                hitSlop={10}
              >
                <Text
                  style={{
                    fontFamily: Fonts.friendly,
                    fontSize: 15,
                    color: Colors.accent,
                  }}>
                  Log in

                </Text>
              </TouchableOpacity>
              </>
              }
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}