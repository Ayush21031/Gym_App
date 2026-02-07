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
import { login } from "../services/auth";
import { saveUser } from "../services/storage";
import { isValidEmail } from "../utils/validators";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { shadows } from "../theme/shadows";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
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
      const response = await login(email.trim(), password);
      if (!response.success || !response.user) {
        setError(response.message || "Unable to login.");
        return;
      }
      await saveUser(response.user);
      navigation.replace("Main");
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
    <LinearGradient colors={[colors.bg, colors.bgSoft]} style={styles.container}>
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
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Login to continue your training plan.</Text>
          </View>

          <View style={styles.card}>
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
                  style={styles.iconButton}
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
                <Text style={styles.submitText}>Log In</Text>
              )}
            </Pressable>

            <Text style={styles.hint}>Use your registered account from the backend API.</Text>
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
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  hero: {
    marginBottom: spacing.xl,
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.lg,
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
    backgroundColor: colors.card,
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
    backgroundColor: colors.primary,
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
    letterSpacing: 0.2,
  },
  hint: {
    ...typography.small,
    color: colors.muted,
    textAlign: "center",
  },
});
