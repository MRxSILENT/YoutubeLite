import React, { useState, useEffect } from 'react';
import { Download, Trash2, Play, HardDrive, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { DownloadedVideo, Video } from '../types/youtube';
import { StorageService } from '../services/storage';

interface Props {
  onPlayVideo: (video: Video) => void;
}

export const DownloadsView: React.FC<Props> = ({ onPlayVideo }) => {
  const [downloads, setDownloads] = useState<DownloadedVideo[]>([]);

  useEffect(() => {
    setDownloads(StorageService.getDownloads());
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    StorageService.deleteDownload(id);
    setDownloads(StorageService.getDownloads());
  };

  const handleClearAll = () => {
    if (confirm('Delete all offline saved videos?')) {
      downloads.forEach((d) => StorageService.deleteDownload(d.id));
      setDownloads([]);
    }
  };

  const totalBytes = downloads.reduce((acc, d) => acc + (d.sizeBytes || 0), 0);
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(1);

  return (
    <div className="p-3.5 space-y-4 select-none pb-20">
      {/* Header Info Banner */}
      <div className="bg-gradient-to-br from-zinc-900 to-black p-4 rounded-2xl border border-zinc-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Offline Downloads</h2>
              <p className="text-[11px] text-zinc-400">Playable anytime with zero internet or data usage</p>
            </div>
          </div>

          {downloads.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-[11px] text-red-400 hover:text-red-300 font-semibold"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Storage Meter */}
        <div className="mt-3 pt-3 border-t border-zinc-800/80">
          <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-zinc-400" />
              Phone Storage Used
            </span>
            <span className="font-mono text-white font-bold">{totalMB} MB</span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(8, downloads.length * 15))}%` }}
            />
          </div>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-400">
            <ShieldCheck className="w-3 h-3" />
            <span>Ready for offline playback on 2G/Airplane mode</span>
          </div>
        </div>
      </div>

      {/* Downloads List */}
      {downloads.length > 0 ? (
        <div className="space-y-2.5">
          <div className="text-xs font-bold text-zinc-400 px-1 uppercase tracking-wider">
            Saved Videos ({downloads.length})
          </div>

          {downloads.map((video) => (
            <div
              key={video.id}
              onClick={() => onPlayVideo(video)}
              className="flex gap-3 p-2 rounded-xl bg-zinc-900 border border-zinc-800/80 hover:bg-zinc-850 cursor-pointer active:scale-[0.99] transition"
            >
              <div className="relative w-28 aspect-video rounded-lg overflow-hidden bg-black flex-shrink-0">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 right-1 px-1 rounded bg-black/80 text-[9px] font-bold text-white">
                  {video.duration}
                </span>
                <span className="absolute top-1 left-1 px-1 rounded bg-blue-600 text-[8px] font-bold text-white uppercase">
                  {video.quality}
                </span>
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                  <h4 className="text-xs font-semibold text-white line-clamp-2 leading-tight">
                    {video.title}
                  </h4>
                  <div className="text-[11px] text-zinc-400 mt-1 truncate">
                    {video.channelTitle}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-1 text-[10px] text-zinc-400">
                  <span className="font-mono text-emerald-400">
                    {((video.sizeBytes || 8.5 * 1024 * 1024) / (1024 * 1024)).toFixed(1)} MB
                  </span>
                  <button
                    onClick={(e) => handleDelete(video.id, e)}
                    className="p-1 text-zinc-500 hover:text-red-400 rounded transition"
                    title="Delete download"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 px-6 text-center text-zinc-500 space-y-3">
          <div className="w-14 h-14 mx-auto rounded-full bg-zinc-900 flex items-center justify-center text-zinc-600 border border-zinc-800">
            <Download className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-300">No Offline Videos Yet</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
              Tap the 3 dots or "Save Offline" on any video to store it directly on your device.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
