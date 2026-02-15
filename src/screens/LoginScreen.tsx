import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { RootStackParamList } from "../navigation/types";
import { login, loginGymOwner } from "../services/auth";
import { clearUser, saveSession, saveUser } from "../services/storage";
import { isValidEmail } from "../utils/validators";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { shadows } from "../theme/shadows";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;
type AuthRole = "member" | "gym_owner";

export default function LoginScreen({ navigation }: Props) {
  const [role, setRole] = useState<AuthRole>("member");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return isValidEmail(email) && password.trim().length >= 4 && !loading;
  }, [email, loading, password]);

  async function onSubmit() {
    if (!canSubmit) {
      setError("Enter a valid email and password.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      if (role === "member") {
        const response = await login(email.trim(), password);
        if (!response.success || !response.user) {
          setError(response.message || "Unable to login.");
          return;
        }

        await Promise.all([
          saveUser(response.user),
          saveSession({ role: "member", user: response.user }),
        ]);

        navigation.reset({
          index: 0,
          routes: [{ name: "Main" }],
        });
        return;
      }

      const ownerResponse = await loginGymOwner(email.trim(), password);
      if (!ownerResponse.success || !ownerResponse.owner) {
        setError(ownerResponse.message || "Unable to login as gym owner.");
        return;
      }

      await Promise.all([
        clearUser(),
        saveSession({ role: "gym_owner", owner: ownerResponse.owner }),
      ]);

      navigation.reset({
        index: 0,
        routes: [{ name: "OwnerDashboard" }],
      });
    } catch (e: any) {
      const message =
        e?.response?.data?.message ||
        e?.response?.data?.detail ||
        "Something went wrong. Please try again.";
      setError(String(message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={[colors.bg, "#17161C", colors.bgSoft]} style={styles.container}>
      <View style={[styles.glow, styles.glowOne]} />
      <View style={[styles.glow, styles.glowTwo]} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={styles.heroBadge}>
              <Ionicons name="flash" size={14} color={colors.accent} />
              <Text style={styles.heroBadgeText}>Elite Mode</Text>
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              {role === "member"
                ? "Continue your custom training and nutrition journey."
                : "Access member onboarding requests for your gym."}
            </Text>
            <View style={styles.heroStats}>
              <View style={styles.heroStatCard}>
                <Text style={styles.heroStatValue}>12W</Text>
                <Text style={styles.heroStatLabel}>Adaptive plans</Text>
              </View>
              <View style={styles.heroStatCard}>
                <Text style={styles.heroStatValue}>24/7</Text>
                <Text style={styles.heroStatLabel}>Coach insights</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.segment}>
              <Pressable
                onPress={() => {
                  setRole("member");
                  setError(null);
                }}
                style={({ pressed }) => [
                  styles.segmentOption,
                  role === "member" && styles.segmentOptionActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.segmentOptionText,
                    role === "member" && styles.segmentOptionTextActive,
                  ]}
                >
                  Member
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setRole("gym_owner");
                  setError(null);
                }}
                style={({ pressed }) => [
                  styles.segmentOption,
                  role === "gym_owner" && styles.segmentOptionActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.segmentOptionText,
                    role === "gym_owner" && styles.segmentOptionTextActive,
                  ]}
                >
                  Gym Owner
                </Text>
              </Pressable>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color={colors.muted} />
                <TextInput
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    if (error) setError(null);
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="name@example.com"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.muted} />
                <TextInput
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    if (error) setError(null);
                  }}
                  secureTextEntry={!showPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  editable={!loading}
                />
                <Pressable
                  onPress={() => setShowPassword((current) => !current)}
                  hitSlop={10}
                  style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color={colors.muted}
                  />
                </Pressable>
              </View>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={onSubmit}
              disabled={!canSubmit}
              style={({ pressed }) => [
                styles.submit,
                !canSubmit && styles.submitDisabled,
                pressed && canSubmit && styles.submitPressed,
              ]}
            >
              {loading ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <Text style={styles.submitText}>
                  {role === "member" ? "Log In as Member" : "Log In as Gym Owner"}
                </Text>
              )}
            </Pressable>

            <View style={styles.footerRow}>
              <Pressable style={({ pressed }) => [styles.textButton, pressed && styles.pressed]}>
                <Text style={styles.textButtonLabel}>Forgot password?</Text>
              </Pressable>
              <Pressable style={({ pressed }) => [styles.textButton, pressed && styles.pressed]}>
                <Text style={styles.textButtonLabel}>Need help?</Text>
              </Pressable>
            </View>

            <Pressable
              onPress={() => navigation.navigate("Signup")}
              style={({ pressed }) => [styles.signupRow, pressed && styles.pressed]}
            >
              <Text style={styles.signupText}>Need an account? Create one now</Text>
              <Ionicons name="arrow-forward" size={15} color={colors.accent} />
            </Pressable>

            <Text style={styles.hint}>
              {role === "member"
                ? "Use your member credentials from the backend API."
                : "Use your owner credentials to review pending requests."}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    top: -160,
    right: -120,
    width: 340,
    height: 340,
    backgroundColor: "rgba(240, 51, 24, 0.24)",
  },
  glowTwo: {
    bottom: -160,
    left: -120,
    width: 320,
    height: 320,
    backgroundColor: "rgba(247, 213, 167, 0.14)",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  hero: {
    marginBottom: spacing.xl,
  },
  heroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    borderWidth: 1,
    borderColor: "rgba(247, 213, 167, 0.4)",
    backgroundColor: "rgba(247, 213, 167, 0.12)",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    marginBottom: spacing.sm,
  },
  heroBadgeText: {
    ...typography.small,
    color: colors.accent,
  },
  title: {
    ...typography.display,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  heroStats: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  heroStatCard: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(35, 34, 41, 0.86)",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  heroStatValue: {
    ...typography.h3,
    color: colors.accent,
  },
  heroStatLabel: {
    ...typography.small,
    color: colors.muted,
    marginTop: spacing.xxs,
  },
  card: {
    backgroundColor: "rgba(35, 34, 41, 0.95)",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.lg,
  },
  segment: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: "rgba(17, 17, 19, 0.52)",
    padding: spacing.xxs,
    gap: spacing.xs,
  },
  segmentOption: {
    flex: 1,
    minHeight: 40,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentOptionActive: {
    backgroundColor: "rgba(243, 89, 54, 0.26)",
  },
  segmentOptionText: {
    ...typography.caption,
    color: colors.muted,
    fontWeight: "700",
  },
  segmentOptionTextActive: {
    color: colors.text,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.text,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: "rgba(17, 17, 19, 0.62)",
    paddingHorizontal: spacing.sm,
    minHeight: 52,
    gap: spacing.xs,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    paddingVertical: spacing.sm,
  },
  iconButton: {
    padding: spacing.xxs,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(238, 99, 82, 0.45)",
    backgroundColor: "rgba(238, 99, 82, 0.12)",
    padding: spacing.sm,
  },
  errorText: {
    flex: 1,
    ...typography.caption,
    color: colors.text,
  },
  submit: {
    minHeight: 54,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryStrong,
    ...shadows.md,
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitPressed: {
    opacity: 0.9,
  },
  submitText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  textButton: {
    paddingVertical: spacing.xxs,
  },
  textButtonLabel: {
    ...typography.small,
    color: colors.accent,
  },
  hint: {
    ...typography.small,
    color: colors.muted,
    textAlign: "center",
  },
  signupRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
    paddingVertical: spacing.xs,
  },
  signupText: {
    ...typography.small,
    color: colors.accent,
  },
  pressed: {
    opacity: 0.88,
  },
});
