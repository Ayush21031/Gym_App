import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { RootStackParamList } from "../navigation/types";
import {
  decidePendingSignup,
  getGymOwnerPendingSignups,
  GymOwner,
  PendingSignupRequest,
} from "../services/auth";
import { BASE_URL } from "../services/api";
import { clearAuthStorage, getSession } from "../services/storage";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { shadows } from "../theme/shadows";

type Props = NativeStackScreenProps<RootStackParamList, "OwnerDashboard">;

function formatMemberName(request: PendingSignupRequest) {
  const fullName = `${request.first_name ?? ""} ${request.last_name ?? ""}`.trim();
  if (fullName.length > 0) return fullName;
  if (request.username) return request.username;
  if (request.email) return request.email;
  return "Pending Member";
}

function toAbsoluteVideoUrl(videoUrl: string) {
  const trimmed = videoUrl.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("/")) return `${BASE_URL}${trimmed}`;
  return `${BASE_URL}/${trimmed}`;
}

export default function OwnerDashboardScreen({ navigation }: Props) {
  const [owner, setOwner] = useState<GymOwner | null>(null);
  const [selectedGymId, setSelectedGymId] = useState("");
  const [pendingRequests, setPendingRequests] = useState<PendingSignupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const ownerName = useMemo(() => owner?.full_name || owner?.email || "Gym Owner", [owner]);

  useEffect(() => {
    void (async () => {
      const session = await getSession();
      if (!session || session.role !== "gym_owner" || !session.owner?.owner_id) {
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
        return;
      }

      setOwner(session.owner);
      setSelectedGymId(session.owner.gyms[0]?.gym_id ?? "");
      setLoading(false);
    })();
  }, [navigation]);

  const loadPendingRequests = useCallback(
    async (isRefreshing = false) => {
      if (!owner || !selectedGymId.trim()) {
        setPendingRequests([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const requests = await getGymOwnerPendingSignups(owner.owner_id, selectedGymId.trim());
        setPendingRequests(requests);
      } catch (e: any) {
        const message =
          e?.response?.data?.message ||
          e?.response?.data?.detail ||
          "Unable to load pending signup requests.";
        setError(String(message));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [owner, selectedGymId]
  );

  useEffect(() => {
    if (!owner || !selectedGymId.trim()) return;
    void loadPendingRequests();
  }, [loadPendingRequests, owner, selectedGymId]);

  async function onLogout() {
    await clearAuthStorage();
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  }

  async function onOpenVideo(videoUrl?: string) {
    if (!videoUrl) return;

    const absoluteUrl = toAbsoluteVideoUrl(videoUrl);
    const canOpen = await Linking.canOpenURL(absoluteUrl);
    if (!canOpen) {
      setError("Unable to open the face video URL on this device.");
      return;
    }
    await Linking.openURL(absoluteUrl);
  }

  async function onApprove(request_id: string) {
    if (!owner) return;

    setActionLoadingId(request_id);
    setError(null);

    try {
      await decidePendingSignup(owner.owner_id, request_id, { action: "APPROVE" });
      setPendingRequests((current) =>
        current.filter((request) => request.request_id !== request_id)
      );
    } catch (e: any) {
      const message =
        e?.response?.data?.message ||
        e?.response?.data?.detail ||
        "Unable to approve this request.";
      setError(String(message));
    } finally {
      setActionLoadingId(null);
      setRejectingRequestId(null);
      setRejectionReason("");
    }
  }

  async function onReject(request_id: string) {
    if (!owner) return;

    const reason = rejectionReason.trim();
    if (!reason) {
      setError("Please enter a rejection reason.");
      return;
    }

    setActionLoadingId(request_id);
    setError(null);

    try {
      await decidePendingSignup(owner.owner_id, request_id, {
        action: "REJECT",
        rejection_reason: reason,
      });
      setPendingRequests((current) =>
        current.filter((request) => request.request_id !== request_id)
      );
    } catch (e: any) {
      const message =
        e?.response?.data?.message ||
        e?.response?.data?.detail ||
        "Unable to reject this request.";
      setError(String(message));
    } finally {
      setActionLoadingId(null);
      setRejectingRequestId(null);
      setRejectionReason("");
    }
  }

  function renderPendingCard({ item }: { item: PendingSignupRequest }) {
    const isRejecting = rejectingRequestId === item.request_id;
    const isActionLoading = actionLoadingId === item.request_id;

    return (
      <View style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <View>
            <Text style={styles.requestName}>{formatMemberName(item)}</Text>
            <Text style={styles.requestMeta}>Request ID: {item.request_id}</Text>
          </View>
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>{item.status ?? "PENDING"}</Text>
          </View>
        </View>

        <View style={styles.detailGrid}>
          <DetailRow label="Username" value={item.username || "-"} />
          <DetailRow label="Email" value={item.email || "-"} />
          <DetailRow label="Phone" value={item.phone || "-"} />
          <DetailRow label="Gender" value={item.gender || "-"} />
          <DetailRow
            label="Height"
            value={item.height_cm ? `${item.height_cm} cm` : "-"}
          />
          <DetailRow
            label="Weight"
            value={item.weight_kg ? `${item.weight_kg} kg` : "-"}
          />
          <DetailRow label="DOB" value={item.date_of_birth || "-"} />
          <DetailRow label="Created" value={item.created_at || "-"} />
        </View>

        <View style={styles.videoRow}>
          <Text style={styles.videoText} numberOfLines={1}>
            {item.face_video_url ? item.face_video_url : "No face video URL provided."}
          </Text>
          {item.face_video_url ? (
            <Pressable
              onPress={() => onOpenVideo(item.face_video_url)}
              style={({ pressed }) => [styles.videoLinkButton, pressed && styles.pressed]}
            >
              <Ionicons name="open-outline" size={15} color={colors.accent} />
              <Text style={styles.videoLinkText}>Open Video</Text>
            </Pressable>
          ) : null}
        </View>

        {isRejecting ? (
          <View style={styles.rejectPanel}>
            <TextInput
              value={rejectionReason}
              onChangeText={setRejectionReason}
              placeholder="Reason for rejection"
              placeholderTextColor={colors.muted}
              editable={!isActionLoading}
              style={styles.rejectInput}
            />
            <View style={styles.rejectActions}>
              <Pressable
                onPress={() => {
                  setRejectingRequestId(null);
                  setRejectionReason("");
                }}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.pressed,
                  isActionLoading && styles.disabled,
                ]}
                disabled={isActionLoading}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => onReject(item.request_id)}
                style={({ pressed }) => [
                  styles.rejectButton,
                  pressed && styles.pressed,
                  isActionLoading && styles.disabled,
                ]}
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <ActivityIndicator color={colors.text} />
                ) : (
                  <Text style={styles.buttonText}>Submit Rejection</Text>
                )}
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.actionRow}>
            <Pressable
              onPress={() => onApprove(item.request_id)}
              style={({ pressed }) => [
                styles.approveButton,
                pressed && styles.pressed,
                isActionLoading && styles.disabled,
              ]}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <Text style={styles.buttonText}>Approve</Text>
              )}
            </Pressable>
            <Pressable
              onPress={() => {
                setRejectingRequestId(item.request_id);
                setRejectionReason("");
              }}
              style={({ pressed }) => [
                styles.rejectButton,
                pressed && styles.pressed,
                isActionLoading && styles.disabled,
              ]}
              disabled={isActionLoading}
            >
              <Text style={styles.buttonText}>Reject</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  }

  return (
    <LinearGradient colors={[colors.bg, "#17161D", colors.bgSoft]} style={styles.container}>
      <View style={[styles.glow, styles.glowOne]} />
      <View style={[styles.glow, styles.glowTwo]} />
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.select({ ios: "padding", android: undefined })}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Owner Console</Text>
              <Text style={styles.headerSubtitle}>{ownerName}</Text>
            </View>
            <Pressable
              onPress={onLogout}
              style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
            >
              <Ionicons name="log-out-outline" size={16} color={colors.text} />
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </View>

          {owner?.gyms?.length ? (
            <View style={styles.gymSelectorCard}>
              <Text style={styles.sectionTitle}>Select Gym</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.gymChipRow}>
                  {owner.gyms.map((gym) => {
                    const active = gym.gym_id === selectedGymId;
                    return (
                      <Pressable
                        key={gym.gym_id}
                        onPress={() => setSelectedGymId(gym.gym_id)}
                        style={({ pressed }) => [
                          styles.gymChip,
                          active && styles.gymChipActive,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text style={[styles.gymChipText, active && styles.gymChipTextActive]}>
                          {gym.gym_name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          ) : (
            <View style={styles.gymSelectorCard}>
              <Text style={styles.sectionTitle}>Gym ID</Text>
              <TextInput
                value={selectedGymId}
                onChangeText={setSelectedGymId}
                placeholder="Enter gym UUID"
                placeholderTextColor={colors.muted}
                style={styles.gymIdInput}
              />
              <Pressable
                onPress={() => void loadPendingRequests()}
                disabled={!selectedGymId.trim()}
                style={({ pressed }) => [
                  styles.refreshButton,
                  !selectedGymId.trim() && styles.disabled,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.refreshButtonText}>Load Requests</Text>
              </Pressable>
            </View>
          )}

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {loading && !refreshing ? (
            <View style={styles.centerState}>
              <ActivityIndicator color={colors.accent} />
              <Text style={styles.stateText}>Loading pending signup requests...</Text>
            </View>
          ) : pendingRequests.length === 0 ? (
            <View style={styles.centerState}>
              <Ionicons name="checkmark-done" size={28} color={colors.success} />
              <Text style={styles.stateTitle}>No Pending Requests</Text>
              <Text style={styles.stateText}>
                New member signups will appear here for approval.
              </Text>
            </View>
          ) : (
            <FlatList
              data={pendingRequests}
              renderItem={renderPendingCard}
              keyExtractor={(item) => item.request_id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => void loadPendingRequests(true)}
                  tintColor={colors.accent}
                />
              }
            />
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={1}>
        {value}
      </Text>
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
    top: -140,
    right: -120,
    width: 320,
    height: 320,
    backgroundColor: "rgba(240, 51, 24, 0.22)",
  },
  glowTwo: {
    bottom: -180,
    left: -120,
    width: 320,
    height: 320,
    backgroundColor: "rgba(247, 213, 167, 0.14)",
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  headerSubtitle: {
    ...typography.small,
    color: colors.muted,
    marginTop: spacing.xxs,
  },
  logoutButton: {
    minHeight: 38,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(35, 34, 41, 0.86)",
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
  },
  logoutText: {
    ...typography.small,
    color: colors.text,
  },
  gymSelectorCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(35, 34, 41, 0.92)",
    borderRadius: radius.md,
    padding: spacing.sm,
    ...shadows.sm,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  gymChipRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  gymChip: {
    minHeight: 34,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    backgroundColor: "rgba(17, 17, 19, 0.52)",
  },
  gymChipActive: {
    backgroundColor: "rgba(243, 89, 54, 0.25)",
    borderColor: "rgba(243, 89, 54, 0.8)",
  },
  gymChipText: {
    ...typography.small,
    color: colors.muted,
  },
  gymChipTextActive: {
    color: colors.text,
    fontWeight: "700",
  },
  gymIdInput: {
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(17, 17, 19, 0.62)",
    color: colors.text,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  refreshButton: {
    minHeight: 42,
    borderRadius: radius.md,
    backgroundColor: colors.primaryStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  refreshButtonText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: "700",
  },
  errorBox: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(238, 99, 82, 0.45)",
    backgroundColor: "rgba(238, 99, 82, 0.12)",
    padding: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  errorText: {
    ...typography.caption,
    color: colors.text,
    flex: 1,
  },
  centerState: {
    flex: 1,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: "rgba(35, 34, 41, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  stateTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.xs,
  },
  stateText: {
    ...typography.caption,
    color: colors.muted,
    textAlign: "center",
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  requestCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(35, 34, 41, 0.95)",
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  requestName: {
    ...typography.h3,
    color: colors.text,
    fontSize: 18,
  },
  requestMeta: {
    ...typography.small,
    color: colors.muted,
    marginTop: spacing.xxs,
  },
  pendingBadge: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(247, 213, 167, 0.4)",
    backgroundColor: "rgba(247, 213, 167, 0.14)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  pendingBadgeText: {
    ...typography.small,
    color: colors.accent,
  },
  detailGrid: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: "rgba(17, 17, 19, 0.52)",
    padding: spacing.sm,
    gap: spacing.xxs,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  detailLabel: {
    ...typography.small,
    color: colors.muted,
    flex: 1,
  },
  detailValue: {
    ...typography.small,
    color: colors.text,
    flex: 1,
    textAlign: "right",
  },
  videoRow: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: "rgba(17, 17, 19, 0.52)",
    padding: spacing.sm,
    gap: spacing.xs,
  },
  videoText: {
    ...typography.small,
    color: colors.muted,
  },
  videoLinkButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.xxs,
  },
  videoLinkText: {
    ...typography.small,
    color: colors.accent,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  approveButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: radius.md,
    backgroundColor: "rgba(28, 188, 102, 0.86)",
    alignItems: "center",
    justifyContent: "center",
  },
  rejectButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: radius.md,
    backgroundColor: "rgba(238, 99, 82, 0.86)",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: {
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(17, 17, 19, 0.52)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  secondaryButtonText: {
    ...typography.caption,
    color: colors.text,
  },
  buttonText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: "700",
  },
  rejectPanel: {
    gap: spacing.sm,
  },
  rejectInput: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: "rgba(17, 17, 19, 0.62)",
    color: colors.text,
    paddingHorizontal: spacing.sm,
  },
  rejectActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.xs,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.9,
  },
});
