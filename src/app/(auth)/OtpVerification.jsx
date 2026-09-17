import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import AppButton from "../../components/AppButton";
import AuthInput from "../../components/AuthInput";
import { Colors, Fonts, Typography } from "../../constants/theme";
import {
  resendPasswordReset,
  resendVerification,
  resetPassword,
  verifyEmail,
} from "../../services/authService";
import { normalizeError } from "../../utils/helpers";

const CODE_LENGTH = 6;
const RESEND_SECONDS = 60;

function DigitSlot({ digit, isActive, hasError }) {
  const focus = useSharedValue(0);

  useEffect(() => {
    focus.value = withTiming(isActive ? 1 : 0, { duration: 150 });
  }, [isActive]);

  const lineStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      focus.value,
      [0, 1],
      [
        hasError ? Colors.error : Colors.border,
        hasError ? Colors.error : Colors.accent,
      ]
    ),
  }));

  return (
    <View style={{ width: 40, alignItems: "center" }}>
      <Text
        style={{
          fontFamily: Fonts.friendly,
          fontSize: 28,
          lineHeight: 40,
          height: 40,
          color: Colors.textPrimary,
          textAlign: "center",
        }}
      >
        {digit || ""}
      </Text>
      <Animated.View
        style={[
          { height: 2.5, width: "100%", borderRadius: 2, marginTop: 6 },
          lineStyle,
        ]}
      />
    </View>
  );
}

export default function OtpVerificationScreen() {
  const { email: emailParam, mode: modeParam } = useLocalSearchParams();
  const email = Array.isArray(emailParam) ? emailParam[0] : emailParam;
  const mode = Array.isArray(modeParam) ? modeParam[0] : modeParam;
  const isPasswordReset = mode === "reset";

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const inputRef = useRef(null);
  const shake = useSharedValue(0);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  useEffect(() => {
    if (code.length === CODE_LENGTH && !isPasswordReset) {
      Keyboard.dismiss();
      handleVerify(code);
    }
  }, [code]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  function triggerShake() {
    shake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  }

  async function handleVerify(fullCode) {
    setVerifying(true);
    setError("");
    try {
      await verifyEmail({ email, code: fullCode });
      router.replace("/(tabs)");
    } catch (e) {
      setError(normalizeError(e));
      triggerShake();
      setCode("");
    } finally {
      setVerifying(false);
    }
  }

  async function handleResetPassword() {
    if (code.length !== CODE_LENGTH) {
      setError("Enter the 6-digit code.");
      return;
    }
    if (password.length < 8) {
      setError("Use at least 8 characters for your new password.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setVerifying(true);
    setError("");
    try {
      await resetPassword({
        email,
        code,
        token: code,
        password,
        password_confirmation: confirmPassword,
      });
      router.replace("/(auth)/Login");
    } catch (e) {
      setError(normalizeError(e));
      triggerShake();
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    if (secondsLeft > 0) return;
    setSecondsLeft(RESEND_SECONDS);
    setError("");
    try {
      if (isPasswordReset) {
        await resendPasswordReset(email);
      } else {
        await resendVerification(email);
      }
    } catch (e) {
      setError(normalizeError(e));
    }
  }

  const digits = code.padEnd(CODE_LENGTH, " ").split("");

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 24 }} edges={["top", "bottom"]}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={10}
          style={{ marginTop: 8, marginBottom: 32 }}
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
          {isPasswordReset ? "Reset your password" : "Verify it's you"}
        </Text>
        <Text
          style={[
            Typography.body,
            { color: Colors.textSecondary, marginBottom: 40, lineHeight: 24 },
          ]}
        >
          {email
            ? `We've sent a 6-digit code to ${email}.`
            : "We've sent a 6-digit code to your email."}
        </Text>

        <View style={{ position: "relative", marginBottom: 16 }}>
          <Animated.View
            style={[
              { flexDirection: "row", justifyContent: "space-between" },
              shakeStyle,
            ]}
          >
            {digits.map((d, i) => (
              <DigitSlot
                key={i}
                digit={d.trim()}
                isActive={i === code.length}
                hasError={!!error}
              />
            ))}
          </Animated.View>
          <TextInput
            ref={inputRef}
            value={code}
            onChangeText={(text) => {
              setError("");
              setCode(text.replace(/[^0-9]/g, "").slice(0, CODE_LENGTH));
            }}
            keyboardType="number-pad"
            maxLength={CODE_LENGTH}
            autoFocus
            caretHidden
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: 48,
              opacity: 0.02,
            }}
          />
        </View>

        {error ? (
          <Text
            style={[
              Typography.small,
              { color: Colors.error, marginBottom: 8 },
            ]}
          >
            {error}
          </Text>
        ) : null}
        {verifying ? (
          <Text
            style={[
              Typography.small,
              { color: Colors.textMuted, marginBottom: 8 },
            ]}
          >
            Processing...
          </Text>
        ) : null}

        {isPasswordReset && code.length === CODE_LENGTH ? (
          <View>
            <AuthInput
              label="New password"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setError("");
              }}
              secureTextEntry={!showPassword}
              placeholder="Choose a new password"
              helper="At least 8 characters."
              rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
              onRightIconPress={() => setShowPassword((current) => !current)}
            />
            <AuthInput
              label="Confirm password"
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                setError("");
              }}
              secureTextEntry={!showPassword}
              placeholder="Repeat your new password"
            />
            <AppButton
              label="Update Password"
              onPress={handleResetPassword}
              loading={verifying}
              style={{ marginTop: 8 }}
            />
          </View>
        ) : null}

        <View style={{ flex: 1 }} />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            paddingBottom: 24,
          }}
        >
          <Text style={[Typography.body, { color: Colors.textSecondary }]}>
            Didn't get a code?{" "}
          </Text>
          <TouchableOpacity
            onPress={handleResend}
            disabled={secondsLeft > 0}
            hitSlop={8}
          >
            <Text
              style={{
                fontFamily: Fonts.friendly,
                fontSize: 15,
                letterSpacing: 0.2,
                color: secondsLeft > 0 ? Colors.textMuted : Colors.accent,
              }}
            >
              {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : "Resend code"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}