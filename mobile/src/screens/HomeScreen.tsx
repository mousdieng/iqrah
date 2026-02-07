import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useApp } from '../context/AppContext';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { state } = useApp();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={[Colors.light.gradientStart, Colors.light.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.appTitle}>إقراء</Text>
          <Text style={styles.appSubtitle}>اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ</Text>
        </LinearGradient>

        {/* Continue Reading */}
        {state.progress.lastRead && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('Surah', {
                surahNumber: state.progress.lastRead!.surah,
              })
            }
          >
            <LinearGradient
              colors={[Colors.light.primary, Colors.light.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.continueCard}
            >
              <View style={styles.continueCardContent}>
                <Text style={styles.continueIcon}>📚</Text>
                <View style={styles.continueTextContainer}>
                  <Text style={styles.cardTitle}>واصل القراءة</Text>
                  <Text style={styles.cardSubtitle}>
                    سورة {state.progress.lastRead.surah} - آية {state.progress.lastRead.ayah}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Quick Actions Grid */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Surahs')}
          >
            <LinearGradient
              colors={[Colors.light.accentLight, Colors.light.surface]}
              style={styles.actionCardGradient}
            >
              <Text style={styles.actionIcon}>📖</Text>
              <Text style={styles.actionTitle}>السور</Text>
              <Text style={styles.actionSubtitle}>114 سورة</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Mushaf', { page: 1 })}
          >
            <LinearGradient
              colors={[Colors.light.accentLight, Colors.light.surface]}
              style={styles.actionCardGradient}
            >
              <Text style={styles.actionIcon}>📃</Text>
              <Text style={styles.actionTitle}>المصحف</Text>
              <Text style={styles.actionSubtitle}>604 صفحة</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Search')}
          >
            <LinearGradient
              colors={[Colors.light.accentLight, Colors.light.surface]}
              style={styles.actionCardGradient}
            >
              <Text style={styles.actionIcon}>🔍</Text>
              <Text style={styles.actionTitle}>بحث</Text>
              <Text style={styles.actionSubtitle}>في القرآن</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Favorites')}
          >
            <LinearGradient
              colors={[Colors.light.accentLight, Colors.light.surface]}
              style={styles.actionCardGradient}
            >
              <Text style={styles.actionIcon}>⭐</Text>
              <Text style={styles.actionTitle}>المفضلة</Text>
              <Text style={styles.actionSubtitle}>
                {state.progress.favorites.length} آية
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>إحصائياتك</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statCircle}>
                <Text style={styles.statValue}>{state.progress.memorized.length}</Text>
              </View>
              <Text style={styles.statLabel}>محفوظة</Text>
            </View>
            <View style={styles.statItem}>
              <View style={styles.statCircle}>
                <Text style={styles.statValue}>{state.progress.favorites.length}</Text>
              </View>
              <Text style={styles.statLabel}>مفضلة</Text>
            </View>
            <View style={styles.statItem}>
              <View style={styles.statCircle}>
                <Text style={styles.statValue}>{state.progress.bookmarks.length}</Text>
              </View>
              <Text style={styles.statLabel}>علامات</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    paddingBottom: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    ...Shadow.lg,
  },
  appTitle: {
    fontSize: Typography.fontSize.huge,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: Spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appSubtitle: {
    fontSize: Typography.fontSize.lg,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.95,
    lineHeight: Typography.fontSize.lg * Typography.lineHeight.relaxed,
  },
  continueCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadow.md,
  },
  continueCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  continueIcon: {
    fontSize: 40,
    marginRight: Spacing.md,
  },
  continueTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
  },
  cardSubtitle: {
    fontSize: Typography.fontSize.md,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  actionCard: {
    width: '47%',
    marginHorizontal: '1.5%',
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadow.md,
  },
  actionCardGradient: {
    padding: Spacing.lg,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  actionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: Colors.light.surface,
    marginHorizontal: Spacing.md,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    ...Shadow.md,
  },
  statsTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statCircle: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    borderWidth: 3,
    borderColor: Colors.light.accent,
  },
  statValue: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  statLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },
});

export default HomeScreen;
