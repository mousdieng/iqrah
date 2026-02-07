import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { RECITERS } from '../constants/reciters';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../constants/theme';
import { ReciterType } from '../types';

const SettingsScreen: React.FC = () => {
  const { state, dispatch } = useApp();

  const changeFontSize = (type: 'arabic' | 'translation', delta: number) => {
    if (type === 'arabic') {
      const newSize = Math.max(16, Math.min(40, state.preferences.arabicFontSize + delta));
      dispatch({ type: 'SET_ARABIC_FONT_SIZE', payload: newSize });
    } else {
      const newSize = Math.max(12, Math.min(24, state.preferences.translationFontSize + delta));
      dispatch({ type: 'SET_TRANSLATION_FONT_SIZE', payload: newSize });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[Colors.light.gradientStart, Colors.light.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>الإعدادات</Text>
        <Text style={styles.headerSubtitle}>⚙️</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🎙️</Text>
            <Text style={styles.sectionTitle}>القارئ</Text>
          </View>
          <View style={styles.section}>
            {Object.values(RECITERS).map((reciter, index) => (
              <TouchableOpacity
                key={reciter.id}
                style={[
                  styles.option,
                  state.preferences.reciter === reciter.id && styles.activeOption,
                  index === Object.values(RECITERS).length - 1 && styles.lastOption,
                ]}
                activeOpacity={0.7}
                onPress={() => dispatch({ type: 'SET_RECITER', payload: reciter.id as ReciterType })}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>{reciter.arabicName}</Text>
                  <Text style={styles.optionSubtitle}>{reciter.name}</Text>
                </View>
                {state.preferences.reciter === reciter.id && (
                  <View style={styles.checkmarkContainer}>
                    <Text style={styles.checkmark}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>👁️</Text>
            <Text style={styles.sectionTitle}>العرض</Text>
          </View>
          <View style={styles.section}>
            <View style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <Text style={styles.settingLabel}>إظهار التفسير</Text>
                <Text style={styles.settingDescription}>عرض تفسير الآيات</Text>
              </View>
              <Switch
                value={state.preferences.showTafsir}
                onValueChange={() => dispatch({ type: 'TOGGLE_TAFSIR' })}
                trackColor={{ false: Colors.light.borderLight, true: Colors.light.accent }}
                thumbColor={state.preferences.showTafsir ? Colors.light.primary : '#f4f3f4'}
              />
            </View>

            <View style={[styles.settingRow, styles.lastOption]}>
              <View style={styles.settingLabelContainer}>
                <Text style={styles.settingLabel}>إظهار الترجمة</Text>
                <Text style={styles.settingDescription}>عرض ترجمة الآيات</Text>
              </View>
              <Switch
                value={state.preferences.showTranslation}
                onValueChange={() => dispatch({ type: 'TOGGLE_TRANSLATION' })}
                trackColor={{ false: Colors.light.borderLight, true: Colors.light.accent }}
                thumbColor={state.preferences.showTranslation ? Colors.light.primary : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📏</Text>
            <Text style={styles.sectionTitle}>حجم الخط</Text>
          </View>
          <View style={styles.section}>
            <View style={styles.fontSizeRow}>
              <Text style={styles.settingLabel}>النص العربي</Text>
              <View style={styles.fontSizeControls}>
                <TouchableOpacity
                  style={styles.fontButton}
                  activeOpacity={0.7}
                  onPress={() => changeFontSize('arabic', -2)}
                >
                  <Text style={styles.fontButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.fontSizeValue}>{state.preferences.arabicFontSize}</Text>
                <TouchableOpacity
                  style={styles.fontButton}
                  activeOpacity={0.7}
                  onPress={() => changeFontSize('arabic', 2)}
                >
                  <Text style={styles.fontButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.fontSizeRow, styles.lastOption]}>
              <Text style={styles.settingLabel}>الترجمة</Text>
              <View style={styles.fontSizeControls}>
                <TouchableOpacity
                  style={styles.fontButton}
                  activeOpacity={0.7}
                  onPress={() => changeFontSize('translation', -2)}
                >
                  <Text style={styles.fontButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.fontSizeValue}>
                  {state.preferences.translationFontSize}
                </Text>
                <TouchableOpacity
                  style={styles.fontButton}
                  activeOpacity={0.7}
                  onPress={() => changeFontSize('translation', 2)}
                >
                  <Text style={styles.fontButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>ℹ️</Text>
            <Text style={styles.sectionTitle}>عن التطبيق</Text>
          </View>
          <View style={styles.aboutSection}>
            <LinearGradient
              colors={[Colors.light.accentLight, Colors.light.surface]}
              style={styles.aboutGradient}
            >
              <Text style={styles.aboutAppName}>إقراء</Text>
              <Text style={styles.aboutSubtitle}>تطبيق قراءة القرآن الكريم</Text>
              <Text style={styles.aboutVersion}>الإصدار 1.0.0</Text>
              <Text style={styles.aboutQuote}>
                اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ
              </Text>
            </LinearGradient>
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
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  section: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  activeOption: {
    backgroundColor: Colors.light.accent + '20',
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
  },
  optionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    color: Colors.light.text,
  },
  optionSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },
  checkmark: {
    fontSize: Typography.fontSize.xl,
    color: Colors.light.primary,
    fontWeight: '700',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  settingLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.light.text,
  },
  fontSizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  fontSizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fontButton: {
    width: 36,
    height: 36,
    backgroundColor: Colors.light.primary,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontButtonText: {
    fontSize: Typography.fontSize.lg,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  fontSizeValue: {
    fontSize: Typography.fontSize.md,
    color: Colors.light.text,
    marginHorizontal: Spacing.md,
    minWidth: 32,
    textAlign: 'center',
  },
  aboutText: {
    fontSize: Typography.fontSize.md,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginVertical: Spacing.xs,
  },
});

export default SettingsScreen;
