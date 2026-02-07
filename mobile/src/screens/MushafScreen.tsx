import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList, MushafPage } from '../types';
import { quranApi } from '../services/api';
import { useApp } from '../context/AppContext';
import { Colors, Typography, Spacing } from '../constants/theme';

type MushafScreenRouteProp = RouteProp<RootStackParamList, 'Mushaf'>;

const MushafScreen: React.FC = () => {
  const route = useRoute<MushafScreenRouteProp>();
  const navigation = useNavigation();
  const { state } = useApp();
  const [currentPage, setCurrentPage] = useState(route.params?.page || 1);
  const [pageData, setPageData] = useState<MushafPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageInput, setPageInput] = useState(currentPage.toString());

  useEffect(() => {
    loadPage(currentPage);
  }, [currentPage]);

  const loadPage = async (pageNum: number) => {
    setLoading(true);
    try {
      const data = await quranApi.getMushafPage(pageNum);
      setPageData(data);
    } catch (error) {
      console.error('Error loading page:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= 604) {
      setCurrentPage(page);
      setPageInput(page.toString());
    }
  };

  const handlePageInputSubmit = () => {
    const page = parseInt(pageInput);
    if (!isNaN(page)) {
      goToPage(page);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Page Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <Text style={styles.navButtonText}>←</Text>
        </TouchableOpacity>

        <View style={styles.pageInfo}>
          <Text style={styles.pageNumber}>صفحة {currentPage}</Text>
          {pageData && (
            <Text style={styles.pageDetails}>
              {pageData.surahName} • جزء {pageData.juz}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => goToPage(currentPage + 1)}
          disabled={currentPage === 604}
        >
          <Text style={styles.navButtonText}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Jump to Page */}
      <View style={styles.jumpContainer}>
        <TextInput
          style={styles.pageInput}
          value={pageInput}
          onChangeText={setPageInput}
          keyboardType="numeric"
          placeholder="رقم الصفحة"
          placeholderTextColor={Colors.light.textSecondary}
        />
        <TouchableOpacity style={styles.jumpButton} onPress={handlePageInputSubmit}>
          <Text style={styles.jumpButtonText}>انتقل</Text>
        </TouchableOpacity>
      </View>

      {/* Page Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {pageData && pageData.ayahs.length > 0 ? (
          <View style={styles.pageContainer}>
            {pageData.ayahs.map((ayah) => (
              <Text
                key={ayah.number}
                style={[styles.ayahText, { fontSize: state.preferences.arabicFontSize }]}
              >
                {ayah.text} ﴿{ayah.numberInSurah}﴾{' '}
              </Text>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>لا توجد بيانات لهذه الصفحة</Text>
          </View>
        )}
      </ScrollView>

      {/* Quick Navigation */}
      <View style={styles.quickNav}>
        <TouchableOpacity style={styles.quickNavButton} onPress={() => goToPage(1)}>
          <Text style={styles.quickNavText}>البداية</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickNavButton}
          onPress={() => goToPage(Math.max(1, currentPage - 10))}
        >
          <Text style={styles.quickNavText}>-10</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickNavButton}
          onPress={() => goToPage(Math.min(604, currentPage + 10))}
        >
          <Text style={styles.quickNavText}>+10</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickNavButton} onPress={() => goToPage(604)}>
          <Text style={styles.quickNavText}>النهاية</Text>
        </TouchableOpacity>
      </View>
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
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  navButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    borderRadius: 24,
  },
  navButtonText: {
    fontSize: Typography.fontSize.xl,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  pageInfo: {
    alignItems: 'center',
  },
  pageNumber: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.light.text,
  },
  pageDetails: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  jumpContainer: {
    flexDirection: 'row',
    padding: Spacing.md,
    backgroundColor: Colors.light.surface,
  },
  pageInput: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: Spacing.md,
    borderRadius: 8,
    fontSize: Typography.fontSize.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginRight: Spacing.sm,
  },
  jumpButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    justifyContent: 'center',
  },
  jumpButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
  },
  pageContainer: {
    backgroundColor: Colors.light.surface,
    padding: Spacing.lg,
    borderRadius: 12,
    minHeight: 500,
  },
  ayahText: {
    textAlign: 'right',
    lineHeight: 50,
    color: Colors.light.text,
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.light.textSecondary,
  },
  quickNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: Spacing.md,
    backgroundColor: Colors.light.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  quickNavButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.accent,
    borderRadius: 8,
  },
  quickNavText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
  },
});

export default MushafScreen;
