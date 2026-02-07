import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { shadows } from "../theme/shadows";

const challenges = [
  { name: "7-Day Consistency", participants: 412, status: "Live", icon: "flame-outline" },
  { name: "Perfect Form Sprint", participants: 198, status: "Starts Tomorrow", icon: "body-outline" },
  { name: "Weekend Endurance", participants: 260, status: "Open", icon: "walk-outline" },
];

const communityUpdates = [
  {
    user: "Alex",
    detail: "completed 5 sets of deadlift with 92% form.",
    time: "2h ago",
  },
  {
    user: "Priya",
    detail: "joined the 7-Day Consistency challenge.",
    time: "5h ago",
  },
  {
    user: "Jordan",
    detail: "shared a mobility routine for rest days.",
    time: "1d ago",
  },
];

export default function CommunityScreen() {
  return (
    <LinearGradient colors={[colors.bg, colors.bgSoft]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Community</Text>
        <Text style={styles.subtitle}>Compete, learn, and stay accountable with other athletes.</Text>

        <Text style={styles.sectionTitle}>Active Challenges</Text>
        <View style={styles.card}>
          {challenges.map((challenge) => (
            <Pressable
              key={challenge.name}
              style={({ pressed }) => [styles.challengeRow, pressed && styles.pressed]}
            >
              <View style={styles.challengeIcon}>
                <Ionicons name={challenge.icon as any} size={18} color={colors.primary} />
              </View>
              <View style={styles.challengeInfo}>
                <Text style={styles.challengeName}>{challenge.name}</Text>
                <Text style={styles.challengeMeta}>{challenge.participants} participants</Text>
              </View>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{challenge.status}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.card}>
          {communityUpdates.map((update) => (
            <View key={`${update.user}-${update.time}`} style={styles.feedRow}>
              <View style={styles.feedDot} />
              <View style={styles.feedText}>
                <Text style={styles.feedTitle}>
                  <Text style={styles.feedUser}>{update.user}</Text> {update.detail}
                </Text>
                <Text style={styles.feedTime}>{update.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    ...shadows.md,
  },
  challengeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  challengeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cardAlt,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeName: {
    ...typography.caption,
    color: colors.text,
  },
  challengeMeta: {
    ...typography.small,
    color: colors.muted,
    marginTop: spacing.xxs,
  },
  statusPill: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(126, 217, 87, 0.45)",
    backgroundColor: "rgba(126, 217, 87, 0.2)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  statusText: {
    ...typography.small,
    color: colors.text,
  },
  feedRow: {
    flexDirection: "row",
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  feedDot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    marginTop: spacing.xxs + 1,
    backgroundColor: colors.accent,
  },
  feedText: {
    flex: 1,
  },
  feedTitle: {
    ...typography.caption,
    color: colors.text,
  },
  feedUser: {
    color: colors.accent,
  },
  feedTime: {
    ...typography.small,
    color: colors.muted,
    marginTop: spacing.xxs,
  },
  pressed: {
    opacity: 0.92,
  },
});
