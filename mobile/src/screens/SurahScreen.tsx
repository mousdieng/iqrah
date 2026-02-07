import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList, SurahDetail, Ayah } from '../types';
import { quranApi } from '../services/api';
import { useApp } from '../context/AppContext';
import { Colors, Typography, Spacing } from '../constants/theme';
import AudioPlayer from '../components/AudioPlayer';

type SurahScreenRouteProp = RouteProp<RootStackParamList, 'Surah'>;

const SurahScreen: React.FC = () => {
  const route = useRoute<SurahScreenRouteProp>();
  const { surahNumber } = route.params;
  const { state, dispatch } = useApp();
  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSurah();
  }, [surahNumber]);

  const loadSurah = async () => {
    try {
      const data = await quranApi.getSurah(surahNumber);
      setSurah(data);
      // Update last read
      if (data.ayahs.length > 0) {
        dispatch({
          type: 'SET_LAST_READ',
          payload: {
            surah: surahNumber,
            ayah: 1,
            page: data.ayahs[0].page,
          },
        });
      }
    } catch (error) {
      console.error('Error loading surah:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (ayahNumber: number) => {
    if (state.progress.favorites.includes(ayahNumber)) {
      dispatch({ type: 'REMOVE_FAVORITE', payload: ayahNumber });
    } else {
      dispatch({ type: 'ADD_FAVORITE', payload: ayahNumber });
    }
  };

  const toggleMemorized = (ayahNumber: number) => {
    if (state.progress.memorized.includes(ayahNumber)) {
      dispatch({ type: 'REMOVE_MEMORIZED', payload: ayahNumber });
    } else {
      dispatch({ type: 'ADD_MEMORIZED', payload: ayahNumber });
    }
  };

  const renderAyah = (ayah: Ayah) => {
    const isFavorite = state.progress.favorites.includes(ayah.number);
    const isMemorized = state.progress.memorized.includes(ayah.number);

    return (
      <View key={ayah.number} style={styles.ayahContainer}>
        <View style={styles.ayahHeader}>
          <View style={styles.ayahNumberBadge}>
            <Text style={styles.ayahNumberText}>{ayah.numberInSurah}</Text>
          </View>
          <View style={styles.ayahActions}>
            <TouchableOpacity
              onPress={() => toggleMemorized(ayah.number)}
              style={styles.actionButton}
            >
              <Text style={styles.actionIcon}>{isMemorized ? '✅' : '📝'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => toggleFavorite(ayah.number)}
              style={styles.actionButton}
            >
              <Text style={styles.actionIcon}>{isFavorite ? '⭐' : '☆'}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[styles.ayahText, { fontSize: state.preferences.arabicFontSize }]}>
          {ayah.text}
        </Text>
        {state.preferences.showTranslation && (
          <Text
            style={[
              styles.translationText,
              { fontSize: state.preferences.translationFontSize },
            ]}
          >
            Translation placeholder...
          </Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (!surah) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>خطأ في تحميل السورة</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.surahName}>{surah.name}</Text>
        <Text style={styles.surahDetails}>
          {surah.englishName} • {surah.revelationType} • {surah.numberOfAyahs} آيات
        </Text>
      </View>

      {/* Bismillah */}
      {surahNumber !== 1 && surahNumber !== 9 && (
        <View style={styles.bismillahContainer}>
          <Text style={styles.bismillahText}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
        </View>
      )}

      {/* Ayahs */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {surah.ayahs.map(renderAyah)}
      </ScrollView>

      {/* Audio Player */}
      <AudioPlayer surahNumber={surahNumber} ayahs={surah.ayahs} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.light.error,
  },
  header: {
    padding: Spacing.md,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
  },
  surahName: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
  },
  surahDetails: {
    fontSize: Typography.fontSize.md,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  bismillahContainer: {
    padding: Spacing.lg,
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
  },
  bismillahText: {
    fontSize: Typography.fontSize.xxl,
    color: Colors.light.primary,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
  },
  ayahContainer: {
    backgroundColor: Colors.light.surface,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.md,
  },
  ayahHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  ayahNumberBadge: {
    backgroundColor: Colors.light.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ayahNumberText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
  },
  ayahActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: Spacing.sm,
  },
  actionIcon: {
    fontSize: 24,
  },
  ayahText: {
    textAlign: 'right',
    lineHeight: 40,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  translationText: {
    color: Colors.light.textSecondary,
    lineHeight: 24,
  },
});

export default SurahScreen;
