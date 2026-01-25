import React, { useEffect, useMemo, useRef } from "react";
import { View, Text, StyleSheet, Image, Animated, Easing } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

export default function SplashScreen({ navigation }: Props) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  const rotate = useMemo(
    () =>
      rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
      }),
    [rotateAnim]
  );

  useEffect(() => {
    const rot = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 650,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    rot.start();
    pulse.start();

    const t = setTimeout(() => {
      navigation.replace("Login");
    }, 3000);

    return () => {
      clearTimeout(t);
      rot.stop();
      pulse.stop();
    };
  }, [navigation, rotateAnim, pulseAnim]);

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.brand}>Titan Fit</Text>
        <Text style={styles.tagline}>Train smart. Lift strong.</Text>

        <Animated.View
          style={[
            styles.loaderWrap,
            { transform: [{ scale: pulseScale }], opacity: pulseOpacity },
          ]}
        >
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Ionicons name="barbell" size={28} color={colors.primary2} />
          </Animated.View>
          <Text style={styles.loadingText}>Loading</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  logo: { width: 120, height: 120, marginBottom: spacing.lg },
  brand: { ...typography.title, color: colors.text, marginTop: spacing.sm },
  tagline: {
    ...typography.body,
    color: colors.muted,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  loaderWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 999,
    backgroundColor: "rgba(124, 92, 255, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(45, 226, 230, 0.20)",
  },
  loadingText: { ...typography.body, color: colors.text },
});
