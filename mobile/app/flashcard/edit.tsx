import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useLanguage } from '../_layout';
import { flashcardService, WordPair } from '@/services/flashcardService';

export default function EditFlashcardScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { selectedLanguage } = useLanguage();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [words, setWords] = useState<WordPair[]>([{ front: '', back: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadFlashcard = React.useCallback(async () => {
    if (!id) {
      Alert.alert('Hata', 'Flashcard ID bulunamadı.', [
        { text: 'Tamam', onPress: () => router.back() },
      ]);
      return;
    }

    try {
      setIsLoading(true);
      const flashcard = await flashcardService.getFlashcardById(id as string);
      
      setTitle(flashcard.title);
      setDescription(flashcard.description || '');
      setNotes(flashcard.notes || '');
      setWords(flashcard.words.length > 0 ? flashcard.words : [{ front: '', back: '' }]);
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Flashcard yüklenemedi.', [
        { text: 'Tamam', onPress: () => router.back() },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadFlashcard();
  }, [loadFlashcard]);

  const addWordPair = () => {
    setWords([...words, { front: '', back: '' }]);
  };

  const removeWordPair = (index: number) => {
    if (words.length === 1) {
      Alert.alert('Uyarı', 'En az bir kelime çifti olmalıdır.');
      return;
    }
    const newWords = words.filter((_, i) => i !== index);
    setWords(newWords);
  };

  const updateWordPair = (index: number, field: 'front' | 'back', value: string) => {
    const newWords = [...words];
    newWords[index][field] = value;
    setWords(newWords);
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert('Hata', 'Başlık alanı zorunludur.');
      return false;
    }

    if (!selectedLanguage) {
      Alert.alert('Hata', 'Lütfen önce bir dil seçin.');
      return false;
    }

    // Check if all word pairs have values
    const hasEmptyWords = words.some((word) => !word.front.trim() || !word.back.trim());
    if (hasEmptyWords) {
      Alert.alert('Hata', 'Tüm kelime çiftlerini doldurmalısınız.');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await flashcardService.updateFlashcard(id as string, {
        title: title.trim(),
        description: description.trim() || undefined,
        notes: notes.trim() || undefined,
        words: words.map((w) => ({
          front: w.front.trim(),
          back: w.back.trim(),
        })),
        languageId: selectedLanguage!.id,
      });

      Alert.alert('Başarılı', 'Flashcard başarıyla güncellendi!', [
        {
          text: 'Tamam',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Flashcard güncellenemedi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#24292f" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Flashcard Düzenle</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0969da" />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#24292f" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Flashcard Düzenle</Text>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="#ffffff" />
              <Text style={styles.submitButtonText}>Güncelle</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <Ionicons name="language-outline" size={20} color="#57606a" style={{ marginRight: 6 }} />
        <Text style={styles.infoText}>
          {selectedLanguage
            ? `${selectedLanguage.flag ? selectedLanguage.flag + ' ' : ''}${selectedLanguage.name} dili için flashcard düzenliyorsunuz.`
            : 'Bir dil seçilmedi.'}
        </Text>
      </View>

      <View style={{ height: 1, backgroundColor: '#d0d7de' }} />

      {/* Form Content */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Başlık <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: Günlük Kelimeler"
              placeholderTextColor="#8c959f"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>

          {/* Description Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Açıklama</Text>
            <TextInput
              style={styles.input}
              placeholder="Flashcard seti hakkında kısa açıklama"
              placeholderTextColor="#8c959f"
              value={description}
              onChangeText={setDescription}
              maxLength={255}
            />
          </View>

          {/* Notes Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Notlar</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ek notlarınız"
              placeholderTextColor="#8c959f"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Words Section */}
          <View style={styles.wordsSection}>
            <View style={styles.wordsSectionHeader}>
              <Text style={styles.label}>
                Kelimeler <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity style={styles.addButton} onPress={addWordPair}>
                <Ionicons name="add-circle" size={24} color="#2da44e" />
                <Text style={styles.addButtonText}>Kelime Ekle</Text>
              </TouchableOpacity>
            </View>

            {words.map((word, index) => (
              <View key={index} style={styles.wordPairContainer}>
                <View style={styles.wordPairHeader}>
                  <Text style={styles.wordPairLabel}>Kelime {index + 1}</Text>
                  {words.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeWordPair(index)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="trash-outline" size={20} color="#cf222e" />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.wordPairInputs}>
                  <View style={styles.wordInputContainer}>
                    <Text style={styles.wordInputLabel}>Önyüz</Text>
                    <TextInput
                      style={styles.wordInput}
                      placeholder="Örn: Hello"
                      placeholderTextColor="#8c959f"
                      value={word.front}
                      onChangeText={(text) => updateWordPair(index, 'front', text)}
                    />
                  </View>

                  <View style={styles.wordInputContainer}>
                    <Text style={styles.wordInputLabel}>Arkayüz</Text>
                    <TextInput
                      style={styles.wordInput}
                      placeholder="Örn: Merhaba"
                      placeholderTextColor="#8c959f"
                      value={word.back}
                      onChangeText={(text) => updateWordPair(index, 'back', text)}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#57606a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#d0d7de',
    backgroundColor: '#f6f8fa',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#24292f',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2da44e',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    gap: 6,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ddf4ff',
  },
  infoText: {
    fontSize: 13,
    color: '#0969da',
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#24292f',
    marginBottom: 8,
  },
  required: {
    color: '#cf222e',
  },
  input: {
    backgroundColor: '#f6f8fa',
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#24292f',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 10,
  },
  wordsSection: {
    marginBottom: 20,
  },
  wordsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2da44e',
  },
  wordPairContainer: {
    backgroundColor: '#f6f8fa',
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  wordPairHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  wordPairLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#57606a',
  },
  removeButton: {
    padding: 4,
  },
  wordPairInputs: {
    gap: 12,
  },
  wordInputContainer: {
    gap: 6,
  },
  wordInputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#57606a',
  },
  wordInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#24292f',
  },
  bottomSpacer: {
    height: 40,
  },
});
