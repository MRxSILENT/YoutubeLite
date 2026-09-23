# YouTube Lite - Ultra Fast for Old Android 📱⚡

An ultra-lightweight, battery-efficient web app built using **HTML, CSS, and JSON** specifically for older Android phones (Android 4.4 KitKat through Android 9, Go Edition, and low-RAM 512MB–2GB devices).

---

## 📁 Pure HTML, CSS & JSON Architecture

This project is designed to be hosted directly on **GitHub Pages** or opened on any ancient browser with zero server and zero complex runtime overhead:

1. **JSON Data Layer (`public/data/`)**:
   - `videos.json`: Structured video catalog with YouTube video IDs, resolutions, channel metadata, duration, and view counts.
   - `categories.json`: Categories for fast filtering (Music, Gaming, Tech, Learning, History, Low Data).
   - `channels.json`: Channel profiles and subscriptions.

2. **Pure HTML & CSS Layout**:
   - Fast, hardware-accelerated layouts optimized for low-RAM chipsets (Snapdragon 400, MediaTek MT6580).
   - AMOLED Pure Black (`#000000`) theme to turn off OLED pixels and save battery.
   - High-contrast, finger-friendly touch targets (min 44px) for older touchscreens.

3. **Two Deployment Options for GitHub**:
   - **Option A (Standalone HTML/CSS/JSON)**: `public/standalone.html` is a standalone, single-file HTML app with embedded CSS and JSON. You can rename it to `index.html` and host it anywhere with **zero build step**, zero npm, and zero dependencies!
   - **Option B (Progressive Web App with GitHub Actions)**: The root project deploys automatically to GitHub Pages using the included `.github/workflows/deploy.yml` workflow, providing offline service worker caching and home-screen installability.

---

## 🚀 How to Host on GitHub Pages (2 Minutes)

### Method 1: Automated Deployment (GitHub Actions)

1. Create a repository on GitHub.
2. Push this project to your repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of YouTube Lite"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
3. In your repo on GitHub, go to **Settings** > **Pages** > **Build and deployment** > **Source**, and select **GitHub Actions**.
4. Your app is live at:
   ```
   https://<your-username>.github.io/<your-repo-name>/
   ```

### Method 2: Zero-Build Standalone (Pure HTML, CSS, JSON)

If you don't want any build step or node_modules at all:
1. Copy `public/standalone.html` and save it as `index.html`.
2. Commit and push it to a GitHub repository with GitHub Pages set to deploy the `main` branch.
3. It runs immediately on any browser!

---

## 🌟 Key Features for Older Android Phones

- **YouTube Go Quality Selector**: 144p (~1.5 MB/10min), 240p (~3.8 MB), 360p (~8.5 MB, optimal for 512MB RAM), 480p, and 720p.
- **Audio-Only & Pocket Mode**: Saves 85%+ CPU, battery, and mobile data for music and podcasts with screen dimmer.
- **Sleep Timer**: Auto-shuts off playback after 15m, 30m, 45m, or 60m to prevent battery drain overnight.
- **Offline Mode**: Save videos into local browser storage (JSON) and replay anytime with zero internet connection.
- **Pure Black AMOLED Theme**: True `#000000` background turns off pixels on OLED/AMOLED screens.
- **Direct YouTube URL & Search**: Plays pasted links (`youtu.be/...`, `youtube.com/watch?v=...`) or searches live YouTube.
- **No Google Account Required**: Subscribe to channels, save watch history, and like videos locally without Google Play Services.

---

## 💻 Local Commands

```bash
# Install dependencies
npm install

# Start local server
npm run dev

# Build static bundle for GitHub Pages (outputs to ./dist)
npm run build
```

---

## 📄 License

Apache-2.0
