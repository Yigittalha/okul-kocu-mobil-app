import React, { useContext } from "react";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SessionContext } from "../state/session";
import SchoolSelect from "../app/auth/SchoolSelect";
import Login from "../app/auth/Login";
import AppDrawer from "./AppDrawer";
import SlideMenu from "./SlideMenu";
import { useTheme } from "../state/theme";
import { darkClassic } from "../constants/colors";
import ExamAdd from "../app/teacher/ExamAdd";

const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SchoolSelect" component={SchoolSelect} />
      <Stack.Screen name="Login" component={Login} />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const { isAuthenticated, loading } = useContext(SessionContext);
  const { isDark, theme } = useTheme();

  // Create custom dark theme with darkClassic colors
  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: darkClassic.background,
      card: darkClassic.card,
      text: darkClassic.textPrimary,
      border: darkClassic.border,
      notification: darkClassic.accent,
      primary: darkClassic.accent,
    },
  };

  if (loading) return null; // Or a splash screen

  return (
    <NavigationContainer theme={isDark ? customDarkTheme : DefaultTheme}>
      {isAuthenticated ? (
        <>
          <AppDrawer />
          <SlideMenu />
        </>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}
