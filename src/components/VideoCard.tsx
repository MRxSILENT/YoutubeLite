import React, { useState } from 'react';
import { MoreVertical, Download, Clock, Headphones, Share2, Play, CheckCircle2 } from 'lucide-react';
import { Video } from '../types/youtube';
import { StorageService } from '../services/storage';

interface Props {
  video: Video;
  onSelect: (video: Video, audioOnly?: boolean) => void;
  onChannelClick?: (channelName: string) => void;
  onDownload?: (video: Video) => void;
  lowRamMode?: boolean;
}

export const VideoCard: React.FC<Props> = ({
  video,
  onSelect,
  onChannelClick,
  onDownload,
  lowRamMode = false,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isSavedOffline, setIsSavedOffline] = useState(StorageService.isDownloaded(video.id));
  const [inWatchLater, setInWatchLater] = useState(StorageService.isInWatchLater(video.id));

  const handleOfflineSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDownload) {
      onDownload(video);
    } else {
      StorageService.saveForOffline(video, '360p');
    }
    setIsSavedOffline(true);
    setShowMenu(false);
  };

  const handleWatchLater = (e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = StorageService.toggleWatchLater(video);
    setInWatchLater(updated);
    setShowMenu(false);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    const shareUrl = `https://www.youtube.com/watch?v=${video.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: `Watch "${video.title}" on YouTube Lite:`,
          url: shareUrl,
        });
      } catch {
        // ignore
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Video link copied to clipboard!');
    }
  };

  return (
    <div
      onClick={() => onSelect(video, false)}
      className="group relative flex flex-col cursor-pointer pb-3 bg-[#0f0f0f] border-b border-zinc-900 active:bg-zinc-900/60 transition"
    >
      {/* Thumbnail Container */}
      <div className="relative w-full aspect-video bg-zinc-900 overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-200 ${
            lowRamMode ? '' : 'group-hover:scale-[1.02]'
          }`}
          onError={(e) => {
            // High reliability fallback to standard YouTube thumbnail
            (e.target as HTMLImageElement).src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
          }}
        />

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-xs text-white text-[11px] font-bold tracking-tight">
          {video.isLive ? (
            <span className="flex items-center gap-1 text-red-500">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              LIVE
            </span>
          ) : (
            video.duration || '3:30'
          )}
        </div>

        {/* Offline Saved Indicator Icon */}
        {isSavedOffline && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-600/90 text-white text-[10px] font-bold flex items-center gap-1 shadow">
            <CheckCircle2 className="w-3 h-3" />
            <span>Saved Offline</span>
          </div>
        )}

        {/* Audio Quick Listen button overlay */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(video, true);
          }}
          title="Listen in Audio-Only Mode (Saves 85% battery & data)"
          className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-md bg-black/75 text-zinc-200 hover:text-white text-[10px] font-medium border border-zinc-700/50 active:scale-95 transition"
        >
          <Headphones className="w-3 h-3 text-red-400" />
          <span>Audio Only</span>
        </button>
      </div>

      {/* Video Details */}
      <div className="flex items-start gap-3 px-3 pt-2.5">
        {/* Channel Avatar */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (onChannelClick) onChannelClick(video.channelTitle);
          }}
          className="flex-shrink-0 cursor-pointer pt-0.5"
        >
          <img
            src={video.channelAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(video.channelTitle)}&background=333&color=fff`}
            alt={video.channelTitle}
            className="w-9 h-9 rounded-full object-cover bg-zinc-800"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(video.channelTitle)}&background=FF0000&color=fff`;
            }}
          />
        </div>

        {/* Title, Channel & Meta */}
        <div className="flex-1 min-w-0 pr-1">
          <h3 className="text-[13px] font-semibold text-white leading-snug line-clamp-2 text-left">
            {video.title}
          </h3>
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5 text-left flex-wrap">
            <span
              onClick={(e) => {
                e.stopPropagation();
                if (onChannelClick) onChannelClick(video.channelTitle);
              }}
              className="hover:text-zinc-200 truncate max-w-[140px]"
            >
              {video.channelTitle}
            </span>
            <span>•</span>
            <span>{video.views}</span>
            <span>•</span>
            <span>{video.publishedAt}</span>
          </div>
        </div>

        {/* 3-Dot Quick Menu Trigger */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full active:bg-zinc-800"
            aria-label="Video options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Quick Menu Popover */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
              />
              <div className="absolute right-0 top-8 z-50 w-52 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-1.5 text-xs text-white">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onSelect(video, false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-800 text-left"
                >
                  <Play className="w-4 h-4 text-red-500" />
                  <span>Play Video (360p Standard)</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onSelect(video, true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-800 text-left"
                >
                  <Headphones className="w-4 h-4 text-emerald-400" />
                  <span>Listen in Audio-Only Mode</span>
                </button>

                <button
                  onClick={handleOfflineSave}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-800 text-left"
                >
                  <Download className="w-4 h-4 text-blue-400" />
                  <span>{isSavedOffline ? 'Re-download Offline' : 'Save for Offline (~8.5 MB)'}</span>
                </button>

                <button
                  onClick={handleWatchLater}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-800 text-left"
                >
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>{inWatchLater ? 'Remove Watch Later' : 'Save to Watch Later'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-800 text-left"
                >
                  <Share2 className="w-4 h-4 text-purple-400" />
                  <span>Share Video Link</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
