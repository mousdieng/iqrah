import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Surah } from '../types';
import { quranApi } from '../services/api';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SurahsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSurahs();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSurahs(surahs);
    } else {
      const filtered = surahs.filter(
        (surah) =>
          surah.name.includes(searchQuery) ||
          surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          surah.number.toString().includes(searchQuery)
      );
      setFilteredSurahs(filtered);
    }
  }, [searchQuery, surahs]);

  const loadSurahs = async () => {
    try {
      const data = await quranApi.getSurahs();
      setSurahs(data);
      setFilteredSurahs(data);
    } catch (error) {
      console.error('Error loading surahs:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSurahItem = ({ item }: { item: Surah }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigation.navigate('Surah', { surahNumber: item.number })}
    >
      <View style={styles.surahCard}>
        <LinearGradient
          colors={[Colors.light.gradientStart, Colors.light.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.surahNumber}
        >
          <Text style={styles.surahNumberText}>{item.number}</Text>
        </LinearGradient>
        <View style={styles.surahInfo}>
          <Text style={styles.surahName}>{item.name}</Text>
          <Text style={styles.surahEnglishName}>{item.englishName}</Text>
          <View style={styles.surahDetailsRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.revelationType}</Text>
            </View>
            <Text style={styles.surahDetails}>{item.numberOfAyahs} آيات</Text>
          </View>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[Colors.light.gradientStart, Colors.light.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.title}>السور</Text>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث عن سورة..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.light.textTertiary}
          />
        </View>
      </LinearGradient>
      <FlatList
        data={filteredSurahs}
        renderItem={renderSurahItem}
        keyExtractor={(item) => item.number.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
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
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    ...Shadow.lg,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: Spacing.lg,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    ...Shadow.sm,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    padding: Spacing.md,
    fontSize: Typography.fontSize.md,
    color: Colors.light.text,
  },
  list: {
    padding: Spacing.md,
    paddingTop: Spacing.lg,
  },
  surahCard: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    alignItems: 'center',
    ...Shadow.md,
  },
  surahNumber: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  surahNumberText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
  },
  surahInfo: {
    flex: 1,
  },
  surahName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  surahEnglishName: {
    fontSize: Typography.fontSize.md,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.sm,
  },
  surahDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: Colors.light.accentLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
  },
  badgeText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.accent,
    fontWeight: '700',
  },
  surahDetails: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  chevron: {
    fontSize: 32,
    color: Colors.light.textTertiary,
    marginLeft: Spacing.sm,
  },
});

export default SurahsScreen;
