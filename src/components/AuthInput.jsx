import { Ionicons } from "@expo/vector-icons";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { Colors, Fonts, Radius, Typography } from "../constants/theme";

export default function AuthInput({
  label,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoCorrect,
  multiline,
  helper,
  placeholder,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
}) {
  const focus = useSharedValue(0);

  const containerStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focus.value,
      [0, 1],
      [
        error ? Colors.error : Colors.border,
        error ? Colors.error : Colors.accent,
      ]
    ),
  }));

  return (
    <View style={{ marginBottom: 18 }}>
      {/* Label — Fredoka, all-caps eyebrow style */}
      {label ? (
        <Text
          style={{
            fontFamily: Fonts.friendly,
            fontSize: 12,
            letterSpacing: 1.2,
            color: Colors.textSecondary,
            marginBottom: 8,
            marginLeft: 4,
            textTransform: "uppercase",
          }}
        >
          {label}
        </Text>
      ) : null}

      {/* Input container */}
      <Animated.View
        style={[
          {
            flexDirection: "row",
            alignItems: multiline ? "flex-start" : "center",
            minHeight: multiline ? 80 : 56,
            borderRadius: Radius.lg,
            borderWidth: 1.5,
            borderColor: Colors.border,
            backgroundColor: Colors.white,
            paddingRight: 10,
            overflow: "hidden",
          },
          containerStyle,
        ]}
      >
        {/* Left icon */}
        {leftIcon && (
          <View
            style={{
              width: 40,
              height: 40,
              marginLeft: 7,
              marginTop: multiline ? 7 : 0,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name={leftIcon} size={19} color={Colors.accent} />
          </View>
        )}

        {/* Text input — Inter, keeps typed text neutral */}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize || "none"}
          autoCorrect={autoCorrect}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          onFocus={() => (focus.value = withTiming(1, { duration: 150 }))}
          onBlur={() => (focus.value = withTiming(0, { duration: 150 }))}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          style={{
            fontFamily: Fonts.regular,
            fontSize: 15,
            lineHeight: 22,
            flex: 1,
            color: Colors.textPrimary,
            paddingHorizontal: 10,
            paddingVertical: multiline ? 12 : 0,
            minHeight: multiline ? 70 : 54,
            textAlignVertical: multiline ? "top" : "center",
            outlineStyle: "none",
          }}
        />

        {/* Right icon */}
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            hitSlop={10}
            activeOpacity={0.7}
            style={{
              width: 36,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name={rightIcon} size={19} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Error / helper — Inter small */}
      {error ? (
        <Text
          style={{
            fontFamily: Fonts.regular,
            fontSize: 13,
            lineHeight: 18,
            color: Colors.error,
            marginTop: 6,
            marginLeft: 4,
          }}
        >
          {error}
        </Text>
      ) : helper ? (
        <Text
          style={{
            fontFamily: Fonts.regular,
            fontSize: 13,
            lineHeight: 18,
            color: Colors.textMuted,
            marginTop: 6,
            marginLeft: 4,
          }}
        >
          {helper}
        </Text>
      ) : null}
    </View>
  );
}