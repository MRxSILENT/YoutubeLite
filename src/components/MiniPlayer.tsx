import React from 'react';
import { Play, Pause, X, ChevronUp, Headphones } from 'lucide-react';
import { Video } from '../types/youtube';

interface Props {
  video: Video;
  onMaximize: () => void;
  onClose: () => void;
  isAudioOnly?: boolean;
}

export const MiniPlayer: React.FC<Props> = ({
  video,
  onMaximize,
  onClose,
  isAudioOnly = false,
}) => {
  return (
    <div
      onClick={onMaximize}
      className="fixed bottom-[56px] inset-x-0 z-40 bg-zinc-900/98 backdrop-blur-md border-t border-zinc-800 px-3 py-1.5 flex items-center justify-between shadow-2xl cursor-pointer select-none transition-transform"
    >
      {/* Left Thumbnail with Audio badge if audio only */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
        <div className="relative w-14 aspect-video rounded-md overflow-hidden bg-black flex-shrink-0 border border-zinc-700/60">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover"
          />
          {isAudioOnly && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Headphones className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-white truncate">
            {video.title}
          </div>
          <div className="text-[10px] text-zinc-400 truncate flex items-center gap-1">
            <span>{video.channelTitle}</span>
            {isAudioOnly && <span className="text-emerald-400 font-bold">• Audio</span>}
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMaximize();
          }}
          className="p-1.5 text-zinc-300 hover:text-white rounded-full"
          title="Expand"
        >
          <ChevronUp className="w-5 h-5" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-1.5 text-zinc-400 hover:text-white rounded-full"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
