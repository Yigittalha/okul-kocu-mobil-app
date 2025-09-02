import React, { useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Pressable,
} from "react-native";
import { useTheme } from "../../state/theme";
import { Feather } from "@expo/vector-icons";
import { darkClassic } from "../../constants/colors";

/**
 * Aydınlık/Karanlık tema geçişi için kullanılan bileşen
 * Gönderilen referans görüntülere uygun şekilde tasarlanmıştır
 */
const ThemeToggle = ({ size = 40 }) => {
  const { isDark, toggleTheme } = useTheme();

  // Animasyon için kullanılan referanslar
  const switchAnim = useRef(new Animated.Value(isDark ? 1 : 0)).current;
  const knobScale = useRef(new Animated.Value(1)).current;

  // Tema değişikliği olduğunda animasyonu güncelle
  useEffect(() => {
    Animated.timing(switchAnim, {
      toValue: isDark ? 1 : 0,
      duration: 300,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: false,
    }).start();
  }, [isDark]);

  // Basıldığında hafif bir ölçeklendirme animasyonu ekle
  const handlePressIn = () => {
    Animated.spring(knobScale, {
      toValue: 0.9,
      useNativeDriver: false,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(knobScale, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: false,
    }).start();
  };

  // Düğme genişliği için hesaplama
  const width = size * 2;
  const knobSize = size * 0.8;

  // Animasyon değerlerine dayalı interpolasyonlar
  const translateX = switchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, width - knobSize - 4],
  });

  const trackBgColor = switchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#f0f0f0", darkClassic.card],
  });

  const knobColor = switchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#ffffff", darkClassic.surface],
  });

  const scale = Animated.multiply(knobScale, 1);

  return (
    <View style={styles.pressable}>
      <Animated.View
        style={[
          styles.track,
          {
            backgroundColor: trackBgColor,
            width,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        {/* Knob ve içindeki güneş/ay ikonu - tıklama olayı knob container'ında */}
        <Animated.View
          style={[
            styles.knob,
            {
              width: knobSize,
              height: knobSize,
              borderRadius: knobSize / 2,
              backgroundColor: knobColor,
              transform: [{ translateX }, { scale }],
            },
          ]}
        >
          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={toggleTheme}
            accessibilityRole="switch"
            accessibilityState={{ checked: isDark }}
            accessibilityLabel={isDark ? "Aydınlık moda geç" : "Karanlık moda geç"}
            style={styles.knobPressable}
          >
            {/* Aydınlık mod ikonu (güneş) */}
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  opacity: switchAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 0, 0],
                  }),
                },
              ]}
            >
              <Feather name="sun" size={knobSize * 0.6} color="#F59E0B" />
            </Animated.View>

            {/* Karanlık mod ikonu (ay) */}
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  opacity: switchAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 0, 1],
                  }),
                },
              ]}
            >
              <Feather name="moon" size={knobSize * 0.55} color="#E6E8EB" />
            </Animated.View>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  pressable: {

    justifyContent: "center",
    alignItems: "center",
  },
  track: {
    justifyContent: "center",
    // Gölge efekti
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  knob: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    // Gölge efekti
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  iconContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  knobPressable: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ThemeToggle;
