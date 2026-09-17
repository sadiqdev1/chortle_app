import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
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
import OAuthButtons from "../../components/OAuthButtons";
import { logoIcon } from "../../constants/data";
import { Colors, Fonts, Radius, Typography } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();

  function validate() {
    const next = {};
    const trimmedEmail = email.trim();
    if (!trimmedEmail) next.email = "Enter your email address.";
    else if (!/^\S+@\S+\.\S+$/.test(trimmedEmail))
      next.email = "That doesn't look like a valid email.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    setSubmitting(true);
    setErrors({});
    try {
      await login({ email: email.trim().toLowerCase(), password });
      router.replace("/(tabs)");
    } catch (error) {
      const responseData = error.response?.data;
      const backendErrors = responseData?.errors;
      if (backendErrors) {
        setErrors({
          email: backendErrors.email?.[0],
          password: backendErrors.password?.[0],
          form: responseData?.message,
        });
      } else {
        setErrors({
          form:
            responseData?.message ||
            "Something went wrong. Please try again.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleGoogle() {
    // TODO: wire Google OAuth flow
  }
  function handleApple() {
    // TODO: wire Apple OAuth flow
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
            {/* Nav row */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 36,
              }}
            >
              <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
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

              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: Colors.accentSoft,
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <Image
                  source={logoIcon}
                  style={{ width: 28, height: 28 }}
                  resizeMode="contain"
                />
              </View>
            </View>

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
              Welcome back
            </Text>
            <Text
              style={[
                Typography.body,
                { color: Colors.textSecondary, marginBottom: 36 },
              ]}
            >
              Sign in to keep the memes coming.
            </Text>

            <AuthInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon="mail-outline"
              placeholder="johndoe@gmail.com"
            />

            <AuthInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              error={errors.password}
              placeholder="Enter your password"
              leftIcon="lock-closed-outline"
              rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
              onRightIconPress={() => setShowPassword((c) => !c)}
            />

            {errors.form ? (
              <Text
                style={[
                  Typography.small,
                  { color: Colors.error, marginBottom: 12 },
                ]}
              >
                {errors.form}
              </Text>
            ) : null}

            <TouchableOpacity
              onPress={() => router.push("/(auth)/ForgotPassword")}
              style={{ alignSelf: "flex-end", marginBottom: 28 }}
              hitSlop={8}
            >
              <Text
                style={{
                  fontFamily: Fonts.semiBold,
                  fontSize: 13,
                  color: Colors.accent,
                }}
              >
                Forgot password?
              </Text>
            </TouchableOpacity>

            {/* Primary button — Fredoka */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={submitting}
              activeOpacity={0.85}
              style={{
                height: 56,
                borderRadius: Radius.full,
                backgroundColor: Colors.accent,
                alignItems: "center",
                justifyContent: "center",
                opacity: submitting ? 0.6 : 1,
                marginBottom: 28,
              }}
            >
              {submitting ? (
                <ActivityIndicator size={24} color={Colors.textInverse} />
              ) : (
                <Text
                  style={{
                    fontFamily: Fonts.friendly,
                    fontSize: 16,
                    letterSpacing: 0.3,
                    color: Colors.textInverse,
                  }}
                >
                  Log in
                </Text>
              )}
            </TouchableOpacity>

            <OAuthButtons onGoogle={handleGoogle} onApple={handleApple} showDivider />

            <View style={{ flex: 1 }} />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                paddingTop: 20,
              }}
            >
              <Text style={[Typography.body, { color: Colors.textSecondary }]}>
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(auth)/Register")}
                hitSlop={8}
              >
                <Text
                  style={{
                    fontFamily: Fonts.friendly,
                    fontSize: 15,
                    color: Colors.accent,
                  }}
                >
                  Register
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}