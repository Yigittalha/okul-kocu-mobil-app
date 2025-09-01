import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../lib/api';
import { SessionContext } from '../../state/session';
import { useTheme } from '../../state/theme';
import { useSlideMenu } from '../../navigation/SlideMenuContext';
import ThemeToggle from '../../ui/theme/ThemeToggle';

const AttendanceResults = ({ route }) => {
  const navigation = useNavigation();
  const { clearSession } = useContext(SessionContext);
  const { theme } = useTheme();
  const { openMenu } = useSlideMenu();
  
  // Route parametrelerini al
  const { students, lessonInfo } = route?.params || {};
  const [attendanceData, setAttendanceData] = useState(students || []);
  const [loading, setLoading] = useState(false);
  const [savingStudents, setSavingStudents] = useState(new Set());

  // Öğrenci durumunu değiştirme ve kaydetme fonksiyonu
  const toggleAttendanceStatus = async (studentId, newStatus) => {
    // Loading state'i başlat
    setSavingStudents(prev => new Set(prev).add(studentId));
    
    // Önce local state'i güncelle
    setAttendanceData(prevData => 
      prevData.map(student => 
        student.OgrenciId === studentId 
          ? { ...student, durum: newStatus }
          : student
      )
    );

    // Tekil öğrenci yoklamasını API'ye kaydet
    try {
      const payload = {
        tarih: lessonInfo.tarih,
        OgrenciID: studentId,
        ProgramID: attendanceData.find(s => s.OgrenciId === studentId)?.ProgramID,
        durum: newStatus
      };

      // TODO: remove before prod
      // console.log('📤 Tekil öğrenci yoklaması kaydediliyor:', payload);

      const response = await api.post('/teacher/attendanceadd', payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        // TODO: remove before prod
        // console.log('✅ Tekil öğrenci yoklaması kaydedildi:', payload);
      }
    } catch (error) {
      console.log('❌ Tekil öğrenci yoklaması kaydetme hatası:', error);
      
      if (error.response?.status === 401) {
        console.log('🔐 Yetkilendirme hatası - oturum temizleniyor');
        clearSession();
        navigation.navigate('Login');
      }
    } finally {
      // Loading state'i temizle
      setSavingStudents(prev => {
        const newSet = new Set(prev);
        newSet.delete(studentId);
        return newSet;
      });
    }
  };



  // Öğrenci satırını render eden fonksiyon
  const renderStudentItem = ({ item: student }) => {
    const getStatusText = (status) => {
      switch (status) {
        case 1: return '✅ Var';
        case 0: return '❌ Yok';
        case 2: return '🔄 Geç';
        default: return '⏳ Belirtilmemiş';
      }
    };

    const getStatusColor = (status) => {
      switch (status) {
        case 1: return theme.success;
        case 0: return theme.danger;
        case 2: return theme.warning;
        default: return theme.muted;
      }
    };

    return (
      <View style={[styles.studentItem, { 
        backgroundColor: theme.card,
        borderColor: theme.border 
      }]}>
        <View style={styles.studentInfo}>
          <View style={styles.studentHeader}>
            <Text style={[styles.studentNumber, { color: theme.accent }]}>
              #{student.OgrenciNumara}
            </Text>
          </View>
          <Text style={[styles.studentName, { color: theme.text }]}>
            {student.AdSoyad}
          </Text>
        </View>
        
        <View style={styles.attendanceButtons}>
          {savingStudents.has(student.OgrenciId) ? (
            <ActivityIndicator size="small" color={theme.accent} />
          ) : (
            <>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  { 
                    backgroundColor: student.durum === 1 ? theme.success : theme.card,
                    borderColor: theme.border,
                    opacity: savingStudents.has(student.OgrenciId) ? 0.5 : 1
                  }
                ]}
                onPress={() => toggleAttendanceStatus(student.OgrenciId, 1)}
                disabled={savingStudents.has(student.OgrenciId)}
              >
                <Text style={[styles.statusButtonText, { 
                  color: student.durum === 1 ? '#fff' : theme.text 
                }]}>
                  ✅
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  { 
                    backgroundColor: student.durum === 0 ? theme.danger : theme.card,
                    borderColor: theme.border,
                    opacity: savingStudents.has(student.OgrenciId) ? 0.5 : 1
                  }
                ]}
                onPress={() => toggleAttendanceStatus(student.OgrenciId, 0)}
                disabled={savingStudents.has(student.OgrenciId)}
              >
                <Text style={[styles.statusButtonText, { 
                  color: student.durum === 0 ? '#fff' : theme.text 
                }]}>
                  ❌
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  { 
                    backgroundColor: student.durum === 2 ? theme.warning : theme.card,
                    borderColor: theme.border,
                    opacity: savingStudents.has(student.OgrenciId) ? 0.5 : 1
                  }
                ]}
                onPress={() => toggleAttendanceStatus(student.OgrenciId, 2)}
                disabled={savingStudents.has(student.OgrenciId)}
              >
                <Text style={[styles.statusButtonText, { 
                  color: student.durum === 2 ? '#fff' : theme.text 
                }]}>
                  🔄
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        
        <Text style={[styles.statusText, { color: getStatusColor(student.durum) }]}>
          {getStatusText(student.durum)}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Yoklama verileri yükleniyor...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.goBack()}>
          <Text style={[styles.menuIcon, { color: theme.text }]}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Yoklama
          </Text>
          {lessonInfo && (
            <Text style={[styles.lessonInfo, { color: theme.accent }]}>
              {lessonInfo.ders} - {lessonInfo.sinif}
            </Text>
          )}
        </View>
        
        <ThemeToggle />
      </View>

      {/* Lesson Info Card */}
      {lessonInfo && (
        <View style={[styles.lessonInfoCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.lessonInfoTitle, { color: theme.text }]}>
            Ders Bilgileri
          </Text>
          <View style={styles.lessonInfoRow}>
            <Text style={[styles.lessonInfoLabel, { color: theme.text }]}>Sınıf:</Text>
            <Text style={[styles.lessonInfoValue, { color: theme.accent }]}>{lessonInfo.sinif}</Text>
          </View>
          <View style={styles.lessonInfoRow}>
            <Text style={[styles.lessonInfoLabel, { color: theme.text }]}>Tarih:</Text>
            <Text style={[styles.lessonInfoValue, { color: theme.accent }]}>{lessonInfo.tarih}</Text>
          </View>
          <View style={styles.lessonInfoRow}>
            <Text style={[styles.lessonInfoLabel, { color: theme.text }]}>Saat:</Text>
            <Text style={[styles.lessonInfoValue, { color: theme.accent }]}>{lessonInfo.dersSaati}</Text>
          </View>
          <View style={styles.lessonInfoRow}>
            <Text style={[styles.lessonInfoLabel, { color: theme.text }]}>Ders:</Text>
            <Text style={[styles.lessonInfoValue, { color: theme.accent }]}>{lessonInfo.ders}</Text>
          </View>
        </View>
      )}

      {/* Students List */}
      <FlatList
        data={attendanceData}
        renderItem={renderStudentItem}
        keyExtractor={(item) => item.OgrenciId.toString()}
        contentContainerStyle={styles.studentsList}
        showsVerticalScrollIndicator={false}
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
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  lessonInfo: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  lessonInfoCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  lessonInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  lessonInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  lessonInfoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  lessonInfoValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  studentsList: {
    padding: 16,
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  studentInfo: {
    flex: 1,
  },
  studentHeader: {
    marginBottom: 6,
  },
  studentNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD60A',
  },
  studentName: {
    fontSize: 16,
    fontWeight: '500',
  },
  attendanceButtons: {
    flexDirection: 'row',
    marginRight: 12,
  },
  statusButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
  },
  statusButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    width: 80,
    textAlign: 'center',
  },
});

export default AttendanceResults; 