# 🚀 Quick Start Guide

## Get Started in 3 Steps

### 1️⃣ Install Dependencies
```bash
cd mobile
npm install
```

### 2️⃣ Start Development Server
```bash
npm start
```

### 3️⃣ Run the App
- Press `a` for Android
- Press `i` for iOS (macOS only)
- Press `w` for Web
- Or scan QR code with Expo Go app

---

## 📱 Test on Your Phone

1. Install **Expo Go** from:
   - [App Store (iOS)](https://apps.apple.com/app/expo-go/id982107779)
   - [Play Store (Android)](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Scan the QR code shown in terminal

3. App will load on your phone!

---

## ⚙️ Configure Backend

Edit `app.json`:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://YOUR_IP_ADDRESS:8080/api"
    }
  }
}
```

Replace `YOUR_IP_ADDRESS` with your computer's IP address.

### Find Your IP:
- **Windows**: `ipconfig` → Look for IPv4 Address
- **Mac/Linux**: `ifconfig` or `ip addr` → Look for inet address
- Example: `http://192.168.1.100:8080/api`

---

## 🎯 App Features

### Screens
- 🏠 **Home** - Quick access and statistics
- 📖 **Surahs** - Browse all 114 Surahs
- 📃 **Mushaf** - Page-based reading (604 pages)
- 🔍 **Search** - Search verses
- ⭐ **Favorites** - Saved verses
- ⚙️ **Settings** - Customize experience

### Audio
- 🎵 4 reciters available
- 🔁 Repeat verses (1-10x)
- ⏯️ Auto-play mode
- ⏭️ Previous/Next controls

---

## 🐛 Common Issues

### Can't connect to backend?
- Make sure backend is running
- Use IP address, not `localhost`
- Check firewall settings

### Metro won't start?
```bash
npm start -- --reset-cache
```

### Modules not found?
```bash
rm -rf node_modules
npm install
```

---

## 📚 More Help

- **Setup Guide**: `SETUP.md`
- **Full Documentation**: `README.md`
- **Project Overview**: `PROJECT_SUMMARY.md`

---

**Happy Coding! اقرأ باسم ربك الذي خلق**
