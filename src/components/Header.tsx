import React from 'react';
import { Search, Settings, DownloadCloud, Sparkles, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { AppSettings } from '../types/youtube';

interface Props {
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  settings: AppSettings;
  activeView: string;
  onBack?: () => void;
  hasActiveVideo?: boolean;
}

export const Header: React.FC<Props> = ({
  onOpenSearch,
  onOpenSettings,
  settings,
  activeView,
  onBack,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-3.5 py-2.5 bg-[#0f0f0f] border-b border-zinc-800/80 select-none">
      {/* Left brand or back */}
      <div className="flex items-center gap-2.5">
        {onBack && activeView !== 'home' ? (
          <button
            onClick={onBack}
            className="p-1.5 -ml-1 text-zinc-300 hover:text-white rounded-full active:bg-zinc-800"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : null}

        <div className="flex items-center gap-1.5 cursor-pointer">
          {/* Classic YouTube Icon */}
          <div className="relative flex items-center justify-center w-7 h-5 bg-[#FF0000] rounded-md shadow-sm">
            <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[7px] border-l-white ml-0.5" />
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-base font-black tracking-tighter text-white">
              YouTube
            </span>
            <span className="text-[10px] font-extrabold uppercase px-1 py-0.2 bg-red-600/90 text-white rounded tracking-wide">
              Lite
            </span>
          </div>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1.5">
        {/* Data Saver Mode badge */}
        <button
          onClick={onOpenSettings}
          title="Data Saver & Performance Settings"
          className="flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-800/90 text-zinc-300 hover:text-white text-[11px] font-medium border border-zinc-700/60 active:scale-95 transition"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{settings.defaultQuality}</span>
          {settings.lowRamMode && <span className="text-[9px] text-zinc-400 uppercase">Lite</span>}
        </button>

        {/* Search button */}
        <button
          onClick={onOpenSearch}
          className="p-2 text-zinc-200 hover:text-white hover:bg-zinc-800 rounded-full transition active:scale-95"
          aria-label="Search"
          title="Search YouTube"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 text-zinc-200 hover:text-white hover:bg-zinc-800 rounded-full transition active:scale-95"
          aria-label="Settings"
          title="Lite Settings & Cache"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
