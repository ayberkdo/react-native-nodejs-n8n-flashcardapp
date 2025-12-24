import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  runOnJS,
  interpolateColor,
} from 'react-native-reanimated';
import { 
  Gesture, 
  GestureDetector, 
  GestureHandlerRootView 
} from 'react-native-gesture-handler';
import { flashcardService, FlashcardDTO, WordPair, StudySessionData, AnalyzeStudySessionResponse, WordAnalysis } from '@/services/flashcardService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface CardStatus {
  word: WordPair;
  index: number;
  status: 'pending' | 'known' | 'unknown' | 'skipped';
}

// Animated Study Card Component
interface StudyCardProps {
  word: WordPair;
  index: number;
  totalCount: number;
  isTopCard: boolean;
  onSwipeComplete: (direction: 'left' | 'right') => void;
}

function StudyCard({ word, index, totalCount, isTopCard, onSwipeComplete }: StudyCardProps) {
  const rotation = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const flipCard = () => {
    rotation.value = withTiming(rotation.value === 0 ? 180 : 0, { duration: 500 });
  };

  const panGesture = Gesture.Pan()
    .enabled(isTopCard)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.5;
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const direction = event.translationX > 0 ? 'right' : 'left';
        
        translateX.value = withTiming(
          event.translationX > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH,
          { duration: 300 },
          () => {
            runOnJS(onSwipeComplete)(direction);
          }
        );
        translateY.value = withTiming(0, { duration: 300 });
      } else {
        translateX.value = withTiming(0, { duration: 300 });
        translateY.value = withTiming(0, { duration: 300 });
      }
    });

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 180], [0, 180]);
    const opacity = interpolate(rotation.value, [0, 90, 90.1, 180], [1, 0, 0, 0]);
    
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      opacity,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 180], [180, 360]);
    const opacity = interpolate(rotation.value, [0, 89.9, 90, 180], [0, 0, 1, 1]);
    
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      opacity,
    };
  });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(translateX.value, [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2], [-15, 0, 15]);
    const scale = isTopCard ? 1 : 0.95;
    const opacityValue = isTopCard ? 1 : 0.5;

    const backgroundColor = interpolateColor(
      translateX.value,
      [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
      ['rgba(207, 34, 46, 0.15)', 'rgba(255, 255, 255, 1)', 'rgba(45, 164, 78, 0.15)']
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
        { scale },
      ],
      opacity: opacityValue,
      backgroundColor,
      zIndex: isTopCard ? 100 : 1,
    };
  });

  const swipeIndicatorStyle = useAnimatedStyle(() => {
    const rightOpacity = interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1]);
    const leftOpacity = interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0]);

    return {
      opacity: translateX.value > 0 ? rightOpacity : leftOpacity,
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.cardContainer, cardAnimatedStyle]}>
        <Pressable onPress={flipCard} style={styles.cardPressable} disabled={!isTopCard}>
            <View style={styles.cardWrapper}>
            {isTopCard && (
              <>
                <Animated.View style={[styles.swipeIndicator, styles.swipeIndicatorLeft, swipeIndicatorStyle]}>
                  <Ionicons name="close-circle" size={60} color="#cf222e" />
                  <Text style={[styles.swipeIndicatorText, { color: '#cf222e' }]}>Bilmiyorum</Text>
                </Animated.View>
                <Animated.View style={[styles.swipeIndicator, styles.swipeIndicatorRight, swipeIndicatorStyle]}>
                  <Ionicons name="checkmark-circle" size={60} color="#2da44e" />
                  <Text style={[styles.swipeIndicatorText, { color: '#2da44e' }]}>Biliyorum</Text>
                </Animated.View>
              </>
            )}

            <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
              <View style={styles.cardHeader}>
                <View style={styles.cardBadge}>
                  <Text style={styles.cardBadgeText}>Önyüz</Text>
                </View>
                <Text style={styles.cardIndex}>
                  {index + 1}/{totalCount}
                </Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardText}>{word.front}</Text>
              </View>
              <View style={styles.cardFooter}>
                <Ionicons name="sync-outline" size={16} color="#57606a" />
                <Text style={styles.cardHint}>Kartı çevirmek için dokun</Text>
              </View>
            </Animated.View>

            <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardBadge, styles.cardBadgeBack]}>
                  <Text style={styles.cardBadgeTextBack}>Arkayüz</Text>
                </View>
                <Text style={styles.cardIndex}>
                  {index + 1}/{totalCount}
                </Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardText}>{word.back}</Text>
              </View>
              <View style={styles.cardFooter}>
                <Ionicons name="sync-outline" size={16} color="#57606a" />
                <Text style={styles.cardHint}>Değerlendirmek için kaydır</Text>
              </View>
            </Animated.View>
          </View>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

// Results View Component
interface ResultsViewProps {
    known: number;
    unknown: number;
    skipped: number;
    total: number;
    onReplay: () => void;
    onAnalyze: () => void;
    onSaveAndExit: () => void;
    aiAnalysis: {
      aiFeedback: string;
      wordAnalysis: WordAnalysis[];
    } | null;
    isAnalyzing: boolean;
}

function ResultsView({ known, unknown, skipped, total, onReplay, onSaveAndExit, onAnalyze, aiAnalysis, isAnalyzing }: ResultsViewProps) {
  const knownPercent = total > 0 ? Math.round((known / total) * 100) : 0;
  const unknownPercent = total > 0 ? Math.round((unknown / total) * 100) : 0;
  const skippedPercent = total > 0 ? Math.round((skipped / total) * 100) : 0;

  return (
    <ScrollView 
      style={styles.resultsContainer}
      contentContainerStyle={styles.resultsScrollContent}
      showsVerticalScrollIndicator={true}
      bounces={true}
    >
      <View style={styles.resultsCard}>
        {/* Trophy & Header Section */}
        <View style={styles.resultsHeader}>
          <View style={styles.trophyBadge}>
            <Ionicons name="trophy-outline" size={32} color="#9a6700" />
          </View>
          <Text style={styles.resultsTitle}>Oturum Özeti</Text>
          <Text style={styles.resultsSubtitle}>
            Toplam {total} kelime üzerinde çalıştın.
          </Text>
        </View>

        {/* Stats Section - GitHub Style List */}
        <View style={styles.statsSection}>
          
          {/* Known Item */}
          <View style={styles.statItem}>
            <View style={styles.statInfo}>
              <View style={styles.statLabelGroup}>
                <View style={[styles.statusDot, { backgroundColor: '#2da44e' }]} />
                <Text style={styles.statLabelText}>Öğrenildi</Text>
              </View>
              <Text style={styles.statCountText}>{known} / {total}</Text>
            </View>
            <View style={styles.statBarContainer}>
              <View style={[styles.statBar, { width: `${knownPercent}%`, backgroundColor: '#2da44e' }]} />
            </View>
          </View>

          {/* Unknown Item */}
          <View style={styles.statItem}>
            <View style={styles.statInfo}>
              <View style={styles.statLabelGroup}>
                <View style={[styles.statusDot, { backgroundColor: '#cf222e' }]} />
                <Text style={styles.statLabelText}>Tekrar Edilmeli</Text>
              </View>
              <Text style={styles.statCountText}>{unknown} / {total}</Text>
            </View>
            <View style={styles.statBarContainer}>
              <View style={[styles.statBar, { width: `${unknownPercent}%`, backgroundColor: '#cf222e' }]} />
            </View>
          </View>

          {/* Skipped Item */}
          <View style={styles.statItem}>
            <View style={styles.statInfo}>
              <View style={styles.statLabelGroup}>
                <View style={[styles.statusDot, { backgroundColor: '#bf8700' }]} />
                <Text style={styles.statLabelText}>Pas Geçildi</Text>
              </View>
              <Text style={styles.statCountText}>{skipped} / {total}</Text>
            </View>
            <View style={styles.statBarContainer}>
              <View style={[styles.statBar, { width: `${skippedPercent}%`, backgroundColor: '#bf8700' }]} />
            </View>
          </View>

        </View>

        {/* Action Buttons Section */}
        <View style={styles.resultsActions}>
            {/* Yeniden Dene */}
            <TouchableOpacity style={styles.replayButton} onPress={onReplay} activeOpacity={0.8}>
                <Ionicons name="refresh" size={16} color="#24292f" />
                <Text style={styles.replayButtonText}>Tekrar</Text>
            </TouchableOpacity>

            {/* Analiz Yap */}
            <TouchableOpacity 
              style={[styles.analysisButton, isAnalyzing && styles.analysisButtonDisabled]} 
              onPress={onAnalyze} 
              activeOpacity={0.8}
              disabled={isAnalyzing}
            >
                {isAnalyzing ? (
                  <>
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text style={styles.analysisButtonText}>Analiz Ediliyor...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="sparkles" size={16} color="#ffffff" />
                    <Text style={styles.analysisButtonText}>Analiz Et</Text>
                  </>
                )}
            </TouchableOpacity>

            {/* Çık */}
            <TouchableOpacity style={styles.exitButton} onPress={onSaveAndExit} activeOpacity={0.8}>
                <Text style={styles.exitButtonText}>Çıkış</Text>
            </TouchableOpacity>
        </View>

        {/* AI Analysis Section - GitHub README Style */}
        {aiAnalysis && (
          <View style={styles.aiSection}>
            <View style={styles.aiHeader}>
              <Ionicons name="sparkles" size={20} color="#7d4cdb" />
              <Text style={styles.aiHeaderText}>AI Önerileri</Text>
            </View>

            {/* AI Feedback Box */}
            <View style={styles.aiFeedbackBox}>
              <Text style={styles.aiFeedbackTitle}>Genel Değerlendirme</Text>
              <Text style={styles.aiFeedbackText}>{aiAnalysis.aiFeedback}</Text>
            </View>

            {/* Word Mnemonics */}
            {aiAnalysis.wordAnalysis && aiAnalysis.wordAnalysis.length > 0 && (
              <View style={styles.mnemonicsSection}>
                <Text style={styles.mnemonicsTitle}>Örnek Cümleler</Text>
                {aiAnalysis.wordAnalysis.map((item, index) => (
                  <View key={index} style={styles.mnemonicCard}>
                    <View style={styles.mnemonicHeader}>
                      <Text style={styles.mnemonicWord}>{item.wordKey}</Text>
                      {item.difficultyLevel && (
                        <View style={[
                          styles.difficultyBadge,
                          { backgroundColor: item.difficultyLevel > 0.7 ? '#cf222e20' : item.difficultyLevel > 0.4 ? '#bf870020' : '#2da44e20' }
                        ]}>
                          <Text style={[
                            styles.difficultyText,
                            { color: item.difficultyLevel > 0.7 ? '#cf222e' : item.difficultyLevel > 0.4 ? '#bf8700' : '#2da44e' }
                          ]}>
                            {item.difficultyLevel > 0.7 ? 'Zor' : item.difficultyLevel > 0.4 ? 'Orta' : 'Kolay'}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.mnemonicTextContainer}>
                      {item.aiMnemonic.split(':::').map((sentence, idx) => (
                        <Text key={idx} style={styles.mnemonicText}>
                          {sentence.trim()}
                        </Text>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// Main Study Screen
export default function StudyFlashcardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [flashcard, setFlashcard] = useState<FlashcardDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cards, setCards] = useState<CardStatus[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [knownCards, setKnownCards] = useState<WordPair[]>([]);
  const [unknownCards, setUnknownCards] = useState<WordPair[]>([]);
  const [skippedCards, setSkippedCards] = useState<WordPair[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{
    aiFeedback: string;
    wordAnalysis: WordAnalysis[];
  } | null>(null);

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
      
      const initialCards: CardStatus[] = data.words.map((word, index) => ({
        word,
        index,
        status: 'pending',
      }));
      setCards(initialCards);
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

  // ✅ DÜZELTME 1: finishStudy artık bir index parametresi alıyor
  // Eğer bu parametre verilirse oradan itibaren keser, verilmezse (örn: manuel bitir butonunda) currentIndex'i kullanır.
  const finishStudy = (indexOverride?: number) => {
    const startIndex = indexOverride !== undefined ? indexOverride : currentIndex;
    
    // Kalan kartları hesapla
    const remaining = cards.slice(startIndex).map((c) => c.word);
    
    setSkippedCards((prev) => [...prev, ...remaining]);
    setShowResults(true);
  };

  const handleSwipeComplete = (direction: 'left' | 'right') => {
    if (currentIndex >= cards.length) return;

    const currentCard = cards[currentIndex];

    if (direction === 'right') {
      setKnownCards((prev) => [...prev, currentCard.word]);
    } else {
      setUnknownCards((prev) => [...prev, currentCard.word]);
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex >= cards.length) {
      // ✅ DÜZELTME 2: Tüm kartlar bittiğinde nextIndex'i (yani array boyutu kadar olan sayıyı) gönderiyoruz.
      // Böylece cards.slice(5) boş array dönecek ve fazladan kart eklenmeyecek.
      finishStudy(nextIndex);
    } else {
      setCurrentIndex(nextIndex);
    }
  };

  const handlePass = () => {
    if (currentIndex >= cards.length) return;

    const currentCard = cards[currentIndex];
    setSkippedCards((prev) => [...prev, currentCard.word]);

    const nextIndex = currentIndex + 1;
    if (nextIndex >= cards.length) {
      // ✅ DÜZELTME 3: Geçildiğinde de aynı şekilde sonraki index'i gönderiyoruz
      finishStudy(nextIndex);
    } else {
      setCurrentIndex(nextIndex);
    }
  };

  const handleFinish = () => {
    Alert.alert(
      'Çalışmayı Bitir',
      'Çalışmayı sonlandırmak istiyor musunuz? Kalan kartlar "Geçildi" olarak işaretlenecek.',
      [
        { text: 'İptal', style: 'cancel' },
        { 
            text: 'Bitir', 
            style: 'destructive', 
            // ✅ DÜZELTME 4: Manuel bitirildiğinde parametre vermiyoruz, böylece o an ekranda duran kartı da "skipped" sayıyor.
            onPress: () => finishStudy() 
        },
      ]
    );
  };

  const handleReplay = () => {
    setCurrentIndex(0);
    setKnownCards([]);
    setUnknownCards([]);
    setSkippedCards([]);
    setShowResults(false);
    setAiAnalysis(null);
  };

  const handleSaveAndExit = async () => {
    try {
      const sessionData: StudySessionData = {
        knownCount: knownCards.length,
        unknownCount: unknownCards.length,
        skippedCount: skippedCards.length,
      };

      await flashcardService.saveStudySession(id as string, sessionData);
      router.back();
    } catch (error: any) {
      console.error('Save session error:', error);
      Alert.alert('Uyarı', 'Oturum kaydedilemedi ama çıkış yapılıyor.');
      router.back();
    }
  };

  const handleAnalyze = async () => {
    if (isAnalyzing) return;

    try {
      setIsAnalyzing(true);

      const sessionData: StudySessionData = {
        knownCount: knownCards.length,
        unknownCount: unknownCards.length,
        skippedCount: skippedCards.length,
        unknownWords: unknownCards,
      };

      const result: AnalyzeStudySessionResponse = await flashcardService.analyzeStudySession(
        id as string,
        sessionData
      );

      console.log('=== Backend Response ===');
      console.log(JSON.stringify(result, null, 2));
      console.log('========================');

      if (result.aiAnalysis) {
        setAiAnalysis(result.aiAnalysis);
        Alert.alert(
          'Analiz Tamamlandı',
          'AI önerileri hazır! Aşağıda görüntüleyebilirsiniz.',
          [{ text: 'Tamam' }]
        );
      } else {
        Alert.alert(
          'Analiz Tamamlandı',
          'Oturum kaydedildi ancak AI analizi yapılamadı.',
          [{ text: 'Tamam' }]
        );
      }
    } catch (error: any) {
      console.error('Analysis error:', error);
      Alert.alert('Hata', error.message || 'Analiz sırasında bir hata oluştu.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0 || knownCards.length > 0 || unknownCards.length > 0) {
      Alert.alert(
        'Çıkmak İstediğinize Emin Misiniz?',
        'İlerlemeniz kaydedilmeyecek.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Çık', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  if (isLoading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0969da" />
            <Text style={styles.loadingText}>Yükleniyor...</Text>
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  if (!flashcard || cards.length === 0) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>Flashcard bulunamadı.</Text>
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  if (showResults) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.container} edges={['top']}>
          <ResultsView
            known={knownCards.length}
            unknown={unknownCards.length}
            skipped={skippedCards.length}
            total={cards.length}
            onReplay={handleReplay}
            onAnalyze={handleAnalyze}
            onSaveAndExit={handleSaveAndExit}
            aiAnalysis={aiAnalysis}
            isAnalyzing={isAnalyzing}
          />
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  const progress = currentIndex + 1;
  const total = cards.length;
  const remainingCards = cards.slice(currentIndex, Math.min(currentIndex + 2, cards.length));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#24292f" />
            </TouchableOpacity>

            <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
                {Math.min(progress, total)} / {total}
            </Text>
            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(Math.min(progress, total) / total) * 100}%` }]} />
            </View>
            </View>

            <TouchableOpacity onPress={handleFinish} style={styles.finishButton}>
            <Text style={styles.finishButtonText}>Bitir</Text>
            </TouchableOpacity>
        </View>

        {/* Card Stack */}
        <View style={styles.cardStackContainer}>
            {remainingCards.reverse().map((cardStatus, idx) => (
            <StudyCard
                key={`${cardStatus.index}-${currentIndex}`}
                word={cardStatus.word}
                index={cardStatus.index}
                totalCount={total}
                isTopCard={idx === remainingCards.length - 1}
                onSwipeComplete={handleSwipeComplete}
            />
            ))}
        </View>

        {/* Bottom Controls */}
        <View style={[
  styles.controls, 
  { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.swipeHint}>
            <Ionicons name="arrow-back" size={16} color="#cf222e" />
            <Text style={styles.swipeHintText}>Kaydır: Bilmiyorum</Text>
            </View>

            <TouchableOpacity style={styles.passButton} onPress={handlePass}>
            <Ionicons name="play-forward" size={20} color="#57606a" />
            <Text style={styles.passButtonText}>Geç</Text>
            </TouchableOpacity>

            <View style={styles.swipeHint}>
            <Text style={styles.swipeHintText}>Biliyorum: Kaydır</Text>
            <Ionicons name="arrow-forward" size={16} color="#2da44e" />
            </View>
        </View>
        </SafeAreaView>
    </GestureHandlerRootView>
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
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#cf222e', // GitHub Danger Red
    textAlign: 'center',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#d0d7de', // GitHub Border
    backgroundColor: '#f6f8fa', // GitHub Canvas Subtle
  },
  backButton: {
    padding: 4,
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  progressText: {
    fontSize: 12, // GitHub meta-text style
    fontWeight: '600',
    color: '#24292f',
    textAlign: 'center',
    marginBottom: 6,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#d0d7de',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0969da', // GitHub Accent Blue
  },
  finishButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6, // GitHub Standard Radius
    borderWidth: 1,
    borderColor: '#d0d7de',
    backgroundColor: '#ffffff', // Header f6f8fa olduğu için buton beyaz olmalı
    shadowColor: '#1b1f24',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 0,
    elevation: 1,
  },
  finishButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#24292f',
  },
  cardStackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#ffffff',
  },
  cardContainer: {
    position: 'absolute',
    width: SCREEN_WIDTH - 48,
    height: 450,
  },
  cardPressable: {
    flex: 1,
  },
  cardWrapper: {
    flex: 1,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 12, // Kartlar için biraz daha yumuşak ama yine GitHub havasında
    borderWidth: 1,
    borderColor: '#d0d7de',
    padding: 24,
    justifyContent: 'space-between',
    // GitHub tarzı hafif derinlikli gölge
    shadowColor: '#1b1f24',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
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
    backgroundColor: '#ddf4ff', // GitHub Blue Badge
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(9, 105, 218, 0.2)',
  },
  cardBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0969da',
  },
  cardBadgeBack: {
    backgroundColor: '#dafbe1', // GitHub Green Badge
    borderColor: 'rgba(26, 127, 55, 0.2)',
  },
  cardBadgeTextBack: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a7f37',
  },
  cardIndex: {
    fontSize: 13,
    fontWeight: '500',
    color: '#57606a',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  cardText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#24292f',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  cardHint: {
    fontSize: 12,
    color: '#57606a',
    fontWeight: '500',
  },
  swipeIndicator: {
    position: 'absolute',
    top: '40%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 20,
    borderRadius: 50,
    borderWidth: 2,
  },
  swipeIndicatorLeft: {
    left: 40,
    borderColor: '#cf222e',
  },
  swipeIndicatorRight: {
    right: 40,
    borderColor: '#2da44e',
  },
  swipeIndicatorText: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
    textTransform: 'uppercase',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#d0d7de',
    backgroundColor: '#f6f8fa',
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  swipeHintText: {
    fontSize: 12,
    color: '#57606a',
    fontWeight: '500',
  },
  passButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d0d7de', // GitHub sapsarı buton yerine gri borderlı beyaz buton kullanır
    backgroundColor: '#ffffff',
    shadowColor: '#1b1f24',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 0,
    elevation: 1,
  },
  passButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#24292f',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  resultsScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  resultsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d0d7de',
    padding: 24,
    shadowColor: '#1b1f24',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 4,
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  trophyBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff8c5', // GitHub Warning Light
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(154, 103, 0, 0.2)',
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#24292f',
    letterSpacing: -0.5,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: '#57606a',
    marginTop: 4,
  },
  statsSection: {
    marginBottom: 32,
    gap: 20,
  },
  statItem: {
    gap: 8,
  },
  statInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statLabelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#24292f',
  },
  statCountText: {
    fontSize: 13,
    color: '#57606a',
    fontFamily: 'monospace', // Kodlama hissi için
  },
  statBarContainer: {
    height: 8,
    backgroundColor: '#eff1f3',
    borderRadius: 4,
    overflow: 'hidden',
  },
  statBar: {
    height: '100%',
    borderRadius: 4,
  },
  resultsActions: {
    flexDirection: 'row',
    gap: 8, // GitHub daha dar gap kullanır
    marginTop: 8,
  },
  // Yeniden Dene (Secondary Style)
  replayButton: {
    flex: 1, // Üçü de eşit genişlikte başlasın
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#f6f8fa',
    borderWidth: 1,
    borderColor: '#d0d7de',
    paddingVertical: 10,
    borderRadius: 6,
    shadowColor: '#1b1f24',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 0,
    elevation: 1,
  },
  replayButtonText: {
    fontSize: 13, // Metinler sığsın diye biraz küçültüldü
    fontWeight: '600',
    color: '#24292f',
  },
  // Analiz Yap (Primary Blue Style)
  analysisButton: {
    flex: 1.2, // Analiz daha önemli olduğu için bir tık daha geniş
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#0969da',
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(27, 31, 36, 0.15)',
  },
  analysisButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  analysisButtonDisabled: {
    opacity: 0.6,
  },
  // Çık (Neutral Style)
  exitButton: {
    flex: 0.8, // Çıkış butonu daha dar olabilir
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d0d7de',
    paddingVertical: 10,
    borderRadius: 6,
  },
  exitButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#24292f',
  },
  // AI Analysis Styles
  aiSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#d0d7de',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  aiHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#24292f',
  },
  aiFeedbackBox: {
    backgroundColor: '#ddf4ff',
    borderWidth: 1,
    borderColor: '#54aeff',
    borderRadius: 6,
    padding: 16,
    marginBottom: 16,
  },
  aiFeedbackTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0969da',
    marginBottom: 8,
  },
  aiFeedbackText: {
    fontSize: 14,
    color: '#24292f',
    lineHeight: 20,
  },
  mnemonicsSection: {
    gap: 12,
  },
  mnemonicsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#24292f',
    marginBottom: 4,
  },
  mnemonicCard: {
    backgroundColor: '#f6f8fa',
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 6,
    padding: 12,
    gap: 8,
  },
  mnemonicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mnemonicWord: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0969da',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
  },
  mnemonicTextContainer: {
    gap: 6,
  },
  mnemonicText: {
    fontSize: 13,
    color: '#57606a',
    lineHeight: 18,
  },
});