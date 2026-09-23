import { Video, VideoComment } from '../types/youtube';
import { INITIAL_VIDEOS, MOCK_COMMENTS } from './mockData';

export function extractYouTubeId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const clean = urlOrId.trim();

  // If it is an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return clean;
  }

  // Check standard YouTube URLs
  const patterns = [
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = clean.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export const ApiService = {
  async getTrending(category: string = 'All'): Promise<Video[]> {
    try {
      const res = await fetch(`/api/trending?category=${encodeURIComponent(category)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch {
      // Offline or network error - fallback to local catalog
    }

    // Local filter fallback
    if (category === 'All') return INITIAL_VIDEOS;
    const filtered = INITIAL_VIDEOS.filter(
      (v) => v.category?.toLowerCase() === category.toLowerCase()
    );
    return filtered.length > 0 ? filtered : INITIAL_VIDEOS;
  },

  async search(query: string): Promise<Video[]> {
    const directId = extractYouTubeId(query);
    if (directId) {
      // If user pasted a direct YouTube ID or link, return that video immediately
      return [
        {
          id: directId,
          title: `YouTube Video (${directId})`,
          channelTitle: 'YouTube Creator',
          channelAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop',
          thumbnail: `https://i.ytimg.com/vi/${directId}/hqdefault.jpg`,
          duration: 'Playing Now',
          views: 'Direct Link',
          publishedAt: 'Ready',
          description: `Directly loaded YouTube video ID: ${directId}`,
          likes: '100%',
          category: 'Video',
        },
      ];
    }

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch {
      // Use client fallback
    }

    // Client-side search fallback across initial videos
    const qLower = query.toLowerCase();
    const matches = INITIAL_VIDEOS.filter(
      (v) =>
        v.title.toLowerCase().includes(qLower) ||
        v.channelTitle.toLowerCase().includes(qLower) ||
        (v.description && v.description.toLowerCase().includes(qLower)) ||
        (v.category && v.category.toLowerCase().includes(qLower))
    );

    if (matches.length > 0) return matches;

    // If query didn't match local database, return curated items plus synthetic video match
    return [
      {
        id: 'dQw4w9WgXcQ',
        title: `Search result: "${query}" (Recommended stream)`,
        channelTitle: 'YouTube Top Pick',
        channelAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=640&h=360&fit=crop',
        duration: '3:33',
        views: '1.2M views',
        publishedAt: 'Recently',
        description: `Matching video results for "${query}". Optimized for low-bandwidth playback.`,
        likes: '98%',
        category: 'All',
      },
      ...INITIAL_VIDEOS.slice(0, 4),
    ];
  },

  async getSuggestions(query: string): Promise<string[]> {
    if (!query || query.trim().length < 2) return [];
    try {
      const res = await fetch(`/api/suggestions?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {
      // Fallback
    }

    // Default suggestions based on common queries
    const defaults = [
      'lofi hip hop radio',
      'ed sheeran songs',
      'rick astley official',
      'despacito song',
      'mrbeast challenges',
      'kurzgesagt science',
      'first youtube video',
      'gta 5 funny moments',
      'how computers work',
    ];
    return defaults.filter((d) => d.toLowerCase().includes(query.toLowerCase()));
  },

  async getComments(videoId: string): Promise<VideoComment[]> {
    try {
      const res = await fetch(`/api/comments/${encodeURIComponent(videoId)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {
      // fallback
    }

    return MOCK_COMMENTS[videoId] || MOCK_COMMENTS.default;
  },

  async getRelatedVideos(currentId: string): Promise<Video[]> {
    return INITIAL_VIDEOS.filter((v) => v.id !== currentId);
  },
};
