import React, { useEffect } from 'react';
import { SessionProvider } from './src/state/session';
import { ThemeProvider } from './src/state/theme';
import RootNavigator from './src/navigation/index';
import { LogBox, Text, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

// Redirect console logs to be visible on screen for debugging
if (__DEV__) {
  const originalConsoleLog = console.log;
  console.log = (...args) => {
    originalConsoleLog(...args);
    
    // Skip certain verbose logs
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : arg
    ).join(' ');
    
    // Photo URL loglarını vurgulayalım
    const isPhotoUrlLog = message.includes('Photo URL') || 
                          message.includes('PHOTO URL') || 
                          message.includes('FOTO');
    
    if (!global.onScreenLogs) global.onScreenLogs = [];
    global.onScreenLogs.unshift({
      time: new Date().toLocaleTimeString(),
      message,
      isHighlighted: isPhotoUrlLog
    });
    
    // Keep only latest 30 logs
    if (global.onScreenLogs.length > 30) global.onScreenLogs.pop();
  };
}

const DebugLogs = () => {
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
        style={styles.debugToggle}
        onPress={() => setVisible(!visible)}
      >
        <Text style={styles.debugToggleText}>
          {visible ? 'Logları Gizle' : 'Logları Göster'}
        </Text>
      </TouchableOpacity>
      
      {visible && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>DEBUG LOGS:</Text>
          <ScrollView style={styles.debugScroll}>
            {logs.length === 0 && (
              <Text style={styles.debugText}>Henüz log yok...</Text>
            )}
            
            {logs.map((log, i) => (
              <Text key={i} style={[
                styles.debugText,
                log.isHighlighted && styles.debugTextHighlight
              ]}>
                {log.time}: {log.message}
              </Text>
            ))}
          </ScrollView>
        </View>
      )}
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <SessionProvider>
        <RootNavigator />
        <DebugLogs />
      </SessionProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  debugContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    maxHeight: 300,
    height: 300,
    padding: 5,
    zIndex: 9999,
  },
  debugText: {
    color: '#fff',
    fontSize: 10,
  },
  debugTextHighlight: {
    fontWeight: 'bold',
    color: 'yellow',
  },
  debugToggle: {
    position: 'absolute',
    top: 40,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 5,
    zIndex: 9999,
    borderRadius: 5,
  },
  debugToggleText: {
    color: '#fff',
    fontSize: 12,
  },
  debugTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  debugScroll: {
    flex: 1,
  },
});
