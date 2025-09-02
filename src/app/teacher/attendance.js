import React, { useEffect, useState, useCallback, useContext } from 'react';
import { View, Text, ActivityIndicator, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SessionContext } from '../../state/session';
import { useTheme } from '../../state/theme';
import ThemeToggle from '../../ui/theme/ThemeToggle';
import api, { fetchUserInfo } from '../../lib/api';

const ATTENDANCE_URL = '/teacher/attendance';
const ATTENDANCE_ADD_URL = '/teacher/attendanceadd';



export default function AttendanceLesson() {
  const navigation = useNavigation();
  const route = useRoute();
  const { Sinif, Tarih, DersSaati, ProgramID, Gun, Ders } = route.params || {};
  const { schoolCode } = useContext(SessionContext);
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [sending, setSending] = useState({}); // { [OgrenciId]: boolean }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Öğretmen kontrolü
        const userInfo = await fetchUserInfo(false);
        if (!userInfo?.OgretmenID) {
          setError('Bu sayfa yalnız öğretmenler içindir.');
          setLoading(false);
          return;
        }

        // Listeleme: POST body { Sinif, Tarih, DersSaati, ProgramID }
        const res = await api.post(ATTENDANCE_URL, {
          Sinif: String(Sinif),
          Tarih: String(Tarih),            // "2025-09-02"
          DersSaati: String(DersSaati),
          ProgramID: Number(ProgramID)
        });
        
        const arr = Array.isArray(res?.data) ? res.data : [];
        setStudents(arr);
      } catch (e) {
        setError(e?.message || 'Öğrenci listesi alınamadı.');
      } finally {
        setLoading(false);
      }
    })();
  }, [Sinif, Tarih, DersSaati, ProgramID]);

  const sendStatus = useCallback(async (ogrenciId, durum) => {
    try {
      setSending(s => ({ ...s, [ogrenciId]: true }));
      
      // attendanceadd: { tarih, OgrenciID, ProgramID, durum }
      const body = {
        tarih: String(Tarih),          // aynı tarih
        OgrenciID: Number(ogrenciId),
        ProgramID: Number(ProgramID),
        durum: Number(durum)           // 1=Burada, 0=Yok, 2=Geç
      };
      
      await api.post(ATTENDANCE_ADD_URL, body);
      
      // UI'de local güncelle (durum alanı varsa güncelle)
      setStudents(prev => prev.map(it => it.OgrenciId === ogrenciId ? { ...it, durum } : it));
    } catch (e) {
      Alert.alert('Hata', e?.message || 'Yoklama kaydedilemedi');
    } finally {
      setSending(s => ({ ...s, [ogrenciId]: false }));
    }
  }, [ProgramID, Tarih]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={[styles.backIcon, { color: theme.text }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Yoklama</Text>
          <ThemeToggle />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Öğrenci listesi yükleniyor…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={[styles.backIcon, { color: theme.text }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Yoklama</Text>
          <ThemeToggle />
        </View>
        
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.danger }]}>{String(error)}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.retryButton, { backgroundColor: theme.accent }]}>
            <Text style={[styles.retryText, { color: theme.primary }]}>Geri dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const Item = ({ item }) => {
    const busy = !!sending[item.OgrenciId];
    const durumText = item.durum === 1 ? 'Burada'
                     : item.durum === 0 ? 'Yok'
                     : item.durum === 2 ? 'Geç'
                     : '—';
    
    return (
      <View style={[styles.studentItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.studentName, { color: theme.text }]}>
          {item.OgrenciNumara} • {item.AdSoyad}
        </Text>
        <Text style={[styles.lessonInfo, { color: theme.textSecondary || theme.text }]}>
          {Gun} • {Ders} • {DersSaati} • ProgramID: {ProgramID} • Sınıf: {Sinif}
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            disabled={busy}
            onPress={() => sendStatus(item.OgrenciId, 1)}
            style={[styles.statusButton, styles.hereButton, { opacity: busy ? 0.6 : 1 }]}
          >
            <Text style={styles.buttonText}>Burada</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            disabled={busy}
            onPress={() => sendStatus(item.OgrenciId, 0)}
            style={[styles.statusButton, styles.absentButton, { opacity: busy ? 0.6 : 1 }]}
          >
            <Text style={styles.buttonText}>Yok</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            disabled={busy}
            onPress={() => sendStatus(item.OgrenciId, 2)}
            style={[styles.statusButton, styles.lateButton, { opacity: busy ? 0.6 : 1 }]}
          >
            <Text style={[styles.buttonText, { color: '#000' }]}>Geç</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.statusText, { color: theme.textSecondary || theme.text }]}>
          Durum: {durumText}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backIcon, { color: theme.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Yoklama</Text>
        <ThemeToggle />
      </View>
      
      <FlatList
        data={students}
        keyExtractor={(it) => String(it.OgrenciId)}
        renderItem={({ item }) => <Item item={item} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.text }]}>Kayıt bulunamadı.</Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  backIcon: {
    fontSize: 20,
    fontWeight: 'bold',
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
    fontSize: 16,
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
    fontSize: 16,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryText: {
    fontWeight: '600',
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  studentItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  studentName: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  lessonInfo: {
    opacity: 0.7,
    marginBottom: 12,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  statusButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  hereButton: {
    backgroundColor: '#2ecc71',
  },
  absentButton: {
    backgroundColor: '#e74c3c',
  },
  lateButton: {
    backgroundColor: '#f1c40f',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  statusText: {
    marginTop: 6,
    opacity: 0.7,
    fontSize: 14,
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
  },
});
