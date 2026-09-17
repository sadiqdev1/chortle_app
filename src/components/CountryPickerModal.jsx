import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import countries from "world-countries";
import { Colors, Fonts, Radius } from "../constants/theme";

const COUNTRY_LIST = countries
  .map((c) => ({ code: c.cca2, name: c.name.common }))
  .sort((a, b) => a.name.localeCompare(b.name));

function getFlagEmoji(code) {
  return code
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(127397 + char.charCodeAt(0))
    );
}

export default function CountryPickerModal({ visible, onClose, onSelect }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return COUNTRY_LIST;
    return COUNTRY_LIST.filter((c) =>
      c.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: Colors.bg }}>
        <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
          {/* Header */}
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
              onPress={onClose}
              hitSlop={10}
              style={{ marginRight: 14 }}
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
                <Ionicons name="close" size={20} color={Colors.textPrimary} />
              </View>
            </TouchableOpacity>

            {/* Title — Fredoka */}
            <Text
              style={{
                fontFamily: Fonts.friendly,
                fontSize: 20,
                letterSpacing: -0.1,
                color: Colors.textPrimary,
              }}
            >
              Select country
            </Text>
          </View>

          {/* Search */}
          <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: Colors.bgCard,
                borderRadius: Radius.lg,
                borderWidth: 1.5,
                borderColor: query ? Colors.accent : "transparent",
                paddingHorizontal: 14,
                paddingVertical: 4,
              }}
            >
              <Ionicons
                name="search-outline"
                size={17}
                color={Colors.textMuted}
                style={{ marginRight: 10 }}
              />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search countries"
                placeholderTextColor={Colors.textMuted}
                autoFocus
                autoCorrect={false}
                style={{
                  fontFamily: Fonts.regular,
                  fontSize: 15,
                  lineHeight: 22,
                  flex: 1,
                  color: Colors.textPrimary,
                  paddingVertical: 10,
                }}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery("")} hitSlop={10}>
                  <Ionicons
                    name="close-circle"
                    size={17}
                    color={Colors.textMuted}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* List */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: 24,
            }}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={20}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
                activeOpacity={0.6}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: Colors.border,
                  gap: 14,
                }}
              >
                <Text style={{ fontSize: 24 }}>
                  {getFlagEmoji(item.code)}
                </Text>

                {/* Country name — Inter, not Fredoka.
                    Readable list, not brand voice. */}
                <Text
                  style={{
                    fontFamily: Fonts.regular,
                    fontSize: 15,
                    lineHeight: 22,
                    color: Colors.textPrimary,
                  }}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text
                style={{
                  fontFamily: Fonts.regular,
                  fontSize: 15,
                  color: Colors.textMuted,
                  textAlign: "center",
                  marginTop: 40,
                }}
              >
                No countries match "{query}".
              </Text>
            }
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
}