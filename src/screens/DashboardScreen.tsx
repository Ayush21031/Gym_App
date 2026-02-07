import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

export default function DashboardScreen() {
  return (
    <LinearGradient colors={[colors.bg, colors.bgSoft]} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>
          This screen is no longer the primary route. Main navigation now uses Home, Workout,
          and Community tabs.
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  card: {
    width: "100%",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.muted,
    marginTop: spacing.sm,
  },
});
