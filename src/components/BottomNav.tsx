import React from 'react';
import { Home, Compass, PlaySquare, Download, Folder } from 'lucide-react';

export type NavTab = 'home' | 'explore' | 'subscriptions' | 'downloads' | 'library';

interface Props {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  downloadCount?: number;
}

export const BottomNav: React.FC<Props> = ({ activeTab, onChangeTab, downloadCount = 0 }) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'explore' as NavTab, label: 'Explore', icon: Compass },
    { id: 'subscriptions' as NavTab, label: 'Subscriptions', icon: PlaySquare },
    { id: 'downloads' as NavTab, label: 'Offline', icon: Download, badge: downloadCount },
    { id: 'library' as NavTab, label: 'Library', icon: Folder },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#0f0f0f] border-t border-zinc-800/80 px-2 py-1 select-none flex items-center justify-around">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg active:scale-95 transition-all ${
              isActive ? 'text-red-500 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              {Boolean(tab.badge && tab.badge > 0) && (
                <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[8px] font-bold flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
