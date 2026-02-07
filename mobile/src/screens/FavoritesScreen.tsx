import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useApp } from '../context/AppContext';
import { Colors, Typography, Spacing } from '../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<'favorites' | 'memorized'>('favorites');

  const removeFavorite = (ayahNumber: number) => {
    dispatch({ type: 'REMOVE_FAVORITE', payload: ayahNumber });
  };

  const removeMemorized = (ayahNumber: number) => {
    dispatch({ type: 'REMOVE_MEMORIZED', payload: ayahNumber });
  };

  const renderAyahItem = ({ item }: { item: number }) => {
    const isFavorite = activeTab === 'favorites';

    return (
      <View style={styles.ayahCard}>
        <View style={styles.ayahInfo}>
          <Text style={styles.ayahNumber}>الآية {item}</Text>
          <Text style={styles.ayahPlaceholder}>سيتم عرض نص الآية هنا</Text>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() =>
            isFavorite ? removeFavorite(item) : removeMemorized(item)
          }
        >
          <Text style={styles.removeIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const currentList =
    activeTab === 'favorites' ? state.progress.favorites : state.progress.memorized;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {activeTab === 'favorites' ? 'المفضلة' : 'المحفوظات'}
        </Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
          onPress={() => setActiveTab('favorites')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'favorites' && styles.activeTabText,
            ]}
          >
            المفضلة ({state.progress.favorites.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'memorized' && styles.activeTab]}
          onPress={() => setActiveTab('memorized')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'memorized' && styles.activeTabText,
            ]}
          >
            المحفوظة ({state.progress.memorized.length})
          </Text>
        </TouchableOpacity>
      </View>

      {currentList.length > 0 ? (
        <FlatList
          data={currentList}
          renderItem={renderAyahItem}
          keyExtractor={(item) => item.toString()}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {activeTab === 'favorites'
              ? 'لا توجد آيات مفضلة'
              : 'لا توجد آيات محفوظة'}
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Surahs')}
          >
            <Text style={styles.browseButtonText}>تصفح السور</Text>
          </TouchableOpacity>
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
  header: {
    padding: Spacing.md,
    backgroundColor: Colors.light.surface,
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: '700',
    color: Colors.light.text,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surface,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.light.primary,
  },
  tabText: {
    fontSize: Typography.fontSize.md,
    color: Colors.light.textSecondary,
  },
  activeTabText: {
    color: Colors.light.primary,
    fontWeight: '700',
  },
  list: {
    padding: Spacing.md,
  },
  ayahCard: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surface,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  ayahInfo: {
    flex: 1,
  },
  ayahNumber: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  ayahPlaceholder: {
    fontSize: Typography.fontSize.md,
    color: Colors.light.textSecondary,
  },
  removeButton: {
    padding: Spacing.sm,
  },
  removeIcon: {
    fontSize: 24,
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
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  browseButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
  },
});

export default FavoritesScreen;
