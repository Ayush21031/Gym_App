import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "../screens/SplashScreen";
import LoginScreen from "../screens/LoginScreen";
import DashboardScreen from "../screens/DashboardScreen";
import { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: "fade", // smooth transition
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ animation: "fade" }}
      />
    </Stack.Navigator>
  );
}
