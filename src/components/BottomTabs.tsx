import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
  return (
    <View style={styles.wrap}>
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
              <Ionicons
                name={tab.icon}
                size={20}
                color={isActive ? colors.text : colors.muted}
              />
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: "transparent",
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.xs,
    ...shadows.md,
  },
  item: {
    flex: 1,
    height: 56,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  itemActive: {
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemPressed: {
    opacity: 0.92,
  },
  itemText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.muted,
  },
  itemTextActive: {
    color: colors.text,
  },
});
