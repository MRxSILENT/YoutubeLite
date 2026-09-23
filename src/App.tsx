import React, { useState, useEffect, useCallback } from 'react';
import { Video, AppSettings } from './types/youtube';
import { StorageService, DEFAULT_SETTINGS } from './services/storage';
import { ApiService } from './services/api';
import { Header } from './components/Header';
import { CategoryPills } from './components/CategoryPills';
import { VideoCard } from './components/VideoCard';
import { VideoPlayer } from './components/VideoPlayer';
import { MiniPlayer } from './components/MiniPlayer';
import { BottomNav, NavTab } from './components/BottomNav';
import { SearchBar } from './components/SearchBar';
import { ExploreView } from './components/ExploreView';
import { SubscriptionsView } from './components/SubscriptionsView';
import { DownloadsView } from './components/DownloadsView';
import { LibraryView } from './components/LibraryView';
import { ChannelView } from './components/ChannelView';
import { SettingsModal } from './components/SettingsModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { WifiOff, RefreshCw, Smartphone, Zap } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Music',
  'Gaming',
  'News',
  'Learning',
  'Tech',
  'History',
  'Low Data',
  'Offline',
];

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [isPlayerMinimized, setIsPlayerMinimized] = useState<boolean>(false);
  const [initialAudioOnly, setInitialAudioOnly] = useState<boolean>(false);
  const [viewingChannel, setViewingChannel] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [downloadCount, setDownloadCount] = useState<number>(0);

  // Load settings & offline videos count on mount
  useEffect(() => {
    const s = StorageService.getSettings();
    setSettings(s);
    setDownloadCount(StorageService.getDownloads().length);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch videos for category
  const loadVideos = useCallback(async (cat: string) => {
    setIsLoading(true);
    try {
      const data = await ApiService.getTrending(cat);
      setVideos(data);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCategory === 'Offline') {
      setActiveTab('downloads');
      return;
    }
    loadVideos(selectedCategory);
  }, [selectedCategory, loadVideos]);

  const handleSelectVideo = (video: Video, audioOnly = false) => {
    setActiveVideo(video);
    setIsPlayerMinimized(false);
    setInitialAudioOnly(audioOnly || settings.audioOnlyDefault);
  };

  const handleSearchSubmit = async (query: string) => {
    setSearchOpen(false);
    setIsLoading(true);
    setActiveTab('home');
    setViewingChannel(null);
    try {
      const results = await ApiService.search(query);
      setVideos(results);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const handleChannelClick = (channelName: string) => {
    setViewingChannel(channelName);
  };

  const handleDownloadSaved = (video: Video) => {
    StorageService.saveForOffline(video, settings.defaultQuality);
    setDownloadCount(StorageService.getDownloads().length);
    alert(`Saved "${video.title.slice(0, 30)}..." for offline playback!`);
  };

  // Background styling based on AMOLED pure black mode
  const bgClass = settings.amoledBlack ? 'bg-black text-white' : 'bg-[#0f0f0f] text-white';

  return (
    <div className={`min-h-screen ${bgClass} font-sans flex flex-col antialiased selection:bg-red-600 selection:text-white`}>
      {/* PWA Install Banner */}
      <PWAInstallBanner />

      {/* Offline Status Warning Pill */}
      {!isOnline && (
        <div className="bg-amber-600 text-black px-3 py-1.5 text-xs font-bold flex items-center justify-between shadow-md select-none sticky top-0 z-40">
          <div className="flex items-center gap-1.5">
            <WifiOff className="w-4 h-4" />
            <span>No internet connection • Playing from offline downloads</span>
          </div>
          <button
            onClick={() => setActiveTab('downloads')}
            className="px-2 py-0.5 bg-black text-amber-400 rounded text-[11px] font-bold"
          >
            Go Offline
          </button>
        </div>
      )}

      {/* Main Header */}
      <Header
        onOpenSearch={() => setSearchOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        settings={settings}
        activeView={viewingChannel ? 'channel' : activeTab}
        onBack={() => setViewingChannel(null)}
      />

      {/* Primary Content Switcher */}
      <main className="flex-1 pb-16">
        {viewingChannel ? (
          <ChannelView
            channelName={viewingChannel}
            onBack={() => setViewingChannel(null)}
            onSelectVideo={(v) => handleSelectVideo(v, false)}
          />
        ) : activeTab === 'home' ? (
          <div>
            {/* Category Pills Strip */}
            <CategoryPills
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
              onOpenExplore={() => setActiveTab('explore')}
            />

            {/* Video Feed */}
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="animate-pulse space-y-2 pb-4">
                    <div className="w-full aspect-video bg-zinc-800 rounded-lg" />
                    <div className="flex gap-3 px-1">
                      <div className="w-9 h-9 rounded-full bg-zinc-800 flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 bg-zinc-800 rounded w-3/4" />
                        <div className="h-3 bg-zinc-850 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : videos.length > 0 ? (
              <div className="divide-y divide-zinc-900">
                {videos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onSelect={handleSelectVideo}
                    onChannelClick={handleChannelClick}
                    onDownload={handleDownloadSaved}
                    lowRamMode={settings.lowRamMode}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-500 space-y-2">
                <p>No videos found for this topic.</p>
                <button
                  onClick={() => loadVideos('All')}
                  className="px-4 py-1.5 rounded-full bg-zinc-800 text-white text-xs font-semibold hover:bg-zinc-700"
                >
                  Reload Feed
                </button>
              </div>
            )}
          </div>
        ) : activeTab === 'explore' ? (
          <ExploreView
            onSelectVideo={(v) => handleSelectVideo(v, false)}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setActiveTab('home');
            }}
          />
        ) : activeTab === 'subscriptions' ? (
          <SubscriptionsView
            onSelectVideo={(v) => handleSelectVideo(v, false)}
            onSelectChannel={handleChannelClick}
          />
        ) : activeTab === 'downloads' ? (
          <DownloadsView onPlayVideo={(v) => handleSelectVideo(v, false)} />
        ) : (
          <LibraryView
            onSelectVideo={(v) => handleSelectVideo(v, false)}
            onOpenDownloads={() => setActiveTab('downloads')}
          />
        )}
      </main>

      {/* Mini Player Bar (when user minimized video) */}
      {activeVideo && isPlayerMinimized && (
        <MiniPlayer
          video={activeVideo}
          onMaximize={() => setIsPlayerMinimized(false)}
          onClose={() => setActiveVideo(null)}
          isAudioOnly={initialAudioOnly}
        />
      )}

      {/* Full Video Player Screen / Modal */}
      {activeVideo && !isPlayerMinimized && (
        <VideoPlayer
          video={activeVideo}
          onClose={() => setActiveVideo(null)}
          onMinimize={() => setIsPlayerMinimized(true)}
          onSelectRelated={(v) => handleSelectVideo(v, false)}
          initialAudioOnly={initialAudioOnly}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(t) => {
          setViewingChannel(null);
          setActiveTab(t);
        }}
        downloadCount={downloadCount}
      />

      {/* Full-Screen Search Modal */}
      {searchOpen && (
        <SearchBar
          onSearch={handleSearchSubmit}
          onClose={() => setSearchOpen(false)}
        />
      )}

      {/* Settings Modal */}
      {settingsOpen && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={setSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}
