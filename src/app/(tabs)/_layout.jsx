import { Ionicons } from "@expo/vector-icons";
import { Tabs, router } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Colors, Shadow } from "../../constants/theme";

function tabIcon(outlineName, filledName) {
  return ({ focused, color, size }) => (
    <Ionicons
      name={focused ? filledName : outlineName}
      size={size}
      color={color}
    />
  );
}

function CreateTabButton({ onPress }) {
  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel="Create post"
      style={{ top: -18, alignItems: "center", justifyContent: "center" }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: Colors.accent,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 4,
          borderColor: Colors.bg,
        }}
      >
        <Ionicons name="add" size={28} color={Colors.textInverse} />
      </View>
    </TouchableOpacity>
  );
}

function LeaderboardFloatButton() {
  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/Leaderboard");
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel="Leaderboard"
      style={{
        position: "absolute",
        right: 16,
        top: -70,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: Colors.accent,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 4,
          borderColor: Colors.bg,
          ...Shadow.accentGlow,
        }}
      >
        <Ionicons name="trophy" size={22} color={Colors.textInverse} />
      </View>
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarActiveTintColor: Colors.accent,
          tabBarInactiveTintColor: Colors.textMuted,
          tabBarStyle: {
            backgroundColor: Colors.bg,
            borderTopColor: Colors.border,
            borderTopWidth: 1,
            elevation: 0,
            shadowOpacity: 0,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ tabBarIcon: tabIcon("home-outline", "home") }}
        />
        <Tabs.Screen
          name="search"
          options={{ tabBarIcon: tabIcon("search-outline", "search") }}
        />
        <Tabs.Screen
          name="create"
          options={{
            tabBarIcon: () => null,
            tabBarButton: (props) => <CreateTabButton onPress={props.onPress} />,
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            tabBarIcon: tabIcon("notifications-outline", "notifications"),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{ tabBarIcon: tabIcon("person-outline", "person") }}
        />
      </Tabs>

      {/* Float sits above everything, anchored to bottom-right */}
      <LeaderboardFloatButton />
    </View>
  );
}