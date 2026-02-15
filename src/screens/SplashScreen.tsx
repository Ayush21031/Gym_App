import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { shadows } from "../theme/shadows";
import { getSession } from "../services/storage";

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

const highlights = [
  { label: "Programs", value: "120+" },
  { label: "Experts", value: "40+" },
  { label: "Members", value: "18K" },
];

export default function SplashScreen({ navigation }: Props) {
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  const spinInterpolation = useMemo(
    () =>
      spin.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
      }),
    [spin]
  );

  const scaleInterpolation = useMemo(
    () =>
      pulse.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.08],
      }),
    [pulse]
  );

  useEffect(() => {
    let isMounted = true;

    const spinLoop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1300,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 700,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ])
    );

    spinLoop.start();
    pulseLoop.start();

    const timer = setTimeout(() => {
      void (async () => {
        const session = await getSession();
        if (!isMounted) return;

        if (
          session?.role === "gym_owner" &&
          session.owner &&
          typeof session.owner.owner_id === "string"
        ) {
          navigation.replace("OwnerDashboard");
          return;
        }

        if (
          session?.role === "member" &&
          session.user &&
          typeof session.user.user_id === "string"
        ) {
          navigation.replace("Main");
          return;
        }

        navigation.replace("Login");
      })();
    }, 2600);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      spinLoop.stop();
      pulseLoop.stop();
    };
  }, [navigation, pulse, spin]);

  return (
    <LinearGradient colors={[colors.bg, "#16151B", colors.bgSoft]} style={styles.container}>
      <View style={[styles.glow, styles.glowOne]} />
      <View style={[styles.glow, styles.glowTwo]} />
      <View style={styles.content}>
        <View style={styles.logoWrap}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.brand}>Titan Fit</Text>
        <Text style={styles.tagline}>Precision training for serious athletes.</Text>

        <View style={styles.statRow}>
          {highlights.map((item) => (
            <View key={item.label} style={styles.statCard}>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <Animated.View style={[styles.loader, { transform: [{ scale: scaleInterpolation }] }]}>
          <Animated.View style={{ transform: [{ rotate: spinInterpolation }] }}>
            <Ionicons name="barbell" size={22} color={colors.accent} />
          </Animated.View>
          <Text style={styles.loaderText}>Preparing your training space</Text>
        </Animated.View>
      </View>
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
    top: -120,
    left: -90,
    width: 320,
    height: 320,
    backgroundColor: "rgba(240, 51, 24, 0.26)",
  },
  glowTwo: {
    right: -120,
    bottom: -140,
    width: 300,
    height: 300,
    backgroundColor: "rgba(247, 213, 167, 0.2)",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  logoWrap: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(44, 43, 51, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    ...shadows.lg,
  },
  logo: {
    width: 88,
    height: 88,
  },
  brand: {
    ...typography.display,
    color: colors.text,
    letterSpacing: 0.8,
  },
  tagline: {
    ...typography.caption,
    color: colors.muted,
    textAlign: "center",
  },
  statRow: {
    width: "100%",
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(35, 34, 41, 0.8)",
    borderRadius: radius.md,
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  statValue: {
    ...typography.h3,
    color: colors.accent,
  },
  statLabel: {
    ...typography.small,
    color: colors.muted,
    marginTop: spacing.xxs,
  },
  loader: {
    marginTop: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: "rgba(35, 34, 41, 0.95)",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  loaderText: {
    ...typography.caption,
    color: colors.text,
  },
});
