import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";

import { RootStackParamList } from "../navigation/types";
import { clearUser, getUser } from "../services/storage";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { shadows } from "../theme/shadows";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

type User = {
  user_id?: string;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  gender?: string;
  date_of_birth?: string;
  height_cm?: number;
  weight_kg?: number;
};

const avatar = require("../../assets/profile_avatar.png");

export default function ProfileScreen() {
  const navigation = useNavigation<Navigation>();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    void (async () => {
      const value = await getUser<User>();
      setUser(value);
      setLoading(false);
    })();
  }, []);

  const displayName = useMemo(() => {
    if (!user) return "Athlete";
    const fullName = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
    return fullName || user.username || "Athlete";
  }, [user]);

  async function onLogout() {
    await clearUser();
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  }

  return (
    <LinearGradient colors={[colors.bg, colors.bgSoft]} style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={18} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.helperText}>Loading profile...</Text>
        </View>
      ) : !user ? (
        <View style={styles.centerCard}>
          <Text style={styles.cardTitle}>No user data found</Text>
          <Text style={styles.helperText}>Login again to load your account profile.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.profileCard}>
            <Image source={avatar} style={styles.avatar} />
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.email}>{user.email || "-"}</Text>
          </View>

          <View style={styles.infoCard}>
            <InfoRow label="User ID" value={user.user_id || "-"} />
            <InfoRow label="Username" value={user.username || "-"} />
            <InfoRow label="Phone" value={user.phone || "-"} />
            <InfoRow label="Gender" value={user.gender || "-"} />
            <InfoRow label="DOB" value={user.date_of_birth || "-"} />
            <InfoRow
              label="Height"
              value={user.height_cm ? `${user.height_cm} cm` : "-"}
            />
            <InfoRow
              label="Weight"
              value={user.weight_kg ? `${user.weight_kg} kg` : "-"}
            />
          </View>

          <Pressable onPress={onLogout} style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}>
            <Ionicons name="log-out-outline" size={18} color={colors.text} />
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </ScrollView>
      )}
    </LinearGradient>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  centerCard: {
    margin: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: "center",
  },
  helperText: {
    ...typography.caption,
    color: colors.muted,
  },
  profileCard: {
    marginTop: spacing.sm,
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    ...shadows.md,
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    marginBottom: spacing.sm,
  },
  name: {
    ...typography.h3,
    color: colors.text,
  },
  email: {
    ...typography.caption,
    color: colors.muted,
    marginTop: spacing.xxs,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.md,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.muted,
    flex: 1,
  },
  infoValue: {
    ...typography.caption,
    color: colors.text,
    flex: 1,
    textAlign: "right",
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  logoutButton: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(238, 99, 82, 0.5)",
    backgroundColor: "rgba(238, 99, 82, 0.22)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.xs,
    ...shadows.sm,
  },
  logoutText: {
    ...typography.caption,
    color: colors.text,
  },
  pressed: {
    opacity: 0.92,
  },
});
