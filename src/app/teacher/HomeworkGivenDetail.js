import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SessionContext } from "../../state/session";
import { useTheme } from "../../state/theme";
import { useSlideMenu } from "../../navigation/SlideMenuContext";
import ThemeToggle from "../../ui/theme/ThemeToggle";
import { getUploadUrl } from "../../lib/api";
import api from "../../lib/api";

const HomeworkGivenDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { homework, onDelete } = route.params;
  const { clearSession } = useContext(SessionContext);
  const { theme, isDark, toggleTheme } = useTheme();
  const { openMenu } = useSlideMenu();
  const [deleting, setDeleting] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "Belirtilmemiş";
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return "Bekliyor";
      case 1:
        return "Tamamlandı";
      case 2:
        return "Gecikti";
      default:
        return "Bilinmiyor";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 0:
        return theme.warning;
      case 1:
        return theme.success;
      case 2:
        return theme.danger;
      default:
        return theme.muted;
    }
  };

  const getScopeText = (homework) => {
    if (homework.OgrenciID === null) {
      return "Tüm sınıf";
    } else {
      return "Öğrenciye özel";
    }
  };

  const getScopeIcon = (homework) => {
    if (homework.OgrenciID === null) {
      return "👥";
    } else {
      return "👤";
    }
  };

  const openPhoto = () => {
    if (homework.Fotograf) {
      const photoUrl = getUploadUrl(homework.Fotograf);
      if (photoUrl) {
        // Burada fotoğrafı büyütme işlemi yapılabilir
        Alert.alert('Fotoğraf', 'Fotoğraf görüntüleme özelliği eklenecek');
      }
    }
  };

  const handleDeleteHomework = () => {
    Alert.alert(
      "Ödevi Sil",
      "Bu ödevi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: deleteHomework,
        },
      ]
    );
  };

  const deleteHomework = async () => {
    try {
      setDeleting(true);
      
      console.log("🗑️ Deleting homework with ID:", homework.id);
      
      const response = await api.post("/teacher/homeworkdelete", {
        id: homework.id
      });

      if (response.status === 200) {
        console.log("✅ Homework deleted successfully");
        Alert.alert(
          "Başarılı",
          "Ödev başarıyla silindi!",
          [
            {
              text: "Tamam",
              onPress: () => {
                // Callback ile listeyi yenile
                if (onDelete) {
                  onDelete();
                }
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        throw new Error("Silme işlemi başarısız");
      }
    } catch (error) {
      console.log("❌ Delete homework error:", error);
      
      if (error.response?.status === 401) {
        console.log("🔐 Authorization error - clearing session");
        clearSession();
        navigation.navigate('Login');
      } else {
        Alert.alert(
          "Hata",
          "Ödev silinirken bir hata oluştu. Lütfen tekrar deneyin."
        );
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={[styles.backIcon, { color: theme.text }]}>←</Text>
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Ödev Detayı
        </Text>
        
        <ThemeToggle />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Info Card */}
        <View style={[styles.mainCard, { backgroundColor: theme.card }]}>
          <View style={styles.subjectRow}>
            <Text style={[styles.subjectText, { color: theme.text }]}>
              📖 {homework.DersAdi}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(homework.durum) + '20' }]}>
              <Text style={[styles.statusBadgeText, { color: getStatusColor(homework.durum) }]}>
                {getStatusText(homework.durum)}
              </Text>
            </View>
          </View>

          <Text style={[styles.topicText, { color: theme.textSecondary }]}>
            📝 {homework.Konu}
          </Text>

          <View style={styles.scopeRow}>
            <Text style={[styles.scopeText, { color: theme.muted }]}>
              {getScopeIcon(homework)} {getScopeText(homework)}
            </Text>
          </View>
        </View>

        {/* Description Card */}
        <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            📋 Açıklama
          </Text>
          <Text style={[styles.descriptionText, { color: theme.textSecondary }]}>
            {homework.Aciklama || "Açıklama belirtilmemiş"}
          </Text>
        </View>

        {/* Dates Card */}
        <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            📅 Tarihler
          </Text>
          
          <View style={styles.dateRow}>
            <Text style={[styles.dateLabel, { color: theme.muted }]}>
              Verilme Tarihi:
            </Text>
            <Text style={[styles.dateValue, { color: theme.text }]}>
              {formatDate(homework.tarih)}
            </Text>
          </View>

          <View style={styles.dateRow}>
            <Text style={[styles.dateLabel, { color: theme.muted }]}>
              Teslim Tarihi:
            </Text>
            <Text style={[styles.dateValue, { color: theme.text }]}>
              {formatDate(homework.TeslimTarihi)}
            </Text>
          </View>
        </View>

        {/* Additional Info Card */}
        <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            ℹ️ Ek Bilgiler
          </Text>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.muted }]}>
              Puan:
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {homework.puan || "Belirtilmemiş"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.muted }]}>
              Sınıf:
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {homework.Sinif || "Belirtilmemiş"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.muted }]}>
              Öğrenci ID:
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {homework.OgrenciID || "Tüm sınıf"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.muted }]}>
              Öğretmen ID:
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {homework.OgretmenID || "Belirtilmemiş"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.muted }]}>
              Kayıt Türü:
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {homework.KayitTuru === 1 ? "Öğrenciye Özel" : "Sınıfa Genel"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.muted }]}>
              Ödev ID:
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {homework.id || "Belirtilmemiş"}
            </Text>
          </View>
        </View>

        {/* Photo Card */}
        {homework.Fotograf && (
          <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              📷 Ödev Fotoğrafı
            </Text>
            
            <TouchableOpacity
              style={styles.photoContainer}
              onPress={openPhoto}
            >
              <Image
                source={{ uri: getUploadUrl(homework.Fotograf) }}
                style={styles.photoImage}
                resizeMode="cover"
              />
              <View style={[styles.photoOverlay, { backgroundColor: theme.background + '80' }]}>
                <Text style={[styles.photoOverlayText, { color: theme.text }]}>
                  👆 Fotoğrafı büyütmek için dokunun
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Delete Button */}
        <TouchableOpacity
          style={[
            styles.deleteButton, 
            { 
              backgroundColor: isDark ? theme.danger : '#DC2626', // Aydınlık modda daha koyu kırmızı
              opacity: deleting ? 0.6 : 1
            }
          ]}
          onPress={handleDeleteHomework}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={[styles.deleteButtonText, { color: '#fff' }]}>
              🗑️ Ödevi Sil
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 10,
  },
  backIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  mainCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  subjectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectText: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  topicText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  scopeRow: {
    marginTop: 8,
  },
  scopeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  photoContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    alignItems: 'center',
  },
  photoOverlayText: {
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  deleteButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeworkGivenDetail; 