import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { fetchAllStudents, getUploadUrl } from "../../lib/api";
import { useTheme } from "../../state/theme";
import { SessionContext } from "../../state/session";
import { useSlideMenu } from "../../navigation/SlideMenuContext";
import ThemeToggle from "../../ui/theme/ThemeToggle";

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
      useNativeDriver: true,
    }).start();
  };

  const arrowRotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("tr-TR");
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
          {student.Fotograf && student.Fotograf !== "-" ? (
            <Image
              source={{ uri: getUploadUrl(student.Fotograf) }}
              style={styles.studentPhoto}
              defaultSource={require("../../../assets/icon.png")}
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
          <Text style={[styles.studentName, { color: theme.text }]}>
            {student.AdSoyad}
          </Text>
          <Text style={[styles.studentClass, { color: theme.text }]}>
            Sınıf: {student.Sinif} - Numara: {student.OgrenciNumara}
          </Text>
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
              <Text style={[styles.infoLabel, { color: theme.textSecondary || theme.text }]}>
                🆔 TC Kimlik:
              </Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {student.TCKimlikNo}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary || theme.text }]}>
                👤 Cinsiyet:
              </Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {getGenderText(student.Cinsiyet)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary || theme.text }]}>
                🎂 Doğum Tarihi:
              </Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {formatDate(student.DogumTarihi)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary || theme.text }]}>
                👩 Anne:
              </Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {student.AnneAdSoyad}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary || theme.text }]}>
                👨 Baba:
              </Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {student.BabaAdSoyad}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary || theme.text }]}>
                📞 Anne Tel:
              </Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {student.AnneTel}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary || theme.text }]}>
                📞 Baba Tel:
              </Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {student.BabaTel}
              </Text>
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
  const { openMenu } = useSlideMenu();
  const [searchText, setSearchText] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAllStudents();

      if (data && Array.isArray(data)) {
        console.log(`📊 Received ${data.length} students`);
        setStudents(data);
        setFilteredStudents(data); // Başlangıçta tüm öğrencileri göster
      } else {
        console.log("⚠️ API returned invalid data or null, using mock data");
        // Use mock data when API fails
        const mockData = getMockStudents();
        setStudents(mockData);
        setFilteredStudents(mockData); // Başlangıçta tüm öğrencileri göster
      }
    } catch (error) {
      console.error("❌ Error loading students:", error);
      // Use mock data when API fails
      const mockData = getMockStudents();
      setStudents(mockData);
      setFilteredStudents(mockData); // Başlangıçta tüm öğrencileri göster
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []); // searchText'i bağımlılık olarak kaldırdık

  const getMockStudents = () => {
    return [
      {
        Sinif: "5-A",
        OgrenciNumara: "1",
        AdSoyad: "Ahmet Yılmaz",
        TCKimlikNo: "56781234567",
        Cinsiyet: true,
        DogumTarihi: "2013-04-12T00:00:00.000Z",
        AnneAdSoyad: "Fatma Yılmaz",
        BabaAdSoyad: "Mehmet Yılmaz",
        VeliDurum: true,
        Sag: "Var",
        Engel: false,
        AnneEgitim: "Lise",
        BabaEgitim: "Üniversite",
        AnneMeslek: "Ev Hanımı",
        BabaMeslek: "Memur",
        SuregenRahatsizlik: "Yok",
        AylikGelir: "15000",
        AnneTel: "05001112233",
        BabaTel: "05002223344",
        Fotograf: "default.png",
        OgrenciId: 34,
      },
      {
        Sinif: "5-A",
        OgrenciNumara: "2",
        AdSoyad: "Ayşe Demir",
        TCKimlikNo: "65872345678",
        Cinsiyet: false,
        DogumTarihi: "2013-06-18T00:00:00.000Z",
        AnneAdSoyad: "Zeynep Demir",
        BabaAdSoyad: "Ali Demir",
        VeliDurum: true,
        Sag: "Var",
        Engel: false,
        AnneEgitim: "Üniversite",
        BabaEgitim: "Üniversite",
        AnneMeslek: "Öğretmen",
        BabaMeslek: "Mühendis",
        SuregenRahatsizlik: "Yok",
        AylikGelir: "20000",
        AnneTel: "05003334455",
        BabaTel: "05004445566",
        Fotograf: "default.png",
        OgrenciId: 35,
      },
    ];
  };

  // İlk açılışta öğrenci verilerini al
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Öğrenci verisi alındığında filtrelenmiş listeyi de güncelle
  useEffect(() => {
    filterStudents();
  }, [searchText, students]); // students'ı da ekledik çünkü öğrenciler değiştiğinde de filtreleme yapmalıyız

  // Arama metni değiştiğinde öğrencileri filtrele (API çağrısı yapmadan)
  const filterStudents = () => {
    if (!students.length) return; // Öğrenci yoksa işlem yapma
    
    if (searchText.trim() === '') {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter(student => 
      student.AdSoyad && 
      student.AdSoyad.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredStudents(filtered);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => openMenu("StudentsList")}
        >
          <Text style={[styles.menuIcon, { color: theme.text }]}>☰</Text>
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Tüm Öğrenciler
        </Text>

        <ThemeToggle />
      </View>

      <View style={styles.searchContainer}>
        <View style={[
          styles.searchInputWrapper, 
          { 
            backgroundColor: theme.card,
            borderColor: theme.border 
          }
        ]}>
          <Text style={[styles.searchIcon, { color: theme.textSecondary || theme.muted }]}>🔍</Text>
          <TextInput
            style={[
              styles.searchInput,
              { 
                color: theme.text,
              }
            ]}
            placeholder="Aramak istediğiniz öğrencinin adını girin"
            placeholderTextColor={theme.textSecondary || theme.muted || theme.text}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setSearchText('')}
            >
              <Text style={{ color: theme.textSecondary || theme.muted }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Öğrenciler yükleniyor...
          </Text>
        </View>
      ) : (
      <FlatList
          data={filteredStudents}
        renderItem={({ item }) => <StudentItem student={item} theme={theme} />}
        keyExtractor={(item) => item.OgrenciId.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.text }]}>
                {searchText.trim() !== '' ? 'Arama kriterine uygun öğrenci bulunamadı.' : 'Öğrenci bulunamadı.'}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
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
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
  },
  studentCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studentHeader: {
    flexDirection: "row",
    alignItems: "center",
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
    justifyContent: "center",
    alignItems: "center",
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
    fontWeight: "bold",
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
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    opacity: 0.8,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 10,
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    paddingRight: 10,
  },
  clearButton: {
    padding: 8,
  },
});

export default StudentsList;
