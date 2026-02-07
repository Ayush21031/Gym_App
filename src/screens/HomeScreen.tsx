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

const tasks = [
  { title: "Strength workout", detail: "Upper body - 45 min", icon: "barbell-outline" },
  { title: "Mobility reset", detail: "10 min recovery flow", icon: "body-outline" },
  { title: "Meal check-in", detail: "Log protein intake", icon: "restaurant-outline" },
];

export default function HomeScreen() {
  const navigation = useNavigation<Navigation>();

  return (
    <LinearGradient colors={[colors.bg, colors.bgSoft]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Evening</Text>
            <Text style={styles.title}>Performance Dashboard</Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate("Profile")}
            style={({ pressed }) => [styles.profileButton, pressed && styles.pressed]}
          >
            <Image source={avatar} style={styles.avatar} />
          </Pressable>
        </View>

        <View style={styles.hero}>
          <Image source={banner} style={styles.heroImage} />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroLabel}>Daily Focus</Text>
            <Text style={styles.heroTitle}>Build consistency with intentional sessions.</Text>
            <Pressable style={({ pressed }) => [styles.heroButton, pressed && styles.pressed]}>
              <Ionicons name="play-circle-outline" size={18} color={colors.text} />
              <Text style={styles.heroButtonText}>Start Quick Workout</Text>
            </Pressable>
          </View>
        </View>

        <SectionTitle title="Today" />
        <View style={styles.metricGrid}>
          {goals.map((item) => (
            <View key={item.label} style={styles.metricCard}>
              <Ionicons name={item.icon as any} size={18} color={colors.accent} />
              <Text style={styles.metricLabel}>{item.label}</Text>
              <Text style={styles.metricValue}>{item.value}</Text>
              <Text style={styles.metricHint}>Target {item.target}</Text>
            </View>
          ))}
        </View>

        <SectionTitle title="Planned Tasks" />
        <View style={styles.list}>
          {tasks.map((task) => (
            <Pressable key={task.title} style={({ pressed }) => [styles.listRow, pressed && styles.pressed]}>
              <View style={styles.listIcon}>
                <Ionicons name={task.icon as any} size={18} color={colors.primary} />
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
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
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
  profileButton: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.xxs,
    ...shadows.sm,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
    height: 190,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  heroContent: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    gap: spacing.sm,
  },
  heroLabel: {
    ...typography.small,
    color: colors.accent,
    textTransform: "uppercase",
  },
  heroTitle: {
    ...typography.h3,
    color: colors.text,
  },
  heroButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.primary,
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
    marginBottom: spacing.sm,
  },
  metricGrid: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    ...shadows.md,
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
  list: {
    gap: spacing.sm,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
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
    backgroundColor: colors.cardAlt,
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
    opacity: 0.92,
  },
});
