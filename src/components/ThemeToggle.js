import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useTheme } from "../state/theme";
import { darkClassic } from "../constants/colors";

const ThemeToggle = ({ style }) => {
  const { isDark, toggleTheme } = useTheme();
  const animatedValue = useRef(new Animated.Value(isDark ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isDark ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isDark]);

  const togglePosition = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [3, 83], // Adjusted for smaller width: light mode left (3), dark mode right (83)
    extrapolate: "clamp",
  });

  const lightBackgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#f0f0f0", darkClassic.card],
    extrapolate: "clamp",
  });

  const darkBackgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#666", darkClassic.background],
    extrapolate: "clamp",
  });

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.toggleContainer}
        onPress={toggleTheme}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.toggleBackground,
            { backgroundColor: lightBackgroundColor },
          ]}
        >
          {/* AYDINLIK MOD Section */}
          <View style={styles.modeSection}>
            <Text
              style={[
                styles.modeText,
                {
                  color: isDark ? darkClassic.muted : "#333",
                  fontWeight: isDark ? "normal" : "bold",
                },
              ]}
            >
              AYDIN
            </Text>
          </View>

          {/* KARANLIK MOD Section */}
          <View style={styles.modeSection}>
            <Text
              style={[
                styles.modeText,
                {
                  color: isDark ? darkClassic.accent : "#999",
                  fontWeight: isDark ? "bold" : "normal",
                },
              ]}
            >
              KARAN
            </Text>
          </View>

          {/* Animated Toggle Circle */}
          <Animated.View
            style={[
              styles.toggleCircle,
              {
                left: togglePosition,
                backgroundColor: isDark ? darkBackgroundColor : "#fff",
              },
            ]}
          >
            <Text style={styles.toggleIcon}>{isDark ? "🌙" : "☀️"}</Text>
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  toggleContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toggleBackground: {
    width: 120,
    height: 28,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    paddingHorizontal: 5,
  },
  modeSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modeText: {
    fontSize: 8,
    fontWeight: "bold",
    letterSpacing: 0.2,
  },
  toggleCircle: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toggleIcon: {
    fontSize: 12,
  },
});

export default ThemeToggle;
