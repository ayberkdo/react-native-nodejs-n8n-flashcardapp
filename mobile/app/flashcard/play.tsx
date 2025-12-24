import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  ScrollView,
  FlatList,
  Dimensions,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { flashcardService, FlashcardDTO, WordPair } from '@/services/flashcardService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;

// Animated Flashcard Item Component
interface FlashcardItemProps {
  word: WordPair;
  index: number;
}

function FlashcardItem({ word, index }: FlashcardItemProps) {
  const rotation = useSharedValue(0);

  const flipCard = () => {
    rotation.value = withTiming(rotation.value === 0 ? 180 : 0, { duration: 600 });
  };

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 180], [0, 180]);
    const opacity = interpolate(rotation.value, [0, 90, 90.1, 180], [1, 0, 0, 0]);
    
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      opacity,
      backfaceVisibility: 'hidden',
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 180], [180, 360]);
    const opacity = interpolate(rotation.value, [0, 89.9, 90, 180], [0, 0, 1, 1]);
    
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      opacity,
      backfaceVisibility: 'hidden',
    };
  });

  return (
    <Pressable onPress={flipCard} style={styles.cardContainer}>
      <View style={styles.cardWrapper}>
        {/* Front Face */}
        <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardBadge}>
              <Text style={styles.cardBadgeText}>Önyüz</Text>
            </View>
            <Text style={styles.cardIndex}>{index + 1}</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardText}>{word.front}</Text>
          </View>
          <View style={styles.cardFooter}>
            <Ionicons name="sync-outline" size={16} color="#57606a" />
            <Text style={styles.cardHint}>Kartı çevirmek için dokun</Text>
          </View>
        </Animated.View>

        {/* Back Face */}
        <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardBadge, styles.cardBadgeBack]}>
              <Text style={styles.cardBadgeTextBack}>Arkayüz</Text>
            </View>
            <Text style={styles.cardIndex}>{index + 1}</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardText}>{word.back}</Text>
          </View>
          <View style={styles.cardFooter}>
            <Ionicons name="sync-outline" size={16} color="#57606a" />
            <Text style={styles.cardHint}>Tekrar çevirmek için dokun</Text>
          </View>
        </Animated.View>
      </View>
    </Pressable>
  );
}

export default function PlayFlashcardScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [flashcard, setFlashcard] = useState<FlashcardDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const loadFlashcard = React.useCallback(async () => {
    if (!id) {
      Alert.alert('Hata', 'Flashcard ID bulunamadı.', [
        { text: 'Tamam', onPress: () => router.back() },
      ]);
      return;
    }

    try {
      setIsLoading(true);
      const data = await flashcardService.getFlashcardById(id as string);
      setFlashcard(data);
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

  const handleStart = () => {
    if (!flashcard || flashcard.words.length === 0) {
      Alert.alert('Uyarı', 'Bu flashcard setinde kelime bulunmuyor.');
      return;
    }
    router.push({ pathname: '/flashcard/study', params: { id: flashcard.id } });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#24292f" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0969da" />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!flashcard) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#24292f" />
          </TouchableOpacity>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Flashcard bulunamadı.</Text>
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
          <Text style={styles.headerTitle} numberOfLines={1}>
            {flashcard.title}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStart}
        >
          <Ionicons name="play" size={20} color="#ffffff" />
          <Text style={styles.startButtonText}>Başla</Text>
        </TouchableOpacity>
      </View>

        {/* Flashcard Carousel */}
        <View style={styles.carouselSection}>
          <View style={styles.carouselHeader}>
            <Text style={styles.carouselTitle}>Kelimeler</Text>
            <Text style={styles.carouselCounter}>
              {currentIndex + 1} / {flashcard.words.length}
            </Text>
          </View>
          
          <FlatList
            data={flashcard.words}
            keyExtractor={(_, index) => `card-${index}`}
            renderItem={({ item, index }) => <FlashcardItem word={item} index={index} />}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setCurrentIndex(index);
            }}
            snapToInterval={SCREEN_WIDTH}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContent}
          />
          
          {/* Pagination Dots */}
          <View style={styles.pagination}>
            {flashcard.words.map((_, index) => (
              <View
                key={`dot-${index}`}
                style={[
                  styles.paginationDot,
                  index === currentIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={20} color="#57606a" />
            <Text style={styles.sectionTitle}>Açıklama</Text>
          </View>
            {flashcard.description ? (
            <Text style={styles.descriptionText}>{flashcard.description}</Text>
          ) : (
            <Text style={styles.emptyText}>Henüz bir not eklenmemiş.</Text>
          )}
        </View>

        {/* Notes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={20} color="#57606a" />
            <Text style={styles.sectionTitle}>Notlar</Text>
          </View>
          {flashcard.notes ? (
            <Text style={styles.notesText}>{flashcard.notes}</Text>
          ) : (
            <Text style={styles.emptyText}>Henüz bir not eklenmemiş.</Text>
          )}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="layers" size={24} color="#0969da" />
            </View>
            <Text style={styles.statValue}>{flashcard.words.length}</Text>
            <Text style={styles.statLabel}>Kelime</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="calendar-outline" size={24} color="#2da44e" />
            </View>
            <Text style={styles.statValue}>
              {new Date(flashcard.createdAt).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'short',
              })}
            </Text>
            <Text style={styles.statLabel}>Oluşturulma</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="time-outline" size={24} color="#8250df" />
            </View>
            <Text style={styles.statValue}>
              {flashcard.lastStudiedAt 
                ? new Date(flashcard.lastStudiedAt).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'short',
                  })
                : 'Yok'
              }
            </Text>
            <Text style={styles.statLabel}>Son Çalışma</Text>
          </View>
        </View>
      </ScrollView>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#cf222e',
    textAlign: 'center',
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
    flex: 1,
    marginRight: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#24292f',
    flex: 1,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2da44e',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(27,31,36,0.15)',
    gap: 6,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    backgroundColor: '#f6f8fa',
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#24292f',
  },
  descriptionText: {
    fontSize: 14,
    color: '#24292f',
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#8c959f',
    fontStyle: 'italic',
  },
  notesText: {
    fontSize: 14,
    color: '#24292f',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f6f8fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#24292f',
  },
  statLabel: {
    fontSize: 12,
    color: '#57606a',
    textAlign: 'center',
  },
  // Carousel Styles
  carouselSection: {
    marginTop: 16,
    marginBottom: 24,
  },
  carouselHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  carouselTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#24292f',
  },
  carouselCounter: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0969da',
    backgroundColor: '#ddf4ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  carouselContent: {
    paddingHorizontal: 0,
  },
  cardContainer: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: 400,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#d0d7de',
    padding: 24,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardFront: {
    borderColor: '#d0d7de',
  },
  cardBack: {
    borderColor: '#0969da',
    backgroundColor: '#f6f8fa',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBadge: {
    backgroundColor: '#ddf4ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0969da',
  },
  cardBadgeBack: {
    backgroundColor: '#d1f4e0',
  },
  cardBadgeTextBack: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2da44e',
  },
  cardIndex: {
    fontSize: 14,
    fontWeight: '600',
    color: '#57606a',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  cardText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#24292f',
    textAlign: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  cardHint: {
    fontSize: 12,
    color: '#57606a',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#d0d7de',
  },
  paginationDotActive: {
    width: 20,
    backgroundColor: '#0969da',
  },
});