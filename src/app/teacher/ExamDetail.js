import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../../state/theme";
import { SessionContext } from "../../state/session";
import { useSlideMenu } from "../../navigation/SlideMenuContext";
import ThemeToggle from "../../ui/theme/ThemeToggle";
import { deleteExam } from "../../lib/api";

const ExamDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme, isDark } = useTheme();
  const { openMenu } = useSlideMenu();
  const { clearSession } = useContext(SessionContext);

  // Rota parametrelerinden sınav bilgilerini al
  const { exam } = route.params;

  const [deleting, setDeleting] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const handleDeleteExam = () => {
    Alert.alert(
      "Sınavı Sil",
      "Bu sınavı silmek istediğinizden emin misiniz?",
      [
        {
          text: "İptal",
          style: "cancel"
        },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteExam(exam.id, true);
              
              Alert.alert(
                "Başarılı",
                "Sınav başarıyla silindi!",
                [{ 
                  text: "Tamam", 
                  onPress: () => navigation.goBack() 
                }]
              );
            } catch (error) {
              console.error("Sınav silme hatası:", error);
              
              const errorMessage = error.response 
                ? `Sunucu hatası: ${error.response.status} - ${error.response.data?.message || 'Bilinmeyen hata'}`
                : 'Sınav silinirken bir bağlantı hatası oluştu';

              Alert.alert(
                "Hata",
                errorMessage,
                [{ text: "Tamam" }]
              );
            } finally {
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: theme.text }]}>
            ← Geri
          </Text>
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Sınav Detayları
        </Text>
        
        <ThemeToggle />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
          <View style={styles.detailHeader}>
            <Text style={[styles.examTitle, { color: theme.text }]}>
              {exam.SinavAdi}
            </Text>
            <Text style={[styles.examDate, { color: theme.textSecondary }]}>
              {formatDate(exam.Tarih)}
            </Text>
          </View>

          <View style={styles.detailSection}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.muted }]}>Ders:</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {exam.Ders}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.muted }]}>Sınıf:</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {exam.Sinif}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.muted }]}>Sınav Süresi:</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {exam.SinavSuresi} dakika
              </Text>
            </View>
          </View>

          {exam.Aciklama && (
            <View style={styles.descriptionSection}>
              <Text style={[styles.descriptionLabel, { color: theme.muted }]}>
                Açıklama:
              </Text>
              <Text style={[styles.descriptionText, { color: theme.text }]}>
                {exam.Aciklama}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.deleteButton, 
            { 
              backgroundColor: isDark ? theme.danger : '#FF3B30', 
              opacity: deleting ? 0.5 : 1 
            }
          ]}
          onPress={handleDeleteExam}
          disabled={deleting}
        >
          <Text style={[styles.deleteButtonText, { color: '#fff' }]}>
            {deleting ? "Siliniyor..." : "Sınavı Sil"}
          </Text>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  detailCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  examTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  examDate: {
    fontSize: 14,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  descriptionSection: {
    marginTop: 10,
  },
  descriptionLabel: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.7,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  deleteButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ExamDetail;
