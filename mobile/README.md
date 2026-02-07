# إقراء (Iqrah) - React Native Mobile App

A beautiful Quran reading application built with React Native and Expo.

## Features

- **📖 Surah Reading**: Read all 114 Surahs with beautiful Arabic typography
- **📃 Mushaf Mode**: Page-based reading (604 pages) just like a physical Mushaf
- **🎵 Audio Playback**:
  - Multiple reciters (Maher Al-Muaiqly, Husary, Minshawi, Sudais)
  - Verse repetition (1-10x)
  - Auto-play functionality
  - Playback speed control
- **⭐ Favorites**: Mark and save your favorite verses
- **📝 Memorization Tracking**: Track verses you've memorized
- **🔍 Search**: Search through the entire Quran
- **⚙️ Settings**:
  - Choose your preferred reciter
  - Adjust font sizes
  - Toggle translation and tafsir display
  - Theme customization

## Tech Stack

- **React Native** with **Expo**
- **TypeScript** for type safety
- **React Navigation** for navigation
- **Context API** + **useReducer** for state management
- **Axios** for API calls
- **AsyncStorage** for local data persistence
- **Expo AV** for audio playback

## Project Structure

```
src/
├── types/              # TypeScript type definitions
├── services/           # API service layer
├── context/            # Global state management
├── screens/            # All screen components
│   ├── HomeScreen.tsx
│   ├── SurahsScreen.tsx
│   ├── SurahScreen.tsx
│   ├── MushafScreen.tsx
│   ├── SearchScreen.tsx
│   ├── FavoritesScreen.tsx
│   └── SettingsScreen.tsx
├── components/         # Reusable components
│   └── AudioPlayer.tsx
├── navigation/         # Navigation configuration
├── constants/          # Constants and theme
└── utils/             # Utility functions
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- Expo Go app (for testing on physical device)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on your device:
   - Scan the QR code with Expo Go app (Android)
   - Scan the QR code with Camera app (iOS)

Or run on emulator:
```bash
npm run android  # For Android
npm run ios      # For iOS (macOS only)
```

## Configuration

### API Endpoint

Update the API URL in `app.json`:
```json
"extra": {
  "apiUrl": "http://your-api-url:8080/api"
}
```

### Audio Sources

The app uses two audio sources:
- **QuranicAudio.com**: For full Surah audio
- **EveryAyah.com**: For individual verse audio

These are configured in `src/constants/reciters.ts`

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Run in web browser

## Features in Detail

### 1. Home Screen
- Quick access to continue reading
- Navigation to Surahs and Mushaf
- Statistics on favorites and memorized verses

### 2. Surahs List
- All 114 Surahs with details
- Search functionality
- Filter by Meccan/Medinan

### 3. Surah Reading
- Beautiful Arabic text
- Verse-by-verse navigation
- Mark verses as favorite or memorized
- Integrated audio player

### 4. Mushaf Mode
- Traditional page-based reading
- 604 pages
- Quick navigation (±10 pages)
- Jump to specific page

### 5. Audio Player
- Play/pause controls
- Previous/next verse
- Repeat count (1-10x)
- Auto-play mode
- Multiple reciters

### 6. Search
- Search across all verses
- Highlight matching text
- Navigate to results

### 7. Favorites & Memorization
- Save favorite verses
- Track memorized verses
- Easy management

### 8. Settings
- Choose reciter
- Adjust font sizes
- Toggle translation/tafsir
- Theme customization

## State Management

The app uses Context API with useReducer for global state management:

- **Preferences**: Reciter, font sizes, display options, theme
- **Progress**: Favorites, memorized verses, last read position, bookmarks
- **Audio**: Current playback state, repeat count, speed

All state is persisted to AsyncStorage for offline access.

## Offline Support

- State persistence with AsyncStorage
- Cached Surah data
- Fallback mock data when API is unavailable

## Future Enhancements

- [ ] Full authentication system
- [ ] Cloud sync for progress
- [ ] Tafsir integration
- [ ] Translation in multiple languages
- [ ] Reading goals and streaks
- [ ] Social features (share verses)
- [ ] Bookmarks with notes
- [ ] Dark theme
- [ ] Juz navigation
- [ ] Hizb and Manzil navigation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Credits

- Audio from QuranicAudio.com and EveryAyah.com
- Quran text and metadata from various open sources

---

اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ

*"Read in the name of your Lord who created"* - Al-Alaq (96:1)
