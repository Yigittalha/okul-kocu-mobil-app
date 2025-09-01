import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  SafeAreaView,
} from "react-native";
import { SessionContext } from "../state/session";
import { useTheme } from "../state/theme";
import { useNavigation } from "@react-navigation/native";
import { useSlideMenu } from "./SlideMenuContext";

/**
 * Slide Menu Bileşeni - Döngüsel bağımlılıkları önlemek için
 * AppDrawer'dan ayrılmış versiyonu
 */
export default function SlideMenu() {
  const { role, schoolCode, clearSession } = useContext(SessionContext);
  const { theme, isDark } = useTheme();
  const navigation = useNavigation();
  const { menuVisible, closeMenu } = useSlideMenu();

  const handleLogout = () => {
    Alert.alert("Çıkış Yap", "Oturumu kapatmak istediğinizden emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Çıkış Yap",
        style: "destructive",
        onPress: async () => {
          closeMenu();
          await clearSession();
        },
      },
    ]);
  };

  const handleNavigate = (screenName) => {
    closeMenu();
    
    // Öğrenci bilgilerini geçirmek için özel durumlar
    if (screenName === "StudentHomeworkList" || screenName === "StudentAbsences") {
      // Bu sayfalar için öğrenci bilgilerini geçirmek gerekiyor
      // Şimdilik sadece navigate ediyoruz, öğrenci bilgileri sayfa içinde alınacak
      navigation.navigate(screenName);
    } else {
      navigation.navigate(screenName);
    }
  };

  const getMenuItems = () => {
    switch (role) {
      case "admin":
        return [
          {
            name: "Dashboard",
            label: "🏠 Ana Sayfa",
            screen: "AdminDashboard",
          },
          {
            name: "TeachersList",
            label: "👩‍🏫 Öğretmenler",
            screen: "TeachersList",
          },
          {
            name: "StudentsList",
            label: "👨‍🎓 Öğrenciler",
            screen: "StudentsList",
          },
          {
            name: "Users",
            label: "👥 Kullanıcı Yönetimi",
            screen: "AdminDashboard",
          },
          {
            name: "Schools",
            label: "🏫 Okul Yönetimi",
            screen: "AdminDashboard",
          },
          {
            name: "Attendance",
            label: "✅ Yoklama",
            screen: "AttendanceStart",
          },
          { name: "Reports", label: "📊 Raporlar", screen: "AdminDashboard" },
        ];
      case "teacher":
        return [
          { name: "Profile", label: "🏠 Profil", screen: "TeacherDashboard" },
          {
            name: "Schedule",
            label: "📅 Ders Programı",
            screen: "TeacherSchedule",
          },
          {
            name: "TeachersList",
            label: "👩‍🏫 Öğretmenler",
            screen: "TeachersList",
          },
          {
            name: "StudentsList",
            label: "👨‍🎓 Öğrenciler",
            screen: "StudentsList",
          },
          {
            name: "Classes",
            label: "📚 Derslerim",
            screen: "TeacherDashboard",
          },
          {
            name: "Attendance",
            label: "✅ Yoklama",
            screen: "AttendanceStart",
          },
          {
            name: "HomeworksGiven",
            label: "📚 Verdiğim Ödevler",
            screen: "HomeworksGivenList",
          },
          {
            name: "Messages",
            label: "💬 Mesajlar",
            screen: "TeacherDashboard",
          },
        ];
      case "parent":
        return [
          {
            name: "Student",
            label: "🏠 Öğrenci Bilgileri",
            screen: "ParentDashboard",
          },
          {
            name: "Homework",
            label: "📚 Ödevlerim",
            screen: "StudentHomeworkList",
          },
          {
            name: "Absences",
            label: "📊 Devamsızlık Geçmişi",
            screen: "StudentAbsences",
          },
          { name: "Messages", label: "💬 Mesajlar", screen: "ParentDashboard" },
        ];
      default:
        return [];
    }
  };

  const getRoleTitle = () => {
    switch (role) {
      case "admin":
        return "Admin Paneli";
      case "teacher":
        return "Öğretmen Paneli";
      case "parent":
        return "Veli Paneli";
      default:
        return "Panel";
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={menuVisible}
      onRequestClose={closeMenu}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView
          style={[styles.slideMenu, { backgroundColor: theme.background }]}
        >
          <View
            style={[styles.menuHeader, { borderBottomColor: theme.border }]}
          >
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.card }]}
              onPress={closeMenu}
            >
              <Text style={[styles.closeButtonText, { color: theme.text }]}>
                ✕
              </Text>
            </TouchableOpacity>

            <Image
              source={require("../../assets/logo.png")}
              style={styles.menuLogo}
              resizeMode="contain"
            />
            <Text style={[styles.menuTitle, { color: theme.text }]}>
              OKUL KOÇU
            </Text>
            <Text style={[styles.roleTitle, { color: theme.text }]}>
              {getRoleTitle()}
            </Text>
            {schoolCode && (
              <View
                style={[styles.schoolBadge, { backgroundColor: theme.accent }]}
              >
                <Text style={[
                  styles.schoolText, 
                  { color: isDark ? theme.background : theme.primary }
                ]}>
                  🏫 {schoolCode}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.menuContainer}>
            {getMenuItems().map((item) => (
              <TouchableOpacity
                key={item.name}
                style={[styles.menuItem, { backgroundColor: theme.card }]}
                onPress={() => handleNavigate(item.screen)}
              >
                <Text style={[styles.menuLabel, { color: theme.text }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            style={[
              styles.logoutButton,
              { borderColor: isDark ? theme.danger : "#ff6b6b" }
            ]} 
            onPress={handleLogout}
          >
            <Text style={[
              styles.logoutText,
              { color: isDark ? theme.danger : "#ff6b6b" }
            ]}>
              🚪 Çıkış Yap
            </Text>
          </TouchableOpacity>
        </SafeAreaView>

        <TouchableOpacity
          style={styles.modalBackground}
          activeOpacity={1}
          onPress={closeMenu}
        />
      </View>
    </Modal>
  );
}

// Placeholder screen - moved from AppDrawer for completeness
export const PlaceholderScreen = ({ title }) => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.placeholderContainer,
        { backgroundColor: theme.background },
      ]}
    >
      <Text style={[styles.placeholderText, { color: theme.text }]}>
        {title}
      </Text>
      <Text style={[styles.placeholderSubtext, { color: theme.text }]}>
        Bu özellik geliştirilecek
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    flexDirection: "row",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  slideMenu: {
    width: 280,
    paddingTop: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  menuHeader: {
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  closeButton: {
    alignSelf: "flex-end",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  menuLogo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  roleTitle: {
    fontSize: 14,
    opacity: 0.8,
    marginTop: 5,
  },
  schoolBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
  },
  schoolText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  menuItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginVertical: 2,
    borderRadius: 12,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  logoutButton: {
    margin: 20,
    backgroundColor: "transparent",
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  placeholderSubtext: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
  },
});
