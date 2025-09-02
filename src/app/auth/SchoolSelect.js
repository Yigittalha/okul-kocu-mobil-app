import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { useTheme } from "../../state/theme";
import { SessionContext } from "../../state/session";
import { useNavigation } from "@react-navigation/native";
import ThemeToggle from "../../ui/theme/ThemeToggle";
import { schools } from "../../constants/schools";
import { SafeAreaView } from "react-native-safe-area-context";

const SchoolSelect = () => {
  const [selected, setSelected] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const navigation = useNavigation();
  const { updateSchoolCode } = useContext(SessionContext);
  const { theme, isDark, toggleTheme } = useTheme();

  const handleSchoolSelect = (school) => {
    setSelected(school.value);
    setSelectedLabel(school.label);
    setIsOpen(false);
  };

  const handleContinue = () => {
    if (!selected) return;
    updateSchoolCode(selected);
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ThemeToggle style={styles.themeToggle} />

      <View style={styles.logoContainer}>
        <Image
          source={require("../../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.appName, { color: theme.text }]}>OKUL KOÇU</Text>
        <Text style={[styles.subtitle, { color: theme.text }]}>
          Eğitim Yönetim Sistemi
        </Text>
      </View>

      <View style={styles.selectionContainer}>
        <Text style={[styles.title, { color: theme.text }]}>
          Okulunuzu Seçiniz
        </Text>

        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={[styles.dropdownButton, { backgroundColor: theme.input }]}
            onPress={() => setIsOpen(!isOpen)}
          >
            <View style={styles.dropdownContent}>
              <Text style={styles.dropdownIcon}>🏫</Text>
              <Text style={[styles.dropdownText, { color: theme.inputText }]}>
                {selectedLabel || "Okul seçin..."}
              </Text>
            </View>
            <Text
              style={[
                styles.arrow,
                {
                  color: theme.inputText,
                  transform: [{ rotate: isOpen ? "180deg" : "0deg" }],
                },
              ]}
            >
              ▼
            </Text>
          </TouchableOpacity>

          {isOpen && (
            <View
              style={[styles.optionsList, { backgroundColor: theme.input }]}
            >
              <ScrollView style={styles.scrollView} nestedScrollEnabled>
                {schools.map((school) => (
                  <TouchableOpacity
                    key={school.value}
                    style={styles.optionItem}
                    onPress={() => handleSchoolSelect(school)}
                  >
                    <Text style={styles.optionIcon}>🏫</Text>
                    <Text
                      style={[styles.optionText, { color: theme.inputText }]}
                    >
                      {school.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            { opacity: selected ? 1 : 0.6, backgroundColor: theme.accent },
          ]}
          onPress={handleContinue}
          disabled={!selected}
        >
          <Text style={[styles.buttonText, { color: theme.primary }]}>
            {selected ? "➡️ Devam Et" : "📋 Okul Seçin"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  themeToggle: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 1000,
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: Platform.OS === 'ios' ? 40 : 60, // iPhone için daha az padding
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 15,
  },
  appName: {
    fontSize: 26,
    fontWeight: "bold",
    letterSpacing: 3,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.8,
    letterSpacing: 1,
  },
  selectionContainer: {
    flex: 1.2,
    paddingHorizontal: 30,
    paddingTop: Platform.OS === 'ios' ? 10 : 20, // iPhone için daha az padding
    paddingBottom: Platform.OS === 'ios' ? 20 : 30, // iPhone için alt padding
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
  },
  dropdownContainer: {
    marginBottom: 30,
    zIndex: 1000,
  },
  dropdownButton: {
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  dropdownContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dropdownIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  arrow: {
    fontSize: 16,
    fontWeight: "bold",
  },
  optionsList: {
    borderRadius: 15,
    marginTop: 8,
    maxHeight: 220,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  scrollView: {
    maxHeight: 220,
  },
  optionItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    flexDirection: "row",
    alignItems: "center",
  },
  optionIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
  },
  button: {
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 15,
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default SchoolSelect;
