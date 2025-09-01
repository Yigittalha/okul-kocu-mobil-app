import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import api, { getUploadUrl, fetchUserInfo } from "../../lib/api";
import { SessionContext } from "../../state/session";
import { useTheme } from "../../state/theme";
import ThemeToggle from "../../ui/theme/ThemeToggle";
import { useSlideMenu } from "../../navigation/SlideMenuContext";
import RefreshableScrollView from "../../components/RefreshableScrollView";

// SlideMenu import'u kaldırıldı - döngüsel bağımlılık çözümü

const TeacherDashboard = () => {
  const navigation = useNavigation();
  const { schoolCode, clearSession } = useContext(SessionContext);
  const { theme, isDark, toggleTheme } = useTheme();
  const { openMenu } = useSlideMenu();
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // menuVisible state'i kaldırıldı - döngüsel bağımlılık çözümü

  const fetchTeacherData = async () => {
    try {
      console.log("🚀 Fetching teacher data using fetchUserInfo...");
      const data = await fetchUserInfo(true); // showErrors true olarak ayarlandı

      if (data) {
        console.log("✅ Teacher user info fetched successfully!");
        console.log("📋 Response data:", data);
        setTeacherData(data);
        setError(null); // Hata durumunu temizle
      } else {
        console.log("⚠️ Teacher data not returned");
        setError("Kullanıcı bilgileri alınamadı. Lütfen tekrar giriş yapın.");
        
        // Oturumu sonlandır
        setTimeout(() => {
          clearSession();
        }, 2000);
      }
    } catch (error) {
      console.log("❌ Teacher data fetch error:", error);
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
    console.log("🚀 İlk açılışta öğretmen verisini çekiyorum...");
    fetchTeacherData();
    // Otomatik döngüsel yenileme kaldırıldı - sadece manuel yenileme aktif
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTeacherData();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("tr-TR");
  };

  const getGenderText = (gender) => {
    return gender === true || gender === "1" ? "Erkek" : "Kadın";
  };

  const getUserPhotoUrl = () => {
    try {
      console.log("=== TEACHER PHOTO DEBUG ===");
      console.log("teacherData mevcut mu:", teacherData ? "EVET" : "HAYIR");

      if (!teacherData) {
        console.log("Öğretmen verisi yok!");
        return null;
      }

      console.log("teacherData?.Fotograf:", teacherData?.Fotograf);

      if (!teacherData?.Fotograf) {
        console.log("!!! FOTO YOK - NULL DÖNÜYORUM !!!");
        return null;
      }

      // Fotoğraf string'i geldi mi kontrol et
      if (
        typeof teacherData.Fotograf !== "string" ||
        teacherData.Fotograf.trim() === ""
      ) {
        console.log("!!! FOTO STRING DEĞİL VEYA BOŞ - NULL DÖNÜYORUM !!!");
        return null;
      }

      const photoUrl = getUploadUrl(teacherData.Fotograf);
      console.log("Generated Teacher Photo URL:", photoUrl);
      console.log("=== END TEACHER DEBUG ===");

      // URL oluşturulduysa kullan, yoksa null döndür
      if (!photoUrl) {
        console.log("!!! PHOTO URL OLUŞTURULAMADI !!!");
        return null;
      }

      return photoUrl;
    } catch (error) {
      console.log("!!! HATA OLUŞTU !!!", error);
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
        <Text style={[styles.errorText, { color: theme.danger }]}>
          {error}
        </Text>
      </View>
    );
  }

  if (!teacherData) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Öğretmen bilgileri bulunamadı
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.accent }]}
          onPress={fetchTeacherData}
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
          Öğretmen Profili
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
                style={styles.userPhoto}
                defaultSource={require("../../../assets/icon.png")}
              />
            ) : (
              <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
                <Text style={styles.avatarText}>👩‍🏫</Text>
              </View>
            )}
          </View>

          <Text style={[styles.name, { color: theme.text }]}>
            {teacherData?.AdSoyad}
          </Text>
          <Text style={[styles.department, { color: theme.text }]}>
            {teacherData?.Bolum} Öğretmeni
          </Text>
          <Text style={[styles.teacherId, { color: theme.text }]}>
            ID: {teacherData?.OgretmenID}
          </Text>

          {schoolCode && (
            <View
              style={[styles.schoolBadge, { backgroundColor: theme.accent }]}
            >
              <Text style={[styles.schoolText, { color: theme.primary }]}>
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
              {teacherData?.Eposta}
            </Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.infoLabel, { color: theme.text }]}>
              📱 Telefon:
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {teacherData?.Telefon}
            </Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.infoLabel, { color: theme.text }]}>
              🆔 TC Kimlik:
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {teacherData?.TCKimlikNo}
            </Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.infoLabel, { color: theme.text }]}>
              👤 Cinsiyet:
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {getGenderText(teacherData?.Cinsiyet)}
            </Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.infoLabel, { color: theme.text }]}>
              🎂 Doğum Tarihi:
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {formatDate(teacherData?.DogumTarihi)}
            </Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[
              styles.actionCard,
              { backgroundColor: theme.card, borderColor: theme.accent },
            ]}
          >
            <Text style={styles.actionIcon}>📚</Text>
            <Text style={[styles.actionTitle, { color: theme.text }]}>
              Dersler
            </Text>
            <Text style={[styles.actionDesc, { color: theme.text }]}>
              Sınıflar ve notlar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionCard,
              { backgroundColor: theme.card, borderColor: theme.accent },
            ]}
            onPress={() => navigation.navigate("TeacherSchedule")}
          >
            <Text style={styles.actionIcon}>📅</Text>
            <Text style={[styles.actionTitle, { color: theme.text }]}>
              Ders Programı
            </Text>
            <Text style={[styles.actionDesc, { color: theme.text }]}>
              Haftalık program
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionCard,
              { backgroundColor: theme.card, borderColor: theme.accent },
            ]}
            onPress={() => navigation.navigate("AttendanceStart")}
          >
            <Text style={styles.actionIcon}>✅</Text>
            <Text style={[styles.actionTitle, { color: theme.text }]}>
              Yoklama
            </Text>
            <Text style={[styles.actionDesc, { color: theme.text }]}>
              Devamsızlık takibi
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionCard,
              { backgroundColor: theme.card, borderColor: theme.accent },
            ]}
            onPress={() => navigation.navigate("HomeworkAssignment")}
          >
            <Text style={styles.actionIcon}>📝</Text>
            <Text style={[styles.actionTitle, { color: theme.text }]}>
              Ödev Atama
            </Text>
            <Text style={[styles.actionDesc, { color: theme.text }]}>
              Ödev verme ve takip
            </Text>
          </TouchableOpacity>
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
    borderColor: "#FFD60A",
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
    marginBottom: 5,
  },
  teacherId: {
    fontSize: 12,
    opacity: 0.6,
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
  errorText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    padding: 20,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginTop: 20,
  },
  actionCard: {
    width: "48%",
    borderRadius: 15,
    borderWidth: 1,
    padding: 15,
    alignItems: "center",
    marginBottom: 15,
  },
  actionIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  actionDesc: {
    fontSize: 12,
    textAlign: "center",
    opacity: 0.7,
  },
});

export default TeacherDashboard;
