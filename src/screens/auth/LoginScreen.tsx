import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lock, Mail, Sparkles } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { authApi } from '../../api/authApi';
import { useAuthStore } from '../../stores/useAuthStore';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setErrorMessage('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await authApi.login({
        Email: email.trim(),
        Password: password,
      });

      if (response.IsSuccess && response.Token) {
        await setAuth(response.Token, response.User);
      } else {
        setErrorMessage(response.Message || 'Đăng nhập không thành công.');
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.Message ||
        error.response?.data?.message ||
        'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng hoặc backend.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo & Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Sparkles color={colors.primary} size={32} />
            </View>
            <Text style={styles.brandTitle}>SnapLife</Text>
            <Text style={styles.tagline}>Khoảnh khắc bạn bè & Chi tiêu thị giác</Text>
          </View>

          {/* Form */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Đăng nhập</Text>

            {errorMessage ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
            ) : null}

            <Input
              label="Email"
              placeholder="nhap.email@cuaban.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (errorMessage) setErrorMessage('');
              }}
              leftIcon={<Mail color={colors.textSecondary} size={20} />}
            />

            <Input
              label="Mật khẩu"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (errorMessage) setErrorMessage('');
              }}
              leftIcon={<Lock color={colors.textSecondary} size={20} />}
            />

            <Button
              title="Đăng nhập"
              onPress={handleLogin}
              isLoading={isLoading}
              size="large"
              style={styles.loginButton}
            />

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Chưa có tài khoản?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}> Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: colors.error,
    fontSize: 13,
    lineHeight: 18,
  },
  loginButton: {
    marginTop: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  registerLink: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});

