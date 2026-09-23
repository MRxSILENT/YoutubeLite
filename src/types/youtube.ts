export interface Video {
  id: string;
  title: string;
  channelTitle: string;
  channelId?: string;
  channelAvatar?: string;
  thumbnail: string;
  duration: string; // e.g. "12:34"
  durationSeconds?: number;
  views: string; // e.g. "1.2M views"
  viewsCount?: number;
  publishedAt: string; // e.g. "2 days ago"
  description?: string;
  likes?: string;
  subscribers?: string;
  isLive?: boolean;
  category?: string;
}

export interface VideoComment {
  id: string;
  author: string;
  authorAvatar?: string;
  text: string;
  publishedAt: string;
  likes: number;
  isLiked?: boolean;
}

export interface Channel {
  id: string;
  name: string;
  avatar: string;
  subscribers: string;
  videoCount: number;
  isSubscribed: boolean;
  description: string;
}

export interface DownloadedVideo extends Video {
  savedAt: number;
  sizeBytes: number;
  quality: string;
  offlineReady: boolean;
  note?: string;
}

export type VideoQuality = '144p' | '240p' | '360p' | '480p' | '720p';

export interface QualityOption {
  quality: VideoQuality;
  label: string;
  description: string;
  mbPer10Min: number;
  tag: string;
}

export interface AppSettings {
  lowRamMode: boolean; // disables heavy CSS filters & shadows, reduces DOM
  defaultQuality: VideoQuality;
  dataSaver: boolean; // forces 240p/360p
  amoledBlack: boolean; // true black #000000 for battery saving
  autoplayNext: boolean;
  audioOnlyDefault: boolean;
  doubleTapSeek: number; // 5, 10, 15 seconds
}
