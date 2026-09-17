import * as Haptics from "expo-haptics";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";

import { Colors, Fonts, Radius, Shadow } from "../constants/theme";

export default function AppButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  style,
  textStyle,
}) {
  const isDisabled = disabled || loading;
  const isSecondary = variant === "secondary";

  function handlePress() {
    if (isDisabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[
        {
          width: "100%",
          minHeight: 56,
          paddingHorizontal: 24,
          borderRadius: Radius.full,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isSecondary ? Colors.bgElevated : Colors.accent,
          borderWidth: isSecondary ? 1.5 : 0,
          borderColor: Colors.border,
          opacity: isDisabled ? 0.5 : 1,
          ...(isSecondary ? {} : Shadow.accentGlow),
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isSecondary ? Colors.textPrimary : Colors.textInverse}
        />
      ) : (
        <Text
          style={[
            {
              fontFamily: Fonts.friendly,
              fontSize: 16,
              letterSpacing: 0.3,
              color: isSecondary ? Colors.textPrimary : Colors.textInverse,
            },
            textStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}