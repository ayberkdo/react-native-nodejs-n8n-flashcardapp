import React, { useEffect, useState } from 'react';
import { 
  Text, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  StyleSheet, 
  View 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router'; // Yönlendirme için eklendi
import { languageService, LanguageDTO } from '@/services/languageService';
import { useLanguage } from '../_layout';

export default function OnboardingScreen() {
  const [languages, setLanguages] = useState<LanguageDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [tempSelection, setTempSelection] = useState<LanguageDTO | null>(null);
  
  const { setSelectedLanguage } = useLanguage();
  const router = useRouter(); // Router'ı tanımlıyoruz

  useEffect(() => {
    loadLanguages();
  }, []);

  const loadLanguages = async () => {
    try {
      const data = await languageService.getAllLanguages();
      setLanguages(data);
    } catch (error) {
      console.error("Diller yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (tempSelection) {
      try {
        // 1. Global state ve storage güncellemesi
        await setSelectedLanguage(tempSelection); 
        
        // 2. Takılmayı önlemek için manuel yönlendirme
        // RootLayout'taki otomatik useEffect bazen geç tetiklenebilir
        router.replace('/(tabs)/dashboard');
      } catch (e) {
        console.error("Yönlendirme hatası:", e);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0969da" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dil Seçin</Text>
        <Text style={styles.subtitle}>Uygulamayı hangi dilde kullanmak istersiniz?</Text>
      </View>
      
      <FlatList
        data={languages}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isSelected = tempSelection?.id === item.id;
          return (
            <TouchableOpacity 
              activeOpacity={0.7}
              style={[
                styles.item, 
                isSelected && styles.selectedItem
              ]}
              onPress={() => setTempSelection(item)}
            >
              <View style={styles.itemContent}>
                <Text style={[
                  styles.itemText,
                  isSelected && styles.selectedItemText
                ]}>
                  {item.name}
                </Text>
                <Text style={styles.itemSubText}>{item.code.toUpperCase()}</Text>
              </View>
              {isSelected && (
                <View style={styles.checkIcon}>
                  <Text style={{color: '#ffffff', fontSize: 10}}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, !tempSelection && styles.disabledButton]} 
          onPress={handleContinue}
          disabled={!tempSelection}
        >
          <Text style={styles.buttonText}>Devam Et</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#ffffff',
  },
  center: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24, // Biraz daha genişlettik
    borderBottomWidth: 1,
    borderBottomColor: '#d0d7de',
  },
  title: { 
    fontSize: 24, // GitHub Headline standartlarına yaklaştı
    fontWeight: '600',
    color: '#24292f',
  },
  subtitle: {
    fontSize: 14,
    color: '#57606a', 
    marginTop: 6,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  item: { 
    flexDirection: 'row', // Yatay hizalama için
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 6, // GitHub butonuyla aynı radius
    marginBottom: 12,
    backgroundColor: '#f6f8fa',
  },
  itemContent: {
    flex: 1,
  },
  selectedItem: { 
    borderColor: '#0969da',
    backgroundColor: '#ddf4ff',
  },
  itemText: { 
    fontSize: 16,
    fontWeight: '600',
    color: '#24292f',
  },
  selectedItemText: {
    color: '#0969da',
  },
  itemSubText: {
    fontSize: 12,
    color: '#57606a',
    marginTop: 2,
  },
  checkIcon: {
    backgroundColor: '#0969da',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 20,
    paddingBottom: 40, // Alt kısımdan daha fazla boşluk
    borderTopWidth: 1,
    borderTopColor: '#d0d7de',
    backgroundColor: '#ffffff',
  },
  button: { 
    backgroundColor: '#2da44e',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(27,31,36,0.15)',
  },
  disabledButton: { 
    backgroundColor: '#8c959f',
    opacity: 0.5,
  },
  buttonText: { 
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});