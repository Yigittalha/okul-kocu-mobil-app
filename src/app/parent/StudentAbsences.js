import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import api from "../../lib/api";
import { SessionContext } from "../../state/session";
import { useTheme } from "../../state/theme";
import { useSlideMenu } from "../../navigation/SlideMenuContext";
import ThemeToggle from "../../ui/theme/ThemeToggle";
import RefreshableScrollView from "../../components/RefreshableScrollView";

const StudentAbsences = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { studentInfo: passedStudentInfo } = route.params || {};
  const { clearSession } = useContext(SessionContext);
  const { theme, isDark, toggleTheme } = useTheme();
  const { openMenu } = useSlideMenu();
  const [absencesList, setAbsencesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [studentInfo, setStudentInfo] = useState(passedStudentInfo);

  // Fetch data only once on mount
  useEffect(() => {
    console.log("🚀 StudentAbsences component mounted!");
    console.log("🚀 Fetching student absences data on mount...");
    fetchStudentAbsences();
  }, []);

  const fetchStudentAbsences = async () => {
    console.log("🚀 fetchStudentAbsences function called!");
    try {
      setLoading(true);
      setError(null);

      // Önce geçirilen öğrenci bilgilerini kontrol et
      if (passedStudentInfo && passedStudentInfo.OgrenciId) {
        console.log("✅ Using passed student info:", passedStudentInfo.OgrenciId);
        setStudentInfo(passedStudentInfo);
        
        // Devamsızlık listesini al
        console.log("🚀 Starting to fetch absences data...");
        console.log("🌐 Full API URL will be: https://c802f00043e4.ngrok-free.app/api/student/attendance");
        console.log("📤 Request body:", { OgrenciID: passedStudentInfo.OgrenciId });
        
        const absencesResponse = await api.post("/student/attendance", {
          OgrenciID: passedStudentInfo.OgrenciId
        });

        console.log("📡 Absences API Response received:", absencesResponse?.status);
        console.log("📋 Response data type:", typeof absencesResponse?.data);
        console.log("📋 Response data length:", Array.isArray(absencesResponse?.data) ? absencesResponse?.data.length : 'Not an array');

        if (absencesResponse?.data) {
          console.log("✅ Absences data fetched successfully!");
          console.log("📋 Found", absencesResponse.data.length, "absence records");
          
          // Devamsızlıkları tarihe göre sırala (en yeni üstte)
          const sortedAbsences = absencesResponse.data.sort((a, b) => {
            const dateA = new Date(a.tarih);
            const dateB = new Date(b.tarih);
            return dateB - dateA; // En yeni tarih üstte
          });
          
          setAbsencesList(sortedAbsences);
        } else {
          console.log("⚠️ No absences data returned");
          setAbsencesList([]);
        }
        return;
      }

      console.log("🚀 No passed student info, fetching user info...");

      // Kullanıcı bilgilerini al (OgrenciId dahil)
      const userResponse = await api.post("/user/info", {});
      
      console.log("📡 User info response received:", userResponse?.status);
      console.log("📋 Full user response data:", userResponse?.data);
      
      if (userResponse?.data) {
        console.log("✅ User data received successfully");
        console.log("🔍 Checking for OgrenciId:", userResponse.data.OgrenciId);
        
        if (userResponse.data.OgrenciId) {
          setStudentInfo(userResponse.data);
          
          console.log("📋 User data set:", {
            OgrenciId: userResponse.data.OgrenciId
          });
          
          // Devamsızlık listesini al
          console.log("🚀 Starting to fetch absences data...");
          console.log("🌐 Full API URL will be: https://c802f00043e4.ngrok-free.app/api/student/attendance");
          console.log("📤 Request body:", { OgrenciID: userResponse.data.OgrenciId });
          
          const absencesResponse = await api.post("/student/attendance", {
            OgrenciID: userResponse.data.OgrenciId
          });

          console.log("📡 Absences API Response received:", absencesResponse?.status);
          console.log("📋 Response data type:", typeof absencesResponse?.data);
          console.log("📋 Response data length:", Array.isArray(absencesResponse?.data) ? absencesResponse?.data.length : 'Not an array');

          if (absencesResponse?.data) {
            console.log("✅ Absences data fetched successfully!");
            console.log("📋 Found", absencesResponse.data.length, "absence records");
            
            // Devamsızlıkları tarihe göre sırala (en yeni üstte)
            const sortedAbsences = absencesResponse.data.sort((a, b) => {
              const dateA = new Date(a.tarih);
              const dateB = new Date(b.tarih);
              return dateB - dateA; // En yeni tarih üstte
            });
            
            setAbsencesList(sortedAbsences);
          } else {
            console.log("⚠️ No absences data returned");
            setAbsencesList([]);
          }
        } else {
          console.log("⚠️ OgrenciId is missing from user data");
          console.log("📋 Available user data fields:", Object.keys(userResponse.data));
          setError("Öğrenci ID bilgisi bulunamadı. Lütfen tekrar giriş yapın.");
          
          // Oturumu sonlandır
          setTimeout(() => {
            clearSession();
          }, 2000);
        }
      } else {
        console.log("⚠️ No user data received from API");
        setError("Kullanıcı bilgileri alınamadı. Lütfen tekrar giriş yapın.");
        
        // Oturumu sonlandır
        setTimeout(() => {
          clearSession();
        }, 2000);
      }
    } catch (error) {
      console.log("❌ Absences fetch error:", error);
      console.log("❌ Error message:", error.message);
      if (error.response) {
        console.log("❌ Response status:", error.response.status);
        console.log("❌ Response data:", error.response.data);
        console.log("❌ Response headers:", error.response.headers);
      } else if (error.request) {
        console.log("❌ Request was made but no response received:", error.request);
      } else {
        console.log("❌ Error setting up request:", error.message);
      }
      
      if (error.response?.status === 401) {
        console.log("🔐 Authorization error - clearing session");
        clearSession();
        navigation.navigate('Login');
      } else {
        setError("Devamsızlık listesi alınırken bir hata oluştu: " + error.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStudentAbsences();
  };

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
        return "Devamsız";
      case 1:
        return "Mevcut";
      case 2:
        return "Geç Geldi";
      default:
        return "Bilinmiyor";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 0:
        return theme.danger; // Devamsız - kırmızı
      case 1:
        return theme.success; // Mevcut - yeşil
      case 2:
        return theme.warning; // Geç geldi - turuncu
      default:
        return theme.muted;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 0:
        return "❌";
      case 1:
        return "✅";
      case 2:
        return "⏰";
      default:
        return "❓";
    }
  };

  const isRecentAbsence = (dateString) => {
    if (!dateString) return false;
    const absenceDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - absenceDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7; // Son 7 gün içinde
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity style={styles.menuButton} onPress={openMenu}>
            <Text style={[styles.menuIcon, { color: theme.text }]}>☰</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Devamsızlık Geçmişi
          </Text>
          <ThemeToggle />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Devamsızlık bilgileri yükleniyor...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.menuButton} onPress={openMenu}>
          <Text style={[styles.menuIcon, { color: theme.text }]}>☰</Text>
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Devamsızlık Geçmişi
        </Text>
        
        <ThemeToggle />
      </View>

      <RefreshableScrollView 
        onRefresh={handleRefresh}
        refreshing={refreshing}
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {error ? (
          <View style={[styles.errorCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.errorText, { color: theme.danger }]}>
              ❌ {error}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { 
                backgroundColor: isDark ? theme.accent : '#007AFF', // iOS mavi tonu
                opacity: 0.9
              }]}
              onPress={fetchStudentAbsences}
            >
              <Text style={[styles.retryButtonText, { color: '#fff' }]}>
                Tekrar Dene
              </Text>
            </TouchableOpacity>
          </View>
        ) : absencesList.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.emptyText, { color: theme.muted }]}>
              📚 Henüz devamsızlık kaydı bulunmuyor
            </Text>
          </View>
        ) : (
          absencesList.map((absence, index) => (
            <View
              key={absence.tarih + index}
              style={[
                styles.absenceCard, 
                { 
                  backgroundColor: theme.card,
                  borderLeftWidth: isRecentAbsence(absence.tarih) ? 4 : 0,
                  borderLeftColor: isRecentAbsence(absence.tarih) ? theme.warning : 'transparent'
                }
              ]}
            >
              <View style={styles.absenceHeader}>
                <View style={styles.dateContainer}>
                  <Text style={[styles.dateText, { color: theme.text }]}>
                    📅 {formatDate(absence.tarih)}
                  </Text>
                  <Text style={[styles.dayText, { color: theme.textSecondary }]}>
                    {absence.Gun}
                  </Text>
                </View>
                <View style={styles.statusContainer}>
                  <Text style={[styles.statusText, { color: getStatusColor(absence.durum) }]}>
                    {getStatusIcon(absence.durum)} {getStatusText(absence.durum)}
                  </Text>
                </View>
              </View>

              <View style={styles.absenceDetails}>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.muted }]}>
                    📖 Ders:
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {absence.Ders}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.muted }]}>
                    🕐 Saat:
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {absence.DersSaati}
                  </Text>
                </View>
              </View>

              {isRecentAbsence(absence.tarih) && (
                <View style={[styles.recentBadge, { backgroundColor: theme.warning + '20' }]}>
                  <Text style={[styles.recentText, { color: theme.warning }]}>
                    ⏰ Son 7 gün içinde
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </RefreshableScrollView>
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
  menuButton: {
    padding: 10,
  },
  menuIcon: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyCard: {
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  absenceCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  absenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dateContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  absenceDetails: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  recentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  recentText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default StudentAbsences; 