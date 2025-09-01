import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import api from '../../lib/api';
import { SessionContext } from '../../state/session';
import { useTheme } from '../../state/theme';
import { useSlideMenu } from '../../navigation/SlideMenuContext';
import ThemeToggle from '../../ui/theme/ThemeToggle';

const HomeworkAssignment = () => {
  const navigation = useNavigation();
  const { clearSession } = useContext(SessionContext);
  const { theme } = useTheme();
  const { openMenu } = useSlideMenu();
  
  // Form state
  const [formData, setFormData] = useState({
    DersAdi: '',
    Konu: '',
    Aciklama: '',
    TeslimTarihi: '',
    puan: '',
    durum: '',
    OgrenciNumara: '',
    KayitTuru: 1,
    Sinif: '',
    OgretmenID: null
  });
  
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [teacherId, setTeacherId] = useState(null);

  // Get teacher ID on component mount
  useEffect(() => {
    fetchTeacherId();
  }, []);

  const fetchTeacherId = async () => {
    try {
      const response = await api.post('/user/info', {}, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response?.data?.OgretmenID) {
        setTeacherId(response.data.OgretmenID);
        setFormData(prev => ({ ...prev, OgretmenID: response.data.OgretmenID }));
      }
    } catch (error) {
      console.log('❌ Teacher ID fetch error:', error);
    }
  };

  // Photo picker function
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0]);
        console.log('📸 Photo selected:', result.assets[0].uri);
      }
    } catch (error) {
      console.log('❌ Image picker error:', error);
      Alert.alert('Hata', 'Fotoğraf seçilirken bir hata oluştu.');
    }
  };

  // Remove photo
  const removePhoto = () => {
    setPhoto(null);
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // KayitTuru güncelleme mantığı
      if (field === 'OgrenciNumara') {
        // Öğrenci numarası girilirse KayitTuru = 1
        if (value.trim()) {
          newData.KayitTuru = 1;
        } else {
          // Öğrenci numarası boşsa ve sınıf girilmişse KayitTuru = 0
          newData.KayitTuru = prev.Sinif.trim() ? 0 : 1;
        }
      } else if (field === 'Sinif') {
        // Sınıf girilirse ve öğrenci numarası boşsa KayitTuru = 0
        if (value.trim() && !prev.OgrenciNumara.trim()) {
          newData.KayitTuru = 0;
        } else if (!value.trim() && prev.OgrenciNumara.trim()) {
          // Sınıf boşsa ve öğrenci numarası varsa KayitTuru = 1
          newData.KayitTuru = 1;
        }
      }
      
      return newData;
    });
  };

  // Submit homework assignment
  const submitHomework = async () => {
    // Validation
    if (!formData.DersAdi.trim()) {
      Alert.alert('Hata', 'Ders adı gereklidir.');
      return;
    }
    if (!formData.Konu.trim()) {
      Alert.alert('Hata', 'Konu gereklidir.');
      return;
    }
    if (!formData.Aciklama.trim()) {
      Alert.alert('Hata', 'Açıklama gereklidir.');
      return;
    }
    if (!formData.TeslimTarihi.trim()) {
      Alert.alert('Hata', 'Teslim tarihi gereklidir.');
      return;
    }
    // Öğrenci numarası artık zorunlu değil (sınıfa ödev verirken boş bırakılabilir)
    // if (!formData.OgrenciNumara.trim()) {
    //   Alert.alert('Hata', 'Öğrenci numarası gereklidir.');
    //   return;
    // }

    try {
      setLoading(true);

      // Create form data for multipart upload
      const formDataToSend = new FormData();
      
      // Add text fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key].toString());
        }
      });

      // Add photo if selected
      if (photo) {
        const photoFile = {
          uri: photo.uri,
          type: 'image/jpeg',
          name: 'homework_photo.jpg'
        };
        formDataToSend.append('photo', photoFile);
      }

      console.log('📤 Homework assignment being sent:', formData);

      const response = await api.post('/teacher/homework', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.status === 200) {
        console.log('✅ Homework assigned successfully');
        Alert.alert(
          'Başarılı', 
          'Ödev başarıyla atandı!',
          [{ text: 'Tamam', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.log('❌ Homework assignment error:', error);
      
      if (error.response?.status === 401) {
        console.log('🔐 Authorization error - clearing session');
        clearSession();
        navigation.navigate('Login');
      } else {
        Alert.alert('Hata', 'Ödev atanırken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.menuButton} onPress={openMenu}>
          <Text style={[styles.menuIcon, { color: theme.text }]}>☰</Text>
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Ödev Atama
        </Text>
        
        <ThemeToggle />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Form Fields */}
        <View style={[styles.formCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Ödev Bilgileri
          </Text>

          {/* Ders Adı */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Ders Adı *</Text>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: theme.background === '#f5f5f5' ? '#fff' : theme.surface,
                borderColor: theme.border,
                color: theme.text 
              }]}
              value={formData.DersAdi}
              onChangeText={(text) => handleInputChange('DersAdi', text)}
              placeholder="Örn: Matematik"
              placeholderTextColor={theme.muted}
            />
          </View>

          {/* Konu */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Konu *</Text>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: theme.background === '#f5f5f5' ? '#fff' : theme.surface,
                borderColor: theme.border,
                color: theme.text 
              }]}
              value={formData.Konu}
              onChangeText={(text) => handleInputChange('Konu', text)}
              placeholder="Örn: Kümeler"
              placeholderTextColor={theme.muted}
            />
          </View>

          {/* Açıklama */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Açıklama *</Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: theme.background === '#f5f5f5' ? '#fff' : theme.surface,
                borderColor: theme.border,
                color: theme.text 
              }]}
              value={formData.Aciklama}
              onChangeText={(text) => handleInputChange('Aciklama', text)}
              placeholder="Ödev açıklaması..."
              placeholderTextColor={theme.muted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Teslim Tarihi */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Teslim Tarihi *</Text>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: theme.background === '#f5f5f5' ? '#fff' : theme.surface,
                borderColor: theme.border,
                color: theme.text 
              }]}
              value={formData.TeslimTarihi}
              onChangeText={(text) => handleInputChange('TeslimTarihi', text)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.muted}
            />
          </View>

          {/* Öğrenci Numarası */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Öğrenci Numarası</Text>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: theme.background === '#f5f5f5' ? '#fff' : theme.surface,
                borderColor: theme.border,
                color: theme.text 
              }]}
              value={formData.OgrenciNumara}
              onChangeText={(text) => handleInputChange('OgrenciNumara', text)}
              placeholder="Örn: 12 (Sınıfa ödev için boş bırakın)"
              placeholderTextColor={theme.muted}
              keyboardType="numeric"
            />
          </View>

          {/* Sınıf */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Sınıf</Text>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: theme.background === '#f5f5f5' ? '#fff' : theme.surface,
                borderColor: theme.border,
                color: theme.text 
              }]}
              value={formData.Sinif}
              onChangeText={(text) => handleInputChange('Sinif', text)}
              placeholder="Örn: 5-A"
              placeholderTextColor={theme.muted}
            />
          </View>

          {/* Kayıt Türü Bilgisi */}
          <View style={styles.inputGroup}>
            <Text style={[styles.infoText, { 
              color: formData.KayitTuru === 1 ? theme.success : theme.warning,
              backgroundColor: formData.KayitTuru === 1 ? theme.success + '20' : theme.warning + '20'
            }]}>
              📋 {formData.KayitTuru === 1 ? 'Öğrenciye Özel Ödev' : 'Sınıfa Genel Ödev'}
            </Text>
          </View>

          {/* Puan */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Puan</Text>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: theme.background === '#f5f5f5' ? '#fff' : theme.surface,
                borderColor: theme.border,
                color: theme.text 
              }]}
              value={formData.puan}
              onChangeText={(text) => handleInputChange('puan', text)}
              placeholder="Örn: 100"
              placeholderTextColor={theme.muted}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Photo Section */}
        <View style={[styles.formCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Fotoğraf Ekle (İsteğe Bağlı)
          </Text>

          {photo ? (
            <View style={styles.photoContainer}>
              <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
              <TouchableOpacity
                style={[styles.removePhotoButton, { backgroundColor: theme.danger }]}
                onPress={removePhoto}
              >
                <Text style={[styles.removePhotoText, { color: '#fff' }]}>
                  ❌ Fotoğrafı Kaldır
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.photoButton, { 
                backgroundColor: theme.background === '#f5f5f5' ? '#fff' : theme.surface,
                borderColor: theme.border 
              }]}
              onPress={pickImage}
            >
              <Text style={[styles.photoButtonText, { color: theme.accent }]}>
                📸 Fotoğraf Seç
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, { 
            backgroundColor: theme.accent,
            opacity: loading ? 0.6 : 1
          }]}
          onPress={submitHomework}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={[styles.submitButtonText, { color: '#fff' }]}>
              📝 Ödevi Ata
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
  },
  scrollContent: {
    padding: 16,
  },
  formCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
  },
  photoButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  photoContainer: {
    alignItems: 'center',
  },
  photoPreview: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
  },
  removePhotoButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  removePhotoText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeworkAssignment; 