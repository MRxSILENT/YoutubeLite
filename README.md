# YouTube Lite - Ultra Fast for Old Android 📱⚡

An ultra-lightweight, battery-friendly Progressive Web App (PWA) built specifically for older Android phones (KitKat, Lollipop, Marshmallow, Nougat, Go edition, and low-RAM 512MB–2GB devices).

---

## 🚀 How to Host on GitHub (GitHub Pages in 2 Minutes)

This repository is already configured with automated GitHub Actions and relative asset paths (`./`) so it can be hosted on GitHub Pages with zero configuration.

### Method 1: Automatic Deployment with GitHub Actions (Recommended)

1. **Create a new repository on GitHub**:
   - Go to [GitHub New Repository](https://github.com/new).
   - Name your repo (e.g., `youtube-lite` or `yt-lite`).

2. **Push this code to your GitHub repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of YouTube Lite"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

3. **Enable GitHub Pages in your repo settings**:
   - In your GitHub repository, click on **Settings** (top tab).
   - In the left sidebar, click on **Pages**.
   - Under **Build and deployment** > **Source**, select **GitHub Actions**.

4. **Done!**
   - The included `.github/workflows/deploy.yml` workflow will automatically run, build the app, and deploy it.
   - Your site will be live at:
     ```
     https://<your-username>.github.io/<your-repo-name>/
     ```

---

### Method 2: Manual Build & Push `dist` to `gh-pages` branch

If you prefer building locally:

```bash
# 1. Install dependencies and build
npm install
npm run build

# 2. Deploy dist directory to gh-pages branch
npx gh-pages -d dist
```

Then in GitHub Settings -> Pages, select branch **`gh-pages`** and folder **`/ (root)`**.

---

## 🌟 Key Features for Older Android Phones

- **YouTube Go Style Quality Selector**: Pick between 144p (~1.5 MB/10min), 240p (~3.8 MB), 360p (~8.5 MB, optimal for 512MB RAM), 480p, and 720p HD.
- **Audio-Only & Pocket Mode**: Saves 85%+ CPU, battery, and mobile data for music and podcasts with animated waveform and screen dimmer.
- **Sleep Timer**: Auto-shuts off playback after 15m, 30m, 45m, or 60m to prevent battery drain overnight.
- **Offline Mode**: Save videos into local phone storage and replay anytime with zero internet.
- **Pure Black AMOLED Theme**: True `#000000` background turns off pixels on OLED/AMOLED screens.
- **Low-RAM Mode**: Disables expensive CSS blur filters and heavy shadows to avoid stuttering on low-end chipsets.
- **Real YouTube Search & Autocomplete**: Searches live YouTube videos and parses direct links (`youtu.be/...`, `youtube.com/watch?v=...`).
- **No Google Account Required**: Subscribe to channels, save watch history, and like videos locally without Google Play Services.
- **PWA Standalone (APK-Like)**: Add to Home Screen to run full-screen without browser URL bars.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production (outputs to ./dist)
npm run build
```

---

## 📄 License

Apache-2.0
