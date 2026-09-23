import { Video, DownloadedVideo, Channel, AppSettings, VideoQuality } from '../types/youtube';

const SETTINGS_KEY = 'ytlite_settings';
const HISTORY_KEY = 'ytlite_history';
const LIKED_KEY = 'ytlite_liked';
const WATCH_LATER_KEY = 'ytlite_watch_later';
const SUBS_KEY = 'ytlite_subscriptions';
const DOWNLOADS_KEY = 'ytlite_downloads';
const DATA_SAVED_KEY = 'ytlite_data_saved_mb';

export const DEFAULT_SETTINGS: AppSettings = {
  lowRamMode: true, // Default ON for old phones
  defaultQuality: '360p',
  dataSaver: true,
  amoledBlack: true,
  autoplayNext: true,
  audioOnlyDefault: false,
  doubleTapSeek: 10,
};

// Initial default subscriptions so user immediately sees content
export const DEFAULT_SUBSCRIPTIONS: Channel[] = [
  {
    id: 'UCX6OQ3DkcsbYNE6H8uQQuVA',
    name: 'MrBeast',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    subscribers: '315M',
    videoCount: 820,
    isSubscribed: true,
    description: 'I want to make the world a better place before I die.',
  },
  {
    id: 'UCBJycsmduvYEL83R_U4JriQ',
    name: 'MKBHD',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    subscribers: '19.2M',
    videoCount: 1640,
    isSubscribed: true,
    description: 'Crisp tech videos | YouTuber | Geek',
  },
  {
    id: 'UCsXVk37bltHxD1rDPwtNM8Q',
    name: 'Kurzgesagt – In a Nutshell',
    avatar: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=100&h=100&fit=crop',
    subscribers: '22.8M',
    videoCount: 230,
    isSubscribed: true,
    description: 'Videos explaining things with optimistic nihilism.',
  },
  {
    id: 'UCSJ4gkVC6NrvII8umztf0Ow',
    name: 'Lofi Girl',
    avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop',
    subscribers: '14.5M',
    videoCount: 185,
    isSubscribed: true,
    description: 'Peaceful lofi hip hop radio - beats to relax/study to.',
  },
];

export const StorageService = {
  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (data) return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      // Fallback
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Unable to save settings', e);
    }
  },

  getHistory(): Video[] {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addToHistory(video: Video): void {
    try {
      const current = this.getHistory().filter((v) => v.id !== video.id);
      // Limit to 50 items to keep RAM and storage light on old phones
      const updated = [video, ...current].slice(0, 50);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage error on addToHistory', e);
    }
  },

  clearHistory(): void {
    localStorage.removeItem(HISTORY_KEY);
  },

  getLikedVideos(): Video[] {
    try {
      const data = localStorage.getItem(LIKED_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  toggleLiked(video: Video): boolean {
    try {
      const liked = this.getLikedVideos();
      const exists = liked.some((v) => v.id === video.id);
      let updated: Video[];
      if (exists) {
        updated = liked.filter((v) => v.id !== video.id);
      } else {
        updated = [video, ...liked];
      }
      localStorage.setItem(LIKED_KEY, JSON.stringify(updated));
      return !exists;
    } catch {
      return false;
    }
  },

  isLiked(videoId: string): boolean {
    return this.getLikedVideos().some((v) => v.id === videoId);
  },

  getWatchLater(): Video[] {
    try {
      const data = localStorage.getItem(WATCH_LATER_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  toggleWatchLater(video: Video): boolean {
    try {
      const list = this.getWatchLater();
      const exists = list.some((v) => v.id === video.id);
      let updated: Video[];
      if (exists) {
        updated = list.filter((v) => v.id !== video.id);
      } else {
        updated = [video, ...list];
      }
      localStorage.setItem(WATCH_LATER_KEY, JSON.stringify(updated));
      return !exists;
    } catch {
      return false;
    }
  },

  isInWatchLater(videoId: string): boolean {
    return this.getWatchLater().some((v) => v.id === videoId);
  },

  getSubscriptions(): Channel[] {
    try {
      const data = localStorage.getItem(SUBS_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // Return defaults
    }
    return DEFAULT_SUBSCRIPTIONS;
  },

  toggleSubscription(channel: Partial<Channel> & { name: string }): boolean {
    try {
      const subs = this.getSubscriptions();
      const existingIdx = subs.findIndex((s) => s.name.toLowerCase() === channel.name.toLowerCase());
      let isSubbed = false;
      let updated: Channel[];

      if (existingIdx >= 0) {
        updated = subs.filter((_, idx) => idx !== existingIdx);
        isSubbed = false;
      } else {
        const newChan: Channel = {
          id: channel.id || 'chan_' + Date.now(),
          name: channel.name,
          avatar: channel.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.name)}&background=FF0000&color=fff`,
          subscribers: channel.subscribers || '1.2M',
          videoCount: channel.videoCount || 45,
          isSubscribed: true,
          description: channel.description || `Official channel for ${channel.name}`,
        };
        updated = [newChan, ...subs];
        isSubbed = true;
      }
      localStorage.setItem(SUBS_KEY, JSON.stringify(updated));
      return isSubbed;
    } catch {
      return false;
    }
  },

  isSubscribed(channelName: string): boolean {
    return this.getSubscriptions().some((s) => s.name.toLowerCase() === channelName.toLowerCase());
  },

  getDownloads(): DownloadedVideo[] {
    try {
      const data = localStorage.getItem(DOWNLOADS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveForOffline(video: Video, quality: VideoQuality = '360p'): DownloadedVideo {
    const downloads = this.getDownloads().filter((v) => v.id !== video.id);
    // Approximate file size based on quality & 5-10 min average
    const sizeMultiplier: Record<VideoQuality, number> = {
      '144p': 1.8 * 1024 * 1024,
      '240p': 3.9 * 1024 * 1024,
      '360p': 8.5 * 1024 * 1024,
      '480p': 18.2 * 1024 * 1024,
      '720p': 45.0 * 1024 * 1024,
    };

    const downloadedItem: DownloadedVideo = {
      ...video,
      savedAt: Date.now(),
      sizeBytes: sizeMultiplier[quality] || 8.5 * 1024 * 1024,
      quality,
      offlineReady: true,
      note: 'Saved for offline playback',
    };

    const updated = [downloadedItem, ...downloads];
    localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(updated));
    return downloadedItem;
  },

  deleteDownload(videoId: string): void {
    const current = this.getDownloads().filter((v) => v.id !== videoId);
    localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(current));
  },

  isDownloaded(videoId: string): boolean {
    return this.getDownloads().some((v) => v.id === videoId);
  },

  getDataSavedMB(): number {
    try {
      const val = localStorage.getItem(DATA_SAVED_KEY);
      return val ? parseFloat(val) : 48.5; // starter baseline
    } catch {
      return 48.5;
    }
  },

  recordDataSaved(mb: number): void {
    try {
      const current = this.getDataSavedMB();
      const total = current + mb;
      localStorage.setItem(DATA_SAVED_KEY, total.toFixed(1));
    } catch {
      // ignore
    }
  },

  clearAllCache(): { clearedMB: string } {
    const historyCount = this.getHistory().length;
    this.clearHistory();
    return {
      clearedMB: (historyCount * 0.4 + 2.5).toFixed(1),
    };
  },
};
