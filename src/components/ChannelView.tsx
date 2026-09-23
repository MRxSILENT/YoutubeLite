import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, Bell, Film } from 'lucide-react';
import { Video } from '../types/youtube';
import { StorageService } from '../services/storage';
import { VideoCard } from './VideoCard';
import { INITIAL_VIDEOS } from '../services/mockData';

interface Props {
  channelName: string;
  onBack: () => void;
  onSelectVideo: (video: Video) => void;
}

export const ChannelView: React.FC<Props> = ({ channelName, onBack, onSelectVideo }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    setIsSubscribed(StorageService.isSubscribed(channelName));
  }, [channelName]);

  const handleToggleSub = () => {
    const next = StorageService.toggleSubscription({
      name: channelName,
    });
    setIsSubscribed(next);
  };

  const channelVideos = INITIAL_VIDEOS.filter(
    (v) => v.channelTitle.toLowerCase() === channelName.toLowerCase()
  );

  const fallbackVideos = channelVideos.length > 0 ? channelVideos : INITIAL_VIDEOS.slice(0, 4);

  return (
    <div className="select-none pb-20">
      {/* Channel Header Navigation */}
      <div className="sticky top-0 z-20 flex items-center gap-3 px-3 py-2.5 bg-[#0f0f0f] border-b border-zinc-800">
        <button onClick={onBack} className="p-1.5 text-zinc-300 hover:text-white rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-sm text-white truncate">{channelName}</span>
      </div>

      {/* Channel Banner */}
      <div className="h-24 sm:h-32 bg-gradient-to-r from-red-900 via-zinc-800 to-black w-full" />

      {/* Channel Profile Info */}
      <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(channelName)}&background=FF0000&color=fff&size=128`}
            alt={channelName}
            className="w-14 h-14 rounded-full object-cover border-2 border-zinc-800 -mt-7 bg-zinc-900 shadow-md"
          />
          <div>
            <h2 className="text-base font-bold text-white leading-tight">{channelName}</h2>
            <div className="text-xs text-zinc-400">1.5M subscribers • {fallbackVideos.length} videos</div>
          </div>
        </div>

        <button
          onClick={handleToggleSub}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition active:scale-95 ${
            isSubscribed
              ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
              : 'bg-white text-black'
          }`}
        >
          {isSubscribed ? 'Subscribed' : 'Subscribe'}
        </button>
      </div>

      {/* Videos List */}
      <div className="p-3">
        <div className="text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
          <Film className="w-3.5 h-3.5 text-red-500" />
          <span>Uploads</span>
        </div>

        <div className="divide-y divide-zinc-900">
          {fallbackVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onSelect={onSelectVideo}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
