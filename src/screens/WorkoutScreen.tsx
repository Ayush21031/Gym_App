import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
  useWindowDimensions,
} from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BarChart, LineChart } from "react-native-chart-kit";

import { getUser } from "../services/storage";
import {
  Rep,
  Session,
  UserHistoryAllResponse,
  fetchUserHistoryAll,
  fetchWorkoutHistoryByDate,
} from "../services/workouts";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { shadows } from "../theme/shadows";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type SetView = {
  key: string;
  exerciseName: string;
  setNumber: number;
  sessionSetNumber: number;
  avgFormScore: number;
  repsCompleted: number;
  reps: Rep[];
  gymName: string;
  startTime: string;
  endTime: string;
  totalCalories: number;
};

type InsightsSummary = {
  totals: { sessions: number; sets: number; reps: number; calories: number };
  dayLabels: string[];
  dayCalories: number[];
  daySessions: number[];
  topExerciseLabels: string[];
  topExerciseReps: number[];
  topFormLabels: string[];
  topFormValues: number[];
};

function toYYYYMMDD(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function timeOf(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function shortDay(value: string) {
  return new Date(value).toLocaleDateString([], { month: "short", day: "numeric" });
}

function displayDate(value: Date) {
  return value.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

function shortText(value: string, max = 9) {
  return value.length > max ? `${value.slice(0, max - 1)}...` : value;
}

function pct(value: number) {
  return `${Math.round(value * 100)}%`;
}

function metric(value?: number, suffix = "") {
  if (value === undefined || value === null || Number.isNaN(value)) return "--";
  return `${value}${suffix}`;
}

export default function WorkoutScreen() {
  const { width } = useWindowDimensions();

  const enter = useRef(new Animated.Value(0)).current;
  const insightEnter = useRef(new Animated.Value(0)).current;

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);

  const [activeExercise, setActiveExercise] = useState("");
  const [activeSetKey, setActiveSetKey] = useState("");

  const [insightsOpen, setInsightsOpen] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [insightsData, setInsightsData] = useState<UserHistoryAllResponse | null>(null);

  const dayKey = useMemo(() => toYYYYMMDD(selectedDate), [selectedDate]);

  useEffect(() => {
    Animated.timing(enter, { toValue: 1, duration: 420, useNativeDriver: true }).start();
  }, [enter]);

  async function loadDaily(date: string) {
    setLoading(true);
    setError(null);
    try {
      const user = await getUser<{ user_id?: string }>();
      const userId = user?.user_id;
      if (!userId) {
        setError("User not found. Please login again.");
        setSessions([]);
        return;
      }
      const response = await fetchWorkoutHistoryByDate(userId, date);
      if (!response.success) {
        setError(response.message || "Unable to load workout history.");
        setSessions([]);
        return;
      }
      setSessions(response.user?.sessions ?? []);
    } catch (e: any) {
      setError(String(e?.response?.data?.message || e?.message || "Unable to load workout history."));
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadInsights() {
    setInsightsLoading(true);
    setInsightsError(null);
    try {
      const user = await getUser<{ user_id?: string }>();
      const userId = user?.user_id;
      if (!userId) {
        setInsightsError("User not found. Please login again.");
        setInsightsData(null);
        return;
      }
      const response = await fetchUserHistoryAll(userId);
      setInsightsData(response);
    } catch (e: any) {
      setInsightsError(String(e?.response?.data?.message || e?.message || "Unable to load insights."));
      setInsightsData(null);
    } finally {
      setInsightsLoading(false);
    }
  }

  useEffect(() => {
    void loadDaily(dayKey);
  }, [dayKey]);

  const summary = useMemo(() => {
    let sets = 0;
    let reps = 0;
    let valid = 0;
    let calories = 0;
    sessions.forEach((session) => {
      calories += session.total_calories || 0;
      sets += session.sets.length;
      session.sets.forEach((set) => {
        reps += set.reps_completed;
        set.reps.forEach((rep) => {
          if (rep.is_valid) valid += 1;
        });
      });
    });
    return {
      sessions: sessions.length,
      sets,
      reps,
      calories: Math.round(calories),
      validPct: reps ? Math.round((valid / reps) * 100) : 0,
    };
  }, [sessions]);

  const exerciseMap = useMemo(() => {
    const map = new Map<string, SetView[]>();
    sessions.forEach((session) => {
      session.sets.forEach((set) => {
        const list = map.get(set.exercise_name) ?? [];
        list.push({
          key: `${session.session_id}:${set.session_set_number}:${set.exercise_name}`,
          exerciseName: set.exercise_name,
          setNumber: set.set_number,
          sessionSetNumber: set.session_set_number,
          avgFormScore: set.avg_form_score,
          repsCompleted: set.reps_completed,
          reps: [...set.reps].sort((a, b) => a.rep_number - b.rep_number),
          gymName: session.gym_name,
          startTime: session.start_time,
          endTime: session.end_time,
          totalCalories: session.total_calories,
        });
        map.set(set.exercise_name, list);
      });
    });
    map.forEach((list) => {
      list.sort((a, b) => {
        const ta = new Date(a.startTime).getTime();
        const tb = new Date(b.startTime).getTime();
        if (ta !== tb) return ta - tb;
        return a.sessionSetNumber - b.sessionSetNumber;
      });
    });
    return map;
  }, [sessions]);

  const exerciseNames = useMemo(() => Array.from(exerciseMap.keys()), [exerciseMap]);

  useEffect(() => {
    if (!exerciseNames.length) {
      setActiveExercise("");
      setActiveSetKey("");
      return;
    }
    if (!activeExercise || !exerciseMap.has(activeExercise)) {
      const next = exerciseNames[0];
      setActiveExercise(next);
      setActiveSetKey(exerciseMap.get(next)?.[0]?.key ?? "");
      return;
    }
    const sets = exerciseMap.get(activeExercise) ?? [];
    if (!sets.some((set) => set.key === activeSetKey)) {
      setActiveSetKey(sets[0]?.key ?? "");
    }
  }, [activeExercise, activeSetKey, exerciseMap, exerciseNames]);

  const activeExerciseSets = useMemo(
    () => (activeExercise ? exerciseMap.get(activeExercise) ?? [] : []),
    [activeExercise, exerciseMap]
  );

  const activeSet = useMemo(
    () => activeExerciseSets.find((set) => set.key === activeSetKey) ?? null,
    [activeExerciseSets, activeSetKey]
  );

  const insights = useMemo<InsightsSummary | null>(() => {
    if (!insightsData) return null;

    const sessionsAll = insightsData.sessions ?? [];
    const dayMap = new Map<string, { calories: number; sessions: number }>();
    const exerciseMapLocal = new Map<string, { reps: number; sets: number; formSum: number; formCount: number }>();

    let totalSets = 0;
    let totalReps = 0;
    let totalCalories = 0;

    sessionsAll.forEach((session) => {
      totalCalories += session.total_calories || 0;
      const day = session.start_time.slice(0, 10);
      const dayBucket = dayMap.get(day) ?? { calories: 0, sessions: 0 };
      dayBucket.calories += session.total_calories || 0;
      dayBucket.sessions += 1;
      dayMap.set(day, dayBucket);

      session.sets.forEach((set) => {
        totalSets += 1;
        totalReps += set.reps_completed;

        const ex = exerciseMapLocal.get(set.exercise_name) ?? {
          reps: 0,
          sets: 0,
          formSum: 0,
          formCount: 0,
        };
        ex.reps += set.reps_completed;
        ex.sets += 1;
        if (typeof set.avg_form_score === "number") {
          ex.formSum += set.avg_form_score;
          ex.formCount += 1;
        }
        exerciseMapLocal.set(set.exercise_name, ex);
      });
    });

    const dayRows = Array.from(dayMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12);

    const exRows = Array.from(exerciseMapLocal.entries())
      .map(([name, value]) => ({
        name,
        reps: value.reps,
        avgForm: value.formCount ? Math.round((value.formSum / value.formCount) * 100) : 0,
      }))
      .sort((a, b) => b.reps - a.reps);

    const topReps = exRows.slice(0, 8);
    const topForm = [...exRows].filter((x) => x.avgForm > 0).sort((a, b) => b.avgForm - a.avgForm).slice(0, 8);

    return {
      totals: {
        sessions: sessionsAll.length,
        sets: totalSets,
        reps: totalReps,
        calories: Math.round(totalCalories),
      },
      dayLabels: dayRows.map(([day]) => shortDay(day)),
      dayCalories: dayRows.map(([, value]) => Math.round(value.calories)),
      daySessions: dayRows.map(([, value]) => value.sessions),
      topExerciseLabels: topReps.map((x) => shortText(x.name, 8)),
      topExerciseReps: topReps.map((x) => x.reps),
      topFormLabels: topForm.map((x) => shortText(x.name, 8)),
      topFormValues: topForm.map((x) => x.avgForm),
    };
  }, [insightsData]);

  useEffect(() => {
    if (!insights) return;
    insightEnter.setValue(0);
    Animated.timing(insightEnter, { toValue: 1, duration: 360, useNativeDriver: true }).start();
  }, [insights, insightEnter]);

  function onDateChange(event: DateTimePickerEvent, value?: Date) {
    if (Platform.OS === "android") setShowPicker(false);
    if (event.type === "dismissed") return;
    if (value) {
      setSelectedDate(value);
      if (Platform.OS === "ios") setShowPicker(false);
    }
  }

  function selectExercise(name: string) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveExercise(name);
    setActiveSetKey(exerciseMap.get(name)?.[0]?.key ?? "");
  }

  function selectSet(key: string) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveSetKey(key);
  }

  const rise = enter.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });
  const chartConfig = useMemo(
    () => ({
      backgroundGradientFrom: "transparent",
      backgroundGradientTo: "transparent",
      decimalPlaces: 0,
      color: (o = 1) => `rgba(27,154,170,${o})`,
      labelColor: (o = 1) => `rgba(242,247,251,${o})`,
      propsForDots: { r: "4", strokeWidth: "2", stroke: colors.accent },
      propsForBackgroundLines: { stroke: "rgba(168,190,207,0.18)" },
    }),
    []
  );

  const dayChartWidth = Math.max(width - spacing.lg * 2, (insights?.dayLabels.length ?? 0) * 58);
  const exerciseChartWidth = Math.max(width - spacing.lg * 2, (insights?.topExerciseLabels.length ?? 0) * 70);

  return (
    <LinearGradient colors={[colors.bg, colors.bgSoft]} style={styles.container}>
      <Animated.View style={[styles.header, { opacity: enter, transform: [{ translateY: rise }] }]}>
        <View>
          <Text style={styles.title}>Workout</Text>
          <Text style={styles.subtitle}>{displayDate(selectedDate)}</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable onPress={() => setShowPicker(true)} style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}>
            <Ionicons name="calendar-outline" size={18} color={colors.text} />
          </Pressable>
          <Pressable
            onPress={() => {
              setInsightsOpen(true);
              if (!insightsData && !insightsLoading) void loadInsights();
            }}
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
          >
            <Ionicons name="analytics-outline" size={16} color={colors.text} />
            <Text style={styles.primaryBtnText}>Insights</Text>
          </Pressable>
        </View>
      </Animated.View>

      {showPicker ? (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.select({ ios: "spinner", android: "default" })}
          onChange={onDateChange}
        />
      ) : null}

      <Animated.ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={{ opacity: enter, transform: [{ translateY: rise }] }}
      >
        <View style={styles.grid}>
          <MetricCard label="Sessions" value={String(summary.sessions)} />
          <MetricCard label="Sets" value={String(summary.sets)} />
          <MetricCard label="Reps" value={String(summary.reps)} />
          <MetricCard label="Valid Reps" value={`${summary.validPct}%`} />
        </View>

        {loading ? (
          <StateCard title="Loading workout" subtitle="Fetching records for selected date.">
            <ActivityIndicator color={colors.accent} />
          </StateCard>
        ) : error ? (
          <StateCard title="Could not load workout" subtitle={error}>
            <Pressable onPress={() => void loadDaily(dayKey)} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </StateCard>
        ) : sessions.length === 0 ? (
          <StateCard title="No sessions found" subtitle="Try another date." />
        ) : (
          <>
            <Text style={styles.section}>Sessions</Text>
            <View style={styles.card}>
              {sessions.map((session) => (
                <View key={session.session_id} style={styles.sessionRow}>
                  <View style={styles.flex}>
                    <Text style={styles.rowTitle}>{session.gym_name}</Text>
                    <Text style={styles.rowMeta}>{timeOf(session.start_time)} - {timeOf(session.end_time)}</Text>
                  </View>
                  <Text style={styles.rowValue}>{Math.round(session.total_calories || 0)} kcal</Text>
                </View>
              ))}
            </View>

            <Text style={styles.section}>Exercise</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabWrap}>
              {exerciseNames.map((name) => {
                const active = name === activeExercise;
                return (
                  <Pressable key={name} onPress={() => selectExercise(name)} style={({ pressed }) => [styles.tab, active && styles.tabActive, pressed && styles.pressed]}>
                    <Text style={[styles.tabText, active && styles.tabTextActive]}>{name}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={styles.section}>Set</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabWrap}>
              {activeExerciseSets.map((set) => {
                const active = set.key === activeSetKey;
                const valid = set.reps.filter((rep) => rep.is_valid).length;
                return (
                  <Pressable key={set.key} onPress={() => selectSet(set.key)} style={({ pressed }) => [styles.setTab, active && styles.setTabActive, pressed && styles.pressed]}>
                    <Text style={[styles.setTitle, active && styles.setTitleActive]}>Set {set.setNumber}</Text>
                    <Text style={[styles.setMeta, active && styles.setMetaActive]}>{set.reps.length} reps / {valid} valid</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={styles.section}>Rep Details</Text>
            {!activeSet ? (
              <StateCard title="Select a set" subtitle="Choose a set to view rep telemetry." />
            ) : (
              <View style={styles.card}>
                <Text style={styles.activeTitle}>{activeSet.exerciseName}</Text>
                <Text style={styles.activeMeta}>{activeSet.gymName} / {timeOf(activeSet.startTime)} - {timeOf(activeSet.endTime)}</Text>
                <Text style={styles.activeMeta}>Form {pct(activeSet.avgFormScore || 0)} / Calories {Math.round(activeSet.totalCalories || 0)}</Text>

                {activeSet.reps.length === 0 ? (
                  <Text style={styles.empty}>No telemetry for this set.</Text>
                ) : (
                  activeSet.reps.map((rep) => (
                    <RepRow key={`${activeSet.key}:${rep.rep_number}`} rep={rep} />
                  ))
                )}
              </View>
            )}
          </>
        )}
      </Animated.ScrollView>

      <Modal visible={insightsOpen} animationType="slide" onRequestClose={() => setInsightsOpen(false)}>
        <LinearGradient colors={[colors.bg, colors.bgSoft]} style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Performance Insights</Text>
            <View style={styles.headerActions}>
              <Pressable onPress={() => void loadInsights()} style={styles.iconBtn}>
                <Ionicons name="refresh" size={18} color={colors.text} />
              </Pressable>
              <Pressable onPress={() => setInsightsOpen(false)} style={styles.iconBtn}>
                <Ionicons name="close" size={20} color={colors.text} />
              </Pressable>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {insightsLoading ? (
              <StateCard title="Loading insights" subtitle="Analyzing full workout history.">
                <ActivityIndicator color={colors.accent} />
              </StateCard>
            ) : insightsError ? (
              <StateCard title="Could not load insights" subtitle={insightsError}>
                <Pressable onPress={() => void loadInsights()} style={styles.retryBtn}>
                  <Text style={styles.retryText}>Retry</Text>
                </Pressable>
              </StateCard>
            ) : !insights ? (
              <StateCard title="No insight data" subtitle="Complete workouts to unlock charts." />
            ) : (
              <Animated.View
                style={{
                  opacity: insightEnter,
                  transform: [
                    {
                      translateY: insightEnter.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }),
                    },
                  ],
                }}
              >
                <View style={styles.grid}>
                  <MetricCard label="All Sessions" value={String(insights.totals.sessions)} />
                  <MetricCard label="Total Sets" value={String(insights.totals.sets)} />
                  <MetricCard label="Total Reps" value={String(insights.totals.reps)} />
                  <MetricCard label="Calories" value={String(insights.totals.calories)} />
                </View>

                <Text style={styles.section}>Calories Trend</Text>
                <ChartCard>
                  {insights.dayCalories.length ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <LineChart
                        data={{ labels: insights.dayLabels, datasets: [{ data: insights.dayCalories }] }}
                        width={dayChartWidth}
                        height={220}
                        chartConfig={chartConfig}
                        bezier
                        style={styles.chart}
                      />
                    </ScrollView>
                  ) : (
                    <Text style={styles.empty}>No calorie data.</Text>
                  )}
                </ChartCard>

                <Text style={styles.section}>Sessions Trend</Text>
                <ChartCard>
                  {insights.daySessions.length ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <BarChart
                        data={{ labels: insights.dayLabels, datasets: [{ data: insights.daySessions }] }}
                        width={dayChartWidth}
                        height={220}
                        fromZero
                        showValuesOnTopOfBars
                        chartConfig={chartConfig}
                        style={styles.chart}
                        yAxisLabel=""
                        yAxisSuffix=""
                      />
                    </ScrollView>
                  ) : (
                    <Text style={styles.empty}>No session data.</Text>
                  )}
                </ChartCard>

                <Text style={styles.section}>Top Exercise Volume</Text>
                <ChartCard>
                  {insights.topExerciseReps.length ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <BarChart
                        data={{ labels: insights.topExerciseLabels, datasets: [{ data: insights.topExerciseReps }] }}
                        width={exerciseChartWidth}
                        height={220}
                        fromZero
                        showValuesOnTopOfBars
                        chartConfig={chartConfig}
                        style={styles.chart}
                        yAxisLabel=""
                        yAxisSuffix=""
                      />
                    </ScrollView>
                  ) : (
                    <Text style={styles.empty}>No volume data.</Text>
                  )}
                </ChartCard>

                <Text style={styles.section}>Best Form Scores</Text>
                <ChartCard>
                  {insights.topFormValues.length ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <BarChart
                        data={{ labels: insights.topFormLabels, datasets: [{ data: insights.topFormValues }] }}
                        width={exerciseChartWidth}
                        height={220}
                        fromZero
                        showValuesOnTopOfBars
                        chartConfig={chartConfig}
                        style={styles.chart}
                        yAxisLabel=""
                        yAxisSuffix="%"
                      />
                    </ScrollView>
                  ) : (
                    <Text style={styles.empty}>No form score data.</Text>
                  )}
                </ChartCard>
              </Animated.View>
            )}
          </ScrollView>
        </LinearGradient>
      </Modal>
    </LinearGradient>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function ChartCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.chartCard}>{children}</View>;
}

function StateCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.stateCard}>
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateSubtitle}>{subtitle}</Text>
      {children ? <View style={{ marginTop: spacing.md }}>{children}</View> : null}
    </View>
  );
}

function RepRow({ rep }: { rep: Rep }) {
  return (
    <View style={styles.repCard}>
      <View style={styles.repTop}>
        <Text style={styles.rowTitle}>Rep {rep.rep_number}</Text>
        <View style={[styles.badge, rep.is_valid ? styles.good : styles.bad]}>
          <Text style={styles.badgeText}>{rep.is_valid ? "Valid" : "Invalid"}</Text>
        </View>
      </View>
      <View style={styles.repGrid}>
        <MiniMetric label="Duration" value={metric(rep.duration_seconds, "s")} />
        <MiniMetric label="Velocity" value={metric(rep.telemetry_data?.velocity)} />
        <MiniMetric label="Start" value={metric(rep.telemetry_data?.start_angle, "deg")} />
        <MiniMetric label="End" value={metric(rep.telemetry_data?.end_angle, "deg")} />
      </View>
      <View style={styles.repFoot}>
        <Text style={styles.rowMeta}>Error Margin</Text>
        <Text style={styles.rowTitle}>{metric(rep.telemetry_data?.error_margin)}</Text>
      </View>
    </View>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricMini}>
      <Text style={styles.metricMiniLabel}>{label}</Text>
      <Text style={styles.metricMiniValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  modal: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerActions: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.caption, color: colors.muted, marginTop: spacing.xxs },

  iconBtn: {
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
  primaryBtn: {
    minHeight: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(126,217,87,0.45)",
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    ...shadows.sm,
  },
  primaryBtnText: { ...typography.caption, color: colors.text },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  metricCard: {
    width: "48%",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    ...shadows.sm,
  },
  metricLabel: { ...typography.small, color: colors.muted },
  metricValue: { ...typography.h3, color: colors.text, marginTop: spacing.xxs },

  section: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.lg,
    ...shadows.md,
  },

  sessionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: spacing.xs },
  flex: { flex: 1, paddingRight: spacing.sm },
  rowTitle: { ...typography.caption, color: colors.text },
  rowMeta: { ...typography.small, color: colors.muted, marginTop: spacing.xxs },
  rowValue: { ...typography.caption, color: colors.accent },

  tabWrap: { paddingBottom: spacing.sm, paddingRight: spacing.lg, gap: spacing.sm },
  tab: {
    minHeight: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: { borderColor: "rgba(27,154,170,0.75)", backgroundColor: colors.cardAlt },
  tabText: { ...typography.caption, color: colors.muted },
  tabTextActive: { color: colors.text },

  setTab: {
    minWidth: 150,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  setTabActive: { borderColor: "rgba(27,154,170,0.75)", backgroundColor: colors.cardAlt },
  setTitle: { ...typography.caption, color: colors.muted },
  setTitleActive: { color: colors.text },
  setMeta: { ...typography.small, color: colors.muted, marginTop: spacing.xxs },
  setMetaActive: { color: colors.text },

  activeTitle: { ...typography.h3, color: colors.text },
  activeMeta: { ...typography.small, color: colors.muted, marginTop: spacing.xxs },

  repCard: {
    marginTop: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: spacing.sm,
  },
  repTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  badge: { borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs },
  good: { backgroundColor: "rgba(88,194,125,0.24)", borderWidth: 1, borderColor: "rgba(88,194,125,0.42)" },
  bad: { backgroundColor: "rgba(238,99,82,0.22)", borderWidth: 1, borderColor: "rgba(238,99,82,0.44)" },
  badgeText: { ...typography.small, color: colors.text },
  repGrid: { marginTop: spacing.sm, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: spacing.xs },
  metricMini: {
    width: "48%",
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  metricMiniLabel: { ...typography.small, color: colors.muted },
  metricMiniValue: { ...typography.caption, color: colors.text, marginTop: spacing.xxs },
  repFoot: {
    marginTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.xs,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  chart: { borderRadius: radius.md },

  stateCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: "center",
    ...shadows.md,
  },
  stateTitle: { ...typography.h3, color: colors.text, textAlign: "center" },
  stateSubtitle: { ...typography.caption, color: colors.muted, textAlign: "center", marginTop: spacing.xs },
  retryBtn: {
    minHeight: 42,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryStrong,
  },
  retryText: { ...typography.caption, color: colors.text },
  empty: { ...typography.caption, color: colors.muted, textAlign: "center", paddingVertical: spacing.sm },
  pressed: { opacity: 0.92 },
});
