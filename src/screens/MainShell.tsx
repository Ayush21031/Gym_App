import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomTabs, { TabKey } from "../components/BottomTabs";
import HomeScreen from "./HomeScreen";
import WorkoutScreen from "./WorkoutScreen";
import CommunityScreen from "./CommunityScreen";
import { colors } from "../theme/colors";

export default function MainShell() {
  const [active, setActive] = useState<TabKey>("Home");

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        {active === "Home" ? <HomeScreen /> : null}
        {active === "Workout" ? <WorkoutScreen /> : null}
        {active === "Community" ? <CommunityScreen /> : null}
      </View>
      <BottomTabs active={active} onChange={setActive} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flex: 1,
  },
});
