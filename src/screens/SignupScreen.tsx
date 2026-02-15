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
import * as ImagePicker from "expo-image-picker";

import { RootStackParamList } from "../navigation/types";
import {
  signupGymOwner,
  signupUser,
  UserSignupPayload,
  VideoUploadFile,
} from "../services/auth";
import { isValidEmail } from "../utils/validators";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { shadows } from "../theme/shadows";

type Props = NativeStackScreenProps<RootStackParamList, "Signup">;
type SignupRole = "member" | "gym_owner";
type OwnerMode = "join_existing" | "create_new";

type MemberFormState = {
  gymId: string;
  username: string;
  email: string;
  password: string;
  heightCm: string;
  weightKg: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
};

type OwnerFormState = {
  email: string;
  fullName: string;
  password: string;
  gymId: string;
  gymName: string;
  address: string;
  city: string;
};

const initialMemberForm: MemberFormState = {
  gymId: "",
  username: "",
  email: "",
  password: "",
  heightCm: "",
  weightKg: "",
  firstName: "",
  lastName: "",
  phone: "",
  gender: "",
  dateOfBirth: "",
};

const initialOwnerForm: OwnerFormState = {
  email: "",
  fullName: "",
  password: "",
  gymId: "",
  gymName: "",
  address: "",
  city: "",
};

function formatApiError(error: any) {
  const payload = error?.response?.data;
  if (typeof payload?.message === "string" && payload.message.trim()) return payload.message;
  if (typeof payload?.detail === "string" && payload.detail.trim()) return payload.detail;

  if (payload && typeof payload === "object") {
    const firstEntry = Object.entries(payload)[0];
    if (firstEntry) {
      const [field, value] = firstEntry;
      if (Array.isArray(value) && value.length > 0) {
        return `${field}: ${String(value[0])}`;
      }
      if (typeof value === "string") {
        return `${field}: ${value}`;
      }
    }
  }

  return "Unable to complete signup. Please check your details and try again.";
}

export default function SignupScreen({ navigation }: Props) {
  const [role, setRole] = useState<SignupRole>("member");
  const [ownerMode, setOwnerMode] = useState<OwnerMode>("join_existing");
  const [memberForm, setMemberForm] = useState<MemberFormState>(initialMemberForm);
  const [ownerForm, setOwnerForm] = useState<OwnerFormState>(initialOwnerForm);
  const [videoFile, setVideoFile] = useState<VideoUploadFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const memberCanSubmit = useMemo(() => {
    const height = Number(memberForm.heightCm);
    return (
      memberForm.gymId.trim().length > 0 &&
      memberForm.username.trim().length > 2 &&
      isValidEmail(memberForm.email) &&
      memberForm.password.trim().length >= 6 &&
      Number.isFinite(height) &&
      height > 0 &&
      Boolean(videoFile) &&
      !loading
    );
  }, [loading, memberForm, videoFile]);

  const ownerCanSubmit = useMemo(() => {
    if (!isValidEmail(ownerForm.email)) return false;
    if (ownerForm.fullName.trim().length < 2) return false;
    if (ownerForm.password.trim().length < 6) return false;
    if (ownerMode === "join_existing") return ownerForm.gymId.trim().length > 0 && !loading;
    return (
      ownerForm.gymName.trim().length > 1 &&
      ownerForm.address.trim().length > 1 &&
      ownerForm.city.trim().length > 1 &&
      !loading
    );
  }, [loading, ownerForm, ownerMode]);

  async function onRecordVideo() {
    setError(null);
    setSuccess(null);

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError("Camera permission is required to record face video.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 0.8,
      videoMaxDuration: 25,
    });

    if (result.canceled || !result.assets.length) return;

    const asset = result.assets[0];
    const fallbackName = `face-${Date.now()}.mp4`;

    setVideoFile({
      uri: asset.uri,
      name: asset.fileName ?? fallbackName,
      type: asset.mimeType ?? "video/mp4",
    });
  }

  async function onSubmitMemberSignup() {
    if (!memberCanSubmit || !videoFile) {
      setError("Please complete all required member signup fields.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const dobValue = memberForm.dateOfBirth.trim();
      if (dobValue && !/^\d{4}-\d{2}-\d{2}$/.test(dobValue)) {
        setError("Date of birth must be in YYYY-MM-DD format.");
        return;
      }

      const payload: UserSignupPayload = {
        gym_id: memberForm.gymId.trim(),
        username: memberForm.username.trim(),
        email: memberForm.email.trim(),
        password: memberForm.password,
        height_cm: Number(memberForm.heightCm),
        face_video: videoFile,
      };

      const weightValue = memberForm.weightKg.trim();
      if (weightValue) {
        const parsedWeight = Number(weightValue);
        if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
          setError("Weight must be a valid number.");
          return;
        }
        payload.weight_kg = parsedWeight;
      }
      if (memberForm.firstName.trim()) payload.first_name = memberForm.firstName.trim();
      if (memberForm.lastName.trim()) payload.last_name = memberForm.lastName.trim();
      if (memberForm.phone.trim()) payload.phone = memberForm.phone.trim();
      if (memberForm.gender.trim()) payload.gender = memberForm.gender.trim();
      if (dobValue) payload.date_of_birth = dobValue;

      await signupUser(payload);
      setSuccess("Signup request submitted. A gym owner will review and approve your account.");
      setMemberForm(initialMemberForm);
      setVideoFile(null);
    } catch (e: any) {
      setError(formatApiError(e));
    } finally {
      setLoading(false);
    }
  }

  async function onSubmitOwnerSignup() {
    if (!ownerCanSubmit) {
      setError("Please complete all required gym-owner fields.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (ownerMode === "join_existing") {
        await signupGymOwner({
          email: ownerForm.email.trim(),
          full_name: ownerForm.fullName.trim(),
          password: ownerForm.password,
          gym_id: ownerForm.gymId.trim(),
        });
      } else {
        await signupGymOwner({
          email: ownerForm.email.trim(),
          full_name: ownerForm.fullName.trim(),
          password: ownerForm.password,
          gym_name: ownerForm.gymName.trim(),
          location_data: {
            address: ownerForm.address.trim(),
            city: ownerForm.city.trim(),
          },
        });
      }

      setSuccess("Gym owner account created successfully. Please log in to continue.");
      setOwnerForm(initialOwnerForm);
      setRole("gym_owner");
    } catch (e: any) {
      setError(formatApiError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={[colors.bg, "#17161D", colors.bgSoft]} style={styles.container}>
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
          <View style={styles.headerRow}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
            >
              <Ionicons name="chevron-back" size={18} color={colors.text} />
            </Pressable>
            <Text style={styles.title}>Create Account</Text>
            <View style={styles.headerRight} />
          </View>

          <Text style={styles.subtitle}>
            Complete signup as a member or gym owner using the new backend workflow.
          </Text>

          <View style={styles.card}>
            <View style={styles.segment}>
              <Pressable
                onPress={() => {
                  setRole("member");
                  setError(null);
                  setSuccess(null);
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
                  Member Signup
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setRole("gym_owner");
                  setError(null);
                  setSuccess(null);
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
                  Gym Owner Signup
                </Text>
              </Pressable>
            </View>

            {role === "member" ? (
              <View style={styles.formBody}>
                <InputField
                  label="Gym ID *"
                  value={memberForm.gymId}
                  onChangeText={(value) => setMemberForm((prev) => ({ ...prev, gymId: value }))}
                  placeholder="Existing gym UUID"
                  editable={!loading}
                />
                <InputField
                  label="Username *"
                  value={memberForm.username}
                  onChangeText={(value) => setMemberForm((prev) => ({ ...prev, username: value }))}
                  placeholder="john_doe"
                  editable={!loading}
                  autoCapitalize="none"
                />
                <InputField
                  label="Email *"
                  value={memberForm.email}
                  onChangeText={(value) => setMemberForm((prev) => ({ ...prev, email: value }))}
                  placeholder="john@example.com"
                  editable={!loading}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <InputField
                  label="Password *"
                  value={memberForm.password}
                  onChangeText={(value) => setMemberForm((prev) => ({ ...prev, password: value }))}
                  placeholder="At least 6 characters"
                  secureTextEntry
                  editable={!loading}
                />
                <InputField
                  label="Height (cm) *"
                  value={memberForm.heightCm}
                  onChangeText={(value) => setMemberForm((prev) => ({ ...prev, heightCm: value }))}
                  placeholder="175"
                  keyboardType="number-pad"
                  editable={!loading}
                />
                <InputField
                  label="Weight (kg)"
                  value={memberForm.weightKg}
                  onChangeText={(value) => setMemberForm((prev) => ({ ...prev, weightKg: value }))}
                  placeholder="72"
                  keyboardType="decimal-pad"
                  editable={!loading}
                />
                <InputField
                  label="First Name"
                  value={memberForm.firstName}
                  onChangeText={(value) =>
                    setMemberForm((prev) => ({ ...prev, firstName: value }))
                  }
                  placeholder="John"
                  editable={!loading}
                />
                <InputField
                  label="Last Name"
                  value={memberForm.lastName}
                  onChangeText={(value) =>
                    setMemberForm((prev) => ({ ...prev, lastName: value }))
                  }
                  placeholder="Doe"
                  editable={!loading}
                />
                <InputField
                  label="Phone"
                  value={memberForm.phone}
                  onChangeText={(value) => setMemberForm((prev) => ({ ...prev, phone: value }))}
                  placeholder="9999999999"
                  keyboardType="phone-pad"
                  editable={!loading}
                />
                <InputField
                  label="Gender"
                  value={memberForm.gender}
                  onChangeText={(value) => setMemberForm((prev) => ({ ...prev, gender: value }))}
                  placeholder="Male"
                  editable={!loading}
                />
                <InputField
                  label="Date of Birth"
                  value={memberForm.dateOfBirth}
                  onChangeText={(value) =>
                    setMemberForm((prev) => ({ ...prev, dateOfBirth: value }))
                  }
                  placeholder="YYYY-MM-DD"
                  editable={!loading}
                />

                <View style={styles.videoPanel}>
                  <Text style={styles.videoLabel}>Face Video *</Text>
                  <Text style={styles.videoHint}>
                    Record a clear front-facing video for verification.
                  </Text>
                  <Pressable
                    onPress={onRecordVideo}
                    disabled={loading}
                    style={({ pressed }) => [
                      styles.videoButton,
                      pressed && styles.pressed,
                      loading && styles.disabled,
                    ]}
                  >
                    <Ionicons name="videocam" size={16} color={colors.text} />
                    <Text style={styles.videoButtonText}>Record Face Video</Text>
                  </Pressable>
                  {videoFile ? (
                    <Text style={styles.videoFilename} numberOfLines={1}>
                      Selected: {videoFile.name}
                    </Text>
                  ) : (
                    <Text style={styles.videoFilename}>No video selected yet.</Text>
                  )}
                </View>

                <Pressable
                  onPress={onSubmitMemberSignup}
                  disabled={!memberCanSubmit}
                  style={({ pressed }) => [
                    styles.submit,
                    (!memberCanSubmit || loading) && styles.disabled,
                    pressed && memberCanSubmit && styles.pressed,
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.text} />
                  ) : (
                    <Text style={styles.submitText}>Submit Member Signup</Text>
                  )}
                </Pressable>
              </View>
            ) : (
              <View style={styles.formBody}>
                <View style={styles.segment}>
                  <Pressable
                    onPress={() => setOwnerMode("join_existing")}
                    style={({ pressed }) => [
                      styles.segmentOption,
                      ownerMode === "join_existing" && styles.segmentOptionActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.segmentOptionText,
                        ownerMode === "join_existing" && styles.segmentOptionTextActive,
                      ]}
                    >
                      Join Existing Gym
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setOwnerMode("create_new")}
                    style={({ pressed }) => [
                      styles.segmentOption,
                      ownerMode === "create_new" && styles.segmentOptionActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.segmentOptionText,
                        ownerMode === "create_new" && styles.segmentOptionTextActive,
                      ]}
                    >
                      Create New Gym
                    </Text>
                  </Pressable>
                </View>

                <InputField
                  label="Email *"
                  value={ownerForm.email}
                  onChangeText={(value) => setOwnerForm((prev) => ({ ...prev, email: value }))}
                  placeholder="owner@gym.com"
                  editable={!loading}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <InputField
                  label="Full Name *"
                  value={ownerForm.fullName}
                  onChangeText={(value) => setOwnerForm((prev) => ({ ...prev, fullName: value }))}
                  placeholder="Gym Owner"
                  editable={!loading}
                />
                <InputField
                  label="Password *"
                  value={ownerForm.password}
                  onChangeText={(value) => setOwnerForm((prev) => ({ ...prev, password: value }))}
                  placeholder="At least 6 characters"
                  editable={!loading}
                  secureTextEntry
                />

                {ownerMode === "join_existing" ? (
                  <InputField
                    label="Gym ID *"
                    value={ownerForm.gymId}
                    onChangeText={(value) => setOwnerForm((prev) => ({ ...prev, gymId: value }))}
                    placeholder="EXISTING_GYM_UUID"
                    editable={!loading}
                  />
                ) : (
                  <View style={styles.formBody}>
                    <InputField
                      label="Gym Name *"
                      value={ownerForm.gymName}
                      onChangeText={(value) =>
                        setOwnerForm((prev) => ({ ...prev, gymName: value }))
                      }
                      placeholder="Iron House Gym"
                      editable={!loading}
                    />
                    <InputField
                      label="Address *"
                      value={ownerForm.address}
                      onChangeText={(value) =>
                        setOwnerForm((prev) => ({ ...prev, address: value }))
                      }
                      placeholder="Main Street"
                      editable={!loading}
                    />
                    <InputField
                      label="City *"
                      value={ownerForm.city}
                      onChangeText={(value) => setOwnerForm((prev) => ({ ...prev, city: value }))}
                      placeholder="Pune"
                      editable={!loading}
                    />
                  </View>
                )}

                <Pressable
                  onPress={onSubmitOwnerSignup}
                  disabled={!ownerCanSubmit}
                  style={({ pressed }) => [
                    styles.submit,
                    (!ownerCanSubmit || loading) && styles.disabled,
                    pressed && ownerCanSubmit && styles.pressed,
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.text} />
                  ) : (
                    <Text style={styles.submitText}>Submit Gym Owner Signup</Text>
                  )}
                </Pressable>
              </View>
            )}

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {success ? (
              <View style={styles.successBox}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text style={styles.successText}>{success}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={() => navigation.replace("Login")}
              style={({ pressed }) => [styles.loginRow, pressed && styles.pressed]}
            >
              <Text style={styles.loginText}>Already have an account? Go to login</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.accent} />
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function InputField(
  props: {
    label: string;
    value: string;
    onChangeText: (value: string) => void;
    placeholder: string;
    editable: boolean;
    secureTextEntry?: boolean;
    keyboardType?: "default" | "email-address" | "number-pad" | "decimal-pad" | "phone-pad";
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
  }
) {
  const {
    label,
    value,
    onChangeText,
    placeholder,
    editable,
    secureTextEntry,
    keyboardType,
    autoCapitalize,
  } = props;

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          editable={editable}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={styles.input}
        />
      </View>
    </View>
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
    width: 320,
    height: 320,
    backgroundColor: "rgba(240, 51, 24, 0.24)",
  },
  glowTwo: {
    bottom: -190,
    left: -120,
    width: 320,
    height: 320,
    backgroundColor: "rgba(247, 213, 167, 0.14)",
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
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
  headerRight: {
    width: 40,
    height: 40,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.muted,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(35, 34, 41, 0.95)",
    padding: spacing.md,
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
    paddingHorizontal: spacing.xs,
  },
  segmentOptionActive: {
    backgroundColor: "rgba(243, 89, 54, 0.26)",
  },
  segmentOptionText: {
    ...typography.small,
    color: colors.muted,
    textAlign: "center",
  },
  segmentOptionTextActive: {
    color: colors.text,
    fontWeight: "700",
  },
  formBody: {
    gap: spacing.sm,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.text,
  },
  inputWrap: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: "rgba(17, 17, 19, 0.62)",
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  input: {
    color: colors.text,
    fontSize: 15,
    paddingVertical: spacing.sm,
  },
  videoPanel: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: "rgba(17, 17, 19, 0.62)",
    padding: spacing.sm,
    gap: spacing.xs,
  },
  videoLabel: {
    ...typography.caption,
    color: colors.text,
  },
  videoHint: {
    ...typography.small,
    color: colors.muted,
  },
  videoButton: {
    minHeight: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.xs,
    backgroundColor: "rgba(243, 89, 54, 0.86)",
  },
  videoButtonText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: "700",
  },
  videoFilename: {
    ...typography.small,
    color: colors.muted,
  },
  submit: {
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryStrong,
    ...shadows.md,
  },
  submitText: {
    color: colors.text,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: "rgba(238, 99, 82, 0.45)",
    backgroundColor: "rgba(238, 99, 82, 0.13)",
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  errorText: {
    ...typography.caption,
    color: colors.text,
    flex: 1,
  },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: "rgba(28, 188, 102, 0.45)",
    backgroundColor: "rgba(28, 188, 102, 0.13)",
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  successText: {
    ...typography.caption,
    color: colors.text,
    flex: 1,
  },
  loginRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  loginText: {
    ...typography.small,
    color: colors.accent,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.9,
  },
});
