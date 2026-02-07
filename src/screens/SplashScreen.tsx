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

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

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
      navigation.replace("Login");
    }, 2600);

    return () => {
      clearTimeout(timer);
      spinLoop.stop();
      pulseLoop.stop();
    };
  }, [navigation, pulse, spin]);

  return (
    <LinearGradient colors={[colors.bg, colors.bgSoft]} style={styles.container}>
      <View style={styles.glow} />
      <View style={styles.content}>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.brand}>Titan Fit</Text>
        <Text style={styles.tagline}>Build strength with focused training.</Text>

        <Animated.View style={[styles.loader, { transform: [{ scale: scaleInterpolation }] }]}>
          <Animated.View style={{ transform: [{ rotate: spinInterpolation }] }}>
            <Ionicons name="barbell" size={22} color={colors.accent} />
          </Animated.View>
          <Text style={styles.loaderText}>Preparing your dashboard</Text>
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
    top: -100,
    left: -40,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(27, 154, 170, 0.26)",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  logo: {
    width: 122,
    height: 122,
    marginBottom: spacing.xs,
  },
  brand: {
    ...typography.display,
    color: colors.text,
  },
  tagline: {
    ...typography.caption,
    color: colors.muted,
    textAlign: "center",
  },
  loader: {
    marginTop: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  loaderText: {
    ...typography.caption,
    color: colors.text,
  },
});
