# Setup Guide - إقراء Mobile App

## Quick Start

1. **Install Dependencies**
   ```bash
   cd mobile
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Run on Device/Emulator**
   - **Android**: Press `a` in the terminal or run `npm run android`
   - **iOS**: Press `i` in the terminal or run `npm run ios` (macOS only)
   - **Web**: Press `w` in the terminal or run `npm run web`

4. **Test on Physical Device**
   - Install "Expo Go" app from App Store or Play Store
   - Scan the QR code shown in terminal

## Project Structure

```
mobile/
├── src/
│   ├── components/        # Reusable components
│   │   └── AudioPlayer.tsx
│   ├── constants/         # App constants
│   │   ├── reciters.ts
│   │   └── theme.ts
│   ├── context/          # State management
│   │   └── AppContext.tsx
│   ├── navigation/       # Navigation setup
│   │   └── AppNavigator.tsx
│   ├── screens/          # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── SurahsScreen.tsx
│   │   ├── SurahScreen.tsx
│   │   ├── MushafScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   ├── FavoritesScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/         # API services
│   │   └── api.ts
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   └── utils/           # Utility functions
├── App.tsx              # Root component
├── app.json            # Expo configuration
└── package.json        # Dependencies

```

## Configuration

### Backend API

Update the API URL in `app.json`:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://your-backend-url:8080/api"
    }
  }
}
```

For local development on physical device, use your computer's IP address:
```json
"apiUrl": "http://192.168.1.XXX:8080/api"
```

### Available Reciters

The app includes 4 reciters by default (configured in `src/constants/reciters.ts`):
- Maher Al-Muaiqly (ماهر المعيقلي)
- Mahmoud Khalil Al-Husary (محمود خليل الحصري)
- Mohamed Siddiq Al-Minshawi (محمد صديق المنشاوي)
- Abdurrahman As-Sudais (عبد الرحمن السديس)

## Features Implementation

### ✅ Completed Features

1. **Navigation**
   - Bottom tabs (Home, Surahs, Favorites, Settings)
   - Stack navigation for reading screens
   - Modal screens for search

2. **State Management**
   - Global state with Context API + useReducer
   - AsyncStorage persistence
   - User preferences (reciter, font size, theme)
   - Progress tracking (favorites, memorized verses)

3. **Screens**
   - Home: Quick actions and statistics
   - Surahs List: Browsable list with search
   - Surah Reading: Verse-by-verse with audio
   - Mushaf: Page-based reading (604 pages)
   - Search: Full-text search
   - Favorites: Manage saved verses
   - Settings: Customize app preferences

4. **Audio Player**
   - Play/pause controls
   - Previous/next verse
   - Repeat count (1-10x)
   - Auto-play mode
   - Multiple reciters
   - Speed control support

5. **API Integration**
   - Axios service layer
   - Fallback mock data
   - Error handling

## Development Tips

### Debugging

1. **Enable Remote Debugging**
   - Shake device or press `Ctrl+M` (Android) / `Cmd+D` (iOS)
   - Select "Debug with Chrome"

2. **View Logs**
   ```bash
   npx react-native log-android
   # or
   npx react-native log-ios
   ```

3. **Clear Cache**
   ```bash
   npm start -- --clear
   ```

### Hot Reload

- The app supports Fast Refresh
- Changes to components update automatically
- For Context/Navigation changes, you may need to reload

### Testing on Different Devices

```bash
# Android
npm run android

# iOS (macOS only)
npm run ios

# Web browser
npm run web
```

## Common Issues

### Issue: Metro Bundler won't start
**Solution**:
```bash
npm start -- --reset-cache
```

### Issue: "Unable to resolve module"
**Solution**:
```bash
rm -rf node_modules
npm install
```

### Issue: Audio not playing
**Solution**:
- Check internet connection (audio streams from CDN)
- Verify API URL is correct
- Check device volume settings

### Issue: Can't connect to API
**Solution**:
- Verify backend is running
- Check API URL in `app.json`
- For physical device, use computer's IP address, not `localhost`

## Building for Production

### Android APK

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build APK
eas build --platform android --profile preview
```

### iOS IPA

```bash
# Build for iOS (requires Apple Developer account)
eas build --platform ios
```

## Next Steps

### Recommended Improvements

1. **Authentication**
   - Add user login/registration
   - Cloud sync for progress

2. **Enhanced Features**
   - Tafsir integration
   - Multiple translation languages
   - Bookmarks with notes
   - Reading goals and streaks

3. **UI/UX**
   - Dark theme
   - Custom fonts
   - Animations
   - Haptic feedback

4. **Performance**
   - Implement pagination
   - Cache images/audio
   - Optimize list rendering

5. **Offline Mode**
   - Download Surahs for offline reading
   - Cache audio files
   - Sync when online

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native](https://reactnative.dev/)
- [QuranicAudio.com](https://quranicaudio.com/) - Audio source
- [EveryAyah.com](https://everyayah.com/) - Individual verse audio

## Support

For issues or questions:
1. Check the README.md
2. Review this SETUP.md
3. Check Expo documentation
4. Open an issue in the repository

---

**May Allah accept this work and make it a means of benefit for all Muslims.**

اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ
