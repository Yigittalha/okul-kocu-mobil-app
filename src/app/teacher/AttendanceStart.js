import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Platform,
  Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../lib/api';
import { useTheme } from '../../state/theme';
import { useSlideMenu } from '../../navigation/SlideMenuContext';
import ThemeToggle from '../../ui/theme/ThemeToggle';
import { getToken } from '../../lib/storage';
import { SessionContext } from '../../state/session';
import TeacherSchedule from './TeacherSchedule';

/**
 * Yoklama başlatma ekranı
 * Sınıf ve tarih seçme işlemleri yapılır
 */
const AttendanceStart = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { openMenu } = useSlideMenu();
  const { clearSession } = useContext(SessionContext);
  
  // Temel state değişkenleri
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassCode, setSelectedClassCode] = useState('');
  const [selectedClassName, setSelectedClassName] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [error, setError] = useState('');
  const [classSelectionModalVisible, setClassSelectionModalVisible] = useState(false);
  const [showLessonList, setShowLessonList] = useState(false);
  const [lessonData, setLessonData] = useState(null);
  
  // Sınıfları API'den çekme
  useEffect(() => {
    fetchClasses();
  }, []);
  
  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Token'ı al
      const token = await getToken();
      if (!token) {
        throw new Error('Token bulunamadı');
      }
      
      // TODO: remove before prod
      // console.log('🔍 Sınıf listesi çekiliyor... Token:', token.substring(0, 20) + '...');
      
      // API'den sınıfları çek - token ile birlikte
      console.log('🌐 API çağrısı yapılıyor: /student/classall');
      const response = await api.post('/student/classall', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      console.log('📡 API yanıtı alındı:', response.status, response.statusText);
      
      // TODO: remove before prod
      // console.log('📊 Sınıf verileri alındı:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setClasses(response.data);
        
        // İlk sınıfı varsayılan olarak seç (eğer mevcutsa)
        if (response.data.length > 0) {
          const firstClass = response.data[0];
          setSelectedClassCode(firstClass.SinifKodu);
          setSelectedClassName(firstClass.SinifAdi);
          console.log('✅ İlk sınıf seçildi:', firstClass.SinifAdi);
        } else {
          console.log('⚠️ Sınıf listesi boş');
        }
      } else {
        console.log('⚠️ API geçerli sınıf verisi döndürmedi');
        setClasses([]);
        setError('Sınıf verisi alınamadı');
      }
    } catch (error) {
      console.error('❌ Sınıf verileri alınırken hata oluştu:', error);
      if (error.response) {
        console.error('Yanıt durumu:', error.response.status);
        console.error('Yanıt verisi:', error.response.data);
        setError(`API Hatası: ${error.response.status}`);
      } else {
        setError('Bağlantı hatası oluştu');
      }
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Tarih formatını YYYY-MM-DD şeklinde döndürür
  const formatDateYYYYMMDD = (date) => {
    const year = date.getFullYear();
    // Ay 0-indexed olduğu için +1 ekliyoruz ve gerekirse başına 0 koyuyoruz
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };
  
  // Tarih seçici modal için basit yapı
  const DatePickerModal = ({ visible, date, onDateChange, onClose }) => {
    const [tempDate, setTempDate] = useState(date);
    
    useEffect(() => {
      setTempDate(date);
    }, [date]);
    
    const handleConfirm = () => {
      onDateChange(tempDate);
      onClose();
    };
    
    // Tarih seçimi için yardımcı fonksiyonlar
    const addDays = (days) => {
      const newDate = new Date(tempDate);
      newDate.setDate(tempDate.getDate() + days);
      setTempDate(newDate);
    };
    
    return (
      <Modal
        transparent={true}
        visible={visible}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { 
          backgroundColor: theme.background === '#f5f5f5' ? '#fff' : theme.card 
        }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Tarih Seçin
            </Text>
            
            <View style={styles.datePickerContainer}>
              <TouchableOpacity 
                style={[styles.dateNavButton, { backgroundColor: theme.accent }]}
                onPress={() => addDays(-1)}
              >
                <Text style={{ color: theme.background === '#f5f5f5' ? '#fff' : theme.primary }}>◀</Text>
              </TouchableOpacity>
              
              <View style={styles.selectedDateContainer}>
                <Text style={[styles.selectedDateText, { color: theme.text }]}>
                  {formatDateYYYYMMDD(tempDate)}
                </Text>
              </View>
              
              <TouchableOpacity 
                style={[styles.dateNavButton, { backgroundColor: theme.accent }]}
                onPress={() => addDays(1)}
              >
                <Text style={{ color: theme.background === '#f5f5f5' ? '#fff' : theme.primary }}>▶</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButton, { 
                  borderColor: theme.border,
                  backgroundColor: theme.background === '#f5f5f5' ? '#f8f9fa' : 'transparent'
                }]}
                onPress={onClose}
              >
                <Text style={[styles.modalButtonText, { color: theme.text }]}>İptal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.accent }]}
                onPress={handleConfirm}
              >
                <Text style={[styles.modalButtonText, { 
                  color: theme.background === '#f5f5f5' ? '#fff' : theme.primary 
                }]}>Tamam</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Sınıf seçimi modal'ı
  const ClassSelectionModal = ({ visible, classes, selectedClassCode, onClassSelect, onClose }) => {
    return (
      <Modal
        transparent={true}
        visible={visible}
        animationType="slide"
        onRequestClose={onClose}
      >
                 <View style={styles.modalOverlay}>
           <View style={[styles.classSelectionModal, { 
             backgroundColor: theme.background === '#f5f5f5' ? '#fff' : theme.card 
           }]}>
             <View style={[styles.modalHeader, { 
               backgroundColor: theme.background === '#f5f5f5' ? '#f8f9fa' : theme.surface 
             }]}>
               <Text style={[styles.modalTitle, { color: theme.text }]}>
                 Sınıf Seçin
               </Text>
               <TouchableOpacity onPress={onClose}>
                 <Text style={[styles.closeButton, { color: theme.text }]}>✕</Text>
               </TouchableOpacity>
             </View>
            
            <View style={styles.classListContainer}>
              {classes.length === 0 ? (
                                 <View style={[styles.noClassesContainer, { 
                   backgroundColor: theme.background === '#f5f5f5' ? '#fff' : theme.card 
                 }]}>
                   <Text style={[styles.noClassesText, { color: theme.text }]}>
                     Sınıf bulunamadı
                   </Text>
                  <TouchableOpacity 
                    style={[styles.retryButton, { backgroundColor: theme.accent }]}
                    onPress={() => {
                      fetchClasses();
                      onClose();
                    }}
                  >
                    <Text style={[styles.retryButtonText, { color: theme.primary }]}>
                      Tekrar Dene
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                classes.map((classItem) => (
                                     <TouchableOpacity
                     key={classItem.SinifKodu}
                     style={[
                       styles.classItem,
                       { 
                         backgroundColor: selectedClassCode === classItem.SinifKodu 
                           ? theme.accent 
                           : (theme.background === '#f5f5f5' ? '#fff' : theme.card),
                         borderColor: theme.background === '#f5f5f5' ? 'rgba(0,0,0,0.08)' : theme.border
                       }
                     ]}
                    onPress={() => {
                      onClassSelect(classItem.SinifKodu);
                      onClose();
                    }}
                  >
                                         <Text style={[
                       styles.classItemText, 
                       { 
                         color: selectedClassCode === classItem.SinifKodu 
                           ? (theme.background === '#f5f5f5' ? '#fff' : theme.primary) 
                           : theme.text 
                       }
                     ]}>
                      {classItem.SinifAdi}
                    </Text>
                                         {selectedClassCode === classItem.SinifKodu && (
                       <Text style={[styles.selectedIcon, { 
                         color: theme.background === '#f5f5f5' ? '#fff' : theme.primary 
                       }]}>✓</Text>
                     )}
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  
  // Seçilen sınıfı güncelle ve adını kaydet
  const handleClassChange = (classCode) => {
    console.log('🔄 Sınıf değiştiriliyor:', classCode);
    
    setSelectedClassCode(classCode);
    
    // Sınıf adını bulmak için sınıf listesini kontrol et
    const selectedClass = classes.find(c => c.SinifKodu === classCode);
    if (selectedClass) {
      setSelectedClassName(selectedClass.SinifAdi);
      console.log('✅ Sınıf seçildi:', selectedClass.SinifAdi);
    } else {
      console.log('⚠️ Seçilen sınıf bulunamadı:', classCode);
      setSelectedClassName('');
    }
  };
  
  // Onaylama işlemi
  const handleConfirm = async () => {
    // Seçimleri konsola yazdır
    const selections = {
      sinifKodu: selectedClassCode,
      sinifAdi: selectedClassName,
      dateISO: formatDateYYYYMMDD(selectedDate)
    };
    
    console.log('🔔 Yoklama başlatma seçimleri:', selections);
    console.log('📤 API isteği gönderiliyor:', {
      Sinif: selectedClassName,
      tarih: formatDateYYYYMMDD(selectedDate)
    });
    
    try {
      // API'ye POST isteği gönder
      const response = await api.post('/teacher/dersler', {
        Sinif: selectedClassName,
        tarih: formatDateYYYYMMDD(selectedDate)
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Dersler API yanıtı:', response.data);
      
      // Dönen veriyi state'e kaydet ve ders listesini göster
      setLessonData({
        selections: selections,
        lessons: response.data
      });
      setShowLessonList(true);
      console.log('✅ Ders listesi gösteriliyor');
      
    } catch (error) {
      console.log('❌ API hatası:', error);
      
      if (error.response?.status === 401) {
        console.log('🔐 Yetkilendirme hatası - oturum temizleniyor');
        clearSession();
        navigation.navigate('Login');
      } else {
        console.log('🌐 Ağ hatası veya diğer hata:', error.message);
        // Hata durumunda da ders listesini göster (boş veri ile)
        setLessonData({
          selections: selections,
          lessons: []
        });
        setShowLessonList(true);
      }
    }
  };
  
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity style={styles.menuButton} onPress={openMenu}>
            <Text style={[styles.menuIcon, { color: theme.text }]}>☰</Text>
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Yoklama Başlat
          </Text>
          
          <ThemeToggle />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Sınıf listesi yükleniyor...
          </Text>
        </View>
      </View>
    );
  }
  
  // Eğer ders listesi gösteriliyorsa TeacherSchedule bileşenini render et
  if (showLessonList && lessonData) {
    return (
      <TeacherSchedule 
        route={{ 
          params: lessonData 
        }} 
        navigation={navigation}
      />
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
          Yoklama Başlat
        </Text>
        
        <ThemeToggle />
      </View>
      
      <View style={styles.content}>
        {/* Sınıf seçimi */}
        <View style={styles.formGroup}>
          <Text style={[styles.formLabel, { color: theme.text }]}>Sınıf Seç</Text>
          
          <TouchableOpacity
            style={[styles.classSelectionButton, { 
              backgroundColor: theme.background === '#f5f5f5' ? '#fff' : theme.card,
              borderColor: theme.border 
            }]}
            onPress={() => setClassSelectionModalVisible(true)}
          >
            <View style={styles.classSelectionContent}>
              <Text style={[styles.classSelectionText, { color: theme.text }]}>
                {selectedClassName || 'Sınıf seçmek için tıklayın'}
              </Text>
              <Text style={[styles.classSelectionArrow, { color: theme.text }]}>▼</Text>
            </View>
          </TouchableOpacity>
          
          {selectedClassName && (
            <Text style={[styles.selectedClassText, { color: theme.accent }]}>
              Seçilen: {selectedClassName}
            </Text>
          )}
        </View>
        
        {/* Tarih seçimi */}
        <View style={styles.formGroup}>
          <Text style={[styles.formLabel, { color: theme.text }]}>Tarih Seç</Text>
          <TouchableOpacity
            style={[styles.dateField, { 
              backgroundColor: theme.background === '#f5f5f5' ? '#fff' : theme.card,
              borderColor: theme.border 
            }]}
            onPress={() => setDatePickerVisible(true)}
          >
            <Text style={[styles.dateText, { color: theme.text }]}>
              {formatDateYYYYMMDD(selectedDate)}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Yenile butonu */}
        <TouchableOpacity 
          style={[styles.refreshButton, { 
            borderColor: theme.border,
            backgroundColor: theme.background === '#f5f5f5' ? '#fff' : 'transparent'
          }]}
          onPress={fetchClasses}
        >
          <Text style={[styles.refreshButtonText, { color: theme.text }]}>
            Sınıf Listesini Yenile
          </Text>
        </TouchableOpacity>
        
        {/* Onaylama butonu */}
        <TouchableOpacity 
          style={[styles.confirmButton, { 
            backgroundColor: theme.accent,
            opacity: !selectedClassCode ? 0.5 : 1
          }]}
          onPress={handleConfirm}
          disabled={!selectedClassCode}
        >
          <Text style={[styles.confirmButtonText, { 
            color: theme.background === '#f5f5f5' ? '#fff' : theme.primary 
          }]}>
            Onayla
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Tarih seçici modal */}
      <DatePickerModal
        visible={datePickerVisible}
        date={selectedDate}
        onDateChange={setSelectedDate}
        onClose={() => setDatePickerVisible(false)}
      />

      {/* Sınıf seçimi modal */}
      <ClassSelectionModal
        visible={classSelectionModalVisible}
        classes={classes}
        selectedClassCode={selectedClassCode}
        onClassSelect={handleClassChange}
        onClose={() => setClassSelectionModalVisible(false)}
      />
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
    padding: 20,
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
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  dateField: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 15,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
  },
  refreshButton: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  refreshButtonText: {
    fontSize: 16,
  },
  confirmButton: {
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateNavButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  selectedDateContainer: {
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalButtonText: {
    fontWeight: 'bold',
  },

  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    fontWeight: 'bold',
  },
  selectedClassText: {
    fontSize: 14,
    marginTop: 5,
    fontStyle: 'italic',
  },
  classSelectionButton: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  classSelectionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  classSelectionText: {
    fontSize: 16,
    flex: 1,
  },
  classSelectionArrow: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  classSelectionModal: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.15)',
    backgroundColor: '#f8f9fa',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 5,
  },
  classListContainer: {
    maxHeight: 500,
  },
  classItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
    backgroundColor: '#fff',
  },
  classItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  noClassesContainer: {
    padding: 30,
    alignItems: 'center',
  },
  noClassesText: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default AttendanceStart; 