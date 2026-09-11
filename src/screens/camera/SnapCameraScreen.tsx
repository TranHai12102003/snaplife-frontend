import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, Check, X, Sparkles } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { Button } from '../../components/common/Button';
import { mediaApi } from '../../api/mediaApi';
import { postApi } from '../../api/postApi';
import { useExpenseStore } from '../../stores/useExpenseStore';

const { width } = Dimensions.get('window');
const PREVIEW_SIZE = width - 32;

interface SnapCameraScreenProps {
  navigation: any;
}

export const SnapCameraScreen: React.FC<SnapCameraScreenProps> = ({ navigation }) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isExpense, setIsExpense] = useState(true);
  const [foodName, setFoodName] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const categories = useExpenseStore((state) => state.categories);
  const fetchCategories = useExpenseStore((state) => state.fetchCategories);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Default select first category if available
  useEffect(() => {
    if (Array.isArray(categories) && categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].Id);
    }
  }, [categories, selectedCategoryId]);

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Cấp quyền', 'Vui lòng cấp quyền truy cập máy ảnh để chụp Snap.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Cấp quyền', 'Vui lòng cấp quyền thư viện ảnh để chọn Snap.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handlePublish = async () => {
    if (!imageUri) {
      Alert.alert('Chưa có ảnh', 'Vui lòng chụp hoặc chọn một bức ảnh Snap.');
      return;
    }

    setIsPublishing(true);

    try {
      // 1. Upload photo to media storage
      const uploadRes = await mediaApi.uploadFile(imageUri, 'snap.jpg', 'image/jpeg', 'snaps');
      const fileId = uploadRes.FileId;

      // 2. Create post with visual expense details
      const parsedAmount = isExpense && amount ? parseFloat(amount.replace(/[^0-9]/g, '')) : undefined;

      const postRes = await postApi.createPost({
        MediaFileIds: [fileId],
        Content: caption.trim() || undefined,
        IsExpense: isExpense,
        Amount: parsedAmount,
        Currency: 'VND',
        FoodName: isExpense ? foodName.trim() || undefined : undefined,
        ExpenseCategoryId: isExpense ? selectedCategoryId || undefined : undefined,
        ShowAmountToFriends: true,
      });

      if (postRes.IsSuccess) {
        // Reset form & Navigate to Feed
        setImageUri(null);
        setCaption('');
        setFoodName('');
        setAmount('');
        navigation.navigate('FeedTab');
      } else {
        Alert.alert('Lỗi', postRes.Message || 'Không thể đăng Snap.');
      }
    } catch (error: any) {
      console.error('Publish error:', error);
      Alert.alert('Thất bại', 'Đã xảy ra lỗi trong quá trình tải ảnh và đăng bài.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Khoảnh khắc Snap</Text>
        {imageUri && (
          <TouchableOpacity onPress={() => setImageUri(null)} style={styles.cancelBtn}>
            <X color={colors.textSecondary} size={22} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Photo Box */}
        {imageUri ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: imageUri }} style={styles.imagePreview} contentFit="cover" />
          </View>
        ) : (
          <View style={styles.pickerBox}>
            <View style={styles.pickerIconBadge}>
              <Camera color={colors.primary} size={36} />
            </View>
            <Text style={styles.pickerTitle}>Chụp khoảnh khắc ngay</Text>
            <Text style={styles.pickerSubtitle}>Chia sẻ bữa ăn hoặc khoảnh khắc với bạn bè thân thiết</Text>

            <View style={styles.pickerButtonRow}>
              <TouchableOpacity style={styles.pickActionBtn} onPress={takePhoto}>
                <Camera color="#000000" size={20} />
                <Text style={styles.pickActionText}>Máy ảnh</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.pickActionBtn, styles.pickActionSecondary]} onPress={pickImage}>
                <ImageIcon color={colors.text} size={20} />
                <Text style={[styles.pickActionText, { color: colors.text }]}>Thư viện</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Inputs (Only when photo is selected) */}
        {imageUri ? (
          <View style={styles.formCard}>
            {/* Caption */}
            <Text style={styles.inputLabel}>Cảm nghĩ / Caption</Text>
            <TextInput
              placeholder="Hôm nay bạn thưởng thức món gì thế?..."
              placeholderTextColor={colors.textMuted}
              value={caption}
              onChangeText={setCaption}
              style={styles.captionInput}
              multiline
            />

            {/* Expense Switch */}
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.switchTitle}>Ghi nhận chi tiêu món ăn</Text>
                <Text style={styles.switchSubtitle}>Tự động thêm vào Dashboard tài chính</Text>
              </View>
              <Switch
                value={isExpense}
                onValueChange={setIsExpense}
                trackColor={{ false: colors.surfaceLight, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Expense Fields */}
            {isExpense && (
              <View style={styles.expenseSection}>
                <Text style={styles.inputLabel}>Tên món / Nội dung</Text>
                <TextInput
                  placeholder="Ví dụ: Cơm tấm sườn bì chả"
                  placeholderTextColor={colors.textMuted}
                  value={foodName}
                  onChangeText={setFoodName}
                  style={styles.textInput}
                />

                <Text style={styles.inputLabel}>Số tiền (VND)</Text>
                <TextInput
                  placeholder="50000"
                  placeholderTextColor={colors.textMuted}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  style={styles.textInput}
                />

                {/* Categories */}
                <Text style={styles.inputLabel}>Danh mục</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                  {Array.isArray(categories) &&
                    categories.map((cat) => {
                      const isSelected = selectedCategoryId === cat.Id;
                      return (
                        <TouchableOpacity
                          key={cat.Id}
                          style={[styles.categoryPill, isSelected && styles.categoryPillSelected]}
                          onPress={() => setSelectedCategoryId(cat.Id)}
                        >
                          <Text style={styles.categoryPillIcon}>{cat.Icon || '🏷️'}</Text>
                          <Text style={[styles.categoryPillText, isSelected && styles.categoryPillTextSelected]}>
                            {cat.Name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                </ScrollView>
              </View>
            )}

            <Button
              title="Chia sẻ Snap"
              onPress={handlePublish}
              isLoading={isPublishing}
              size="large"
              style={styles.publishBtn}
            />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  cancelBtn: {
    padding: 6,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  pickerBox: {
    height: PREVIEW_SIZE,
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  pickerIconBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 200, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  pickerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  pickerSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
  },
  pickerButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pickActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  pickActionSecondary: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickActionText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 8,
  },
  imagePreviewContainer: {
    width: PREVIEW_SIZE,
    height: PREVIEW_SIZE,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  captionInput: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    padding: 12,
    color: colors.text,
    fontSize: 14,
    minHeight: 60,
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: 12,
  },
  switchTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  switchSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  expenseSection: {
    marginTop: 6,
  },
  textInput: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    color: colors.text,
    fontSize: 14,
    marginBottom: 14,
  },
  categoriesScroll: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryPillSelected: {
    backgroundColor: 'rgba(255, 200, 55, 0.2)',
    borderColor: colors.primary,
  },
  categoryPillIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryPillText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  categoryPillTextSelected: {
    color: colors.primary,
  },
  publishBtn: {
    marginTop: 8,
  },
});

