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

const leaderboard = [
  { name: "Alex M.", score: 1820, delta: "+11%" },
  { name: "Priya S.", score: 1764, delta: "+8%" },
  { name: "Jordan R.", score: 1689, delta: "+6%" },
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
    <LinearGradient colors={[colors.bg, "#17161D", colors.bgSoft]} style={styles.container}>
      <View style={[styles.glow, styles.glowOne]} />
      <View style={[styles.glow, styles.glowTwo]} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Community Arena</Text>
          <Pressable style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
            <Ionicons name="search" size={18} color={colors.text} />
          </Pressable>
        </View>
        <Text style={styles.subtitle}>Compete, learn, and keep each other accountable.</Text>

        <LinearGradient colors={["#4A1B15", "#2A1B1F"]} style={styles.hero}>
          <View>
            <Text style={styles.heroLabel}>This Week Event</Text>
            <Text style={styles.heroTitle}>Strength Leaderboard</Text>
            <Text style={styles.heroText}>Track total volume and climb the rank board.</Text>
          </View>
          <Pressable style={({ pressed }) => [styles.heroButton, pressed && styles.pressed]}>
            <Text style={styles.heroButtonText}>Join Now</Text>
          </Pressable>
        </LinearGradient>

        <Text style={styles.sectionTitle}>Top Athletes</Text>
        <View style={styles.card}>
          {leaderboard.map((entry, index) => (
            <View key={entry.name} style={styles.rankRow}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankBadgeText}>#{index + 1}</Text>
              </View>
              <View style={styles.rankText}>
                <Text style={styles.rankName}>{entry.name}</Text>
                <Text style={styles.rankScore}>{entry.score} pts</Text>
              </View>
              <Text style={styles.rankDelta}>{entry.delta}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Active Challenges</Text>
        <View style={styles.card}>
          {challenges.map((challenge) => (
            <Pressable
              key={challenge.name}
              style={({ pressed }) => [styles.challengeRow, pressed && styles.pressed]}
            >
              <View style={styles.challengeIcon}>
                <Ionicons name={challenge.icon as any} size={18} color={colors.text} />
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
  glow: {
    position: "absolute",
    borderRadius: radius.pill,
  },
  glowOne: {
    top: -170,
    left: -130,
    width: 320,
    height: 320,
    backgroundColor: "rgba(240, 51, 24, 0.2)",
  },
  glowTwo: {
    right: -140,
    bottom: -170,
    width: 300,
    height: 300,
    backgroundColor: "rgba(247, 213, 167, 0.14)",
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(35, 34, 41, 0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: {
    ...typography.body,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  hero: {
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "rgba(240, 51, 24, 0.34)",
    padding: spacing.md,
    ...shadows.lg,
  },
  heroLabel: {
    ...typography.small,
    color: colors.accent,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  heroTitle: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.xs,
  },
  heroText: {
    ...typography.caption,
    color: colors.muted,
    marginTop: spacing.xxs,
  },
  heroButton: {
    alignSelf: "flex-start",
    marginTop: spacing.md,
    backgroundColor: colors.primaryStrong,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  heroButtonText: {
    ...typography.caption,
    color: colors.text,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: "rgba(35, 34, 41, 0.92)",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    ...shadows.md,
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rankBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "rgba(247, 213, 167, 0.4)",
    backgroundColor: "rgba(247, 213, 167, 0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  rankBadgeText: {
    ...typography.small,
    color: colors.accent,
  },
  rankText: {
    flex: 1,
  },
  rankName: {
    ...typography.caption,
    color: colors.text,
  },
  rankScore: {
    ...typography.small,
    color: colors.muted,
    marginTop: spacing.xxs,
  },
  rankDelta: {
    ...typography.caption,
    color: colors.success,
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
    backgroundColor: "rgba(240, 51, 24, 0.26)",
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
    borderColor: "rgba(247, 213, 167, 0.4)",
    backgroundColor: "rgba(247, 213, 167, 0.14)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  statusText: {
    ...typography.small,
    color: colors.accent,
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
    backgroundColor: colors.primary,
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
    opacity: 0.9,
  },
});
