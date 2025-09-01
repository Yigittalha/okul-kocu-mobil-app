import React, { useEffect } from "react";
import { SessionProvider } from "./src/state/session";
import { ThemeProvider, useTheme } from "./src/state/theme";
import { SlideMenuProvider } from "./src/navigation/SlideMenuContext";
import RootNavigator from "./src/navigation/index";
import {
  LogBox,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { darkClassic } from "./src/constants/colors";

// Redirect console logs to be visible on screen for debugging
if (__DEV__) {
  const originalConsoleLog = console.log;
  console.log = (...args) => {
    originalConsoleLog(...args);

    // Skip certain verbose logs
    const message = args
      .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : arg))
      .join(" ");

    // Photo URL loglarını vurgulayalım
    const isPhotoUrlLog =
      message.includes("Photo URL") ||
      message.includes("PHOTO URL") ||
      message.includes("FOTO");

    if (!global.onScreenLogs) global.onScreenLogs = [];
    global.onScreenLogs.unshift({
      time: new Date().toLocaleTimeString(),
      message,
      isHighlighted: isPhotoUrlLog,
    });

    // Keep only latest 30 logs
    if (global.onScreenLogs.length > 30) global.onScreenLogs.pop();
  };
}

const DebugLogsWithTheme = () => {
  const { theme, isDark } = useTheme();
  const [logs, setLogs] = React.useState([]);
  const [visible, setVisible] = React.useState(true);

  useEffect(() => {
    // Daha az yenileme yapalım (500ms yerine 2000ms)
    const interval = setInterval(() => {
      if (global.onScreenLogs) setLogs([...global.onScreenLogs]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!__DEV__) return null;

  return (
    <>
      <TouchableOpacity
        style={[
          styles.debugToggle,
          {
            backgroundColor: isDark
              ? "rgba(11, 15, 20, 0.7)"
              : "rgba(0,0,0,0.5)",
          },
        ]}
        onPress={() => setVisible(!visible)}
      >
        <Text style={[styles.debugToggleText, { color: theme.text }]}>
          {visible ? "Logları Gizle" : "Logları Göster"}
        </Text>
      </TouchableOpacity>

      {visible && (
        <View
          style={[
            styles.debugContainer,
            {
              backgroundColor: isDark
                ? "rgba(11, 15, 20, 0.7)"
                : "rgba(0,0,0,0.7)",
            },
          ]}
        >
          <Text style={[styles.debugTitle, { color: theme.text }]}>
            DEBUG LOGS:
          </Text>
          <ScrollView style={styles.debugScroll}>
            {logs.length === 0 && (
              <Text style={[styles.debugText, { color: theme.text }]}>
                Henüz log yok...
              </Text>
            )}

            {logs.map((log, i) => (
              <Text
                key={i}
                style={[
                  styles.debugText,
                  { color: theme.text },
                  log.isHighlighted && [
                    styles.debugTextHighlight,
                    { color: isDark ? theme.accent : "yellow" },
                  ],
                ]}
              >
                {log.time}: {log.message}
              </Text>
            ))}
          </ScrollView>
        </View>
      )}
    </>
  );
};

// Simple debug logs without theme dependency
const DebugLogs = () => {
  const [logs, setLogs] = React.useState([]);
  const [visible, setVisible] = React.useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      if (global.onScreenLogs) setLogs([...global.onScreenLogs]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!__DEV__) return null;

  return (
    <>
      <TouchableOpacity
        style={[styles.debugToggle, { backgroundColor: "rgba(0,0,0,0.5)" }]}
        onPress={() => setVisible(!visible)}
      >
        <Text style={[styles.debugToggleText, { color: "#fff" }]}>
          {visible ? "Logları Gizle" : "Logları Göster"}
        </Text>
      </TouchableOpacity>

      {visible && (
        <View
          style={[
            styles.debugContainer,
            { backgroundColor: "rgba(0,0,0,0.7)" },
          ]}
        >
          <Text style={[styles.debugTitle, { color: "#fff" }]}>
            DEBUG LOGS:
          </Text>
          <ScrollView style={styles.debugScroll}>
            {logs.length === 0 && (
              <Text style={[styles.debugText, { color: "#fff" }]}>
                Henüz log yok...
              </Text>
            )}

            {logs.map((log, i) => (
              <Text
                key={i}
                style={[
                  styles.debugText,
                  { color: "#fff" },
                  log.isHighlighted && [
                    styles.debugTextHighlight,
                    { color: "yellow" },
                  ],
                ]}
              >
                {log.time}: {log.message}
              </Text>
            ))}
          </ScrollView>
        </View>
      )}
    </>
  );
};

const AppContent = () => {
  return (
    <>
      <RootNavigator />
      <DebugLogsWithTheme />
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <SessionProvider>
        <SlideMenuProvider>
          <AppContent />
        </SlideMenuProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  debugContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: 300,
    height: 300,
    padding: 5,
    zIndex: 9999,
  },
  debugText: {
    fontSize: 10,
  },
  debugTextHighlight: {
    fontWeight: "bold",
  },
  debugToggle: {
    position: "absolute",
    top: 40,
    left: 10,
    padding: 5,
    zIndex: 9999,
    borderRadius: 5,
  },
  debugToggleText: {
    fontSize: 12,
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
  },
  debugScroll: {
    flex: 1,
  },
});
