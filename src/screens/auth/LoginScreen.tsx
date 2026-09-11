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
import { colors, commonStyles, typography } from '../../theme';
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
    <SafeAreaView style={commonStyles.screenContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={commonStyles.authScrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo & Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Sparkles color={colors.primary} size={32} />
            </View>
            <Text style={typography.h1}>SnapLife</Text>
            <Text style={typography.subtitle}>Khoảnh khắc bạn bè & Chi tiêu thị giác</Text>
          </View>

          {/* Form */}
          <View style={commonStyles.card}>
            <Text style={[typography.h3, styles.cardTitle]}>Đăng nhập</Text>

            {errorMessage ? (
              <View style={commonStyles.errorBanner}>
                <Text style={commonStyles.errorBannerText}>{errorMessage}</Text>
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

            <View style={[commonStyles.row, styles.footerRow]}>
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
  keyboardView: {
    flex: 1,
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
  cardTitle: {
    marginBottom: 20,
  },
  loginButton: {
    marginTop: 8,
  },
  footerRow: {
    justifyContent: 'center',
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

