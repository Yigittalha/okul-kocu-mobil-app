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
import { fetchTeachers, getUploadUrl } from '../../lib/api';
import { useTheme } from '../../state/theme';
import { SessionContext } from '../../state/session';
import { SlideMenu } from '../../navigation/AppDrawer';
import ThemeToggle from '../../components/ThemeToggle';
import RefreshableScrollView from '../../components/RefreshableScrollView';

const TeacherItem = ({ teacher, theme }) => {
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
    return gender === true || gender === "1" ? "Erkek" : "Kadın";
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      style={[styles.teacherCard, { backgroundColor: theme.card }]}
      onPress={toggleExpand}
    >
      <View style={styles.teacherHeader}>
        <View style={styles.avatarContainer}>
          {teacher.Fotograf && teacher.Fotograf !== "default.png" ? (
            <Image 
              source={{ uri: getUploadUrl(teacher.Fotograf) }}
              style={styles.teacherPhoto}
              defaultSource={require('../../../assets/icon.png')}
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
              <Text style={styles.avatarText}>
                {getGenderText(teacher.Cinsiyet) === "Erkek" ? "👨‍🏫" : "👩‍🏫"}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.headerInfo}>
          <Text style={[styles.teacherName, { color: theme.text }]}>{teacher.AdSoyad}</Text>
          <Text style={[styles.teacherDept, { color: theme.text }]}>{teacher.Bolum} Öğretmeni</Text>
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
              <Text style={[styles.infoLabel, { color: theme.textLight }]}>📧 E-posta:</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{teacher.Eposta}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textLight }]}>📱 Telefon:</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{teacher.Telefon}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textLight }]}>🆔 TC Kimlik:</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{teacher.TCKimlikNo}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textLight }]}>👤 Cinsiyet:</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{getGenderText(teacher.Cinsiyet)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textLight }]}>🎂 Doğum Tarihi:</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{formatDate(teacher.DogumTarihi)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textLight }]}>🆔 Öğretmen ID:</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{teacher.OgretmenID}</Text>
            </View>
          </View>
        </>
      )}
    </TouchableOpacity>
  );
};

const TeachersList = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const ITEMS_PER_PAGE = 20;

  const loadTeachers = useCallback(async (pageNumber = 1, shouldRefresh = false) => {
    try {
      if (pageNumber === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const data = await fetchTeachers(pageNumber, ITEMS_PER_PAGE);
      
      if (data && Array.isArray(data)) {
        console.log(`📊 Received ${data.length} teachers`);
        if (shouldRefresh || pageNumber === 1) {
          setTeachers(data);
        } else {
          setTeachers(prev => [...prev, ...data]);
        }
        
        // If we received fewer items than requested, we've reached the end
        setHasMore(data.length === ITEMS_PER_PAGE);
      } else {
        console.log('⚠️ API returned invalid data or null, using mock data');
        useMockData(pageNumber, shouldRefresh);
        setHasMore(true);
      }
    } catch (error) {
      console.error('❌ Error loading teachers:', error);
      useMockData(pageNumber, shouldRefresh);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  const useMockData = (pageNumber, shouldRefresh) => {
    // Mock data for testing when API fails
    const mockData = [
      {
        "OgretmenID": 39,
        "AdSoyad": "Ahmet Yılmaz",
        "Cinsiyet": true,
        "DogumTarihi": "1980-05-14T00:00:00.000Z",
        "TCKimlikNo": "10000000001",
        "Telefon": "05001112233",
        "Eposta": "ahmet.yilmaz@example.com",
        "Bolum": "Matematik",
        "Fotograf": "default.png"
      },
      {
        "OgretmenID": 40,
        "AdSoyad": "Mehmet Demir",
        "Cinsiyet": true,
        "DogumTarihi": "1975-09-21T00:00:00.000Z",
        "TCKimlikNo": "10000000002",
        "Telefon": "05002223344",
        "Eposta": "mehmet.demir@example.com",
        "Bolum": "Fizik",
        "Fotograf": null
      },
      {
        "OgretmenID": 41,
        "AdSoyad": "Ayşe Kaya",
        "Cinsiyet": false,
        "DogumTarihi": "1988-03-10T00:00:00.000Z",
        "TCKimlikNo": "10000000003",
        "Telefon": "05003334455",
        "Eposta": "ayse.kaya@example.com",
        "Bolum": "Kimya",
        "Fotograf": null
      }
    ];
    
    if (shouldRefresh || pageNumber === 1) {
      setTeachers(mockData);
    } else {
      // Add mock data with different IDs for pagination testing
      setTeachers(prev => [
        ...prev, 
        ...mockData.map((item, index) => ({
          ...item,
          OgretmenID: 100 + prev.length + index,
          AdSoyad: `${item.AdSoyad} ${prev.length + index}`
        }))
      ]);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    loadTeachers();
    const interval = setInterval(() => {
      console.log("🔄 Attempting to refresh teachers data...");
      loadTeachers();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [loadTeachers]);

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadTeachers(1, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadTeachers(nextPage);
    }
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.accent} />
        <Text style={[styles.footerText, { color: theme.textLight }]}>Daha fazla yükleniyor...</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Öğretmenler yükleniyor...</Text>
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
        
        <Text style={[styles.headerTitle, { color: theme.text }]}>Öğretmenler</Text>
        
        <ThemeToggle />
      </View>

      <FlatList
        data={teachers}
        renderItem={({ item }) => <TeacherItem teacher={item} theme={theme} />}
        keyExtractor={(item) => item.OgretmenID.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.text }]}>Öğretmen bulunamadı.</Text>
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
  teacherCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teacherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  teacherPhoto: {
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
  teacherName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  teacherDept: {
    fontSize: 13,
  },
  teacherId: {
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
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  footerText: {
    fontSize: 14,
    marginLeft: 8,
  }
});

export default TeachersList; 