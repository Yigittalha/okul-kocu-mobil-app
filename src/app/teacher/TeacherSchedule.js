import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, SectionList, ActivityIndicator, TouchableOpacity, StyleSheet, Platform, StatusBar as RNStatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api, { fetchUserInfo } from '../../lib/api';
import { useTheme } from '../../state/theme';
import ThemeToggle from '../../ui/theme/ThemeToggle';

const ENDPOINT = '/schedule/getteacher';

export default function TeacherSchedule() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchTeacherSchedule();
  }, []);

  const fetchTeacherSchedule = async () => {
    try {
      setLoading(true);
      setError(null);

      // Sadece öğretmen: /user/info'dan OgretmenID çek
      const userInfo = await fetchUserInfo(false);
      const teacherId = userInfo?.OgretmenID;

      if (!teacherId) {
        setError('Bu sayfa yalnız öğretmenler içindir. Öğretmen girişi yapınız.');
        setLoading(false);
        return;
      }

      // API: POST body { id: teacherId }
      const response = await api.post(ENDPOINT, { id: teacherId });
      const scheduleData = Array.isArray(response?.data) ? response.data : [];
      
      // Günlere göre sırala
      const orderedDays = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];
      const sortedData = scheduleData.sort((a, b) => {
        const dayOrderA = orderedDays.indexOf(a.Gun);
        const dayOrderB = orderedDays.indexOf(b.Gun);
        
        if (dayOrderA !== dayOrderB) return dayOrderA - dayOrderB;
        
        // Aynı gün içinde saat sıralaması
        const timeA = a.DersSaati.split("-")[0];
        const timeB = b.DersSaati.split("-")[0];
        return timeA.localeCompare(timeB);
      });

      setData(sortedData);
    } catch (error) {
      setError(`Ders programı alınamadı: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Günlere göre grupla
  const sections = useMemo(() => {
    const map = new Map();
    for (const item of data) {
      const key = item.Gun || 'Diğer';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    }
    return Array.from(map.entries()).map(([title, items]) => ({
      title,
      data: items
    }));
  }, [data]);

  const topPad = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) : 0;

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background || '#fff' }}>
        {/* Navbar Header */}
        <View style={{ 
          paddingTop: topPad, 
          paddingHorizontal: 16, 
          paddingVertical: 12,
          backgroundColor: theme.background || '#fff',
          borderBottomWidth: 1,
          borderBottomColor: '#eee',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Sol: Geri Butonu + Başlık */}
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={{
                padding: 8,
                marginRight: 12,
                borderRadius: 20,
                backgroundColor: theme.card || '#f8f9fa'
              }}
            >
              <Text style={{ fontSize: 20, color: theme.text }}>←</Text>
            </TouchableOpacity>
            
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: theme.text }}>Yoklama Dersleri</Text>
            </View>
          </View>
          
          {/* Sağ: Theme Toggle */}
          <ThemeToggle />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Ders programı yükleniyor…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background || '#fff' }}>
        {/* Navbar Header */}
        <View style={{ 
          paddingTop: topPad, 
          paddingHorizontal: 16, 
          paddingVertical: 12,
          backgroundColor: theme.background || '#fff',
          borderBottomWidth: 1,
          borderBottomColor: '#eee',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Sol: Geri Butonu + Başlık */}
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={{
                padding: 8,
                marginRight: 12,
                borderRadius: 20,
                backgroundColor: theme.card || '#f8f9fa'
              }}
            >
              <Text style={{ fontSize: 20, color: theme.text }}>←</Text>
            </TouchableOpacity>
            
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: theme.text }}>Yoklama Dersleri</Text>
            </View>
          </View>
          
          {/* Sağ: Theme Toggle */}
          <ThemeToggle />
        </View>
        
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.accent }]}
            onPress={fetchTeacherSchedule}
          >
            <Text style={styles.retryText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background || '#fff' }}>
      {/* Navbar Header */}
      <View style={{ 
        paddingTop: topPad, 
        paddingHorizontal: 16, 
        paddingVertical: 12,
        backgroundColor: theme.background || '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Sol: Geri Butonu + Başlık */}
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={{
              padding: 8,
              marginRight: 12,
              borderRadius: 20,
              backgroundColor: theme.card || '#f8f9fa'
            }}
          >
            <Text style={{ fontSize: 20, color: theme.text }}>←</Text>
          </TouchableOpacity>
          
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: theme.text }}>Yoklama Dersleri</Text>
            <Text style={{ fontSize: 14, opacity: 0.7, marginTop: 2, color: theme.text }}>Derslerden birini seçin</Text>
          </View>
        </View>
        
        {/* Sağ: Theme Toggle */}
        <ThemeToggle />
      </View>

      {/* Ders Listesi */}
      <SectionList
        sections={sections}
        stickySectionHeadersEnabled={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 16 }}
        keyExtractor={(item) => String(item.ProgramID)}

        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('Attendance', {
              Sinif: item.Sinif,
              DersSaati: item.DersSaati,
              ProgramID: String(item.ProgramID),
              Gun: item.Gun,
              Ders: item.Ders,
              Tarih: "2025-09-02"
            })}
            style={{
              marginHorizontal: 16,
              marginTop: 10,
              padding: 16,
              borderRadius: 12,
              backgroundColor: theme.card || '#fff',
              borderWidth: 1,
              borderColor: theme.border || '#eee',
              ...Platform.select({
                android: { elevation: 2 },
                ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } }
              })
            }}
          >
            {/* Üst: Icon + Ders Adı + Derslik */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: theme.accent || '#667eea',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}>
                <Text style={{ 
                  color: '#fff', 
                  fontWeight: '800', 
                  fontSize: 16 
                }}>
                  {index + 1}
                </Text>
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={{ 
                  fontWeight: '700', 
                  fontSize: 16, 
                  color: theme.text,
                  marginBottom: 4
                }}>
                  {item.Ders}
                </Text>
                <Text style={{ 
                  fontSize: 13, 
                  color: theme.textSecondary || theme.text,
                  opacity: 0.7
                }}>
                  📍 {item.Derslik}
                </Text>
              </View>
            </View>
            
            {/* Alt: Sınıf + Saat (Vurgulu) */}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              {/* Sol: Sınıf Bilgisi */}
              <View style={{
                backgroundColor: theme.isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                flex: 1,
                marginRight: 6,
                borderWidth: 1,
                borderColor: theme.isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'
              }}>
                <Text style={{ 
                  fontSize: 13, 
                  fontWeight: '600',
                  color: theme.isDark ? '#93c5fd' : '#1e40af',
                  textAlign: 'center'
                }}>
                  🏫 {item.Sinif}
                </Text>
              </View>
              
              {/* Sağ: Saat Bilgisi */}
              <View style={{
                backgroundColor: theme.isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                flex: 1,
                marginLeft: 6,
                borderWidth: 1,
                borderColor: theme.isDark ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)'
              }}>
                <Text style={{ 
                  fontSize: 13, 
                  fontWeight: '600',
                  color: theme.isDark ? '#fcd34d' : '#d97706',
                  textAlign: 'center'
                }}>
                  🕐 {item.DersSaati}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{ padding: 16 }}>
            <Text style={{ color: theme.text }}>Bu öğretmen için ders bulunamadı.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f2f2f7', // Default background for header
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryText: {
    fontWeight: '600',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee', // Default border color
  },
  sectionTitle: {
    fontWeight: '700',
  },
  lessonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee', // Default border color
  },
  lessonInfo: {
    flex: 1,
  },
  lessonName: {
    fontWeight: '600',
    fontSize: 16,
  },
  lessonDetails: {
    fontSize: 14,
    opacity: 0.8,
  },
  lessonTime: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 16,
  },
  emptyContainer: {
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee', // Default border color
  },
  scheduleHeader: {
    flex: 1,
  },
  classInfo: {
    fontSize: 14,
    opacity: 0.8,
  },
  timeInfo: {
    fontSize: 14,
    fontWeight: '600',
  },
});
