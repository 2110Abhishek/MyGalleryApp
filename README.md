# 📸 My Gallery App

**React Native Developer Assignment – Ablespace**

A cross-platform gallery app built with **React Native + Expo**, supporting **iOS, Android, and Web**.  
Users can log in with Google, upload images, add captions (via voice or text), and manage their personal gallery.

---

## 🚀 Features

### 🔐 Authentication
- Google login works on **iOS, Android, and Web**.
- Displays user **profile picture and name** at the top after login.

### 🖼️ Image Gallery
- Upload images using the **native image picker**.
- Capture photos directly with the **device camera** (mobile).
- Grid layout to display images with captions.

### 🎤 Captions with Voice
- Dictate captions using **voice input** (iOS, Android, Web).
- Fallback to **manual text input**.

### 💾 Data Persistence
- Stores images and captions **locally** using:
  - AsyncStorage (mobile)
  - IndexedDB (web)
- *(Bonus)* Syncs with **Firebase backend** if enabled.

### 📤 Sharing
- Share images with captions using native **Share API**.
- Works across mobile and web.

### 🎨 UI & UX
- Clean, minimal design.
- Responsive layouts across devices.
- Smooth navigation via **React Navigation**.

---

## ✨ Bonus Features
- Dark mode toggle (light/dark themes).
- Offline support (add captions and sync later).
- Basic search/filter by caption text.
- Deployment-ready for **App Store, Play Store, or Web**.

---

## 🛠️ Tech Stack

- **React Native** (Expo)
- **React Navigation**
- **Firebase Authentication**
- **Expo Image Picker & Camera**
- **Expo Speech & Voice APIs**
- **AsyncStorage / IndexedDB**
- **Native Share API**

---