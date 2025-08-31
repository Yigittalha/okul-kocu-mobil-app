import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  Animated
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchAllStudents, getUploadUrl } from '../../lib/api';
import { useTheme } from '../../state/theme';
import { SessionContext } from '../../state/session';
import { SlideMenu } from '../../navigation/AppDrawer';
import ThemeToggle from '../../components/ThemeToggle';

const StudentItem = ({ student, theme }) => {
  const [expanded, setExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleExpand = () => {
    const toValue = expanded ? 0 : 1;
    setExpanded(!expanded);
    
    Animated.spring(animation, {
      toValue,
      friction: 7,
      tension: 70,
      useNativeDriver: true
    }).start();
  };

  const arrowRotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getGenderText = (gender) => {
    return gender === true || gender === "1" ? "Erkek" : "Kız";
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      style={[styles.studentCard, { backgroundColor: theme.card }]}
      onPress={toggleExpand}
    >
      <View style={styles.studentHeader}>
        <View style={styles.avatarContainer}>
          {student.Fotograf && student.Fotograf !== "default.png" ? (
            <Image 
              source={{ uri: getUploadUrl(student.Fotograf) }}
              style={styles.studentPhoto}
              defaultSource={require('../../../assets/icon.png')}
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
              <Text style={styles.avatarText}>
                {getGenderText(student.Cinsiyet) === "Erkek" ? "👦" : "👧"}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.headerInfo}>
          <Text style={[styles.studentName, { color: theme.text }]}>{student.AdSoyad}</Text>
          <Text style={[styles.studentClass, { color: theme.text }]}>Sınıf: {student.Sinif} - Numara: {student.OgrenciNumara}</Text>
        </View>
        <Animated.View style={{ transform: [{ rotate: arrowRotation }] }}>
          <Text style={[styles.expandIcon, { color: theme.text }]}>▼</Text>
        </Animated.View>
      </View>
      
      {expanded && (
        <>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textLight }]}>🆔 TC Kimlik:</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{student.TCKimlikNo}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textLight }]}>👤 Cinsiyet:</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{getGenderText(student.Cinsiyet)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textLight }]}>🎂 Doğum Tarihi:</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{formatDate(student.DogumTarihi)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textLight }]}>👩 Anne:</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{student.AnneAdSoyad}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textLight }]}>👨 Baba:</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{student.BabaAdSoyad}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textLight }]}>📞 Anne Tel:</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{student.AnneTel}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textLight }]}>📞 Baba Tel:</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{student.BabaTel}</Text>
            </View>
          </View>
        </>
      )}
    </TouchableOpacity>
  );
};

const StudentsList = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAllStudents();
      
      if (data && Array.isArray(data)) {
        console.log(`📊 Received ${data.length} students`);
        setStudents(data);
      } else {
        console.log('⚠️ API returned invalid data or null, using mock data');
        // Use mock data when API fails
        setStudents(getMockStudents());
      }
    } catch (error) {
      console.error('❌ Error loading students:', error);
      // Use mock data when API fails
      setStudents(getMockStudents());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const getMockStudents = () => {
    return [
      {
        "Sinif": "5-A",
        "OgrenciNumara": "1",
        "AdSoyad": "Ahmet Yılmaz",
        "TCKimlikNo": "56781234567",
        "Cinsiyet": true,
        "DogumTarihi": "2013-04-12T00:00:00.000Z",
        "AnneAdSoyad": "Fatma Yılmaz",
        "BabaAdSoyad": "Mehmet Yılmaz",
        "VeliDurum": true,
        "Sag": "Var",
        "Engel": false,
        "AnneEgitim": "Lise",
        "BabaEgitim": "Üniversite",
        "AnneMeslek": "Ev Hanımı",
        "BabaMeslek": "Memur",
        "SuregenRahatsizlik": "Yok",
        "AylikGelir": "15000",
        "AnneTel": "05001112233",
        "BabaTel": "05002223344",
        "Fotograf": "default.png",
        "OgrenciId": 34
      },
      {
        "Sinif": "5-A",
        "OgrenciNumara": "2",
        "AdSoyad": "Ayşe Demir",
        "TCKimlikNo": "65872345678",
        "Cinsiyet": false,
        "DogumTarihi": "2013-06-18T00:00:00.000Z",
        "AnneAdSoyad": "Zeynep Demir",
        "BabaAdSoyad": "Ali Demir",
        "VeliDurum": true,
        "Sag": "Var",
        "Engel": false,
        "AnneEgitim": "Üniversite",
        "BabaEgitim": "Üniversite",
        "AnneMeslek": "Öğretmen",
        "BabaMeslek": "Mühendis",
        "SuregenRahatsizlik": "Yok",
        "AylikGelir": "20000",
        "AnneTel": "05003334455",
        "BabaTel": "05004445566",
        "Fotograf": "default.png",
        "OgrenciId": 35
      }
    ];
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchStudents();
    const interval = setInterval(() => {
      console.log("🔄 Attempting to refresh students data...");
      fetchStudents();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchStudents]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Öğrenciler yükleniyor...</Text>
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
        
        <Text style={[styles.headerTitle, { color: theme.text }]}>Tüm Öğrenciler</Text>
        
        <ThemeToggle />
      </View>

      <FlatList
        data={students}
        renderItem={({ item }) => <StudentItem student={item} theme={theme} />}
        keyExtractor={(item) => item.OgrenciId.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.text }]}>Öğrenci bulunamadı.</Text>
          </View>
        }
      />

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
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  studentCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  studentPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
  },
  headerInfo: {
    flex: 1,
  },
  expandIcon: {
    fontSize: 14,
    marginLeft: 8,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  studentClass: {
    fontSize: 13,
  },
  studentNumber: {
    fontSize: 12,
    opacity: 0.7,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  infoContainer: {
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    opacity: 0.8,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  }
});

export default StudentsList; 