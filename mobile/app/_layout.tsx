import { createContext, useContext, useState, useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageDTO } from '@/services/languageService';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const LANGUAGE_STORAGE_KEY = '@flashcard_app:selected_language';

interface LanguageContextType {
  selectedLanguage: LanguageDTO | null;
  setSelectedLanguage: (lang: LanguageDTO | null) => void;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  selectedLanguage: null,
  setSelectedLanguage: () => {},
  isLoading: true,
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [selectedLanguage, setSelectedLanguageState] = useState<LanguageDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  // 1. Uygulama açılışında kayıtlı dili yükle
  useEffect(() => {
    loadSavedLanguage();
  }, []);

  // 2. Navigasyon Mantığı (Takılmaları önlemek için geliştirildi)
  useEffect(() => {
    // Veriler yüklenirken veya navigasyon sistemi hazır değilken işlem yapma
    if (isLoading) return;

    // Segment kontrolü: Mevcut sayfa onboarding grubunda mı?
    const inOnboarding = segments[0] === '(onboarding)';

    if (!selectedLanguage && !inOnboarding) {
      // Dil seçilmemişse ve onboarding dışındaysak -> Onboarding'e gönder
      // Timeout kullanmak, navigasyon ağacının tam yüklenmesini beklemeyi sağlar
      const timer = setTimeout(() => {
        router.replace('/(onboarding)');
      }, 1);
      return () => clearTimeout(timer);
    } 
    
    if (selectedLanguage && inOnboarding) {
      // Dil seçilmişse ve hala onboarding'deyseniz -> Dashboard'a gönder
      const timer = setTimeout(() => {
        router.replace('/(tabs)/dashboard');
      }, 1);
      return () => clearTimeout(timer);
    }
  }, [selectedLanguage, segments, isLoading]);

  const loadSavedLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved) {
        setSelectedLanguageState(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading saved language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setSelectedLanguage = async (lang: LanguageDTO | null) => {
    try {
      if (lang) {
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, JSON.stringify(lang));
      } else {
        await AsyncStorage.removeItem(LANGUAGE_STORAGE_KEY);
      }
      setSelectedLanguageState(lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  // Yükleme sırasında boş ekran veya Splash göstererek "takılma" hissini önle
  if (isLoading) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LanguageContext.Provider value={{ selectedLanguage, setSelectedLanguage, isLoading }}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            {/* Gruplar */}
            <Stack.Screen name="(onboarding)/index" />
            <Stack.Screen name="(tabs)" />
            
            {/* Dışarıdaki Sayfalar (flashcard klasörü) */}
            <Stack.Screen 
              name="flashcard/create" 
              options={{ 
                headerShown: false,
                presentation: 'card' // GitHub tarzı sağdan sola geçiş
              }}  
            />
            <Stack.Screen 
              name="flashcard/play" 
              options={{ 
                headerShown: false,
                presentation: 'fullScreenModal' 
              }}  
            />
            
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
        </ThemeProvider>
      </LanguageContext.Provider>
    </GestureHandlerRootView>
  );
}

export const useLanguage = () => useContext(LanguageContext);