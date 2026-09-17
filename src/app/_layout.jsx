import { QueryClientProvider } from "@tanstack/react-query";
import { Fredoka_400Regular, Fredoka_600SemiBold } from "@expo-google-fonts/fredoka";
import { LilitaOne_400Regular } from "@expo-google-fonts/lilita-one";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "../../global.css";
import { AuthProvider } from "../context/AuthContext";
import { BookmarksProvider } from "../context/BookmarksContext";
import { queryClient } from "../lib/queryClient";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    // Display — cartoon wordmark energy
    LilitaOne_400Regular,

    // Friendly rounded sans — headings, buttons, taglines
    Fredoka_400Regular,
    Fredoka_600SemiBold,

    // UI / body — clean and neutral
    Inter_400Regular: require("../../assets/fonts/Inter_400Regular.ttf"),
    Inter_500Medium: require("../../assets/fonts/Inter_500Medium.ttf"),
    Inter_600SemiBold: require("../../assets/fonts/Inter_600SemiBold.ttf"),
    Inter_700Bold: require("../../assets/fonts/Inter_700Bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BookmarksProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="welcome" />
            <Stack.Screen name="CompleteProfile" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />

            <Stack.Screen
              name="PostView"
              options={{ presentation: "card", gestureEnabled: true }}
            />
            <Stack.Screen
              name="EditProfile"
              options={{ presentation: "card", gestureEnabled: true }}
            />
            <Stack.Screen
              name="Settings"
              options={{ presentation: "card", gestureEnabled: true }}
            />
            <Stack.Screen
              name="Leaderboard"
              options={{ presentation: "card", gestureEnabled: true }}
            />
          </Stack>
        </BookmarksProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}