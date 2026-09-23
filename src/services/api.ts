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

// Client-side JSONP suggestion query for static GitHub Pages hosting
function fetchJsonpSuggestions(query: string): Promise<string[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve([]);
    const callbackName = 'yt_suggest_' + Math.random().toString(36).substring(2, 9);
    const script = document.createElement('script');

    const cleanup = () => {
      try {
        delete (window as unknown as Record<string, unknown>)[callbackName];
      } catch {
        // ignore
      }
      script.remove();
    };

    (window as unknown as Record<string, (data: unknown) => void>)[callbackName] = (data: unknown) => {
      cleanup();
      const raw = data as [string, [string, number, number[]][]];
      if (Array.isArray(raw) && Array.isArray(raw[1])) {
        const list = raw[1].map((item) => item[0]);
        resolve(list.slice(0, 8));
      } else {
        resolve([]);
      }
    };

    script.src = `https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=${encodeURIComponent(query)}&jsonp=${callbackName}`;
    script.onerror = () => {
      cleanup();
      resolve([]);
    };

    document.body.appendChild(script);
    setTimeout(() => {
      cleanup();
      resolve([]);
    }, 2500);
  });
}

// Static fallback search using public Invidious API
async function searchPublicInvidious(query: string): Promise<Video[]> {
  const instances = [
    'https://invidious.private.coffee',
    'https://invidious.jing.rocks',
    'https://vid.puffyan.us',
  ];

  for (const inst of instances) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`${inst}/api/v1/search?q=${encodeURIComponent(query)}&type=video`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.slice(0, 15).map((item: {
            videoId: string;
            title: string;
            author?: string;
            authorThumbnails?: { url: string }[];
            videoThumbnails?: { quality: string; url: string }[];
            lengthSeconds?: number;
            viewCountText?: string;
            viewCount?: number;
            publishedText?: string;
            description?: string;
          }) => ({
            id: item.videoId,
            title: item.title,
            channelTitle: item.author || 'Creator',
            channelAvatar: item.authorThumbnails?.[0]?.url,
            thumbnail:
              item.videoThumbnails?.find((t) => t.quality === 'medium')?.url ||
              `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
            duration: item.lengthSeconds
              ? `${Math.floor(item.lengthSeconds / 60)}:${String(item.lengthSeconds % 60).padStart(2, '0')}`
              : '3:30',
            views:
              item.viewCountText ||
              (item.viewCount ? `${(item.viewCount / 1000).toFixed(0)}K views` : '100K views'),
            publishedAt: item.publishedText || 'Recently',
            description: item.description || '',
            category: 'YouTube Search',
          }));
        }
      }
    } catch {
      // Continue to next mirror
    }
  }
  return [];
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
      // Static hosting fallback
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
      // Direct YouTube video ID or link pasted
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

    // 1. Try local server endpoint if running with Express backend
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch {
      // Expected on GitHub Pages (static host)
    }

    // 2. Try client-side public Invidious query (for GitHub Pages static hosting)
    try {
      const liveResults = await searchPublicInvidious(query);
      if (liveResults.length > 0) {
        return liveResults;
      }
    } catch {
      // ignore
    }

    // 3. Fallback across built-in curated catalog
    const qLower = query.toLowerCase();
    const matches = INITIAL_VIDEOS.filter(
      (v) =>
        v.title.toLowerCase().includes(qLower) ||
        v.channelTitle.toLowerCase().includes(qLower) ||
        (v.description && v.description.toLowerCase().includes(qLower)) ||
        (v.category && v.category.toLowerCase().includes(qLower))
    );

    if (matches.length > 0) return matches;

    // 4. Default recommendation
    return [
      {
        id: 'dQw4w9WgXcQ',
        title: `Search result for "${query}" (Recommended Stream)`,
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

    // 1. Try backend endpoint
    try {
      const res = await fetch(`/api/suggestions?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {
      // Static host fallback
    }

    // 2. Try client-side JSONP (works natively on GitHub Pages!)
    try {
      const jsonpResults = await fetchJsonpSuggestions(query);
      if (jsonpResults.length > 0) return jsonpResults;
    } catch {
      // ignore
    }

    // 3. Fallback to default search queries
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
