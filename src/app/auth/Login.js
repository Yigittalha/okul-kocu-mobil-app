import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import api from "../../lib/api";
import { getToken } from "../../lib/storage";
import { darkBlue, yellow } from "../../constants/colors";
import { SessionContext } from "../../state/session";
import { useTheme } from "../../state/theme";
import ThemeToggle from "../../ui/theme/ThemeToggle";

const Login = () => {
  const { schoolCode, setSession } = useContext(SessionContext);
  const { theme, isDark, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/user/login", {
        username: email,
        password: password,
      });

      // Check if response is false (wrong credentials)
      if (response.data === false) {
        Alert.alert("Giriş başarısız", "Kullanıcı adı veya şifre yanlış");
        return;
      }

      const { token, rol } = response.data;

      if (token && rol) {
        // Map rol numbers to role names
        let role;
        switch (rol) {
          case "1":
            role = "admin";
            break;
          case "2":
            role = "teacher";
            break;
          case "3":
            role = "parent";
            break;
          default:
            role = "parent"; // Default fallback
        }

        console.log("Login successful, saving token and role...");
        console.log("🔑 Token received:", token);
        console.log("🎭 Role received:", role);

        // Only save token, role and schoolCode - let dashboards fetch user data
        await setSession({
          accessToken: token,
          role: role,
          schoolCode,
        });

        // Verify token was saved
        // const savedToken = await getToken(); // This line was not in the original file, so it's removed.
        // console.log('✅ Token saved to storage:', savedToken ? 'YES' : 'NO');
        // console.log('💾 Saved token value:', savedToken);

        Alert.alert("Başarılı", "Giriş başarılı!");
      } else {
        Alert.alert("Hata", "Geçersiz yanıt formatı");
      }
    } catch (err) {
      if (err.response?.status === 400) {
        Alert.alert(
          "Giriş başarısız",
          "Bilgiler boş veya yanlış gönderilmiştir",
        );
      } else if (err.response?.data === false) {
        Alert.alert("Giriş başarısız", "Kullanıcı adı veya şifre yanlış");
      } else {
        Alert.alert(
          "Giriş başarısız",
          err.response?.data?.message || "Bilinmeyen hata",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ThemeToggle style={styles.themeToggle} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Image
            source={require("../../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.appName, { color: theme.text }]}>OKUL KOÇU</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: theme.text }]}>Giriş Yap</Text>

          {schoolCode && (
            <View
              style={[styles.schoolBadge, { backgroundColor: theme.accent }]}
            >
              <Text style={[styles.schoolInfo, { color: theme.primary }]}>
                📚 {schoolCode}
              </Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>
              E-posta
            </Text>
            <TextInput
              placeholder="E-posta adresinizi girin"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[
                styles.input,
                { backgroundColor: theme.input, color: theme.inputText },
              ]}
              placeholderTextColor="#999"
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>
              Şifre
            </Text>
            <TextInput
              placeholder="Şifrenizi girin"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={[
                styles.input,
                { backgroundColor: theme.input, color: theme.inputText },
              ]}
              placeholderTextColor="#999"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              { opacity: loading ? 0.6 : 1, backgroundColor: theme.accent },
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={[styles.buttonText, { color: theme.primary }]}>
              {loading ? "🔄 Giriş yapılıyor..." : "🚀 Giriş Yap"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  themeToggle: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1000,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  appName: {
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  formContainer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
  },
  schoolBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "center",
    marginBottom: 25,
  },
  schoolInfo: {
    fontSize: 14,
    fontWeight: "bold",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 5,
  },
  input: {
    borderRadius: 12,
    padding: 18,
    fontSize: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  button: {
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Login;
