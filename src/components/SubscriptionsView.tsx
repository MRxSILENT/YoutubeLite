import React, { useState, useEffect } from 'react';
import { Video, Channel } from '../types/youtube';
import { StorageService } from '../services/storage';
import { VideoCard } from './VideoCard';
import { Users, Bell, BellOff } from 'lucide-react';
import { INITIAL_VIDEOS } from '../services/mockData';

interface Props {
  onSelectVideo: (video: Video) => void;
  onSelectChannel: (channelName: string) => void;
}

export const SubscriptionsView: React.FC<Props> = ({ onSelectVideo, onSelectChannel }) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  useEffect(() => {
    setChannels(StorageService.getSubscriptions());
  }, []);

  const handleToggleSub = (channel: Channel, e: React.MouseEvent) => {
    e.stopPropagation();
    StorageService.toggleSubscription(channel);
    setChannels(StorageService.getSubscriptions());
  };

  const filteredVideos = selectedChannel
    ? INITIAL_VIDEOS.filter((v) => v.channelTitle.toLowerCase() === selectedChannel.toLowerCase())
    : INITIAL_VIDEOS;

  return (
    <div className="select-none pb-20">
      {/* Horizontal Avatar Bar */}
      <div className="p-3 border-b border-zinc-800 bg-[#0f0f0f] overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-3.5 min-w-max">
          <button
            onClick={() => setSelectedChannel(null)}
            className="flex flex-col items-center gap-1 text-center"
          >
            <div
              className={`w-13 h-13 rounded-full flex items-center justify-center text-xs font-bold border-2 transition ${
                selectedChannel === null
                  ? 'border-red-500 bg-red-600/20 text-white'
                  : 'border-zinc-700 bg-zinc-800 text-zinc-400'
              }`}
            >
              ALL
            </div>
            <span className="text-[10px] text-zinc-300 font-medium">All Subs</span>
          </button>

          {channels.map((chan) => {
            const isSelected = selectedChannel === chan.name;
            return (
              <button
                key={chan.id}
                onClick={() => setSelectedChannel(isSelected ? null : chan.name)}
                className="flex flex-col items-center gap-1 text-center group"
              >
                <div className="relative">
                  <img
                    src={chan.avatar}
                    alt={chan.name}
                    className={`w-13 h-13 rounded-full object-cover border-2 transition ${
                      isSelected ? 'border-red-500 scale-105' : 'border-zinc-700'
                    }`}
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-red-600 border border-black" />
                </div>
                <span className="text-[10px] text-zinc-300 truncate max-w-[65px] font-medium">
                  {chan.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Videos List */}
      <div className="divide-y divide-zinc-900">
        <div className="px-4 py-2.5 bg-zinc-950/60 text-xs text-zinc-400 font-semibold flex items-center justify-between">
          <span>{selectedChannel ? `Latest from ${selectedChannel}` : 'Recent Uploads from Subscriptions'}</span>
          <span className="text-[10px] text-zinc-500">{filteredVideos.length} videos</span>
        </div>

        {filteredVideos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onSelect={onSelectVideo}
            onChannelClick={onSelectChannel}
          />
        ))}
      </div>
    </div>
  );
};
