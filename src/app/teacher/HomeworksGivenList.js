import React, { useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import api from "../../lib/api";
import { SessionContext } from "../../state/session";
import { useTheme } from "../../state/theme";
import { useSlideMenu } from "../../navigation/SlideMenuContext";
import ThemeToggle from "../../ui/theme/ThemeToggle";

const HomeworksGivenList = () => {
  const navigation = useNavigation();
  const { clearSession } = useContext(SessionContext);
  const { theme, isDark, toggleTheme } = useTheme();
  const { openMenu } = useSlideMenu();
  const [homeworksList, setHomeworksList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [teacherInfo, setTeacherInfo] = useState(null);

  // Fetch data only once on mount
  useEffect(() => {
    // TODO: remove before prod
    // console.log("🚀 Fetching teacher homeworks data on mount...");
    fetchTeacherHomeworks();
  }, []);

  const fetchTeacherHomeworks = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: remove before prod
      // console.log("🚀 Starting to fetch teacher info...");

      // Öğretmen bilgilerini al
      const teacherResponse = await api.post("/user/info", {});
      
      // TODO: remove before prod
      // console.log("📡 Teacher info response received:", teacherResponse?.status);
      // console.log("📋 Full teacher response data:", teacherResponse?.data);
      
      if (teacherResponse?.data) {
        // TODO: remove before prod
        // console.log("✅ Teacher data received successfully");
        // console.log("🔍 Checking for OgretmenID:", teacherResponse.data.OgretmenID);
        
        if (teacherResponse.data.OgretmenID) {
          setTeacherInfo(teacherResponse.data);
          
          // TODO: remove before prod
          // console.log("📋 Teacher data set:", {
          //   OgretmenID: teacherResponse.data.OgretmenID
          // });
          
          // Ödev listesini al
          // TODO: remove before prod
          // console.log("🚀 Starting to fetch homeworks data...");
          // console.log("🌐 Full API URL will be: https://c802f00043e4.ngrok-free.app/api/teacher/homeworkget");
          // console.log("📤 Request body:", { OgretmenID: teacherResponse.data.OgretmenID });
          
          const homeworksResponse = await api.post("/teacher/homeworkget", {
            OgretmenID: teacherResponse.data.OgretmenID
          });

          // TODO: remove before prod
          // console.log("📡 Homeworks API Response received:", homeworksResponse?.status);
          // console.log("📋 Response data type:", typeof homeworksResponse?.data);
          // console.log("📋 Response data length:", Array.isArray(homeworksResponse?.data) ? homeworksResponse?.data.length : 'Not an array');

          if (homeworksResponse?.data) {
            // TODO: remove before prod
            // console.log("✅ Homeworks data fetched successfully!");
            // console.log("📋 Found", homeworksResponse.data.length, "homework items");
            
            // Ödevleri tarihe göre sırala (en yeni üstte)
            const sortedHomeworks = homeworksResponse.data.sort((a, b) => {
              const dateA = new Date(a.tarih);
              const dateB = new Date(b.tarih);
              return dateB - dateA; // En yeni tarih üstte
            });
            
            setHomeworksList(sortedHomeworks);
          } else {
            // TODO: remove before prod
            // console.log("⚠️ No homeworks data returned");
            setHomeworksList([]);
          }
        } else {
          // TODO: remove before prod
          // console.log("⚠️ OgretmenID is missing from teacher data");
          // console.log("📋 Available teacher data fields:", Object.keys(teacherResponse.data));
          setError("Öğretmen ID bilgisi bulunamadı. Lütfen tekrar giriş yapın.");
          
          // Oturumu sonlandır
          setTimeout(() => {
            clearSession();
          }, 2000);
        }
      } else {
        // TODO: remove before prod
        // console.log("⚠️ No teacher data received from API");
        setError("Öğretmen bilgileri alınamadı. Lütfen tekrar giriş yapın.");
        
        // Oturumu sonlandır
        setTimeout(() => {
          clearSession();
        }, 2000);
      }
    } catch (error) {
      // TODO: remove before prod
      // console.log("❌ Homeworks fetch error:", error);
      // console.log("❌ Error message:", error.message);
      if (error.response) {
        // console.log("❌ Response status:", error.response.status);
        // console.log("❌ Response data:", error.response.data);
        // console.log("❌ Response headers:", error.response.headers);
      } else if (error.request) {
        // console.log("❌ Request was made but no response received:", error.request);
      } else {
        // console.log("❌ Error setting up request:", error.message);
      }
      
      if (error.response?.status === 401) {
        // TODO: remove before prod
        // console.log("🔐 Authorization error - clearing session");
        clearSession();
        navigation.navigate('Login');
      } else {
        setError("Ödev listesi alınırken bir hata oluştu: " + error.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTeacherHomeworks();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Belirtilmemiş";
    return new Date(dateString).toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const getScopeText = (homework) => {
    if (homework.OgrenciID === null) {
      return "Tüm sınıf";
    } else {
      return "Öğrenciye özel";
    }
  };

  const getScopeColor = (homework) => {
    if (homework.OgrenciID === null) {
      return theme.warning; // Turuncu - tüm sınıf
    } else {
      return theme.accent; // Mavi - öğrenciye özel
    }
  };

  const navigateToDetail = (homework) => {
    navigation.navigate('HomeworkGivenDetail', { 
      homework,
      onDelete: () => {
        // Silme işlemi sonrası listeyi yenile
        fetchTeacherHomeworks();
      }
    });
  };

  // Memoized render item for FlatList performance
  const renderItem = useCallback(({ item, index }) => (
    <TouchableOpacity
      style={[styles.homeworkCard, { backgroundColor: theme.card }]}
      onPress={() => navigateToDetail(item)}
    >
      <View style={styles.homeworkHeader}>
        <View style={styles.subjectContainer}>
          <Text style={[styles.subjectText, { color: theme.text }]} numberOfLines={1}>
            📖 {item.DersAdi}
          </Text>
          <Text style={[styles.topicText, { color: theme.textSecondary }]} numberOfLines={2}>
            {item.Konu}
          </Text>
        </View>
        <View style={styles.scopeContainer}>
          <Text style={[styles.scopeText, { color: getScopeColor(item) }]}>
            {getScopeText(item)}
          </Text>
        </View>
      </View>

      <View style={styles.homeworkFooter}>
        <View style={styles.dateContainer}>
          <Text style={[styles.dateLabel, { color: theme.muted }]}>
            Teslim Tarihi:
          </Text>
          <Text style={[styles.dateText, { color: theme.text }]}>
            {formatDate(item.TeslimTarihi)}
          </Text>
        </View>

        {item.Fotograf && (
          <View style={styles.photoIndicator}>
            <Text style={[styles.photoText, { color: theme.accent }]}>
              📷 Fotoğraf Var
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  ), [theme]);

  // Memoized key extractor
  const keyExtractor = useCallback((item) => item.id?.toString() || Math.random().toString(), []);

  // Memoized getItemLayout for FlatList performance
  const getItemLayout = useCallback((data, index) => ({
    length: 120, // Approximate height of each item
    offset: 120 * index,
    index,
  }), []);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity style={styles.menuButton} onPress={openMenu}>
            <Text style={[styles.menuIcon, { color: theme.text }]}>☰</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Verdiğim Ödevler
          </Text>
          <ThemeToggle />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Ödevler yükleniyor...
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
          Verdiğim Ödevler
        </Text>
        
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.refreshButton, { backgroundColor: theme.accent }]}
            onPress={handleRefresh}
            disabled={refreshing}
          >
            <Text style={[styles.refreshButtonText, { color: '#fff' }]}>
              {refreshing ? '⏳' : '🔄'} Yenile
            </Text>
          </TouchableOpacity>
          <ThemeToggle />
        </View>
      </View>

      {error ? (
        <View style={[styles.errorCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.errorText, { color: theme.danger }]}>
            ❌ {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.accent }]}
            onPress={fetchTeacherHomeworks}
          >
            <Text style={[styles.retryButtonText, { color: '#fff' }]}>
              Tekrar Dene
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={homeworksList}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.emptyText, { color: theme.muted }]}>
                📚 Henüz ödev vermemişsiniz
              </Text>
            </View>
          }
        />
      )}
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
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 10,
  },
  refreshButtonText: {
    fontSize: 12,
    fontWeight: '600',
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
    margin: 16,
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
  listContent: {
    padding: 16,
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
  homeworkCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  homeworkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  subjectContainer: {
    flex: 1,
  },
  subjectText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  topicText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scopeContainer: {
    alignItems: 'flex-end',
  },
  scopeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  homeworkFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
  },
  photoIndicator: {
    alignItems: 'flex-end',
  },
  photoText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default HomeworksGivenList; 