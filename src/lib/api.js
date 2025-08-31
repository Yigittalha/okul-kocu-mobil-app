import axios from 'axios';
import { getToken, getRefreshToken, setToken, setRefreshToken } from './storage';

// API URL'yi doğrudan burada tanımla - ngrok URL'sini kullan
const API_BASE_URL = 'https://65b51b9f86fa.ngrok-free.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Helper function to get upload URL for photos
export const getUploadUrl = (filename) => {
  console.log('getUploadUrl called with filename:', filename);
  
  // Geçerli bir dosya adı kontrolü
  if (!filename || typeof filename !== 'string' || filename.trim() === '') {
    console.log('No photo or invalid filename, returning null');
    return null;
  }
  
  // Dosya adını temizle (boşluk ve özel karakterleri kaldır)
  const cleanFilename = filename.trim();
  
  // Mock fotoğraf işleme (sadece geliştirme için)
  if (cleanFilename.includes('ogrenci_') || cleanFilename.includes('ogretmen_') || cleanFilename.includes('admin_')) {
    console.log('Mock photo detected, using placeholder image');
    
    // Placeholders based on user type
    if (cleanFilename.includes('ogrenci_')) {
      return 'https://randomuser.me/api/portraits/children/' + (parseInt(cleanFilename.replace(/\D/g, '')) % 100) + '.jpg';
    } else if (cleanFilename.includes('ogretmen_')) {
      return 'https://randomuser.me/api/portraits/women/' + (parseInt(cleanFilename.replace(/\D/g, '')) % 100) + '.jpg';
    } else if (cleanFilename.includes('admin_')) {
      return 'https://randomuser.me/api/portraits/men/' + (parseInt(cleanFilename.replace(/\D/g, '')) % 100) + '.jpg';
    }
  }
  
  // API'den gerçek fotoğraf URL'sini oluştur
  try {
    // API URL'yi doğru formatta oluştur
    const uploadBaseUrl = 'https://65b51b9f86fa.ngrok-free.app/uploads';
    
    // URL sonunda slash olup olmadığını kontrol et
    const baseUrlWithSlash = uploadBaseUrl.endsWith('/') ? uploadBaseUrl : `${uploadBaseUrl}/`;
    const fullUrl = `${baseUrlWithSlash}${cleanFilename}`;
    
    console.log('Full Photo URL:', fullUrl);
    console.log('Generated Photo URL:', fullUrl);
    
    return fullUrl;
  } catch (error) {
    console.error('Error generating photo URL:', error);
    return null;
  }
};

// User API functions
export const fetchUserInfo = async (showErrors = false) => {
  try {
    const token = await getToken();
    console.log('🔍 Fetching user info with token:', token ? `${token.substring(0, 15)}...` : 'NO TOKEN');
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    // Try different approaches to make the request work
    try {
      console.log('💡 Trying direct API instance with headers...');
      // Method 1: Using the API instance with explicit headers
      const response = await api.post('/user/info', {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('✅ User info API Response successful (Method 1)!');
      
      // Fotoğraf URL'sini işle
      if (response.data && response.data.Fotograf) {
        console.log('📸 Photo data received:', response.data.Fotograf);
      } else {
        console.log('⚠️ No photo data in response');
      }
      
      return response.data;
    } catch (error1) {
      console.log('❌ Method 1 failed:', error1.message);
      
      // Method 2: Using axios directly with full URL
      console.log('💡 Trying direct axios call...');
      const fullUrl = `${API_BASE_URL}/user/info`;
      
      const response = await axios({
        method: 'post',
        url: fullUrl,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data: {}
      });
      
      console.log('✅ User info API Response successful (Method 2)!');
      
      // Fotoğraf URL'sini işle
      if (response.data && response.data.Fotograf) {
        console.log('📸 Photo data received:', response.data.Fotograf);
      } else {
        console.log('⚠️ No photo data in response');
      }
      
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching user info:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    // Hatayı fırlat ama sessiz mod etkinse sadece konsola yaz
    if (showErrors) {
      throw error;
    } else {
      return null; // Hata durumunda sessizce null döndür
    }
  }
};

// Teacher API functions
export const fetchTeachers = async (page = 1, limit = 20, showErrors = false) => {
  try {
    const token = await getToken();
    console.log('🔍 Fetching teachers with token:', token ? `${token.substring(0, 15)}...` : 'NO TOKEN');
    
    const response = await api.post('/teacher/allteacher', {
      page,
      limit
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Teachers API Response successful!');
    return response.data;
  } catch (error) {
    console.error('Error fetching teachers:', error);
    if (showErrors) {
      throw error;
    } else {
      return null; // Hata durumunda sessizce null döndür
    }
  }
};

// Students API functions
export const fetchAllStudents = async (showErrors = false) => {
  try {
    const token = await getToken();
    console.log('🔍 Fetching all students with token:', token ? `${token.substring(0, 15)}...` : 'NO TOKEN');
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    // Try API instance with explicit headers
    const response = await api.post('/student/all', {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('✅ Students API Response successful!');
    
    // Validate and log photo information
    if (response.data && Array.isArray(response.data)) {
      console.log(`📋 Received ${response.data.length} students data`);
      
      // Log photo information for debugging
      response.data.forEach((student, index) => {
        if (student && student.Fotograf) {
          console.log(`📸 Student ${index + 1} (${student.AdSoyad}) photo: ${student.Fotograf}`);
        } else {
          console.log(`⚠️ Student ${index + 1} has no photo data`);
        }
      });
      
      return response.data;
    } else {
      console.log('⚠️ Invalid students data format from API:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching students:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    // Throw error or return empty array depending on showErrors flag
    if (showErrors) {
      throw error;
    } else {
      return []; // Return empty array on error
    }
  }
};

// Reference to session clearing function (will be set from SessionProvider)
let clearSessionCallback = null;

export const setSessionClearCallback = (callback) => {
  clearSessionCallback = callback;
};

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('✅ Token found and added to POST request:', token.substring(0, 30) + '...');
    console.log('✅ POST Request URL:', config.url);
    console.log('✅ POST Request method:', config.method);
  } else {
    console.log('❌ NO TOKEN FOUND in storage for POST request');
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 - token expired/invalid
    if (error.response?.status === 401) {
      console.log('401 error - clearing session and redirecting to login');
      
      // Try refresh token first
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        const refreshToken = await getRefreshToken();
        
        if (refreshToken) {
          try {
            const refreshResponse = await api.post('/auth/refresh', { refreshToken });
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data;
            await setToken(newAccessToken);
            if (newRefreshToken) {
              await setRefreshToken(newRefreshToken);
            }
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            console.log('Refresh failed, clearing session');
          }
        }
      }
      
      // If refresh failed or no refresh token, clear session
      if (clearSessionCallback) {
        await clearSessionCallback();
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 