import React, { useState, useEffect } from 'react';
import {
  History,
  Clock,
  ThumbsUp,
  Trash2,
  HardDrive,
  Cpu,
  Sparkles,
  Zap,
  CheckCircle2,
  ChevronRight,
  Shield,
  Download,
} from 'lucide-react';
import { Video } from '../types/youtube';
import { StorageService } from '../services/storage';

interface Props {
  onSelectVideo: (video: Video) => void;
  onOpenDownloads: () => void;
}

export const LibraryView: React.FC<Props> = ({ onSelectVideo, onOpenDownloads }) => {
  const [history, setHistory] = useState<Video[]>([]);
  const [watchLater, setWatchLater] = useState<Video[]>([]);
  const [liked, setLiked] = useState<Video[]>([]);
  const [dataSavedMB, setDataSavedMB] = useState(48.5);
  const [cacheCleanedMessage, setCacheCleanedMessage] = useState<string | null>(null);

  useEffect(() => {
    setHistory(StorageService.getHistory());
    setWatchLater(StorageService.getWatchLater());
    setLiked(StorageService.getLikedVideos());
    setDataSavedMB(StorageService.getDataSavedMB());
  }, []);

  const handleClearHistory = () => {
    if (confirm('Clear your local watch history?')) {
      StorageService.clearHistory();
      setHistory([]);
    }
  };

  const handleCleanMemory = () => {
    const res = StorageService.clearAllCache();
    setHistory([]);
    setCacheCleanedMessage(`Cleaned ~${res.clearedMB} MB of memory and thumbnail cache!`);
    setTimeout(() => setCacheCleanedMessage(null), 3000);
  };

  return (
    <div className="p-3.5 space-y-4 select-none pb-24">
      {/* Low-End Android Diagnostic & Data Saved Card */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-850 to-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Data Saver Tracker</h3>
              <p className="text-[11px] text-zinc-400">Low-bitrate stream savings vs standard 1080p</p>
            </div>
          </div>
          <span className="font-mono text-base font-bold text-emerald-400">
            {dataSavedMB.toFixed(1)} MB
          </span>
        </div>

        {/* 1-Tap RAM cleaner for old phones */}
        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
          <div className="text-xs text-zinc-300">
            <span className="text-zinc-400 block text-[10px]">DEVICE OPTIMIZATION</span>
            <span>Purge thumbnail RAM & garbage collector</span>
          </div>

          <button
            onClick={handleCleanMemory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white border border-zinc-700 active:scale-95 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Clean Cache</span>
          </button>
        </div>

        {cacheCleanedMessage && (
          <div className="mt-2 text-xs text-emerald-400 bg-emerald-950/40 p-2 rounded-lg border border-emerald-800/40 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{cacheCleanedMessage}</span>
          </div>
        )}
      </div>

      {/* Quick Action Buttons: Downloads, Watch Later, Liked */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onOpenDownloads}
          className="flex items-center gap-3 p-3 bg-zinc-900 hover:bg-zinc-850 rounded-xl border border-zinc-800 text-left transition"
        >
          <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400">
            <Download className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Downloads</div>
            <div className="text-[10px] text-zinc-400">Offline videos</div>
          </div>
        </button>

        <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-left">
          <div className="p-2 rounded-lg bg-amber-600/20 text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Watch Later</div>
            <div className="text-[10px] text-zinc-400">{watchLater.length} saved</div>
          </div>
        </div>
      </div>

      {/* Watch History Horizontal Strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-zinc-400" />
            <span>History ({history.length})</span>
          </h3>

          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-[11px] text-zinc-500 hover:text-red-400 font-medium"
            >
              Clear
            </button>
          )}
        </div>

        {history.length > 0 ? (
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {history.map((video) => (
              <div
                key={video.id}
                onClick={() => onSelectVideo(video)}
                className="w-36 flex-shrink-0 cursor-pointer group"
              >
                <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-800 mb-1">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                  <span className="absolute bottom-1 right-1 px-1 rounded bg-black/80 text-[8px] font-bold text-white">
                    {video.duration}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-white truncate">{video.title}</div>
                <div className="text-[10px] text-zinc-400 truncate">{video.channelTitle}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-zinc-900/60 text-center text-xs text-zinc-500">
            Videos you watch will appear here.
          </div>
        )}
      </div>

      {/* Liked Videos Section */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <ThumbsUp className="w-3.5 h-3.5 text-red-500" />
          <span>Liked Videos ({liked.length})</span>
        </h3>

        {liked.length > 0 ? (
          <div className="space-y-2">
            {liked.map((video) => (
              <div
                key={video.id}
                onClick={() => onSelectVideo(video)}
                className="flex gap-2.5 p-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 cursor-pointer border border-zinc-850"
              >
                <div className="relative w-24 aspect-video rounded-lg overflow-hidden bg-black flex-shrink-0">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">{video.title}</div>
                  <div className="text-[10px] text-zinc-400 truncate">{video.channelTitle}</div>
                  <div className="text-[10px] text-red-400 font-semibold mt-0.5">Liked</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-zinc-900/60 text-center text-xs text-zinc-500">
            Videos you like will be organized here.
          </div>
        )}
      </div>

      {/* Outdated Phone Specs Badge */}
      <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-900 text-[11px] text-zinc-500 space-y-1">
        <div className="font-bold text-zinc-400 flex items-center gap-1">
          <Shield className="w-3.5 h-3.5 text-red-500" />
          <span>Optimized for Android KitKat, Lollipop, Marshmallow & Go</span>
        </div>
        <p>
          Runs with zero bloated tracking scripts. HTML5 hardware acceleration enabled. Tested for 512MB - 1GB RAM devices.
        </p>
      </div>
    </div>
  );
};
