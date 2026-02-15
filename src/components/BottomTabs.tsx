import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";
import { shadows } from "../theme/shadows";

export type TabKey = "Home" | "Workout" | "Community";

const tabs: Array<{
  key: TabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { key: "Home", label: "Home", icon: "home" },
  { key: "Workout", label: "Workout", icon: "barbell" },
  { key: "Community", label: "Community", icon: "people" },
];

export default function BottomTabs({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (key: TabKey) => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      <View style={styles.bar}>
        {tabs.map((tab) => {
          const isActive = tab.key === active;
          return (
            <Pressable
              key={tab.key}
              onPress={() => onChange(tab.key)}
              style={({ pressed }) => [
                styles.item,
                isActive && styles.itemActive,
                pressed && styles.itemPressed,
              ]}
            >
              {isActive ? (
                <LinearGradient
                  colors={["#F35936", colors.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconWrapActive}
                >
                  <Ionicons name={tab.icon} size={18} color={colors.text} />
                </LinearGradient>
              ) : (
                <View style={styles.iconWrap}>
                  <Ionicons name={tab.icon} size={18} color={colors.muted} />
                </View>
              )}
              <Text style={[styles.itemText, isActive && styles.itemTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.md,
    backgroundColor: "transparent",
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(35, 34, 41, 0.96)",
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    ...shadows.lg,
  },
  item: {
    flex: 1,
    height: 58,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  itemActive: {
    backgroundColor: "rgba(246, 244, 248, 0.06)",
  },
  itemPressed: {
    opacity: 0.92,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.muted,
    letterSpacing: 0.2,
  },
  itemTextActive: {
    color: colors.text,
  },
});
