'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  Award,
  RotateCcw,
} from 'lucide-react';

interface ReadingSession {
  surahNumber: number;
  verseNumber: number;
  timestamp: number;
  duration: number; // in seconds
  mode: 'reading' | 'translation';
}

interface ReadingStats {
  totalSessions: number;
  totalTime: number; // in seconds
  surahsRead: number[];
  versesRead: number;
  averageSessionDuration: number;
  longestSession: number;
  currentStreak: number;
  bestStreak: number;
  lastSession: number;
}

interface ReadingProgressProps {
  currentSurah: number;
  currentVerse: number;
  totalVerses: number;
  mode: 'reading' | 'translation';
  sessionStartTime?: number;
}

// Default stats
const getDefaultStats = (): ReadingStats => ({
  totalSessions: 0,
  totalTime: 0,
  surahsRead: [],
  versesRead: 0,
  averageSessionDuration: 0,
  longestSession: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastSession: 0,
});

// Get reading stats from localStorage
const getReadingStats = (): ReadingStats => {
  if (typeof window === 'undefined') return getDefaultStats();

  const saved = localStorage.getItem('reading-stats');
  return saved ? { ...getDefaultStats(), ...JSON.parse(saved) } : getDefaultStats();
};

// Save reading stats to localStorage
const saveReadingStats = (stats: ReadingStats) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('reading-stats', JSON.stringify(stats));
};

// Get reading sessions from localStorage
const getReadingSessions = (): ReadingSession[] => {
  if (typeof window === 'undefined') return [];

  const saved = localStorage.getItem('reading-sessions');
  return saved ? JSON.parse(saved) : [];
};

// Save reading session
const saveReadingSession = (session: ReadingSession) => {
  if (typeof window === 'undefined') return;

  const sessions = getReadingSessions();
  sessions.push(session);

  // Keep only last 100 sessions
  const trimmed = sessions.slice(-100);
  localStorage.setItem('reading-sessions', JSON.stringify(trimmed));

  // Update stats
  updateReadingStats(session);
};

// Update reading stats
const updateReadingStats = (session: ReadingSession) => {
  const stats = getReadingStats();
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  // Update basic stats
  stats.totalSessions += 1;
  stats.totalTime += session.duration;
  stats.versesRead += 1;

  // Add surah to read list if not already there
  if (!stats.surahsRead.includes(session.surahNumber)) {
    stats.surahsRead.push(session.surahNumber);
  }

  // Update averages
  stats.averageSessionDuration = stats.totalTime / stats.totalSessions;

  // Update longest session
  if (session.duration > stats.longestSession) {
    stats.longestSession = session.duration;
  }

  // Update streaks
  const daysSinceLastSession = stats.lastSession ?
    Math.floor((now - stats.lastSession) / dayMs) : Infinity;

  if (daysSinceLastSession === 0) {
    // Same day, streak continues
  } else if (daysSinceLastSession === 1) {
    // Next day, increment streak
    stats.currentStreak += 1;
  } else if (daysSinceLastSession > 1) {
    // Gap in reading, reset streak
    stats.currentStreak = 1;
  }

  // Update best streak
  if (stats.currentStreak > stats.bestStreak) {
    stats.bestStreak = stats.currentStreak;
  }

  stats.lastSession = now;

  saveReadingStats(stats);
};

// Format time duration
const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

export default function ReadingProgress({
  currentSurah,
  currentVerse,
  totalVerses,
  mode,
  sessionStartTime
}: ReadingProgressProps) {
  const [stats, setStats] = useState<ReadingStats>(getDefaultStats());
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Load stats on mount
  useEffect(() => {
    setStats(getReadingStats());
  }, []);

  // Track session duration
  useEffect(() => {
    if (!sessionStartTime) return;

    const interval = setInterval(() => {
      const duration = (Date.now() - sessionStartTime) / 1000;
      setSessionDuration(duration);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Save session when component unmounts or verse changes
  useEffect(() => {
    return () => {
      if (sessionStartTime && sessionDuration > 5) { // Only save sessions longer than 5 seconds
        const session: ReadingSession = {
          surahNumber: currentSurah,
          verseNumber: currentVerse,
          timestamp: Date.now(),
          duration: sessionDuration,
          mode,
        };
        saveReadingSession(session);
      }
    };
  }, [currentSurah, currentVerse, sessionDuration, mode, sessionStartTime]);

  const progressPercentage = totalVerses > 0 ? ((currentVerse + 1) / totalVerses) * 100 : 0;
  const surahProgress = (stats.surahsRead.length / 114) * 100;

  const achievements = [
    {
      id: 'first-read',
      title: 'First Steps',
      description: 'Complete your first reading session',
      icon: BookOpen,
      achieved: stats.totalSessions > 0,
      progress: Math.min(stats.totalSessions, 1),
      target: 1,
    },
    {
      id: 'streak-7',
      title: 'Consistent Reader',
      description: 'Read for 7 consecutive days',
      icon: Calendar,
      achieved: stats.bestStreak >= 7,
      progress: Math.min(stats.currentStreak, 7),
      target: 7,
    },
    {
      id: 'time-1h',
      title: 'Hour of Knowledge',
      description: 'Spend 1 hour total reading',
      icon: Clock,
      achieved: stats.totalTime >= 3600,
      progress: Math.min(stats.totalTime, 3600),
      target: 3600,
    },
    {
      id: 'surahs-10',
      title: 'Explorer',
      description: 'Read from 10 different surahs',
      icon: Target,
      achieved: stats.surahsRead.length >= 10,
      progress: Math.min(stats.surahsRead.length, 10),
      target: 10,
    },
  ];

  const resetStats = () => {
    if (confirm('Are you sure you want to reset all reading statistics? This cannot be undone.')) {
      const defaultStats = getDefaultStats();
      setStats(defaultStats);
      saveReadingStats(defaultStats);
      localStorage.removeItem('reading-sessions');
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <h3 className="font-semibold">Reading Progress</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Less' : 'More'}
            </Button>
          </div>

          {/* Current Session */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current Surah Progress</span>
              <span className="font-medium">
                {currentVerse + 1} / {totalVerses} verses
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{Math.round(progressPercentage)}% complete</span>
              {sessionStartTime && (
                <span>Session: {formatDuration(sessionDuration)}</span>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-600">
                {stats.surahsRead.length}
              </div>
              <div className="text-xs text-muted-foreground">Surahs Read</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {stats.currentStreak}
              </div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
          </div>

          {isExpanded && (
            <>
              {/* Detailed Stats */}
              <div className="space-y-3 border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Sessions:</span>
                    <span className="ml-2 font-medium">{stats.totalSessions}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Time:</span>
                    <span className="ml-2 font-medium">{formatDuration(stats.totalTime)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Verses Read:</span>
                    <span className="ml-2 font-medium">{stats.versesRead}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Best Streak:</span>
                    <span className="ml-2 font-medium">{stats.bestStreak} days</span>
                  </div>
                </div>

                {/* Quran Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Quran Exploration</span>
                    <span className="font-medium">
                      {stats.surahsRead.length} / 114 surahs
                    </span>
                  </div>
                  <Progress value={surahProgress} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {Math.round(surahProgress)}% of the Quran explored
                  </div>
                </div>

                {/* Achievements */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Achievements
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {achievements.map((achievement) => {
                      const Icon = achievement.icon;
                      const progressPercent = (achievement.progress / achievement.target) * 100;

                      return (
                        <div
                          key={achievement.id}
                          className={`p-2 rounded border ${
                            achievement.achieved
                              ? 'bg-emerald-50 border-emerald-200'
                              : 'bg-muted/50'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <Icon className={`h-4 w-4 mt-0.5 ${
                              achievement.achieved
                                ? 'text-emerald-600'
                                : 'text-muted-foreground'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  {achievement.title}
                                </span>
                                {achievement.achieved && (
                                  <Badge variant="secondary" className="text-xs">
                                    ✓
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {achievement.description}
                              </div>
                              {!achievement.achieved && (
                                <div className="mt-1">
                                  <Progress value={progressPercent} className="h-1" />
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {achievement.progress} / {achievement.target}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reset Button */}
                <div className="border-t pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetStats}
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset Statistics
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}