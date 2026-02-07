import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, SearchResult } from '../types';
import { quranApi } from '../services/api';
import { Colors, Typography, Spacing } from '../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (query.trim().length < 2) {
      return;
    }

    setLoading(true);
    try {
      const data = await quranApi.searchAyahs(query);
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() => navigation.navigate('Surah', { surahNumber: item.surah })}
    >
      <View style={styles.resultHeader}>
        <Text style={styles.resultSurah}>
          سورة {item.surah} - آية {item.ayah}
        </Text>
      </View>
      <Text style={styles.resultText}>{item.text}</Text>
      {item.translation && (
        <Text style={styles.resultTranslation}>{item.translation}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="ابحث في القرآن الكريم..."
          placeholderTextColor={Colors.light.textSecondary}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>بحث</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderResult}
          keyExtractor={(item, index) => `${item.surah}-${item.ayah}-${index}`}
          contentContainerStyle={styles.list}
        />
      ) : query.length > 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>لم يتم العثور على نتائج</Text>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>ابدأ البحث في القرآن الكريم</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: Spacing.md,
    backgroundColor: Colors.light.surface,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: Spacing.md,
    borderRadius: 8,
    fontSize: Typography.fontSize.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginRight: Spacing.sm,
  },
  searchButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  list: {
    padding: Spacing.md,
  },
  resultCard: {
    backgroundColor: Colors.light.surface,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  resultHeader: {
    marginBottom: Spacing.sm,
  },
  resultSurah: {
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  resultText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.light.text,
    textAlign: 'right',
    lineHeight: 32,
    marginBottom: Spacing.sm,
  },
  resultTranslation: {
    fontSize: Typography.fontSize.md,
    color: Colors.light.textSecondary,
    lineHeight: 24,
  },
});

export default SearchScreen;
