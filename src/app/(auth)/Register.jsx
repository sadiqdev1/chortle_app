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

function Checkbox({ checked, onToggle }) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      hitSlop={8}
      style={{
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: checked ? Colors.accent : Colors.border,
        backgroundColor: checked ? Colors.accent : "transparent",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {checked && (
        <Ionicons name="checkmark" size={13} color={Colors.textInverse} />
      )}
    </TouchableOpacity>
  );
}

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();

  function validate() {
    const next = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) next.name = "Enter your name.";
    if (!trimmedEmail) next.email = "Enter your email address.";
    else if (!/^\S+@\S+\.\S+$/.test(trimmedEmail))
      next.email = "That doesn't look like a valid email.";
    if (!password) next.password = "Choose a password.";
    else if (password.length < 8) next.password = "Use at least 8 characters.";
    if (!confirmPassword) next.confirmPassword = "Confirm your password.";
    else if (confirmPassword !== password)
      next.confirmPassword = "Passwords don't match.";
    if (!agreed) next.form = "You'll need to accept the terms to continue.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    setSubmitting(true);
    setErrors({});
    try {
      await register({
        name: name.trim(),
        email: email,
        password,
        password_confirmation: confirmPassword,
      });
      router.replace("../CompleteProfile");
    } catch (error) {
      const responseData = error.response?.data;
      const backendErrors = responseData?.errors;
      if (backendErrors) {
        setErrors({
          name: backendErrors.name?.[0],
          email: backendErrors.email?.[0],
          password: backendErrors.password?.[0],
          confirmPassword: backendErrors.password_confirmation?.[0],
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
              Create your account
            </Text>
            <Text
              style={[
                Typography.body,
                { color: Colors.textSecondary, marginBottom: 32 },
              ]}
            >
              Join the feed. Post, react, repeat.
            </Text>

            <OAuthButtons onGoogle={() => {}} onApple={() => {}} />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} />
              <Text
                style={[
                  Typography.small,
                  { color: Colors.textMuted, marginHorizontal: 14 },
                ]}
              >
                OR
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} />
            </View>

            <AuthInput
              label="Full name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              error={errors.name}
              placeholder="Enter your full name"
              leftIcon="person-outline"
            />

            <AuthInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email}
              placeholder="Enter your email address"
              leftIcon="mail-outline"
            />

            <AuthInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              helper="At least 8 characters."
              error={errors.password}
              placeholder="Enter your password"
              leftIcon="lock-closed-outline"
              rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
              onRightIconPress={() => setShowPassword((c) => !c)}
            />

            <AuthInput
              label="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              error={errors.confirmPassword}
              placeholder="Confirm your password"
              leftIcon="lock-closed-outline"
            />

            {/* Terms */}
            <TouchableOpacity
              onPress={() => setAgreed((c) => !c)}
              activeOpacity={0.8}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                marginTop: 4,
                marginBottom: 20,
                gap: 10,
              }}
            >
              <Checkbox checked={agreed} onToggle={() => setAgreed((c) => !c)} />
              <Text
                style={[
                  Typography.small,
                  { color: Colors.textSecondary, flex: 1, lineHeight: 19 },
                ]}
              >
                I agree to the{" "}
                <Text style={{ color: Colors.accent, fontFamily: Fonts.semiBold }}>
                  Terms
                </Text>{" "}
                and{" "}
                <Text style={{ color: Colors.accent, fontFamily: Fonts.semiBold }}>
                  Privacy Policy
                </Text>
                .
              </Text>
            </TouchableOpacity>

            {errors.form ? (
              <Text
                style={[
                  Typography.small,
                  { color: Colors.error, marginBottom: 16 },
                ]}
              >
                {errors.form}
              </Text>
            ) : null}

            {/* Primary button — Fredoka */}
            <TouchableOpacity
              onPress={handleRegister}
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
                  Create Account
                </Text>
              )}
            </TouchableOpacity>

            <View style={{ flex: 1 }} />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                paddingBottom: 8,
              }}
            >
              <Text style={[Typography.body, { color: Colors.textSecondary }]}>
                Already have an account?{" "}
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(auth)/Login")}
                hitSlop={8}
              >
                <Text
                  style={{
                    fontFamily: Fonts.friendly,
                    fontSize: 15,
                    color: Colors.accent,
                  }}
                >
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}