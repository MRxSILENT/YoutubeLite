import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Search API that queries YouTube results and parses videoRenderer structures
  app.get('/api/search', async (req, res) => {
    const q = req.query.q as string;
    if (!q) return res.json([]);

    try {
      const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(ytUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Linux; Android 9; SM-J260G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (response.ok) {
        const html = await response.text();
        const jsonMatch = html.match(/var ytInitialData = ({.*?});<\/script>/);
        if (jsonMatch && jsonMatch[1]) {
          const data = JSON.parse(jsonMatch[1]);
          const contents =
            data.contents?.twoColumnSearchResultsRenderer?.primaryContents
              ?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];

          const videos = [];
          for (const item of contents) {
            if (item.videoRenderer) {
              const vr = item.videoRenderer;
              if (vr.videoId && vr.title?.runs?.[0]?.text) {
                videos.push({
                  id: vr.videoId,
                  title: vr.title.runs[0].text,
                  channelTitle: vr.ownerText?.runs?.[0]?.text || 'Creator',
                  channelAvatar:
                    vr.channelThumbnailSupportedRenderers?.channelThumbnailWithLinkRenderer
                      ?.thumbnail?.thumbnails?.[0]?.url,
                  thumbnail:
                    vr.thumbnail?.thumbnails?.[vr.thumbnail.thumbnails.length - 1]?.url ||
                    `https://i.ytimg.com/vi/${vr.videoId}/hqdefault.jpg`,
                  duration: vr.lengthText?.simpleText || '3:30',
                  views: vr.viewCountText?.simpleText || '100K views',
                  publishedAt: vr.publishedTimeText?.simpleText || 'Recently',
                  description: vr.detailedMetadataSnippets?.[0]?.snippetText?.runs?.[0]?.text || '',
                });
                if (videos.length >= 15) break;
              }
            }
          }
          if (videos.length > 0) {
            return res.json(videos);
          }
        }
      }
    } catch {
      // fallback
    }

    res.json([]);
  });

  // Autocomplete Suggestions API
  app.get('/api/suggestions', async (req, res) => {
    const q = req.query.q as string;
    if (!q) return res.json([]);
    try {
      const suggestUrl = `https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=${encodeURIComponent(q)}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const resp = await fetch(suggestUrl, { signal: controller.signal });
      clearTimeout(timeout);

      const text = await resp.text();
      const match = text.match(/window\.google\.ac\.h\((.*)\)/);
      if (match && match[1]) {
        const parsed = JSON.parse(match[1]);
        const items = (parsed[1] || []).map((item: any) => item[0]);
        return res.json(items.slice(0, 8));
      }
    } catch {
      // ignore
    }
    res.json([]);
  });

  // Trending API endpoint
  app.get('/api/trending', (_req, res) => {
    res.json([]);
  });

  // Vite Integration
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`YouTube Lite server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
