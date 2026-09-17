import { router } from "expo-router";
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { logoWithSmile } from "../constants/data";
import { Colors, Fonts, Radius, Shadow, Typography } from "../constants/theme";

// Brand hero palette — kept local to this screen since these
// deep purples only appear on the welcome/splash flow.
const BRAND_BG = "#341B77";
const BLOB = "#3D1E8F";

const BLOBS = [
  { size: 190, top: -90, left: -75, opacity: 1 },
  { size: 150, top: 35, right: -85, opacity: 0.75 },
  { size: 170, bottom: -85, left: -70, opacity: 1 },
  { size: 210, bottom: -110, right: -80, opacity: 0.85 },
];

function DecorativeBlobs() {
  return (
    <>
      {BLOBS.map((b, i) => (
        <View
          key={i}
          pointerEvents="none"
          style={[
            styles.blob,
            {
              width: b.size,
              height: b.size,
              borderRadius: b.size / 2,
              opacity: b.opacity,
              top: "top" in b ? b.top : undefined,
              bottom: "bottom" in b ? b.bottom : undefined,
              left: "left" in b ? b.left : undefined,
              right: "right" in b ? b.right : undefined,
            },
          ]}
        />
      ))}
    </>
  );
}

export default function WelcomeScreen() {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_BG} />

      <DecorativeBlobs />

      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.content}>
          {/* Logo + wordmark */}
          <Animated.View entering={FadeIn.duration(500)} style={styles.hero}>
            <Image
              source={logoWithSmile}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="Chortle logo"
            />

            {/* Lilita One — cartoon wordmark */}
            <Text style={styles.wordmark}>Chortle</Text>

            {/* Fredoka — friendly tagline */}
            <Text style={styles.tagline}>Memes. laughs. Community.</Text>
          </Animated.View>

          {/* CTA */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(500)}
            style={styles.cta}
          >
            <TouchableOpacity
              onPress={() => router.push("/(auth)/Register")}
              activeOpacity={0.88}
              accessibilityRole="button"
              accessibilityLabel="Get started"
              style={styles.primaryButton}
            >
              {/* Fredoka — button text */}
              <Text style={styles.primaryButtonText}>Get Started  →</Text>
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={styles.loginPrompt}>Already have an account?</Text>

              <TouchableOpacity
                onPress={() => router.push("/(auth)/Login")}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Log in"
              >
                <Text style={styles.loginLink}>Log in</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRAND_BG,
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    backgroundColor: BLOB,
  },
  safe: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 55,
    paddingBottom: 36,
    alignItems: "center",
    justifyContent: "space-between",
  },
  hero: {
    alignItems: "center",
    gap: 14,
  },
  logo: {
    width: 150,
    height: 150,
  },

  // ── Wordmark — Lilita One ──────────────────────────────────
  wordmark: {
    fontFamily: Fonts.display,      // "LilitaOne_400Regular"
    fontSize: 52,
    lineHeight: 58,
    letterSpacing: 1,
    color: Colors.white,
    textAlign: "center",
  },

  // ── Tagline — Fredoka ──────────────────────────────────────
  tagline: {
    fontFamily: Fonts.friendly,     // "Fredoka_600SemiBold"
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    maxWidth: 300,
  },

  cta: {
    width: "100%",
    alignItems: "center",
    gap: 18,
  },
  primaryButton: {
    width: "100%",
    height: 54,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.card,
  },
  primaryButtonText: {
    fontFamily: Fonts.friendly,     // "Fredoka_600SemiBold"
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.3,
    color: Colors.accent,           // #3D1B83 — visible on white
  },

  loginRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  loginPrompt: {
    fontFamily: Fonts.regular,      // Inter 400
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.75)",
  },
  loginLink: {
    fontFamily: Fonts.friendly,     // Fredoka SemiBold
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.3,
    color: Colors.white,            // ← was Colors.accent (invisible)
  },
});