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
import { Lock, Mail, User, ArrowLeft } from 'lucide-react-native';
import { colors, commonStyles, typography } from '../../theme';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { authApi } from '../../api/authApi';

interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    if (!email.trim() || !password || !confirmPassword) {
      setErrorMessage('Vui lòng điền đầy đủ Email và Mật khẩu.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Mật khẩu phải chứa ít nhất 6 ký tự.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await authApi.register({
        Email: email.trim(),
        UserName: userName.trim() || undefined,
        FirstName: firstName.trim() || undefined,
        LastName: lastName.trim() || undefined,
        Password: password,
        ConfirmPassword: confirmPassword,
      });

      if (response.IsSuccess) {
        Alert.alert(
          'Đăng ký thành công! 🎉',
          'Tài khoản của bạn đã được tạo. Vui lòng đăng nhập để bắt đầu trải nghiệm SnapLife.',
          [{ text: 'Đăng nhập ngay', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        setErrorMessage(response.Message || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.Message ||
        error.response?.data?.message ||
        'Đã có lỗi xảy ra trong quá trình đăng ký.';
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
        <View style={styles.topNav}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft color={colors.text} size={24} />
          </TouchableOpacity>
          <Text style={typography.h3}>Tạo tài khoản</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={commonStyles.authScrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={commonStyles.card}>
            {errorMessage ? (
              <View style={commonStyles.errorBanner}>
                <Text style={commonStyles.errorBannerText}>{errorMessage}</Text>
              </View>
            ) : null}

            <Input
              label="Email *"
              placeholder="email@cuaban.com"
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
              label="Username (Tên hiển thị)"
              placeholder="snap_user"
              autoCapitalize="none"
              value={userName}
              onChangeText={setUserName}
              leftIcon={<User color={colors.textSecondary} size={20} />}
            />

            <View style={commonStyles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Input
                  label="Họ"
                  placeholder="Nguyễn"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Input
                  label="Tên"
                  placeholder="Văn A"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
            </View>

            <Input
              label="Mật khẩu *"
              placeholder="Ít nhất 6 ký tự"
              secureTextEntry
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (errorMessage) setErrorMessage('');
              }}
              leftIcon={<Lock color={colors.textSecondary} size={20} />}
            />

            <Input
              label="Xác nhận mật khẩu *"
              placeholder="Nhập lại mật khẩu"
              secureTextEntry
              value={confirmPassword}
              onChangeText={(t) => {
                setConfirmPassword(t);
                if (errorMessage) setErrorMessage('');
              }}
              leftIcon={<Lock color={colors.textSecondary} size={20} />}
            />

            <Button
              title="Đăng ký"
              onPress={handleRegister}
              isLoading={isLoading}
              size="large"
              style={styles.submitButton}
            />

            <View style={[commonStyles.row, styles.footerRow]}>
              <Text style={styles.footerText}>Đã có tài khoản?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}> Đăng nhập</Text>
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
  topNav: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
  },
  backButton: {
    padding: 4,
  },
  submitButton: {
    marginTop: 10,
  },
  footerRow: {
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});

