import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  SafeAreaView,
  FlatList,
  Dimensions,
} from "react-native";
import { SessionContext } from "../state/session";
import { useTheme } from "../state/theme";
import { useNavigation } from "@react-navigation/native";
import { useSlideMenu } from "./SlideMenuContext";
import { MENU_SCHEMA } from "./menuSchema";

/**
 * Slide Menu Bileşeni - Döngüsel bağımlılıkları önlemek için
 * AppDrawer'dan ayrılmış versiyonu
 */
export default function SlideMenu() {
  const { role, schoolCode, clearSession } = useContext(SessionContext);
  const { theme, isDark } = useTheme();
  const navigation = useNavigation();
  const { menuVisible, closeMenu } = useSlideMenu();
  
  // Screen dimensions for responsive design
  const { height } = Dimensions.get('window');
  const MAX_LIST_HEIGHT = Math.floor(height * 0.6); // 60% of screen
  const isSmallScreen = height < 700;
  
  // Accordion state for expanded categories
  const [expandedCategories, setExpandedCategories] = useState(new Set());

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

  const toggleCategory = (categoryKey) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryKey)) {
        newSet.delete(categoryKey);
      } else {
        newSet.add(categoryKey);
      }
      return newSet;
    });
  };

  const getMenuData = () => {
    return MENU_SCHEMA[role] || [];
  };

  const renderMenuItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.menuItem, 
        { 
          backgroundColor: theme.card,
          minHeight: 44,
          paddingVertical: isSmallScreen ? 8 : 12,
          paddingHorizontal: 14,
        }
      ]}
      onPress={() => handleNavigate(item.screen)}
      activeOpacity={0.7}
    >
      <Text 
        style={[
          styles.menuLabel, 
          { 
            color: theme.text,
            fontSize: isSmallScreen ? 14 : 16,
          }
        ]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }) => {
    const isExpanded = expandedCategories.has(item.key);
    
    return (
      <View style={styles.categoryContainer}>
        <TouchableOpacity
          style={[
            styles.categoryHeader,
            { 
              backgroundColor: theme.card,
              minHeight: 44,
              paddingVertical: isSmallScreen ? 10 : 12,
              paddingHorizontal: 14,
            }
          ]}
          onPress={() => toggleCategory(item.key)}
          activeOpacity={0.7}
        >
          <View style={styles.categoryTitleRow}>
            <Text style={styles.categoryIcon}>{item.icon}</Text>
            <Text 
              style={[
                styles.categoryTitle, 
                { 
                  color: theme.text,
                  fontSize: isSmallScreen ? 15 : 16,
                }
              ]}
            >
              {item.title}
            </Text>
          </View>
          <Text 
            style={[
              styles.expandIcon, 
              { 
                color: theme.text,
                transform: [{ rotate: isExpanded ? '180deg' : '0deg' }]
              }
            ]}
          >
            ▼
          </Text>
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.subItemsContainer}>
            {item.items.map((subItem) => (
              <TouchableOpacity
                key={subItem.key}
                style={[
                  styles.subMenuItem,
                  { 
                    backgroundColor: theme.card,
                    minHeight: 44,
                    paddingVertical: isSmallScreen ? 8 : 10,
                    paddingHorizontal: 20,
                  }
                ]}
                onPress={() => handleNavigate(subItem.route)}
                activeOpacity={0.7}
              >
                <Text 
                  style={[
                    styles.subMenuLabel, 
                    { 
                      color: theme.text,
                      fontSize: isSmallScreen ? 13 : 14,
                    }
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {subItem.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
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

          <FlatList
            data={getMenuData()}
            keyExtractor={(item) => item.key}
            renderItem={renderCategory}
            style={{ maxHeight: MAX_LIST_HEIGHT }}
            contentContainerStyle={{ 
              paddingVertical: 8,
              paddingBottom: 16,
            }}
            showsVerticalScrollIndicator={false}
            bounces={false}
          />

          <View style={styles.divider} />

          <View style={styles.logoutContainer}>
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
          </View>
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
    paddingBottom: 20,
  },
  categoryContainer: {
    marginBottom: 4,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    marginVertical: 1,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  expandIcon: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  subItemsContainer: {
    marginLeft: 8,
    marginTop: 2,
  },
  subMenuItem: {
    borderRadius: 8,
    marginVertical: 1,
    marginLeft: 8,
  },
  subMenuLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
    marginHorizontal: 10,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 2,
    borderRadius: 12,
    minHeight: 44,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  logoutButton: {
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
  logoutContainer: {
    paddingHorizontal: 10,
    paddingBottom: 30,
    paddingTop: 10,
    backgroundColor: 'transparent',
  },
  spacer: {
    height: 20, // Add some space between menu items and the logout button
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
