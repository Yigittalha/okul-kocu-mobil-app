import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api, { getUploadUrl, fetchAllStudents } from '../../lib/api';
import { getToken } from '../../lib/storage';
import { darkBlue, yellow } from '../../constants/colors';
import { SessionContext } from '../../state/session';
import { useTheme } from '../../state/theme';
import { SlideMenu } from '../../navigation/AppDrawer';
import ThemeToggle from '../../components/ThemeToggle';
import RefreshableScrollView from '../../components/RefreshableScrollView';

const ParentDashboard = () => {
  const navigation = useNavigation();
  const { schoolCode } = useContext(SessionContext);
  const { theme, isDark, toggleTheme } = useTheme();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  // Fetch data only once on mount
  useEffect(() => {
    console.log("🚀 Fetching student data on mount...");
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      console.log('🚀 Fetching student data using fetchAllStudents API...');
      const data = await fetchAllStudents();
      
      if (data && data.length > 0) {
        console.log('✅ Student data fetched successfully!');
        console.log('📋 Found', data.length, 'students');
        
        // Use the first student from the response
        const studentInfo = data[0];
        console.log('📋 Using student data:', studentInfo);
        
        setStudentData(studentInfo);
      } else {
        console.log('⚠️ No student data returned, using mock data');
        // Fallback mock data when API fails
        setStudentData({
          "Sinif": "5-A",
          "OgrenciNumara": "30",
          "AdSoyad": "Öğrenci Kullanıcı",
          "TCKimlikNo": "67894567835",
          "Cinsiyet": false,
          "DogumTarihi": "2013-11-08T00:00:00.000Z",
          "AnneAdSoyad": "Anne Adı",
          "BabaAdSoyad": "Baba Adı",
          "VeliDurum": true,
          "Sag": "Var",
          "Engel": false,
          "AnneEgitim": "Ortaokul",
          "BabaEgitim": "Lise",
          "AnneMeslek": "Ev Hanımı",
          "BabaMeslek": "Esnaf",
          "SuregenRahatsizlik": "Yok",
          "AylikGelir": "15000",
          "AnneTel": "05009995566",
          "BabaTel": "05001006677",
          "Fotograf": "default.png",
          "OgrenciId": 63
        });
      }
    } catch (error) {
      console.log('❌ Student data fetch error:', error);
      
      // Fallback mock data when API fails
      setStudentData({
        "Sinif": "5-A",
        "OgrenciNumara": "30",
        "AdSoyad": "Öğrenci Kullanıcı",
        "TCKimlikNo": "67894567835",
        "Cinsiyet": false,
        "DogumTarihi": "2013-11-08T00:00:00.000Z",
        "AnneAdSoyad": "Anne Adı",
        "BabaAdSoyad": "Baba Adı",
        "VeliDurum": true,
        "Sag": "Var",
        "Engel": false,
        "AnneEgitim": "Ortaokul",
        "BabaEgitim": "Lise",
        "AnneMeslek": "Ev Hanımı",
        "BabaMeslek": "Esnaf",
        "SuregenRahatsizlik": "Yok",
        "AylikGelir": "15000",
        "AnneTel": "05009995566",
        "BabaTel": "05001006677",
        "Fotograf": "default.png",
        "OgrenciId": 63
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStudentData();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getGenderText = (gender) => {
    return gender === true || gender === "1" ? "Erkek" : "Kız";
  };

  const getStudentPhotoUrl = () => {
    try {
      console.log('=== STUDENT PHOTO DEBUG ===');
      console.log('studentData mevcut mu:', studentData ? 'EVET' : 'HAYIR');
      
      if (!studentData) {
        console.log('Öğrenci verisi yok!');
        return null;
      }
      
      console.log('studentData?.Fotograf:', studentData?.Fotograf);
      
      if (!studentData?.Fotograf) {
        console.log('!!! FOTO YOK - NULL DÖNÜYORUM !!!');
        return null;
      }
      
      // Fotoğraf string'i geldi mi kontrol et
      if (typeof studentData.Fotograf !== 'string' || studentData.Fotograf.trim() === '') {
        console.log('!!! FOTO STRING DEĞİL VEYA BOŞ - NULL DÖNÜYORUM !!!');
        return null;
      }
      
      console.log('getUploadUrl FONKSİYONUNU ÇAĞIRIYORUM...');
      const photoUrl = getUploadUrl(studentData.Fotograf);
      console.log('FONKSİYON ÇAĞRILDI. SONUÇ:');
      console.log('Generated Student Photo URL:', photoUrl);
      console.log('=== END STUDENT DEBUG ===');
      
      // URL oluşturulduysa kullan, yoksa null döndür
      if (!photoUrl) {
        console.log('!!! PHOTO URL OLUŞTURULAMADI !!!');
        return null;
      }
      
      return photoUrl;
    } catch (error) {
      console.log('!!! HATA OLUŞTU !!!', error);
      return null;
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Öğrenci bilgileri yükleniyor...</Text>
      </View>
    );
  }

  if (!studentData) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.text }]}>Öğrenci bilgileri bulunamadı</Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: theme.accent }]}
          onPress={fetchStudentData}
        >
          <Text style={[styles.retryText, { color: theme.primary }]}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}
        >
          <Text style={[styles.menuIcon, { color: theme.text }]}>☰</Text>
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: theme.text }]}>Öğrenci Bilgileri</Text>
        
        <ThemeToggle />
      </View>

      <RefreshableScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      >
        <View style={[styles.studentCard, { backgroundColor: theme.card, borderColor: theme.accent }]}>
          {/* Student photo display */}
          <View style={styles.avatarContainer}>
            {(() => {
              const photoUrl = getStudentPhotoUrl();
              console.log('Student photo URL for rendering:', photoUrl);
              
              if (photoUrl) {
                return (
                  <Image 
                    source={{ uri: photoUrl }}
                    style={styles.userPhoto}
                  />
                );
              } else {
                return (
                  <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
                    <Text style={styles.avatarText}>
                      {getGenderText(studentData?.Cinsiyet) === "Erkek" ? "👦" : "👧"}
                    </Text>
                  </View>
                );
              }
            })()}
          </View>
          
          <Text style={[styles.studentName, { color: theme.text }]}>{studentData?.AdSoyad}</Text>
          <Text style={[styles.classInfo, { color: theme.text }]}>📚 {studentData?.Sinif} - No: {studentData?.OgrenciNumara}</Text>
          
          {schoolCode && (
            <View style={[styles.schoolBadge, { backgroundColor: theme.accent }]}>
              <Text style={[styles.schoolText, { color: theme.primary }]}>🏫 {schoolCode}</Text>
            </View>
          )}
        </View>

        <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>👤 Öğrenci Bilgileri</Text>
          
          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.infoLabel, { color: theme.text }]}>🆔 TC Kimlik:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{studentData?.TCKimlikNo}</Text>
          </View>
          
          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.infoLabel, { color: theme.text }]}>👤 Cinsiyet:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{getGenderText(studentData?.Cinsiyet)}</Text>
          </View>
          
          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.infoLabel, { color: theme.text }]}>🎂 Doğum Tarihi:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{formatDate(studentData?.DogumTarihi)}</Text>
          </View>
          
          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.infoLabel, { color: theme.text }]}>🏥 Sağlık Durumu:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{studentData?.Sag}</Text>
          </View>
          
          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.infoLabel, { color: theme.text }]}>♿ Engel Durumu:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{studentData?.Engel ? "Var" : "Yok"}</Text>
          </View>
        </View>

        <View style={[styles.familyCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>👨‍👩‍👧‍👦 Aile Bilgileri</Text>
          
          <View style={[styles.parentSection, { borderBottomColor: theme.border }]}>
            <Text style={[styles.parentTitle, { color: theme.text }]}>👩 Anne Bilgileri</Text>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.text }]}>📝 Ad Soyad:</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{studentData?.AnneAdSoyad}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.text }]}>🎓 Eğitim:</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{studentData?.AnneEgitim}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.text }]}>💼 Meslek:</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{studentData?.AnneMeslek}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.text }]}>📱 Telefon:</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{studentData?.AnneTel}</Text>
            </View>
          </View>

          <View style={[styles.parentSection, { borderBottomColor: theme.border }]}>
            <Text style={[styles.parentTitle, { color: theme.text }]}>👨 Baba Bilgileri</Text>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.text }]}>📝 Ad Soyad:</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{studentData?.BabaAdSoyad}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.text }]}>🎓 Eğitim:</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{studentData?.BabaEgitim}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.text }]}>💼 Meslek:</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{studentData?.BabaMeslek}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.text }]}>📱 Telefon:</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{studentData?.BabaTel}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.text }]}>💰 Aylık Gelir:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{studentData?.AylikGelir} ₺</Text>
          </View>
        </View>

        {studentData?.SuregenRahatsizlik && studentData?.SuregenRahatsizlik !== "Yok" && (
          <View style={styles.healthCard}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>🏥 Sağlık Bilgileri</Text>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.text }]}>⚕️ Süreğen Rahatsızlık:</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{studentData?.SuregenRahatsizlik}</Text>
            </View>
          </View>
        )}
      </RefreshableScrollView>

      <SlideMenu 
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onNavigate={(screen) => navigation.navigate(screen)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontWeight: 'bold',
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
    padding: 20,
  },
  studentCard: {
    borderWidth: 2,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFD60A',
  },
  avatarText: {
    fontSize: 40,
  },
  studentName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  classInfo: {
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
    fontWeight: 'bold',
  },
  infoCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  familyCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  healthCard: {
    backgroundColor: 'rgba(255, 100, 100, 0.1)',
    borderWidth: 1,
    borderColor: '#ff6b6b',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  parentSection: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  parentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 13,
    opacity: 0.8,
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
});

export default ParentDashboard; 