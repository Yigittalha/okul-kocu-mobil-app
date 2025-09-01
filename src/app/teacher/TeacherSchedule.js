import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import api from "../../lib/api";
import { SessionContext } from "../../state/session";
import { useTheme } from "../../state/theme";
import { useSlideMenu } from "../../navigation/SlideMenuContext";
import ThemeToggle from "../../ui/theme/ThemeToggle";
import RefreshableScrollView from "../../components/RefreshableScrollView";
import AttendanceResults from "./AttendanceResults";

const TeacherSchedule = ({ route }) => {
  const navigation = useNavigation();
  const { schoolCode, clearSession } = useContext(SessionContext);
  const { theme, isDark } = useTheme();
  const { openMenu } = useSlideMenu();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [teacherId, setTeacherId] = useState(null);
  const [showAttendanceResults, setShowAttendanceResults] = useState(false);
  const [attendanceData, setAttendanceData] = useState(null);
  
  // Route parametrelerini al (yoklama seçimleri ve dersler)
  const routeParams = route?.params;
  const attendanceSelections = routeParams?.selections;
  const apiLessons = routeParams?.lessons;

  // Öğretmen kimliği ve ders programını çekme işlevi
  const fetchTeacherSchedule = async () => {
    try {
      setLoading(true);
      
      // Önce öğretmen bilgilerini çekerek ID'yi alıyoruz
      const userInfoResponse = await api.post("/user/info", {}, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (userInfoResponse?.data?.OgretmenID) {
        const id = userInfoResponse.data.OgretmenID;
        setTeacherId(id);
        
        // Öğretmen ID'si ile ders programını çekiyoruz
        const response = await api.post("/schedule/getteacher", { 
          id: id 
        }, {
          headers: {
            "Content-Type": "application/json"
          }
        });

        // TODO: remove before prod
        // console.log("✅ Schedule data fetched successfully:", response.data);
        // API yanıtını incelemek için detaylı olarak yazdıralım
        if (Array.isArray(response.data) && response.data.length > 0) {
          // TODO: remove before prod
          // console.log("📋 Örnek program kaydı:", JSON.stringify(response.data[0], null, 2));
        }
        
        if (Array.isArray(response.data)) {
          // Günlere göre sıralama
          const orderedDays = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];
          const sortedSchedule = [...response.data].sort((a, b) => {
            const dayOrderA = orderedDays.indexOf(a.Gun);
            const dayOrderB = orderedDays.indexOf(b.Gun);
            
            if (dayOrderA !== dayOrderB) return dayOrderA - dayOrderB;
            
            // Aynı gün içinde saat sıralaması
            const timeA = a.DersSaati.split("-")[0];
            const timeB = b.DersSaati.split("-")[0];
            return timeA.localeCompare(timeB);
          });
          
          // API'den gelen yanıtta Derslik alanı yoksa, her derse geçici olarak derslik bilgisi ekleyelim
          // Bu kısım sadece test amaçlı olup, asıl derslik bilgisi API tarafından sağlanmalıdır
          const scheduleWithClassroom = sortedSchedule.map(lesson => {
            // Eğer Derslik alanı yoksa veya boşsa, sınıf ve ders bilgisine dayalı olarak derslik bilgisi ekleyelim
            if (!lesson.Derslik) {
              const classNumber = lesson.Sinif.split('-')[0]; // "5-A" -> "5"
              return {
                ...lesson,
                Derslik: `D${classNumber}${Math.floor(Math.random() * 5) + 1}` // D51, D52, D53, D54, D55 gibi
              };
            }
            return lesson;
          });
          
          setSchedule(scheduleWithClassroom);
          setError(null);
        } else {
          setSchedule([]);
          setError("Ders programı bulunamadı");
        }
      } else {
        setError("Öğretmen kimliği bulunamadı");
        // console.log("❌ Teacher ID not found in user data");
      }
    } catch (error) {
      // console.log("❌ Error fetching teacher schedule:", error);
      setError("Ders programı yüklenirken bir hata oluştu");
      
      if (error.response?.status === 401 || error.response?.data?.message === "Token geçersiz veya süresi dolmuş") {
        setTimeout(() => {
          clearSession();
        }, 2000);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // İlk veri çekme
  useEffect(() => {
    // Eğer API'den ders verisi geldiyse onu kullan, yoksa normal schedule'ı çek
    if (apiLessons && Array.isArray(apiLessons)) {
      // TODO: remove before prod
      // console.log('📚 API\'den gelen dersler kullanılıyor:', apiLessons);
      setSchedule(apiLessons);
      setLoading(false);
    } else {
      fetchTeacherSchedule();
    }
  }, [apiLessons]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTeacherSchedule();
  };

  // Yoklama başlatma fonksiyonu
  const startAttendanceForLesson = async (lesson) => {
    try {
      // Eğer yoklama seçimleri yoksa, kullanıcıyı uyar
      if (!attendanceSelections) {
        // console.log('⚠️ Yoklama seçimleri bulunamadı. Lütfen önce sınıf ve tarih seçin.');
        return;
      }

      const payload = {
        Sinif: lesson.Sinif || lesson.sinif || attendanceSelections.sinifAdi,
        Tarih: attendanceSelections.dateISO,
        DersSaati: lesson.DersSaati || lesson.saat || '--:--',
        ProgramID: lesson.ProgramID || lesson.id,
        Ders: lesson.Ders || lesson.ders || lesson.dersAdi
      };

      // TODO: remove before prod
      // console.log('📤 Yoklama başlatma isteği gönderiliyor:', {
        Sinif: payload.Sinif,
        Tarih: payload.Tarih,
        DersSaati: payload.DersSaati,
        ProgramID: payload.ProgramID,
        Ders: payload.Ders
      });

      // API isteği gönder
      const response = await api.post('/teacher/attendance', payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        // console.log('✅ Yoklama başlatıldı', response.data);
        
        // Attendance results ekranını göster
        setAttendanceData({
          students: response.data,
          lessonInfo: {
            sinif: payload.Sinif,
            tarih: payload.Tarih,
            dersSaati: payload.DersSaati,
            ders: payload.Ders
          }
        });
        setShowAttendanceResults(true);
        // console.log('✅ AttendanceResults ekranı gösteriliyor');
      }
    } catch (error) {
      // console.log('❌ Yoklama başlatma hatası:', error);
      
      if (error.response?.status === 401) {
        // console.log('🔐 Yetkilendirme hatası - oturum temizleniyor');
        clearSession();
        navigation.navigate('Login');
      } else if (error.response?.status === 404) {
        // API henüz hazır değil, sadece log
        // console.log('📦 Yoklama isteği hazırlanıyor:', payload);
      } else {
        // console.log('🌐 Ağ hatası veya diğer hata:', error.message);
      }
    }
  };

  // Günlere göre gruplanmış ders programını oluşturma
  const groupedSchedule = schedule.reduce((acc, lesson) => {
    if (!acc[lesson.Gun]) {
      acc[lesson.Gun] = [];
    }
    acc[lesson.Gun].push(lesson);
    return acc;
  }, {});

  // Günlere göre gruplandırılmış programı render eden bileşen
  const renderDaySchedule = ({ item: day }) => {
    const lessons = groupedSchedule[day];
    
    return (
      <View style={[styles.dayContainer, { backgroundColor: theme.card }]}>
        <Text style={[styles.dayTitle, { color: theme.text }]}>{day}</Text>
        {lessons.map((lesson, index) => (
          <View 
            key={lesson.ProgramID || lesson.id || index} 
            style={[styles.lessonItem, { borderBottomColor: theme.border }]}
          >
            <View style={styles.timeContainer}>
              <Text style={[styles.timeText, { color: theme.text }]}>
                {lesson.DersSaati || lesson.saat || '--:--'}
              </Text>
            </View>
            <View style={styles.lessonInfoContainer}>
              <View style={styles.classContainer}>
                <Text style={[styles.classText, { color: theme.accent }]}>
                  {lesson.Sinif || lesson.sinif || attendanceSelections?.sinifAdi}
                </Text>
                {lesson.Derslik && (
                  <Text style={[styles.classroomText, { color: theme.textSecondary || theme.text }]}>
                    {`Derslik: ${lesson.Derslik}`}
                  </Text>
                )}
              </View>
              <Text style={[styles.lessonName, { color: theme.text }]}>
                {lesson.Ders || lesson.ders || lesson.dersAdi || 'Ders'}
              </Text>
            </View>
            {attendanceSelections && (
              <TouchableOpacity
                style={[styles.attendanceButton, { backgroundColor: theme.accent }]}
                onPress={() => startAttendanceForLesson(lesson)}
              >
                <Text style={[styles.attendanceButtonText, { 
                  color: theme.background === '#f5f5f5' ? '#fff' : theme.primary 
                }]}>
                  Yoklamayı Başlat
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    );
  };

  // Eğer attendance results gösteriliyorsa AttendanceResults bileşenini render et
  if (showAttendanceResults && attendanceData) {
    return (
      <AttendanceResults 
        route={{ params: attendanceData }}
        navigation={navigation}
      />
    );
  }

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Ders programı yükleniyor...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.accent }]}
          onPress={fetchTeacherSchedule}
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
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={attendanceSelections ? () => navigation.goBack() : openMenu}
        >
          <Text style={[styles.menuIcon, { color: theme.text }]}>
            {attendanceSelections ? '←' : '☰'}
          </Text>
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {apiLessons ? 'Yoklama Dersleri' : 'Ders Programı'}
          </Text>
          {attendanceSelections && (
            <Text style={[styles.attendanceInfo, { color: theme.accent }]}>
              📋 {attendanceSelections.sinifAdi} - {attendanceSelections.dateISO}
            </Text>
          )}
        </View>

        <ThemeToggle />
      </View>
      
      {schedule.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.text }]}>
            {apiLessons ? 'Yoklama dersleri bulunamadı.' : 'Ders programı bulunamadı.'}
          </Text>
        </View>
      ) : apiLessons ? (
        // API'den gelen dersler için basit liste
        <FlatList
          data={schedule}
          renderItem={({ item: lesson, index }) => (
            <View 
              key={lesson.ProgramID || lesson.id || index} 
              style={[styles.lessonItem, { 
                borderBottomColor: theme.border,
                backgroundColor: theme.card,
                marginHorizontal: 16,
                marginVertical: 4,
                borderRadius: 8,
                padding: 16
              }]}
            >
              <View style={styles.lessonInfoContainer}>
                <View style={styles.classContainer}>
                  <Text style={[styles.classText, { color: theme.accent }]}>
                    {lesson.Sinif || lesson.sinif || attendanceSelections?.sinifAdi}
                  </Text>
                  {lesson.DersSaati && (
                    <Text style={[styles.timeText, { color: theme.text, marginLeft: 10 }]}>
                      {lesson.DersSaati}
                    </Text>
                  )}
                </View>
                <Text style={[styles.lessonName, { color: theme.text }]}>
                  {lesson.Ders || lesson.ders || lesson.dersAdi || 'Ders'}
                </Text>
              </View>
              {attendanceSelections && (
                <TouchableOpacity
                  style={[styles.attendanceButton, { backgroundColor: theme.accent }]}
                  onPress={() => startAttendanceForLesson(lesson)}
                >
                  <Text style={[styles.attendanceButtonText, { 
                    color: theme.background === '#f5f5f5' ? '#fff' : theme.primary 
                  }]}>
                    Yoklamayı Başlat
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          keyExtractor={(item, index) => item.ProgramID || item.id || index.toString()}
          contentContainerStyle={styles.scheduleList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        // Normal ders programı için günlere göre gruplandırılmış liste
        <FlatList
          data={Object.keys(groupedSchedule)}
          renderItem={renderDaySchedule}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.scheduleList}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
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
  errorText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    padding: 20,
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
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  attendanceInfo: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  scheduleList: {
    padding: 16,
  },
  dayContainer: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  lessonItem: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  timeContainer: {
    width: 100,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  lessonInfoContainer: {
    flex: 1,
  },
  classContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 6,
  },
  classText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  classroomText: {
    fontSize: 12,
    marginLeft: 8,
    opacity: 0.8,
  },
  lessonName: {
    fontSize: 16,
    fontWeight: "500",
  },
  attendanceButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
    alignSelf: 'flex-start',
  },
  attendanceButtonText: {
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default TeacherSchedule; 