import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, FlatList, ActivityIndicator, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useLanguage } from '../_layout';
import { flashcardService, FlashcardDTO } from '@/services/flashcardService';

type LayoutMode = 'list' | 'grid';

export default function FlashcardScreen() {
  const router = useRouter();
  const { selectedLanguage } = useLanguage();
  const [sets, setSets] = useState<FlashcardDTO[]>([]);
  const [filteredSets, setFilteredSets] = useState<FlashcardDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('list');

  const fetchFlashcardSets = React.useCallback(async () => {
    if (!selectedLanguage) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await flashcardService.getFlashcardsByLanguage(selectedLanguage.id);
      setSets(data);
      setFilteredSets(data);
    } catch (error: any) {
      console.error("Setler yüklenemedi:", error);
      Alert.alert('Hata', error.message || 'Flashcardlar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [selectedLanguage]);

  useEffect(() => {
    fetchFlashcardSets();
  }, [fetchFlashcardSets]);

  // Refresh list when screen comes into focus (after creating/editing flashcard)
  useFocusEffect(
    React.useCallback(() => {
      fetchFlashcardSets();
    }, [fetchFlashcardSets])
  );

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSets(sets);
    } else {
      const filtered = sets.filter((set) =>
        set.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        set.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSets(filtered);
    }
  }, [searchQuery, sets]);

  const handleDelete = async (id: string, title: string) => {
    Alert.alert(
      'Flashcard Sil',
      `"${title}" başlıklı flashcard silinecek. Emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await flashcardService.deleteFlashcard(id);
              Alert.alert('Başarılı', 'Flashcard silindi.');
              fetchFlashcardSets();
            } catch (error: any) {
              Alert.alert('Hata', error.message || 'Flashcard silinemedi.');
            }
          },
        },
      ]
    );
  };

  const renderListItem = ({ item }: { item: FlashcardDTO }) => (
    <View style={styles.listCard}>
      <View style={styles.listCardContent}>
        <Text style={styles.listCardTitle}>{item.title}</Text>
        {item.description && (
          <Text style={styles.listCardDescription} numberOfLines={1}>
            {item.description}
          </Text>
        )}
        <View style={styles.listCardMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="list" size={12} color="#57606a" />
            <Text style={styles.metaText}>{item.words.length} kelime</Text>
          </View>
          <Text style={styles.metaDivider}>•</Text>
          <Text style={styles.metaText}>{new Date(item.updatedAt).toLocaleDateString()}</Text>
        </View>
      </View>

      <View style={styles.listCardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push({ pathname: '/flashcard/play', params: { id: item.id } })}
        >
          <Ionicons name="play-circle-outline" size={20} color="#2da44e" />
          <Text style={styles.actionButtonText}>Oyna</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push({ pathname: '/flashcard/edit', params: { id: item.id } })}
        >
          <Ionicons name="create-outline" size={20} color="#0969da" />
          <Text style={styles.actionButtonText}>Düzenle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item.id, item.title)}
        >
          <Ionicons name="trash-outline" size={20} color="#cf222e" />
          <Text style={[styles.actionButtonText, { color: '#cf222e' }]}>Sil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderGridItem = ({ item }: { item: FlashcardDTO }) => (
    <View style={styles.gridCard}>
      <View style={styles.gridCardHeader}>
        <Text style={styles.gridCardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.gridCardBadge}>
          <Text style={styles.gridCardBadgeText}>{item.words.length}</Text>
        </View>
      </View>

      {item.description && (
        <Text style={styles.gridCardDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <View style={styles.gridCardActions}>
        <TouchableOpacity
          style={styles.gridActionButton}
          onPress={() => router.push({ pathname: '/flashcard/play', params: { id: item.id } })}
        >
          <Ionicons name="play-circle-outline" size={24} color="#2da44e" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridActionButton}
          onPress={() => router.push({ pathname: '/flashcard/edit', params: { id: item.id } })}
        >
          <Ionicons name="create-outline" size={24} color="#0969da" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridActionButton}
          onPress={() => handleDelete(item.id, item.title)}
        >
          <Ionicons name="trash-outline" size={24} color="#cf222e" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Flashcards</Text>
        
        <TouchableOpacity 
          style={styles.actionButtonPrimary}
          onPress={() => router.push('/flashcard/create')}
        >
          <Ionicons name="add" size={20} color="#ffffff" />
          <Text style={styles.actionButtonPrimaryText}>Yeni</Text>
        </TouchableOpacity>
      </View>

      {/* Search and Layout Controls */}
      <View style={styles.controls}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={16} color="#57606a" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Flashcard ara..."
            placeholderTextColor="#8c959f"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#8c959f" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.layoutButtons}>
          <TouchableOpacity
            style={[styles.layoutButton, layoutMode === 'list' && styles.layoutButtonActive]}
            onPress={() => setLayoutMode('list')}
          >
            <Ionicons name="list" size={18} color={layoutMode === 'list' ? '#0969da' : '#57606a'} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.layoutButton, layoutMode === 'grid' && styles.layoutButtonActive]}
            onPress={() => setLayoutMode('grid')}
          >
            <Ionicons name="grid" size={18} color={layoutMode === 'grid' ? '#0969da' : '#57606a'} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#0969da" />
        </View>
      ) : (
        <FlatList
          data={filteredSets}
          keyExtractor={(item) => item.id}
          renderItem={layoutMode === 'list' ? renderListItem : renderGridItem}
          numColumns={layoutMode === 'grid' ? 2 : 1}
          key={layoutMode}
          contentContainerStyle={layoutMode === 'grid' ? styles.gridContent : styles.listContent}
          columnWrapperStyle={layoutMode === 'grid' ? styles.gridRow : undefined}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="layers-outline" size={48} color="#afb8c1" />
              <Text style={styles.emptyStateTitle}>
                {searchQuery ? 'Sonuç bulunamadı' : 'Henüz kart eklenmemiş'}
              </Text>
              <Text style={styles.emptyStateSubtitle}>
                {searchQuery
                  ? `"${searchQuery}" için bir sonuç bulunamadı.`
                  : `${selectedLanguage?.name || 'Seçili dil'} için yeni kelime setleri oluşturarak çalışmaya başla.`}
              </Text>
              {!searchQuery && (
                <TouchableOpacity 
                  style={styles.linkButton}
                  onPress={() => router.push('/flashcard/create')}
                >
                  <Text style={styles.linkButtonText}>İlk setini oluştur</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#d0d7de',
    backgroundColor: '#f6f8fa',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#24292f',
  },
  actionButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2da44e',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(27,31,36,0.15)',
    gap: 4,
  },
  actionButtonPrimaryText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#d0d7de',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f8fa',
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#24292f',
    padding: 0,
  },
  layoutButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  layoutButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f6f8fa',
    borderWidth: 1,
    borderColor: '#d0d7de',
  },
  layoutButtonActive: {
    backgroundColor: '#ddf4ff',
    borderColor: '#54aeff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  gridContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  gridRow: {
    gap: 12,
  },
  // List Layout Styles
  listCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  listCardContent: {
    marginBottom: 12,
  },
  listCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#24292f',
    marginBottom: 4,
  },
  listCardDescription: {
    fontSize: 13,
    color: '#57606a',
    marginBottom: 8,
  },
  listCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 12,
    color: '#57606a',
  },
  metaDivider: {
    color: '#afb8c1',
  },
  listCardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 6,
    backgroundColor: '#f6f8fa',
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#24292f',
  },
  // Grid Layout Styles
  gridCard: {
    width: '48%', // Ensures 2 columns with proper spacing
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  gridCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  gridCardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#24292f',
    marginRight: 8,
  },
  gridCardBadge: {
    backgroundColor: '#ddf4ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  gridCardBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0969da',
  },
  gridCardDescription: {
    fontSize: 12,
    color: '#57606a',
    marginBottom: 12,
  },
  gridCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#d0d7de',
  },
  gridActionButton: {
    padding: 8,
  },
  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 120,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#24292f',
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#57606a',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  linkButton: {
    marginTop: 16,
  },
  linkButtonText: {
    color: '#0969da',
    fontSize: 14,
    fontWeight: '600',
  },
});