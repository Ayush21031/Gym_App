import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
// import { clearToken } from "../services/storage";
import { clearUser } from "../services/storage";

type Props = NativeStackScreenProps<RootStackParamList, "Dashboard">;

export default function DashboardScreen({ navigation, route }: Props) {
  const email = route.params?.email ?? "Athlete";

  async function logout() {
    await clearUser();
    navigation.replace("Login");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.sub}>Welcome, {email}</Text>

      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Weekly Sessions</Text>
          <Text style={styles.cardValue}>4</Text>
          <Text style={styles.cardHint}>Keep it consistent</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Calories</Text>
          <Text style={styles.cardValue}>—</Text>
          <Text style={styles.cardHint}>Coming soon</Text>
        </View>

        <View style={[styles.card, { width: "100%" }]}>
          <Text style={styles.cardTitle}>Next Feature</Text>
          <Text style={styles.cardHint}>
            Workout plans, history, and smart-gym analytics will live here.
          </Text>
        </View>
      </View>

      <Pressable onPress={logout} style={styles.logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.xl,
    paddingTop: spacing.xxl,
  },
  title: { ...typography.title, color: colors.text },
  sub: { ...typography.body, color: colors.muted, marginTop: spacing.xs },

  grid: {
    marginTop: spacing.xl,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
  },
  card: {
    width: "47%",
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { ...typography.small, color: colors.muted },
  cardValue: {
    marginTop: spacing.md,
    fontSize: 26,
    fontWeight: "900",
    color: colors.text,
  },
  cardHint: { marginTop: spacing.sm, ...typography.body, color: colors.muted },

  logout: {
    marginTop: "auto",
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  logoutText: { color: colors.text, fontWeight: "800", fontSize: 16 },
});
