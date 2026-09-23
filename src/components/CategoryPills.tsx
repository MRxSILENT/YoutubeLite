import React from 'react';
import { Compass, Flame } from 'lucide-react';

interface Props {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenExplore?: () => void;
}

export const CategoryPills: React.FC<Props> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  onOpenExplore,
}) => {
  return (
    <div className="sticky top-[49px] z-20 bg-[#0f0f0f]/95 backdrop-blur-sm border-b border-zinc-800/60 py-2 px-3 overflow-x-auto no-scrollbar select-none">
      <div className="flex items-center gap-2 min-w-max">
        {onOpenExplore && (
          <button
            onClick={onOpenExplore}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800/90 text-zinc-300 text-xs font-semibold hover:bg-zinc-700 active:scale-95 transition border border-zinc-700/50"
          >
            <Compass className="w-3.5 h-3.5 text-red-500" />
            <span>Explore</span>
          </button>
        )}

        {categories.map((cat) => {
          const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition active:scale-95 whitespace-nowrap ${
                isSelected
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700/40'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};
