import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import api, { getUploadUrl, fetchUserInfo } from "../../lib/api";
import { getToken } from "../../lib/storage";
import { SessionContext } from "../../state/session";
import { useTheme } from "../../state/theme";
import { useSlideMenu } from "../../navigation/SlideMenuContext";
import ThemeToggle from "../../ui/theme/ThemeToggle";
import RefreshableScrollView from "../../components/RefreshableScrollView";

// Removed darkBlue and yellow imports - using theme tokens now

const AdminDashboard = () => {
  const navigation = useNavigation();
  const { schoolCode, clearSession } = useContext(SessionContext);
  const { theme, isDark, toggleTheme } = useTheme();
  const { openMenu } = useSlideMenu();
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // menuVisible state'i kaldırıldı - döngüsel bağımlılık çözümü

  const fetchAdminData = async () => {
    try {
      const data = await fetchUserInfo(true); // showErrors true olarak ayarlandı

      if (data) {
        setAdminData(data);
        setError(null); // Hata durumunu temizle
      } else {
        setError("Kullanıcı bilgileri alınamadı. Lütfen tekrar giriş yapın.");
        // Oturumu sonlandır
        setTimeout(() => {
          clearSession();
        }, 2000);
      }
    } catch (error) {
      setError("Sistem hatası oluştu. Lütfen tekrar giriş yapın.");

      // Oturumu sonlandır
      setTimeout(() => {
        clearSession();
      }, 2000);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // İlk veriyi çekme işlemi
  useEffect(() => {
    fetchAdminData();
    // Otomatik döngüsel yenileme kaldırıldı - sadece manuel yenileme aktif
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAdminData();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("tr-TR");
  };

  const getGenderText = (gender) => {
    return gender === "1" || gender === true ? "Erkek" : "Kadın";
  };

  const getUserPhotoUrl = () => {
    try {
      if (!adminData) {
        return null;
      }

      if (!adminData?.Fotograf) {
        return null;
      }

      // Fotoğraf string'i geldi mi kontrol et
      if (
        typeof adminData.Fotograf !== "string" ||
        adminData.Fotograf.trim() === ""
      ) {
        return null;
      }

      const photoUrl = getUploadUrl(adminData.Fotograf);

      // URL oluşturulduysa kullan, yoksa null döndür
      if (!photoUrl) {
        return null;
      }

      return photoUrl;
    } catch (error) {
      return null;
    }
  };

  if (loading) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Veriler yükleniyor...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
      </View>
    );
  }

  if (!adminData) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Kullanıcı bilgileri bulunamadı
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.accent }]}
          onPress={fetchAdminData}
        >
          <Text style={[styles.retryText, { color: theme.primary }]}>
            Tekrar Dene
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header kısmını eski haline getir */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.menuButton} onPress={openMenu}>
          <Text style={[styles.menuIcon, { color: theme.text }]}>☰</Text>
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Admin Paneli
        </Text>

        <ThemeToggle />
      </View>

      <RefreshableScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      >
        <View
          style={[
            styles.profileCard,
            { backgroundColor: theme.card, borderColor: theme.accent },
          ]}
        >
          <View style={styles.avatarContainer}>
            {getUserPhotoUrl() ? (
              <Image
                source={{ uri: getUserPhotoUrl() }}
                style={[styles.userPhoto, { borderColor: theme.accent }]}
                defaultSource={require("../../../assets/icon.png")}
              />
            ) : (
              <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
                <Text style={styles.avatarText}>👤</Text>
              </View>
            )}
          </View>

          <Text style={[styles.name, { color: theme.text }]}>
            {adminData?.AdSoyad}
          </Text>
          <Text style={[styles.department, { color: theme.text }]}>
            {adminData?.Bolum}
          </Text>

          {schoolCode && (
            <View
              style={[styles.schoolBadge, { backgroundColor: theme.accent }]}
            >
              <Text
                style={[
                  styles.schoolText,
                  { color: isDark ? theme.background : theme.primary },
                ]}
              >
                🏫 {schoolCode}
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            👤 Kişisel Bilgiler
          </Text>

          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.infoLabel, { color: theme.text }]}>
              📧 E-posta:
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {adminData?.Eposta}
            </Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.infoLabel, { color: theme.text }]}>
              📱 Telefon:
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {adminData?.Telefon}
            </Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.infoLabel, { color: theme.text }]}>
              🆔 TC Kimlik:
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {adminData?.TCKimlikNo}
            </Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.infoLabel, { color: theme.text }]}>
              👤 Cinsiyet:
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {getGenderText(adminData?.Cinsiyet)}
            </Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.infoLabel, { color: theme.text }]}>
              🎂 Doğum Tarihi:
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {formatDate(adminData?.DogumTarihi)}
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <Text style={styles.statIcon}>👥</Text>
            <Text style={[styles.statTitle, { color: theme.text }]}>
              Kullanıcılar
            </Text>
            <Text style={[styles.statValue, { color: theme.text }]}>-</Text>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <Text style={styles.statIcon}>🏫</Text>
            <Text style={[styles.statTitle, { color: theme.text }]}>
              Okullar
            </Text>
            <Text style={[styles.statValue, { color: theme.text }]}>-</Text>
          </View>
        </View>
      </RefreshableScrollView>

      {/* SlideMenu bileşeni kaldırıldı - döngüsel bağımlılık çözümü */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  menuButton: {
    padding: 10,
  },
  menuIcon: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileCard: {
    borderWidth: 2,
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  userPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
  },
  avatarText: {
    fontSize: 40,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
  },
  department: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 10,
  },
  schoolBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  schoolText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  infoCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontSize: 14,
    opacity: 0.8,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    borderWidth: 1,
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  statIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  statTitle: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  errorText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    padding: 20,
  },
});

export default AdminDashboard;
