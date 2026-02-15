import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { shadows } from "../theme/shadows";

const avatar = require("../../assets/profile_avatar.png");
const banner = require("../../assets/quick_start.jpg");

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const goals = [
  { label: "Calories", value: "1,720", target: "2,100", icon: "flame-outline" },
  { label: "Water", value: "1.8L", target: "2.5L", icon: "water-outline" },
  { label: "Steps", value: "7.4K", target: "9K", icon: "walk-outline" },
];

const highlights = [
  { label: "Weekly Streak", value: "6 days", detail: "2 more to beat best", icon: "flash-outline" },
  { label: "Avg Form Score", value: "91%", detail: "High control this week", icon: "barbell-outline" },
];

const tasks = [
  { title: "Strength workout", detail: "Upper body / 45 min", icon: "barbell-outline" },
  { title: "Mobility reset", detail: "Recovery flow / 12 min", icon: "body-outline" },
  { title: "Meal check-in", detail: "Protein target tracking", icon: "restaurant-outline" },
];

export default function HomeScreen() {
  const navigation = useNavigation<Navigation>();

  return (
    <LinearGradient colors={[colors.bg, "#17161D", colors.bgSoft]} style={styles.container}>
      <View style={[styles.glow, styles.glowOne]} />
      <View style={[styles.glow, styles.glowTwo]} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Evening</Text>
            <Text style={styles.title}>Titan Dashboard</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
              <Ionicons name="notifications-outline" size={18} color={colors.text} />
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate("Profile")}
              style={({ pressed }) => [styles.profileButton, pressed && styles.pressed]}
            >
              <Image source={avatar} style={styles.avatar} />
            </Pressable>
          </View>
        </View>

        <View style={styles.hero}>
          <Image source={banner} style={styles.heroImage} />
          <LinearGradient colors={["rgba(17,17,19,0)", "rgba(17,17,19,0.94)"]} style={styles.heroFade} />
          <View style={styles.heroContent}>
            <Text style={styles.heroTag}>Today Plan</Text>
            <Text style={styles.heroTitle}>Power Lift Cycle</Text>
            <Text style={styles.heroSubtitle}>3 sessions left to complete this week’s target.</Text>
            <Pressable style={({ pressed }) => [styles.heroButton, pressed && styles.pressed]}>
              <Ionicons name="play" size={16} color={colors.text} />
              <Text style={styles.heroButtonText}>Start Session</Text>
            </Pressable>
          </View>
        </View>

        <SectionTitle title="Performance Snapshot" />
        <View style={styles.metricGrid}>
          {goals.map((item) => (
            <View key={item.label} style={styles.metricCard}>
              <View style={styles.metricIconWrap}>
                <Ionicons name={item.icon as any} size={16} color={colors.accent} />
              </View>
              <Text style={styles.metricLabel}>{item.label}</Text>
              <Text style={styles.metricValue}>{item.value}</Text>
              <Text style={styles.metricHint}>Target {item.target}</Text>
            </View>
          ))}
        </View>

        <SectionTitle title="Momentum" />
        <View style={styles.highlightList}>
          {highlights.map((item) => (
            <View key={item.label} style={styles.highlightCard}>
              <View style={styles.highlightIcon}>
                <Ionicons name={item.icon as any} size={16} color={colors.primary} />
              </View>
              <View style={styles.highlightText}>
                <Text style={styles.highlightLabel}>{item.label}</Text>
                <Text style={styles.highlightValue}>{item.value}</Text>
                <Text style={styles.highlightDetail}>{item.detail}</Text>
              </View>
            </View>
          ))}
        </View>

        <SectionTitle title="Today Focus" />
        <View style={styles.list}>
          {tasks.map((task) => (
            <Pressable key={task.title} style={({ pressed }) => [styles.listRow, pressed && styles.pressed]}>
              <View style={styles.listIcon}>
                <Ionicons name={task.icon as any} size={18} color={colors.text} />
              </View>
              <View style={styles.listText}>
                <Text style={styles.listTitle}>{task.title}</Text>
                <Text style={styles.listSub}>{task.detail}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
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
    right: -120,
    width: 340,
    height: 340,
    backgroundColor: "rgba(240, 51, 24, 0.22)",
  },
  glowTwo: {
    left: -140,
    bottom: -180,
    width: 320,
    height: 320,
    backgroundColor: "rgba(247, 213, 167, 0.16)",
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  greeting: {
    ...typography.small,
    color: colors.muted,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.xxs,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(35, 34, 41, 0.85)",
    alignItems: "center",
    justifyContent: "center",
    ...shadows.sm,
  },
  profileButton: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(35, 34, 41, 0.85)",
    padding: spacing.xxs,
    ...shadows.sm,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  hero: {
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.lg,
  },
  heroImage: {
    width: "100%",
    height: 220,
  },
  heroFade: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
  },
  heroTag: {
    ...typography.small,
    color: colors.accent,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  heroTitle: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.xxs,
  },
  heroSubtitle: {
    ...typography.caption,
    color: colors.muted,
    marginTop: spacing.xxs,
  },
  heroButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.primaryStrong,
    borderRadius: radius.md,
    marginTop: spacing.sm,
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
    marginBottom: spacing.sm,
  },
  metricGrid: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "rgba(35, 34, 41, 0.92)",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    ...shadows.md,
  },
  metricIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(247, 213, 167, 0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  metricLabel: {
    ...typography.small,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  metricValue: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.xxs,
  },
  metricHint: {
    ...typography.small,
    color: colors.muted,
    marginTop: spacing.xxs,
  },
  highlightList: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  highlightCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: "rgba(35, 34, 41, 0.92)",
    padding: spacing.sm,
    ...shadows.sm,
  },
  highlightIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(240, 51, 24, 0.14)",
    marginRight: spacing.sm,
  },
  highlightText: {
    flex: 1,
  },
  highlightLabel: {
    ...typography.small,
    color: colors.muted,
  },
  highlightValue: {
    ...typography.caption,
    color: colors.text,
    marginTop: spacing.xxs,
  },
  highlightDetail: {
    ...typography.small,
    color: colors.accent,
    marginTop: spacing.xxs,
  },
  list: {
    gap: spacing.sm,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(35, 34, 41, 0.92)",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    ...shadows.sm,
  },
  listIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(240, 51, 24, 0.28)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  listText: {
    flex: 1,
  },
  listTitle: {
    ...typography.caption,
    color: colors.text,
  },
  listSub: {
    ...typography.small,
    color: colors.muted,
    marginTop: spacing.xxs,
  },
  pressed: {
    opacity: 0.9,
  },
});
