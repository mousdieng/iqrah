import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAudioPlayer, AudioSource } from 'expo-audio';
import { Ayah } from '../types';
import { useApp } from '../context/AppContext';
import { AUDIO_URLS } from '../constants/reciters';
import { Colors, Typography, Spacing } from '../constants/theme';

interface AudioPlayerProps {
  surahNumber: number;
  ayahs: Ayah[];
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ surahNumber, ayahs }) => {
  const { state, dispatch } = useApp();
  const player = useAudioPlayer();
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRepeat, setCurrentRepeat] = useState(1);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (player) {
        player.remove();
      }
    };
  }, []);

  useEffect(() => {
    // Update playing state based on player status
    if (player && player.playing !== isPlaying) {
      setIsPlaying(player.playing);
    }
  }, [player?.playing]);

  const playAyah = async (ayahIndex: number, repeat: number = 1) => {
    try {
      const ayah = ayahs[ayahIndex];
      const audioUrl = AUDIO_URLS.ayah(
        state.preferences.reciter,
        surahNumber,
        ayah.numberInSurah
      );

      // Replace current audio
      player.replace({ uri: audioUrl } as AudioSource);

      setCurrentAyahIndex(ayahIndex);
      setCurrentRepeat(repeat);
      setIsPlaying(true);

      dispatch({
        type: 'SET_AUDIO_STATE',
        payload: {
          isPlaying: true,
          currentAyah: ayah.number,
          currentSurah: surahNumber,
        },
      });

      // Monitor playback to handle repeat and auto-play
      const checkPlaybackEnd = setInterval(() => {
        if (player && !player.playing && player.duration > 0 && player.currentTime >= player.duration - 0.1) {
          clearInterval(checkPlaybackEnd);

          // Check if we need to repeat
          if (currentRepeat < state.audio.repeatCount) {
            playAyah(ayahIndex, repeat + 1);
          } else if (state.audio.autoPlay && ayahIndex < ayahs.length - 1) {
            // Move to next ayah
            playAyah(ayahIndex + 1, 1);
          } else {
            setIsPlaying(false);
            dispatch({
              type: 'SET_AUDIO_STATE',
              payload: { isPlaying: false },
            });
          }
        }
      }, 500);

    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    }
  };

  const togglePlayPause = () => {
    if (!player || !player.src) {
      playAyah(currentAyahIndex, 1);
      return;
    }

    if (player.playing) {
      player.pause();
      setIsPlaying(false);
      dispatch({
        type: 'SET_AUDIO_STATE',
        payload: { isPlaying: false },
      });
    } else {
      player.play();
      setIsPlaying(true);
      dispatch({
        type: 'SET_AUDIO_STATE',
        payload: { isPlaying: true },
      });
    }
  };

  const playNext = () => {
    if (currentAyahIndex < ayahs.length - 1) {
      playAyah(currentAyahIndex + 1, 1);
    }
  };

  const playPrevious = () => {
    if (currentAyahIndex > 0) {
      playAyah(currentAyahIndex - 1, 1);
    }
  };

  const changeRepeatCount = () => {
    const newCount = state.audio.repeatCount >= 10 ? 1 : state.audio.repeatCount + 1;
    dispatch({
      type: 'SET_AUDIO_STATE',
      payload: { repeatCount: newCount },
    });
  };

  const toggleAutoPlay = () => {
    dispatch({
      type: 'SET_AUDIO_STATE',
      payload: { autoPlay: !state.audio.autoPlay },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={playPrevious}>
          <Text style={styles.controlIcon}>⏮</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
          <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶️'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={playNext}>
          <Text style={styles.controlIcon}>⏭</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoText}>
          الآية {currentAyahIndex + 1} من {ayahs.length}
        </Text>
      </View>

      <View style={styles.optionsRow}>
        <TouchableOpacity style={styles.optionButton} onPress={changeRepeatCount}>
          <Text style={styles.optionText}>تكرار: {state.audio.repeatCount}x</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton} onPress={toggleAutoPlay}>
          <Text style={styles.optionText}>
            {state.audio.autoPlay ? '⏯ تشغيل تلقائي' : '⏸ إيقاف تلقائي'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.surface,
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  controlButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: Spacing.sm,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
  },
  controlIcon: {
    fontSize: 28,
  },
  playIcon: {
    fontSize: 32,
  },
  infoRow: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: Typography.fontSize.md,
    color: Colors.light.textSecondary,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  optionButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.accent,
    borderRadius: 8,
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
  },
});

export default AudioPlayer;
