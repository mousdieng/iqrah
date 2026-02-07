# 📱 إقراء (Iqrah) Mobile App - Documentation Index

Welcome to the Iqrah mobile app documentation! This is your complete guide to understanding and running the application.

---

## 📑 Documentation Files

### 🚀 [QUICK_START.md](./QUICK_START.md)
**Start here!** Get the app running in 3 simple steps.
- Install dependencies
- Start the dev server
- Run on your device

### 📘 [README.md](./README.md)
Complete project documentation including:
- Feature overview
- Project structure
- API integration
- State management
- Development workflow

### 🔧 [SETUP.md](./SETUP.md)
Detailed setup guide with:
- Configuration instructions
- Troubleshooting tips
- Development tips
- Build instructions
- Common issues and solutions

### 📊 [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)
High-level project overview:
- What was created
- Technology stack
- Architecture decisions
- Features implemented
- Future roadmap

---

## 🗂️ Project Structure

```
mobile/
├── 📄 Documentation
│   ├── INDEX.md (this file)
│   ├── QUICK_START.md
│   ├── README.md
│   ├── SETUP.md
│   └── PROJECT_SUMMARY.md
│
├── 📱 Application Code
│   ├── App.tsx                 # Root component
│   ├── app.json               # Expo configuration
│   └── src/
│       ├── components/        # Reusable components
│       ├── constants/         # App constants
│       ├── context/          # State management
│       ├── navigation/       # Navigation setup
│       ├── screens/          # 7 main screens
│       ├── services/         # API layer
│       ├── types/           # TypeScript types
│       └── utils/           # Utility functions
│
└── 📦 Configuration
    ├── package.json
    ├── tsconfig.json
    ├── .env.example
    └── .gitignore
```

---

## 🎯 Quick Navigation

### For First-Time Users
1. Read [QUICK_START.md](./QUICK_START.md)
2. Follow the 3-step setup
3. Configure your backend API
4. Run the app!

### For Developers
1. Review [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for architecture
2. Check [README.md](./README.md) for detailed docs
3. Use [SETUP.md](./SETUP.md) for advanced configuration
4. Explore the `src/` directory

### For Troubleshooting
1. Check [SETUP.md](./SETUP.md) → "Common Issues" section
2. Verify your backend API configuration
3. Try clearing cache: `npm start -- --reset-cache`
4. Reinstall dependencies if needed

---

## 🌟 Key Features

✅ **7 Screens**
- Home, Surahs, Surah Reading, Mushaf, Search, Favorites, Settings

✅ **Audio Playback**
- 4 professional reciters
- Repeat functionality
- Auto-play mode

✅ **User Experience**
- Favorites & memorization tracking
- Customizable font sizes
- Offline state persistence
- Beautiful Arabic typography

✅ **Flexible Reading**
- Surah mode (verse-by-verse)
- Mushaf mode (page-by-page)
- Full-text search

---

## 🛠️ Technology Stack

- **React Native** 0.81.4
- **Expo** ~54.0.13
- **TypeScript** 5.9.2
- **React Navigation** v7
- **Axios** for API
- **Context API** for state
- **AsyncStorage** for persistence

---

## 📞 Getting Help

1. **Documentation**: Start with QUICK_START.md
2. **Issues**: Check SETUP.md for common problems
3. **Architecture**: Review PROJECT_SUMMARY.md
4. **Details**: Full info in README.md

---

## 🎓 Learning Path

### Beginner
1. Run the app (QUICK_START.md)
2. Explore the screens
3. Try different features
4. Customize settings

### Intermediate
1. Understand the architecture (PROJECT_SUMMARY.md)
2. Review the component structure
3. Modify existing screens
4. Add custom styling

### Advanced
1. Extend functionality
2. Add new features
3. Integrate additional APIs
4. Build for production

---

## ✨ Next Steps

After getting the app running:

1. **Configure**: Set up your backend API in `app.json`
2. **Explore**: Try all features and screens
3. **Customize**: Adjust settings to your preference
4. **Enhance**: Review the roadmap in PROJECT_SUMMARY.md
5. **Build**: Create production builds with EAS

---

## 📱 Quick Commands

```bash
# Install
npm install

# Run
npm start              # Start dev server
npm run android        # Run on Android
npm run ios           # Run on iOS
npm run web           # Run in browser

# Troubleshoot
npm start -- --reset-cache    # Clear cache
rm -rf node_modules && npm install  # Reinstall
```

---

## 🙏 Final Notes

This app was built with love for the Muslim Ummah. May Allah accept this work and make it beneficial for all who use it.

**اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ**

*"Read in the name of your Lord who created"* - Al-Alaq (96:1)

---

**Need help?** Start with [QUICK_START.md](./QUICK_START.md) 🚀
