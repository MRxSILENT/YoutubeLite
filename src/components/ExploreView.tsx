import React from 'react';
import { Flame, Music, Gamepad2, Film, Newspaper, GraduationCap, Sparkles } from 'lucide-react';
import { Video } from '../types/youtube';
import { VideoCard } from './VideoCard';
import { INITIAL_VIDEOS } from '../services/mockData';

interface Props {
  onSelectVideo: (video: Video) => void;
  onSelectCategory: (category: string) => void;
}

export const ExploreView: React.FC<Props> = ({ onSelectVideo, onSelectCategory }) => {
  const topics = [
    { title: 'Trending', icon: Flame, color: 'from-orange-500 to-red-600', cat: 'All' },
    { title: 'Music', icon: Music, color: 'from-pink-500 to-rose-600', cat: 'Music' },
    { title: 'Gaming', icon: Gamepad2, color: 'from-indigo-500 to-purple-600', cat: 'Gaming' },
    { title: 'Tech', icon: Sparkles, color: 'from-cyan-500 to-blue-600', cat: 'Tech' },
    { title: 'Learning', icon: GraduationCap, color: 'from-emerald-500 to-teal-600', cat: 'Learning' },
    { title: 'History', icon: Newspaper, color: 'from-amber-500 to-orange-600', cat: 'History' },
  ];

  return (
    <div className="p-3.5 space-y-4 select-none pb-24">
      {/* Category Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {topics.map((t) => {
          const Icon = t.icon;
          return (
            <div
              key={t.title}
              onClick={() => onSelectCategory(t.cat)}
              className={`p-3 rounded-2xl bg-gradient-to-br ${t.color} text-white shadow-md cursor-pointer active:scale-95 transition flex items-center justify-between`}
            >
              <span className="font-bold text-xs sm:text-sm">{t.title}</span>
              <Icon className="w-5 h-5 opacity-90" />
            </div>
          );
        })}
      </div>

      {/* Trending Videos Feed */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 px-1">
          <Flame className="w-4 h-4 text-red-500" />
          <span>Trending on YouTube</span>
        </div>

        <div className="divide-y divide-zinc-900">
          {INITIAL_VIDEOS.map((video) => (
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
